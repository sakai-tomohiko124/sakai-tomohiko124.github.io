import requests
import json
from bs4 import BeautifulSoup
from datetime import datetime

URL = 'https://transit.yahoo.co.jp/diainfo/area/4'
OUTPUT_FILE = 'train_info.json'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
}

def main():
    """
    Yahoo!路線情報のHTMLテーブルを直接解析して運行情報を取得する。
    """
    lines_data = []
    try:
        response = requests.get(URL, headers=HEADERS, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')

        # --- トラブル路線のテーブルを探す ---
        trouble_section = soup.find('div', id='mdStatusTroubleLine')
        trouble_lines = set()
        if trouble_section:
            rows = trouble_section.select('table tbody tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) == 3:
                    name = cells[0].get_text(strip=True)
                    status = cells[1].get_text(strip=True)
                    detail = cells[2].get_text(strip=True)
                    lines_data.append({'name': name, 'status': status, 'detail': detail})
                    trouble_lines.add(name)
        
        print(f"{len(trouble_lines)}件のトラブル情報をHTMLテーブルから取得しました。")

        # --- 全路線のテーブルを探し、トラブルがなかった路線を追加 ---
        main_content = soup.find('div', id='main')
        if main_content:
            line_tables = main_content.select('.elmTblLstLine')
            for table in line_tables:
                rows = table.select('table tbody tr')
                for row in rows:
                    cells = row.find_all('td')
                    if len(cells) == 3:
                        name = cells[0].get_text(strip=True)
                        if name not in trouble_lines:
                            status = cells[1].get_text(strip=True)
                            detail = cells[2].get_text(strip=True)
                            lines_data.append({'name': name, 'status': status, 'detail': detail})
        
    except requests.exceptions.RequestException as e:
        print(f"HTTPリクエストエラーが発生しました: {e}")
    except Exception as e:
        print(f"予期せぬエラーが発生しました: {e}")

    # 最終的なJSON構造を作成
    output_data = {
        "lastUpdated": datetime.now().isoformat(),
        "lines": lines_data
    }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"'{OUTPUT_FILE}' の生成が完了しました。全 {len(lines_data)} 件の路線情報を書き出しました。")

if __name__ == '__main__':
    main()