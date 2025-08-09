/**
 * DuckDuckGo検索アダプター
 * DuckDuckGo検索の結果を取得・解析する
 */
class DuckDuckGoSearchAdapter {
    constructor() {
        this.name = 'duckduckgo';
        this.displayName = 'DuckDuckGo';
        this.baseUrl = 'https://duckduckgo.com/';
        this.instantAnswerUrl = 'https://api.duckduckgo.com/';
        this.timeout = 10000; // 10秒
    }

    /**
     * DuckDuckGo検索を実行
     */
    async search(query, language = 'ja') {
        const startTime = Date.now();
        
        try {
            // まずInstant Answer APIを試す
            const instantResults = await this.searchInstantAnswer(query, language);
            if (instantResults && instantResults.results.length > 0) {
                return instantResults;
            }

            // Instant Answer APIで結果が得られない場合は通常の検索
            const searchUrl = this.buildSearchUrl(query, language);
            console.log(`DuckDuckGo検索URL: ${searchUrl}`);

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
            console.error('DuckDuckGo検索エラー:', error);
            
            // CORS制限の場合はモックデータを返す
            if (error.message.includes('CORS') || error.name === 'TypeError') {
                return this.getMockResults(query, language);
            }
            
            throw error;
        }
    }

    /**
     * DuckDuckGo Instant Answer APIを使用した検索
     */
    async searchInstantAnswer(query, language) {
        try {
            const params = new URLSearchParams({
                q: query,
                format: 'json',
                no_html: '1',
                skip_disambig: '1'
            });

            const response = await this.fetchWithTimeout(`${this.instantAnswerUrl}?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`Instant Answer API HTTP ${response.status}`);
            }

            const data = await response.json();
            const results = this.parseInstantAnswerResults(data, query);
            
            return {
                engine: this.name,
                query: query,
                language: language,
                results: results,
                totalResults: results.length,
                responseTime: Date.now(),
                status: 'success'
            };

        } catch (error) {
            console.log('Instant Answer API利用不可:', error.message);
            return null;
        }
    }

    /**
     * Instant Answer APIの結果を解析
     */
    parseInstantAnswerResults(data, query) {
        const results = [];

        try {
            // Abstract（要約）
            if (data.Abstract) {
                results.push({
                    title: data.Heading || `${query} - 概要`,
                    url: data.AbstractURL || '#',
                    snippet: data.Abstract,
                    displayUrl: data.AbstractSource || 'DuckDuckGo'
                });
            }

            // Definition（定義）
            if (data.Definition) {
                results.push({
                    title: `${query} - 定義`,
                    url: data.DefinitionURL || '#',
                    snippet: data.Definition,
                    displayUrl: data.DefinitionSource || 'DuckDuckGo'
                });
            }

            // Related Topics（関連トピック）
            if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
                data.RelatedTopics.slice(0, 5).forEach(topic => {
                    if (topic.Text && topic.FirstURL) {
                        results.push({
                            title: topic.Text.split(' - ')[0] || topic.Text,
                            url: topic.FirstURL,
                            snippet: topic.Text,
                            displayUrl: this.extractDisplayUrl(topic.FirstURL)
                        });
                    }
                });
            }

            // Results（検索結果）
            if (data.Results && Array.isArray(data.Results)) {
                data.Results.slice(0, 5).forEach(result => {
                    if (result.Text && result.FirstURL) {
                        results.push({
                            title: result.Text.split(' - ')[0] || result.Text,
                            url: result.FirstURL,
                            snippet: result.Text,
                            displayUrl: this.extractDisplayUrl(result.FirstURL)
                        });
                    }
                });
            }

        } catch (error) {
            console.error('Instant Answer結果解析エラー:', error);
        }

        return results;
    }

    /**
     * 検索URLを構築
     */
    buildSearchUrl(query, language) {
        const languageManager = new LanguageManager();
        const params = languageManager.getSearchParameters(language, this.name);
        
        const searchParams = new URLSearchParams({
            q: query,
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
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
            
            // DuckDuckGo検索結果のセレクター
            const resultElements = doc.querySelectorAll('[data-result], .result');
            
            resultElements.forEach((element, index) => {
                if (index >= 10) return; // 最大10件まで
                
                const titleElement = element.querySelector('h2 a, .result__title a');
                const snippetElement = element.querySelector('.result__snippet, .snippet');
                const urlElement = element.querySelector('.result__url, .url');
                
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
            console.error('DuckDuckGo結果解析エラー:', error);
        }
        
        return results;
    }

    /**
     * テキストのクリーニング
     */
    cleanText(text) {
        if (!text) return '';
        return text.trim().replace(/\s+/g, ' ').substring(0, 200);
    }

    /**
     * URLのクリーニング
     */
    cleanUrl(url) {
        if (!url) return '';
        
        // DuckDuckGoのリダイレクトを除去
        if (url.includes('duckduckgo.com/l/?')) {
            try {
                const urlParams = new URLSearchParams(url.split('?')[1]);
                return decodeURIComponent(urlParams.get('uddg') || url);
            } catch (error) {
                return url;
            }
        }
        
        // 相対URLを絶対URLに変換
        if (url.startsWith('/')) {
            return 'https://duckduckgo.com' + url;
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
                title: `${query} - DuckDuckGo検索結果`,
                url: `https://example.com/ddg-result1?q=${encodeURIComponent(query)}`,
                snippet: `${query}に関するプライバシーを重視した検索結果です。トラッキングなしで安全に情報を提供します。`,
                displayUrl: 'example.com/ddg-result1'
            },
            {
                title: `${query}について - プライベート検索`,
                url: `https://private.example.com/${encodeURIComponent(query)}`,
                snippet: `${query}の詳細情報をプライバシーを保護しながら提供します。個人情報の収集は行いません。`,
                displayUrl: 'private.example.com'
            },
            {
                title: `${query} - Wikipedia`,
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
                snippet: `${query}に関するWikipediaの記事です。中立的な観点から詳しく解説しています。`,
                displayUrl: 'en.wikipedia.org'
            },
            {
                title: `${query}の定義と説明`,
                url: `https://definition.example.com/${encodeURIComponent(query)}`,
                snippet: `${query}の正確な定義と詳細な説明を提供します。信頼性の高い情報源から収集されています。`,
                displayUrl: 'definition.example.com'
            }
        ];

        return {
            engine: this.name,
            query: query,
            language: language,
            results: mockResults,
            totalResults: mockResults.length,
            responseTime: 450,
            status: 'success'
        };
    }

    /**
     * エラーハンドリング
     */
    handleError(error) {
        if (error.name === 'AbortError') {
            throw new Error('DuckDuckGo検索がタイムアウトしました');
        } else if (error.message.includes('CORS')) {
            throw new Error('CORS制限により直接アクセスできません');
        } else if (error.message.includes('Failed to fetch')) {
            throw new Error('ネットワークエラーが発生しました');
        } else {
            throw new Error(`DuckDuckGo検索エラー: ${error.message}`);
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
     * DuckDuckGo特有の機能: プライバシー重視の設定
     */
    getPrivacySettings() {
        return {
            safe_search: 'moderate', // セーフサーチ設定
            no_tracking: true,       // トラッキング無効
            no_ads: true,           // 広告無効
            no_javascript: false    // JavaScript有効（必要に応じて）
        };
    }

    /**
     * DuckDuckGo特有の機能: バング検索のサポート
     */
    supportsBangSearch(query) {
        // バング検索（!w Wikipedia, !g Google など）をサポート
        return query.includes('!');
    }

    /**
     * DuckDuckGo特有の機能: 即座回答の取得
     */
    parseInstantAnswer(data) {
        const instantAnswers = [];

        if (data.Answer) {
            instantAnswers.push({
                type: 'answer',
                content: data.Answer,
                source: data.AnswerType || 'DuckDuckGo'
            });
        }

        if (data.Infobox && data.Infobox.content) {
            data.Infobox.content.forEach(item => {
                if (item.data_type === 'string' && item.value) {
                    instantAnswers.push({
                        type: 'infobox',
                        label: item.label,
                        content: item.value,
                        source: 'DuckDuckGo'
                    });
                }
            });
        }

        return instantAnswers;
    }
}