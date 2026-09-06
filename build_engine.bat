@echo off
setlocal enabledelayedexpansion

echo =========================================================
echo       Compiling FistEngine Native C++ Engine (MSVC)
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

cl /nologo /O2 /std:c++20 /EHsc /utf-8 /I"src\engine" /D "FIST_ENGINE_EXPORTS" ^
   src\engine\fist_hardware.cpp ^
   src\engine\fist_timer.cpp ^
   src\engine\fist_memory.cpp ^
   src\engine\fist_services.cpp ^
   src\engine\fist_registry.cpp ^
   src\engine\fist_engine.cpp ^
   src\engine\fist_c_api.cpp ^
   /LD /Fe"dist\FistEngine.dll" /Fo"dist\\" ^
   /link /OPT:REF /OPT:ICF dxgi.lib winmm.lib psapi.lib advapi32.lib shell32.lib

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] FistEngine.dll compiled successfully!
    dir dist\FistEngine.dll
) else (
    echo [ERROR] Compilation failed.
    exit /b 1
)
