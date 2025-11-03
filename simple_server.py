#!/usr/bin/env python3
"""
簡単なHTTPサーバー
ルートアクセス時に自動的にindex.htmlにリダイレクト
"""
import http.server
import socketserver
from urllib.parse import urlparse

PORT = 8000

class RedirectHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # ルートアクセス時にindex.htmlにリダイレクト
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/':
            self.send_response(302)
            self.send_header('Location', '/index.html')
            self.end_headers()
            return
        
        # その他のリクエストは通常通り処理
        return http.server.SimpleHTTPRequestHandler.do_GET(self)
    
    def log_message(self, format, *args):
        # ログメッセージをカスタマイズ（オプション）
        print(f"{self.address_string()} - {format % args}")

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), RedirectHandler) as httpd:
        print(f"🚀 サーバー起動: http://localhost:{PORT}/")
        print(f"ルートアクセス時に自動的に index.html にリダイレクトします")
        print("Ctrl+C で終了")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 サーバーを停止しました")
