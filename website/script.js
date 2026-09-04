/* ==========================================================================
   FERRUM FIST PORTFOLIO — HIGH-PERFORMANCE INTERACTIVE ENGINE
   Optimized for 60-120 FPS across high-end & low-end devices
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Check for low-end device or prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (window.innerWidth < 768);

  // 1. HIGH-PERFORMANCE CANVAS STARFIELD & CONSTELLATION
  const canvas = document.getElementById('bg-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 150);
    }, { passive: true });

    // Adaptive particle density (low-end: 28 particles, desktop: 48 particles)
    const particleCount = isLowEnd ? 28 : 48;
    const maxDistance = isLowEnd ? 90 : 110;
    const maxDistanceSq = maxDistance * maxDistance;

    const particles = [];
    let mouseX = -1000;
    let mouseY = -1000;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    for (let i = 0; i < particleCount; i++) {
      const isRed = Math.random() > 0.45;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.8,
        r: isRed ? 255 : 0,
        g: isRed ? 53 : 229,
        b: isRed ? 71 : 255,
        baseAlpha: Math.random() * 0.45 + 0.3,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    let frame = 0;
    let isVisible = true;

    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible) requestAnimationFrame(renderLoop);
    });

    function renderLoop() {
      if (!isVisible) return;
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Draw & Update Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        // Subtle mouse repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 10000 && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (100 - dist) / 100;
          p.x += (dx / dist) * force * 1.2;
          p.y += (dy / dist) * force * 1.2;
        }

        const alpha = p.baseAlpha + Math.sin(frame * p.pulseSpeed + p.pulseOffset) * 0.15;
        const clampedAlpha = Math.max(0.1, Math.min(0.85, alpha));

        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${clampedAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 6.283);
        ctx.fill();

        // Optimized proximity line connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2Sq = (p.x - p2.x) ** 2 + (p.y - p2.y) ** 2;
          if (dist2Sq < maxDistanceSq) {
            const lineAlpha = (1 - Math.sqrt(dist2Sq) / maxDistance) * 0.16;
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(renderLoop);
    }
    requestAnimationFrame(renderLoop);
  }

  // 2. SMOOTH HARDWARE-ACCELERATED CURSOR GLOW
  const cursorGlow = document.querySelector('.cursor-glow');
  if (cursorGlow && !isLowEnd) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let ticking = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!ticking) {
        requestAnimationFrame(updateCursor);
        ticking = true;
      }
    }, { passive: true });

    function updateCursor() {
      currentX += (mouseX - currentX) * 0.10;
      currentY += (mouseY - currentY) * 0.10;
      cursorGlow.style.transform = `translate3d(${currentX - 250}px, ${currentY - 250}px, 0)`;

      if (Math.abs(mouseX - currentX) > 0.5 || Math.abs(mouseY - currentY) > 0.5) {
        requestAnimationFrame(updateCursor);
      } else {
        ticking = false;
      }
    }
  }

  // 3. NAVBAR SCROLL EFFECT
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (Math.abs(currentScroll - lastScroll) > 10) {
        navbar.classList.toggle('scrolled', currentScroll > 40);
        lastScroll = currentScroll;
      }
    }, { passive: true });
  }

  // 4. MOBILE HAMBURGER MENU
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('open');
      navLinks.classList.toggle('mobile-open');
    });

    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('open');
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // 5. SMOOTH SCROLL REVEALS
  const animatedEls = document.querySelectorAll('[data-animate]');
  if (animatedEls.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    animatedEls.forEach((el) => revealObserver.observe(el));
  }

  // 6. SMOOTH 3D TILT WITH INTERPOLATION (Desktop Only)
  if (!isLowEnd) {
    const tiltCards = document.querySelectorAll('.panel-preview, .feature-card, .stat-card');
    tiltCards.forEach((card) => {
      let rect = null;
      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
      }, { passive: true });

      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        rect = null;
        card.style.transform = '';
      });
    });
  }

  // 7. SHOWCASE TAB SWITCHER
  const tabButtons = document.querySelectorAll('.showcase-tab-btn');
  const tabPanels = document.querySelectorAll('.showcase-panel');

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(`tab-${targetId}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // 8. ANIMATED NUMBER COUNTERS (Single requestAnimationFrame loop)
  const counters = document.querySelectorAll('.counter-val');
  let countersAnimated = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        const startTime = performance.now();
        const duration = 1200;

        function animateCounts(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1.0);
          const easeOut = 1 - Math.pow(1 - progress, 3);

          counters.forEach((counter) => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            if (target === 0) {
              counter.textContent = '0';
            } else {
              counter.textContent = Math.floor(easeOut * target);
            }
          });

          if (progress < 1.0) {
            requestAnimationFrame(animateCounts);
          } else {
            counters.forEach((c) => (c.textContent = c.getAttribute('data-target')));
          }
        }
        requestAnimationFrame(animateCounts);
      }
    });
  }, { threshold: 0.25 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) countObserver.observe(statsSection);

  // 9. BENCHMARK BAR REVEAL
  const benchmarkCard = document.querySelector('.benchmark-card');
  if (benchmarkCard) {
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.bar-fill').forEach((fill) => {
            const width = fill.getAttribute('data-width');
            if (width) fill.style.width = width;
          });
          barObserver.unobserve(benchmarkCard);
        }
      });
    }, { threshold: 0.2 });

    barObserver.observe(benchmarkCard);
  }

});

  // 7. UNIVERSAL HARDWARE & FPS CHECKER
  const hwCheckerCards = document.querySelectorAll('.hw-checker-card');

  hwCheckerCards.forEach(card => {
    const gameSelect = card.querySelector('#hw-game');
    const cpuSelect = card.querySelector('#hw-cpu');
    const gpuSelect = card.querySelector('#hw-gpu');
    const ramSelect = card.querySelector('#hw-ram');
    const resSelect = card.querySelector('#hw-res');
    const checkBtn = card.querySelector('#hw-check-btn');

    const resultBox = card.querySelector('#hw-result-box');
    const tierBadge = card.querySelector('#hw-res-tier');
    const fpsBadge = card.querySelector('#hw-res-fps');
    const summaryText = card.querySelector('#hw-res-desc');

    const detailPreset = card.querySelector('#hw-detail-preset');
    const detailEngine = card.querySelector('#hw-detail-engine');
    const detailCpu = card.querySelector('#hw-detail-cpu');
    const detailRam = card.querySelector('#hw-detail-ram');
    const detailDpi = card.querySelector('#hw-detail-dpi');
    const detailLatency = card.querySelector('#hw-detail-latency');

    function calculatePerformance() {
      const game = gameSelect ? gameSelect.value : 'gameloop';
      const cpu = cpuSelect ? cpuSelect.value : 'hexa';
      const gpu = gpuSelect ? gpuSelect.value : 'mid_nvidia';
      const ram = ramSelect ? ramSelect.value : '16gb';
      const res = resSelect ? resSelect.value : '1080p';

      const isAmdGpu = gpu.includes('amd');
      const isNvidiaGpu = gpu.includes('nvidia');
      const isIntegrated = gpu === 'integrated';
      const isEntryGpu = gpu.includes('entry') || isIntegrated;
      const isMidGpu = gpu.includes('mid');
      const isHighGpu = gpu.includes('high');

      const isHighCpu = cpu === 'octa' || cpu === 'multi';
      const isHexaCpu = cpu === 'hexa';
      const isQuadCpu = cpu === 'quad';

      // Processor Allocation (User Rule: 4 for 4-6 cores, 6 for 8 cores, 8 for 12+ cores)
      let cpuAlloc = '4 Cores';
      if (cpu === 'octa') cpuAlloc = '6 Cores (8-Core CPU)';
      else if (cpu === 'multi') cpuAlloc = '8 Cores (12+ Core CPU)';
      else if (cpu === 'hexa') cpuAlloc = '4 Cores (Hexa-Core)';
      else cpuAlloc = '4 Cores (Quad-Core)';

      // Memory Allocation (User Rule: 6GB for 8GB RAM, 8GB for >8GB RAM)
      let ramAlloc = '8192 MB (8GB)';
      if (ram === '8gb') ramAlloc = '6144 MB (6GB)';
      else if (ram === '32gb') ramAlloc = '8192 MB (High Cache)';

      // Rendering Engine (User Rule: DirectX+ for AMD, DirectX+/OpenGL+ for Nvidia)
      let engine = 'DirectX+';
      if (isAmdGpu) {
        engine = 'DirectX+ (Optimized for AMD)';
      } else if (isNvidiaGpu) {
        engine = 'DirectX+ / OpenGL+ (NVIDIA)';
      } else {
        engine = 'DirectX+ (Low Overhead)';
      }

      // DPI & Resolution (User Rule: 160 low end, 240 mid, 400/480 high end)
      let dpiStr = '1080p • 240 DPI';
      let dpiVal = '240 DPI';
      if (isHighCpu && isHighGpu) {
        dpiVal = (res === '1440p' || res === '4k') ? '480 DPI' : '400 DPI';
      } else if (isQuadCpu && isEntryGpu) {
        dpiVal = '160 DPI';
      } else {
        dpiVal = '240 DPI';
      }
      dpiStr = `${res.toUpperCase()} • ${dpiVal}`;

      // Default visual theme
      let tier = 'Esports Tier';
      let fps = '120 FPS';
      let summary = 'Optimal Settings: Smooth + 120 FPS • Zero Stutter Guaranteed';
      let preset = 'Smooth + Ultra Extreme (120 FPS)';
      let latency = '~2.8ms (-78% Fist Tool)';
      let color = 'var(--color-cyan)';
      let shadowColor = 'rgba(0, 229, 255, 0.45)';
      let bgColor = 'rgba(0, 229, 255, 0.04)';
      let borderColor = 'rgba(0, 229, 255, 0.28)';

      if (game === 'gameloop') {
        // CPU plays paramount role in GameLoop smoothness
        if (isHighCpu) {
          if (isHighGpu) {
            tier = 'Flagship Tier';
            fps = '120 FPS';
            preset = 'Ultra HDR + Ultra Extreme (120 FPS)';
            summary = 'Flagship Dominance: Ultra HDR 120 FPS with max graphic fidelity';
            color = 'var(--color-green)';
            shadowColor = 'rgba(0, 255, 102, 0.45)';
            bgColor = 'rgba(0, 255, 102, 0.04)';
            borderColor = 'rgba(0, 255, 102, 0.3)';
          } else {
            // High end processor with lower end GPU (User requirement: 120 FPS with high end CPU + low end GPU)
            tier = 'Esports Smooth Tier';
            fps = '120 FPS';
            preset = 'Smooth + Ultra Extreme (120 FPS)';
            summary = 'CPU-Driven Smoothness: Flawless 120 FPS frame timing & zero micro-stutter';
            color = 'var(--color-cyan)';
            shadowColor = 'rgba(0, 229, 255, 0.45)';
            bgColor = 'rgba(0, 229, 255, 0.04)';
            borderColor = 'rgba(0, 229, 255, 0.28)';
          }
        } else if (isHexaCpu) {
          if (isHighGpu || isMidGpu) {
            tier = 'Esports Tier';
            fps = '120 FPS';
            preset = 'Smooth + Ultra Extreme (120 FPS)';
            summary = 'Esports Ready: Stable 120 FPS locked in competitive encounters';
            color = 'var(--color-cyan)';
            shadowColor = 'rgba(0, 229, 255, 0.45)';
            bgColor = 'rgba(0, 229, 255, 0.04)';
            borderColor = 'rgba(0, 229, 255, 0.28)';
          } else {
            tier = 'Budget Esports';
            fps = '90 FPS';
            preset = 'Smooth + 90 FPS';
            summary = 'Solid Framerates: Smooth 90 FPS performance with optimized memory allocation';
            color = 'var(--text-primary)';
            shadowColor = 'rgba(255, 255, 255, 0.25)';
            bgColor = 'rgba(255, 255, 255, 0.03)';
            borderColor = 'rgba(255, 255, 255, 0.18)';
          }
        } else {
          // Quad-core CPU
          tier = 'Budget Tier';
          fps = isEntryGpu ? '60 FPS' : '90 FPS';
          preset = isEntryGpu ? 'Smooth + Extreme (60 FPS)' : 'Smooth + 90 FPS';
          summary = 'Budget Optimization: Optimized background overhead to eliminate CPU bottleneck';
          color = 'var(--text-primary)';
          shadowColor = 'rgba(255, 255, 255, 0.25)';
          bgColor = 'rgba(255, 255, 255, 0.03)';
          borderColor = 'rgba(255, 255, 255, 0.18)';
        }
      } else if (game === 'esports') {
        // Valorant / CS2 / Overwatch 2
        engine = isAmdGpu ? 'DirectX 11 / Vulkan' : 'DirectX 11 (Reflex ON)';
        if (isHighCpu && (isHighGpu || isMidGpu)) {
          tier = 'Competitive Elite';
          fps = '360+ FPS';
          preset = 'Low / Competitive (Max FPS)';
          summary = 'Esports God Tier: Sub-2ms click-to-shoot responsiveness & 360Hz display readiness';
          color = 'var(--color-green)';
          shadowColor = 'rgba(0, 255, 102, 0.45)';
          bgColor = 'rgba(0, 255, 102, 0.04)';
          borderColor = 'rgba(0, 255, 102, 0.3)';
          latency = '~1.8ms Click-to-Shoot';
        } else if (isHighCpu || isMidGpu) {
          tier = 'Esports High';
          fps = '240 FPS';
          preset = 'Competitive Low (Optimized)';
          summary = '240Hz Ready: Ultra low latency with timer resolution set to 0.5ms';
          color = 'var(--color-cyan)';
          latency = '~2.2ms Click-to-Shoot';
        } else {
          tier = 'Competitive Standard';
          fps = '144 FPS';
          preset = 'Competitive Low';
          summary = '144Hz Smoothness: Clean frame delivery with zero background interrupts';
          color = 'var(--text-primary)';
          latency = '~3.4ms Click-to-Shoot';
        }
      } else if (game === 'br') {
        // Battle Royale (Warzone / Apex / Fortnite)
        engine = isAmdGpu ? 'DirectX 12 / Vulkan' : 'DirectX 12 (NVIDIA Reflex)';
        if (isHighCpu && isHighGpu) {
          tier = 'Apex Dominance';
          fps = '165+ FPS';
          preset = 'Optimized High / Comp';
          summary = 'Battle Royale Master: Consistent 165+ FPS in end-game combat clusters';
          color = 'var(--color-green)';
          shadowColor = 'rgba(0, 255, 102, 0.45)';
          bgColor = 'rgba(0, 255, 102, 0.04)';
          borderColor = 'rgba(0, 255, 102, 0.3)';
          latency = '~2.5ms Frame Latency';
        } else if (isHighCpu || isMidGpu) {
          tier = 'BR Competitive';
          fps = '120–144 FPS';
          preset = 'Competitive Medium / Low';
          summary = 'Solid Framerates: 1% low frame stabilization via Fist Tool memory cleanup';
          color = 'var(--color-cyan)';
          latency = '~3.1ms Frame Latency';
        } else {
          tier = 'BR Performance';
          fps = '60–90 FPS';
          preset = 'Performance Mode / 720p Scaling';
          summary = 'Playable Competitive: Maximum shader cache and thread unpark optimizations';
          color = 'var(--text-primary)';
          latency = '~4.8ms Frame Latency';
        }
      } else if (game === 'aaa') {
        // AAA / Cyberpunk / GTA V
        engine = 'DirectX 12 Ultimate / Vulkan';
        if (isHighCpu && isHighGpu) {
          tier = 'Ultra Fidelity';
          fps = (res === '4k') ? '75–90 FPS' : '120+ FPS';
          preset = 'High / Ultra + DLSS/FSR Quality';
          summary = 'Max Fidelity: Silky smooth AAA frame pacing with DWM stutter mitigation';
          color = 'var(--color-green)';
          shadowColor = 'rgba(0, 255, 102, 0.45)';
          bgColor = 'rgba(0, 255, 102, 0.04)';
          borderColor = 'rgba(0, 255, 102, 0.3)';
          latency = '~3.8ms Smooth Pacing';
        } else if (isMidGpu) {
          tier = 'Optimized Fidelity';
          fps = '60–80 FPS';
          preset = 'Medium-High / Balanced Scaling';
          summary = 'Stable Cinematic: 60+ FPS lock with GPU hardware scheduling active';
          color = 'var(--color-cyan)';
          latency = '~5.2ms Smooth Pacing';
        } else {
          tier = 'Standard Gaming';
          fps = '45–60 FPS';
          preset = 'Low-Medium + FSR Performance';
          summary = 'Playable Frame Rate: Aggressive background service trimming for max VRAM headroom';
          color = 'var(--text-primary)';
          latency = '~7.1ms Smooth Pacing';
        }
      } else {
        // General Windows System Latency
        engine = 'Win32 Kernel / DWM Tweaks';
        tier = 'Zero-Stutter OS';
        fps = '0.5ms Ping';
        preset = 'Fist Ultimate Power Plan';
        summary = 'System Responsiveness: 78% lower DWM input latency, 85% fewer kernel interrupts';
        cpuAlloc = 'All Cores Unparked';
        ramAlloc = 'Cleaned & Standby Cleared';
        dpiStr = `${res.toUpperCase()} • Native`;
        latency = '0.500ms Timer Resolution';
        color = 'var(--color-cyan)';
      }

      // Update UI elements in the card
      if (tierBadge) {
        tierBadge.innerText = tier;
        tierBadge.style.color = color;
        tierBadge.style.borderColor = borderColor;
        tierBadge.style.background = bgColor;
      }

      if (fpsBadge) {
        fpsBadge.innerText = fps;
        fpsBadge.style.color = color;
        fpsBadge.style.textShadow = `0 0 25px ${shadowColor}`;
      }

      if (summaryText) {
        summaryText.innerText = summary;
      }

      if (detailPreset) detailPreset.innerText = preset;
      if (detailEngine) detailEngine.innerText = engine;
      if (detailCpu) detailCpu.innerText = cpuAlloc;
      if (detailRam) detailRam.innerText = ramAlloc;
      if (detailDpi) detailDpi.innerText = dpiStr;
      if (detailLatency) {
        detailLatency.innerText = latency;
        detailLatency.style.color = color;
      }

      if (resultBox) {
        resultBox.style.background = bgColor;
        resultBox.style.borderColor = borderColor;

        resultBox.animate([
          { opacity: 0.7, transform: 'scale(0.98)' },
          { opacity: 1, transform: 'scale(1)' }
        ], { duration: 250, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
      }
    }

    // Attach reactive listeners to all selects
    [gameSelect, cpuSelect, gpuSelect, ramSelect, resSelect].forEach(sel => {
      if (sel) {
        sel.addEventListener('change', calculatePerformance);
      }
    });

    if (checkBtn) {
      checkBtn.addEventListener('click', calculatePerformance);
    }

    // Run initial calculation once on load
    calculatePerformance();
  });

  // 8. FAQ ACCORDION LOGIC
  const faqHeaders = document.querySelectorAll('.faq-header');
  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      const content = header.nextElementSibling;
      
      // Close all others
      faqHeaders.forEach(otherHeader => {
        if (otherHeader !== header) {
          otherHeader.setAttribute('aria-expanded', 'false');
          otherHeader.nextElementSibling.style.maxHeight = null;
        }
      });

      // Toggle current
      if (isExpanded) {
        header.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = null;
      } else {
        header.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
