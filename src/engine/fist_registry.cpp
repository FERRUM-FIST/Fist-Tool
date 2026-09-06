#include "fist_engine.h"
#include <shellapi.h>
#include <iostream>
#include <sstream>

#pragma comment(lib, "advapi32.lib")
#pragma comment(lib, "shell32.lib")

namespace Fist {

static HKEY ParseRootKey(const std::wstring& root) {
    if (root == L"HKLM" || root == L"HKEY_LOCAL_MACHINE") return HKEY_LOCAL_MACHINE;
    if (root == L"HKCU" || root == L"HKEY_CURRENT_USER") return HKEY_CURRENT_USER;
    if (root == L"HKCR" || root == L"HKEY_CLASSES_ROOT") return HKEY_CLASSES_ROOT;
    if (root == L"HKU" || root == L"HKEY_USERS") return HKEY_USERS;
    return HKEY_LOCAL_MACHINE;
}

static bool RunCommandSilent(const std::wstring& cmd) {
    if (cmd.empty()) return true;

    std::wstring fullCmd = L"cmd.exe /c " + cmd;
    std::vector<wchar_t> cmdBuffer(fullCmd.begin(), fullCmd.end());
    cmdBuffer.push_back(0);

    STARTUPINFOW si = { sizeof(si) };
    si.dwFlags = STARTF_USESHOWWINDOW;
    si.wShowWindow = SW_HIDE;

    PROCESS_INFORMATION pi = { 0 };
    BOOL success = CreateProcessW(
        NULL,
        cmdBuffer.data(),
        NULL, NULL, FALSE,
        CREATE_NO_WINDOW,
        NULL, NULL,
        &si, &pi
    );

    if (success) {
        WaitForSingleObject(pi.hProcess, 3000); // 3-second timeout
        DWORD exitCode = 0;
        GetExitCodeProcess(pi.hProcess, &exitCode);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
        return (exitCode == 0);
    }
    return false;
}

static bool SetRegistryDword(HKEY root, const std::wstring& subKey, const std::wstring& valName, DWORD value) {
    HKEY hKey = nullptr;
    LSTATUS status = RegCreateKeyExW(
        root, subKey.c_str(), 0, NULL,
        REG_OPTION_NON_VOLATILE, KEY_SET_VALUE, NULL, &hKey, NULL
    );
    if (status != ERROR_SUCCESS) return false;

    status = RegSetValueExW(
        hKey, valName.c_str(), 0, REG_DWORD,
        reinterpret_cast<const BYTE*>(&value), sizeof(DWORD)
    );
    RegCloseKey(hKey);
    return (status == ERROR_SUCCESS);
}

static bool DeleteRegistryValue(HKEY root, const std::wstring& subKey, const std::wstring& valName) {
    HKEY hKey = nullptr;
    LSTATUS status = RegOpenKeyExW(root, subKey.c_str(), 0, KEY_SET_VALUE, &hKey);
    if (status != ERROR_SUCCESS) return true; // Already gone

    status = RegDeleteValueW(hKey, valName.c_str());
    RegCloseKey(hKey);
    return (status == ERROR_SUCCESS || status == ERROR_FILE_NOT_FOUND);
}

static bool QueryRegistryDword(HKEY root, const std::wstring& subKey, const std::wstring& valName, DWORD& outValue) {
    HKEY hKey = nullptr;
    LSTATUS status = RegOpenKeyExW(root, subKey.c_str(), 0, KEY_QUERY_VALUE, &hKey);
    if (status != ERROR_SUCCESS) return false;

    DWORD type = 0;
    DWORD size = sizeof(DWORD);
    status = RegQueryValueExW(hKey, valName.c_str(), NULL, &type, reinterpret_cast<LPBYTE>(&outValue), &size);
    RegCloseKey(hKey);
    return (status == ERROR_SUCCESS && type == REG_DWORD);
}

const std::vector<TweakItem>& Engine::GetAllTweaks() {
    return m_tweaks;
}

bool Engine::ApplyTweak(const std::string& tweakId) {
    for (auto& tweak : m_tweaks) {
        if (tweak.id == tweakId) {
            bool ok = false;
            switch (tweak.actionType) {
                case TweakActionType::RegistryDword: {
                    HKEY root = ParseRootKey(tweak.rootKey);
                    ok = SetRegistryDword(root, tweak.subKey, tweak.valueName, tweak.dwordValue);
                    break;
                }
                case TweakActionType::RegistryDelete: {
                    HKEY root = ParseRootKey(tweak.rootKey);
                    ok = DeleteRegistryValue(root, tweak.subKey, tweak.valueName);
                    break;
                }
                default: {
                    ok = RunCommandSilent(tweak.applyCmd);
                    break;
                }
            }
            tweak.isApplied = ok;
            return ok;
        }
    }
    return false;
}

bool Engine::RevertTweak(const std::string& tweakId) {
    for (auto& tweak : m_tweaks) {
        if (tweak.id == tweakId) {
            bool ok = false;
            if (!tweak.revertCmd.empty()) {
                ok = RunCommandSilent(tweak.revertCmd);
            } else if (tweak.actionType == TweakActionType::RegistryDword) {
                HKEY root = ParseRootKey(tweak.rootKey);
                ok = DeleteRegistryValue(root, tweak.subKey, tweak.valueName);
            }
            tweak.isApplied = !ok;
            return ok;
        }
    }
    return false;
}

size_t Engine::ApplyBatchTweaks(const std::vector<std::string>& tweakIds, ProgressCallback callback) {
    size_t successCount = 0;
    for (const auto& id : tweakIds) {
        for (auto& tweak : m_tweaks) {
            if (tweak.id == id) {
                bool ok = ApplyTweak(id);
                if (ok) successCount++;
                if (callback) {
                    callback(id, tweak.title, ok, ok ? "Applied successfully" : "Execution failed");
                }
                break;
            }
        }
    }
    return successCount;
}

size_t Engine::RevertBatchTweaks(const std::vector<std::string>& tweakIds, ProgressCallback callback) {
    size_t successCount = 0;
    for (const auto& id : tweakIds) {
        for (auto& tweak : m_tweaks) {
            if (tweak.id == id) {
                bool ok = RevertTweak(id);
                if (ok) successCount++;
                if (callback) {
                    callback(id, tweak.title, ok, ok ? "Reverted successfully" : "Reversion failed");
                }
                break;
            }
        }
    }
    return successCount;
}

bool Engine::CheckTweakStatus(const std::string& tweakId) {
    for (auto& tweak : m_tweaks) {
        if (tweak.id == tweakId) {
            if (tweak.actionType == TweakActionType::RegistryDword) {
                HKEY root = ParseRootKey(tweak.rootKey);
                DWORD val = 0;
                if (QueryRegistryDword(root, tweak.subKey, tweak.valueName, val)) {
                    tweak.isApplied = (val == tweak.dwordValue);
                    return tweak.isApplied;
                }
            }
            return tweak.isApplied;
        }
    }
    return false;
}

} // namespace Fist
