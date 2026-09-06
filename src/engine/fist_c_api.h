#pragma once

#ifndef FIST_C_API_H
#define FIST_C_API_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifdef FIST_ENGINE_EXPORTS
#define FIST_C_API __declspec(dllexport)
#else
#define FIST_C_API __declspec(dllimport)
#endif

// Telemetry structure for C-ABI / Python ctypes / Rust
#pragma pack(push, 1)
typedef struct {
    wchar_t cpuName[128];
    wchar_t cpuVendor[32];
    uint32_t logicalCores;
    uint32_t physicalCores;
    
    wchar_t gpuName[128];
    wchar_t gpuVendor[32];
    uint64_t vramBytes;

    uint64_t ramTotalBytes;
    uint64_t ramAvailableBytes;
    uint32_t ramLoadPercentage;

    uint32_t isElevated;
} FistHardwareSummary;
#pragma pack(pop)

FIST_C_API int Fist_GetHardware(FistHardwareSummary* outHw);
FIST_C_API int Fist_SetTimerResolution(double resolutionMs);
FIST_C_API int Fist_ResetTimerResolution();
FIST_C_API double Fist_QueryTimerResolution();
FIST_C_API uint64_t Fist_CleanMemory();
FIST_C_API int Fist_ApplyTweak(const char* tweakId);
FIST_C_API int Fist_RevertTweak(const char* tweakId);
FIST_C_API int Fist_CheckTweakStatus(const char* tweakId);
FIST_C_API int Fist_ApplyAllTweaks();
FIST_C_API int Fist_RevertAllTweaks();
FIST_C_API int Fist_BoostGameLoop();
FIST_C_API int Fist_FlushDns();
FIST_C_API int Fist_IsAdmin();

#ifdef __cplusplus
}
#endif

#endif // FIST_C_API_H
