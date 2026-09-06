#ifndef FIST_ENGINE_EXPORTS
#define FIST_ENGINE_EXPORTS
#endif
#include "fist_c_api.h"
#include "fist_engine.h"
#include <cwchar>

static Fist::Engine g_Engine;

extern "C" {

int Fist_GetHardware(FistHardwareSummary* outHw) {
    if (!outHw) return 0;

    auto hw = g_Engine.GetHardwareSpecs();
    wcsncpy_s(outHw->cpuName, hw.cpu.name.c_str(), _TRUNCATE);
    wcsncpy_s(outHw->cpuVendor, hw.cpu.vendor.c_str(), _TRUNCATE);
    outHw->logicalCores = hw.cpu.logicalCores;
    outHw->physicalCores = hw.cpu.physicalCores;

    if (!hw.gpus.empty()) {
        wcsncpy_s(outHw->gpuName, hw.gpus[0].name.c_str(), _TRUNCATE);
        wcsncpy_s(outHw->gpuVendor, hw.gpus[0].vendor.c_str(), _TRUNCATE);
        outHw->vramBytes = hw.gpus[0].dedicatedVramBytes;
    } else {
        outHw->gpuName[0] = 0;
        outHw->gpuVendor[0] = 0;
        outHw->vramBytes = 0;
    }

    outHw->ramTotalBytes = hw.ram.totalBytes;
    outHw->ramAvailableBytes = hw.ram.availableBytes;
    outHw->ramLoadPercentage = hw.ram.loadPercentage;
    outHw->isElevated = hw.isElevatedAdmin ? 1 : 0;

    return 1;
}

int Fist_SetTimerResolution(double resolutionMs) {
    return g_Engine.SetTimerResolution(resolutionMs) ? 1 : 0;
}

int Fist_ResetTimerResolution() {
    return g_Engine.ResetTimerResolution() ? 1 : 0;
}

double Fist_QueryTimerResolution() {
    return g_Engine.QueryCurrentTimerResolution();
}

uint64_t Fist_CleanMemory() {
    return g_Engine.CleanWorkingSetMemory();
}

int Fist_ApplyTweak(const char* tweakId) {
    if (!tweakId) return 0;
    return g_Engine.ApplyTweak(tweakId) ? 1 : 0;
}

int Fist_RevertTweak(const char* tweakId) {
    if (!tweakId) return 0;
    return g_Engine.RevertTweak(tweakId) ? 1 : 0;
}

int Fist_CheckTweakStatus(const char* tweakId) {
    if (!tweakId) return 0;
    return g_Engine.CheckTweakStatus(tweakId) ? 1 : 0;
}

int Fist_ApplyAllTweaks() {
    auto tweaks = g_Engine.GetAllTweaks();
    std::vector<std::string> ids;
    for (const auto& t : tweaks) ids.push_back(t.id);
    return static_cast<int>(g_Engine.ApplyBatchTweaks(ids));
}

int Fist_RevertAllTweaks() {
    auto tweaks = g_Engine.GetAllTweaks();
    std::vector<std::string> ids;
    for (const auto& t : tweaks) ids.push_back(t.id);
    return static_cast<int>(g_Engine.RevertBatchTweaks(ids));
}

int Fist_BoostGameLoop() {
    return g_Engine.BoostGameLoopProcessPriority() ? 1 : 0;
}

int Fist_FlushDns() {
    return g_Engine.FlushDnsAndArp() ? 1 : 0;
}

int Fist_IsAdmin() {
    return g_Engine.IsRunningAsAdmin() ? 1 : 0;
}

} // extern "C"
