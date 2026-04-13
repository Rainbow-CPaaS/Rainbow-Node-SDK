@echo off
echo Waiting 3 seconds for file system sync...
:: Using ping to create a reliable delay on Windows
ping 127.0.0.1 -n 4 > nul
echo Ready.
