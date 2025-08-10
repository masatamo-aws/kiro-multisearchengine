# マルチサーチエンジンアプリケーション - 論理アーキテクチャ

## 概要

マルチサーチエンジンアプリケーション（v1.3.1）は、6つの検索エンジン（Google、Bing、Yahoo Japan、DuckDuckGo、YouTube、Baidu）に対して同時に検索クエリを実行し、結果を統合表示するWebアプリケーションです。ダークモード対応、多言語サポート、検索エンジン直接リンク機能を備えています。本文書では、アプリケーションの論理アーキテクチャを詳細に説明します。

## スクリーンショット

### ライトモード
![ライトモード](https://raw.githubusercontent.com/masatamo-aws/kiro-multisearchengine/main/assets/image/Light%20Mode.png)

### ダークモード
![ダークモード](https://raw.githubusercontent.com/masatamo-aws/kiro-multisearchengine/main/assets/image/Dark%20Mode.png)

## 主要機能
- 🔍 6つの検索エンジンでの同時検索
- 🌐 4言語対応（日本語、英語、中国語、韓国語）
- 🌙 ダークモード・ライトモード切り替え
- 🔗 検索エンジン直接リンク
- 📱 レスポンシブデザイン
- ⚡ キャッシュ機能
- ⚠️ 包括的エラーハンドリング
- 📸 視覚的なユーザーガイド

## システム全体アーキテクチャ

```mermaid
graph TB
    subgraph "ユーザーインターフェース層"
        UI[UIManager]
        TM[ThemeManager]
        HTML[HTML/CSS]
    end
    
    subgraph "アプリケーション層"
        APP[MultiSearchApp]
        SM[SearchManager]
        LM[LanguageManager]
        EH[ErrorHandler]
        SC[SearchCache]
    end
    
    subgraph "アダプター層"
        GA[GoogleSearchAdapter]
        BA[BingSearchAdapter]
        YA[YahooSearchAdapter]
        DA[DuckDuckGoSearchAdapter]
        YTA[YouTubeSearchAdapter]
        BDA[BaiduSearchAdapter]
    end
    
    subgraph "外部サービス層"
        GOOGLE[Google Search]
        BING[Bing Search]
        YAHOO[Yahoo Japan Search]
        DDG[DuckDuckGo Search]
        YOUTUBE[YouTube Search]
        BAIDU[Baidu Search]
    end
    
    subgraph "データ永続化層"
        LS[LocalStorage]
        CACHE[Browser Cache]
    end
    
    UI --> APP
    TM --> APP
    APP --> SM
    APP --> LM
    APP --> EH
    SM --> SC
    SM --> GA
    SM --> BA
    SM --> YA
    SM --> DA
    SM --> YTA
    SM --> BDA
    
    GA --> GOOGLE
    BA --> BING
    YA --> YAHOO
    DA --> DDG
    YTA --> YOUTUBE
    BDA --> BAIDU
    
    SC --> LS
    TM --> LS
    SC --> CACHE
```

## レイヤー別詳細アーキテクチャ

### 1. ユーザーインターフェース層

```mermaid
graph LR
    subgraph "UI Components"
        SF[SearchForm]
        LS[LanguageSelector]
        TS[ThemeSelector]
        RC[ResultsContainer]
        LD[LoadingIndicator]
        EM[ErrorMessage]
    end
    
    subgraph "UI Manager"
        UM[UIManager]
        UM --> SF
        UM --> LS
        UM --> TS
        UM --> RC
        UM --> LD
        UM --> EM
    end
    
    subgraph "Theme System"
        TM[ThemeManager]
        CSS[CSS Variables]
        TM --> CSS
    end
```

**責務:**
- ユーザーインタラクションの処理
- 検索結果の表示
- テーマ（ライト/ダーク）の管理
- レスポンシブデザインの提供

### 2. アプリケーション層

```mermaid
graph TB
    subgraph "Core Application"
        APP[MultiSearchApp]
        APP --> |初期化| SM[SearchManager]
        APP --> |言語管理| LM[LanguageManager]
        APP --> |エラー処理| EH[ErrorHandler]
        APP --> |テーマ管理| TM[ThemeManager]
    end
    
    subgraph "Search Management"
        SM --> |並列実行| PE[Parallel Execution]
        SM --> |結果統合| RA[Result Aggregation]
        SM --> |キャッシュ管理| SC[SearchCache]
        SM --> |応答時間測定| RT[Response Time]
    end
    
    subgraph "Language Management"
        LM --> |言語検出| LD[Language Detection]
        LM --> |パラメータ生成| PG[Parameter Generation]
        LM --> |検証| LV[Language Validation]
    end
    
    subgraph "Error Handling"
        EH --> |ネットワークエラー| NE[Network Errors]
        EH --> |CORSエラー| CE[CORS Errors]
        EH --> |APIエラー| AE[API Errors]
        EH --> |再試行ロジック| RL[Retry Logic]
    end
```

**責務:**
- アプリケーションのライフサイクル管理
- 検索処理の統合制御
- 言語設定の管理
- エラーハンドリングの統合
- キャッシュ戦略の実装

### 3. アダプター層

```mermaid
graph TB
    subgraph "Search Adapter Pattern"
        SA[SearchAdapter Interface]
        SA --> |実装| GA[GoogleSearchAdapter]
        SA --> |実装| BA[BingSearchAdapter]
        SA --> |実装| YA[YahooSearchAdapter]
        SA --> |実装| DA[DuckDuckGoSearchAdapter]
        SA --> |実装| YTA[YouTubeSearchAdapter]
        SA --> |実装| BDA[BaiduSearchAdapter]
    end
    
    subgraph "Adapter Functions"
        AF[共通機能]
        AF --> |URL構築| UB[buildSearchUrl]
        AF --> |結果解析| RP[parseResults]
        AF --> |エラー処理| EH[handleError]
        AF --> |レート制限| RL[checkRateLimit]
        AF --> |直接リンク| DL[getDirectSearchUrl]
    end
    
    GA --> AF
    BA --> AF
    YA --> AF
    DA --> AF
    YTA --> AF
    BDA --> AF
```

**責務:**
- 各検索エンジンのAPI/スクレイピング処理
- 検索結果の正規化
- エンジン固有のエラーハンドリング
- レート制限の管理
- 直接検索リンクの生成

### 4. データフロー図

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UIManager
    participant APP as MultiSearchApp
    participant SM as SearchManager
    participant CACHE as SearchCache
    participant GA as GoogleAdapter
    participant BA as BingAdapter
    participant API as External APIs
    
    U->>UI: 検索クエリ入力
    UI->>APP: handleSearch()
    APP->>SM: searchAll(query, language)
    
    SM->>CACHE: キャッシュチェック
    alt キャッシュヒット
        CACHE-->>SM: キャッシュされた結果
    else キャッシュミス
        par 並列検索
            SM->>GA: search(query, language)
            GA->>API: HTTP Request
            API-->>GA: Response
            GA-->>SM: 正規化された結果
        and
            SM->>BA: search(query, language)
            BA->>API: HTTP Request
            API-->>BA: Response
            BA-->>SM: 正規化された結果
        end
        SM->>CACHE: 結果をキャッシュ
    end
    
    SM-->>APP: 統合結果
    APP->>UI: displayResults()
    UI-->>U: 検索結果表示
```

## コンポーネント間の依存関係

```mermaid
graph TD
    subgraph "依存関係マップ"
        APP[MultiSearchApp] --> SM[SearchManager]
        APP --> LM[LanguageManager]
        APP --> TM[ThemeManager]
        APP --> EH[ErrorHandler]
        APP --> UI[UIManager]
        
        SM --> SC[SearchCache]
        SM --> GA[GoogleAdapter]
        SM --> BA[BingAdapter]
        SM --> YA[YahooAdapter]
        SM --> DA[DuckDuckGoAdapter]
        SM --> YTA[YouTubeAdapter]
        SM --> BDA[BaiduAdapter]
        
        UI --> SM
        UI --> LM
        UI --> TM
        
        SC --> LS[LocalStorage]
        TM --> LS
        
        EH --> UI
    end
```

## 設計パターンの適用

### 1. アダプターパターン
```mermaid
classDiagram
    class SearchAdapter {
        <<interface>>
        +search(query, language)
        +formatResults(data)
        +getDirectSearchUrl(query, language)
        +isAvailable()
        +checkRateLimit()
    }
    
    class GoogleSearchAdapter {
        +search(query, language)
        +formatResults(data)
        +parseResults(html)
    }
    
    class BingSearchAdapter {
        +search(query, language)
        +formatResults(data)
        +parseResults(html)
    }
    
    SearchAdapter <|-- GoogleSearchAdapter
    SearchAdapter <|-- BingSearchAdapter
```

### 2. ファサードパターン
```mermaid
classDiagram
    class MultiSearchApp {
        -searchManager: SearchManager
        -uiManager: UIManager
        -languageManager: LanguageManager
        -themeManager: ThemeManager
        -errorHandler: ErrorHandler
        +init()
        +handleSearch()
        +handleClear()
    }
    
    MultiSearchApp --> SearchManager
    MultiSearchApp --> UIManager
    MultiSearchApp --> LanguageManager
    MultiSearchApp --> ThemeManager
    MultiSearchApp --> ErrorHandler
```

### 3. オブザーバーパターン
```mermaid
classDiagram
    class SearchManager {
        +searchAll(query, language)
        +notifyProgress(engine, status)
    }
    
    class UIManager {
        +displayResults(engine, results)
        +showLoading(engine)
        +displayError(engine, error)
    }
    
    SearchManager --> UIManager : notify
```

## セキュリティアーキテクチャ

```mermaid
graph TB
    subgraph "セキュリティ層"
        CSP[Content Security Policy]
        XSS[XSS Protection]
        CORS[CORS Handling]
        INPUT[Input Validation]
    end
    
    subgraph "データ保護"
        LS[LocalStorage Encryption]
        CACHE[Cache Security]
        PII[PII Protection]
    end
    
    subgraph "通信セキュリティ"
        HTTPS[HTTPS Only]
        TIMEOUT[Request Timeout]
        RATE[Rate Limiting]
    end
    
    CSP --> XSS
    CORS --> INPUT
    LS --> CACHE
    HTTPS --> TIMEOUT
    TIMEOUT --> RATE
```

## パフォーマンスアーキテクチャ

```mermaid
graph TB
    subgraph "パフォーマンス最適化"
        PARALLEL[並列処理]
        CACHE[キャッシュ戦略]
        LAZY[遅延読み込み]
        DEBOUNCE[デバウンス処理]
    end
    
    subgraph "リソース管理"
        MEMORY[メモリ管理]
        CLEANUP[リソースクリーンアップ]
        TIMEOUT[タイムアウト制御]
    end
    
    subgraph "ユーザー体験"
        PROGRESSIVE[プログレッシブローディング]
        RESPONSIVE[レスポンシブデザイン]
        ACCESSIBILITY[アクセシビリティ]
    end
    
    PARALLEL --> CACHE
    CACHE --> LAZY
    MEMORY --> CLEANUP
    PROGRESSIVE --> RESPONSIVE
```

## 拡張性の考慮

### 新しい検索エンジンの追加
```mermaid
graph LR
    subgraph "拡張プロセス"
        NEW[新しいAdapter作成]
        IMPL[SearchAdapter実装]
        REG[SearchManagerに登録]
        UI[UI要素追加]
        TEST[テスト作成]
    end
    
    NEW --> IMPL
    IMPL --> REG
    REG --> UI
    UI --> TEST
```

### 新機能の追加
```mermaid
graph TB
    subgraph "機能拡張パターン"
        PLUGIN[プラグインアーキテクチャ]
        EVENT[イベント駆動]
        CONFIG[設定可能性]
        API[API拡張]
    end
    
    PLUGIN --> EVENT
    EVENT --> CONFIG
    CONFIG --> API
```

## 運用・監視アーキテクチャ

```mermaid
graph TB
    subgraph "ログ・監視"
        LOG[ログ管理]
        ERROR[エラー追跡]
        PERF[パフォーマンス監視]
        USAGE[使用状況分析]
    end
    
    subgraph "デバッグ・テスト"
        DEBUG[デバッグ機能]
        TEST[テストフレームワーク]
        MOCK[モックデータ]
    end
    
    LOG --> ERROR
    ERROR --> PERF
    DEBUG --> TEST
    TEST --> MOCK
```

## バージョン履歴とアーキテクチャの進化

### v1.3.1 - ドキュメント整備とプロジェクト完成
- **包括的ドキュメント更新**: 全ドキュメントファイルの最新情報への更新
- **スクリーンショット追加**: ライトモードとダークモードの視覚的ガイド
- **プロジェクト完成度向上**: 全機能実装完了とドキュメント統一

### v1.3.0 - テーマシステムの追加
- **ThemeManager**の導入
- CSS変数によるテーマシステム
- システムテーマ検出機能
- ローカルストレージによる設定永続化

### v1.2.0 - 直接リンク機能
- 各SearchAdapterに`getDirectSearchUrl()`メソッド追加
- UIManagerにリンク生成・更新機能追加
- 動的リンク管理システム

### v1.1.0 - Baiduサポート
- BaiduSearchAdapterの追加
- 中国語特有の処理機能
- 6つの検索エンジン対応

### v1.0.0 - 基本アーキテクチャ
- レイヤードアーキテクチャの確立
- アダプターパターンの実装
- 並列検索システム

## 技術的負債と改善点

### 現在の制約
1. **CORS制限**: 多くの検索エンジンで直接アクセス不可
2. **スクレイピング依存**: APIが利用できない場合の代替手段
3. **レート制限**: 各検索エンジンの制限への対応

### 将来の改善計画
1. **プロキシサーバー**: CORS制限の根本的解決
2. **PWA対応**: オフライン機能とインストール可能性
3. **検索履歴**: ユーザーの検索パターン分析
4. **AI統合**: 検索結果の要約と分析

## まとめ

このマルチサーチエンジンアプリケーション（v1.3.1）は、以下の設計原則に基づいて構築されています：

1. **🔧 関心の分離**: 各コンポーネントが明確な責務を持つ
2. **📈 拡張性**: 新しい検索エンジンや機能を容易に追加可能
3. **🛠️ 保守性**: モジュラー設計により保守が容易
4. **⚡ パフォーマンス**: 並列処理とキャッシュによる高速化
5. **👥 ユーザビリティ**: レスポンシブデザインとアクセシビリティ
6. **🛡️ 堅牢性**: 包括的なエラーハンドリング
7. **🔒 セキュリティ**: XSS対策とCSP実装
8. **🎨 テーマ対応**: ダークモード・ライトモードの動的切り替え
9. **🌐 国際化**: 多言語対応と文化的配慮

この論理アーキテクチャにより、スケーラブルで保守性が高く、ユーザーフレンドリーなマルチサーチエンジンアプリケーションが実現されています。

## 関連ドキュメント

- **[README.md](README.md)**: プロジェクト概要と使用方法
- **[CHANGELOG.md](CHANGELOG.md)**: 詳細な変更履歴
- **[requirements.md](requirements.md)**: 要件定義書
- **[design.md](design.md)**: 設計書
- **[tasks.md](tasks.md)**: 実装計画