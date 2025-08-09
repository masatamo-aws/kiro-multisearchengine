/**
 * UI管理クラス
 * ユーザーインターフェースの描画と更新を管理する
 */
class UIManager {
    constructor() {
        this.engines = ['google', 'bing', 'yahoo', 'duckduckgo', 'youtube', 'baidu'];
        this.engineNames = {
            google: 'Google',
            bing: 'Bing',
            yahoo: 'Yahoo Japan',
            duckduckgo: 'DuckDuckGo',
            youtube: 'YouTube',
            baidu: 'Baidu'
        };
    }

    /**
     * UIの初期化
     */
    init() {
        this.renderLanguageSelector();
        this.renderResultsContainer();
        console.log('UIManager が初期化されました');
    }

    /**
     * 言語選択ドロップダウンのレンダリング
     */
    renderLanguageSelector() {
        const languageSelect = document.getElementById('language');
        if (!languageSelect) return;

        // 既存のオプションをクリア
        languageSelect.innerHTML = '';

        const languageManager = new LanguageManager();
        const supportedLanguages = languageManager.getSupportedLanguages();

        supportedLanguages.forEach(language => {
            const option = document.createElement('option');
            option.value = language.code;
            option.textContent = language.nativeName;
            languageSelect.appendChild(option);
        });

        // デフォルト言語を設定
        languageSelect.value = 'ja';
    }

    /**
     * 検索フォームのレンダリング（既にHTMLに存在するため、イベント設定のみ）
     */
    renderSearchForm() {
        const searchQuery = document.getElementById('searchQuery');
        const searchButton = document.getElementById('searchButton');
        const clearButton = document.getElementById('clearButton');

        if (searchQuery) {
            searchQuery.placeholder = '検索キーワードを入力してください';
        }

        if (searchButton) {
            searchButton.textContent = '検索';
        }

        if (clearButton) {
            clearButton.textContent = 'クリア';
        }
    }

    /**
     * 結果コンテナのレンダリング
     */
    renderResultsContainer() {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;

        // 各検索エンジンの結果コンテナが正しく設定されているか確認
        this.engines.forEach(engine => {
            const container = document.getElementById(`${engine}Results`);
            if (container) {
                const header = container.querySelector('h3');
                if (header) {
                    header.textContent = this.engineNames[engine];
                }
            }
        });
    }

    /**
     * 特定の検索エンジンのローディング表示
     */
    showLoading(engine) {
        const container = document.getElementById(`${engine}Results`);
        if (!container) return;

        const loadingElement = container.querySelector('.loading');
        const errorElement = container.querySelector('.error');
        const resultsElement = container.querySelector('.results');

        if (loadingElement) {
            loadingElement.style.display = 'block';
            loadingElement.textContent = '検索中...';
        }

        if (errorElement) {
            errorElement.style.display = 'none';
        }

        if (resultsElement) {
            resultsElement.innerHTML = '';
        }
    }

    /**
     * 特定の検索エンジンのローディング非表示
     */
    hideLoading(engine) {
        const container = document.getElementById(`${engine}Results`);
        if (!container) return;

        const loadingElement = container.querySelector('.loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * すべての検索エンジンのローディング表示
     */
    showAllLoading() {
        this.engines.forEach(engine => {
            this.showLoading(engine);
        });
    }

    /**
     * すべての検索エンジンのローディング非表示
     */
    hideAllLoading() {
        this.engines.forEach(engine => {
            this.hideLoading(engine);
        });
    }

    /**
     * 検索結果の表示
     */
    displayResults(engine, results) {
        const container = document.getElementById(`${engine}Results`);
        if (!container) return;

        this.hideLoading(engine);

        const resultsElement = container.querySelector('.results');
        const errorElement = container.querySelector('.error');

        if (errorElement) {
            errorElement.style.display = 'none';
        }

        if (!resultsElement) return;

        if (!results || !results.results || results.results.length === 0) {
            resultsElement.innerHTML = '<p class="no-results">検索結果が見つかりませんでした</p>';
            return;
        }

        // 結果の表示
        let html = '';
        
        // メタ情報の表示
        if (results.totalResults || results.responseTime) {
            html += '<div class="result-meta">';
            if (results.totalResults) {
                html += `約 ${results.totalResults.toLocaleString()} 件の結果`;
            }
            if (results.responseTime) {
                html += ` (${results.responseTime}ms)`;
            }
            html += '</div>';
        }

        // 各結果項目の表示
        results.results.forEach((result, index) => {
            html += this.renderResultItem(result, index, engine);
        });

        resultsElement.innerHTML = html;
    }

    /**
     * 個別の結果項目をレンダリング
     */
    renderResultItem(result, index, engine) {
        const title = this.escapeHtml(result.title || '');
        const url = result.url || '#';
        const snippet = this.escapeHtml(result.snippet || '');
        const displayUrl = this.escapeHtml(result.displayUrl || url);

        let html = '<div class="result-item">';
        
        // タイトル
        html += '<div class="result-title">';
        html += `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`;
        html += '</div>';
        
        // URL
        html += `<div class="result-url">${displayUrl}</div>`;
        
        // スニペット
        if (snippet) {
            html += `<div class="result-snippet">${snippet}</div>`;
        }

        // YouTube用の特別な表示
        if (engine === 'youtube' && result.thumbnail) {
            html += `<div class="result-thumbnail">`;
            html += `<img src="${result.thumbnail}" alt="動画サムネイル" style="max-width: 120px; height: auto;">`;
            html += `</div>`;
        }

        html += '</div>';
        
        return html;
    }

    /**
     * エラーメッセージの表示
     */
    displayError(engine, errorMessage) {
        const container = document.getElementById(`${engine}Results`);
        if (!container) return;

        this.hideLoading(engine);

        const errorElement = container.querySelector('.error');
        const resultsElement = container.querySelector('.results');

        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = errorMessage || `${this.engineNames[engine]} で検索エラーが発生しました`;
        }

        if (resultsElement) {
            resultsElement.innerHTML = '';
        }
    }

    /**
     * すべての結果をクリア
     */
    clearResults() {
        this.engines.forEach(engine => {
            const container = document.getElementById(`${engine}Results`);
            if (!container) return;

            const loadingElement = container.querySelector('.loading');
            const errorElement = container.querySelector('.error');
            const resultsElement = container.querySelector('.results');

            if (loadingElement) {
                loadingElement.style.display = 'none';
            }

            if (errorElement) {
                errorElement.style.display = 'none';
            }

            if (resultsElement) {
                resultsElement.innerHTML = '';
            }

            // ヘッダーリンクもクリア
            const header = container.querySelector('h3');
            if (header) {
                const existingLink = header.querySelector('.engine-direct-link');
                if (existingLink) {
                    existingLink.remove();
                }
            }
        });
    }

    /**
     * 検索結果の統計情報を更新
     */
    updateResultStats(engine, stats) {
        const container = document.getElementById(`${engine}Results`);
        if (!container) return;

        const header = container.querySelector('h3');
        if (header && stats) {
            let headerText = this.engineNames[engine];
            if (stats.count !== undefined) {
                headerText += ` (${stats.count}件)`;
            }
            if (stats.responseTime !== undefined) {
                headerText += ` - ${stats.responseTime}ms`;
            }
            header.textContent = headerText;
        }
    }

    /**
     * HTMLエスケープ処理
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 検索フォームの状態を更新
     */
    updateSearchFormState(isSearching) {
        const searchButton = document.getElementById('searchButton');
        const searchQuery = document.getElementById('searchQuery');
        const languageSelect = document.getElementById('language');

        if (searchButton) {
            searchButton.disabled = isSearching;
            searchButton.textContent = isSearching ? '検索中...' : '検索';
        }

        if (searchQuery) {
            searchQuery.disabled = isSearching;
        }

        if (languageSelect) {
            languageSelect.disabled = isSearching;
        }
    }

    /**
     * レスポンシブレイアウトの調整
     */
    adjustResponsiveLayout() {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;

        const screenWidth = window.innerWidth;
        
        if (screenWidth <= 768) {
            resultsSection.style.gridTemplateColumns = '1fr';
        } else if (screenWidth <= 1024) {
            resultsSection.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            resultsSection.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
        }
    }

    /**
     * 検索エンジンの直接リンクを生成
     */
    generateSearchEngineLink(engine, query, language) {
        if (!query || !window.multiSearchApp || !window.multiSearchApp.searchManager) {
            return '#';
        }

        try {
            const adapter = window.multiSearchApp.searchManager.adapters[engine];
            if (adapter && adapter.getDirectSearchUrl) {
                return adapter.getDirectSearchUrl(query, language);
            }
        } catch (error) {
            console.error(`${engine}のリンク生成エラー:`, error);
        }

        return '#';
    }

    /**
     * エンジンヘッダーのリンクを更新
     */
    updateEngineHeaders(query, language) {
        this.engines.forEach(engine => {
            const container = document.getElementById(`${engine}Results`);
            if (!container) return;

            const header = container.querySelector('h3');
            if (!header) return;

            // 既存のリンクを削除
            const existingLink = header.querySelector('.engine-direct-link');
            if (existingLink) {
                existingLink.remove();
            }

            // 新しいリンクを追加
            if (query) {
                const directUrl = this.generateSearchEngineLink(engine, query, language);
                if (directUrl !== '#') {
                    const linkElement = document.createElement('a');
                    linkElement.href = directUrl;
                    linkElement.target = '_blank';
                    linkElement.rel = 'noopener noreferrer';
                    linkElement.className = 'engine-direct-link';
                    linkElement.innerHTML = ' <span class="link-icon">🔗</span>';
                    linkElement.title = `${this.engineNames[engine]}で直接検索`;
                    linkElement.setAttribute('aria-label', `${this.engineNames[engine]}で直接検索（新しいタブで開く）`);
                    
                    header.appendChild(linkElement);
                }
            }
        });
    }

    /**
     * アクセシビリティの向上
     */
    enhanceAccessibility() {
        // ARIA属性の設定
        const searchQuery = document.getElementById('searchQuery');
        if (searchQuery) {
            searchQuery.setAttribute('aria-label', '検索キーワード入力');
        }

        const languageSelect = document.getElementById('language');
        if (languageSelect) {
            languageSelect.setAttribute('aria-label', '検索言語選択');
        }

        // 結果セクションにARIA属性を追加
        this.engines.forEach(engine => {
            const container = document.getElementById(`${engine}Results`);
            if (container) {
                container.setAttribute('aria-label', `${this.engineNames[engine]}の検索結果`);
                container.setAttribute('role', 'region');
            }
        });
    }
}

// ウィンドウリサイズ時のレスポンシブ調整
window.addEventListener('resize', () => {
    if (window.uiManager) {
        window.uiManager.adjustResponsiveLayout();
    }
});

// DOMContentLoaded時のアクセシビリティ向上
document.addEventListener('DOMContentLoaded', () => {
    if (window.uiManager) {
        window.uiManager.enhanceAccessibility();
    }
});