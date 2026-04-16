@echo off
echo Waiting 7 seconds for file system sync...
:: Using ping to create a reliable delay on Windows
ping 127.0.0.1 -n 8 > nul
echo Ready.
