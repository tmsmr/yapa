# yapa.js versions

Generate checksum for js href with signature check: `shasum -b -a 384 yapa-*.js | awk '{ print $1 }' | xxd -r -p | base64`
