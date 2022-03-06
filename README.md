# yapa

## WiP

https://tmsmr.github.io/yapa/

```
./node_modules/uglify-js/bin/uglifyjs --compress --mangle -- yapa.js > yapa.min.js
shasum -b -a 384 yapa-0.9.0.js | awk '{ print $1 }' | xxd -r -p | base64
```
