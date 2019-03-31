#!/bin/bash
cd ${0%/*}/..

npx rollup -c ./bin/rollup.config.js
npx rollup -c ./bin/rollup.config.min.js