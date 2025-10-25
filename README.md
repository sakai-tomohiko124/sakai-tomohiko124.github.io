# 簡易チャット（mail2.html）とローカルメール中継サーバ

このリポジトリには `mail2.html`（フロント側、チャット風UI）と、ローカルで動かす簡易のメール中継サーバ `server.js` が含まれます。

重要: GitHub Pages のような静的ホスティングだけでは、匿名でメールを中継して送ることはできません。メール送信には SMTP 資格情報が必要です。以下はローカルで試すための手順です。

## 概要
- `mail2.html` : モダンなネオン/ガラス風デザインの簡易チャットUI。入力は100文字まで。
- `server.js` : Express + Nodemailer を使った POST `/api/send-email` エンドポイント。受信先は `.env` で指定できます。

## ローカルでの起動手順
1. Node.js (推奨 18+) がインストールされていることを確認
2. 依存関係をインストール

```bash
npm install
```

3. `.env` を作成して SMTP 情報を設定（`.env.example` を参考に）

4. サーバを起動

```bash
npm start
```

5. ブラウザで `http://localhost:3000/mail2.html` を開く

## セキュリティと注意点
- Gmail を SMTP に使う場合はアカウント側で「アプリパスワード」を作成する必要がある場合があります。
- Gmail を利用した場合、受信者のメールヘッダに送信経路の情報が付与される可能性があり、完全に「Gmailを使っている証跡を消す」ことは保証できません。社内用や本番利用では独自ドメインのSMTPを利用することを推奨します。
- リポジトリに認証情報を絶対にコミットしないでください。`.env` はGitに追加しないでください。

### Gmail（無料アカウント）での利用方法（推奨: アプリパスワード）

Gmail を SMTP 経由で使う場合、最も手軽で安全な方法は Google アカウントの「アプリ パスワード」を利用する方法です（アカウントに 2 段階認証が必要）。手順の概要は次の通りです。

1. Google アカウントで 2 段階認証（2-Step Verification）を有効にする。
2. 「アプリ パスワード」を作成し、生成される 16 文字のパスワードを控える。
3. プロジェクトのルートに `.env` を作成し、`.env.example` を参考に次の値を設定する:

  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=465` （または `587` を使う場合は `SMTP_SECURE=false`）
  - `SMTP_SECURE=true` （465 の場合）
  - `SMTP_USER=あなたの@gmail.com`
  - `SMTP_PASS=アプリパスワード`（生成した16文字）
  - `SENDER_ADDRESS=あなたの@gmail.com`
  - `RECIPIENT_EMAIL=管理者の受信メールアドレス`

4. `npm start` でサーバを起動し、`http://localhost:3000/mail2.html` から送信テストを行う。

注意: Google 側の方針変更やアカウント設定によっては、アプリパスワードの作成が行えない場合があります（例: 学校/企業の G Suite 管理者で制限されているケース）。その場合は OAuth2 のセットアップか、SendGrid / Mailgun 等の外部 SMTP サービスを検討してください。

## API
- POST `/api/send-email`
  - body: { name: string (任意), message: string (必須, 最大100文字) }
  - 戻り値: JSON { ok: true } など

### Gmail OAuth2 を使って自分の Gmail から送信する（アプリパスワードが使えない場合）

アプリパスワードを作成できない、またはアプリパスワードを使いたくない場合は OAuth2 を使って Gmail から送信できます。手順の流れは次の通りです。

1. Google Cloud Console でプロジェクトを作成し、Gmail API を有効にする。
2. 「認証情報」から OAuth クライアントID を作成する（アプリの種類は「デスクトップアプリ」推奨）。
3. `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` を控える。
4. 環境変数 `SMTP_USER` に送信に使う Gmail アドレスを設定する（例: your@gmail.com）。
5. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SMTP_USER` を環境変数にセットして、次のヘルパースクリプトを実行して `GOOGLE_REFRESH_TOKEN` を取得します：

```bash
# install deps
npm install

# then run (ensure env vars are set in the shell)
node scripts/get_gmail_refresh_token.js
```

6. 生成された `GOOGLE_REFRESH_TOKEN` を `.env` に保存（`.env.example` に項目あり）。
7. `.env` に `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `SMTP_USER` を保存して `npm start` で起動します。

server.js は自動的に OAuth2 情報がある場合は Gmail の OAuth2 経由で送信し、なければ従来の SMTP 設定（`SMTP_HOST`/`SMTP_PASS` 等）を使います。

注意点：OAuth 同意画面は「未確認アプリ」と表示される場合がありますが、自分だけで使う場合は認可を進めてトークンを取得できます。公開アプリとして配布する場合は Google の審査が必要です。

## テスト (curl)

```bash
curl -X POST http://localhost:3000/api/send-email \
  -H 'Content-Type: application/json' \
  -d '{"name":"匿名","message":"テスト送信です"}'
```

## 余談 / 次の改善案
- メール送信のスパム対策（reCAPTCHA、レート制限）
- 送信履歴の保存（DB）と管理画面
- Formspree / EmailJS のような外部サービスを使ってホスティング不要にする（要アカウント）
# pm2 で常時実行（自動化）
常時稼働させたい場合は pm2 を使うと便利です。以下は簡単な手順です。

1. pm2 をプロジェクトに追加（またはグローバルにインストール）

```bash
# ローカル依存として追加（推奨: チームで同一バージョンを使う場合）
npm install pm2 --save

# またはグローバルにインストールして使う
npm install -g pm2
```

2. リポジトリには `ecosystem.config.js` が含まれています。pm2 で起動して永続化します。

```bash
# プロジェクトルートで
npx pm2 start ecosystem.config.js --env production
npx pm2 save

# pm2 をグローバルに入れている場合は `npx` を省略できます
pm2 start ecosystem.config.js --env production
pm2 save
```

3. 起動後の状態確認・ログ

```bash
pm2 list        # 起動中アプリ一覧
pm2 logs mail-relay  # ログを確認
pm2 stop mail-relay  # 停止
pm2 restart mail-relay # 再起動
```

4. サーバ再起動後も pm2 を自動復旧させる

```bash
pm2 startup
# 表示されるコマンドをコピーして実行すると起動時に pm2 が自動起動します
pm2 save
```

注意: pm2 を使う場合も `.env` にSMTP情報を置き、`.env` をプロダクション環境に適切に配置してください（roadmap: systemd やクラウドの環境変数設定を使うとより安全）。

# sakai-tomohiko124.github.io
ここでは、プログラミング言語の用語検索ツールやクイズ機能を導入しています。人気が出れば、新たな機能を追加する予定です。
