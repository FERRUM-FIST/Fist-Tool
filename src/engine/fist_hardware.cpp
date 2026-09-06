#include "fist_engine.h"
#include <intrin.h>
#include <dxgi.h>
#include <vector>
#include <string>
#include <algorithm>
#include <cwctype>

#pragma comment(lib, "dxgi.lib")

namespace Fist {

static std::wstring TrimString(const std::wstring& str) {
    auto start = str.find_first_not_of(L" \t\r\n");
    if (start == std::wstring::npos) return L"";
    auto end = str.find_last_not_of(L" \t\r\n");
    return str.substr(start, end - start + 1);
}

static std::wstring ToLowerString(const std::wstring& str) {
    std::wstring lower = str;
    std::transform(lower.begin(), lower.end(), lower.begin(), [](wchar_t c) {
        return std::towlower(c);
    });
    return lower;
}

CpuInfo DetectCpu() {
    CpuInfo info;
    
    // 1. Get Brand String via CPUID
    int cpuInfo[4] = { 0 };
    __cpuid(cpuInfo, 0x80000000);
    unsigned int nExIds = cpuInfo[0];

    char brand[0x40] = { 0 };
    if (nExIds >= 0x80000004) {
        __cpuid((int*)brand, 0x80000002);
        __cpuid((int*)(brand + 16), 0x80000003);
        __cpuid((int*)(brand + 32), 0x80000004);
        
        int wlen = MultiByteToWideChar(CP_ACP, 0, brand, -1, NULL, 0);
        if (wlen > 0) {
            std::vector<wchar_t> wbuf(wlen);
            MultiByteToWideChar(CP_ACP, 0, brand, -1, wbuf.data(), wlen);
            info.name = TrimString(std::wstring(wbuf.data()));
        }
    }

    if (info.name.empty()) {
        // Fallback: Query vendor string
        char vendor[13] = { 0 };
        __cpuid(cpuInfo, 0);
        *reinterpret_cast<int*>(vendor) = cpuInfo[1];
        *reinterpret_cast<int*>(vendor + 4) = cpuInfo[3];
        *reinterpret_cast<int*>(vendor + 8) = cpuInfo[2];
        
        int wlen = MultiByteToWideChar(CP_ACP, 0, vendor, -1, NULL, 0);
        if (wlen > 0) {
            std::vector<wchar_t> wbuf(wlen);
            MultiByteToWideChar(CP_ACP, 0, vendor, -1, wbuf.data(), wlen);
            info.name = std::wstring(wbuf.data());
        }
    }

    std::wstring lowerName = ToLowerString(info.name);
    if (lowerName.find(L"intel") != std::wstring::npos) {
        info.vendor = L"intel";
    } else if (lowerName.find(L"amd") != std::wstring::npos || lowerName.find(L"ryzen") != std::wstring::npos) {
        info.vendor = L"amd";
    } else {
        info.vendor = L"other";
    }

    // 2. Cores count
    SYSTEM_INFO sysInfo;
    GetSystemInfo(&sysInfo);
    info.logicalCores = sysInfo.dwNumberOfProcessors;

    // Physical cores count
    DWORD bufferSize = 0;
    GetLogicalProcessorInformationEx(RelationProcessorCore, NULL, &bufferSize);
    if (bufferSize > 0) {
        std::vector<uint8_t> buffer(bufferSize);
        if (GetLogicalProcessorInformationEx(RelationProcessorCore, (PSYSTEM_LOGICAL_PROCESSOR_INFORMATION_EX)buffer.data(), &bufferSize)) {
            uint32_t physicalCount = 0;
            DWORD offset = 0;
            while (offset < bufferSize) {
                auto* pInfo = reinterpret_cast<PSYSTEM_LOGICAL_PROCESSOR_INFORMATION_EX>(buffer.data() + offset);
                if (pInfo->Relationship == RelationProcessorCore) {
                    physicalCount++;
                }
                offset += pInfo->Size;
            }
            info.physicalCores = physicalCount;
        }
    }
    if (info.physicalCores == 0) {
        info.physicalCores = info.logicalCores > 1 ? info.logicalCores / 2 : 1;
    }

    return info;
}

std::vector<GpuInfo> DetectGpus() {
    std::vector<GpuInfo> gpus;

    IDXGIFactory* pFactory = nullptr;
    HRESULT hr = CreateDXGIFactory(__uuidof(IDXGIFactory), (void**)&pFactory);
    if (SUCCEEDED(hr) && pFactory) {
        UINT i = 0;
        IDXGIAdapter* pAdapter = nullptr;
        while (pFactory->EnumAdapters(i, &pAdapter) != DXGI_ERROR_NOT_FOUND) {
            DXGI_ADAPTER_DESC desc;
            if (SUCCEEDED(pAdapter->GetDesc(&desc))) {
                // Skip software emulation adapters like Microsoft Basic Render Driver
                if (desc.VendorId != 0x1414) {
                    GpuInfo gpu;
                    gpu.name = desc.Description;
                    gpu.dedicatedVramBytes = desc.DedicatedVideoMemory;

                    if (desc.VendorId == 0x10DE) {
                        gpu.vendor = L"nvidia";
                    } else if (desc.VendorId == 0x1002) {
                        gpu.vendor = L"amd";
                    } else if (desc.VendorId == 0x8086) {
                        gpu.vendor = L"intel";
                    } else {
                        gpu.vendor = L"other";
                    }

                    gpus.push_back(gpu);
                }
            }
            pAdapter->Release();
            pAdapter = nullptr;
            i++;
        }
        pFactory->Release();
    }

    return gpus;
}

RamInfo DetectRam() {
    RamInfo ram;
    MEMORYSTATUSEX stat;
    stat.dwLength = sizeof(MEMORYSTATUSEX);
    if (GlobalMemoryStatusEx(&stat)) {
        ram.totalBytes = stat.ullTotalPhys;
        ram.availableBytes = stat.ullAvailPhys;
        ram.usedBytes = ram.totalBytes > ram.availableBytes ? (ram.totalBytes - ram.availableBytes) : 0;
        ram.loadPercentage = stat.dwMemoryLoad;
    }
    return ram;
}

SystemHardware Engine::GetHardwareSpecs() {
    SystemHardware hw;
    hw.cpu = DetectCpu();
    hw.gpus = DetectGpus();
    hw.ram = DetectRam();
    hw.isElevatedAdmin = IsRunningAsAdmin();

    OSVERSIONINFOEXW osvi = { sizeof(osvi) };
    // Just a clean fallback for OS display
    hw.osVersion = L"Windows 10 / 11 (64-bit)";

    return hw;
}

} // namespace Fist
