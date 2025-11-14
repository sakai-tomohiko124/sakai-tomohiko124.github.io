// 共通ヘッダーコンポーネントを動的に挿入
function insertPointsTab() {
    const rank = pointsManager ? pointsManager.getPointsRank() : { rank: 'ビギナー', color: '#888888' };
    
    const pointsTab = document.createElement('div');
    pointsTab.className = 'points-tab';
    pointsTab.onclick = showPointsModal;
    pointsTab.innerHTML = `
        <div class="points-label">💰 保有ポイント <span class="rank-badge" style="background: ${rank.color};">${rank.rank}</span></div>
        <div class="points-display">20000円</div>
    `;
    document.body.insertBefore(pointsTab, document.body.firstChild);
}

// ポイントモーダルを表示
function showPointsModal() {
    if (typeof pointsManager === 'undefined') {
        alert('ポイントシステムが読み込まれていません');
        return;
    }

    const rank = pointsManager.getPointsRank();
    const streak = parseInt(localStorage.getItem('loginStreak') || '0');
    const timeBonus = pointsManager.checkTimeBonus();

    const modal = document.createElement('div');
    modal.className = 'points-modal active';
    modal.innerHTML = `
        <div class="points-modal-content">
            <h2>💰 ポイントシステム</h2>
            <div class="points-info-item">
                <strong>現在の残高:</strong><br>
                <span class="points-display" style="font-size: 2em;">${pointsManager.getPoints().toLocaleString()}円</span>
                <span class="rank-badge" style="background: ${rank.color}; font-size: 1.2em; margin-left: 15px;">${rank.rank}</span>
            </div>
            <div class="points-info-item" style="background: rgba(255, 215, 0, 0.1); border: 1px solid #ffd700;">
                <strong style="color: #ffd700;">🎁 ボーナス情報</strong><br>
                <div style="margin-top: 10px;">
                    <span>🔥 連続ログイン: ${streak}日</span><br>
                    ${timeBonus > 1.0 ? '<span style="color: #00ff88;">⚡ 現在ポイント' + timeBonus + '倍タイム!</span>' : ''}
                    ${rank.bonus > 1.0 ? '<br><span style="color: #ffd700;">👑 ランクボーナス: ' + rank.bonus + '倍</span>' : ''}
                </div>
            </div>
            <div class="points-info-item">
                <h3 style="color: #ff4444;">💸 ポイントが減る行動</h3>
                <ul style="list-style: none; padding: 0;">
                    <li class="points-loss">• クイズ回答: -100円</li>
                    <li class="points-loss">• チャット送信: -100円</li>
                    <li class="points-loss">• 用語検索: -50円</li>
                </ul>
            </div>
            <div class="points-info-item">
                <h3 style="color: #00ff88;">💰 ポイントが増える行動</h3>
                <ul style="list-style: none; padding: 0;">
                    <li class="points-gain">• eラーニング参加: +2000円</li>
                    <li class="points-gain">• アンケート回答: +1000円</li>
                    <li class="points-gain">• 物語閲覧: +1000円</li>
                    <li class="points-gain">• 動画視聴完了: +1000円</li>
                    <li class="points-gain">• 天気確認: +500円</li>
                    <li class="points-gain">• 電車情報確認: +500円</li>
                    <li class="points-gain">• デイリーログイン: +500円</li>
                    <li class="points-gain">• 7日連続ログイン: +2000円</li>
                    <li class="points-gain">• マニュアル閲覧: +300円</li>
                </ul>
            </div>
            <div class="points-info-item">
                <h3 style="color: #ffd700;">🏆 ランクシステム</h3>
                <ul style="list-style: none; padding: 0; font-size: 0.95em;">
                    <li>🥉 ビギナー: 0-4,999円</li>
                    <li>🥉 ブロンズ: 5,000-14,999円 (1.0倍)</li>
                    <li>🥈 シルバー: 15,000-29,999円 (1.1倍)</li>
                    <li>🥇 ゴールド: 30,000-49,999円 (1.3倍)</li>
                    <li>💎 プラチナ: 50,000円以上 (1.5倍)</li>
                </ul>
            </div>
            <div class="points-info-item">
                <strong>履歴を確認:</strong><br>
                <button onclick="viewPointsHistory()" style="background: #00e0ff; color: #121212; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                    📜 ポイント履歴を表示
                </button>
            </div>
            <button class="points-modal-close" onclick="this.parentElement.parentElement.remove()">閉じる</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // モーダル外クリックで閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ポイント履歴を表示
function viewPointsHistory() {
    if (typeof pointsManager === 'undefined') return;
    
    const logs = pointsManager.getLog();
    const historyHTML = logs.slice(-20).reverse().map(log => {
        const date = new Date(log.timestamp).toLocaleString('ja-JP');
        const amountColor = log.amount > 0 ? '#00ff88' : '#ff4444';
        const sign = log.amount > 0 ? '+' : '';
        return `
            <div style="padding: 10px; border-bottom: 1px solid #333; display: flex; justify-content: space-between;">
                <div>
                    <div style="font-size: 0.85em; color: #888;">${date}</div>
                    <div>${log.reason}</div>
                </div>
                <div style="color: ${amountColor}; font-weight: bold; font-size: 1.1em;">
                    ${sign}${log.amount.toLocaleString()}円
                </div>
            </div>
        `;
    }).join('');

    const modal = document.createElement('div');
    modal.className = 'points-modal active';
    modal.innerHTML = `
        <div class="points-modal-content">
            <h2>📜 ポイント履歴</h2>
            <div style="max-height: 400px; overflow-y: auto; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 10px;">
                ${historyHTML || '<p style="text-align: center; color: #888;">履歴がありません</p>'}
            </div>
            <button class="points-modal-close" onclick="this.parentElement.parentElement.remove()">閉じる</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ページロード時に実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertPointsTab);
} else {
    insertPointsTab();
}

// ポイント表示を定期的に更新
setInterval(() => {
    if (typeof pointsManager !== 'undefined') {
        pointsManager.updateDisplay();
    }
}, 2000);
