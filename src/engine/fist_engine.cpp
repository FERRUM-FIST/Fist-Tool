#include "fist_engine.h"
#include <shellapi.h>
#include <tlhelp32.h>
#include <iostream>

namespace Fist {

Engine::Engine() {
    InitializeDefaultTweaks();
}

Engine::~Engine() {
    ResetTimerResolution();
}

bool Engine::IsRunningAsAdmin() {
    BOOL isAdmin = FALSE;
    PSID adminGroup = NULL;
    SID_IDENTIFIER_AUTHORITY ntAuthority = SECURITY_NT_AUTHORITY;

    if (AllocateAndInitializeSid(
        &ntAuthority, 2,
        SECURITY_BUILTIN_DOMAIN_RID,
        DOMAIN_ALIAS_RID_ADMINS,
        0, 0, 0, 0, 0, 0,
        &adminGroup
    )) {
        CheckTokenMembership(NULL, adminGroup, &isAdmin);
        FreeSid(adminGroup);
    }
    return (isAdmin != FALSE);
}

bool Engine::RequestElevation() {
    if (IsRunningAsAdmin()) return true;

    wchar_t szPath[MAX_PATH];
    if (GetModuleFileNameW(NULL, szPath, ARRAYSIZE(szPath))) {
        SHELLEXECUTEINFOW sei = { sizeof(sei) };
        sei.lpVerb = L"runas";
        sei.lpFile = szPath;
        sei.hwnd = NULL;
        sei.nShow = SW_NORMAL;

        if (ShellExecuteExW(&sei)) {
            ExitProcess(0);
            return true;
        }
    }
    return false;
}

std::wstring Engine::GetGameLoopInstallPath() {
    HKEY hKey = nullptr;
    std::wstring path = L"";
    if (RegOpenKeyExW(HKEY_LOCAL_MACHINE, L"SOFTWARE\\WOW6432Node\\Tencent\\MobileGamePC", 0, KEY_READ, &hKey) == ERROR_SUCCESS) {
        wchar_t buf[MAX_PATH] = { 0 };
        DWORD len = sizeof(buf);
        if (RegQueryValueExW(hKey, L"InstallPath", NULL, NULL, reinterpret_cast<LPBYTE>(buf), &len) == ERROR_SUCCESS) {
            path = buf;
        }
        RegCloseKey(hKey);
    }
    return path;
}

bool Engine::OptimizeTcpStack() {
    // Apply low latency TCP settings
    TweakItem tcp1;
    tcp1.applyCmd = L"netsh int tcp set global autotuninglevel=normal & netsh int tcp set global ecncapability=disabled & netsh int tcp set global timestamps=disabled";
    ApplyTweak("net_tcp_global");
    return true;
}

bool Engine::FlushDnsAndArp() {
    TweakItem flush;
    flush.applyCmd = L"ipconfig /flushdns & netsh interface ip delete arpcache";
    ApplyTweak("net_flush");
    return true;
}

bool Engine::SetDnsServers(const std::wstring& primaryDns, const std::wstring& secondaryDns) {
    std::wstring cmd = L"powershell -NoProfile -Command \"Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | Set-DnsClientServerAddress -ServerAddresses ('" + primaryDns + L"','" + secondaryDns + L"')\"";
    TweakItem dns;
    dns.applyCmd = cmd;
    return ApplyTweak("net_set_dns");
}

bool Engine::BoostGameLoopProcessPriority() {
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hSnapshot == INVALID_HANDLE_VALUE) return false;

    bool boosted = false;
    PROCESSENTRY32W pe;
    pe.dwSize = sizeof(PROCESSENTRY32W);

    if (Process32FirstW(hSnapshot, &pe)) {
        do {
            std::wstring name = pe.szExeFile;
            if (name == L"AndroidProcess.exe" || name == L"AppMarket.exe" || name == L"aow_exe.exe") {
                HANDLE hProcess = OpenProcess(PROCESS_SET_INFORMATION, FALSE, pe.th32ProcessID);
                if (hProcess) {
                    SetPriorityClass(hProcess, HIGH_PRIORITY_CLASS);
                    CloseHandle(hProcess);
                    boosted = true;
                }
            }
        } while (Process32NextW(hSnapshot, &pe));
    }
    CloseHandle(hSnapshot);
    return boosted;
}

void Engine::InitializeDefaultTweaks() {
    m_tweaks.clear();

    // 1. System Responsiveness
    {
        TweakItem t;
        t.id = "win_01";
        t.title = "Disable System Responsiveness Throttling";
        t.description = "Removes Windows 20% network and CPU throttling reserved for background services.";
        t.impact = "Guarantees 100% CPU time to foreground games.";
        t.category = "Windows";
        t.actionType = TweakActionType::RegistryDword;
        t.rootKey = L"HKLM";
        t.subKey = L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile";
        t.valueName = L"SystemResponsiveness";
        t.dwordValue = 0;
        t.revertCmd = L"reg add \"HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\" /v \"SystemResponsiveness\" /t REG_DWORD /d 20 /f";
        m_tweaks.push_back(t);
    }

    // 2. Network Throttling Index
    {
        TweakItem t;
        t.id = "win_02";
        t.title = "Disable Network Throttling Index";
        t.description = "Disables Windows packet throttling when non-multimedia applications are running.";
        t.impact = "Reduces network ping spikes and packet drops in competitive games.";
        t.category = "Network";
        t.actionType = TweakActionType::RegistryDword;
        t.rootKey = L"HKLM";
        t.subKey = L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile";
        t.valueName = L"NetworkThrottlingIndex";
        t.dwordValue = 0xFFFFFFFF;
        t.revertCmd = L"reg add \"HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\" /v \"NetworkThrottlingIndex\" /t REG_DWORD /d 10 /f";
        m_tweaks.push_back(t);
    }

    // 3. Hardware Accelerated GPU Scheduling (HAGS)
    {
        TweakItem t;
        t.id = "gpu_01";
        t.title = "Enable Hardware Accelerated GPU Scheduling (HAGS)";
        t.description = "Allows the GPU to manage its own video memory schedule, reducing CPU overhead.";
        t.impact = "Lowers input latency and raises minimum 1% low FPS.";
        t.category = "GPU";
        t.actionType = TweakActionType::RegistryDword;
        t.rootKey = L"HKLM";
        t.subKey = L"SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers";
        t.valueName = L"HwSchMode";
        t.dwordValue = 2;
        t.revertCmd = L"reg add \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers\" /v \"HwSchMode\" /t REG_DWORD /d 1 /f";
        m_tweaks.push_back(t);
    }

    // 4. Disable Game Bar Presence Writer
    {
        TweakItem t;
        t.id = "win_03";
        t.title = "Disable Xbox Game Bar Presence Server";
        t.description = "Prevents Windows Game Bar background capture from hooking into games.";
        t.impact = "Eliminates alt-tab delays and micro-stutters.";
        t.category = "Windows";
        t.actionType = TweakActionType::RegistryDword;
        t.rootKey = L"HKLM";
        t.subKey = L"SOFTWARE\\Microsoft\\WindowsRuntime\\ActivatableClassId\\Windows.Gaming.GameBar.PresenceServer.Internal.PresenceWriter";
        t.valueName = L"ActivationType";
        t.dwordValue = 0;
        t.revertCmd = L"reg delete \"HKLM\\SOFTWARE\\Microsoft\\WindowsRuntime\\ActivatableClassId\\Windows.Gaming.GameBar.PresenceServer.Internal.PresenceWriter\" /v \"ActivationType\" /f";
        m_tweaks.push_back(t);
    }

    // 5. Multimedia Class Scheduler Service (MMCSS) Gaming Priority
    {
        TweakItem t;
        t.id = "win_04";
        t.title = "Configure MMCSS Gaming Scheduling Priority";
        t.description = "Configures multimedia class scheduler for high priority and GPU prioritization.";
        t.impact = "Improves audio buffer stability and frame delivery pacing.";
        t.category = "Windows";
        t.actionType = TweakActionType::RegistryDword;
        t.rootKey = L"HKLM";
        t.subKey = L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games";
        t.valueName = L"GPU Priority";
        t.dwordValue = 8;
        m_tweaks.push_back(t);
    }

    // 6. Disable Windows Telemetry (AllowTelemetry = 0)
    {
        TweakItem t;
        t.id = "win_05";
        t.title = "Disable Windows Diagnostic Telemetry";
        t.description = "Turns off continuous Windows diagnostic data collection and disk logging.";
        t.impact = "Frees background CPU cycles and stops disk I/O bursts.";
        t.category = "Privacy";
        t.actionType = TweakActionType::RegistryDword;
        t.rootKey = L"HKLM";
        t.subKey = L"SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection";
        t.valueName = L"AllowTelemetry";
        t.dwordValue = 0;
        t.revertCmd = L"reg add \"HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection\" /v \"AllowTelemetry\" /t REG_DWORD /d 1 /f";
        m_tweaks.push_back(t);
    }

    // 7. Max CPU Performance Boost
    {
        TweakItem t;
        t.id = "cpu_01";
        t.title = "Set Max CPU Performance Frequency Profile";
        t.description = "Forces processor to maintain high frequencies on AC power without downclocking latency.";
        t.impact = "Reduces frame drops during intense combat scenarios.";
        t.category = "CPU";
        t.actionType = TweakActionType::CustomCommand;
        t.applyCmd = L"powercfg -setacvalueindex scheme_current sub_processor PERFBOOSTMODE 2 && powercfg /setactive scheme_current";
        t.revertCmd = L"powercfg -setacvalueindex scheme_current sub_processor PERFBOOSTMODE 0 && powercfg /restoredefaultschemes";
        m_tweaks.push_back(t);
    }

    // 8. GameLoop SurfaceFlinger 120 FPS Unlock
    {
        TweakItem t;
        t.id = "gl_01";
        t.title = "Unlock GameLoop 120 FPS & Low Touch Latency";
        t.description = "Configures SurfaceFlinger rendering pipeline for 120 FPS and FIFO UI thread.";
        t.impact = "Unlocks buttery smooth 120 FPS in PUBG Mobile.";
        t.category = "GameLoop";
        t.actionType = TweakActionType::CustomCommand;
        t.applyCmd = L"adb shell setprop debug.sf.fps 120 & adb shell setprop ro.config.low_ram false & adb shell setprop persist.sys.NV_FPSLIMIT 120";
        t.revertCmd = L"adb shell setprop debug.sf.fps 60 & adb shell setprop persist.sys.NV_FPSLIMIT 60";
        m_tweaks.push_back(t);
    }

    // 9. Disable Nagle's Algorithm (TCP NoDelay)
    {
        TweakItem t;
        t.id = "net_01";
        t.title = "Disable Nagle's Algorithm (TCP NoDelay)";
        t.description = "Stops Windows from bundling small TCP packets together, sending data immediately.";
        t.impact = "Decreases in-game ping and hit registration latency by up to 20ms.";
        t.category = "Network";
        t.actionType = TweakActionType::CustomCommand;
        t.applyCmd = L"powershell -NoProfile -Command \"Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces' | ForEach-Object { Set-ItemProperty -Path $_.PSPath -Name TcpAckFrequency -Value 1 -Type DWord -ErrorAction SilentlyContinue; Set-ItemProperty -Path $_.PSPath -Name TCPNoDelay -Value 1 -Type DWord -ErrorAction SilentlyContinue }\"";
        t.revertCmd = L"powershell -NoProfile -Command \"Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces' | ForEach-Object { Remove-ItemProperty -Path $_.PSPath -Name TcpAckFrequency -ErrorAction SilentlyContinue; Remove-ItemProperty -Path $_.PSPath -Name TCPNoDelay -ErrorAction SilentlyContinue }\"";
        m_tweaks.push_back(t);
    }
}

} // namespace Fist
