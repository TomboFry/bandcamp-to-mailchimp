#!/bin/bash

RESULT=`ps aux | grep node | head -n 1 | awk '{ print $2 }'`
echo Killing process $RESULT
sudo kill $RESULT
