#pragma once

#ifndef FIST_ENGINE_H
#define FIST_ENGINE_H

#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <windows.h>
#include <string>
#include <vector>
#include <functional>
#include <cstdint>

#ifdef FIST_ENGINE_EXPORTS
#define FIST_API __declspec(dllexport)
#else
#define FIST_API
#endif

namespace Fist {

    // --- Hardware Telemetry Structs ---
    struct CpuInfo {
        std::wstring name;
        std::wstring vendor; // "intel", "amd", or "other"
        uint32_t logicalCores = 0;
        uint32_t physicalCores = 0;
        double currentUsagePercent = 0.0;
    };

    struct GpuInfo {
        std::wstring name;
        std::wstring vendor; // "nvidia", "amd", "intel", or "other"
        uint64_t dedicatedVramBytes = 0;
        std::wstring driverVersion;
    };

    struct RamInfo {
        uint64_t totalBytes = 0;
        uint64_t availableBytes = 0;
        uint64_t usedBytes = 0;
        uint32_t loadPercentage = 0;
    };

    struct SystemHardware {
        CpuInfo cpu;
        std::vector<GpuInfo> gpus;
        RamInfo ram;
        std::wstring osVersion;
        bool isElevatedAdmin = false;
    };

    // --- Tweak Definition ---
    enum class TweakCategory {
        Windows,
        CPU,
        GPU,
        Network,
        GameLoop,
        Memory,
        Privacy,
        Custom
    };

    enum class TweakActionType {
        RegistryDword,
        RegistryString,
        RegistryDelete,
        ServiceConfig,
        PowerCfg,
        BcdEdit,
        Netsh,
        CustomCommand
    };

    struct TweakItem {
        std::string id;
        std::string title;
        std::string description;
        std::string impact;
        std::string category;
        bool proOnly = false;
        
        TweakActionType actionType;
        std::wstring rootKey;      // e.g. "HKLM" or "HKCU"
        std::wstring subKey;       // e.g. "SYSTEM\CurrentControlSet\..."
        std::wstring valueName;    // e.g. "NetworkThrottlingIndex"
        uint32_t dwordValue = 0;
        std::wstring stringValue;
        
        // Fallback or shell command if applicable
        std::wstring applyCmd;
        std::wstring revertCmd;

        // Runtime status
        bool isApplied = false;
    };

    // --- Engine Callbacks ---
    using ProgressCallback = std::function<void(const std::string& tweakId, const std::string& title, bool success, const std::string& message)>;

    // --- Engine API Class ---
    class FIST_API Engine {
    public:
        Engine();
        ~Engine();

        // System & Hardware
        SystemHardware GetHardwareSpecs();
        bool IsRunningAsAdmin();
        bool RequestElevation();

        // High Resolution Timer (0.500ms)
        bool SetTimerResolution(double resolutionMs = 0.5);
        bool ResetTimerResolution();
        double QueryCurrentTimerResolution();

        // High-Speed RAM & Working Set Cleaner
        uint64_t CleanWorkingSetMemory();

        // Tweak Registry Engine (Native Win32 <2ms)
        const std::vector<TweakItem>& GetAllTweaks();
        bool ApplyTweak(const std::string& tweakId);
        bool RevertTweak(const std::string& tweakId);
        size_t ApplyBatchTweaks(const std::vector<std::string>& tweakIds, ProgressCallback callback = nullptr);
        size_t RevertBatchTweaks(const std::vector<std::string>& tweakIds, ProgressCallback callback = nullptr);
        bool CheckTweakStatus(const std::string& tweakId);

        // Windows Services
        bool SetServiceStartup(const std::wstring& serviceName, DWORD startType);
        bool StopService(const std::wstring& serviceName);

        // GameLoop / PUBG Mobile Integration
        std::wstring GetGameLoopInstallPath();
        bool ApplyGameLoopLowLatencyTweaks(uint32_t targetFps = 120);
        bool CleanGameLoopCache();
        bool SetAdbFpsProps(uint32_t fps = 120);

        // Network Latency
        bool OptimizeTcpStack();
        bool FlushDnsAndArp();
        bool SetDnsServers(const std::wstring& primaryDns, const std::wstring& secondaryDns);

        // Process Priority & MMCSS
        bool BoostGameLoopProcessPriority();

    private:
        void InitializeDefaultTweaks();
        std::vector<TweakItem> m_tweaks;
        bool m_timerActive = false;
        ULONG m_timerResolutionOriginal = 0;
    };

} // namespace Fist

#endif // FIST_ENGINE_H
