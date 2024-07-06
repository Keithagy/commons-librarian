#!/usr/bin/env bash


target="$1"
shift

params1=()
params2=()

in_params2=0

# Iterate over all provided arguments
for arg in "$@"; do
    if [[ "$arg" == "---" ]]; then
        # When we encounter -- switch to filling params2
        in_params2=1
    elif [[ $in_params2 -eq 1 ]]; then
        # Add to params1 if we are not yet at --
        params2+=("$arg")
    else
        # Add to params2 after --
        params1+=("$arg")
    fi
done

yarn -s run build "$target" && node "${params1[@]}" build/target.cjs ${params2[@]}