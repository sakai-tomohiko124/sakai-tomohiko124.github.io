#!/bin/bash
# すべてのHTMLファイルにポイントシステムを追加するスクリプト

# 対象HTMLファイル
HTML_FILES=(
    "home.html"
    "index2.html"
    "index3.html"
    "index4.html"
    "index5.html"
    "story.html"
    "weather.html"
    "train.html"
    "other.html"
    "pythonexam.html"
    "hate.html"
    "link.html"
    "アンケート.html"
    "感想.html"
    "クイズ.html"
)

echo "HTMLファイルにポイントシステムを追加中..."

for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "処理中: $file"
        # ファイルにポイントシステムが既に追加されているかチェック
        if ! grep -q "points.js" "$file"; then
            echo "$file にポイントシステムを追加..."
            # 実際の処理はPythonスクリプトで行う
        else
            echo "$file は既にポイントシステムが追加されています"
        fi
    else
        echo "警告: $file が見つかりません"
    fi
done

echo "完了！"
