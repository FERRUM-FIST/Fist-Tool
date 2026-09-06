#include "fist_engine.h"
#include <mmsystem.h>

#pragma comment(lib, "winmm.lib")

#ifndef NTSTATUS
typedef LONG NTSTATUS;
#endif

#ifndef NTAPI
#define NTAPI __stdcall
#endif

typedef NTSTATUS(NTAPI* pfnNtSetTimerResolution)(ULONG DesiredResolution, BOOLEAN SetResolution, PULONG CurrentResolution);
typedef NTSTATUS(NTAPI* pfnNtQueryTimerResolution)(PULONG MaximumResolution, PULONG MinimumResolution, PULONG CurrentResolution);

namespace Fist {

static pfnNtSetTimerResolution g_NtSetTimerResolution = nullptr;
static pfnNtQueryTimerResolution g_NtQueryTimerResolution = nullptr;
static bool g_NtdllInitialized = false;

static void InitNtdllFunctions() {
    if (!g_NtdllInitialized) {
        HMODULE hNtDll = GetModuleHandleW(L"ntdll.dll");
        if (hNtDll) {
            g_NtSetTimerResolution = reinterpret_cast<pfnNtSetTimerResolution>(GetProcAddress(hNtDll, "NtSetTimerResolution"));
            g_NtQueryTimerResolution = reinterpret_cast<pfnNtQueryTimerResolution>(GetProcAddress(hNtDll, "NtQueryTimerResolution"));
        }
        g_NtdllInitialized = true;
    }
}

bool Engine::SetTimerResolution(double resolutionMs) {
    InitNtdllFunctions();

    // 0.5ms = 5000 in 100-nanosecond units
    ULONG desiredUnits = static_cast<ULONG>(resolutionMs * 10000.0);
    if (desiredUnits < 5000) desiredUnits = 5000; // Cap at 0.5ms (hardware limit on Windows)

    if (g_NtSetTimerResolution) {
        ULONG current = 0;
        NTSTATUS status = g_NtSetTimerResolution(desiredUnits, TRUE, &current);
        if (status >= 0) {
            m_timerActive = true;
            m_timerResolutionOriginal = current;
            return true;
        }
    }

    // Fallback: winmm timeBeginPeriod (1ms)
    MMRESULT mmRes = timeBeginPeriod(1);
    m_timerActive = (mmRes == TIMERR_NOERROR);
    return m_timerActive;
}

bool Engine::ResetTimerResolution() {
    if (!m_timerActive) return true;

    InitNtdllFunctions();
    if (g_NtSetTimerResolution) {
        ULONG current = 0;
        g_NtSetTimerResolution(0, FALSE, &current);
    }
    timeEndPeriod(1);
    m_timerActive = false;
    return true;
}

double Engine::QueryCurrentTimerResolution() {
    InitNtdllFunctions();

    if (g_NtQueryTimerResolution) {
        ULONG maxRes = 0, minRes = 0, curRes = 0;
        if (g_NtQueryTimerResolution(&maxRes, &minRes, &curRes) >= 0) {
            return static_cast<double>(curRes) / 10000.0; // convert 100ns to ms
        }
    }

    return 1.0;
}

} // namespace Fist
