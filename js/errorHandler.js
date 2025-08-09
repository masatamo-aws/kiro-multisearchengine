/**
 * エラーハンドリングクラス
 * 各種エラーの処理とユーザーフレンドリーなメッセージ表示を管理する
 */
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.retryAttempts = new Map(); // エンジンごとの再試行回数を記録
        this.maxRetries = 3;
    }

    /**
     * ネットワークエラーの処理
     */
    handleNetworkError(error, engine) {
        const errorInfo = {
            type: 'network',
            engine: engine,
            message: error.message,
            timestamp: new Date(),
            userMessage: this.getNetworkErrorMessage(error, engine)
        };

        this.logError(errorInfo);
        return errorInfo;
    }

    /**
     * APIエラーの処理
     */
    handleAPIError(error, engine) {
        const errorInfo = {
            type: 'api',
            engine: engine,
            message: error.message,
            statusCode: error.status || null,
            timestamp: new Date(),
            userMessage: this.getAPIErrorMessage(error, engine)
        };

        this.logError(errorInfo);
        return errorInfo;
    }

    /**
     * 解析エラーの処理
     */
    handleParsingError(error, engine) {
        const errorInfo = {
            type: 'parsing',
            engine: engine,
            message: error.message,
            timestamp: new Date(),
            userMessage: this.getParsingErrorMessage(error, engine)
        };

        this.logError(errorInfo);
        return errorInfo;
    }

    /**
     * CORSエラーの処理
     */
    handleCORSError(error, engine) {
        const errorInfo = {
            type: 'cors',
            engine: engine,
            message: error.message,
            timestamp: new Date(),
            userMessage: this.getCORSErrorMessage(error, engine)
        };

        this.logError(errorInfo);
        return errorInfo;
    }

    /**
     * 検索エンジン固有のエラー処理
     */
    handleEngineError(error, engine) {
        let errorInfo;

        // エラーの種類を判定
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
            errorInfo = this.handleTimeoutError(error, engine);
        } else if (error.message.includes('CORS') || error.name === 'TypeError') {
            errorInfo = this.handleCORSError(error, engine);
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
            errorInfo = this.handleNetworkError(error, engine);
        } else if (error.status) {
            errorInfo = this.handleAPIError(error, engine);
        } else {
            errorInfo = this.handleGeneralError(error, engine);
        }

        // 再試行の判定
        if (this.shouldRetry(engine, errorInfo.type)) {
            errorInfo.shouldRetry = true;
            errorInfo.retryDelay = this.getRetryDelay(engine);
        }

        return errorInfo;
    }

    /**
     * タイムアウトエラーの処理
     */
    handleTimeoutError(error, engine) {
        const errorInfo = {
            type: 'timeout',
            engine: engine,
            message: error.message,
            timestamp: new Date(),
            userMessage: `${this.getEngineDisplayName(engine)}の検索がタイムアウトしました。ネットワーク接続を確認してください。`
        };

        this.logError(errorInfo);
        return errorInfo;
    }

    /**
     * 一般的なエラーの処理
     */
    handleGeneralError(error, engine = null) {
        const errorInfo = {
            type: 'general',
            engine: engine,
            message: error.message || 'Unknown error',
            timestamp: new Date(),
            userMessage: engine ? 
                `${this.getEngineDisplayName(engine)}で予期しないエラーが発生しました。` :
                '予期しないエラーが発生しました。'
        };

        this.logError(errorInfo);
        return errorInfo;
    }

    /**
     * ネットワークエラーメッセージの生成
     */
    getNetworkErrorMessage(error, engine) {
        const engineName = this.getEngineDisplayName(engine);
        
        if (error.message.includes('Failed to fetch')) {
            return `${engineName}に接続できませんでした。インターネット接続を確認してください。`;
        } else if (error.message.includes('timeout')) {
            return `${engineName}への接続がタイムアウトしました。しばらく待ってから再試行してください。`;
        } else {
            return `${engineName}でネットワークエラーが発生しました。`;
        }
    }

    /**
     * APIエラーメッセージの生成
     */
    getAPIErrorMessage(error, engine) {
        const engineName = this.getEngineDisplayName(engine);
        const statusCode = error.status || error.statusCode;
        
        switch (statusCode) {
            case 400:
                return `${engineName}で不正なリクエストエラーが発生しました。検索キーワードを確認してください。`;
            case 401:
                return `${engineName}で認証エラーが発生しました。`;
            case 403:
                return `${engineName}でアクセスが拒否されました。`;
            case 404:
                return `${engineName}で検索サービスが見つかりませんでした。`;
            case 429:
                return `${engineName}でレート制限に達しました。しばらく待ってから再試行してください。`;
            case 500:
                return `${engineName}でサーバーエラーが発生しました。`;
            case 503:
                return `${engineName}のサービスが一時的に利用できません。`;
            default:
                return `${engineName}でAPIエラーが発生しました (${statusCode})。`;
        }
    }

    /**
     * 解析エラーメッセージの生成
     */
    getParsingErrorMessage(error, engine) {
        const engineName = this.getEngineDisplayName(engine);
        return `${engineName}の検索結果の解析中にエラーが発生しました。`;
    }

    /**
     * CORSエラーメッセージの生成
     */
    getCORSErrorMessage(error, engine) {
        const engineName = this.getEngineDisplayName(engine);
        return `${engineName}はブラウザのセキュリティ制限により直接アクセスできません。代替データを表示しています。`;
    }

    /**
     * エンジン表示名の取得
     */
    getEngineDisplayName(engine) {
        const displayNames = {
            google: 'Google',
            bing: 'Bing',
            yahoo: 'Yahoo Japan',
            duckduckgo: 'DuckDuckGo',
            youtube: 'YouTube',
            baidu: 'Baidu'
        };
        
        return displayNames[engine] || engine;
    }

    /**
     * エラーログの記録
     */
    logError(errorInfo) {
        this.errorLog.push(errorInfo);
        
        // ログサイズの制限
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // コンソールにもログ出力
        console.error(`[${errorInfo.engine || 'System'}] ${errorInfo.type}: ${errorInfo.message}`);
    }

    /**
     * 再試行すべきかの判定
     */
    shouldRetry(engine, errorType) {
        const retryableErrors = ['network', 'timeout', 'api'];
        
        if (!retryableErrors.includes(errorType)) {
            return false;
        }

        const currentAttempts = this.retryAttempts.get(engine) || 0;
        return currentAttempts < this.maxRetries;
    }

    /**
     * 再試行回数の記録
     */
    recordRetryAttempt(engine) {
        const currentAttempts = this.retryAttempts.get(engine) || 0;
        this.retryAttempts.set(engine, currentAttempts + 1);
    }

    /**
     * 再試行回数のリセット
     */
    resetRetryAttempts(engine) {
        this.retryAttempts.delete(engine);
    }

    /**
     * 再試行遅延時間の計算
     */
    getRetryDelay(engine) {
        const attempts = this.retryAttempts.get(engine) || 0;
        return Math.min(1000 * Math.pow(2, attempts), 10000); // 指数バックオフ、最大10秒
    }

    /**
     * ユーザーフレンドリーなエラーメッセージの表示
     */
    displayUserFriendlyMessage(errorType, engine, container) {
        const errorInfo = {
            type: errorType,
            engine: engine,
            message: '',
            userMessage: this.getUserFriendlyMessage(errorType, engine)
        };

        if (container) {
            this.renderErrorMessage(container, errorInfo);
        }

        return errorInfo.userMessage;
    }

    /**
     * ユーザーフレンドリーメッセージの生成
     */
    getUserFriendlyMessage(errorType, engine) {
        const engineName = this.getEngineDisplayName(engine);
        
        switch (errorType) {
            case 'network':
                return `${engineName}に接続できませんでした。インターネット接続を確認してください。`;
            case 'timeout':
                return `${engineName}の応答が遅いため、検索を中断しました。`;
            case 'cors':
                return `${engineName}はセキュリティ制限により利用できません。`;
            case 'api':
                return `${engineName}のサービスで問題が発生しています。`;
            case 'parsing':
                return `${engineName}の結果を正しく読み込めませんでした。`;
            default:
                return `${engineName}で問題が発生しました。`;
        }
    }

    /**
     * エラーメッセージのレンダリング
     */
    renderErrorMessage(container, errorInfo) {
        if (!container) return;

        const errorElement = container.querySelector('.error');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.innerHTML = `
                <div class="error-content">
                    <strong>エラー:</strong> ${errorInfo.userMessage}
                    ${errorInfo.shouldRetry ? '<br><small>自動的に再試行します...</small>' : ''}
                </div>
            `;
        }
    }

    /**
     * エラー統計の取得
     */
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            byEngine: {},
            recent: this.errorLog.slice(-10)
        };

        this.errorLog.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            if (error.engine) {
                stats.byEngine[error.engine] = (stats.byEngine[error.engine] || 0) + 1;
            }
        });

        return stats;
    }

    /**
     * エラーログのクリア
     */
    clearErrorLog() {
        this.errorLog = [];
        this.retryAttempts.clear();
    }

    /**
     * 健全性チェック
     */
    performHealthCheck() {
        const stats = this.getErrorStats();
        const recentErrors = stats.recent.length;
        const totalErrors = stats.total;

        return {
            healthy: recentErrors < 5,
            recentErrorCount: recentErrors,
            totalErrorCount: totalErrors,
            mostProblematicEngine: this.getMostProblematicEngine(stats.byEngine),
            recommendations: this.getHealthRecommendations(stats)
        };
    }

    /**
     * 最も問題のあるエンジンを特定
     */
    getMostProblematicEngine(engineStats) {
        let maxErrors = 0;
        let problematicEngine = null;

        for (const [engine, count] of Object.entries(engineStats)) {
            if (count > maxErrors) {
                maxErrors = count;
                problematicEngine = engine;
            }
        }

        return problematicEngine;
    }

    /**
     * 健全性に基づく推奨事項
     */
    getHealthRecommendations(stats) {
        const recommendations = [];

        if (stats.byType.network > 5) {
            recommendations.push('ネットワーク接続を確認してください');
        }

        if (stats.byType.cors > 3) {
            recommendations.push('プロキシサーバーの使用を検討してください');
        }

        if (stats.byType.timeout > 3) {
            recommendations.push('タイムアウト時間の調整を検討してください');
        }

        return recommendations;
    }
}