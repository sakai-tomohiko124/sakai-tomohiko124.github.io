import requests
import os

# GitHub API トークン（環境変数から取得）
token = os.getenv('GITHUB_TOKEN')
headers = {'Authorization': f'token {token}'}
repo = 'sakai-tomohiko124/sakai-tomohiko124.github.io'

# 実行一覧を取得（ページネーション対応）
all_runs = []
page = 1
per_page = 100
while True:
    url = f'https://api.github.com/repos/{repo}/actions/runs?page={page}&per_page={per_page}'
    response = requests.get(url, headers=headers)
    data = response.json()
    runs = data.get('workflow_runs', [])
    if not runs:
        break
    all_runs.extend(runs)
    page += 1

# 完了した実行を削除（アクティブなものはスキップ）
for run in all_runs:
    if run['status'] != 'in_progress' and run['status'] != 'queued':
        delete_url = f'https://api.github.com/repos/{repo}/actions/runs/{run["id"]}'
        requests.delete(delete_url, headers=headers)
        print(f'Deleted run {run["id"]}')