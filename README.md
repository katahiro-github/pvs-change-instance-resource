Power Virtual Server on IBM Cloud resource change tool
====

環境変数で定義されたPower Virtual Serverのインスタンスリソースを指定された内容で変更するためのツール<br><br>
A tool for modifying Power Virtual Server instance resources defined by environment variables with specified contents.

## Description
以下で指定された環境変数の内容に従って対象インスタンスのリソースサイズ変更要求を実行します。
- `PVS_APIKEY` : IBM Cloudで対象のPower Virtual Serverのリソース変更を要求可能なAPIキー
- `PVS_CRN` : 対象のPower Virtual Serverが所属するWorkspaceのCRN
- `PVS_REGION` : 対象のPower Virtual Serverが存在するリージョン (ex. tok , osa )
- `PVS_INSTNCEID` : 対象のPower Virtual ServerのインスタンスID
- `PVS_CORE_SIZE` : リソース変更後のコアサイズ(数値指定)
- `PVS_MEMORY_SIZE` : リソース変更後のメモリサイズ(GB単位で数値指定)
- `TOOL_PREFIX` : (Option) 指定された場合、標準出力のログに指定された文字列を出力する
<br><br>

Executes a resource size change request for the target instance according to the contents of the environment variables specified below.
- `PVS_APIKEY` : API key that allows you to request resource changes for the target Power Virtual Server in IBM Cloud
- `PVS_CRN` : CRN of the Workspace to which the target Power Virtual Server belongs
- `PVS_REGION` : Region where the target Power Virtual Server resides (ex. tok , osa )
- `PVS_INSTNCEID` : Instance ID of the target Power Virtual Server
- `PVS_CORE_SIZE` : Core size after resource change (specify numerical value)
- `PVS_MEMORY_SIZE` : Memory size after resource change (specified numerically in GB)
- `TOOL_PREFIX` : (Option) If specified, prints the specified string to the log on standard output.

## Caution
このツールは指定されたパラメータに沿ってPower Virtual Serverのインスタンスリソースの変更要求を行いますが、その変更を担保するものではありません。
以下のような原因で変更が失敗するケースがあることを念頭にご利用ください。
- インスタンスが変更要求を受け付けられる状態ではない
- インスタンスが存在する実機に要求されたリソースを割り振る余裕リソースが無い
- ツール実行環境が必要なネットワーク環境に接続されていない
<br><br>

This tool requests changes to Power Virtual Server instance resources according to the specified parameters, but does not guarantee the changes.
Please keep in mind that changes may fail due to the following reasons.
- Instance is not ready to accept change requests
- There are no resources available to allocate the requested resources to the actual machine where the instance exists.
- The tool execution environment is not connected to the required network environment

## Requirement
- Node.js version 18 or higher
- インターネット上の以下のエンドポイントに通信可能 / Can communicate with the following endpoints on the Internet
  - https://iam.cloud.ibm.com/
  - https://PVS_REGION.power-iaas.cloud.ibm.com/

## setup
- `.env.sample` を `.env` にコピーする<br>Copy `.env.sample` to `.env`
    ```
    # Mac/Linux
    cp .env.sample .env
    
    # Windows
    copy .env.sample .env
    ```

- `.env` の環境変数を設定する<br>Setting environment variables in `.env`
  - `Description` 記載の通りに設定する<br>Configure as described in `Description`

- npm
  - install
  ```
  npm install
  ```

## Create Container
`docker-compose` を利用してコンテナイメージを作成します。<br>
Create container with `docker-compose`
```
docker-compose build
```
ローカル環境でコンテナでアプリを立ち上げる場合は、下記コマンドで起動します<br>
If you want to start the application in a container in the local environment, start it with the following command.
```
docker-compose up
```

必要に応じてImage RepositoryにPushしてください<br>
Push to Image Repository if necessary

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
  |Message ID|内容 / Detail|対応 / What to do|
  |---|---|---|
  |I000|Informationログ、処理の状況を示します<br>Information log, shows the status of processing|N/A|
  ||

- Warning Log
  |Message ID|内容 / Detail|対応 / What to do|
  |---|---|---|
  |W000|正常ではないが、継続処理可能<br>Not normal, but can continue processing|N/A|
  |W001|指定されたリソースサイズと、対象インスタンスの現在のリソースサイズが一致<br>The specified resource size matches the current resource size of the target instance.|N/A|
  ||

- Error Log
  |Message ID|内容 / Detail|対応 / What to do|
  |---|---|---|
  |`E0xx` |パラメータエラー<br>parameter error|
  |E001|必須パラメータが設定されていない<br>Required parameter not set|必須パラメータ(環境変数)の設定が不足していないか確認<br>Check if required parameters (environment variables) are set correctly.|
  |E002|指定されたパラメータに不備がある<br>There is a problem with the specified parameter|必須パラメータの内容に不備がないか確認。詳しくは出力されたメッセージ内容を調査。<br>Check that the required parameters are correct. Check the output message content for details.|
  |E003|Power Virtual Serverのインスタンス一覧に指定されたインスタンスIDが存在しない<br>The specified instance ID does not exist in the Power Virtual Server instance list|対象のインスタンスIDを正しく設定しているか確認<br>Check if the target instance ID is set correctly|
  |E004|指定されたリソースサイズが、対象のインスタンスでは設定不可能な値を指定<br>The specified resource size specifies a value that cannot be set on the target instance.|リソースサイズのパラメータに正しい数値を設定しているか確認<br>Check whether the correct value is set for the resource size parameter|
  ||
  |`E1xx` |API実行エラー(権限不足、指定あやまり等)<br>API execution error (insufficient authority, incorrect specification, etc.)|
  |E101|アクセストークン生成リクエストがhttpステータス200以外で応答され、アクセストークンが生成できない<br>Access token generation request is responded with http status other than 200 and access token cannot be generated|APIキーが失効されていないか、またその文字列に誤りが無いか確認<br>Check whether the API key has been expired and whether there are any errors in the string.|
  |E102|Power Virtual ServerのAPI呼び出しリクエストがhttpステータス200以外で応答された<br>Power Virtual Server API call request responded with http status other than 200|APIキーが対象のPower Virtual ServerのWorkspaceにアクセス可能か確認。また指定されているCRNが正しいかを確認。<br>Check whether the API key can access Workspace of the target Power Virtual Server. Also check if the specified CRN is correct.|
  |E103|Power Virtual Serverのインスタンス一覧取得API呼び出しリクエストがhttpステータス200以外で応答された<br>Power Virtual Server instance list acquisition API call request was responded with http status other than 200|APIキーが対象のPower Virtual Serverのインスタンス一覧にアクセス可能か確認<br>Check if the API key can access the target Power Virtual Server instance list|
  |E104|Power Virtual Serverのインスタンス情報取得API呼び出しリクエストがhttpステータス200以外で応答された<br>Power Virtual Server instance information retrieval API call request was responded with http status other than 200|APIキーが対象のPower Virtual Serverのインスタンスにアクセス可能か確認<br>Check if the API key can access the target Power Virtual Server instance|
  |E105|Power Virtual Serverのインスタンスリソースサイズ変更API呼び出しリクエストがhttpステータス200、202以外で応答された<br>Power Virtual Server instance resource resizing API call request responded with http status other than 200, 202|APIキーが対象のPower Virtual Serverのインスタンスへの変更権限があるか確認<br>Check if the API key has permission to change the target Power Virtual Server instance|
  ||
  |`E2xx` |API応答内容エラー(必須情報が参照できない等)<br>API response content error (required information cannot be referenced, etc.)|
  |E201|アクセストークン生成リクエストの応答にアクセストークンが含まれていない<br>Access token is not included in the response of access token generation request|APIキーが失効されていないか、またIBM CloudのIAM認証にエラーが発生していないか確認<br>Check if the API key has been revoked or if there are any errors with IBM Cloud IAM authentication|
  ||
  |`E3xx` |Power Virtual Serverインスタンス状態エラー<br>Power Virtual Server instance state error|
  |E301|対象インスタンスが表示された時間中リソース変更要求を受けられる状態ではなかった<br>The target instance was not in a state where it could receive resource change requests during the displayed time.|対象のPower Virtual Serverのインスタンスが正常に起動しているか、IBM Cloudに問題が発生していないか確認<br>Check whether the target Power Virtual Server instance has started normally and whether there are any problems with IBM Cloud.|
  |E302|リソース変更要求を実行した後に対象インスタンスが表示された時間内にリソース変更が確認できなかった<br>The resource change could not be confirmed within the time the target instance was displayed after executing the resource change request.|対象のPower Virtual Serverのインスタンスが正常に起動しているか、IBM Cloudに問題が発生していないか確認<br>Check whether the target Power Virtual Server instance has started normally and whether there are any problems with IBM Cloud.|
  ||
  |`E9xx` |API実行エラー(予期しないエラー)<br>API execution error (unexpected error)|
  |E901|アクセストークン生成リクエストがhttpステータス200以外で応答され、アクセストークンが生成できない。その原因確認途中で予期しないエラーが発生<br>Access token generation request is responded with http status other than 200 and access token cannot be generated. An unexpected error occurred while checking the cause.|APIキーが失効されていないか、またその文字列に誤りが無いか確認。また実行環境とIBM Cloudとの間にネットワークトラブルが発生していないか確認<br>Check that the API key has not been revoked and that there are no errors in the string. Also check if there are any network problems between the execution environment and IBM Cloud.|
  |E902|Power Virtual ServerのAPI呼び出しリクエストがhttpステータス200以外で応答された。その原因確認途中で予期しないエラーが発生<br>A Power Virtual Server API call request is responded with an http status other than 200. An unexpected error occurred while checking the cause.|APIキーが対象のPower Virtual ServerのWorkspaceにアクセス可能か確認。また指定されているCRNが正しいかを確認。実行環境とIBM Cloudとの間にネットワークトラブルが発生していないか確認<br>Check whether the API key can access Workspace of the target Power Virtual Server. Also check if the specified CRN is correct. Check if there are any network problems between the execution environment and IBM Cloud|
  |E903|Power Virtual Serverのインスタンス一覧取得API呼び出しリクエストがhttpステータス200以外で応答された。その原因確認途中で予期しないエラーが発生<br>The Power Virtual Server instance list acquisition API call request was responded with an http status other than 200. An unexpected error occurred while checking the cause.|APIキーが対象のPower Virtual Serverのインスタンス一覧にアクセス可能か確認。また実行環境とIBM Cloudとの間にネットワークトラブルが発生していないか確認<br>Check whether the API key can access the target Power Virtual Server instance list. Also check if there are any network problems between the execution environment and IBM Cloud.|
  |E904|Power Virtual Serverのインスタンス情報取得API呼び出しリクエストがhttpステータス200以外で応答された。その原因確認途中で予期しないエラーが発生<br>A Power Virtual Server instance information acquisition API call request was responded with an http status other than 200. An unexpected error occurred while checking the cause.|APIキーが対象のPower Virtual Serverのインスタンスにアクセス可能か確認。また実行環境とIBM Cloudとの間にネットワークトラブルが発生していないか確認<br>Check if the API key can access the target Power Virtual Server instance. Also check if there are any network problems between the execution environment and IBM Cloud.|
  |E905|Power Virtual Serverのインスタンスリソースサイズ変更API呼び出しリクエストがhttpステータス200、202以外で応答された。その原因確認途中で予期しないエラーが発生<br>A Power Virtual Server instance resource resizing API call request was responded with an http status other than 200 or 202. An unexpected error occurred while checking the cause.|APIキーが対象のPower Virtual Serverのインスタンスへの変更権限があるか確認。また実行環境とIBM Cloudとの間にネットワークトラブルが発生していないか確認<br>Check whether the API key has permission to change the target Power Virtual Server instance. Also check if there are any network problems between the execution environment and IBM Cloud.|
  ||


## Licence

MIT

## Author

[katahiro](https://qiita.com/katahiro)

