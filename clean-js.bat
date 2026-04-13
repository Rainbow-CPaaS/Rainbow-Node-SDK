@echo off
echo Cleaning generated JS files...
:: Delete index.js and index.js.map at the root (generated from src/index.ts)
if exist index.js del /Q index.js
if exist index.js.map del /Q index.js.map

:: Delete all .js and .js.map in the Samples folder
if exist Samples del /S /Q Samples\*.js
if exist Samples del /S /Q Samples\*.js.map

:: Optional: Delete the lib folder if it's generated
if exist lib del /S /Q lib\*.js
if exist lib del /S /Q lib\*.js.map

echo Cleaning completed.
