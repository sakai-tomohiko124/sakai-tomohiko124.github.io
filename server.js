// Simple email relay using Express + Nodemailer
// Usage: set SMTP_* env vars and RECIPIENT_EMAIL. See .env.example.
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (the front-end is a static page in the same repo)
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Simple CORS middleware to allow requests from a different origin (e.g., python http.server on :8000)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ALLOW_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Create transporter from env
function createTransporter(){
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const secure = (process.env.SMTP_SECURE === 'true');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // OAuth2 (Gmail) support: if GOOGLE_CLIENT_ID / SECRET / REFRESH_TOKEN are present,
  // prefer OAuth2 transport for sending from a Gmail account.
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if(googleClientId && googleClientSecret && googleRefreshToken && user){
    // Use nodemailer's OAuth2 flow for Gmail. This avoids storing an App Password.
    try{
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user,
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          refreshToken: googleRefreshToken
        }
      });
    }catch(err){
      console.error('Failed to create OAuth2 transporter', err);
      // fallthrough to SMTP auth if configured
    }
  }

  if(!host || !port || !user || !pass){
    return null; // not configured
  }

  return nodemailer.createTransport({
    host, port, secure,
    auth: { user, pass }
  });
}

app.post('/api/send-email', async (req, res) => {
  const { name, message } = req.body || {};
  if(!message || typeof message !== 'string') return res.status(400).json({ error: 'message is required' });
  if(message.length > 100) return res.status(400).json({ error: 'message must be 100 characters or less' });
  let transporter = createTransporter();
  let usedTestAccount = false;
  let testPreviewUrl = null;

  // If SMTP not configured, in non-production use Ethereal test account so dev can test sending
  if(!transporter){
    if(process.env.NODE_ENV === 'production'){
      return res.status(500).json({ error: 'SMTP is not configured. See .env.example' });
    }
    try{
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      usedTestAccount = true;
    }catch(err){
      console.error('createTestAccount error', err);
      return res.status(500).json({ error: 'テスト用SMTPアカウントの作成に失敗しました' });
    }
  }

  const recipient = process.env.RECIPIENT_EMAIL || 'skytomohiko17@gmail.com';
  const senderAddress = process.env.SENDER_ADDRESS || 'no-reply@example.local';
  const contactEmail = req.body.contactEmail && String(req.body.contactEmail).trim();
  const allowReply = !!req.body.allowReply;

  // Compose email. From uses the verified senderAddress so recipient won't see user's raw From address.
  const displayName = name || '匿名';
  const subject = `簡易チャットからのメッセージ (${displayName})`;
  let text = `表示名: ${displayName}\n`;
  if(contactEmail) text += `送信者メール: ${contactEmail}\n`;
  text += `\nメッセージ:\n${message}\n\n(このメールはサイトの簡易チャット機能から送信されました)`;

  try{
    const mailOptions = {
      from: `"${displayName}" <${senderAddress}>`,
      to: recipient,
      subject,
      text
    };

    // If the sender allowed replies and provided an email, set Reply-To so admin can reply directly to sender
    if(allowReply && contactEmail){
      mailOptions.replyTo = contactEmail;
    }

    const info = await transporter.sendMail(mailOptions);
    if(usedTestAccount){
      testPreviewUrl = nodemailer.getTestMessageUrl(info) || null;
      return res.json({ ok: true, info: { messageId: info.messageId }, previewUrl: testPreviewUrl });
    }
    return res.json({ ok: true, info });
  }catch(err){
    console.error('sendMail error', err && err.stack || err);
    return res.status(500).json({ error: 'メール送信に失敗しました: ' + (err && err.message ? err.message : String(err)) });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
