/**
 * テーママネージャークラス
 * ライトモードとダークモードの切り替えを管理する
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.storageKey = 'multi-search-theme';
        this.themes = {
            light: 'light',
            dark: 'dark'
        };
    }

    /**
     * テーマシステムの初期化
     */
    initializeTheme() {
        // 保存されたテーマ設定を読み込み
        const savedTheme = this.loadThemePreference();
        
        // 保存されたテーマがない場合はシステム設定を確認
        const initialTheme = savedTheme || this.detectSystemTheme();
        
        // テーマを適用
        this.setTheme(initialTheme);
        
        // UIを更新
        this.updateThemeSelector();
        
        console.log(`テーマシステムが初期化されました: ${this.currentTheme}`);
    }

    /**
     * テーマを設定
     */
    setTheme(theme) {
        if (!this.themes[theme]) {
            console.warn(`未知のテーマ: ${theme}`);
            theme = 'light';
        }

        this.currentTheme = theme;
        
        // HTMLのdata-theme属性を更新
        document.documentElement.setAttribute('data-theme', theme);
        
        // ローカルストレージに保存
        this.saveThemePreference(theme);
        
        console.log(`テーマが変更されました: ${theme}`);
    }

    /**
     * 現在のテーマを取得
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * テーマを切り替え
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        this.updateThemeSelector();
    }

    /**
     * テーマ設定をローカルストレージに保存
     */
    saveThemePreference(theme) {
        try {
            localStorage.setItem(this.storageKey, theme);
        } catch (error) {
            console.error('テーマ設定の保存に失敗しました:', error);
        }
    }

    /**
     * ローカルストレージからテーマ設定を読み込み
     */
    loadThemePreference() {
        try {
            return localStorage.getItem(this.storageKey);
        } catch (error) {
            console.error('テーマ設定の読み込みに失敗しました:', error);
            return null;
        }
    }

    /**
     * システムのテーマ設定を検出
     */
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * テーマセレクターUIを更新
     */
    updateThemeSelector() {
        const lightRadio = document.getElementById('theme-light');
        const darkRadio = document.getElementById('theme-dark');

        if (lightRadio && darkRadio) {
            lightRadio.checked = this.currentTheme === 'light';
            darkRadio.checked = this.currentTheme === 'dark';
        }
    }

    /**
     * テーマセレクターのイベントリスナーを設定
     */
    setupThemeSelector() {
        const lightRadio = document.getElementById('theme-light');
        const darkRadio = document.getElementById('theme-dark');

        if (lightRadio) {
            lightRadio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.setTheme('light');
                }
            });
        }

        if (darkRadio) {
            darkRadio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.setTheme('dark');
                }
            });
        }
    }

    /**
     * システムのテーマ変更を監視
     */
    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                // 保存されたテーマ設定がない場合のみシステム設定に従う
                const savedTheme = this.loadThemePreference();
                if (!savedTheme) {
                    const systemTheme = e.matches ? 'dark' : 'light';
                    this.setTheme(systemTheme);
                    this.updateThemeSelector();
                }
            });
        }
    }

    /**
     * テーマに応じたメタデータを更新
     */
    updateMetaThemeColor() {
        let themeColor;
        
        switch (this.currentTheme) {
            case 'dark':
                themeColor = '#1a1a1a';
                break;
            case 'light':
            default:
                themeColor = '#f5f5f5';
                break;
        }

        // メタタグを更新または作成
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = themeColor;
    }

    /**
     * テーマの統計情報を取得
     */
    getThemeStats() {
        return {
            currentTheme: this.currentTheme,
            availableThemes: Object.keys(this.themes),
            systemTheme: this.detectSystemTheme(),
            savedTheme: this.loadThemePreference(),
            supportsSystemDetection: !!(window.matchMedia)
        };
    }

    /**
     * テーマをリセット（システム設定に戻す）
     */
    resetTheme() {
        // ローカルストレージから設定を削除
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('テーマ設定の削除に失敗しました:', error);
        }

        // システム設定に基づいてテーマを設定
        const systemTheme = this.detectSystemTheme();
        this.setTheme(systemTheme);
        this.updateThemeSelector();
        
        console.log('テーマがリセットされました');
    }

    /**
     * アクセシビリティの向上
     */
    enhanceAccessibility() {
        const themeSelector = document.querySelector('.theme-selector');
        if (themeSelector) {
            themeSelector.setAttribute('role', 'radiogroup');
            themeSelector.setAttribute('aria-label', 'テーマ選択');
        }

        const lightRadio = document.getElementById('theme-light');
        const darkRadio = document.getElementById('theme-dark');

        if (lightRadio) {
            lightRadio.setAttribute('aria-label', 'ライトモード');
        }

        if (darkRadio) {
            darkRadio.setAttribute('aria-label', 'ダークモード');
        }
    }

    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        // イベントリスナーの削除は自動的に行われるため、特別な処理は不要
        console.log('ThemeManagerのリソースをクリーンアップしました');
    }
}

// システムテーマ変更の監視を開始
document.addEventListener('DOMContentLoaded', () => {
    if (window.themeManager) {
        window.themeManager.watchSystemTheme();
    }
});