@echo off
setlocal enabledelayedexpansion

echo =========================================================
echo       Compiling Fist Tool Native Standalone App (MSVC)
echo =========================================================

set VCVARS="C:\Program Files\Microsoft Visual Studio\18\Community\VC\Auxiliary\Build\vcvars64.bat"
if not exist %VCVARS% (
    echo Error: MSVC vcvars64.bat not found at %VCVARS%
    exit /b 1
)

call %VCVARS% >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Failed to initialize MSVC environment.
    exit /b 1
)

if not exist dist mkdir dist

cl /nologo /O2 /std:c++20 /EHsc /utf-8 /MT ^
   /I"vendor\webview2\build\native\include" ^
   /I"src\engine" ^
   src\app\main.cpp ^
   src\engine\fist_hardware.cpp ^
   src\engine\fist_timer.cpp ^
   src\engine\fist_memory.cpp ^
   src\engine\fist_services.cpp ^
   src\engine\fist_registry.cpp ^
   src\engine\fist_engine.cpp ^
   /Fe"dist\FistTool.exe" /Fo"dist\\" ^
   /link /SUBSYSTEM:WINDOWS ^
   vendor\webview2\build\native\x64\WebView2LoaderStatic.lib ^
   dwmapi.lib dxgi.lib winmm.lib psapi.lib advapi32.lib shell32.lib user32.lib gdi32.lib ole32.lib version.lib shlwapi.lib ^
   /OPT:REF /OPT:ICF

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] FistTool.exe compiled successfully!
    dir dist\FistTool.exe
) else (
    echo [ERROR] Compilation failed.
    exit /b 1
)
