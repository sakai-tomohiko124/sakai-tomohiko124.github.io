
document.addEventListener('DOMContentLoaded', () => {
    const glossaryContainer = document.getElementById('glossary-container');
    const glossarySelect = document.getElementById('glossarySelect'); // 追加: 用語集選択プルダウン
    const categoryFilter = document.getElementById('categoryFilter');
    const sortOrder = document.getElementById('sortOrder');
    const searchInput = document.getElementById('searchInput');

    let allGlossaryData = []; // 元の全データを保持する配列
    let currentGlossaryFile = glossarySelect.value; // 現在選択されている用語集ファイル

    // 用語をWebページにレンダリングする関数
    function renderGlossary(termsToRender) {
        glossaryContainer.innerHTML = ''; // 既存の用語をクリア

        if (termsToRender.length === 0) {
            glossaryContainer.innerHTML = '<p class="loading-message">該当する用語は見つかりませんでした。</p>';
            return;
        }

        termsToRender.forEach(item => {
            const glossaryItemDiv = document.createElement('div');
            glossaryItemDiv.classList.add('glossary-item');

            // ページ番号を追加
            if (item.page) { // pageフィールドが存在する場合のみ表示
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

            // 使用例を追加 (コードブロックとして表示)
            if (item.usage_example) { // usage_exampleフィールドが存在する場合のみ表示
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

            glossaryContainer.appendChild(glossaryItemDiv);
        });
    }

    // フィルタリングと並べ替えを適用し、表示を更新する関数
    function applyFiltersAndSort() {
        let filteredData = [...allGlossaryData]; // 全データのコピーから始める

        // 1. カテゴリで絞り込み
        const selectedCategory = categoryFilter.value;
        if (selectedCategory !== 'all') {
            filteredData = filteredData.filter(item => item.category === selectedCategory);
        }

        // 2. キーワードで絞り込み
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filteredData = filteredData.filter(item =>
                item.term.toLowerCase().includes(searchTerm) ||
                item.explanation.toLowerCase().includes(searchTerm) ||
                (item.usage_example && item.usage_example.toLowerCase().includes(searchTerm)) || // 使用例も検索対象に追加
                (item.page && item.page.toLowerCase().includes(searchTerm)) // ページ番号も検索対象に追加
            );
        }

        // 3. 並べ替え
        const currentSortOrder = sortOrder.value;
        filteredData.sort((a, b) => {
            if (currentSortOrder === 'term-asc') {
                return a.term.localeCompare(b.term, 'ja', { sensitivity: 'base' });
            } else if (currentSortOrder === 'term-desc') {
                return b.term.localeCompare(a.term, 'ja', { sensitivity: 'base' });
            } else if (currentSortOrder === 'explanation-len-asc') {
                return a.explanation.length - b.explanation.length;
            } else if (currentSortOrder === 'explanation-len-desc') {
                return b.explanation.length - a.explanation.length;
            }
            return 0; // デフォルトは何もしない
        });

        renderGlossary(filteredData);
    }

    // カテゴリフィルタのオプションを動的に追加する関数
    function populateCategories(data) {
        // 既存のカテゴリオプションをクリア（"すべて"以外）
        categoryFilter.querySelectorAll('option:not([value="all"])').forEach(option => option.remove());

        // 'category'フィールドがないアイテムは除外するか、未分類として扱う
        const categories = new Set(data.map(item => item.category).filter(Boolean)); // null/undefined/空文字列を除外
        // カテゴリ名を50音順にソート
        const sortedCategories = Array.from(categories).sort((a, b) => a.localeCompare(b, 'ja', { sensitivity: 'base' }));

        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
        categoryFilter.value = 'all'; // フィルタをリセット
    }

    // 用語データを選択に応じてインライン配列から取得
    function loadAndDisplayGlossary(jsonFile) {
      glossaryContainer.innerHTML = '<p class="loading-message">データシステムを起動中... <span class="spinner"></span></p>';
      allGlossaryData = [];
      searchInput.value = '';
      sortOrder.value = 'term-asc';
      let data = [];
      if (jsonFile === 'textbook_terms.json' && typeof textbookTermsData !== 'undefined') {
        data = textbookTermsData;
      } else if (jsonFile === 'html_elements.json' && typeof html_elements !== 'undefined') {
        data = html_elements;
      } else if (jsonFile === 'other_glossary.json' && typeof other_glossary !== 'undefined') {
        data = other_glossary;
      } else if (jsonFile === 'ExcelVBA.json' && typeof ExcelVBA !== 'undefined') {
        data = ExcelVBA;
      } else if (jsonFile === 'sql_glossary.json' && typeof sql_glossary !== 'undefined') {
        data = sql_glossary;
      } else {
        glossaryContainer.innerHTML = '<p class="error-message">用語データが見つかりません。配列名や定義を確認してください。</p>';
        return;
      }
      const loadingMessage = glossaryContainer.querySelector('.loading-message');
      if (loadingMessage) loadingMessage.remove();
      allGlossaryData = data;
      populateCategories(allGlossaryData);
      applyFiltersAndSort();
    }

    // 初期データの読み込み (ページロード時)
    loadAndDisplayGlossary(currentGlossaryFile);

    // 用語集選択プルダウンのイベントリスナー
    glossarySelect.addEventListener('change', (event) => {
        currentGlossaryFile = event.target.value;
        loadAndDisplayGlossary(currentGlossaryFile);
    });

    // フィルタとソートのイベントリスナー
    categoryFilter.addEventListener('change', applyFiltersAndSort);
    sortOrder.addEventListener('change', applyFiltersAndSort);
    searchInput.addEventListener('input', applyFiltersAndSort); // キー入力ごとにリアルタイム検索
});