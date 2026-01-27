#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RPG風謎解きゲーム - Pythonバックエンドサーバー
ゲーム状態の管理とAPI提供
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__, static_folder='static')
CORS(app)  # クロスオリジン対応

# ゲームデータの保存ファイル
SAVE_DATA_FILE = 'game_saves.json'
LEADERBOARD_FILE = 'leaderboard.json'

# ゲームデータの読み込み
def load_game_data():
    """ゲームデータを読み込む"""
    try:
        with open('static/rpg_data.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return None

# セーブデータの読み込み
def load_saves():
    """セーブデータを読み込む"""
    if os.path.exists(SAVE_DATA_FILE):
        with open(SAVE_DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

# セーブデータの保存
def save_game_state(user_id, data):
    """ゲーム状態を保存"""
    saves = load_saves()
    saves[user_id] = {
        'data': data,
        'timestamp': datetime.now().isoformat()
    }
    with open(SAVE_DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(saves, f, ensure_ascii=False, indent=2)

# リーダーボードの読み込み
def load_leaderboard():
    """リーダーボードを読み込む"""
    if os.path.exists(LEADERBOARD_FILE):
        with open(LEADERBOARD_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# リーダーボードへの追加
def add_to_leaderboard(player_name, score, time_seconds):
    """リーダーボードに記録を追加"""
    leaderboard = load_leaderboard()
    leaderboard.append({
        'player': player_name,
        'score': score,
        'time': time_seconds,
        'timestamp': datetime.now().isoformat()
    })
    # スコアでソート（降順）
    leaderboard.sort(key=lambda x: (-x['score'], x['time']))
    # 上位50件のみ保持
    leaderboard = leaderboard[:50]
    
    with open(LEADERBOARD_FILE, 'w', encoding='utf-8') as f:
        json.dump(leaderboard, f, ensure_ascii=False, indent=2)
    
    return leaderboard

@app.route('/')
def index():
    """メインページ"""
    return send_from_directory('.', 'rpg_game.html')

@app.route('/api/gamedata', methods=['GET'])
def get_game_data():
    """ゲームデータを取得"""
    data = load_game_data()
    if data:
        return jsonify(data)
    else:
        return jsonify({'error': 'ゲームデータが見つかりません'}), 404

@app.route('/api/save', methods=['POST'])
def save_game():
    """ゲームをセーブ"""
    try:
        data = request.json
        user_id = data.get('user_id', 'default')
        game_state = data.get('game_state')
        
        if not game_state:
            return jsonify({'error': 'ゲーム状態が指定されていません'}), 400
        
        save_game_state(user_id, game_state)
        return jsonify({
            'success': True,
            'message': 'ゲームをセーブしました'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/load/<user_id>', methods=['GET'])
def load_game(user_id):
    """セーブデータを読み込み"""
    saves = load_saves()
    if user_id in saves:
        return jsonify({
            'success': True,
            'data': saves[user_id]['data'],
            'timestamp': saves[user_id]['timestamp']
        })
    else:
        return jsonify({'error': 'セーブデータが見つかりません'}), 404

@app.route('/api/validate_puzzle', methods=['POST'])
def validate_puzzle():
    """謎解きの答えを検証"""
    try:
        data = request.json
        puzzle_id = data.get('puzzle_id')
        answer = data.get('answer', '').strip().lower()
        
        game_data = load_game_data()
        if not game_data or puzzle_id not in game_data.get('puzzles', {}):
            return jsonify({'error': '謎が見つかりません'}), 404
        
        puzzle = game_data['puzzles'][puzzle_id]
        correct_answer = puzzle['answer'].lower()
        
        is_correct = answer == correct_answer
        
        return jsonify({
            'correct': is_correct,
            'hint': puzzle.get('hint', '') if not is_correct else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """リーダーボードを取得"""
    leaderboard = load_leaderboard()
    return jsonify(leaderboard)

@app.route('/api/leaderboard', methods=['POST'])
def submit_score():
    """スコアを送信"""
    try:
        data = request.json
        player_name = data.get('player_name', 'Anonymous')
        score = data.get('score', 0)
        time_seconds = data.get('time', 0)
        
        leaderboard = add_to_leaderboard(player_name, score, time_seconds)
        
        return jsonify({
            'success': True,
            'leaderboard': leaderboard
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/hint/<puzzle_id>', methods=['GET'])
def get_hint(puzzle_id):
    """ヒントを取得"""
    game_data = load_game_data()
    if not game_data or puzzle_id not in game_data.get('puzzles', {}):
        return jsonify({'error': '謎が見つかりません'}), 404
    
    puzzle = game_data['puzzles'][puzzle_id]
    return jsonify({
        'hint': puzzle.get('hint', 'ヒントがありません')
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """統計情報を取得"""
    saves = load_saves()
    leaderboard = load_leaderboard()
    
    return jsonify({
        'total_saves': len(saves),
        'total_scores': len(leaderboard),
        'highest_score': leaderboard[0] if leaderboard else None
    })

@app.errorhandler(404)
def not_found(error):
    """404エラーハンドラ"""
    return jsonify({'error': 'リソースが見つかりません'}), 404

@app.errorhandler(500)
def internal_error(error):
    """500エラーハンドラ"""
    return jsonify({'error': 'サーバーエラーが発生しました'}), 500

def main():
    """メイン関数"""
    print("=" * 50)
    print("RPG風謎解きゲーム サーバー起動中...")
    print("=" * 50)
    print(f"URL: http://localhost:5000")
    print(f"ゲームページ: http://localhost:5000/")
    print("=" * 50)
    print("終了するには Ctrl+C を押してください")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=False)

if __name__ == '__main__':
    main()
