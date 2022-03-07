# yapa.js
*Yet another particle animation*



## WiP

https://tmsmr.github.io/yapa/

```
./node_modules/uglify-js/bin/uglifyjs --compress --mangle -- yapa.js > yapa.min.js
shasum -b -a 384 yapa-0.9.0.js | awk '{ print $1 }' | xxd -r -p | base64
```

## TODO
- smth. is odd with the fading of active connections when they are getting much longer than the configured max distance of normal connections...
  -> seems like the distance is ignored when the packet is in the last section of the transmission