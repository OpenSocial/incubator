#!/bin/sh
which jsdoc
if [ $? -eq 0 ]; then jsdoc -c jsdoc.json; else echo "jsdoc is not installed"; fi