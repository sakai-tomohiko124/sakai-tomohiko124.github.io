#!/bin/bash

# 更新するメニューのHTML(絵文字を含む)
NEW_MENU='    <aside id="table-of-contents">
        <h2>全リンク集</h2>
        <ul>
            <li><a href="home.html">🏠 ホーム</a></li>
            <li><a href="index2.html">🧠 プログラミングクイズ</a></li>
            <li><a href="index5.html">📖 マニュアル</a></li>
            <li><a href="アンケート.html">📊 アンケート画面へ</a></li>
            <li><a href="logout.html">🔒 ログアウト</a></li>
            <li><a href="link.html">📑 全リンク集</a></li>
            <li><a href="hate.html">🎯 苦手克服</a></li>
            <li><a href="hate/base.html">📚 プログラミング言語用語集</a></li>
            <li><a href="https://docs.python.org/ja/3/" target="_blank">🐍 Python公式ドキュメント</a></li>
            <li><a href="https://www.w3schools.com/sql/" target="_blank">🗄️ SQLチュートリアル</a></li>
            <li><a href="pythonexam.html">📝 Python試験情報</a></li>
            <li><a href="感想.html">✍️ Python認定基礎試験の感想</a></li>
            <li><a href="https://www.rakuten.co.jp/kbsanhe/" target="_blank">🛒 楽天サイト</a></li>
            <li><a href="weather.html">🌤️ 天気情報</a></li>
            <li><a href="train.html">🚃 電車情報</a></li>
            <li><a href="other.html">🔗 その他</a></li>
            <li><a href="index3.html">💬 チャット</a></li>
            <li><a href="index4.html">🔗 便利リンク</a></li>
            <li><a href="story.html">📖 物語</a></li>
        </ul>
    </aside>'

# hate/base.html用のメニュー（相対パスで../を含む）
NEW_MENU_HATE='    <aside id="table-of-contents">
        <h2>全リンク集</h2>
        <ul>
            <li><a href="../home.html">🏠 ホーム</a></li>
            <li><a href="../index2.html">🧠 プログラミングクイズ</a></li>
            <li><a href="../index5.html">📖 マニュアル</a></li>
            <li><a href="../アンケート.html">📊 アンケート画面へ</a></li>
            <li><a href="../logout.html">🔒 ログアウト</a></li>
            <li><a href="../link.html">📑 全リンク集</a></li>
            <li><a href="../hate.html">🎯 苦手克服</a></li>
            <li><a href="base.html">📚 プログラミング言語用語集</a></li>
            <li><a href="https://docs.python.org/ja/3/" target="_blank">🐍 Python公式ドキュメント</a></li>
            <li><a href="https://www.w3schools.com/sql/" target="_blank">🗄️ SQLチュートリアル</a></li>
            <li><a href="../pythonexam.html">📝 Python試験情報</a></li>
            <li><a href="../感想.html">✍️ Python認定基礎試験の感想</a></li>
            <li><a href="https://www.rakuten.co.jp/kbsanhe/" target="_blank">🛒 楽天サイト</a></li>
            <li><a href="../weather.html">🌤️ 天気情報</a></li>
            <li><a href="../train.html">🚃 電車情報</a></li>
            <li><a href="../other.html">🔗 その他</a></li>
            <li><a href="../index3.html">💬 チャット</a></li>
            <li><a href="../index4.html">🔗 便利リンク</a></li>
            <li><a href="../story.html">📖 物語</a></li>
        </ul>
    </aside>'

# 更新対象のファイルリスト（すでに更新済みのhome.html, アンケート.html, index3.htmlは除外）
FILES=(
    "link.html"
    "movie.html"
    "pythonexam.html"
    "index5.html"
    "story.html"
    "login.html"
    "train.html"
    "hate.html"
    "クイズ.html"
    "weather.html"
    "other.html"
    "index4.html"
    "感想.html"
    "index2.html"
)

# 各ファイルのメニューを更新
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        # Pythonを使って正確にメニューブロックを置換
        python3 << EOF
import re

with open('$file', 'r', encoding='utf-8') as f:
    content = f.read()

# aside id="table-of-contents"からその終了タグまでを検索して置換
pattern = r'<aside id="table-of-contents">.*?</aside>'
replacement = '''$NEW_MENU'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('$file', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print('Updated $file')
EOF
    else
        echo "File not found: $file"
    fi
done

# hate/base.htmlを更新（相対パス版）
if [ -f "hate/base.html" ]; then
    echo "Updating hate/base.html..."
    python3 << 'EOF'
import re

with open('hate/base.html', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<aside id="table-of-contents">.*?</aside>'
replacement = '''    <aside id="table-of-contents">
        <h2>全リンク集</h2>
        <ul>
            <li><a href="../home.html">🏠 ホーム</a></li>
            <li><a href="../index2.html">🧠 プログラミングクイズ</a></li>
            <li><a href="../index5.html">📖 マニュアル</a></li>
            <li><a href="../アンケート.html">📊 アンケート画面へ</a></li>
            <li><a href="../logout.html">🔒 ログアウト</a></li>
            <li><a href="../link.html">📑 全リンク集</a></li>
            <li><a href="../hate.html">🎯 苦手克服</a></li>
            <li><a href="base.html">📚 プログラミング言語用語集</a></li>
            <li><a href="https://docs.python.org/ja/3/" target="_blank">🐍 Python公式ドキュメント</a></li>
            <li><a href="https://www.w3schools.com/sql/" target="_blank">🗄️ SQLチュートリアル</a></li>
            <li><a href="../pythonexam.html">📝 Python試験情報</a></li>
            <li><a href="../感想.html">✍️ Python認定基礎試験の感想</a></li>
            <li><a href="https://www.rakuten.co.jp/kbsanhe/" target="_blank">🛒 楽天サイト</a></li>
            <li><a href="../weather.html">🌤️ 天気情報</a></li>
            <li><a href="../train.html">🚃 電車情報</a></li>
            <li><a href="../other.html">🔗 その他</a></li>
            <li><a href="../index3.html">💬 チャット</a></li>
            <li><a href="../index4.html">🔗 便利リンク</a></li>
            <li><a href="../story.html">📖 物語</a></li>
        </ul>
    </aside>'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('hate/base.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print('Updated hate/base.html')
EOF
fi

echo "All files updated successfully!"
