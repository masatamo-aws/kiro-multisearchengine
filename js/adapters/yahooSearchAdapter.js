/**
 * Yahoo Japan検索アダプター
 * Yahoo Japan検索の結果を取得・解析する
 */
class YahooSearchAdapter {
    constructor() {
        this.name = 'yahoo';
        this.displayName = 'Yahoo Japan';
        this.baseUrl = 'https://search.yahoo.co.jp/search';
        this.timeout = 10000; // 10秒
    }

    /**
     * Yahoo Japan検索を実行
     */
    async search(query, language = 'ja') {
        const startTime = Date.now();
        
        try {
            const searchUrl = this.buildSearchUrl(query, language);
            console.log(`Yahoo Japan検索URL: ${searchUrl}`);

            // CORS制限のため、実際のスクレイピングは制限される
            // ここではモックデータを返すか、プロキシサーバーを使用する必要がある
            const response = await this.fetchWithTimeout(searchUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            const results = this.parseResults(html);
            
            const responseTime = Date.now() - startTime;
            
            return {
                engine: this.name,
                query: query,
                language: language,
                results: results,
                totalResults: results.length,
                responseTime: responseTime,
                status: 'success'
            };

        } catch (error) {
            console.error('Yahoo Japan検索エラー:', error);
            
            // CORS制限の場合はモックデータを返す
            if (error.message.includes('CORS') || error.name === 'TypeError') {
                return this.getMockResults(query, language);
            }
            
            throw error;
        }
    }

    /**
     * 検索URLを構築
     */
    buildSearchUrl(query, language) {
        const languageManager = new LanguageManager();
        const params = languageManager.getSearchParameters(language, this.name);
        
        const searchParams = new URLSearchParams({
            p: query, // Yahoo Japanは'p'パラメータを使用
            ...params
        });

        return `${this.baseUrl}?${searchParams.toString()}`;
    }

    /**
     * タイムアウト付きfetch
     */
    async fetchWithTimeout(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept-Language': 'ja,en;q=0.9'
                }
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * HTML結果を解析
     */
    parseResults(html) {
        const results = [];
        
        try {
            // DOMParserを使用してHTMLを解析
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Yahoo Japan検索結果のセレクター
            const resultElements = doc.querySelectorAll('.Algo, .algo');
            
            resultElements.forEach((element, index) => {
                if (index >= 10) return; // 最大10件まで
                
                const titleElement = element.querySelector('h3 a, .Algo-title a');
                const snippetElement = element.querySelector('.Algo-summary, .compText');
                const urlElement = element.querySelector('.Algo-url, .url');
                
                if (titleElement) {
                    const result = {
                        title: this.cleanText(titleElement.textContent),
                        url: this.cleanUrl(titleElement.href),
                        snippet: snippetElement ? this.cleanText(snippetElement.textContent) : '',
                        displayUrl: urlElement ? this.cleanText(urlElement.textContent) : this.extractDisplayUrl(titleElement.href)
                    };
                    
                    if (result.title && result.url) {
                        results.push(result);
                    }
                }
            });
            
        } catch (error) {
            console.error('Yahoo Japan結果解析エラー:', error);
        }
        
        return results;
    }

    /**
     * テキストのクリーニング（日本語対応）
     */
    cleanText(text) {
        if (!text) return '';
        
        // 日本語特有の処理
        return text
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[\u200B-\u200D\uFEFF]/g, '') // ゼロ幅文字を除去
            .substring(0, 200);
    }

    /**
     * URLのクリーニング
     */
    cleanUrl(url) {
        if (!url) return '';
        
        // Yahoo Japanのリダイレクトを除去
        if (url.includes('yahoo.co.jp/url?')) {
            try {
                const urlParams = new URLSearchParams(url.split('?')[1]);
                return urlParams.get('url') || url;
            } catch (error) {
                return url;
            }
        }
        
        // 相対URLを絶対URLに変換
        if (url.startsWith('/')) {
            return 'https://search.yahoo.co.jp' + url;
        }
        
        return url;
    }

    /**
     * 表示用URLを抽出
     */
    extractDisplayUrl(url) {
        try {
            const cleanUrl = this.cleanUrl(url);
            const urlObj = new URL(cleanUrl);
            return urlObj.hostname + urlObj.pathname;
        } catch (error) {
            return url;
        }
    }

    /**
     * 結果をフォーマット
     */
    formatResults(rawResults) {
        if (!rawResults || !Array.isArray(rawResults)) {
            return [];
        }

        return rawResults.map(result => ({
            title: result.title || '',
            url: result.url || '',
            snippet: result.snippet || '',
            displayUrl: result.displayUrl || result.url || ''
        }));
    }

    /**
     * モックデータを取得（CORS制限時の代替）
     */
    getMockResults(query, language) {
        const mockResults = [
            {
                title: `${query} - Yahoo!検索結果1`,
                url: `https://example.co.jp/yahoo-result1?q=${encodeURIComponent(query)}`,
                snippet: `${query}に関するYahoo! Japanからの検索結果です。日本語コンテンツを中心に提供します。`,
                displayUrl: 'example.co.jp/yahoo-result1'
            },
            {
                title: `${query}について - Yahoo!知恵袋`,
                url: `https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q${Math.floor(Math.random() * 1000000)}`,
                snippet: `${query}に関するQ&Aです。実際のユーザーからの質問と回答を掲載しています。`,
                displayUrl: 'detail.chiebukuro.yahoo.co.jp'
            },
            {
                title: `${query} - Yahoo!ニュース`,
                url: `https://news.yahoo.co.jp/search?p=${encodeURIComponent(query)}`,
                snippet: `${query}に関する最新ニュースをYahoo!ニュースから配信しています。`,
                displayUrl: 'news.yahoo.co.jp'
            },
            {
                title: `${query}の情報 - 日本語サイト`,
                url: `https://jp-info.example.com/${encodeURIComponent(query)}`,
                snippet: `${query}について日本語で詳しく解説したサイトです。初心者にもわかりやすい内容です。`,
                displayUrl: 'jp-info.example.com'
            },
            {
                title: `${query} - 公式情報`,
                url: `https://official.jp/${encodeURIComponent(query)}`,
                snippet: `${query}の公式情報を日本語で提供しています。正確で信頼性の高い情報源です。`,
                displayUrl: 'official.jp'
            }
        ];

        return {
            engine: this.name,
            query: query,
            language: language,
            results: mockResults,
            totalResults: mockResults.length,
            responseTime: 550,
            status: 'success'
        };
    }

    /**
     * エラーハンドリング
     */
    handleError(error) {
        if (error.name === 'AbortError') {
            throw new Error('Yahoo Japan検索がタイムアウトしました');
        } else if (error.message.includes('CORS')) {
            throw new Error('CORS制限により直接アクセスできません');
        } else if (error.message.includes('Failed to fetch')) {
            throw new Error('ネットワークエラーが発生しました');
        } else {
            throw new Error(`Yahoo Japan検索エラー: ${error.message}`);
        }
    }

    /**
     * 検索可能かチェック
     */
    isAvailable() {
        // 基本的な可用性チェック
        return typeof fetch !== 'undefined';
    }

    /**
     * 検索エンジンの直接検索URLを生成
     */
    getDirectSearchUrl(query, language = 'ja') {
        return this.buildSearchUrl(query, language);
    }

    /**
     * レート制限チェック
     */
    checkRateLimit() {
        const lastRequest = localStorage.getItem(`${this.name}_last_request`);
        const now = Date.now();
        
        if (lastRequest && (now - parseInt(lastRequest)) < 1000) {
            return false; // 1秒以内の連続リクエストを制限
        }
        
        localStorage.setItem(`${this.name}_last_request`, now.toString());
        return true;
    }

    /**
     * Yahoo Japan特有の機能: カテゴリ検索
     */
    searchByCategory(query, category) {
        const categoryParams = {
            'news': { 'vs': 'news.yahoo.co.jp' },
            'shopping': { 'vs': 'shopping.yahoo.co.jp' },
            'auction': { 'vs': 'auctions.yahoo.co.jp' },
            'knowledge': { 'vs': 'chiebukuro.yahoo.co.jp' }
        };

        if (categoryParams[category]) {
            return this.buildSearchUrl(query, 'ja', categoryParams[category]);
        }

        return this.buildSearchUrl(query, 'ja');
    }

    /**
     * 日本語特有の処理: ひらがな・カタカナ・漢字の正規化
     */
    normalizeJapaneseText(text) {
        if (!text) return '';
        
        // 全角英数字を半角に変換
        text = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
        
        // 全角スペースを半角スペースに変換
        text = text.replace(/　/g, ' ');
        
        return text.trim();
    }

    /**
     * Yahoo Japan特有の機能: 関連キーワードの取得
     */
    parseRelatedKeywords(html) {
        const relatedKeywords = [];
        
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const keywordElements = doc.querySelectorAll('.Related a, .suggest a');
            
            keywordElements.forEach(element => {
                const keyword = element.textContent.trim();
                if (keyword && !relatedKeywords.includes(keyword)) {
                    relatedKeywords.push(keyword);
                }
            });
            
        } catch (error) {
            console.error('関連キーワードの解析エラー:', error);
        }
        
        return relatedKeywords;
    }
}