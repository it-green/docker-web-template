# docker-web-template

Dockerを使用したウェブ開発テンプレートです。

### 使用出来る言語など

- Ejs
- SCSS
- js
- PHP
- MySQL
- Composer

### 開発にあたっての注意点

pages ディレクトリにある ejs ファイルや php ファイルを追加した際は、その都度開発環境構築をストップしてから再度開発サーバーを動かしてください。現状、自動的に動かすことが難しいのでどこかのタイミングで修正できるようにします。

### 主な機能

- webp の自動生成
- Stylelint によるスタイルの自動フォーマット（保存で自動的に修正）
- js の自動フォーマット
- ホットリロード
- ビルド機能
- Composer による PHP ライブラリの管理

### 各ディレクトリの説明

```
src/ ウェブサイトのソースコード
  ├ assets/ 画像ファイル
  ├ components/ 再利用できるhtml（ボタンなど）
  ├ js/
     └ entry/ 使用する js は、この下に配置
  ├ layouts/ ヘッダーやフッターなどのページの外観を定義するファイル
  ├ components/ ボタンなどのコンポーネントの定義
  ├ pages/ ページとして表示される html や php のファイルを配置してください
  ├ scss/ scss のファイル群
```

### .envファイルについて

SQLを使用する場合は、.envファイルを追加してください。

内容は以下の通りで大丈夫です。

```.env
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=php-docker-db
MYSQL_USER=user
MYSQL_PASSWORD=password
```

### installation

最初に開発に必要なモジュールなどを一式ダウンロードしてください。

```bash
$ npm i
```

```bash
$ composer install
```

### start

開発を行う際は、下記のコマンドを実行してください。

```bash
$ npm run dev
```

### Docker stop

開発が終了したら、下記のコマンドで Docker をストップしてください。

```bash
$ npm run docker:stop
```

### Docker build

納品の際には下記のコマンドを実行してください。dest ディレクトリに最適化されたソースコードが作成されます。

```bash
$ npm run build
```
