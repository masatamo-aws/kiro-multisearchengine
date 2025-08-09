# 設計書

## 概要

マルチサーチエンジンアプリケーションは、複数の検索エンジンに対して同時に検索クエリを実行し、結果を並列表示するWebアプリケーションです。フロントエンドはHTML/CSS/JavaScriptで構築し、各検索エンジンのAPIまたはスクレイピング手法を使用して検索結果を取得します。

## アーキテクチャ

### システム構成
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   フロントエンド    │    │   検索マネージャー   │    │   検索エンジン      │
│   (HTML/CSS/JS) │◄──►│   (JavaScript)   │◄──►│   APIs/スクレイピング│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 技術スタック
- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **HTTPクライアント**: Fetch API
- **UIフレームワーク**: Vanilla JavaScript（軽量化のため）
- **CSSフレームワーク**: カスタムCSS with Flexbox/Grid
- **検索統合**: 
  - Google: Custom Search JSON API（制限あり）またはスクレイピング
  - Bing: Web Search API（廃止予定のため代替手法）
  - Yahoo Japan: スクレイピング
  - DuckDuckGo: Instant Answer APIまたはスクレイピング
  - YouTube: Data API v3
  - Baidu: スクレイピング

## コンポーネントとインターフェース

### 1. メインアプリケーション (app.js)
```javascript
class MultiSearchApp {
  constructor()
  init()
  handleSearch(query, language)
  displayResults(results)
  handleError(error, engine)
}
```

### 2. 検索マネージャー (searchManager.js)
```javascript
class SearchManager {
  constructor()
  searchAll(query, language)
  searchEngine(engine, query, language)
  formatResults(rawResults, engine)
}
```

### 3. 検索エンジンアダプター
```javascript
class GoogleSearchAdapter {
  search(query, language)
  formatResults(data)
}

class BingSearchAdapter {
  search(query, language)
  formatResults(data)
}

class YahooSearchAdapter {
  search(query, language)
  formatResults(data)
}

class DuckDuckGoSearchAdapter {
  search(query, language)
  formatResults(data)
}

class YouTubeSearchAdapter {
  search(query, language)
  formatResults(data)
}

class BaiduSearchAdapter {
  search(query, language)
  formatResults(data)
}
```

### 4. UIコンポーネント (ui.js)
```javascript
class UIManager {
  constructor()
  renderSearchForm()
  renderLanguageSelector()
  renderResultsContainer()
  showLoading(engine)
  hideLoading(engine)
  displayResults(engine, results)
  displayError(engine, error)
  generateSearchEngineLink(engine, query, language)
  updateEngineHeaders(query, language)
}
```

### 6. テーママネージャー (themeManager.js)
```javascript
class ThemeManager {
  constructor()
  initializeTheme()
  setTheme(theme)
  getTheme()
  toggleTheme()
  saveThemePreference(theme)
  loadThemePreference()
}
```

### 5. 言語マネージャー (languageManager.js)
```javascript
class LanguageManager {
  constructor()
  getSupportedLanguages()
  getLanguageCode(language)
  getSearchParameters(language, engine)
}
```

## データモデル

### 検索クエリモデル
```javascript
{
  query: string,
  language: string,
  timestamp: Date,
  engines: string[]
}
```

### 検索結果モデル
```javascript
{
  engine: string,
  query: string,
  language: string,
  results: [
    {
      title: string,
      url: string,
      snippet: string,
      displayUrl: string
    }
  ],
  totalResults: number,
  responseTime: number,
  status: 'success' | 'error' | 'loading'
}
```

### 言語設定モデル
```javascript
{
  code: string,
  name: string,
  nativeName: string,
  supportedEngines: string[],
  searchParameters: {
    google: object,
    bing: object,
    yahoo: object,
    duckduckgo: object,
    youtube: object,
    baidu: object
  }
}
```

## エラーハンドリング

### エラータイプ
1. **ネットワークエラー**: タイムアウト、接続失敗
2. **APIエラー**: レート制限、認証エラー
3. **解析エラー**: レスポンス解析失敗
4. **CORSエラー**: クロスオリジン制限

### エラーハンドリング戦略
```javascript
class ErrorHandler {
  handleNetworkError(error, engine)
  handleAPIError(error, engine)
  handleParsingError(error, engine)
  handleCORSError(error, engine)
  displayUserFriendlyMessage(errorType, engine)
}
```

### フォールバック機構
- API失敗時のスクレイピングフォールバック
- プロキシサーバー経由でのCORS回避
- キャッシュされた結果の表示

## テスト戦略

### 単体テスト
- 各SearchAdapterクラスのテスト
- LanguageManagerのテスト
- UIManagerのテスト
- ErrorHandlerのテスト

### 統合テスト
- 複数検索エンジンの同時実行テスト
- 言語切り替え機能のテスト
- エラーハンドリングの統合テスト

### エンドツーエンドテスト
- ユーザーフローの完全テスト
- 異なるブラウザでの互換性テスト
- モバイルデバイスでのレスポンシブテスト

### パフォーマンステスト
- 同時検索のパフォーマンステスト
- メモリ使用量の監視
- ネットワーク遅延のシミュレーション

## 実装上の考慮事項

### CORS対策
多くの検索エンジンはCORSを制限しているため、以下の対策を実装：
1. プロキシサーバーの使用（開発環境）
2. JSONP（対応している場合）
3. サーバーサイドプロキシの実装
4. ブラウザ拡張機能としての実装検討

### レート制限対策
- リクエスト間隔の制御
- ユーザーセッション管理
- キャッシュ機能の実装

### セキュリティ考慮事項
- XSS攻撃の防止
- CSP（Content Security Policy）の実装
- APIキーの安全な管理

### パフォーマンス最適化
- 非同期処理の最適化
- 結果の段階的表示
- 画像の遅延読み込み
- キャッシュ戦略の実装

### 検索エンジン直接リンク機能
各検索エンジンの結果セクションに、その検索エンジンで直接検索できるリンクを追加：
- リンクは検索実行時に動的に生成
- 現在のクエリと言語設定を含む
- 新しいタブで開く
- 各検索エンジンの適切なURLパラメータを使用

### ダークモード機能
ユーザーの好みに応じてライトモードとダークモードを切り替え可能：
- ラジオボタンによるテーマ選択UI
- CSS変数を使用したテーマシステム
- ローカルストレージによる設定の永続化
- システムの設定に基づく初期テーマの自動検出