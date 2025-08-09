/**
 * 検索マネージャークラス
 * 複数の検索エンジンを統合管理し、並列検索を実行する
 */
class SearchManager {
    constructor(errorHandler) {
        this.errorHandler = errorHandler || new ErrorHandler();
        this.adapters = this.initializeAdapters();
        this.activeSearches = new Map();
        this.searchHistory = [];
        this.maxHistorySize = 50;
        this.cache = new SearchCache();
    }

    /**
     * 検索アダプターの初期化
     */
    initializeAdapters() {
        return {
            google: new GoogleSearchAdapter(),
            bing: new BingSearchAdapter(),
            yahoo: new YahooSearchAdapter(),
            duckduckgo: new DuckDuckGoSearchAdapter(),
            youtube: new YouTubeSearchAdapter(),
            baidu: new BaiduSearchAdapter()
        };
    }

    /**
     * すべての検索エンジンで並列検索を実行
     */
    async searchAll(query, language = 'ja') {
        if (!query || query.trim() === '') {
            throw new Error('検索クエリが空です');
        }

        const searchId = this.generateSearchId();
        const startTime = Date.now();
        
        console.log(`検索開始: "${query}" (言語: ${language}, ID: ${searchId})`);

        // アクティブな検索として記録
        this.activeSearches.set(searchId, {
            query: query,
            language: language,
            startTime: startTime,
            status: 'running'
        });

        // UIヘッダーのリンクを更新
        if (window.multiSearchApp && window.multiSearchApp.uiManager) {
            window.multiSearchApp.uiManager.updateEngineHeaders(query, language);
        }

        try {
            // 各検索エンジンで並列検索を実行
            const searchPromises = Object.keys(this.adapters).map(engine => 
                this.searchEngineWithErrorHandling(engine, query, language, searchId)
            );

            // Promise.allSettledを使用してすべての結果を待つ
            const results = await Promise.allSettled(searchPromises);
            
            const totalTime = Date.now() - startTime;
            
            // 結果を処理
            const processedResults = this.processSearchResults(results, query, language, totalTime);
            
            // 検索履歴に追加
            this.addToHistory(query, language, processedResults, totalTime);
            
            // アクティブな検索から削除
            this.activeSearches.delete(searchId);
            
            console.log(`検索完了: ${totalTime}ms`);
            
            return processedResults;

        } catch (error) {
            this.activeSearches.delete(searchId);
            console.error('検索エラー:', error);
            throw error;
        }
    }

    /**
     * 特定の検索エンジンで検索を実行（エラーハンドリング付き）
     */
    async searchEngineWithErrorHandling(engine, query, language, searchId) {
        const adapter = this.adapters[engine];
        if (!adapter) {
            throw new Error(`未知の検索エンジン: ${engine}`);
        }

        try {
            // キャッシュチェック
            const cacheKey = this.cache.generateCacheKey(engine, query, language);
            const cachedResult = this.cache.get(cacheKey);
            
            if (cachedResult) {
                console.log(`${engine}のキャッシュされた結果を使用`);
                this.displayEngineResults(engine, cachedResult);
                return {
                    engine: engine,
                    status: 'fulfilled',
                    value: cachedResult
                };
            }

            // レート制限チェック
            if (adapter.checkRateLimit && !adapter.checkRateLimit()) {
                throw new Error('レート制限に達しました');
            }

            // 可用性チェック
            if (adapter.isAvailable && !adapter.isAvailable()) {
                throw new Error('検索エンジンが利用できません');
            }

            const result = await adapter.search(query, language);
            
            // 結果をキャッシュに保存
            this.cache.set(cacheKey, result);
            
            // 成功時は再試行回数をリセット
            this.errorHandler.resetRetryAttempts(engine);
            
            // UIに結果を表示
            this.displayEngineResults(engine, result);
            
            return {
                engine: engine,
                status: 'fulfilled',
                value: result
            };

        } catch (error) {
            console.error(`${engine}検索エラー:`, error);
            
            // エラーハンドリング
            const errorInfo = this.errorHandler.handleEngineError(error, engine);
            
            // UIにエラーを表示
            this.displayEngineError(engine, errorInfo);
            
            // 再試行の判定
            if (errorInfo.shouldRetry) {
                return this.retrySearch(engine, query, language, errorInfo.retryDelay);
            }
            
            return {
                engine: engine,
                status: 'rejected',
                reason: errorInfo
            };
        }
    }

    /**
     * 検索の再試行
     */
    async retrySearch(engine, query, language, delay) {
        console.log(`${engine}の検索を${delay}ms後に再試行します`);
        
        // 再試行回数を記録
        this.errorHandler.recordRetryAttempt(engine);
        
        // 遅延実行
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // 再試行
        return this.searchEngineWithErrorHandling(engine, query, language, null);
    }

    /**
     * 検索結果の処理
     */
    processSearchResults(results, query, language, totalTime) {
        const processedResults = {
            query: query,
            language: language,
            totalTime: totalTime,
            timestamp: new Date(),
            engines: {},
            summary: {
                total: results.length,
                successful: 0,
                failed: 0,
                totalResults: 0
            }
        };

        results.forEach(result => {
            const engine = result.engine || (result.value && result.value.engine);
            
            if (result.status === 'fulfilled' && result.value) {
                processedResults.engines[engine] = {
                    status: 'success',
                    data: result.value,
                    resultCount: result.value.results ? result.value.results.length : 0,
                    responseTime: result.value.responseTime || 0
                };
                
                processedResults.summary.successful++;
                processedResults.summary.totalResults += result.value.results ? result.value.results.length : 0;
                
            } else {
                processedResults.engines[engine] = {
                    status: 'error',
                    error: result.reason || result.error,
                    resultCount: 0,
                    responseTime: 0
                };
                
                processedResults.summary.failed++;
            }
        });

        return processedResults;
    }

    /**
     * 特定の検索エンジンで検索を実行
     */
    async searchEngine(engine, query, language = 'ja') {
        const adapter = this.adapters[engine];
        if (!adapter) {
            throw new Error(`未知の検索エンジン: ${engine}`);
        }

        try {
            const result = await adapter.search(query, language);
            return this.formatResults(result, engine);
        } catch (error) {
            const errorInfo = this.errorHandler.handleEngineError(error, engine);
            throw errorInfo;
        }
    }

    /**
     * 結果のフォーマット
     */
    formatResults(rawResults, engine) {
        const adapter = this.adapters[engine];
        
        if (adapter.formatResults) {
            return adapter.formatResults(rawResults);
        }
        
        return rawResults;
    }

    /**
     * 検索エンジンの結果をUIに表示
     */
    displayEngineResults(engine, results) {
        if (window.multiSearchApp && window.multiSearchApp.uiManager) {
            window.multiSearchApp.uiManager.displayResults(engine, results);
        }
    }

    /**
     * 検索エンジンのエラーをUIに表示
     */
    displayEngineError(engine, errorInfo) {
        if (window.multiSearchApp && window.multiSearchApp.uiManager) {
            window.multiSearchApp.uiManager.displayError(engine, errorInfo.userMessage);
        }
    }

    /**
     * 検索IDの生成
     */
    generateSearchId() {
        return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 検索履歴への追加
     */
    addToHistory(query, language, results, totalTime) {
        const historyEntry = {
            query: query,
            language: language,
            timestamp: new Date(),
            totalTime: totalTime,
            successfulEngines: Object.keys(results.engines).filter(
                engine => results.engines[engine].status === 'success'
            ).length,
            totalResults: results.summary.totalResults
        };

        this.searchHistory.unshift(historyEntry);
        
        // 履歴サイズの制限
        if (this.searchHistory.length > this.maxHistorySize) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
        }
    }

    /**
     * 検索履歴の取得
     */
    getSearchHistory() {
        return this.searchHistory;
    }

    /**
     * アクティブな検索の取得
     */
    getActiveSearches() {
        return Array.from(this.activeSearches.values());
    }

    /**
     * 検索のキャンセル
     */
    cancelSearch(searchId) {
        if (this.activeSearches.has(searchId)) {
            this.activeSearches.delete(searchId);
            console.log(`検索をキャンセルしました: ${searchId}`);
            return true;
        }
        return false;
    }

    /**
     * すべてのアクティブな検索をキャンセル
     */
    cancelAllSearches() {
        const cancelledCount = this.activeSearches.size;
        this.activeSearches.clear();
        console.log(`${cancelledCount}件の検索をキャンセルしました`);
        return cancelledCount;
    }

    /**
     * 検索統計の取得
     */
    getSearchStats() {
        const stats = {
            totalSearches: this.searchHistory.length,
            averageResponseTime: 0,
            engineStats: {},
            languageStats: {},
            recentSearches: this.searchHistory.slice(0, 10)
        };

        if (this.searchHistory.length > 0) {
            // 平均応答時間の計算
            const totalTime = this.searchHistory.reduce((sum, entry) => sum + entry.totalTime, 0);
            stats.averageResponseTime = Math.round(totalTime / this.searchHistory.length);

            // エンジン別統計
            Object.keys(this.adapters).forEach(engine => {
                stats.engineStats[engine] = {
                    successCount: 0,
                    totalAttempts: 0,
                    averageResponseTime: 0
                };
            });

            // 言語別統計
            this.searchHistory.forEach(entry => {
                stats.languageStats[entry.language] = (stats.languageStats[entry.language] || 0) + 1;
            });
        }

        return stats;
    }

    /**
     * 検索エンジンの健全性チェック
     */
    async performHealthCheck() {
        const healthResults = {};
        
        for (const [engine, adapter] of Object.entries(this.adapters)) {
            try {
                const isAvailable = adapter.isAvailable ? adapter.isAvailable() : true;
                const canCheckRateLimit = adapter.checkRateLimit ? adapter.checkRateLimit() : true;
                
                healthResults[engine] = {
                    available: isAvailable,
                    rateLimitOk: canCheckRateLimit,
                    status: isAvailable && canCheckRateLimit ? 'healthy' : 'unhealthy'
                };
                
            } catch (error) {
                healthResults[engine] = {
                    available: false,
                    rateLimitOk: false,
                    status: 'error',
                    error: error.message
                };
            }
        }

        return healthResults;
    }

    /**
     * 設定の更新
     */
    updateSettings(settings) {
        if (settings.maxHistorySize) {
            this.maxHistorySize = settings.maxHistorySize;
        }
        
        // アダプター固有の設定更新
        Object.keys(this.adapters).forEach(engine => {
            if (settings[engine] && this.adapters[engine].updateSettings) {
                this.adapters[engine].updateSettings(settings[engine]);
            }
        });
    }

    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        this.cancelAllSearches();
        this.searchHistory = [];
        this.errorHandler.clearErrorLog();
        if (this.cache) {
            this.cache.destroy();
        }
        console.log('SearchManagerのリソースをクリーンアップしました');
    }
}