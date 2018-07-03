# node-proxy

## 開発したモチベーション

* 名前解決をデーモン起動時に行ってしまうプログラムのために開発した
* 期待される効果としては名前解決をプロキシ側で行うことで接続時に名前解決されるように改善する

## install

```
git clone https://github.com/you21979/node-proxy.git
cd node-proxy
cp config/log.json.org config/log.json
npm i
cp misc/proxy-server-https.service /etc/systemd/system/
```

## execute

```
node ./bin/proxy_app.js [proxyport] [targethost] [targetport]
```

## ex

```
./bin/proxy_app.js 3000 www.google.com 80
```
