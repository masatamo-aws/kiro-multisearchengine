# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-01-08

### Added
- **ダークモード機能**: ライトモードとダークモードの切り替え対応
- **テーマセレクター**: ラジオボタンによるテーマ選択UI
- **テーマ永続化**: ローカルストレージによるテーマ設定の保存
- **システムテーマ検出**: ユーザーのシステム設定に基づく初期テーマの自動選択
- **CSS変数システム**: テーマ切り替えのためのCSS変数実装
- **ThemeManagerクラス**: テーマ管理の専用クラス
- **論理アーキテクチャ文書**: システム設計の詳細文書（logicalarchitecture.md）

### Changed
- **UIデザイン**: ダークモード対応のためのスタイル全面更新
- **アクセシビリティ**: テーマ選択のARIA属性追加
- **パフォーマンス**: テーマ切り替え時のスムーズなトランジション

### Technical Details
- CSS変数を使用したテーマシステムの実装
- `prefers-color-scheme`メディアクエリによるシステムテーマ検出
- テーマ変更時のメタテーマカラー自動更新

## [1.2.0] - 2025-01-08

### Added
- **検索エンジン直接リンク機能**: 各検索エンジンのヘッダーに直接検索リンクを追加
- **新しいタブで開く**: すべての直接リンクが新しいタブで開く
- **動的リンク生成**: 検索実行時にリンクを自動生成・更新
- **言語パラメータ対応**: 選択された言語設定を含むリンク生成

### Changed
- **UIManager**: リンク生成・更新機能を追加
- **各SearchAdapter**: `getDirectSearchUrl()`メソッドを追加
- **ヘッダーデザイン**: リンクアイコン（🔗）の表示

### Technical Details
- 各アダプターの`buildSearchUrl()`メソッドを再利用
- リンククリア機能の実装
- アクセシビリティ対応のARIA属性追加

## [1.1.0] - 2025-01-08

### Added
- **Baidu（百度）検索エンジンサポート**: 中国最大の検索エンジンを追加
- **中国語検索最適化**: Baidu特有の検索パラメータとテキスト処理
- **6つの検索エンジン対応**: Google、Bing、Yahoo Japan、DuckDuckGo、YouTube、Baiduで同時検索

### Changed
- **LanguageManager**: 全言語でBaiduサポートを追加
- **SearchManager**: Baiduアダプターを統合
- **UI**: Baidu結果表示セクションを追加

### Technical Details
- BaiduSearchAdapterクラスの実装
- 中国語テキスト正規化機能
- 百度百科情報抽出機能
- 地域別検索サポート

## [1.0.0] - 2025-01-08

### Added
- **初回リリース**: マルチサーチエンジンアプリケーションの基本機能
- **5つの検索エンジンサポート**: Google、Bing、Yahoo Japan、DuckDuckGo、YouTube
- **多言語対応**: 日本語、英語、中国語、韓国語での検索
- **並列検索**: Promise.allSettledによる同時検索実行
- **プログレッシブローディング**: 結果が準備でき次第順次表示
- **レスポンシブデザイン**: デスクトップ・モバイル両対応
- **キャッシュ機能**: 検索結果の5分間キャッシュ
- **エラーハンドリング**: 包括的なエラー処理システム
- **CORS対策**: 制限時のモックデータ表示

### Technical Implementation
- **アーキテクチャ**: MVCパターンとアダプターパターンの採用
- **SearchManager**: 検索処理の統合管理
- **UIManager**: ユーザーインターフェースの管理
- **LanguageManager**: 多言語サポートの実装
- **ErrorHandler**: エラー処理の統合
- **SearchCache**: LRU方式のキャッシュシステム

### Components
- **MultiSearchApp**: メインアプリケーションクラス
- **SearchAdapters**: 各検索エンジンの統一インターフェース
  - GoogleSearchAdapter
  - BingSearchAdapter
  - YahooSearchAdapter
  - DuckDuckGoSearchAdapter
  - YouTubeSearchAdapter

### Features
- **検索結果の統合表示**: 各エンジンの結果を個別セクションに表示
- **エラー耐性**: 個別エンジンの失敗が他に影響しない設計
- **パフォーマンス最適化**: 並列処理とキャッシュによる高速化
- **ユーザビリティ**: 直感的なインターフェースと操作性

---

## Development Notes

### Version Numbering
- **Major (X.0.0)**: 破壊的変更、アーキテクチャの大幅変更
- **Minor (0.X.0)**: 新機能追加、後方互換性あり
- **Patch (0.0.X)**: バグフィックス、小さな改善

### Release Process
1. 機能開発・テスト完了
2. バージョン番号の更新（package.json）
3. CHANGELOG.mdの更新
4. README.mdの更新（必要に応じて）
5. Gitタグの作成
6. GitHubリリースの作成

### Future Roadmap
- **v1.4.0**: 検索履歴機能
- **v1.5.0**: お気に入り機能
- **v1.6.0**: 検索フィルター機能
- **v2.0.0**: PWA対応、オフライン機能