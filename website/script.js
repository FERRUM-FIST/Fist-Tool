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

  // ==========================================================================
  // 7. UNIVERSAL HARDWARE & FPS DATABASE ENGINE
  // ==========================================================================
  const CPU_DATABASE = [
    // AMD Ryzen 7000 / 9000 & X3D
    { name: 'AMD Ryzen 9 7950X3D (16 Cores)', cores: 16, tier: 'flagship', vendor: 'amd' },
    { name: 'AMD Ryzen 9 7950X (16 Cores)', cores: 16, tier: 'flagship', vendor: 'amd' },
    { name: 'AMD Ryzen 9 7900X3D (12 Cores)', cores: 12, tier: 'flagship', vendor: 'amd' },
    { name: 'AMD Ryzen 9 7900X (12 Cores)', cores: 12, tier: 'flagship', vendor: 'amd' },
    { name: 'AMD Ryzen 7 7800X3D (8 Cores)', cores: 8, tier: 'flagship', vendor: 'amd' },
    { name: 'AMD Ryzen 7 7700X (8 Cores)', cores: 8, tier: 'high', vendor: 'amd' },
    { name: 'AMD Ryzen 7 7700 (8 Cores)', cores: 8, tier: 'high', vendor: 'amd' },
    { name: 'AMD Ryzen 5 7600X (6 Cores)', cores: 6, tier: 'high', vendor: 'amd' },
    { name: 'AMD Ryzen 5 7600 (6 Cores)', cores: 6, tier: 'high', vendor: 'amd' },
    // AMD Ryzen 5000 Series
    { name: 'AMD Ryzen 9 5950X (16 Cores)', cores: 16, tier: 'flagship', vendor: 'amd' },
    { name: 'AMD Ryzen 9 5900X (12 Cores)', cores: 12, tier: 'flagship', vendor: 'amd' },
    { name: 'AMD Ryzen 7 5800X3D (8 Cores)', cores: 8, tier: 'flagship', vendor: 'amd' },
    { name: 'AMD Ryzen 7 5800X (8 Cores)', cores: 8, tier: 'high', vendor: 'amd' },
    { name: 'AMD Ryzen 7 5700X3D (8 Cores)', cores: 8, tier: 'high', vendor: 'amd' },
    { name: 'AMD Ryzen 7 5700X (8 Cores)', cores: 8, tier: 'high', vendor: 'amd' },
    { name: 'AMD Ryzen 7 5700G (8 Cores)', cores: 8, tier: 'high', vendor: 'amd' },
    { name: 'AMD Ryzen 5 5600X (6 Cores)', cores: 6, tier: 'high', vendor: 'amd' },
    { name: 'AMD Ryzen 5 5600 (6 Cores)', cores: 6, tier: 'high', vendor: 'amd' },
    { name: 'AMD Ryzen 5 5600G (6 Cores)', cores: 6, tier: 'mid', vendor: 'amd' },
    { name: 'AMD Ryzen 5 5500 (6 Cores)', cores: 6, tier: 'mid', vendor: 'amd' },
    { name: 'AMD Ryzen 3 4100 (4 Cores)', cores: 4, tier: 'budget', vendor: 'amd' },
    // AMD Ryzen 3000 / 2000 / 1000 & Older
    { name: 'AMD Ryzen 9 3900X (12 Cores)', cores: 12, tier: 'flagship', vendor: 'amd' },
    { name: 'AMD Ryzen 7 3700X (8 Cores)', cores: 8, tier: 'high', vendor: 'amd' },
    { name: 'AMD Ryzen 5 3600X (6 Cores)', cores: 6, tier: 'mid', vendor: 'amd' },
    { name: 'AMD Ryzen 5 3600 (6 Cores)', cores: 6, tier: 'mid', vendor: 'amd' },
    { name: 'AMD Ryzen 5 2600 (6 Cores)', cores: 6, tier: 'mid', vendor: 'amd' },
    { name: 'AMD Ryzen 5 1600 (6 Cores)', cores: 6, tier: 'budget', vendor: 'amd' },
    { name: 'AMD Ryzen 3 3300X (4 Cores)', cores: 4, tier: 'budget', vendor: 'amd' },
    { name: 'AMD Ryzen 3 3100 (4 Cores)', cores: 4, tier: 'budget', vendor: 'amd' },
    { name: 'AMD Ryzen 3 2200G (4 Cores)', cores: 4, tier: 'budget', vendor: 'amd' },
    { name: 'AMD FX-8350 / FX-6300 (6-8 Cores)', cores: 6, tier: 'budget', vendor: 'amd' },
    { name: 'AMD Athlon 3000G / 200GE (2 Cores)', cores: 2, tier: 'budget', vendor: 'amd' },
    // Intel 12th / 13th / 14th Gen
    { name: 'Intel Core i9-14900K / 14900KF (24 Cores)', cores: 24, tier: 'flagship', vendor: 'intel' },
    { name: 'Intel Core i9-13900K / 13900KF (24 Cores)', cores: 24, tier: 'flagship', vendor: 'intel' },
    { name: 'Intel Core i9-12900K / 12900KF (16 Cores)', cores: 16, tier: 'flagship', vendor: 'intel' },
    { name: 'Intel Core i7-14700K / 14700KF (20 Cores)', cores: 20, tier: 'flagship', vendor: 'intel' },
    { name: 'Intel Core i7-13700K / 13700KF (16 Cores)', cores: 16, tier: 'flagship', vendor: 'intel' },
    { name: 'Intel Core i7-12700K / 12700F (12 Cores)', cores: 12, tier: 'high', vendor: 'intel' },
    { name: 'Intel Core i5-14600K / 14600KF (14 Cores)', cores: 14, tier: 'high', vendor: 'intel' },
    { name: 'Intel Core i5-13600K / 13600KF (14 Cores)', cores: 14, tier: 'high', vendor: 'intel' },
    { name: 'Intel Core i5-13400 / 13400F (10 Cores)', cores: 10, tier: 'high', vendor: 'intel' },
    { name: 'Intel Core i5-12600K / 12600KF (10 Cores)', cores: 10, tier: 'high', vendor: 'intel' },
    { name: 'Intel Core i5-12400 / 12400F (6 Cores)', cores: 6, tier: 'high', vendor: 'intel' },
    { name: 'Intel Core i3-14100 / 14100F (4 Cores)', cores: 4, tier: 'budget', vendor: 'intel' },
    { name: 'Intel Core i3-13100 / 13100F (4 Cores)', cores: 4, tier: 'budget', vendor: 'intel' },
    { name: 'Intel Core i3-12100 / 12100F (4 Cores)', cores: 4, tier: 'budget', vendor: 'intel' },
    // Intel 10th / 11th Gen
    { name: 'Intel Core i9-11900K / 10900K (10 Cores)', cores: 10, tier: 'flagship', vendor: 'intel' },
    { name: 'Intel Core i7-11700K / 10700K (8 Cores)', cores: 8, tier: 'high', vendor: 'intel' },
    { name: 'Intel Core i5-11600K / 11400F (6 Cores)', cores: 6, tier: 'mid', vendor: 'intel' },
    { name: 'Intel Core i5-10600K / 10400F (6 Cores)', cores: 6, tier: 'mid', vendor: 'intel' },
    { name: 'Intel Core i3-10105F / 10100F (4 Cores)', cores: 4, tier: 'budget', vendor: 'intel' },
    // Intel 6th - 9th Gen & Older
    { name: 'Intel Core i9-9900K / 9900KS (8 Cores)', cores: 8, tier: 'high', vendor: 'intel' },
    { name: 'Intel Core i7-9700K / 8700K (6-8 Cores)', cores: 8, tier: 'high', vendor: 'intel' },
    { name: 'Intel Core i7-7700K / 6700K / 4790K / 3770K (4 Cores)', cores: 4, tier: 'budget', vendor: 'intel' },
    { name: 'Intel Core i5-9400F / 8400 (6 Cores)', cores: 6, tier: 'mid', vendor: 'intel' },
    { name: 'Intel Core i5-7400 / 6500 / 4590 / 3470 / 2500K (4 Cores)', cores: 4, tier: 'budget', vendor: 'intel' },
    { name: 'Intel Core i3-9100 / 8100 / 7100 / 4130 (2-4 Cores)', cores: 4, tier: 'budget', vendor: 'intel' },
    { name: 'Intel Pentium Gold / Celeron (2 Cores)', cores: 2, tier: 'budget', vendor: 'intel' }
  ];

  const GPU_DATABASE = [
    // NVIDIA RTX 40 Series
    { name: 'NVIDIA GeForce RTX 4090 (24GB)', tier: 'flagship', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce RTX 4080 Super / 4080 (16GB)', tier: 'flagship', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce RTX 4070 Ti Super / 4070 Ti (12-16GB)', tier: 'flagship', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce RTX 4070 Super / 4070 (12GB)', tier: 'high', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce RTX 4060 Ti (8GB/16GB)', tier: 'high', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce RTX 4060 (8GB)', tier: 'mid', vendor: 'nvidia' },
    // NVIDIA RTX 30 Series
    { name: 'NVIDIA GeForce RTX 3090 Ti / 3090 (24GB)', tier: 'flagship', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce RTX 3080 Ti / 3080 (10-12GB)', tier: 'flagship', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce RTX 3070 Ti / 3070 (8GB)', tier: 'high', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce RTX 3060 Ti (8GB)', tier: 'high', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce RTX 3060 (12GB)', tier: 'mid', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce RTX 3050 (8GB/6GB)', tier: 'mid', vendor: 'nvidia' },
    // NVIDIA RTX 20 Series
    { name: 'NVIDIA GeForce RTX 2080 Ti / 2080 Super (8-11GB)', tier: 'high', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce RTX 2070 Super / 2070 (8GB)', tier: 'high', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce RTX 2060 Super / 2060 (6-8GB)', tier: 'mid', vendor: 'nvidia' },
    // NVIDIA GTX 16 & 10 Series
    { name: 'NVIDIA GeForce GTX 1660 Ti / 1660 Super (6GB)', tier: 'mid', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce GTX 1660 (6GB)', tier: 'mid', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce GTX 1650 Super (4GB)', tier: 'entry', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce GTX 1650 (4GB)', tier: 'entry', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce GTX 1080 Ti / 1080 (8-11GB)', tier: 'high', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce GTX 1070 Ti / 1070 (8GB)', tier: 'high', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce GTX 1060 (6GB/3GB)', tier: 'mid', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce GTX 1050 Ti (4GB)', tier: 'entry', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce GTX 1050 (2GB/3GB)', tier: 'entry', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce GTX 980 / 970 / 960 (2-4GB)', tier: 'entry', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce GTX 750 Ti / 750 (2GB/4GB)', tier: 'entry', vendor: 'nvidia' },
    { name: 'NVIDIA GeForce GT 1030 / GT 730 / 710', tier: 'entry', vendor: 'nvidia' },
    // AMD Radeon RX 7000 Series
    { name: 'AMD Radeon RX 7900 XTX / 7900 XT (20-24GB)', tier: 'flagship', vendor: 'amd' },
    { name: 'AMD Radeon RX 7800 XT (16GB)', tier: 'high', vendor: 'amd' },
    { name: 'AMD Radeon RX 7700 XT (12GB)', tier: 'high', vendor: 'amd' },
    { name: 'AMD Radeon RX 7600 XT / 7600 (8-16GB)', tier: 'mid', vendor: 'amd' },
    // AMD Radeon RX 6000 Series
    { name: 'AMD Radeon RX 6950 XT / 6900 XT (16GB)', tier: 'flagship', vendor: 'amd' },
    { name: 'AMD Radeon RX 6800 XT / 6800 (16GB)', tier: 'high', vendor: 'amd' },
    { name: 'AMD Radeon RX 6750 XT / 6700 XT (12GB)', tier: 'high', vendor: 'amd' },
    { name: 'AMD Radeon RX 6650 XT / 6600 XT (8GB)', tier: 'mid', vendor: 'amd' },
    { name: 'AMD Radeon RX 6600 (8GB)', tier: 'mid', vendor: 'amd' },
    { name: 'AMD Radeon RX 6500 XT / 6400 (4GB)', tier: 'entry', vendor: 'amd' },
    // AMD Radeon RX 5000 / 500 / 400
    { name: 'AMD Radeon RX 5700 XT / 5700 (8GB)', tier: 'high', vendor: 'amd' },
    { name: 'AMD Radeon RX 5600 XT / 5500 XT (6-8GB)', tier: 'mid', vendor: 'amd' },
    { name: 'AMD Radeon RX 590 / 580 (8GB)', tier: 'mid', vendor: 'amd' },
    { name: 'AMD Radeon RX 570 (4GB/8GB)', tier: 'entry', vendor: 'amd' },
    { name: 'AMD Radeon RX 560 / 550 / 460 (2-4GB)', tier: 'entry', vendor: 'amd' },
    // Intel Arc Series
    { name: 'Intel Arc A770 (16GB)', tier: 'high', vendor: 'intel' },
    { name: 'Intel Arc A750 / A580 (8GB)', tier: 'mid', vendor: 'intel' },
    { name: 'Intel Arc A380 / A310 (4-6GB)', tier: 'entry', vendor: 'intel' },
    // Integrated Graphics
    { name: 'Intel Iris Xe Graphics', tier: 'integrated', vendor: 'integrated' },
    { name: 'Intel UHD Graphics 770 / 750 / 730', tier: 'integrated', vendor: 'integrated' },
    { name: 'Intel UHD Graphics 630 / HD 530 / 620', tier: 'integrated', vendor: 'integrated' },
    { name: 'Intel HD Graphics 4600 / 4400 / 4000', tier: 'integrated', vendor: 'integrated' },
    { name: 'AMD Radeon 780M / 760M (Ryzen APU)', tier: 'entry', vendor: 'integrated' },
    { name: 'AMD Radeon Vega 8 / Vega 7 / Vega 3', tier: 'integrated', vendor: 'integrated' }
  ];

  // Auto-populate datalists across the entire page
  document.querySelectorAll('#hw-cpu-list').forEach(dl => {
    dl.innerHTML = CPU_DATABASE.map(c => `<option value="${c.name}"></option>`).join('');
  });
  document.querySelectorAll('#hw-gpu-list').forEach(dl => {
    dl.innerHTML = GPU_DATABASE.map(g => `<option value="${g.name}"></option>`).join('');
  });

  const hwCheckerCards = document.querySelectorAll('.hw-checker-card');

  hwCheckerCards.forEach(card => {
    const gameSelect = card.querySelector('#hw-game');
    const cpuInput = card.querySelector('#hw-cpu');
    const gpuInput = card.querySelector('#hw-gpu');
    const ramSelect = card.querySelector('#hw-ram');
    const resSelect = card.querySelector('#hw-res');
    const checkBtn = card.querySelector('#hw-check-btn');
    const autodetectBtn = card.querySelector('#hw-autodetect-btn');

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
      const cpuVal = (cpuInput ? cpuInput.value : '').trim();
      const gpuVal = (gpuInput ? gpuInput.value : '').trim();
      const ramVal = ramSelect ? ramSelect.value : '16gb';
      const resVal = resSelect ? resSelect.value : '1080p';

      const cpuLower = cpuVal.toLowerCase();
      const gpuLower = gpuVal.toLowerCase();

      // 1. Analyze CPU
      let cpuMatch = CPU_DATABASE.find(c => cpuLower.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(cpuLower));
      let cores = cpuMatch ? cpuMatch.cores : 6;
      let cpuTier = cpuMatch ? cpuMatch.tier : 'mid';

      if (!cpuMatch) {
        if (cpuLower.includes('i9') || cpuLower.includes('ryzen 9') || cpuLower.includes('threadripper') || cpuLower.includes('14900') || cpuLower.includes('13900')) {
          cores = 16; cpuTier = 'flagship';
        } else if (cpuLower.includes('i7') || cpuLower.includes('ryzen 7') || cpuLower.includes('x3d') || cpuLower.includes('7800') || cpuLower.includes('5800') || cpuLower.includes('13700') || cpuLower.includes('12700')) {
          cores = 8; cpuTier = 'high';
        } else if (cpuLower.includes('i5') || cpuLower.includes('ryzen 5') || cpuLower.includes('5600') || cpuLower.includes('12400') || cpuLower.includes('10400') || cpuLower.includes('3600')) {
          cores = 6; cpuTier = 'high';
        } else if (cpuLower.includes('i3') || cpuLower.includes('ryzen 3') || cpuLower.includes('pentium') || cpuLower.includes('athlon') || cpuLower.includes('celeron') || cpuLower.includes('10100') || cpuLower.includes('12100')) {
          cores = 4; cpuTier = 'budget';
        }
      }

      // 2. Analyze GPU
      let gpuMatch = GPU_DATABASE.find(g => gpuLower.includes(g.name.toLowerCase()) || g.name.toLowerCase().includes(gpuLower));
      let gpuTier = gpuMatch ? gpuMatch.tier : 'mid';
      let gpuVendor = gpuMatch ? gpuMatch.vendor : 'nvidia';

      if (!gpuMatch) {
        const isAmd = gpuLower.includes('amd') || gpuLower.includes('radeon') || gpuLower.includes('rx ');
        const isIntel = gpuLower.includes('intel') || gpuLower.includes('arc') || gpuLower.includes('iris') || gpuLower.includes('uhd');
        gpuVendor = isAmd ? 'amd' : (isIntel ? 'intel' : 'nvidia');

        if (gpuLower.includes('4090') || gpuLower.includes('4080') || gpuLower.includes('7900') || gpuLower.includes('3090') || gpuLower.includes('3080') || gpuLower.includes('6950') || gpuLower.includes('6900')) {
          gpuTier = 'flagship';
        } else if (gpuLower.includes('4070') || gpuLower.includes('3070') || gpuLower.includes('7800') || gpuLower.includes('7700') || gpuLower.includes('6800') || gpuLower.includes('6700') || gpuLower.includes('a770')) {
          gpuTier = 'high';
        } else if (gpuLower.includes('3060') || gpuLower.includes('4060') || gpuLower.includes('2060') || gpuLower.includes('1660') || gpuLower.includes('6600') || gpuLower.includes('580') || gpuLower.includes('590') || gpuLower.includes('3050') || gpuLower.includes('a750')) {
          gpuTier = 'mid';
        } else if (gpuLower.includes('1650') || gpuLower.includes('1050') || gpuLower.includes('750') || gpuLower.includes('560') || gpuLower.includes('550') || gpuLower.includes('460') || gpuLower.includes('1030') || gpuLower.includes('960')) {
          gpuTier = 'entry';
        } else if (gpuLower.includes('iris') || gpuLower.includes('uhd') || gpuLower.includes('vega') || gpuLower.includes('hd graphics')) {
          gpuTier = 'integrated';
          gpuVendor = 'integrated';
        }
      }

      // ==========================================
      // EXACT USER OPTIMIZATION RULES ENFORCEMENT
      // ==========================================

      // Rule 1: Processor Allocation (4 for 4-6 cores, 6 for 8 cores, 8 for 12+ cores)
      let cpuAlloc = '4 Cores';
      if (cores >= 12) {
        cpuAlloc = '8 Cores (12+ Core CPU)';
      } else if (cores >= 8) {
        cpuAlloc = '6 Cores (8-Core CPU)';
      } else {
        cpuAlloc = '4 Cores (Quad/Hexa Core)';
      }

      // Rule 2: Memory Allocation (6GB for 8GB users, 8GB for >8GB users)
      let ramAlloc = '8192 MB (8GB)';
      if (ramVal === '8gb') {
        ramAlloc = '6144 MB (6GB)';
      } else if (ramVal === '32gb') {
        ramAlloc = '8192 MB (High Cache)';
      }

      // Rule 3: Rendering Engine (DirectX+ for AMD, DirectX+/OpenGL+ for Nvidia)
      let engine = 'DirectX+';
      if (gpuVendor === 'amd') {
        engine = 'DirectX+ (Optimized for AMD)';
      } else if (gpuVendor === 'nvidia') {
        engine = 'DirectX+ / OpenGL+ (NVIDIA)';
      } else {
        engine = 'DirectX+ (Low Overhead)';
      }

      // Rule 4: DPI (160 low-end, 240 mid, 400/480 high-end)
      let dpiStr = '1080p • 240 DPI';
      let dpiVal = '240 DPI';
      const isHighEndRig = (cpuTier === 'flagship' || cpuTier === 'high') && (gpuTier === 'flagship' || gpuTier === 'high');
      const isLowEndRig = (cpuTier === 'budget') && (gpuTier === 'entry' || gpuTier === 'integrated');

      if (isHighEndRig) {
        dpiVal = (resVal === '1440p' || resVal === '4k') ? '480 DPI' : '400 DPI';
      } else if (isLowEndRig) {
        dpiVal = '160 DPI';
      } else {
        dpiVal = '240 DPI';
      }
      dpiStr = `${resVal.toUpperCase()} • ${dpiVal}`;

      // Rule 5: CPU Smoothness Rule
      // High-End CPU + Low-End GPU shows 120 FPS on Smooth graphics
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
        if (cpuTier === 'flagship' || cpuTier === 'high') {
          if (gpuTier === 'flagship' || gpuTier === 'high') {
            tier = 'Flagship Tier';
            fps = '120 FPS';
            preset = 'Ultra HDR + Ultra Extreme (120 FPS)';
            summary = 'Flagship Beast: Ultra HDR 120 FPS with maximum graphical clarity and zero delay';
            color = 'var(--color-green)';
            shadowColor = 'rgba(0, 255, 102, 0.45)';
            bgColor = 'rgba(0, 255, 102, 0.04)';
            borderColor = 'rgba(0, 255, 102, 0.3)';
          } else {
            // High-End CPU with lower GPU: 120 FPS with smooth graphics
            tier = 'Esports Smooth Tier';
            fps = '120 FPS';
            preset = 'Smooth + Ultra Extreme (120 FPS)';
            summary = 'CPU-Driven Smoothness: Flawless 120 FPS frame timing & zero micro-stutter';
            color = 'var(--color-cyan)';
            shadowColor = 'rgba(0, 229, 255, 0.45)';
            bgColor = 'rgba(0, 229, 255, 0.04)';
            borderColor = 'rgba(0, 229, 255, 0.28)';
          }
        } else if (cpuTier === 'mid') {
          if (gpuTier === 'flagship' || gpuTier === 'high' || gpuTier === 'mid') {
            tier = 'Esports Tier';
            fps = '120 FPS';
            preset = 'Smooth + Ultra Extreme (120 FPS)';
            summary = 'Esports Ready: Rock-solid 120 FPS locked in competitive encounters';
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
          // Budget CPU
          tier = 'Budget Tier';
          const isEntry = (gpuTier === 'entry' || gpuTier === 'integrated');
          fps = isEntry ? '60 FPS' : '90 FPS';
          preset = isEntry ? 'Smooth + Extreme (60 FPS)' : 'Smooth + 90 FPS';
          summary = 'Budget Optimization: Minimized background interrupt overhead to eliminate CPU bottleneck';
          color = 'var(--text-primary)';
          shadowColor = 'rgba(255, 255, 255, 0.25)';
          bgColor = 'rgba(255, 255, 255, 0.03)';
          borderColor = 'rgba(255, 255, 255, 0.18)';
        }
      } else if (game === 'esports') {
        engine = gpuVendor === 'amd' ? 'DirectX 11 / Vulkan' : 'DirectX 11 (Reflex ON)';
        if ((cpuTier === 'flagship' || cpuTier === 'high') && (gpuTier === 'flagship' || gpuTier === 'high')) {
          tier = 'Competitive Elite';
          fps = '360+ FPS';
          preset = 'Low / Competitive (Max FPS)';
          summary = 'Esports God Tier: Sub-2ms click-to-shoot responsiveness & 360Hz display readiness';
          color = 'var(--color-green)';
          shadowColor = 'rgba(0, 255, 102, 0.45)';
          bgColor = 'rgba(0, 255, 102, 0.04)';
          borderColor = 'rgba(0, 255, 102, 0.3)';
          latency = '~1.8ms Click-to-Shoot';
        } else if (cpuTier === 'flagship' || cpuTier === 'high' || gpuTier === 'mid') {
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
        engine = gpuVendor === 'amd' ? 'DirectX 12 / Vulkan' : 'DirectX 12 (NVIDIA Reflex)';
        if ((cpuTier === 'flagship' || cpuTier === 'high') && (gpuTier === 'flagship' || gpuTier === 'high')) {
          tier = 'Apex Dominance';
          fps = '165+ FPS';
          preset = 'Optimized High / Comp';
          summary = 'Battle Royale Master: Consistent 165+ FPS in heavy combat firefights';
          color = 'var(--color-green)';
          shadowColor = 'rgba(0, 255, 102, 0.45)';
          bgColor = 'rgba(0, 255, 102, 0.04)';
          borderColor = 'rgba(0, 255, 102, 0.3)';
          latency = '~2.5ms Frame Latency';
        } else if (cpuTier === 'flagship' || cpuTier === 'high' || gpuTier === 'mid') {
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
        engine = 'DirectX 12 Ultimate / Vulkan';
        if ((cpuTier === 'flagship' || cpuTier === 'high') && (gpuTier === 'flagship' || gpuTier === 'high')) {
          tier = 'Ultra Fidelity';
          fps = (resVal === '4k') ? '75–90 FPS' : '120+ FPS';
          preset = 'High / Ultra + DLSS/FSR Quality';
          summary = 'Max Fidelity: Silky smooth AAA frame pacing with DWM stutter mitigation';
          color = 'var(--color-green)';
          shadowColor = 'rgba(0, 255, 102, 0.45)';
          bgColor = 'rgba(0, 255, 102, 0.04)';
          borderColor = 'rgba(0, 255, 102, 0.3)';
          latency = '~3.8ms Smooth Pacing';
        } else if (gpuTier === 'mid') {
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
        engine = 'Win32 Kernel / DWM Tweaks';
        tier = 'Zero-Stutter OS';
        fps = '0.5ms Ping';
        preset = 'Fist Ultimate Power Plan';
        summary = 'System Responsiveness: 78% lower DWM input latency, 85% fewer kernel interrupts';
        cpuAlloc = 'All Cores Unparked';
        ramAlloc = 'Cleaned & Standby Cleared';
        dpiStr = `${resVal.toUpperCase()} • Native`;
        latency = '0.500ms Timer Resolution';
        color = 'var(--color-cyan)';
      }

      // Update UI
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

      if (summaryText) summaryText.innerText = summary;
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

    // ⚡ Auto-Detect Hardware from Browser
    if (autodetectBtn) {
      autodetectBtn.addEventListener('click', () => {
        autodetectBtn.innerText = '⚡ Scanning...';

        // 1. Detect Cores
        const threads = navigator.hardwareConcurrency || 8;
        let detectedCpu = 'AMD Ryzen 5 5600 (6 Cores)';
        if (threads >= 24) detectedCpu = 'Intel Core i9-14900K / 14900KF (24 Cores)';
        else if (threads >= 16) detectedCpu = 'AMD Ryzen 7 7800X3D (8 Cores)';
        else if (threads >= 12) detectedCpu = 'AMD Ryzen 5 5600 (6 Cores)';
        else if (threads >= 8) detectedCpu = 'Intel Core i3-12100 / 12100F (4 Cores)';
        else detectedCpu = 'Intel Pentium Gold / Celeron (2 Cores)';

        if (cpuInput) cpuInput.value = detectedCpu;

        // 2. Detect GPU via WebGL
        let detectedGpu = 'NVIDIA GeForce RTX 3060 (12GB)';
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
              const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
              const rLower = renderer.toLowerCase();
              const found = GPU_DATABASE.find(g => {
                const words = g.name.toLowerCase().split(' ');
                return words.some(w => w.length > 3 && rLower.includes(w));
              });
              if (found) {
                detectedGpu = found.name;
              } else if (rLower.includes('nvidia') || rLower.includes('geforce')) {
                detectedGpu = 'NVIDIA GeForce RTX 3060 (12GB)';
              } else if (rLower.includes('radeon') || rLower.includes('amd')) {
                detectedGpu = 'AMD Radeon RX 6600 (8GB)';
              } else if (rLower.includes('intel') || rLower.includes('iris')) {
                detectedGpu = 'Intel Iris Xe Graphics';
              }
            }
          }
        } catch (e) {}

        if (gpuInput) gpuInput.value = detectedGpu;

        // 3. Detect RAM
        if (navigator.deviceMemory && ramSelect) {
          if (navigator.deviceMemory >= 16) ramSelect.value = '16gb';
          else if (navigator.deviceMemory >= 32) ramSelect.value = '32gb';
          else ramSelect.value = '8gb';
        }

        // 4. Detect Resolution
        const w = window.screen.width;
        if (resSelect) {
          if (w >= 3840) resSelect.value = '4k';
          else if (w >= 2560) resSelect.value = '1440p';
          else if (w >= 1920) resSelect.value = '1080p';
          else resSelect.value = '720p';
        }

        calculatePerformance();

        setTimeout(() => {
          autodetectBtn.innerText = '⚡ Specs Detected!';
          setTimeout(() => {
            autodetectBtn.innerText = '⚡ Auto-Detect';
          }, 2500);
        }, 300);
      });
    }

    // Attach reactive listeners to all inputs
    [gameSelect, ramSelect, resSelect].forEach(sel => {
      if (sel) sel.addEventListener('change', calculatePerformance);
    });

    [cpuInput, gpuInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', calculatePerformance);
        inp.addEventListener('change', calculatePerformance);
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
