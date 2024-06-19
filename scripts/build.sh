#!/usr/bin/env bash

esbuild "$@" --bundle  --loader:.ts=ts --platform=node "--external:@babel/preset-typescript/*" --external:node-pty --outfile=build/target.cjs --sourcemap

