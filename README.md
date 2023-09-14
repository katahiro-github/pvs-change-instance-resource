Power Virtual Server on IBM Cloud resource change tool
====

環境変数で定義されたPower Virtual Serverのインスタンスリソースを指定された内容で変更するためのツール

## Description
以下で指定された環境変数の内容に従って対象インスタンスのリソースサイズ変更を実行します。
- `PVS_APIKEY` : IBM Cloudで対象のPower Virtual Serverのリソース変更を要求可能なAPIキー
- `PVS_CRN` : 対象のPower Virtual Serverが所属するWorkspaceのCRN
- `PVS_REGION` : 対象のPower Virtual Serverが存在するリージョン (ex. tok , osa )
- `PVS_INSTNCEID` : 対象のPower Virtual ServerのインスタンスID
- `PVS_CORE_SIZE` : リソース変更後のコアサイズ(数値指定)
- `PVS_MEMORY_SIZE` : リソース変更後のメモリサイズ(GB単位で数値指定)
- `TOOL_PREFIX` : (Option) 指定された場合、標準出力のログに指定された文字列を出力する

## Requirement
- Node.js v18以上
- インターネット上の以下のエンドポイントに通信可能
  - https://iam.cloud.ibm.com/
  - https://PVS_REGION.power-iaas.cloud.ibm.com/

## Install
```npm install```

## setup
- `.env.sample` を `.env` にコピーする
    ```
    # Mac/Linux
    cp .env.sample .env
    
    # Windows
    copy .env.sample .env
    ```

- `.env` の環境変数を設定する
  - `Description` 記載の通りに設定する

- npm
  - install
  ```
  npm install
  ```

## Create Container
`docker-compose` を利用してコンテナイメージを作成します

```
docker-compose build
```
ローカル環境でコンテナでアプリを立ち上げる場合は、下記コマンドで起動します
```
# 起動
docker-compose up
```

必要に応じてImage RepositoryにPushしてください

## Execution Sample
```
C:\node-apps\>npm start
[2023-09-13T10:01:56.475] [INFO] default - [PVS-RSR-CHG-I000] Parameter check finished
[2023-09-13T10:01:56.481] [INFO] default - [PVS-RSR-CHG-I000] Required Information : Target Instance [xxxxx] Target Core Size [0.25] Target Memory Size [2]
[2023-09-13T10:01:58.419] [INFO] default - [PVS-RSR-CHG-I000] IAM response check finished
[2023-09-13T10:01:59.780] [INFO] default - [PVS-RSR-CHG-I000] PVS Reference Authorization check finished
[2023-09-13T10:02:03.298] [INFO] default - [PVS-RSR-CHG-I000] PVS Instance Exist check finished
[2023-09-13T10:02:06.299] [INFO] default - [PVS-RSR-CHG-I000] Consistency check of Parameter and PVS Instance finished
[2023-09-13T10:02:06.300] [INFO] default - [PVS-RSR-CHG-I000] PVS Instance Status check finished
[2023-09-13T10:02:08.325] [INFO] default - [PVS-RSR-CHG-I000] PVS Instance Resource Change is called
[2023-09-13T10:02:08.326] [INFO] default - [PVS-RSR-CHG-I000] Waiting for 120 seconds to Resource Change
[2023-09-13T10:04:14.679] [INFO] default - [PVS-RSR-CHG-I000] PVS Instance Resource Change is finished. Current resource is Core size [0.25] Memory size [2]
```

## Log Message ID
- Information Log
  |Message ID|内容|対応|
  |---|---|---|
  |I000|Informationログ、処理の状況を示します|N/A|
  ||

- Warning Log
  |Message ID|内容|対応|
  |---|---|---|
  |W000|正常ではないが、継続処理可能|N/A|
  |W001|指定されたリソースサイズと、対象インスタンスの現在のリソースサイズが一致|N/A|
  ||

- Error Log
  |Message ID|内容|対応|
  |---|---|---|
  |`E0xx` |パラメータエラー|
  |E001|必須パラメータが設定されていない|必須パラメータ(環境変数)の設定が不足していないか確認|
  |E002|指定されたパラメータに不備がある|必須パラメータの内容に不備がないか確認。詳しくはメッセージ内容を調査。|
  |E003|Power Virtual Serverのインスタンス一覧に指定されたインスタンスIDが存在しない|対象のインスタンスIDを正しく設定しているか確認|
  |E004|指定されたリソースサイズが、対象のインスタンスでは設定不可能な値を指定|リソースサイズのパラメータに正しい数値を設定しているか確認|
  ||
  |`E1xx` |API実行エラー(権限不足、指定あやまり等)|
  |E101|アクセストークン生成リクエストがhttpステータス200以外で応答され、アクセストークンが生成できない|APIキーが失効されていないか、またその文字列に誤りが無いか確認|
  |E102|Power Virtual ServerのAPI呼び出しリクエストがhttpステータス200以外で応答された|APIキーが対象のPower Virtual ServerのWorkspaceにアクセス可能か確認。また指定されているCRNが正しいかを確認。|
  |E103|Power Virtual Serverのインスタンス一覧取得API呼び出しリクエストがhttpステータス200以外で応答された|APIキーが対象のPower Virtual Serverのインスタンス一覧にアクセス可能か確認|
  |E104|Power Virtual Serverのインスタンス情報取得API呼び出しリクエストがhttpステータス200以外で応答された|APIキーが対象のPower Virtual Serverのインスタンスにアクセス可能か確認|
  |E105|Power Virtual Serverのインスタンスリソースサイズ変更API呼び出しリクエストがhttpステータス200、202以外で応答された|APIキーが対象のPower Virtual Serverのインスタンスへの変更権限があるか確認|
  ||
  |`E2xx` |API応答内容エラー(必須情報が参照できない等)|
  |E201|アクセストークン生成リクエストの応答にアクセストークンが含まれていない|APIキーが失効されていないか、またIBM CloudのIAM認証にエラーが発生していないか確認|
  ||
  |`E3xx` |Power Virtual Serverインスタンス状態エラー|
  |E301|対象インスタンスが表示された時間中リソース変更要求を受けられる状態ではなかった|対象のPower Virtual Serverのインスタンスが正常に起動しているか、IBM Cloudに問題が発生していないか確認|
  |E302|リソース変更要求を実行した後に対象インスタンスが表示された時間内にリソース変更が確認できなかった|対象のPower Virtual Serverのインスタンスが正常に起動しているか、IBM Cloudに問題が発生していないか確認|
  ||
  |`E9xx` |API実行エラー(予期しないエラー)|
  |E901|アクセストークン生成リクエストがhttpステータス200以外で応答され、アクセストークンが生成できない。その原因確認途中で予期しないエラーが発生|APIキーが失効されていないか、またその文字列に誤りが無いか確認。また実行環境とIBM Cloudとの間にネットワークトラブルが発生していないか確認|
  |E902|Power Virtual ServerのAPI呼び出しリクエストがhttpステータス200以外で応答された。その原因確認途中で予期しないエラーが発生|APIキーが対象のPower Virtual ServerのWorkspaceにアクセス可能か確認。また指定されているCRNが正しいかを確認。実行環境とIBM Cloudとの間にネットワークトラブルが発生していないか確認|
  |E903|Power Virtual Serverのインスタンス一覧取得API呼び出しリクエストがhttpステータス200以外で応答された。その原因確認途中で予期しないエラーが発生|APIキーが対象のPower Virtual Serverのインスタンス一覧にアクセス可能か確認。また実行環境とIBM Cloudとの間にネットワークトラブルが発生していないか確認|
  |E904|Power Virtual Serverのインスタンス情報取得API呼び出しリクエストがhttpステータス200以外で応答された。その原因確認途中で予期しないエラーが発生|APIキーが対象のPower Virtual Serverのインスタンスにアクセス可能か確認。また実行環境とIBM Cloudとの間にネットワークトラブルが発生していないか確認|
  |E905|Power Virtual Serverのインスタンスリソースサイズ変更API呼び出しリクエストがhttpステータス200、202以外で応答された。その原因確認途中で予期しないエラーが発生|APIキーが対象のPower Virtual Serverのインスタンスへの変更権限があるか確認。また実行環境とIBM Cloudとの間にネットワークトラブルが発生していないか確認|
  ||


## Licence

MIT

## Author

[katahiro](https://qiita.com/katahiro)

