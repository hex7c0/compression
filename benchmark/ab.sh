#!/bin/bash

clear

echo
echo
ab -H "Accept-Encoding: gzip" -c 100 -n 5000 127.0.0.1:3000/no_compression

echo
echo
ab -H "Accept-Encoding: gzip" -c 100 -n 5000 127.0.0.1:3000/with_compression

echo
echo
ab -H "Accept-Encoding: gzip" -c 100 -n 5000 127.0.0.1:3000/with_level_compression