#!/bin/bash
if [ ! -f /initizlized ]; then
    echo "====Start to initialize====";
    bash sh/build-database.sh;
    touch /initialized;
    echo "====Initialized====";
fi &

node server/app.js;
