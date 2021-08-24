cache-with-authentication
====

nginxで認証付きのキャッシュを検証するためのサンプル

## setup

```bash
docker-compose up -d db
docker-compose exec db bash -c "mysql -u root -ppassword < /tmp/create_table.sql"
docker-compose up -d
```

`http:localhost:3000` でアクセスできる

## キャッシュについて

アップロードした画像はログインしている状態の時に見ることができる仕様。

アップロードされて1回目の時は、画像のレスポンスのヘッダーに `X-Nginx-Cache: MISS` が含まれていて、アプリケーションに対して画像のアクセスが行われている。  
2回目以降のアクセスは `X-Nginx-Cache: HIT` となり、キャッシュされた画像がnginxから返される。

ログアウトすると、キャッシュされていても認証に失敗するのでnginxから画像のレスポンスは返らない。

設定は `.nginx/app.conf` を参照。
