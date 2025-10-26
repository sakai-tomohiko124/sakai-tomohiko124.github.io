from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/grok', methods=['POST'])
def grok():
    data = request.json
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400

    api_key = os.getenv('XAI_API_KEY')
    if not api_key:
        return jsonify({'error': 'API key not set'}), 500

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    payload = {
        'model': 'grok-2',
        'messages': [{'role': 'user', 'content': prompt}]
    }
    try:
        response = requests.post('https://api.x.ai/v1/chat/completions', headers=headers, json=payload, timeout=30)
        if response.status_code == 200:
            result = response.json()
            answer = result['choices'][0]['message']['content']
            return jsonify({'answer': answer})
        else:
            return jsonify({'error': f'API error: {response.status_code}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)