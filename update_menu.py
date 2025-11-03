import reimport re



# 新しいメニューテンプレート# 新しいメニューテンプレート

new_menu = '''    <aside id="table-of-contents">new_menu = '''    <aside id="table-of-contents">

        <h2>全リンク集</h2>        <h2>全リンク集</h2>

        <ul>        <ul>

            <li><a href="home.html">🏠 ホーム</a></li>            <li><a href="home.html">🏠 ホーム</a></li>

            <li><a href="index2.html">🧠 プログラミングクイズ</a></li>            <li><a href="index2.html">🧠 プログラミングクイズ</a></li>

            <li><a href="index5.html">📖 マニュアル</a></li>            <li><a href="index5.html">📖 マニュアル</a></li>

            <li><a href="アンケート.html">📊 アンケート画面へ</a></li>            <li><a href="アンケート.html">📊 アンケート画面へ</a></li>

            <li><a href="logout.html">🔒 ログアウト</a></li>            <li><a href="logout.html">🔒 ログアウト</a></li>

            <li><a href="link.html">📑 全リンク集</a></li>            <li><a href="link.html">📑 全リンク集</a></li>

            <li><a href="hate.html">🎯 苦手克服</a></li>            <li><a href="hate.html">🎯 苦手克服</a></li>

            <li><a href="hate/base.html">📚 プログラミング言語用語集</a></li>            <li><a href="hate/base.html">📚 プログラミング言語用語集</a></li>

            <li><a href="https://docs.python.org/ja/3/" target="_blank">🐍 Python公式ドキュメント</a></li>            <li><a href="https://docs.python.org/ja/3/" target="_blank">🐍 Python公式ドキュメント</a></li>

            <li><a href="https://www.w3schools.com/sql/" target="_blank">🗄️ SQLチュートリアル</a></li>            <li><a href="https://www.w3schools.com/sql/" target="_blank">🗄️ SQLチュートリアル</a></li>

            <li><a href="pythonexam.html">📝 Python試験情報</a></li>            <li><a href="pythonexam.html">📝 Python試験情報</a></li>

            <li><a href="感想.html">✍️ Python認定基礎試験の感想</a></li>            <li><a href="感想.html">✍️ Python認定基礎試験の感想</a></li>

            <li><a href="https://www.rakuten.co.jp/kbsanhe/" target="_blank">🛒 楽天サイト</a></li>            <li><a href="https://www.rakuten.co.jp/kbsanhe/" target="_blank">🛒 楽天サイト</a></li>

            <li><a href="weather.html">🌤️ 天気情報</a></li>            <li><a href="weather.html">🌤️ 天気情報</a></li>

            <li><a href="train.html">🚃 電車情報</a></li>            <li><a href="train.html">🚃 電車情報</a></li>

            <li><a href="other.html">🔗 その他</a></li>            <li><a href="other.html">🔗 その他</a></li>

            <li><a href="index3.html">💬 チャット</a></li>            <li><a href="index3.html">💬 チャット</a></li>

            <li><a href="index4.html">🔗 便利リンク</a></li>            <li><a href="index4.html">🔗 便利リンク</a></li>

            <li><a href="story.html">📖 物語</a></li>            <li><a href="story.html">📖 物語</a></li>

        </ul>        </ul>

    </aside>'''    </aside>'''



# hate/base.html用（相対パス調整）# hate/base.html用（相対パス調整）

new_menu_hate = '''	<aside id="table-of-contents">new_menu_hate = '''<aside id="table-of-contents">

		<h2>全リンク集</h2>href="../home.html">🏠 ホーム</a></li>

		<ul>href="../index2.html">�� プログラミングクイズ</a></li>

			<li><a href="../home.html">🏠 ホーム</a></li>href="../index5.html">📖 マニュアル</a></li>

			<li><a href="../index2.html">🧠 プログラミングクイズ</a></li>href="../アンケート.html">📊 アンケート画面へ</a></li>

			<li><a href="../index5.html">📖 マニュアル</a></li>href="../logout.html">🔒 ログアウト</a></li>

			<li><a href="../アンケート.html">📊 アンケート画面へ</a></li>href="../link.html">📑 全リンク集</a></li>

			<li><a href="../logout.html">🔒 ログアウト</a></li>href="../hate.html">🎯 苦手克服</a></li>

			<li><a href="../link.html">📑 全リンク集</a></li>href="base.html">📚 プログラミング言語用語集</a></li>

			<li><a href="../hate.html">🎯 苦手克服</a></li>href="https://docs.python.org/ja/3/" target="_blank">🐍 Python公式ドキュメント</a></li>

			<li><a href="base.html">📚 プログラミング言語用語集</a></li>href="https://www.w3schools.com/sql/" target="_blank">🗄️ SQLチュートリアル</a></li>

			<li><a href="https://docs.python.org/ja/3/" target="_blank">🐍 Python公式ドキュメント</a></li>href="../pythonexam.html">📝 Python試験情報</a></li>

			<li><a href="https://www.w3schools.com/sql/" target="_blank">🗄️ SQLチュートリアル</a></li>href="../感想.html">✍️ Python認定基礎試験の感想</a></li>

			<li><a href="../pythonexam.html">📝 Python試験情報</a></li>href="https://www.rakuten.co.jp/kbsanhe/" target="_blank">🛒 楽天サイト</a></li>

			<li><a href="../感想.html">✍️ Python認定基礎試験の感想</a></li>href="../weather.html">🌤️ 天気情報</a></li>

			<li><a href="https://www.rakuten.co.jp/kbsanhe/" target="_blank">🛒 楽天サイト</a></li>href="../train.html">🚃 電車情報</a></li>

			<li><a href="../weather.html">🌤️ 天気情報</a></li>href="../other.html">🔗 その他</a></li>

			<li><a href="../train.html">🚃 電車情報</a></li>href="../index3.html">💬 チャット</a></li>

			<li><a href="../other.html">🔗 その他</a></li>href="../index4.html">🔗 便利リンク</a></li>

			<li><a href="../index3.html">💬 チャット</a></li>href="../story.html">📖 物語</a></li>

			<li><a href="../index4.html">🔗 便利リンク</a></li>更新対象ファイル

			<li><a href="../story.html">📖 物語</a></li>files = [

		</ul>    'home.html', 'link.html', 'アンケート.html', 'movie.html', 

	</aside>'''    'pythonexam.html', 'index5.html', 'story.html', 'login.html',

    'train.html', 'hate.html', 'index3.html', 'クイズ.html',

# 更新対象ファイル    'weather.html', 'other.html', 'index4.html', '感想.html', 'index2.html'

files = []

    'home.html', 'link.html', 'アンケート.html', 'movie.html', 

    'pythonexam.html', 'index5.html', 'story.html', 'login.html',# 正規表現パターン（asideタグ全体をマッチ）

    'train.html', 'hate.html', 'index3.html', 'クイズ.html',pattern = re.compile(r'<aside id="table-of-contents">.*?</aside>', re.DOTALL)

    'weather.html', 'other.html', 'index4.html', '感想.html', 'index2.html'

]for file in files:

    try:

# 正規表現パターン（asideタグ全体をマッチ）        with open(file, 'r', encoding='utf-8') as f:

pattern = re.compile(r'<aside id="table-of-contents">.*?</aside>', re.DOTALL)            content = f.read()

        

for file in files:        # メニュー部分を置換

    try:        new_content = pattern.sub(new_menu, content)

        with open(file, 'r', encoding='utf-8') as f:        

            content = f.read()        with open(file, 'w', encoding='utf-8') as f:

                    f.write(new_content)

        # メニュー部分を置換        

        new_content = pattern.sub(new_menu, content)        print(f'✓ {file} を更新しました')

            except Exception as e:

        with open(file, 'w', encoding='utf-8') as f:        print(f'✗ {file} の更新に失敗: {e}')

            f.write(new_content)

        # hate/base.html を個別に更新

        print(f'✓ {file} を更新しました')try:

    except Exception as e:    with open('hate/base.html', 'r', encoding='utf-8') as f:

        print(f'✗ {file} の更新に失敗: {e}')        content = f.read()

    

# hate/base.html を個別に更新    new_content = pattern.sub(new_menu_hate, content)

try:    

    with open('hate/base.html', 'r', encoding='utf-8') as f:    with open('hate/base.html', 'w', encoding='utf-8') as f:

        content = f.read()        f.write(new_content)

        

    new_content = pattern.sub(new_menu_hate, content)    print('✓ hate/base.html を更新しました')

    except Exception as e:

    with open('hate/base.html', 'w', encoding='utf-8') as f:    print(f'✗ hate/base.html の更新に失敗: {e}')

        f.write(new_content)

    print('\nすべてのファイルの更新が完了しました！')

    print('✓ hate/base.html を更新しました')
except Exception as e:
    print(f'✗ hate/base.html の更新に失敗: {e}')

print('\nすべてのファイルの更新が完了しました！')
