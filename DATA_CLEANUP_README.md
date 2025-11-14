# 天気予報・電車情報データの自動クリーンアップ機能

## 概要
天気予報(`weather_info.json`)と電車情報(`train_info.json`)のデータが**6時間後**に自動削除される機能を実装しました。これによりサーバー負荷を軽減し、LocalStorageの肥大化を防ぎます。

## 実装内容

### 1. Pythonスクレイパー側の自動削除機能

#### `scraper2.py` (天気予報)
- **データ保持期間**: 6時間
- **動作**: スクリプト実行時に `weather_info.json` のタイムスタンプをチェック
- **削除条件**: ファイル更新日時から6時間以上経過している場合、自動削除
- **追加フィールド**:
  ```json
  {
    "generatedAt": "2025-11-14T12:00:00",
    "expiresAt": "2025-11-14T18:00:00",
    ...
  }
  ```

#### `scrape_train.py` (電車情報)
- **データ保持期間**: 6時間
- **動作**: スクリプト実行時に `train_info.json` のタイムスタンプをチェック
- **削除条件**: ファイル更新日時から6時間以上経過している場合、自動削除
- **追加フィールド**:
  ```json
  {
    "generatedAt": "2025-11-14T12:00:00",
    "expiresAt": "2025-11-14T18:00:00",
    ...
  }
  ```

### 2. HTML/JavaScript側のLocalStorageクリーンアップ

#### `weather.html`
- **機能**: ページ読み込み時に `lastWeatherCheck` をチェック
- **削除条件**: 最終チェック日時から6時間以上経過している場合、LocalStorageから削除
- **実装関数**: `cleanupOldWeatherData()`

#### `train.html`
- **機能**: ページ読み込み時に `lastTrainCheck` をチェック
- **削除条件**: 最終チェック日時から6時間以上経過している場合、LocalStorageから削除
- **実装関数**: `cleanupOldTrainData()`

## 動作フロー

### サーバー側 (Python)
```
1. スクリプト実行開始
2. cleanup_old_data() 実行
3. JSONファイルの更新日時をチェック
4. 6時間以上経過 → ファイル削除 → 新規データ生成
5. 6時間以内 → ファイル保持 → 新規データで上書き
```

### クライアント側 (HTML/JavaScript)
```
1. ページ読み込み
2. cleanupOldWeatherData() / cleanupOldTrainData() 実行
3. LocalStorageの lastWeatherCheck / lastTrainCheck をチェック
4. 日付文字列をパース → 現在日時との差分を計算
5. 6時間以上経過 → LocalStorageから削除
6. 6時間以内 → データ保持
```

## 削除されるデータ

### サーバー側ファイル
- `weather_info.json` (6時間以上古い場合)
- `train_info.json` (6時間以上古い場合)

### LocalStorageキー
- `lastWeatherCheck` (6時間以上古い場合)
- `lastTrainCheck` (6時間以上古い場合)

## 効果

### サーバー負荷軽減
- 古いJSONファイルが自動削除されることで、ディスク使用量を削減
- 定期実行時に古いデータを上書きするため、ファイル肥大化を防止

### LocalStorage最適化
- ユーザーのブラウザLocalStorageから古いタイムスタンプを削除
- ポイントシステムの履歴データとの競合を回避

### パフォーマンス向上
- 不要なデータが削除されることで、データ取得・表示速度が向上
- クライアント側のメモリ使用量を最適化

## 設定変更方法

データ保持期間を変更したい場合:

### Pythonスクリプト
```python
# scraper2.py と scrape_train.py の以下の行を変更
DATA_RETENTION_HOURS = 6  # ← この数値を変更(時間)
```

### HTML/JavaScript
```javascript
// weather.html と train.html の以下の行を変更
const DATA_RETENTION_HOURS = 6;  // ← この数値を変更(時間)
```

## 注意事項

1. **Pythonスクリプトの定期実行が必要**
   - cronやGitHub Actionsで定期的に実行すること
   - 推奨: 1時間ごと

2. **タイムゾーン**
   - Python側: システムのタイムゾーン（日本時間を推奨）
   - JavaScript側: ブラウザのタイムゾーン

3. **削除ログ**
   - Python側: コンソールに削除メッセージを出力
   - JavaScript側: ブラウザのコンソールに出力

## トラブルシューティング

### データが削除されない場合
1. Pythonスクリプトが定期実行されているか確認
2. ファイルの更新日時を確認: `ls -lh weather_info.json train_info.json`
3. LocalStorageを手動で確認: ブラウザ開発者ツール → Application → Local Storage

### データが早すぎる/遅すぎる場合
- `DATA_RETENTION_DAYS` の値を調整

### LocalStorageが削除されない場合
- ブラウザのコンソールでエラーメッセージを確認
- JavaScript実行のタイミングを確認（DOMContentLoaded前に実行）

## 動作検証手順

### 初回実行（新フィールド追加の確認）

既存のJSONファイルには `generatedAt` と `expiresAt` がまだ含まれていません。以下の手順で新フィールドが追加されることを確認してください。

#### 1. スクリプト実行前の確認
```bash
# 現在のJSONファイルを確認
cat weather_info.json | head -10
cat train_info.json | head -10

# ファイルの更新日時を確認
ls -lh weather_info.json train_info.json
```

#### 2. スクリプトの実行
```bash
# 天気予報データの更新
python3 scraper2.py

# 電車情報データの更新
python3 scrape_train.py
```

#### 3. 実行後の確認
```bash
# 新しいフィールドが追加されたか確認
cat weather_info.json | grep -E "(generatedAt|expiresAt)"
cat train_info.json | grep -E "(generatedAt|expiresAt)"
```

**期待される出力例**:
```json
{
  "publishingOffice": "気象庁",
  "reportDatetime": "2025-11-14T17:00:00+09:00",
  "generatedAt": "2025-11-14T21:30:45.123456",
  "expiresAt": "2025-11-15T03:30:45.123456",
  "forecasts": [...]
}
```

### 削除機能のテスト

#### Python側の削除テスト
```bash
# 1. ファイルの更新日時を7時間以上前に変更(テスト用)
touch -t 202511141200 weather_info.json
touch -t 202511141200 train_info.json

# 2. 更新日時を確認
ls -lh weather_info.json train_info.json

# 3. スクリプトを実行(削除が実行されるはず)
python3 scraper2.py
# 期待される出力: "古いデータファイル 'weather_info.json' を削除しました(7.5時間経過)"

python3 scrape_train.py
# 期待される出力: "古いデータファイル 'train_info.json' を削除しました(7.5時間経過)"

# 4. 新しいファイルが生成されたか確認
ls -lh weather_info.json train_info.json
```

#### JavaScript側の削除テスト

**方法1: ブラウザコンソールで手動テスト**
```javascript
// 1. 7時間前の日時を設定
const oldDate = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString();
localStorage.setItem('lastWeatherCheck', oldDate);
localStorage.setItem('lastTrainCheck', oldDate);

// 2. 設定を確認
console.log('Weather:', localStorage.getItem('lastWeatherCheck'));
console.log('Train:', localStorage.getItem('lastTrainCheck'));

// 3. ページをリロード
location.reload();

// 4. コンソールで削除メッセージを確認
// 期待される出力: "古い天気データを削除しました (7.0時間経過)"
// 期待される出力: "古い電車データを削除しました (7.0時間経過)"

// 5. 削除されたか確認
console.log('Weather:', localStorage.getItem('lastWeatherCheck')); // null
console.log('Train:', localStorage.getItem('lastTrainCheck')); // null
```

**方法2: 開発者ツールで確認**
1. ブラウザで `weather.html` または `train.html` を開く
2. F12で開発者ツールを開く
3. Application → Local Storage → サイトのドメインを選択
4. `lastWeatherCheck` または `lastTrainCheck` の値を7時間以上前の日付に手動変更
5. ページをリロード
6. Consoleタブで削除メッセージを確認
7. Applicationタブで該当キーが削除されたことを確認

### 保持期間のテスト

#### 3時間経過の場合(削除されないことを確認)
```bash
# ファイルの更新日時を3時間前に変更
touch -t 202511141800 weather_info.json

# スクリプト実行
python3 scraper2.py
# 期待される出力: "データファイルは3.0時間経過(6時間以内のため保持)"
```

## 実装確認チェックリスト

- [ ] `scraper2.py` に `cleanup_old_data()` 関数が追加されている
- [ ] `scraper2.py` に `DATA_RETENTION_DAYS = 3` が定義されている
- [ ] `scraper2.py` の出力に `generatedAt` と `expiresAt` が含まれる
- [ ] `scrape_train.py` に `cleanup_old_data()` 関数が追加されている
- [ ] `scrape_train.py` に `DATA_RETENTION_DAYS = 3` が定義されている
- [ ] `scrape_train.py` の出力に `generatedAt` と `expiresAt` が含まれる
- [ ] `weather.html` に `cleanupOldWeatherData()` 関数が追加されている
- [ ] `train.html` に `cleanupOldTrainData()` 関数が追加されている
- [ ] 両HTMLファイルでページ読み込み時にクリーンアップ関数が実行される
- [ ] ブラウザコンソールに削除メッセージが表示される

## コード実装の確認

### scraper2.py の重要部分
```python
# インポート確認
import os
from datetime import datetime, timedelta

# 定数確認
DATA_RETENTION_HOURS = 6

# 関数確認
def cleanup_old_data():
    """6時間以上古いweather_info.jsonファイルを削除"""
    # ... 実装 ...

# main関数の先頭
def main():
    cleanup_old_data()  # ← この行が追加されているか確認
    # ...

# 出力データ確認
output_data = {
    "publishingOffice": publishing_office,
    "reportDatetime": report_datetime,
    "generatedAt": datetime.now().isoformat(),  # ← 追加
    "expiresAt": (datetime.now() + timedelta(hours=DATA_RETENTION_HOURS)).isoformat(),  # ← 追加
    "forecasts": daily_forecasts,
    "hourly_forecast": hourly_forecasts
}
```

### weather.html の重要部分
```javascript
// クリーンアップ関数の存在確認
function cleanupOldWeatherData() {
    const DATA_RETENTION_HOURS = 6;
    const lastCheck = localStorage.getItem('lastWeatherCheck');
    // ... 実装 ...
}

// 実行確認
cleanupOldWeatherData();  // ← DOMContentLoadedの前に実行されているか
```

## 今後の拡張案

1. **削除履歴の記録**: 削除したデータの履歴をログファイルに保存
2. **ユーザー設定**: ユーザーごとにデータ保持期間を設定可能に
3. **圧縮保存**: 削除前にアーカイブとして圧縮保存
4. **通知機能**: データ削除時にユーザーに通知
5. **GitHub Actions統合**: 自動的にスクリプトを定期実行

## よくある質問（FAQ）

**Q: なぜ6時間なのですか？**  
A: 天気予報や電車情報は頻繁に更新されるため、6時間以上古いデータは信頼性が低くなります。必要に応じて `DATA_RETENTION_HOURS` を変更できます。

**Q: LocalStorageとJSONファイルで保持期間が異なることはありますか？**  
A: いいえ、両方とも同じ `DATA_RETENTION_HOURS = 6` を使用しています。

**Q: 削除に失敗した場合はどうなりますか？**  
A: エラーをキャッチしてログに出力し、処理を継続します。データ生成には影響しません。

**Q: スクリプトを手動実行する頻度は？**  
A: 1時間ごとが推奨です。天気予報や電車情報は頻繁に更新されるため、定期的な実行が望ましいです。

---
**実装日**: 2025-11-14  
**バージョン**: 2.0.0 (6時間保持に変更)  
**担当**: GitHub Copilot  
**最終更新**: 2025-11-14 (3日→6時間に変更、動作検証手順追加)

## 変更履歴

### v2.0.0 (2025-11-14)
- データ保持期間を3日間から6時間に変更
- より頻繁なデータ更新に対応
- サーバー負荷をさらに軽減

### v1.0.0 (2025-11-14)
- 初回リリース
- 3日間の自動削除機能を実装
