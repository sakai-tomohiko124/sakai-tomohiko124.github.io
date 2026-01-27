// RPG謎解きゲーム - メインJavaScript

class RPGGame {
    constructor() {
        this.gameData = null;
        this.currentRoom = 'entrance';
        this.inventory = [];
        this.playerHP = 100;
        this.puzzlesSolved = [];
        this.visitedRooms = [];
        this.startTime = null;
        
        this.init();
    }
    
    async init() {
        // ゲームデータの読み込み
        await this.loadGameData();
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        // タイトル画面を表示
        this.showScreen('title-screen');
    }
    
    async loadGameData() {
        try {
            const response = await fetch('static/rpg_data.json');
            this.gameData = await response.json();
            console.log('ゲームデータ読み込み完了');
        } catch (error) {
            console.error('ゲームデータの読み込みに失敗:', error);
            // フォールバックデータを使用
            this.gameData = this.getFallbackData();
        }
    }
    
    getFallbackData() {
        // JSONファイルが読み込めない場合のフォールバックデータ
        return {
            rooms: {
                entrance: {
                    name: 'エントランス',
                    description: 'ここは古びたダンジョンの入口だ。東に通路が続いている。',
                    emoji: '🚪',
                    exits: { east: 'hall' },
                    items: [],
                    puzzle: null
                },
                hall: {
                    name: '大広間',
                    description: '広い部屋だ。北に宝箱があり、南には謎の扉がある。西は入口に戻る。',
                    emoji: '🏛️',
                    exits: { west: 'entrance', north: 'treasure_room', south: 'puzzle_room' },
                    items: ['torch'],
                    puzzle: null
                },
                treasure_room: {
                    name: '宝物庫',
                    description: '宝箱がある部屋だ。南に戻れる。',
                    emoji: '💎',
                    exits: { south: 'hall' },
                    items: ['key'],
                    puzzle: null
                },
                puzzle_room: {
                    name: '謎の部屋',
                    description: '謎が刻まれた石碑がある。北は大広間、東は最終部屋への扉だ。',
                    emoji: '🔮',
                    exits: { north: 'hall', east: 'final_room' },
                    items: [],
                    puzzle: 'math_puzzle'
                },
                final_room: {
                    name: '脱出口',
                    description: 'ここから脱出できそうだ！鍵が必要だ。',
                    emoji: '🚪✨',
                    exits: { west: 'puzzle_room' },
                    items: [],
                    puzzle: 'final_puzzle'
                }
            },
            items: {
                torch: { name: '松明', description: '暗い場所を照らす松明' },
                key: { name: '金の鍵', description: '最終の扉を開ける鍵' }
            },
            puzzles: {
                math_puzzle: {
                    title: '数学の謎',
                    description: '石碑に謎が刻まれている:\n\n3つの箱がある。\n第一の箱には2個、第二の箱には3個、第三の箱には5個の宝石が入っている。\n\nこのパターンで次に来る数字は？',
                    type: 'number',
                    answer: '7',
                    hint: 'フィボナッチ数列のパターンを考えてみよう: 2, 3, 5, ?'
                },
                final_puzzle: {
                    title: '最終の謎',
                    description: '扉に謎が刻まれている:\n\n「私は朝は4本足、昼は2本足、夜は3本足で歩く。私は何か？」\n\nカタカナで答えよ。',
                    type: 'text',
                    answer: 'ニンゲン',
                    hint: 'スフィンクスの有名な謎かけ。人間の一生を考えてみよう。'
                }
            }
        };
    }
    
    setupEventListeners() {
        // タイトル画面
        document.getElementById('start-btn').addEventListener('click', () => this.startNewGame());
        document.getElementById('load-btn').addEventListener('click', () => this.loadGame());
        document.getElementById('instructions-btn').addEventListener('click', () => this.showInstructions());
        document.getElementById('back-btn').addEventListener('click', () => this.showScreen('title-screen'));
        
        // ゲーム画面
        document.querySelectorAll('.direction-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.target.dataset.direction;
                this.move(direction);
            });
        });
        
        document.getElementById('examine-btn').addEventListener('click', () => this.examine());
        document.getElementById('save-btn').addEventListener('click', () => this.saveGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.showMenu());
        
        // 謎解き画面
        document.getElementById('submit-puzzle').addEventListener('click', () => this.submitPuzzle());
        document.getElementById('cancel-puzzle').addEventListener('click', () => this.closePuzzle());
        
        // クリア/ゲームオーバー画面
        document.getElementById('restart-btn').addEventListener('click', () => this.startNewGame());
        document.getElementById('title-btn').addEventListener('click', () => this.showScreen('title-screen'));
        document.getElementById('retry-btn').addEventListener('click', () => this.startNewGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.showScreen('title-screen'));
    }
    
    startNewGame() {
        this.currentRoom = 'entrance';
        this.inventory = [];
        this.playerHP = 100;
        this.puzzlesSolved = [];
        this.visitedRooms = [];
        this.startTime = Date.now();
        
        this.showScreen('game-screen');
        this.updateRoom();
        this.addMessage('新しい冒険が始まった！');
    }
    
    loadGame() {
        const savedGame = localStorage.getItem('rpg_game_save');
        if (savedGame) {
            const data = JSON.parse(savedGame);
            this.currentRoom = data.currentRoom;
            this.inventory = data.inventory;
            this.playerHP = data.playerHP;
            this.puzzlesSolved = data.puzzlesSolved;
            this.visitedRooms = data.visitedRooms;
            this.startTime = data.startTime;
            
            this.showScreen('game-screen');
            this.updateRoom();
            this.addMessage('セーブデータを読み込みました。', 'success');
        } else {
            alert('セーブデータがありません。');
        }
    }
    
    saveGame() {
        const saveData = {
            currentRoom: this.currentRoom,
            inventory: this.inventory,
            playerHP: this.playerHP,
            puzzlesSolved: this.puzzlesSolved,
            visitedRooms: this.visitedRooms,
            startTime: this.startTime
        };
        
        localStorage.setItem('rpg_game_save', JSON.stringify(saveData));
        this.addMessage('ゲームをセーブしました。', 'success');
    }
    
    showInstructions() {
        this.showScreen('instructions-screen');
    }
    
    showMenu() {
        if (confirm('メニューに戻りますか？（進行状況は保存されません）')) {
            this.showScreen('title-screen');
        }
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    updateRoom() {
        const room = this.gameData.rooms[this.currentRoom];
        
        // 訪問済みに追加
        if (!this.visitedRooms.includes(this.currentRoom)) {
            this.visitedRooms.push(this.currentRoom);
        }
        
        // UI更新
        document.getElementById('current-room').textContent = room.name;
        document.getElementById('room-description').textContent = room.description;
        document.getElementById('room-image').textContent = room.emoji;
        document.getElementById('player-hp').textContent = this.playerHP;
        
        // 進行度計算
        const totalPuzzles = Object.keys(this.gameData.puzzles).length;
        const progress = totalPuzzles > 0 ? Math.round((this.puzzlesSolved.length / totalPuzzles) * 100) : 0;
        document.getElementById('progress').textContent = progress;
        
        // 方向ボタンの有効/無効化
        ['north', 'south', 'east', 'west'].forEach(dir => {
            const btn = document.getElementById(`${dir}-btn`);
            if (room.exits && room.exits[dir]) {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        });
        
        // インベントリ更新
        this.updateInventory();
    }
    
    move(direction) {
        const room = this.gameData.rooms[this.currentRoom];
        
        if (room.exits && room.exits[direction]) {
            const nextRoom = room.exits[direction];
            
            // 特定の部屋への移動条件チェック
            if (nextRoom === 'final_room' && !this.inventory.includes('key')) {
                this.addMessage('扉は鍵がかかっている。鍵が必要だ。', 'error');
                return;
            }
            
            this.currentRoom = nextRoom;
            this.updateRoom();
            this.addMessage(`${this.gameData.rooms[nextRoom].name}に移動した。`);
        } else {
            this.addMessage('その方向には行けない。', 'error');
        }
    }
    
    examine() {
        const room = this.gameData.rooms[this.currentRoom];
        
        // アイテムチェック
        if (room.items && room.items.length > 0) {
            const item = room.items[0];
            if (!this.inventory.includes(item)) {
                this.inventory.push(item);
                room.items.shift(); // アイテムを部屋から削除
                const itemData = this.gameData.items[item];
                this.addMessage(`${itemData.name}を見つけた！`, 'success');
                this.updateInventory();
                return;
            }
        }
        
        // 謎解きチェック
        if (room.puzzle && !this.puzzlesSolved.includes(room.puzzle)) {
            this.showPuzzle(room.puzzle);
            return;
        }
        
        // 脱出チェック
        if (this.currentRoom === 'final_room' && this.inventory.includes('key')) {
            if (this.puzzlesSolved.includes('final_puzzle')) {
                this.gameCleared();
                return;
            }
        }
        
        this.addMessage('特に何も見つからない。');
    }
    
    showPuzzle(puzzleId) {
        const puzzle = this.gameData.puzzles[puzzleId];
        
        document.getElementById('puzzle-title').textContent = puzzle.title;
        document.getElementById('puzzle-description').textContent = puzzle.description;
        
        // 入力フィールド作成
        const inputDiv = document.getElementById('puzzle-input');
        inputDiv.innerHTML = '';
        
        if (puzzle.type === 'number') {
            inputDiv.innerHTML = '<input type="number" id="puzzle-answer" placeholder="数字を入力">';
        } else {
            inputDiv.innerHTML = '<input type="text" id="puzzle-answer" placeholder="答えを入力">';
        }
        
        // ヒント非表示
        document.getElementById('puzzle-hint').style.display = 'none';
        
        // 現在の謎を記録
        this.currentPuzzle = puzzleId;
        
        this.showScreen('puzzle-screen');
    }
    
    submitPuzzle() {
        const puzzle = this.gameData.puzzles[this.currentPuzzle];
        const answer = document.getElementById('puzzle-answer').value.trim();
        
        if (answer.toLowerCase() === puzzle.answer.toLowerCase()) {
            this.puzzlesSolved.push(this.currentPuzzle);
            this.addMessage(`謎を解いた！`, 'success');
            this.showScreen('game-screen');
            this.updateRoom();
            
            // 最終謎解き後の脱出チェック
            if (this.currentPuzzle === 'final_puzzle' && this.inventory.includes('key')) {
                this.gameCleared();
            }
        } else {
            // ヒント表示
            const hintDiv = document.getElementById('puzzle-hint');
            hintDiv.textContent = 'ヒント: ' + puzzle.hint;
            hintDiv.style.display = 'block';
            
            this.addMessage('答えが違う...', 'error');
        }
    }
    
    closePuzzle() {
        this.showScreen('game-screen');
    }
    
    updateInventory() {
        const inventoryContent = document.getElementById('inventory-content');
        
        if (this.inventory.length === 0) {
            inventoryContent.innerHTML = '<p class="empty-inventory">アイテムがありません</p>';
        } else {
            inventoryContent.innerHTML = '';
            this.inventory.forEach(itemId => {
                const item = this.gameData.items[itemId];
                const itemDiv = document.createElement('div');
                itemDiv.className = 'inventory-item';
                itemDiv.textContent = item.name;
                itemDiv.title = item.description;
                inventoryContent.appendChild(itemDiv);
            });
        }
    }
    
    addMessage(text, type = '') {
        const messageContent = document.getElementById('message-content');
        const message = document.createElement('p');
        message.className = 'message';
        if (type) message.classList.add(type);
        message.textContent = text;
        
        messageContent.appendChild(message);
        
        // 自動スクロール
        messageContent.scrollTop = messageContent.scrollHeight;
        
        // メッセージが多すぎる場合は古いものを削除
        const messages = messageContent.querySelectorAll('.message');
        if (messages.length > 20) {
            messages[0].remove();
        }
    }
    
    gameCleared() {
        const endTime = Date.now();
        const playTime = Math.floor((endTime - this.startTime) / 1000);
        const minutes = Math.floor(playTime / 60);
        const seconds = playTime % 60;
        
        const stats = document.getElementById('clear-stats');
        stats.innerHTML = `
            <p><strong>クリア時間:</strong> ${minutes}分${seconds}秒</p>
            <p><strong>訪問した部屋:</strong> ${this.visitedRooms.length}/${Object.keys(this.gameData.rooms).length}</p>
            <p><strong>解いた謎:</strong> ${this.puzzlesSolved.length}/${Object.keys(this.gameData.puzzles).length}</p>
            <p><strong>HP:</strong> ${this.playerHP}/100</p>
        `;
        
        this.showScreen('clear-screen');
        
        // セーブデータをクリア
        localStorage.removeItem('rpg_game_save');
    }
    
    gameOver() {
        this.showScreen('gameover-screen');
    }
}

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    window.game = new RPGGame();
});
