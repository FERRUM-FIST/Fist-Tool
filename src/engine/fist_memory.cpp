#include "fist_engine.h"
#include <tlhelp32.h>
#include <psapi.h>

#pragma comment(lib, "psapi.lib")

namespace Fist {

uint64_t Engine::CleanWorkingSetMemory() {
    MEMORYSTATUSEX beforeMem;
    beforeMem.dwLength = sizeof(MEMORYSTATUSEX);
    GlobalMemoryStatusEx(&beforeMem);

    // 1. Clean current process
    EmptyWorkingSet(GetCurrentProcess());

    // 2. Iterate and clean all processes
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hSnapshot != INVALID_HANDLE_VALUE) {
        PROCESSENTRY32W pe;
        pe.dwSize = sizeof(PROCESSENTRY32W);

        if (Process32FirstW(hSnapshot, &pe)) {
            do {
                if (pe.th32ProcessID <= 4) continue; // Skip System and Idle

                HANDLE hProcess = OpenProcess(PROCESS_SET_QUOTA | PROCESS_QUERY_INFORMATION, FALSE, pe.th32ProcessID);
                if (hProcess) {
                    EmptyWorkingSet(hProcess);
                    SetProcessWorkingSetSize(hProcess, (SIZE_T)-1, (SIZE_T)-1);
                    CloseHandle(hProcess);
                }
            } while (Process32NextW(hSnapshot, &pe));
        }
        CloseHandle(hSnapshot);
    }

    MEMORYSTATUSEX afterMem;
    afterMem.dwLength = sizeof(MEMORYSTATUSEX);
    GlobalMemoryStatusEx(&afterMem);

    if (afterMem.ullAvailPhys > beforeMem.ullAvailPhys) {
        return afterMem.ullAvailPhys - beforeMem.ullAvailPhys;
    }
    return 0;
}

} // namespace Fist
