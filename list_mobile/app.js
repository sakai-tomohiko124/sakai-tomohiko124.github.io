/* ==============================================
   見るものリスト - スマホ対応版 JavaScript
   LocalStorage管理 + Excelエクスポート機能
============================================== */

// ==================== 初期化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

let viewingList = [];
let historyLog = [];
let nextId = 1;

function initApp() {
    console.log('📱 見るものリストアプリ起動中...');
    
    // LocalStorageからデータ読み込み
    loadFromLocalStorage();
    
    // イベントリスナー設定
    setupEventListeners();
    
    // 初期表示
    renderList();
    updateStats();
    renderHistory();
    
    // 起動時のポップアップメッセージ
    showWelcomeMessage();
    
    // ふりがな設定の復元
    const furiganaEnabled = localStorage.getItem('furiganaEnabled') === 'true';
    document.getElementById('furiganaSwitch').checked = furiganaEnabled;
    toggleFurigana(furiganaEnabled);
    
    console.log('✅ アプリが正常に起動しました');
}

// ==================== LocalStorage管理 ====================
function loadFromLocalStorage() {
    try {
        const savedList = localStorage.getItem('viewingList');
        const savedHistory = localStorage.getItem('historyLog');
        const savedNextId = localStorage.getItem('nextId');
        
        if (savedList) {
            viewingList = JSON.parse(savedList);
            console.log(`📂 ${viewingList.length}件のデータを読み込みました`);
        }
        
        if (savedHistory) {
            historyLog = JSON.parse(savedHistory);
        }
        
        if (savedNextId) {
            nextId = parseInt(savedNextId);
        }
    } catch (error) {
        console.error('❌ データ読み込みエラー:', error);
        showNotification('データの読み込みに失敗しました', 'error');
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('viewingList', JSON.stringify(viewingList));
        localStorage.setItem('historyLog', JSON.stringify(historyLog));
        localStorage.setItem('nextId', nextId.toString());
        console.log('💾 データを保存しました');
    } catch (error) {
        console.error('❌ データ保存エラー:', error);
        showNotification('データの保存に失敗しました', 'error');
    }
}

// ==================== イベントリスナー ====================
function setupEventListeners() {
    // 新規追加ボタン
    document.getElementById('addNewBtn').addEventListener('click', openAddModal);
    
    // モーダルを閉じる
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // フォーム送信
    document.getElementById('addForm').addEventListener('submit', handleAddItem);
    
    // Excelエクスポート
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    
    // データクリア
    document.getElementById('clearDataBtn').addEventListener('click', confirmClearData);
    
    // ふりがなトグル
    document.getElementById('furiganaSwitch').addEventListener('change', function() {
        const enabled = this.checked;
        toggleFurigana(enabled);
        localStorage.setItem('furiganaEnabled', enabled);
    });
    
    // モーダル外クリックで閉じる
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
}

// ==================== モーダル管理 ====================
function openAddModal() {
    document.getElementById('addModal').classList.add('show');
    document.getElementById('addForm').reset();
    
    // 現在の日時を自動設定
    const now = new Date();
    document.getElementById('itemDate').value = now.toISOString().split('T')[0];
    document.getElementById('startTime').value = now.toTimeString().slice(0, 5);
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

function showWelcomeMessage() {
    const today = new Date().toLocaleDateString('ja-JP');
    const todayItems = viewingList.filter(item => {
        return !item.completed && item.date === document.getElementById('itemDate').value;
    });
    
    let message = `🌟 ようこそ！今日は ${today} です。\n\n`;
    
    if (todayItems.length > 0) {
        message += `今日見る予定のものは ${todayItems.length} 件あります：\n\n`;
        todayItems.forEach((item, index) => {
            message += `${index + 1}. ${item.title}\n`;
        });
    } else {
        message += '今日の予定はまだ登録されていません。\n「リストに追加」ボタンから新しい予定を追加してください！';
    }
    
    showNotification(message, 'info', 5000);
}

// ==================== データ追加 ====================
function handleAddItem(e) {
    e.preventDefault();
    
    const formData = {
        id: nextId++,
        date: document.getElementById('itemDate').value,
        title: document.getElementById('itemTitle').value,
        category: document.getElementById('itemCategory').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value || null,
        memo: document.getElementById('itemMemo').value,
        feeling: document.getElementById('itemFeeling').value,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString()
    };
    
    // かかった時間を計算
    if (formData.startTime && formData.endTime) {
        formData.duration = calculateDuration(formData.startTime, formData.endTime);
    }
    
    viewingList.push(formData);
    saveToLocalStorage();
    addHistory(`「${formData.title}」を追加しました`);
    
    renderList();
    updateStats();
    closeAllModals();
    
    showNotification(`✅ 依頼番号 ${formData.id} が追加されました！`, 'success');
}

// ==================== リスト表示 ====================
function renderList() {
    const listContainer = document.getElementById('itemList');
    
    if (viewingList.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <p>📝 まだデータがありません。<br>「リストに追加」ボタンから新しい項目を追加してください！</p>
            </div>
        `;
        return;
    }
    
    // 新しい順にソート
    const sortedList = [...viewingList].sort((a, b) => b.id - a.id);
    
    listContainer.innerHTML = sortedList.map(item => `
        <li class="item-card ${item.completed ? 'completed' : ''}">
            <div class="item-header">
                <div class="item-number">依頼番号: ${item.id}</div>
                <div class="item-status ${item.completed ? 'status-completed' : 'status-pending'}">
                    ${item.completed ? '✅ 完了' : '⏳ 未完了'}
                </div>
            </div>
            <div class="item-details">
                <p><strong>📅 日付:</strong> ${item.date}</p>
                <p><strong>📺 タイトル:</strong> ${item.title}</p>
                <p><strong>🏷️ 分類:</strong> ${item.category}</p>
                <p><strong>⏰ 時間:</strong> ${item.startTime} ${item.endTime ? '～ ' + item.endTime : ''}</p>
                ${item.duration ? `<p><strong>⏱️ かかった時間:</strong> ${item.duration}分</p>` : ''}
                ${item.memo ? `<p><strong>📝 メモ:</strong> ${item.memo}</p>` : ''}
                ${item.feeling ? `<p><strong>😊 気分:</strong> ${item.feeling}</p>` : ''}
                ${item.completedAt ? `<p><strong>✅ 完了日時:</strong> ${new Date(item.completedAt).toLocaleString('ja-JP')}</p>` : ''}
            </div>
            <div class="item-actions">
                ${!item.completed ? `<button class="btn btn-success" onclick="completeItem(${item.id})">完了する</button>` : ''}
                <button class="btn btn-warning" onclick="editItem(${item.id})">編集</button>
                <button class="btn btn-danger" onclick="deleteItem(${item.id})">削除</button>
            </div>
        </li>
    `).join('');
}

// ==================== 統計更新 ====================
function updateStats() {
    const total = viewingList.length;
    const completed = viewingList.filter(item => item.completed).length;
    const pending = total - completed;
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('pendingCount').textContent = pending;
}

// ==================== アイテム操作 ====================
function completeItem(id) {
    const item = viewingList.find(i => i.id === id);
    if (!item) return;
    
    item.completed = true;
    item.completedAt = new Date().toISOString();
    
    saveToLocalStorage();
    addHistory(`「${item.title}」を完了しました`);
    renderList();
    updateStats();
    
    // 達成感のあるメッセージ
    showNotification(
        `🎉 おめでとうございます！\n依頼番号 ${id}「${item.title}」を達成しました！\n素晴らしい進捗です！`,
        'success',
        4000
    );
}

function editItem(id) {
    const item = viewingList.find(i => i.id === id);
    if (!item) return;
    
    // 編集フォームに値を設定
    document.getElementById('itemDate').value = item.date;
    document.getElementById('itemTitle').value = item.title;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('startTime').value = item.startTime;
    document.getElementById('endTime').value = item.endTime || '';
    document.getElementById('itemMemo').value = item.memo || '';
    document.getElementById('itemFeeling').value = item.feeling || '';
    
    // 編集モードで開く
    openAddModal();
    
    // フォーム送信を編集用に変更
    const form = document.getElementById('addForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        item.date = document.getElementById('itemDate').value;
        item.title = document.getElementById('itemTitle').value;
        item.category = document.getElementById('itemCategory').value;
        item.startTime = document.getElementById('startTime').value;
        item.endTime = document.getElementById('endTime').value || null;
        item.memo = document.getElementById('itemMemo').value;
        item.feeling = document.getElementById('itemFeeling').value;
        
        if (item.startTime && item.endTime) {
            item.duration = calculateDuration(item.startTime, item.endTime);
        }
        
        saveToLocalStorage();
        addHistory(`「${item.title}」を編集しました`);
        renderList();
        closeAllModals();
        
        // 元のハンドラーに戻す
        form.onsubmit = handleAddItem;
        
        showNotification('✅ 編集を保存しました', 'success');
    };
}

function deleteItem(id) {
    const item = viewingList.find(i => i.id === id);
    if (!item) return;
    
    if (!confirm(`「${item.title}」を削除してもよろしいですか？`)) {
        return;
    }
    
    viewingList = viewingList.filter(i => i.id !== id);
    saveToLocalStorage();
    addHistory(`「${item.title}」を削除しました`);
    renderList();
    updateStats();
    
    showNotification('🗑️ 削除しました', 'info');
}

function confirmClearData() {
    if (!confirm('⚠️ すべてのデータを削除してもよろしいですか？\nこの操作は取り消せません。')) {
        return;
    }
    
    if (!confirm('本当に削除しますか？もう一度確認してください。')) {
        return;
    }
    
    viewingList = [];
    historyLog = [];
    nextId = 1;
    
    saveToLocalStorage();
    renderList();
    updateStats();
    renderHistory();
    
    showNotification('🗑️ すべてのデータを削除しました', 'info');
}

// ==================== 履歴管理 ====================
function addHistory(action) {
    const entry = {
        timestamp: new Date().toISOString(),
        action: action
    };
    
    historyLog.unshift(entry); // 新しいものを先頭に
    
    // 履歴は最大100件まで
    if (historyLog.length > 100) {
        historyLog = historyLog.slice(0, 100);
    }
    
    saveToLocalStorage();
    renderHistory();
}

function renderHistory() {
    const historyContainer = document.getElementById('historyList');
    
    if (historyLog.length === 0) {
        historyContainer.innerHTML = '<p class="text-muted">まだ履歴がありません</p>';
        return;
    }
    
    // 最新10件のみ表示
    const recentHistory = historyLog.slice(0, 10);
    
    historyContainer.innerHTML = recentHistory.map(entry => `
        <div class="history-item">
            <div class="history-action">${entry.action}</div>
            <div class="history-time">${new Date(entry.timestamp).toLocaleString('ja-JP')}</div>
        </div>
    `).join('');
}

// ==================== Excel エクスポート ====================
function exportToExcel() {
    if (viewingList.length === 0) {
        showNotification('❌ エクスポートするデータがありません', 'error');
        return;
    }
    
    if (!confirm(`📊 現在のデータ（${viewingList.length}件）をExcelファイルにエクスポートしますか？`)) {
        return;
    }
    
    try {
        // CSV形式でエクスポート（Excelで開ける）
        const csvContent = generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // ファイル名に日付を追加
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
        const filename = `見るものリスト_${dateStr}_${timeStr}.csv`;
        
        // ダウンロード
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        
        addHistory(`Excelエクスポート: ${filename}`);
        showNotification(`✅ ${filename} をダウンロードしました`, 'success');
        
    } catch (error) {
        console.error('❌ エクスポートエラー:', error);
        showNotification('エクスポートに失敗しました', 'error');
    }
}

function generateCSV() {
    // ヘッダー行
    const headers = [
        '依頼番号',
        '日付',
        'タイトル',
        '分類',
        '開始時間',
        '終了時間',
        'かかった時間（分）',
        'メモ',
        '気分',
        'ステータス',
        '完了日時',
        '作成日時'
    ];
    
    // データ行
    const rows = viewingList.map(item => [
        item.id,
        item.date,
        `"${item.title}"`, // カンマを含む可能性があるのでクォート
        item.category,
        item.startTime,
        item.endTime || '',
        item.duration || '',
        `"${item.memo || ''}"`,
        item.feeling || '',
        item.completed ? '完了' : '未完了',
        item.completedAt ? new Date(item.completedAt).toLocaleString('ja-JP') : '',
        new Date(item.createdAt).toLocaleString('ja-JP')
    ]);
    
    // CSV形式に変換（BOM付きUTF-8）
    const bom = '\uFEFF'; // Excel用BOM
    const csv = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
    
    return bom + csv;
}

// ==================== ユーティリティ関数 ====================
function calculateDuration(startTime, endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    let duration = endMinutes - startMinutes;
    
    // 日をまたぐ場合
    if (duration < 0) {
        duration += 24 * 60;
    }
    
    return duration;
}

function toggleFurigana(enabled) {
    // ふりがな機能の実装（簡易版）
    // 実際の実装では漢字→ひらがな変換ライブラリが必要
    if (enabled) {
        document.body.classList.add('furigana-enabled');
        console.log('✅ ふりがな表示ON');
    } else {
        document.body.classList.remove('furigana-enabled');
        console.log('❌ ふりがな表示OFF');
    }
}

function showNotification(message, type = 'info', duration = 3000) {
    // 簡易通知（alertの代わり）
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#50C878' : type === 'error' ? '#E74C3C' : '#4A90E2'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        z-index: 3000;
        max-width: 90%;
        text-align: center;
        white-space: pre-line;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ==================== サービスワーカー登録（PWA化） ====================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('✅ Service Worker登録成功', reg))
        .catch(err => console.log('❌ Service Worker登録失敗', err));
}

console.log('✅ app.js 読み込み完了');
