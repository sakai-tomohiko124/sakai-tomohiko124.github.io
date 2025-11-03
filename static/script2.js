document.addEventListener('DOMContentLoaded', () => {
    // --- 操作対象のDOM要素を取得 ---
    const glossaryContainer = document.getElementById('glossary-container');
    const glossarySelect = document.getElementById('glossarySelect');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortOrder = document.getElementById('sortOrder');
    const searchInput = document.getElementById('searchInput');
    
    // --- [移行] HTMLから機能移行した要素 ---
    const paginationContainer = document.getElementById('pagination-container');
    const displayCountInput = document.getElementById('displayCountInput');

    // --- グローバル変数 ---
    let allGlossaryData = []; // 現在読み込んでいる用語集の全データを保持
    let currentGlossaryFile = glossarySelect.value; // 現在選択されているJSONファイル名

    // --- [移行] 用語の表示数を管理し、「さらに表示」ボタンを制御する関数 ---
    const manageTermDisplay = () => {
        const terms = glossaryContainer.querySelectorAll('.glossary-item');
        // inputの値を取得し、不正な場合はデフォルト値20を使用
        const itemsToShow = parseInt(displayCountInput.value, 10) || 20;

        // まず、すべての用語を表示状態に戻す（フィルタリングやソート後の再計算のため）
        terms.forEach(term => term.style.display = '');
        
        // 表示数を超える用語があれば、それらを非表示にし、ボタンを生成する
        if (terms.length > itemsToShow) {
            for (let i = itemsToShow; i < terms.length; i++) {
                terms[i].style.display = 'none';
            }

            // ボタンコンテナをクリアしてからボタンを再生成
            paginationContainer.innerHTML = ''; 
            const showAllButton = document.createElement('button');
            showAllButton.textContent = `すべての単語 (${terms.length}件) を表示`;
            showAllButton.className = 'futuristic-button'; // 既存のボタンスタイルを適用
            
            // ボタンがクリックされたら、隠れている用語を表示し、ボタン自身を削除する
            showAllButton.addEventListener('click', () => {
                terms.forEach(term => term.style.display = '');
                showAllButton.remove();
            });
            paginationContainer.appendChild(showAllButton);
        } else {
            // 表示数以下の場合はボタンを非表示（コンテナを空にする）
            paginationContainer.innerHTML = '';
        }
    };

    // --- 用語カードを生成する共通関数 ---
    function createGlossaryCard(item) {
        const glossaryItemDiv = document.createElement('div');
        glossaryItemDiv.classList.add('glossary-item');

        if (item.page) {
            const pageInfo = document.createElement('span');
            pageInfo.classList.add('glossary-page-info');
            pageInfo.textContent = `PAGE: ${item.page}`;
            glossaryItemDiv.appendChild(pageInfo);
        }

        const termHeading = document.createElement('h2');
        termHeading.classList.add('glossary-term');
        termHeading.textContent = item.term;
        glossaryItemDiv.appendChild(termHeading);

        const explanationParagraph = document.createElement('p');
        explanationParagraph.classList.add('glossary-explanation');
        explanationParagraph.textContent = item.explanation;
        glossaryItemDiv.appendChild(explanationParagraph);

        if (item.usage_example) {
            const usageExampleDiv = document.createElement('div');
            usageExampleDiv.classList.add('glossary-usage-example');
            const usageLabel = document.createElement('span');
            usageLabel.classList.add('usage-label');
            usageLabel.textContent = 'USAGE: ';
            const codeBlock = document.createElement('pre');
            codeBlock.classList.add('code-block');
            codeBlock.textContent = item.usage_example;
            usageExampleDiv.appendChild(usageLabel);
            usageExampleDiv.appendChild(codeBlock);
            glossaryItemDiv.appendChild(usageExampleDiv);
        }
        return glossaryItemDiv;
    }

    // --- 用語リストを画面に描画する関数 ---
    function renderGlossary(termsToRender) {
        glossaryContainer.innerHTML = ''; // コンテナをクリア

        if (termsToRender.length === 0) {
            glossaryContainer.innerHTML = '<p class="loading-message">該当する用語は見つかりませんでした。</p>';
            paginationContainer.innerHTML = ''; // 該当なしの場合、ボタンも消す
            return;
        }

        termsToRender.forEach(item => {
            glossaryContainer.appendChild(createGlossaryCard(item));
        });

        // ★★★描画が終わった後に、表示件数管理の関数を呼び出す★★★
        manageTermDisplay();
    }

    // --- フィルタリング、検索、ソートを適用するメイン関数 ---
    function applyFiltersAndSort() {
        let filteredData = [...allGlossaryData];

        // 1. カテゴリフィルタ
        const selectedCategory = categoryFilter.value;
        if (selectedCategory !== 'all') {
            filteredData = filteredData.filter(item => item.category === selectedCategory);
        }

        // 2. 検索フィルタ
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredData = filteredData.filter(item =>
                item.term.toLowerCase().includes(searchTerm) ||
                item.explanation.toLowerCase().includes(searchTerm) ||
                (item.usage_example && item.usage_example.toLowerCase().includes(searchTerm)) ||
                (item.page && String(item.page).toLowerCase().includes(searchTerm)) // pageが数値の場合も考慮
            );
        }

        // 3. ソート
        const currentSortOrder = sortOrder.value;
        filteredData.sort((a, b) => {
            switch (currentSortOrder) {
                case 'term-asc':
                    return a.term.localeCompare(b.term, 'ja');
                case 'term-desc':
                    return b.term.localeCompare(a.term, 'ja');
                case 'explanation-len-asc':
                    return a.explanation.length - b.explanation.length;
                case 'explanation-len-desc':
                    return b.explanation.length - a.explanation.length;
                default:
                    return 0;
            }
        });

        renderGlossary(filteredData);
    }

    // --- カテゴリのプルダウンメニューを動的に生成する関数 ---
    function populateCategories(data) {
        categoryFilter.innerHTML = '<option value="all">すべて</option>'; // "すべて"だけ残してクリア
        const categories = new Set(data.map(item => item.category).filter(Boolean));
        const sortedCategories = Array.from(categories).sort((a, b) => a.localeCompare(b, 'ja'));
        
        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // --- JSONファイルを読み込み、全体の処理を開始する非同期関数 ---
    async function loadAndDisplayGlossary(jsonFile) {
        glossaryContainer.innerHTML = '<p class="loading-message">データシステムを起動中... <span class="spinner"></span></p>';
        paginationContainer.innerHTML = ''; // ロード中はボタンを非表示
        allGlossaryData = [];
        searchInput.value = '';
        sortOrder.value = 'term-asc';

        try {
            const response = await fetch(jsonFile);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // データが配列であることを確認（堅牢性向上）
            if (!Array.isArray(data)) {
                throw new Error('Loaded data is not an array.');
            }

            allGlossaryData = data;
            populateCategories(allGlossaryData);
            applyFiltersAndSort();

        } catch (error) {
            console.error('Error loading or processing glossary data:', error);
            glossaryContainer.innerHTML = `<p class="error-message">用語データの読み込みに失敗しました。<br>(${error.message})</p>`;
        }
    }

    // --- イベントリスナーの設定 ---

    // 用語集選択プルダウン
    glossarySelect.addEventListener('change', (event) => {
        currentGlossaryFile = event.target.value;
        loadAndDisplayGlossary(currentGlossaryFile);
    });
    
    // [移行] 表示件数入力
    displayCountInput.addEventListener('change', manageTermDisplay);

    // 各種フィルタとソート
    categoryFilter.addEventListener('change', applyFiltersAndSort);
    sortOrder.addEventListener('change', applyFiltersAndSort);
    searchInput.addEventListener('input', applyFiltersAndSort);

    // --- 初期データの読み込み実行 ---
    loadAndDisplayGlossary(currentGlossaryFile);
});