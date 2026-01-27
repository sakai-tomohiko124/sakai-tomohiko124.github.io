# RPG風謎解きゲーム - Mystery Dungeon

![RPG Game](https://img.shields.io/badge/Game-RPG%20Mystery-blue)
![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Python](https://img.shields.io/badge/Python-3.x-green)

## 概要

「Mystery Dungeon」は、HTML、CSS、JavaScript、Pythonで作成されたRPG風の謎解きゲームです。ダンジョンを探索しながら謎を解き、脱出を目指します。

## ゲームの特徴

- 🎮 **インタラクティブなダンジョン探索** - 4方向の移動システム
- 🗺️ **複数の部屋** - 各部屋に独自の説明とビジュアル
- 🎒 **アイテム収集** - アイテムを見つけて使用
- 🧩 **謎解きシステム** - ヒント機能付きの謎
- 📊 **進行状況トラッキング** - HP、進行度、統計表示
- 💾 **セーブ/ロード機能** - ゲーム状態の保存と復元
- 🏆 **クリア画面** - 完了統計の表示
- 📱 **レスポンシブデザイン** - モバイル対応

## プレイ方法

### 方法1: 直接HTMLファイルを開く

1. `rpg_game.html`をブラウザで開く
2. 「ゲームスタート」をクリック
3. ゲームを楽しむ

### 方法2: Pythonサーバーを使用（推奨）

```bash
# Pythonサーバーを起動
python3 rpg_server.py

# ブラウザで開く
# http://localhost:5000
```

## ゲーム操作

### 基本操作

- **移動**: 方向ボタン（↑北、↓南、←西、→東）をクリック
- **調べる**: 「🔍 調べる」ボタンをクリックして部屋を調査
- **アイテム使用**: インベントリからアイテムを選択
- **謎解き**: 各部屋で謎を解いて進行

### ボタン説明

- **セーブ**: ゲームの進行状況を保存
- **メニュー**: タイトル画面に戻る
- **コンティニュー**: 保存したゲームを読み込む

## ゲームの流れ

1. **エントランス**: ゲームスタート地点
2. **大広間**: 松明を入手できる
3. **宝物庫**: 金の鍵を入手
4. **謎の部屋**: 数学の謎を解く
5. **脱出口**: 最終の謎を解いて脱出

## 謎のヒント

各謎には正解のヒントが用意されています。間違えた答えを入力すると、ヒントが表示されます。

## 技術スタック

### フロントエンド

- **HTML5**: ゲームUI構造
- **CSS3**: スタイリング、アニメーション、レスポンシブデザイン
- **JavaScript (ES6)**: ゲームロジック、状態管理

### バックエンド（オプション）

- **Python 3.x**: Flask API サーバー
- **Flask**: Webフレームワーク
- **Flask-CORS**: クロスオリジン対応
- **JSON**: データストレージ

## ファイル構成

```
rpg_game.html          # メインゲームページ
rpg_server.py          # Pythonバックエンドサーバー
static/
  ├── rpg_game.css     # ゲームスタイル
  ├── rpg_game.js      # ゲームロジック
  └── rpg_data.json    # ゲームデータ（部屋、謎、アイテム）
```

## 開発者向け情報

### ゲームデータのカスタマイズ

`static/rpg_data.json`を編集することで、以下をカスタマイズできます：

- 部屋の追加/変更
- アイテムの追加/変更
- 謎の追加/変更

### データ構造

```json
{
  "rooms": {
    "room_id": {
      "name": "部屋名",
      "description": "説明",
      "emoji": "🎮",
      "exits": {"north": "next_room"},
      "items": ["item_id"],
      "puzzle": "puzzle_id"
    }
  },
  "items": {
    "item_id": {
      "name": "アイテム名",
      "description": "説明"
    }
  },
  "puzzles": {
    "puzzle_id": {
      "title": "謎のタイトル",
      "description": "謎の内容",
      "type": "number" または "text",
      "answer": "正解",
      "hint": "ヒント"
    }
  }
}
```

## Pythonサーバー API

### エンドポイント

- `GET /api/gamedata` - ゲームデータを取得
- `POST /api/save` - ゲームをセーブ
- `GET /api/load/<user_id>` - セーブデータを読み込み
- `POST /api/validate_puzzle` - 謎の答えを検証
- `GET /api/leaderboard` - リーダーボードを取得
- `POST /api/leaderboard` - スコアを送信
- `GET /api/hint/<puzzle_id>` - ヒントを取得

## 必要な依存関係

```bash
# Pythonサーバーを使用する場合
pip install Flask flask-cors
```

または

```bash
pip install -r requirements.txt
```

## トラブルシューティング

### ゲームが読み込まれない

- ブラウザのコンソールでエラーを確認
- すべてのファイルが正しい場所にあるか確認
- JavaScriptが有効になっているか確認

### セーブ/ロードが動作しない

- ブラウザのローカルストレージが有効か確認
- プライベートブラウジングモードでないか確認

### Pythonサーバーが起動しない

- Flaskとflask-corsがインストールされているか確認
- ポート5000が使用可能か確認

## ライセンス

このプロジェクトは個人用途での使用を目的としています。

## 貢献

改善の提案やバグ報告は大歓迎です！

## 楽しんでください！ 🎮

謎を解き、ダンジョンから脱出しましょう！
