#!/usr/bin/env bash


if [ "$#" -eq 0 ]; then
  echo "missing build target..."
  exit 1
fi

yarn -s esbuild "$@" --bundle  --loader:.ts=ts --platform=node "--external:jsdom" --external:node-pty --outfile=build/target.cjs --sourcemap

