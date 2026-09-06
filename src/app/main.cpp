#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <windows.h>
#include <dwmapi.h>
#include <wrl.h>
#include <string>
#include <sstream>
#include <vector>

#include "WebView2.h"
#include "../engine/fist_engine.h"

#pragma comment(lib, "dwmapi.lib")
#pragma comment(lib, "user32.lib")
#pragma comment(lib, "gdi32.lib")
#pragma comment(lib, "shell32.lib")
#pragma comment(lib, "ole32.lib")
#pragma comment(lib, "dxgi.lib")
#pragma comment(lib, "winmm.lib")
#pragma comment(lib, "psapi.lib")
#pragma comment(lib, "advapi32.lib")

using namespace Microsoft::WRL;

// Global State
static HWND g_hWnd = NULL;
static ComPtr<ICoreWebView2Controller> g_controller = nullptr;
static ComPtr<ICoreWebView2> g_webview = nullptr;
static Fist::Engine g_engine;

// Simple JSON helper for C++20
static std::wstring EscapeJsonString(const std::wstring& input) {
    std::wstring out;
    for (wchar_t c : input) {
        if (c == L'\\') out += L"\\\\";
        else if (c == L'"') out += L"\\\"";
        else if (c == L'\n') out += L"\\n";
        else if (c == L'\r') out += L"\\r";
        else if (c == L'\t') out += L"\\t";
        else out += c;
    }
    return out;
}

// Build JSON payload of live hardware specs
static std::wstring GetHardwareJson() {
    auto hw = g_engine.GetHardwareSpecs();
    std::wstringstream ss;
    ss << L"{"
       << L"\"type\":\"hardware_data\","
       << L"\"cpuName\":\"" << EscapeJsonString(hw.cpu.name) << L"\","
       << L"\"cpuVendor\":\"" << EscapeJsonString(hw.cpu.vendor) << L"\","
       << L"\"physicalCores\":" << hw.cpu.physicalCores << L","
       << L"\"logicalCores\":" << hw.cpu.logicalCores << L","
       << L"\"gpuName\":\"" << (!hw.gpus.empty() ? EscapeJsonString(hw.gpus[0].name) : L"Dedicated GPU") << L"\","
       << L"\"gpuVendor\":\"" << (!hw.gpus.empty() ? EscapeJsonString(hw.gpus[0].vendor) : L"generic") << L"\","
       << L"\"vramGB\":" << (!hw.gpus.empty() ? (double)hw.gpus[0].dedicatedVramBytes / (1024.0 * 1024.0 * 1024.0) : 0.0) << L","
       << L"\"ramTotalGB\":" << (double)hw.ram.totalBytes / (1024.0 * 1024.0 * 1024.0) << L","
       << L"\"ramAvailGB\":" << (double)hw.ram.availableBytes / (1024.0 * 1024.0 * 1024.0) << L","
       << L"\"ramLoad\":" << hw.ram.loadPercentage << L","
       << L"\"timerResolutionMs\":" << g_engine.QueryCurrentTimerResolution() << L","
       << L"\"isAdmin\":" << (hw.isElevatedAdmin ? L"true" : L"false")
       << L"}";
    return ss.str();
}

// Window Procedure
LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam) {
    switch (message) {
    case WM_SIZE:
        if (g_controller != nullptr) {
            RECT bounds;
            GetClientRect(hWnd, &bounds);
            g_controller->put_Bounds(bounds);
        }
        return 0;

    case WM_DESTROY:
        g_engine.ResetTimerResolution();
        PostQuitMessage(0);
        return 0;
    }
    return DefWindowProc(hWnd, message, wParam, lParam);
}

// Entry Point
int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, PWSTR pCmdLine, int nCmdShow) {
    // 1. Single Instance Check via Mutex
    HANDLE hMutex = CreateMutexW(NULL, TRUE, L"FistTool_SingleInstance_Mutex");
    if (GetLastError() == ERROR_ALREADY_EXISTS) {
        HWND existingWnd = FindWindowW(L"FistToolWindowClass", L"Fist Tool");
        if (existingWnd) {
            ShowWindow(existingWnd, SW_RESTORE);
            SetForegroundWindow(existingWnd);
        }
        return 0;
    }

    // 2. High-DPI Awareness
    SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);

    // 3. Register Window Class
    const wchar_t CLASS_NAME[] = L"FistToolWindowClass";
    WNDCLASSEXW wc = { sizeof(WNDCLASSEXW) };
    wc.lpfnWndProc = WndProc;
    wc.hInstance = hInstance;
    wc.lpszClassName = CLASS_NAME;
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hIcon = LoadIcon(NULL, IDI_APPLICATION);
    wc.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH);
    RegisterClassExW(&wc);

    // 4. Create Window
    int screenW = GetSystemMetrics(SM_CXSCREEN);
    int screenH = GetSystemMetrics(SM_CYSCREEN);
    int winW = 1280;
    int winH = 820;
    int posX = (screenW - winW) / 2;
    int posY = (screenH - winH) / 2;

    HWND hWnd = CreateWindowExW(
        0,
        CLASS_NAME,
        L"Fist Tool",
        WS_OVERLAPPEDWINDOW | WS_VISIBLE,
        posX, posY, winW, winH,
        NULL, NULL, hInstance, NULL
    );

    if (!hWnd) return 0;
    g_hWnd = hWnd;

    // 5. Enable Immersive Dark Mode for Title Bar (DWMWA_USE_IMMERSIVE_DARK_MODE)
    BOOL darkMode = TRUE;
    DwmSetWindowAttribute(hWnd, 20, &darkMode, sizeof(darkMode)); // Windows 11 / 10 20H1+
    DwmSetWindowAttribute(hWnd, 19, &darkMode, sizeof(darkMode)); // Windows 10 fallback

    COLORREF darkTitleBar = RGB(8, 11, 18);
    DwmSetWindowAttribute(hWnd, 35, &darkTitleBar, sizeof(darkTitleBar)); // DWMWA_CAPTION_COLOR

    // 6. Lock 0.5ms High Resolution Timer
    g_engine.SetTimerResolution(0.5);

    // 7. Initialize WebView2
    wchar_t exePath[MAX_PATH];
    GetModuleFileNameW(NULL, exePath, MAX_PATH);
    std::wstring exeDir = exePath;
    exeDir = exeDir.substr(0, exeDir.find_last_of(L"\\/"));

    // App data folder for WebView2 cache
    wchar_t tempPath[MAX_PATH];
    GetTempPathW(MAX_PATH, tempPath);
    std::wstring userFolder = std::wstring(tempPath) + L"FistTool_WebView2";

    CreateCoreWebView2EnvironmentWithOptions(
        nullptr, userFolder.c_str(), nullptr,
        Callback<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler>(
            [hWnd, exeDir](HRESULT result, ICoreWebView2Environment* env) -> HRESULT {
                if (FAILED(result) || !env) return result;

                env->CreateCoreWebView2Controller(
                    hWnd,
                    Callback<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler>(
                        [hWnd, exeDir](HRESULT result, ICoreWebView2Controller* controller) -> HRESULT {
                            if (FAILED(result) || !controller) return result;

                            g_controller = controller;
                            g_controller->get_CoreWebView2(&g_webview);

                            // Configure Settings
                            ComPtr<ICoreWebView2Settings> settings;
                            g_webview->get_Settings(&settings);
                            if (settings) {
                                settings->put_IsScriptEnabled(TRUE);
                                settings->put_AreDefaultScriptDialogsEnabled(TRUE);
                                settings->put_IsWebMessageEnabled(TRUE);
                                settings->put_AreDevToolsEnabled(TRUE);
                                settings->put_IsStatusBarEnabled(FALSE);
                            }

                            // Match Window Bounds
                            RECT bounds;
                            GetClientRect(hWnd, &bounds);
                            g_controller->put_Bounds(bounds);

                            // Handle Web Messages from JavaScript (Bidirectional Bridge)
                            g_webview->add_WebMessageReceived(
                                Callback<ICoreWebView2WebMessageReceivedEventHandler>(
                                    [](ICoreWebView2* webview, ICoreWebView2WebMessageReceivedEventArgs* args) -> HRESULT {
                                        LPWSTR messageRaw;
                                        args->TryGetWebMessageAsString(&messageRaw);
                                        if (messageRaw) {
                                            std::wstring msg = messageRaw;
                                            CoTaskMemFree(messageRaw);

                                            if (msg == L"get_hardware") {
                                                std::wstring json = GetHardwareJson();
                                                webview->PostWebMessageAsJson(json.c_str());
                                            }
                                            else if (msg == L"clean_ram") {
                                                uint64_t freed = g_engine.CleanWorkingSetMemory();
                                                std::wstringstream ss;
                                                ss << L"{\"type\":\"ram_cleaned\",\"freedMB\":" << (double)freed / (1024.0 * 1024.0) << L"}";
                                                webview->PostWebMessageAsJson(ss.str().c_str());
                                            }
                                            else if (msg == L"set_timer_05") {
                                                g_engine.SetTimerResolution(0.5);
                                                double cur = g_engine.QueryCurrentTimerResolution();
                                                std::wstringstream ss;
                                                ss << L"{\"type\":\"timer_updated\",\"resolutionMs\":" << cur << L"}";
                                                webview->PostWebMessageAsJson(ss.str().c_str());
                                            }
                                            else if (msg == L"apply_all_tweaks") {
                                                auto count = g_engine.ApplyBatchTweaks({
                                                    "win_01", "win_02", "gpu_01", "win_03", "win_04", "win_05", "cpu_01", "gl_01", "net_01"
                                                });
                                                std::wstringstream ss;
                                                ss << L"{\"type\":\"tweaks_applied\",\"count\":" << count << L"}";
                                                webview->PostWebMessageAsJson(ss.str().c_str());
                                            }
                                            else if (msg == L"boost_gameloop") {
                                                bool ok = g_engine.BoostGameLoopProcessPriority();
                                                std::wstring res = ok ? L"{\"type\":\"gameloop_boosted\",\"status\":true}" : L"{\"type\":\"gameloop_boosted\",\"status\":false}";
                                                webview->PostWebMessageAsJson(res.c_str());
                                            }
                                        }
                                        return S_OK;
                                    }
                                ).Get(),
                                nullptr
                            );

                            // Inject native bridge JS helper before page loads
                            g_webview->AddScriptToExecuteOnDocumentCreated(
                                L"window.fistNative = {"
                                L"  getHardware: () => window.chrome.webview.postMessage('get_hardware'),"
                                L"  cleanRam: () => window.chrome.webview.postMessage('clean_ram'),"
                                L"  setTimer: () => window.chrome.webview.postMessage('set_timer_05'),"
                                L"  applyAll: () => window.chrome.webview.postMessage('apply_all_tweaks'),"
                                L"  boostGameLoop: () => window.chrome.webview.postMessage('boost_gameloop')"
                                L"};",
                                nullptr
                            );

                            // Virtual Host Mapping for local website folder
                            ComPtr<ICoreWebView2_3> webview3;
                            if (SUCCEEDED(g_webview.As(&webview3)) && webview3) {
                                std::wstring websiteDir = exeDir + L"\\website";
                                webview3->SetVirtualHostNameToFolderMapping(
                                    L"app.fisttool.local",
                                    websiteDir.c_str(),
                                    COREWEBVIEW2_HOST_RESOURCE_ACCESS_KIND_ALLOW
                                );
                                g_webview->Navigate(L"https://app.fisttool.local/index.html");
                            } else {
                                std::wstring localUrl = L"file:///" + exeDir + L"/website/index.html";
                                for (auto& ch : localUrl) {
                                    if (ch == L'\\') ch = L'/';
                                }
                                g_webview->Navigate(localUrl.c_str());
                            }
                            return S_OK;
                        }
                    ).Get()
                );
                return S_OK;
            }
        ).Get()
    );

    // 8. Message Loop
    MSG msg = {};
    while (GetMessageW(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessageW(&msg);
    }

    if (hMutex) CloseHandle(hMutex);
    return (int)msg.wParam;
}
