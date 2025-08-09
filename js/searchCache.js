/**
 * 検索キャッシュクラス
 * 検索結果のローカルキャッシュを管理する
 */
class SearchCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100; // 最大キャッシュサイズ
        this.defaultTTL = 5 * 60 * 1000; // デフォルト有効期限: 5分
        this.cleanupInterval = 60 * 1000; // クリーンアップ間隔: 1分
        
        // 定期的なクリーンアップを開始
        this.startCleanupTimer();
    }

    /**
     * キャッシュキーを生成
     */
    generateCacheKey(engine, query, language) {
        const normalizedQuery = query.toLowerCase().trim();
        return `${engine}:${language}:${normalizedQuery}`;
    }

    /**
     * キャッシュから値を取得
     */
    get(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return null;
        }

        // 有効期限チェック
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // アクセス時間を更新（LRU用）
        entry.lastAccessed = Date.now();
        
        return entry.data;
    }

    /**
     * キャッシュに値を設定
     */
    set(key, data, ttl = null) {
        const expiresAt = Date.now() + (ttl || this.defaultTTL);
        
        const entry = {
            data: data,
            createdAt: Date.now(),
            lastAccessed: Date.now(),
            expiresAt: expiresAt,
            size: this.calculateSize(data)
        };

        // キャッシュサイズ制限チェック
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }

        this.cache.set(key, entry);
        
        console.log(`キャッシュに保存: ${key} (有効期限: ${new Date(expiresAt).toLocaleTimeString()})`);
    }

    /**
     * キャッシュから値を削除
     */
    delete(key) {
        return this.cache.delete(key);
    }

    /**
     * キャッシュをクリア
     */
    clear() {
        this.cache.clear();
        console.log('キャッシュをクリアしました');
    }

    /**
     * キャッシュに存在するかチェック
     */
    has(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            return false;
        }

        // 有効期限チェック
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    /**
     * LRU（Least Recently Used）による削除
     */
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
            console.log(`LRUによりキャッシュから削除: ${oldestKey}`);
        }
    }

    /**
     * 期限切れエントリのクリーンアップ
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`期限切れキャッシュを${cleanedCount}件削除しました`);
        }
    }

    /**
     * 定期クリーンアップタイマーの開始
     */
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.cleanupInterval);
    }

    /**
     * 定期クリーンアップタイマーの停止
     */
    stopCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
    }

    /**
     * データサイズの概算計算
     */
    calculateSize(data) {
        try {
            return JSON.stringify(data).length;
        } catch (error) {
            return 1000; // デフォルトサイズ
        }
    }

    /**
     * キャッシュ統計の取得
     */
    getStats() {
        const now = Date.now();
        let totalSize = 0;
        let expiredCount = 0;
        let validCount = 0;

        for (const [key, entry] of this.cache.entries()) {
            totalSize += entry.size;
            
            if (now > entry.expiresAt) {
                expiredCount++;
            } else {
                validCount++;
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries: validCount,
            expiredEntries: expiredCount,
            totalSize: totalSize,
            maxSize: this.maxSize,
            hitRate: this.calculateHitRate(),
            memoryUsage: this.getMemoryUsage()
        };
    }

    /**
     * ヒット率の計算
     */
    calculateHitRate() {
        // 簡易的な実装（実際のヒット/ミス統計を追跡する場合はより詳細な実装が必要）
        const validEntries = Array.from(this.cache.values()).filter(
            entry => Date.now() <= entry.expiresAt
        ).length;
        
        return this.cache.size > 0 ? (validEntries / this.cache.size) * 100 : 0;
    }

    /**
     * メモリ使用量の取得
     */
    getMemoryUsage() {
        let totalMemory = 0;
        
        for (const entry of this.cache.values()) {
            totalMemory += entry.size;
        }
        
        return {
            used: totalMemory,
            percentage: this.maxSize > 0 ? (this.cache.size / this.maxSize) * 100 : 0
        };
    }

    /**
     * キャッシュ設定の更新
     */
    updateSettings(settings) {
        if (settings.maxSize && settings.maxSize > 0) {
            this.maxSize = settings.maxSize;
        }
        
        if (settings.defaultTTL && settings.defaultTTL > 0) {
            this.defaultTTL = settings.defaultTTL;
        }
        
        if (settings.cleanupInterval && settings.cleanupInterval > 0) {
            this.cleanupInterval = settings.cleanupInterval;
            
            // タイマーを再設定
            this.stopCleanupTimer();
            this.startCleanupTimer();
        }
    }

    /**
     * 特定のエンジンのキャッシュを削除
     */
    clearEngine(engine) {
        let deletedCount = 0;
        
        for (const key of this.cache.keys()) {
            if (key.startsWith(`${engine}:`)) {
                this.cache.delete(key);
                deletedCount++;
            }
        }
        
        console.log(`${engine}のキャッシュを${deletedCount}件削除しました`);
        return deletedCount;
    }

    /**
     * 特定の言語のキャッシュを削除
     */
    clearLanguage(language) {
        let deletedCount = 0;
        
        for (const key of this.cache.keys()) {
            const parts = key.split(':');
            if (parts.length >= 2 && parts[1] === language) {
                this.cache.delete(key);
                deletedCount++;
            }
        }
        
        console.log(`言語${language}のキャッシュを${deletedCount}件削除しました`);
        return deletedCount;
    }

    /**
     * キャッシュの内容をエクスポート
     */
    export() {
        const exportData = {
            timestamp: Date.now(),
            entries: []
        };

        for (const [key, entry] of this.cache.entries()) {
            // 有効なエントリのみエクスポート
            if (Date.now() <= entry.expiresAt) {
                exportData.entries.push({
                    key: key,
                    data: entry.data,
                    createdAt: entry.createdAt,
                    expiresAt: entry.expiresAt
                });
            }
        }

        return exportData;
    }

    /**
     * キャッシュの内容をインポート
     */
    import(exportData) {
        if (!exportData || !exportData.entries) {
            throw new Error('無効なインポートデータです');
        }

        let importedCount = 0;
        const now = Date.now();

        exportData.entries.forEach(entryData => {
            // 有効期限チェック
            if (now <= entryData.expiresAt) {
                const entry = {
                    data: entryData.data,
                    createdAt: entryData.createdAt,
                    lastAccessed: now,
                    expiresAt: entryData.expiresAt,
                    size: this.calculateSize(entryData.data)
                };

                this.cache.set(entryData.key, entry);
                importedCount++;
            }
        });

        console.log(`${importedCount}件のキャッシュエントリをインポートしました`);
        return importedCount;
    }

    /**
     * リソースのクリーンアップ
     */
    destroy() {
        this.stopCleanupTimer();
        this.clear();
        console.log('SearchCacheのリソースをクリーンアップしました');
    }
}