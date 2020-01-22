#!/bin/bash
cd ${0%/*}/..

npx rollup -c ./bin/rollup.config.js
npx rollup -c ./bin/rollup.config.min.js
cp src/types.d.ts dist/flatout.d.ts
