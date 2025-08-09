/**
 * 言語管理クラス
 * サポートされる言語の管理と検索エンジン固有のパラメータ設定を行う
 */
class LanguageManager {
    constructor() {
        this.supportedLanguages = this.initializeSupportedLanguages();
        this.currentLanguage = 'ja';
    }

    /**
     * サポートされる言語の初期化
     */
    initializeSupportedLanguages() {
        return {
            'ja': {
                code: 'ja',
                name: '日本語',
                nativeName: '日本語',
                supportedEngines: ['google', 'bing', 'yahoo', 'duckduckgo', 'youtube', 'baidu'],
                searchParameters: {
                    google: {
                        hl: 'ja',
                        gl: 'jp',
                        lr: 'lang_ja'
                    },
                    bing: {
                        cc: 'jp',
                        setlang: 'ja'
                    },
                    yahoo: {
                        ei: 'UTF-8',
                        fr: 'top_ga1_sa'
                    },
                    duckduckgo: {
                        kl: 'jp-jp'
                    },
                    youtube: {
                        hl: 'ja',
                        gl: 'JP',
                        relevanceLanguage: 'ja'
                    },
                    baidu: {
                        ie: 'utf-8',
                        tn: 'baiduhome_pg'
                    }
                }
            },
            'en': {
                code: 'en',
                name: 'English',
                nativeName: 'English',
                supportedEngines: ['google', 'bing', 'yahoo', 'duckduckgo', 'youtube', 'baidu'],
                searchParameters: {
                    google: {
                        hl: 'en',
                        gl: 'us',
                        lr: 'lang_en'
                    },
                    bing: {
                        cc: 'us',
                        setlang: 'en'
                    },
                    yahoo: {
                        ei: 'UTF-8',
                        fr: 'yfp-t'
                    },
                    duckduckgo: {
                        kl: 'us-en'
                    },
                    youtube: {
                        hl: 'en',
                        gl: 'US',
                        relevanceLanguage: 'en'
                    },
                    baidu: {
                        ie: 'utf-8',
                        tn: 'baiduhome_pg'
                    }
                }
            },
            'zh': {
                code: 'zh',
                name: '中文',
                nativeName: '中文',
                supportedEngines: ['google', 'bing', 'duckduckgo', 'youtube', 'baidu'],
                searchParameters: {
                    google: {
                        hl: 'zh-CN',
                        gl: 'cn',
                        lr: 'lang_zh-CN'
                    },
                    bing: {
                        cc: 'cn',
                        setlang: 'zh-cn'
                    },
                    yahoo: {
                        ei: 'UTF-8',
                        fr: 'yfp-t'
                    },
                    duckduckgo: {
                        kl: 'cn-zh'
                    },
                    youtube: {
                        hl: 'zh-CN',
                        gl: 'CN',
                        relevanceLanguage: 'zh'
                    },
                    baidu: {
                        ie: 'utf-8',
                        tn: 'baiduhome_pg',
                        rn: '10'
                    }
                }
            },
            'ko': {
                code: 'ko',
                name: '한국어',
                nativeName: '한국어',
                supportedEngines: ['google', 'bing', 'duckduckgo', 'youtube', 'baidu'],
                searchParameters: {
                    google: {
                        hl: 'ko',
                        gl: 'kr',
                        lr: 'lang_ko'
                    },
                    bing: {
                        cc: 'kr',
                        setlang: 'ko'
                    },
                    yahoo: {
                        ei: 'UTF-8',
                        fr: 'yfp-t'
                    },
                    duckduckgo: {
                        kl: 'kr-ko'
                    },
                    youtube: {
                        hl: 'ko',
                        gl: 'KR',
                        relevanceLanguage: 'ko'
                    },
                    baidu: {
                        ie: 'utf-8',
                        tn: 'baiduhome_pg'
                    }
                }
            }
        };
    }

    /**
     * サポートされる言語のリストを取得
     */
    getSupportedLanguages() {
        return Object.values(this.supportedLanguages);
    }

    /**
     * 言語コードから言語情報を取得
     */
    getLanguageInfo(languageCode) {
        return this.supportedLanguages[languageCode] || this.supportedLanguages['ja'];
    }

    /**
     * 言語コードを取得
     */
    getLanguageCode(language) {
        if (typeof language === 'string' && this.supportedLanguages[language]) {
            return language;
        }
        return 'ja'; // デフォルト
    }

    /**
     * 特定の検索エンジンの言語パラメータを取得
     */
    getSearchParameters(languageCode, engine) {
        const languageInfo = this.getLanguageInfo(languageCode);
        
        if (!languageInfo.supportedEngines.includes(engine)) {
            console.warn(`言語 ${languageCode} は検索エンジン ${engine} でサポートされていません`);
            // デフォルト言語のパラメータを返す
            return this.supportedLanguages['ja'].searchParameters[engine] || {};
        }
        
        return languageInfo.searchParameters[engine] || {};
    }

    /**
     * 検索エンジンが指定言語をサポートしているかチェック
     */
    isEngineSupported(languageCode, engine) {
        const languageInfo = this.getLanguageInfo(languageCode);
        return languageInfo.supportedEngines.includes(engine);
    }

    /**
     * 現在の言語を設定
     */
    setCurrentLanguage(languageCode) {
        if (this.supportedLanguages[languageCode]) {
            this.currentLanguage = languageCode;
            return true;
        }
        return false;
    }

    /**
     * 現在の言語を取得
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 言語表示名を取得
     */
    getLanguageDisplayName(languageCode) {
        const languageInfo = this.getLanguageInfo(languageCode);
        return languageInfo.nativeName;
    }

    /**
     * 検索URL用のパラメータ文字列を生成
     */
    buildSearchParams(languageCode, engine, additionalParams = {}) {
        const languageParams = this.getSearchParameters(languageCode, engine);
        const allParams = { ...languageParams, ...additionalParams };
        
        return new URLSearchParams(allParams).toString();
    }

    /**
     * 言語設定の検証
     */
    validateLanguageConfig() {
        const errors = [];
        
        for (const [code, config] of Object.entries(this.supportedLanguages)) {
            if (!config.code || !config.name || !config.nativeName) {
                errors.push(`言語 ${code} の基本情報が不完全です`);
            }
            
            if (!config.supportedEngines || !Array.isArray(config.supportedEngines)) {
                errors.push(`言語 ${code} のサポートエンジン情報が不正です`);
            }
            
            if (!config.searchParameters || typeof config.searchParameters !== 'object') {
                errors.push(`言語 ${code} の検索パラメータが不正です`);
            }
        }
        
        if (errors.length > 0) {
            console.error('言語設定の検証エラー:', errors);
            return false;
        }
        
        return true;
    }
}

// 言語設定の検証を実行
document.addEventListener('DOMContentLoaded', () => {
    const languageManager = new LanguageManager();
    languageManager.validateLanguageConfig();
});