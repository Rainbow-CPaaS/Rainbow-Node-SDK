@echo off
set MODE=%1
if "%MODE%"=="" set MODE=all

if /I "%MODE%"=="modified" (
    echo Cleaning only modified JS files compared to last commit...
    for /f "tokens=*" %%F in ('git diff --name-only HEAD src/') do (
        set "SOURCE_FILE=%%F"
        setlocal enabledelayedexpansion
        :: Check if it's a .ts file
        if "!SOURCE_FILE:~-3!"==".ts" (
            set "REL_PATH=!SOURCE_FILE:src/=!"
            set "JS_FILE=!REL_PATH:.ts=.js!"
            set "MAP_FILE=!REL_PATH:.ts=.js.map!"
            
            set "JS_FILE=!JS_FILE:/=\!"
            set "MAP_FILE=!MAP_FILE:/=\!"
            
            if exist "!JS_FILE!" (
                echo Deleting !JS_FILE!
                del /F /Q "!JS_FILE!"
            )
            if exist "!MAP_FILE!" (
                echo Deleting !MAP_FILE!
                del /F /Q "!MAP_FILE!"
            )
        )
        endlocal
    )
) else (
    echo Cleaning all generated JS files...
    if exist index.js del /Q index.js
    if exist index.js.map del /Q index.js.map
    if exist Samples del /S /Q Samples\*.js
    if exist Samples del /S /Q Samples\*.js.map
    if exist lib del /S /Q lib\*.js
    if exist lib del /S /Q lib\*.js.map
)

:: CRITICAL: We recreate an empty Samples/index.js so WebStorm allows the run configuration to start
if not exist Samples mkdir Samples
type nul > Samples\index.js

echo Cleaning completed (mode: %MODE%).
