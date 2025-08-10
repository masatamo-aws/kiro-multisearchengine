# マルチサーチエンジン

複数の検索エンジン（Google、Bing、Yahoo Japan、DuckDuckGo、YouTube、Baidu）で同時に検索を実行し、結果を並列表示するWebアプリケーションです。

## スクリーンショット

### ライトモード
![ライトモード](https://raw.githubusercontent.com/masatamo-aws/kiro-multisearchengine/main/assets/image/Light%20Mode.png)

### ダークモード
![ダークモード](https://raw.githubusercontent.com/masatamo-aws/kiro-multisearchengine/main/assets/image/Dark%20Mode.png)

## 機能

- **複数検索エンジン対応**: 6つの主要検索エンジンで同時検索
- **多言語サポート**: 日本語、英語、中国語、韓国語に対応
- **レスポンシブデザイン**: デスクトップ・モバイル両対応
- **リアルタイム結果表示**: 検索結果が利用可能になり次第順次表示
- **エラーハンドリング**: 各検索エンジンの個別エラー処理
- **キャッシュ機能**: 検索結果の一時保存でパフォーマンス向上
- **プライバシー重視**: ユーザー情報の収集なし
- **直接リンク**: 各検索エンジンで直接検索できるリンク機能
- **ダークモード**: ライトモードとダークモードの切り替え対応

## サポート検索エンジン

| 検索エンジン | 対応言語 | 特徴 |
|------------|---------|------|
| Google | 全言語 | 最も包括的な検索結果 |
| Bing | 全言語 | Microsoft提供の検索エンジン |
| Yahoo Japan | 主に日本語 | 日本のローカル情報に強い |
| DuckDuckGo | 全言語 | プライバシー重視の検索 |
| YouTube | 全言語 | 動画コンテンツ専門 |
| Baidu | 主に中国語 | 中国最大の検索エンジン |

## 使用方法

### 基本的な使い方

1. **言語選択**: ページ上部のドロップダウンから検索言語を選択
2. **検索実行**: 検索ボックスにキーワードを入力し、「検索」ボタンをクリック
3. **結果確認**: 各検索エンジンの結果が個別のセクションに表示されます
4. **結果クリア**: 「クリア」ボタンで検索結果をリセット

### 高度な機能

- **🌐 言語切り替え**: 検索後でも言語を変更して再検索可能
- **⚠️ 個別エラー表示**: 特定の検索エンジンでエラーが発生しても他の結果は表示継続
- **⚡ プログレッシブローディング**: 検索結果が準備でき次第順次表示
- **🔗 直接検索リンク**: 各検索エンジンのヘッダーから直接そのエンジンで検索可能
- **🌙 テーマ切り替え**: ラジオボタンでライトモードとダークモードを選択可能
- **💾 設定の永続化**: テーマ設定がローカルストレージに自動保存
- **🔍 システムテーマ検出**: OSの設定に基づく初期テーマの自動選択

## 技術仕様

### フロントエンド
- **HTML5**: セマンティックなマークアップ
- **CSS3**: Flexbox/Gridを使用したレスポンシブデザイン
- **JavaScript (ES6+)**: モジュラー設計のVanilla JavaScript

### アーキテクチャ
- **🏗️ レイヤードアーキテクチャ**: UI層、アプリケーション層、アダプター層の明確な分離
- **🔌 アダプターパターン**: 各検索エンジンの統一インターフェース
- **🎭 ファサードパターン**: MultiSearchAppによる複雑性の隠蔽
- **👀 オブザーバーパターン**: 検索進捗の通知システム
- **⚠️ エラーハンドリング**: 包括的なエラー処理システム
- **💾 キャッシュシステム**: LRU方式による効率的なキャッシュ管理
- **🎨 テーマシステム**: CSS変数による動的テーマ切り替え

詳細なアーキテクチャについては [logicalarchitecture.md](logicalarchitecture.md) をご覧ください。

### パフォーマンス
- **並列処理**: Promise.allSettledによる同時検索実行
- **キャッシュ**: 5分間の結果キャッシュ
- **レート制限**: 各検索エンジンの制限に配慮
- **タイムアウト**: 10秒のタイムアウト設定

## セットアップ

### 必要な環境
- モダンなWebブラウザ（Chrome、Firefox、Safari、Edge）
- JavaScript有効
- インターネット接続

### インストール

1. リポジトリをクローン:
```bash
git clone https://github.com/masatamo-aws/kiro-multisearchengine.git
cd kiro-multisearchengine
```

2. Webサーバーで起動:
```bash
# Python 3の場合
python -m http.server 8000

# Node.jsの場合
npx http-server

# PHP の場合
php -S localhost:8000
```

3. ブラウザでアクセス:
```
http://localhost:8000
```

### CORS制限について

多くの検索エンジンはCORS（Cross-Origin Resource Sharing）制限により、ブラウザから直接アクセスできません。本アプリケーションでは以下の対策を実装しています：

1. **モックデータ**: CORS制限時は代替データを表示
2. **プロキシサーバー**: 開発環境でのプロキシ使用を推奨
3. **ブラウザ拡張**: 将来的な拡張機能化を検討

## ファイル構造

```
kiro-multiserchengine/
├── index.html              # メインHTML
├── README.md              # プロジェクト説明
├── CHANGELOG.md           # 変更履歴
├── requirements.md        # 要件定義書
├── design.md             # 設計書
├── tasks.md              # 実装計画
├── logicalarchitecture.md # 論理アーキテクチャ文書
├── package.json          # プロジェクト設定
├── .gitignore           # Git除外設定
├── css/
│   └── style.css        # スタイルシート（ダークモード対応）
└── js/
    ├── app.js           # メインアプリケーション
    ├── searchManager.js # 検索管理
    ├── ui.js           # UI管理
    ├── languageManager.js # 言語管理
    ├── themeManager.js  # テーマ管理
    ├── errorHandler.js  # エラーハンドリング
    ├── searchCache.js   # キャッシュ管理
    └── adapters/        # 検索エンジンアダプター
        ├── googleSearchAdapter.js
        ├── bingSearchAdapter.js
        ├── yahooSearchAdapter.js
        ├── duckduckgoSearchAdapter.js
        ├── youtubeSearchAdapter.js
        └── baiduSearchAdapter.js
```

## カスタマイズ

### 新しい検索エンジンの追加

1. `js/adapters/`に新しいアダプターファイルを作成
2. `SearchManager`に新しいアダプターを登録
3. `LanguageManager`に言語パラメータを追加
4. HTMLに結果表示セクションを追加

### 言語の追加

`js/languageManager.js`の`initializeSupportedLanguages()`メソッドに新しい言語設定を追加:

```javascript
'新言語コード': {
    code: '新言語コード',
    name: '言語名',
    nativeName: 'ネイティブ言語名',
    supportedEngines: ['google', 'bing', ...],
    searchParameters: {
        // 各検索エンジンのパラメータ
    }
}
```

## トラブルシューティング

### よくある問題

**Q: 検索結果が表示されない**
A: CORS制限により直接アクセスできない場合があります。プロキシサーバーの使用を検討してください。

**Q: 特定の検索エンジンでエラーが発生する**
A: ネットワーク接続やレート制限が原因の可能性があります。しばらく待ってから再試行してください。

**Q: モバイルで表示が崩れる**
A: ブラウザのキャッシュをクリアしてください。レスポンシブデザインに対応しています。

### デバッグ

開発者ツールのコンソールでデバッグ情報を確認できます：

```javascript
// アプリケーション状態の確認
console.log(window.multiSearchApp);

// キャッシュ統計の確認
console.log(window.multiSearchApp.searchManager.cache.getStats());

// エラー統計の確認
console.log(window.multiSearchApp.errorHandler.getErrorStats());
```

## ライセンス

MIT License

## 貢献

プルリクエストや課題報告を歓迎します。

## ドキュメント

- **[CHANGELOG.md](CHANGELOG.md)**: 詳細な変更履歴
- **[requirements.md](requirements.md)**: 要件定義書
- **[design.md](design.md)**: 設計書
- **[tasks.md](tasks.md)**: 実装計画
- **[logicalarchitecture.md](logicalarchitecture.md)**: 論理アーキテクチャ文書

## 更新履歴

最新の変更履歴については [CHANGELOG.md](CHANGELOG.md) をご覧ください。

### 最新版 v1.3.1 (2025-01-08)
- 📸 アプリケーションスクリーンショットの追加
- 📖 包括的ドキュメント整備と統一
- � GーitHubリポジトリURLの統一
- ✅ 全機能実装完了
- 📚 プロジェクト完成度の向上

### v1.3.0 (2025-01-08)
- ✨ ダークモード機能追加
- 🎨 ライトモードとダークモードの切り替え対応
- 💾 テーマ設定の永続化（ローカルストレージ）
- 🔍 システムテーマの自動検出
- 📚 論理アーキテクチャ文書の追加

## サポート

問題や質問がある場合は、GitHubのIssuesページで報告してください。

---

**注意**: このアプリケーションは教育・研究目的で作成されています。商用利用の際は各検索エンジンの利用規約を確認してください。