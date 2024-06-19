#!/usr/bin/env bash


target="$1"
shift

yarn -s run build "$target"; node "$@" build/target.cjs