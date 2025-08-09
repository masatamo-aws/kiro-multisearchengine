/**
 * メインアプリケーションクラス
 * マルチサーチエンジンアプリケーションの中心的な制御を行う
 */
class MultiSearchApp {
    constructor() {
        this.searchManager = null;
        this.uiManager = null;
        this.languageManager = null;
        this.errorHandler = null;
        this.currentQuery = '';
        this.currentLanguage = 'ja';
    }

    /**
     * アプリケーションの初期化
     */
    init() {
        // 各マネージャーの初期化
        this.languageManager = new LanguageManager();
        this.themeManager = new ThemeManager();
        this.errorHandler = new ErrorHandler();
        this.uiManager = new UIManager();
        this.searchManager = new SearchManager(this.errorHandler);

        // テーマシステムの初期化
        this.themeManager.initializeTheme();
        this.themeManager.setupThemeSelector();
        this.themeManager.enhanceAccessibility();

        // UIの初期化
        this.uiManager.init();
        
        // グローバル参照を設定（UIManagerがSearchManagerを参照できるように）
        window.uiManager = this.uiManager;
        window.themeManager = this.themeManager;
        
        // イベントリスナーの設定
        this.setupEventListeners();
        
        console.log('マルチサーチエンジンアプリケーションが初期化されました');
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        const searchButton = document.getElementById('searchButton');
        const clearButton = document.getElementById('clearButton');
        const searchQuery = document.getElementById('searchQuery');
        const languageSelect = document.getElementById('language');

        // 検索ボタンのクリックイベント
        searchButton.addEventListener('click', () => {
            this.handleSearch();
        });

        // Enterキーでの検索
        searchQuery.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // クリアボタンのクリックイベント
        clearButton.addEventListener('click', () => {
            this.handleClear();
        });

        // 言語変更イベント
        languageSelect.addEventListener('change', (e) => {
            this.handleLanguageChange(e.target.value);
        });
    }

    /**
     * 検索処理の実行
     */
    async handleSearch() {
        const query = document.getElementById('searchQuery').value.trim();
        
        if (!query) {
            alert('検索キーワードを入力してください');
            return;
        }

        this.currentQuery = query;
        
        // 前回の結果をクリア
        this.uiManager.clearResults();
        
        // ローディング表示
        this.uiManager.showAllLoading();
        
        // 検索フォームの状態を更新
        this.uiManager.updateSearchFormState(true);

        try {
            // 検索実行
            const results = await this.searchManager.searchAll(query, this.currentLanguage);
            console.log('検索完了:', results);
        } catch (error) {
            console.error('検索エラー:', error);
            this.errorHandler.handleGeneralError(error);
        } finally {
            // 検索フォームの状態を元に戻す
            this.uiManager.updateSearchFormState(false);
        }
    }

    /**
     * 結果のクリア処理
     */
    handleClear() {
        document.getElementById('searchQuery').value = '';
        this.uiManager.clearResults();
        this.currentQuery = '';
    }

    /**
     * 言語変更処理
     */
    async handleLanguageChange(newLanguage) {
        this.currentLanguage = newLanguage;
        
        // 現在の検索クエリがある場合は再検索
        if (this.currentQuery) {
            await this.handleSearch();
        }
    }

    /**
     * 検索結果の表示
     */
    displayResults(results) {
        this.uiManager.displayResults(results);
    }

    /**
     * エラーの処理
     */
    handleError(error, engine) {
        this.errorHandler.handleEngineError(error, engine);
        this.uiManager.displayError(engine, error.message);
    }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', () => {
    const app = new MultiSearchApp();
    app.init();
    
    // グローバルに参照を保持（デバッグ用）
    window.multiSearchApp = app;
    
    // パフォーマンス監視
    if (window.performance && window.performance.mark) {
        window.performance.mark('app-initialized');
    }
    
    console.log('マルチサーチエンジンアプリケーションが正常に起動しました');
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', () => {
    if (window.multiSearchApp) {
        window.multiSearchApp.searchManager.cleanup();
    }
});