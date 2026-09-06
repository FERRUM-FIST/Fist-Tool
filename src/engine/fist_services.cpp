#include "fist_engine.h"
#include <winsvc.h>

#pragma comment(lib, "advapi32.lib")

namespace Fist {

bool Engine::SetServiceStartup(const std::wstring& serviceName, DWORD startType) {
    SC_HANDLE hSCM = OpenSCManagerW(NULL, NULL, SC_MANAGER_ALL_ACCESS);
    if (!hSCM) return false;

    bool success = false;
    SC_HANDLE hService = OpenServiceW(hSCM, serviceName.c_str(), SERVICE_CHANGE_CONFIG | SERVICE_QUERY_STATUS);
    if (hService) {
        if (ChangeServiceConfigW(
            hService,
            SERVICE_NO_CHANGE,
            startType,
            SERVICE_NO_CHANGE,
            NULL, NULL, NULL, NULL, NULL, NULL, NULL
        )) {
            success = true;
        }
        CloseServiceHandle(hService);
    }

    CloseServiceHandle(hSCM);
    return success;
}

bool Engine::StopService(const std::wstring& serviceName) {
    SC_HANDLE hSCM = OpenSCManagerW(NULL, NULL, SC_MANAGER_ALL_ACCESS);
    if (!hSCM) return false;

    bool success = false;
    SC_HANDLE hService = OpenServiceW(hSCM, serviceName.c_str(), SERVICE_STOP | SERVICE_QUERY_STATUS);
    if (hService) {
        SERVICE_STATUS status;
        if (ControlService(hService, SERVICE_CONTROL_STOP, &status)) {
            success = true;
        }
        CloseServiceHandle(hService);
    }

    CloseServiceHandle(hSCM);
    return success;
}

} // namespace Fist
