# 設計書

## 概要

マルチサーチエンジンアプリケーション（v1.3.1）は、6つの検索エンジン（Google、Bing、Yahoo Japan、DuckDuckGo、YouTube、Baidu）に対して同時に検索クエリを実行し、結果を並列表示するWebアプリケーションです。ダークモード対応、多言語サポート、検索エンジン直接リンク機能を備えたモダンなWebアプリケーションとして設計されています。

## スクリーンショット

### ライトモード
![ライトモード](https://raw.githubusercontent.com/masatamo-aws/kiro-multisearchengine/main/assets/image/Light%20Mode.png)

### ダークモード
![ダークモード](https://raw.githubusercontent.com/masatamo-aws/kiro-multisearchengine/main/assets/image/Dark%20Mode.png)

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
- スムーズなトランジション効果
- メタテーマカラーの自動更新

## UI/UXデザイン

### デザイン原則
1. **シンプルさ**: 直感的で使いやすいインターフェース
2. **一貫性**: 全体を通じた統一されたデザイン言語
3. **アクセシビリティ**: すべてのユーザーが利用可能
4. **レスポンシブ**: あらゆるデバイスサイズに対応
5. **パフォーマンス**: 高速で滑らかな操作感

### カラーパレット
#### ライトモード
- プライマリ背景: `#f5f5f5`
- セカンダリ背景: `#ffffff`
- テキスト: `#333333`
- アクセント: `#3498db`

#### ダークモード
- プライマリ背景: `#1a1a1a`
- セカンダリ背景: `#2d2d2d`
- テキスト: `#e0e0e0`
- アクセント: `#4a90e2`

### タイポグラフィ
- フォントファミリー: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- 見出し: 2.5em (h1), 1.2em (h3)
- 本文: 16px
- 小文字: 0.9em

## 技術アーキテクチャの詳細

### フロントエンド技術スタック
- **HTML5**: セマンティックマークアップ
- **CSS3**: CSS Grid, Flexbox, CSS Variables
- **JavaScript ES6+**: モジュラー設計
- **Web APIs**: Fetch API, LocalStorage API, matchMedia API

### ファイル構成
```
kiro-multiserchengine/
├── index.html              # メインアプリケーション
├── assets/
│   └── image/             # スクリーンショット
├── css/
│   └── style.css         # テーマ対応スタイル
└── js/
    ├── app.js            # メインアプリケーション
    ├── themeManager.js   # テーマ管理
    ├── searchManager.js  # 検索管理
    ├── ui.js            # UI管理
    ├── languageManager.js # 言語管理
    ├── errorHandler.js   # エラーハンドリング
    ├── searchCache.js    # キャッシュ管理
    └── adapters/         # 検索エンジンアダプター
```