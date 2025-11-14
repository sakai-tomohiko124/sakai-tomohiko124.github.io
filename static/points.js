/**
 * ポイント（金額）管理システム
 * デフォルト: 20000円
 * 減額: チャット・クイズ1回あたり-100円
 * 増額: アンケート回答・物語閲覧・動画視聴+1000円
 */

class PointsManager {
    constructor() {
        this.INITIAL_POINTS = 20000;
        this.QUIZ_COST = -100;
        this.CHAT_COST = -100;
        this.SURVEY_REWARD = 1000;
        this.STORY_REWARD = 1000;
        this.VIDEO_REWARD = 1000;
        this.WEATHER_REWARD = 500;  // 天気チェック
        this.TRAIN_REWARD = 500;    // 電車情報チェック
        this.LEARNING_REWARD = 2000; // eラーニング参加
        this.MANUAL_REWARD = 300;   // マニュアル閲覧
        this.TERM_SEARCH_COST = -50; // 用語検索（軽い負担）
        
        this.initializePoints();
        this.updateDisplay();
    }

    // 初期化
    initializePoints() {
        if (localStorage.getItem('userPoints') === null) {
            localStorage.setItem('userPoints', this.INITIAL_POINTS.toString());
        }
    }

    // 現在のポイントを取得
    getPoints() {
        return parseInt(localStorage.getItem('userPoints') || this.INITIAL_POINTS);
    }

    // ポイントを設定
    setPoints(points) {
        localStorage.setItem('userPoints', points.toString());
        this.updateDisplay();
        this.checkPointsAlert(points);
    }

    // ポイントを加算/減算
    addPoints(amount, reason = '') {
        const currentPoints = this.getPoints();
        const newPoints = currentPoints + amount;
        this.setPoints(newPoints);
        
        // ログに記録
        this.logTransaction(amount, reason, newPoints);
        
        // 通知を表示
        this.showPointsNotification(amount, reason, newPoints);
        
        return newPoints;
    }

    // クイズ回答時
    onQuizComplete() {
        return this.addPoints(this.QUIZ_COST, 'クイズ回答');
    }

    // チャット送信時
    onChatMessage() {
        return this.addPoints(this.CHAT_COST, 'チャット送信');
    }

    // アンケート回答時
    onSurveyComplete() {
        return this.addPoints(this.SURVEY_REWARD, 'アンケート回答');
    }

    // 物語閲覧時
    onStoryRead() {
        const storyId = window.location.pathname;
        const storyKey = `story_read_${storyId}`;
        
        // 同じ物語は1回のみポイント付与
        if (!localStorage.getItem(storyKey)) {
            localStorage.setItem(storyKey, 'true');
            return this.addPoints(this.STORY_REWARD, '物語閲覧');
        }
        return this.getPoints();
    }

    // 動画視聴時
    onVideoWatch() {
        return this.addPoints(this.VIDEO_REWARD, '動画視聴完了');
    }

    // 天気チェック
    onWeatherCheck() {
        return this.addPoints(this.WEATHER_REWARD, '天気情報確認');
    }

    // 電車情報チェック
    onTrainCheck() {
        return this.addPoints(this.TRAIN_REWARD, '電車情報確認');
    }

    // eラーニング参加
    onLearningAccess() {
        return this.addPoints(this.LEARNING_REWARD, 'eラーニング参加');
    }

    // マニュアル閲覧
    onManualAccess() {
        return this.addPoints(this.MANUAL_REWARD, 'マニュアル閲覧');
    }

    // 用語検索
    onTermSearch() {
        return this.addPoints(this.TERM_SEARCH_COST, '用語検索');
    }

    // ポイント表示を更新
    updateDisplay() {
        const points = this.getPoints();
        const displayElements = document.querySelectorAll('.points-display');
        
        displayElements.forEach(element => {
            element.textContent = `${points.toLocaleString()}円`;
            
            // ポイント数に応じて色を変更
            if (points < 5000) {
                element.style.color = '#ff4444';
            } else if (points < 10000) {
                element.style.color = '#ffaa00';
            } else {
                element.style.color = '#00ff88';
            }
        });
    }

    // 通知を表示
    showPointsNotification(amount, reason, newPoints) {
        // 既存の通知があれば削除
        const existing = document.querySelector('.points-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'points-notification';
        
        const sign = amount > 0 ? '+' : '';
        const color = amount > 0 ? '#00ff88' : '#ff4444';
        const emoji = amount > 0 ? '💰' : '💸';
        
        notification.innerHTML = `
            <div style="background: rgba(0, 0, 0, 0.9); padding: 20px; border-radius: 10px; 
                        border: 2px solid ${color}; box-shadow: 0 0 20px ${color};">
                <div style="font-size: 2em;">${emoji}</div>
                <div style="color: ${color}; font-size: 1.5em; font-weight: bold; margin: 10px 0;">
                    ${sign}${amount.toLocaleString()}円
                </div>
                <div style="color: #fff; margin: 5px 0;">${reason}</div>
                <div style="color: #00e0ff; font-size: 1.2em; margin-top: 10px;">
                    残高: ${newPoints.toLocaleString()}円
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            animation: pointsNotificationAnim 2s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    }

    // ポイント警告
    checkPointsAlert(points) {
        if (points <= 0) {
            alert('⚠️ ポイントが0円になりました！\nアンケートや物語閲覧でポイントを獲得しましょう。');
        } else if (points < 1000) {
            console.warn('⚠️ ポイント残高が少なくなっています:', points);
        }
    }

    // 取引ログを記録
    logTransaction(amount, reason, newBalance) {
        const logs = JSON.parse(localStorage.getItem('pointsLog') || '[]');
        logs.push({
            timestamp: new Date().toISOString(),
            amount: amount,
            reason: reason,
            balance: newBalance
        });
        
        // 最新100件のみ保存
        if (logs.length > 100) {
            logs.shift();
        }
        
        localStorage.setItem('pointsLog', JSON.stringify(logs));
    }

    // ログを取得
    getLog() {
        return JSON.parse(localStorage.getItem('pointsLog') || '[]');
    }

    // ポイントをリセット
    resetPoints() {
        if (confirm('本当にポイントをリセットしますか？')) {
            this.setPoints(this.INITIAL_POINTS);
            localStorage.removeItem('pointsLog');
            alert('ポイントがリセットされました！');
        }
    }

    // ポイントランク取得
    getPointsRank() {
        const points = this.getPoints();
        if (points >= 50000) return { rank: 'プラチナ', color: '#e5e4e2', bonus: 1.5 };
        if (points >= 30000) return { rank: 'ゴールド', color: '#ffd700', bonus: 1.3 };
        if (points >= 15000) return { rank: 'シルバー', color: '#c0c0c0', bonus: 1.1 };
        if (points >= 5000) return { rank: 'ブロンズ', color: '#cd7f32', bonus: 1.0 };
        return { rank: 'ビギナー', color: '#888888', bonus: 1.0 };
    }

    // デイリーボーナス
    checkDailyBonus() {
        const today = new Date().toDateString();
        const lastBonus = localStorage.getItem('lastDailyBonus');
        
        if (lastBonus !== today) {
            const bonus = 500;
            this.addPoints(bonus, 'デイリーログインボーナス');
            localStorage.setItem('lastDailyBonus', today);
            return true;
        }
        return false;
    }

    // 連続ログインボーナス
    checkStreakBonus() {
        const today = new Date().toDateString();
        const lastLogin = localStorage.getItem('lastLoginDate');
        const streak = parseInt(localStorage.getItem('loginStreak') || '0');
        
        if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            let newStreak = lastLogin === yesterdayStr ? streak + 1 : 1;
            localStorage.setItem('loginStreak', newStreak.toString());
            localStorage.setItem('lastLoginDate', today);
            
            if (newStreak >= 7) {
                const bonus = 2000;
                this.addPoints(bonus, `${newStreak}日連続ログインボーナス`);
            }
        }
    }

    // ポイント倍増イベント（特定時間帯）
    checkTimeBonus() {
        const hour = new Date().getHours();
        // 深夜0-6時、昼12-13時は1.5倍
        if ((hour >= 0 && hour < 6) || (hour >= 12 && hour < 13)) {
            return 1.5;
        }
        return 1.0;
    }
}

// グローバルインスタンス
const pointsManager = new PointsManager();

// ページロード時にボーナスチェック
window.addEventListener('load', () => {
    if (typeof pointsManager !== 'undefined') {
        pointsManager.checkDailyBonus();
        pointsManager.checkStreakBonus();
    }
});

// アニメーション用CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes pointsNotificationAnim {
        0% { opacity: 0; transform: translate(-50%, -60%) scale(0.8); }
        10% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
    }
    
    .rank-badge {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 0.9em;
        margin-left: 10px;
        box-shadow: 0 0 10px currentColor;
    }
`;
document.head.appendChild(style);
