# 必要なライブラリをインポート
from flask import Flask, request, jsonify, redirect, send_from_directory
import os
from dotenv import load_dotenv
from flask_cors import CORS
import google.generativeai as genai

# .envファイルから環境変数を読み込む
load_dotenv()

# Flaskアプリケーションの準備
app = Flask(__name__)
CORS(app)

# グローバル変数でチャットを保存（本番ではデータベースを使う）
server_chats = {}

# アプリ起動時に一度だけAPIキーを設定する
api_key = os.getenv('GOOGLE_API_KEY')
if not api_key:
    print("エラー: GOOGLE_API_KEYが設定されていません。")
else:
    genai.configure(api_key=api_key)

# ルートアクセス時にindex.htmlにリダイレクト
@app.route('/')
def index():
    return redirect('/index.html')

# 静的ファイルを配信
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/gemini', methods=['POST'])
def generate_with_gemini():
    data = request.json
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'プロンプトがありません'}), 400

    print(f"受信したプロンプト: {prompt}")
    try:
        model = genai.GenerativeModel('gemini-pro')
        print("モデルを作成しました")
        response = model.generate_content(prompt)
        print("応答を生成しました")
        answer = response.text
        print(f"生成された回答: {answer}")
        return jsonify({'answer': answer})
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/notify_admin', methods=['POST'])
def notify_admin():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if username and password:
        print(f"新規登録: ユーザー名={username}, パスワード={password}")
    return jsonify({'status': 'ok'}), 200

@app.route('/api/chats/<username>', methods=['GET', 'POST'])
def handle_chats(username):
    if request.method == 'GET':
        chats = server_chats.get(username, [])
        return jsonify({'chats': chats})
    elif request.method == 'POST':
        data = request.json
        chats = data.get('chats', [])
        server_chats[username] = chats
        return jsonify({'status': 'saved'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)