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
  // 7. UNIVERSAL HARDWARE & FPS DATABASE ENGINE (EXHAUSTIVE HARDWARE & REAL AUTO-DETECT)
  // ==========================================================================
  const CPU_DATABASE = [
  {
    "name": "Intel Core Ultra 9 285K (24 Cores)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core Ultra 7 265K (20 Cores)",
    "cores": 20,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core Ultra 7 265KF (20 Cores)",
    "cores": 20,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core Ultra 5 245K (14 Cores)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core Ultra 5 245KF (14 Cores)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core Ultra 9 185H (16 Cores Mobile)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core Ultra 7 165H (16 Cores Mobile)",
    "cores": 16,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core Ultra 7 155H (16 Cores Mobile)",
    "cores": 16,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core Ultra 5 135H (14 Cores Mobile)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core Ultra 5 125H (14 Cores Mobile)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-14900KS (24 Cores)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-14900K (24 Cores)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-14900KF (24 Cores)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-14900 (24 Cores)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-14900F (24 Cores)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-14700K (20 Cores)",
    "cores": 20,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-14700KF (20 Cores)",
    "cores": 20,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-14700 (20 Cores)",
    "cores": 20,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-14700F (20 Cores)",
    "cores": 20,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-14600K (14 Cores)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-14600KF (14 Cores)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-14600 (14 Cores)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-14500 (14 Cores)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-14400 (10 Cores)",
    "cores": 10,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-14400F (10 Cores)",
    "cores": 10,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-14100 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-14100F (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-13900KS (24 Cores)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-13900K (24 Cores)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-13900KF (24 Cores)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-13900 (24 Cores)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-13900F (24 Cores)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-13700K (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-13700KF (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-13700 (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-13700F (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-13600K (14 Cores)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-13600KF (14 Cores)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-13500 (14 Cores)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-13400 (10 Cores)",
    "cores": 10,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-13400F (10 Cores)",
    "cores": 10,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-13100 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-13100F (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-12900KS (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-12900K (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-12900KF (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-12900 (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-12700K (12 Cores)",
    "cores": 12,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-12700KF (12 Cores)",
    "cores": 12,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-12700 (12 Cores)",
    "cores": 12,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-12700F (12 Cores)",
    "cores": 12,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-12600K (10 Cores)",
    "cores": 10,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-12600KF (10 Cores)",
    "cores": 10,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-12600 (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-12500 (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-12400 (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-12400F (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-12100 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-12100F (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-11900K (8 Cores)",
    "cores": 8,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-11900KF (8 Cores)",
    "cores": 8,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-11900 (8 Cores)",
    "cores": 8,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-11700K (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-11700KF (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-11700 (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-11600K (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-11500 (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-11400 (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-11400F (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-10900K (10 Cores)",
    "cores": 10,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-10900KF (10 Cores)",
    "cores": 10,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-10850K (10 Cores)",
    "cores": 10,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-10700K (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-10700KF (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-10700 (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-10700F (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-10600K (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-10500 (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-10400 (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-10400F (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-10105 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-10105F (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-10100 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-10100F (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-9900KS (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-9900K (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-9900KF (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-9700K (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-9700KF (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-9700 (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-9700F (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-9600K (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-9600KF (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-9400 (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-9400F (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-9100 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-9100F (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-8700K (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-8700 (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-8600K (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-8400 (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-8100 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-7700K (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-7700 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-7600K (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-7500 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-7400 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-7100 (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-6700K (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-6700 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-6600K (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-6500 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-6400 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-6100 (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-4790K (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-4790 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-4770K (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-4770 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-4690K (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-4590 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-4460 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-4160 (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-4130 (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-3770K (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-3770 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-3570K (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-3470 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i3-3220 (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-2600K (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-2600 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-2500K (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-2400 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core 2 Quad Q9650 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core 2 Quad Q6600 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core 2 Duo E8400 (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core 2 Duo E7500 (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Xeon E5-2678 v3 (12 Cores)",
    "cores": 12,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Xeon E5-2680 v4 (14 Cores)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Xeon E5-2690 v3 (12 Cores)",
    "cores": 12,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Xeon E5-2650 v2 (8 Cores)",
    "cores": 8,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Xeon E3-1270 v3 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Xeon E3-1230 v2 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Pentium Gold G7400 (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Pentium Gold G6400 (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Pentium Gold G5400 (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Celeron G6900 (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Celeron G5905 (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Processor N100 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Processor N95 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-14900HX (24 Cores Mobile)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-13980HX (24 Cores Mobile)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i9-13900HX (24 Cores Mobile)",
    "cores": 24,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-14700HX (20 Cores Mobile)",
    "cores": 20,
    "tier": "flagship",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-13700HX (16 Cores Mobile)",
    "cores": 16,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-12700H (14 Cores Mobile)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-14500HX (14 Cores Mobile)",
    "cores": 14,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-13500H (12 Cores Mobile)",
    "cores": 12,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-12500H (12 Cores Mobile)",
    "cores": 12,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-11800H (8 Cores Mobile)",
    "cores": 8,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-11400H (6 Cores Mobile)",
    "cores": 6,
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-10750H (6 Cores Mobile)",
    "cores": 6,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-10300H (4 Cores Mobile)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-9750H (6 Cores Mobile)",
    "cores": 6,
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-9300H (4 Cores Mobile)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i7-1165G7 (4 Cores Mobile)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "Intel Core i5-1135G7 (4 Cores Mobile)",
    "cores": 4,
    "tier": "budget",
    "vendor": "intel"
  },
  {
    "name": "AMD Ryzen 9 9950X (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 9900X (12 Cores)",
    "cores": 12,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 9700X (8 Cores)",
    "cores": 8,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 9600X (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 8700G (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 8600G (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 8500G (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 7950X3D (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 7950X (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 7900X3D (12 Cores)",
    "cores": 12,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 7900X (12 Cores)",
    "cores": 12,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 7900 (12 Cores)",
    "cores": 12,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 7800X3D (8 Cores)",
    "cores": 8,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 7700X (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 7700 (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 7600X (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 7600 (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 7500F (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 5950X (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 5900X (12 Cores)",
    "cores": 12,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 5900 (12 Cores)",
    "cores": 12,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 5800X3D (8 Cores)",
    "cores": 8,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 5800X (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 5700X3D (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 5700X (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 5700 (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 5700G (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 5600X3D (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 5600X (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 5600 (6 Cores)",
    "cores": 6,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 5600G (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 5600GT (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 5500 (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 5500GT (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 4500 (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 4600G (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 3 4100 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 3950X (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 3900XT (12 Cores)",
    "cores": 12,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 3900X (12 Cores)",
    "cores": 12,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 3800XT (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 3800X (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 3700X (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 3600XT (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 3600X (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 3600 (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 3500X (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 3500 (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 3 3300X (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 3 3100 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 3400G (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 3 3200G (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 2700X (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 2700 (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 2600X (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 2600 (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 1600 AF (6 Cores)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 1600X (6 Cores)",
    "cores": 6,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 1600 (6 Cores)",
    "cores": 6,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 2400G (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 3 2200G (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 1800X (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 1700X (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 1700 (8 Cores)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 1500X (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 1400 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 3 1300X (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 3 1200 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen Threadripper 7980X (64 Cores)",
    "cores": 64,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen Threadripper 7970X (32 Cores)",
    "cores": 32,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen Threadripper 3990X (64 Cores)",
    "cores": 64,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen Threadripper 3970X (32 Cores)",
    "cores": 32,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen Threadripper 2950X (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen Threadripper 1950X (16 Cores)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD FX-9590 (8 Cores)",
    "cores": 8,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD FX-8370 (8 Cores)",
    "cores": 8,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD FX-8350 (8 Cores)",
    "cores": 8,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD FX-8320 (8 Cores)",
    "cores": 8,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD FX-6350 (6 Cores)",
    "cores": 6,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD FX-6300 (6 Cores)",
    "cores": 6,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD FX-4350 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD FX-4300 (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Athlon 3000G (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Athlon 240GE (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Athlon 200GE (2 Cores)",
    "cores": 2,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Athlon X4 860K (4 Cores)",
    "cores": 4,
    "tier": "budget",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 7945HX (16 Cores Mobile)",
    "cores": 16,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 7940HS (8 Cores Mobile)",
    "cores": 8,
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 7840HS (8 Cores Mobile)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 7735HS (8 Cores Mobile)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 7640HS (6 Cores Mobile)",
    "cores": 6,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 7535HS (6 Cores Mobile)",
    "cores": 6,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 6900HX (8 Cores Mobile)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 6800H (8 Cores Mobile)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 6600H (6 Cores Mobile)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 9 5900HX (8 Cores Mobile)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 5800H (8 Cores Mobile)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 5600H (6 Cores Mobile)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 7 4800H (8 Cores Mobile)",
    "cores": 8,
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Ryzen 5 4600H (6 Cores Mobile)",
    "cores": 6,
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "Qualcomm Snapdragon X Elite (12 Cores)",
    "cores": 12,
    "tier": "high",
    "vendor": "arm"
  },
  {
    "name": "Qualcomm Snapdragon X Plus (10 Cores)",
    "cores": 10,
    "tier": "mid",
    "vendor": "arm"
  }
];

  const GPU_DATABASE = [
  {
    "name": "NVIDIA GeForce RTX 5090 (32GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 5080 (16GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 5070 (12GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4090 (24GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4080 Super (16GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4080 (16GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4070 Ti Super (16GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4070 Ti (12GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4070 Super (12GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4070 (12GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4060 Ti (16GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4060 Ti (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4060 (8GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3090 Ti (24GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3090 (24GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3080 Ti (12GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3080 (12GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3080 (10GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3070 Ti (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3070 (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3060 Ti (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3060 (12GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3060 (8GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3050 (8GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3050 (6GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 2080 Ti (11GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 2080 Super (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 2080 (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 2070 Super (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 2070 (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 2060 Super (8GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 2060 (12GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 2060 (6GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1660 Ti (6GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1660 Super (6GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1660 (6GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1650 Super (4GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1650 (4GB GDDR6)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1650 (4GB GDDR5)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1630 (4GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1080 Ti (11GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1080 (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1070 Ti (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1070 (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1060 (6GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1060 (3GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1050 Ti (4GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1050 (3GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1050 (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 980 Ti (6GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 980 (4GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 970 (4GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 960 (4GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 960 (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 950 (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 780 Ti (3GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 780 (3GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 770 (4GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 770 (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 760 (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 750 Ti (4GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 750 Ti (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 750 (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 750 (1GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 680 (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 670 (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 660 Ti (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 660 (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 650 Ti (1-2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 650 (1GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GT 1030 (2GB GDDR5)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GT 1030 (2GB DDR4)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GT 740 (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GT 730 (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GT 710 (2GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GT 710 (1GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4090 Mobile (16GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4080 Mobile (12GB)",
    "tier": "flagship",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4070 Mobile (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4060 Mobile (8GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 4050 Mobile (6GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3080 Ti Mobile (16GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3080 Mobile (8GB/16GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3070 Ti Mobile (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3070 Mobile (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3060 Mobile (6GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3050 Ti Mobile (4GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 3050 Mobile (4GB/6GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 2080 Mobile (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 2070 Mobile (8GB)",
    "tier": "high",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce RTX 2060 Mobile (6GB)",
    "tier": "mid",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1660 Ti Mobile (6GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1650 Ti Mobile (4GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1650 Mobile (4GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1060 Mobile (6GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "NVIDIA GeForce GTX 1050 Mobile (4GB)",
    "tier": "entry",
    "vendor": "nvidia"
  },
  {
    "name": "AMD Radeon RX 7900 XTX (24GB)",
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 7900 XT (20GB)",
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 7900 GRE (16GB)",
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 7800 XT (16GB)",
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 7700 XT (12GB)",
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 7600 XT (16GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 7600 (8GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 6950 XT (16GB)",
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 6900 XT (16GB)",
    "tier": "flagship",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 6800 XT (16GB)",
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 6800 (16GB)",
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 6750 XT (12GB)",
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 6700 XT (12GB)",
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 6700 (10GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 6650 XT (8GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 6600 XT (8GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 6600 (8GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 6500 XT (4GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 6400 (4GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 5700 XT (8GB)",
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 5700 (8GB)",
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 5600 XT (6GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 5500 XT (8GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 5500 XT (4GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon VII (16GB)",
    "tier": "high",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX Vega 64 (8GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX Vega 56 (8GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 590 (8GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 580 (8GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 580 (4GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 580 2048SP (8GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 570 (8GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 570 (4GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 560 (4GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 560 (2GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 550 (4GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 550 (2GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 480 (8GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 480 (4GB)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 470 (8GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 470 (4GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 460 (4GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon RX 460 (2GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R9 Fury X (4GB HBM)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R9 Fury (4GB HBM)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R9 Nano (4GB HBM)",
    "tier": "mid",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R9 390X (8GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R9 390 (8GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R9 380X (4GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R9 380 (4GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R9 290X (4GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R9 290 (4GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R9 280X (3GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R9 270X (2GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R7 370 (4GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R7 360 (2GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R7 260X (2GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R7 250 (2GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon R7 240 (2GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon HD 7970 (3GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon HD 7950 (3GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon HD 7870 (2GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon HD 7850 (2GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "AMD Radeon HD 7770 (1GB)",
    "tier": "entry",
    "vendor": "amd"
  },
  {
    "name": "Intel Arc B580 (12GB Battlemage)",
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Arc B570 (10GB Battlemage)",
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Arc A770 (16GB)",
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Arc A770 (8GB)",
    "tier": "high",
    "vendor": "intel"
  },
  {
    "name": "Intel Arc A750 (8GB)",
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Arc A580 (8GB)",
    "tier": "mid",
    "vendor": "intel"
  },
  {
    "name": "Intel Arc A380 (6GB)",
    "tier": "entry",
    "vendor": "intel"
  },
  {
    "name": "Intel Arc A310 (4GB)",
    "tier": "entry",
    "vendor": "intel"
  },
  {
    "name": "Intel Arc Graphics 140V (Lunar Lake)",
    "tier": "mid",
    "vendor": "integrated"
  },
  {
    "name": "Intel Arc Graphics 130V (Lunar Lake)",
    "tier": "mid",
    "vendor": "integrated"
  },
  {
    "name": "Intel Arc Graphics 8-Xe (Meteor Lake)",
    "tier": "entry",
    "vendor": "integrated"
  },
  {
    "name": "Intel Arc Graphics 7-Xe (Meteor Lake)",
    "tier": "entry",
    "vendor": "integrated"
  },
  {
    "name": "Intel Iris Xe Graphics (96 EUs)",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel Iris Xe Graphics (80 EUs)",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel Iris Plus Graphics G7",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel Iris Plus Graphics G4",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel UHD Graphics 770",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel UHD Graphics 750",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel UHD Graphics 730",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel UHD Graphics 630",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel UHD Graphics 620",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel UHD Graphics 610",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel HD Graphics 630",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel HD Graphics 530",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel HD Graphics 520",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel HD Graphics 4600",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel HD Graphics 4400",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel HD Graphics 4000",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel HD Graphics 3000",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel HD Graphics 2500",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "Intel HD Graphics 2000",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "AMD Radeon 890M (Ryzen AI 300)",
    "tier": "mid",
    "vendor": "integrated"
  },
  {
    "name": "AMD Radeon 880M (Ryzen AI 300)",
    "tier": "mid",
    "vendor": "integrated"
  },
  {
    "name": "AMD Radeon 780M (Ryzen 7000/8000 APU)",
    "tier": "entry",
    "vendor": "integrated"
  },
  {
    "name": "AMD Radeon 760M (Ryzen APU)",
    "tier": "entry",
    "vendor": "integrated"
  },
  {
    "name": "AMD Radeon 740M (Ryzen APU)",
    "tier": "entry",
    "vendor": "integrated"
  },
  {
    "name": "AMD Radeon 680M (Ryzen 6000 APU)",
    "tier": "entry",
    "vendor": "integrated"
  },
  {
    "name": "AMD Radeon 660M (Ryzen 6000 APU)",
    "tier": "entry",
    "vendor": "integrated"
  },
  {
    "name": "AMD Radeon Vega 11 (Ryzen APU)",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "AMD Radeon Vega 8 (Ryzen APU)",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "AMD Radeon Vega 7 (Ryzen APU)",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "AMD Radeon Vega 6 (Ryzen APU)",
    "tier": "integrated",
    "vendor": "integrated"
  },
  {
    "name": "AMD Radeon Vega 3 (Athlon APU)",
    "tier": "integrated",
    "vendor": "integrated"
  }
];

  const MEMORY_OPTIONS = [
  {
    "val": "2gb",
    "label": "2 GB DDR2 / DDR3 (Legacy)"
  },
  {
    "val": "4gb_s",
    "label": "4 GB Single DDR3"
  },
  {
    "val": "4gb_d",
    "label": "4 GB Dual (2x2GB) DDR3"
  },
  {
    "val": "4gb",
    "label": "4 GB Single DDR4"
  },
  {
    "val": "6gb",
    "label": "6 GB Mixed (4GB + 2GB)"
  },
  {
    "val": "8gb_d3",
    "label": "8 GB Single DDR3-1600"
  },
  {
    "val": "8gb_d3_dual",
    "label": "8 GB Dual (2x4GB) DDR3"
  },
  {
    "val": "8gb_d4_2400",
    "label": "8 GB Single DDR4-2400"
  },
  {
    "val": "8gb_d4_3200",
    "label": "8 GB Single DDR4-3200"
  },
  {
    "val": "8gb",
    "label": "8 GB Dual (2x4GB) DDR4-2666"
  },
  {
    "val": "8gb_dual",
    "label": "8 GB Dual (2x4GB) DDR4-3200"
  },
  {
    "val": "8gb_d5",
    "label": "8 GB Single DDR5-4800"
  },
  {
    "val": "12gb",
    "label": "12 GB Mixed (8GB + 4GB)"
  },
  {
    "val": "16gb_single",
    "label": "16 GB Single DDR4-3200"
  },
  {
    "val": "16gb_d4_2666",
    "label": "16 GB Dual (2x8GB) DDR4-2666"
  },
  {
    "val": "16gb",
    "label": "16 GB Dual (2x8GB) DDR4-3200"
  },
  {
    "val": "16gb_d4_3600",
    "label": "16 GB Dual (2x8GB) DDR4-3600"
  },
  {
    "val": "16gb_d4_4000",
    "label": "16 GB Dual (2x8GB) DDR4-4000"
  },
  {
    "val": "16gb_d5_4800",
    "label": "16 GB Dual (2x8GB) DDR5-4800"
  },
  {
    "val": "16gb_d5_5600",
    "label": "16 GB Dual (2x8GB) DDR5-5600"
  },
  {
    "val": "16gb_d5_6000",
    "label": "16 GB Dual (2x8GB) DDR5-6000"
  },
  {
    "val": "24gb",
    "label": "24 GB Dual (2x12GB) DDR5-6000"
  },
  {
    "val": "32gb_single",
    "label": "32 GB Single DDR4 / DDR5"
  },
  {
    "val": "32gb_d4_3200",
    "label": "32 GB Dual (2x16GB) DDR4-3200"
  },
  {
    "val": "32gb_d4_3600",
    "label": "32 GB Dual (2x16GB) DDR4-3600"
  },
  {
    "val": "32gb_d4_4000",
    "label": "32 GB Dual (2x16GB) DDR4-4000"
  },
  {
    "val": "32gb_d5_5200",
    "label": "32 GB Dual (2x16GB) DDR5-5200"
  },
  {
    "val": "32gb",
    "label": "32 GB Dual (2x16GB) DDR5-6000"
  },
  {
    "val": "32gb_d5_6400",
    "label": "32 GB Dual (2x16GB) DDR5-6400"
  },
  {
    "val": "32gb_quad",
    "label": "32 GB Quad (4x8GB) DDR4/DDR5"
  },
  {
    "val": "48gb",
    "label": "48 GB Dual (2x24GB) DDR5-6000"
  },
  {
    "val": "64gb_d4_3200",
    "label": "64 GB Dual (2x32GB) DDR4-3200"
  },
  {
    "val": "64gb",
    "label": "64 GB Dual (2x32GB) DDR5-6000"
  },
  {
    "val": "64gb_quad",
    "label": "64 GB Quad (4x16GB) Workstation"
  },
  {
    "val": "96gb",
    "label": "96 GB Dual (2x48GB) DDR5-6000"
  },
  {
    "val": "128gb",
    "label": "128 GB Quad (4x32GB) Workstation"
  },
  {
    "val": "192gb",
    "label": "192 GB Quad (4x48GB) Workstation"
  },
  {
    "val": "256gb",
    "label": "256 GB+ Enterprise Server ECC"
  }
];

  const STORAGE_OPTIONS = [
  {
    "val": "nvme_gen4_pro",
    "label": "NVMe Gen 4 Pro (Samsung 990 / SN850X)",
    "tier": "gen4",
    "desc": "NVMe Gen 4 Pro (Instant Shaders)"
  },
  {
    "val": "nvme_gen5",
    "label": "NVMe Gen 5 Ultra (DirectStorage)",
    "tier": "gen5",
    "desc": "NVMe Gen 5 (Instant <0.5ms Shaders)"
  },
  {
    "val": "nvme_gen4",
    "label": "NVMe Gen 4 Fast (Crucial P3 / SN770)",
    "tier": "gen4",
    "desc": "NVMe Gen 4 (Instant Shaders)"
  },
  {
    "val": "nvme_gen4_dramless",
    "label": "NVMe Gen 4 DRAM-less HMB",
    "tier": "gen4",
    "desc": "NVMe Gen 4 HMB (Fast Pacing)"
  },
  {
    "val": "nvme_gen3_pro",
    "label": "NVMe Gen 3 (Samsung 970 / SN570)",
    "tier": "gen3",
    "desc": "NVMe Gen 3 (Fast Streaming)"
  },
  {
    "val": "nvme_gen3",
    "label": "NVMe Gen 3 Budget M.2 NVMe",
    "tier": "gen3",
    "desc": "NVMe Gen 3 (Fast Streaming)"
  },
  {
    "val": "sata_ssd_pro",
    "label": "2.5\" SATA SSD (870 EVO / MX500)",
    "tier": "sata_ssd",
    "desc": "SATA SSD DRAM (Optimized)"
  },
  {
    "val": "sata_ssd",
    "label": "2.5\" SATA SSD Budget (WD / Kingston)",
    "tier": "sata_ssd",
    "desc": "SATA SSD (Optimized)"
  },
  {
    "val": "m2_sata",
    "label": "M.2 SATA III Solid State SSD",
    "tier": "sata_ssd",
    "desc": "M.2 SATA (Optimized)"
  },
  {
    "val": "usb_nvme",
    "label": "External USB 3.2 NVMe SSD",
    "tier": "gen3",
    "desc": "USB 3.2 NVMe (Fast Streaming)"
  },
  {
    "val": "usb_sata_ssd",
    "label": "External USB Portable SSD",
    "tier": "sata_ssd",
    "desc": "External SSD (Optimized)"
  },
  {
    "val": "hdd_7200_pro",
    "label": "High-Speed 7200 RPM HDD (WD Black)",
    "tier": "hdd",
    "desc": "HDD 7200 RPM (I/O Buffered)"
  },
  {
    "val": "hdd_7200",
    "label": "Standard 7200 RPM HDD (WD Blue)",
    "tier": "hdd",
    "desc": "HDD 7200 RPM (Paged & Buffered)"
  },
  {
    "val": "hdd_5400",
    "label": "Laptop 5400 RPM HDD (High Delay)",
    "tier": "hdd",
    "desc": "HDD 5400 RPM (High Seek Delay)"
  },
  {
    "val": "hdd_usb",
    "label": "External USB HDD (Stutter Risk)",
    "tier": "hdd",
    "desc": "External HDD (High Seek Delay)"
  }
];

  // Populate datalists across the entire website for instant autocomplete
  document.querySelectorAll('#hw-cpu-list').forEach(dl => {
    dl.innerHTML = CPU_DATABASE.map(c => `<option value="${c.name}"></option>`).join('');
  });
  document.querySelectorAll('#hw-gpu-list').forEach(dl => {
    dl.innerHTML = GPU_DATABASE.map(g => `<option value="${g.name}"></option>`).join('');
  });
  document.querySelectorAll('#hw-ram-list').forEach(dl => {
    dl.innerHTML = MEMORY_OPTIONS.map(m => `<option value="${m.label}"></option>`).join('');
  });

  // Populate storage dropdowns with clean dark options (no ugly white optgroups)
  document.querySelectorAll('#hw-storage').forEach(sel => {
    if (sel.tagName === 'SELECT') {
      sel.innerHTML = STORAGE_OPTIONS.map(s => 
        `<option value="${s.val}"${s.val === 'nvme_gen4_pro' ? ' selected' : ''}>${s.label}</option>`
      ).join('');
    }
  });

  const hwCheckerCards = document.querySelectorAll('.hw-checker-card');

  hwCheckerCards.forEach(card => {
    const gameSelect = card.querySelector('#hw-game');
    const cpuInput = card.querySelector('#hw-cpu');
    const gpuInput = card.querySelector('#hw-gpu');
    const ramInput = card.querySelector('#hw-ram');
    const storageSelect = card.querySelector('#hw-storage');
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
    const detailStorage = card.querySelector('#hw-detail-storage');
    const detailDpi = card.querySelector('#hw-detail-dpi');
    const detailLatency = card.querySelector('#hw-detail-latency');

    function calculatePerformance() {
      const game = gameSelect ? gameSelect.value : 'gameloop';
      const cpuVal = (cpuInput ? cpuInput.value : '').trim();
      const gpuVal = (gpuInput ? gpuInput.value : '').trim();
      const ramVal = (ramInput ? ramInput.value : '').trim();
      const storageVal = storageSelect ? storageSelect.value : 'nvme_gen4_pro';
      const resVal = resSelect ? resSelect.value : '1080p';

      const cpuLower = cpuVal.toLowerCase();
      const gpuLower = gpuVal.toLowerCase();
      const ramLower = ramVal.toLowerCase();

      // 1. Analyze CPU from exhaustive database or token search
      let cpuMatch = CPU_DATABASE.find(c => cpuLower.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(cpuLower));
      
      if (!cpuMatch) {
        const cpuTokens = cpuLower.replace(/[^a-z0-9]/gi, ' ').split(/\s+/).filter(t => t.length > 1);
        if (cpuTokens.length > 0) {
          const matches = CPU_DATABASE.filter(c => {
            const cLower = c.name.toLowerCase();
            return cpuTokens.every(t => cLower.includes(t));
          });
          if (matches.length > 0) {
            matches.sort((a, b) => a.name.length - b.name.length);
            cpuMatch = matches[0];
          }
        }
      }

      let cores = cpuMatch ? cpuMatch.cores : 6;
      let cpuTier = cpuMatch ? cpuMatch.tier : 'mid';

      if (!cpuMatch) {
        if (cpuLower.includes('threadripper') || cpuLower.includes('9950') || cpuLower.includes('7950') || cpuLower.includes('5950') || cpuLower.includes('14900') || cpuLower.includes('13900') || cpuLower.includes('285k')) {
          cores = 16; cpuTier = 'flagship';
        } else if (cpuLower.includes('7900') || cpuLower.includes('5900') || cpuLower.includes('3900') || cpuLower.includes('14700') || cpuLower.includes('13700') || cpuLower.includes('12700') || cpuLower.includes('265k')) {
          cores = 12; cpuTier = 'flagship';
        } else if (cpuLower.includes('x3d') || cpuLower.includes('7800') || cpuLower.includes('5800') || cpuLower.includes('5700') || cpuLower.includes('9700') || cpuLower.includes('11700') || cpuLower.includes('10700') || cpuLower.includes('9900k') || cpuLower.includes('ryzen 7') || cpuLower.includes('i7')) {
          cores = 8; cpuTier = 'high';
        } else if (cpuLower.includes('9600') || cpuLower.includes('7600') || cpuLower.includes('5600') || cpuLower.includes('3600') || cpuLower.includes('14600') || cpuLower.includes('13600') || cpuLower.includes('12600') || cpuLower.includes('12400') || cpuLower.includes('10400') || cpuLower.includes('ryzen 5') || cpuLower.includes('i5')) {
          cores = 6; cpuTier = 'high';
        } else if (cpuLower.includes('i3') || cpuLower.includes('ryzen 3') || cpuLower.includes('pentium') || cpuLower.includes('athlon') || cpuLower.includes('celeron') || cpuLower.includes('10100') || cpuLower.includes('12100') || cpuLower.includes('4100') || cpuLower.includes('3100')) {
          cores = 4; cpuTier = 'budget';
        }
      }

      // 2. Analyze GPU from exhaustive database or token search
      let gpuMatch = GPU_DATABASE.find(g => gpuLower.includes(g.name.toLowerCase()) || g.name.toLowerCase().includes(gpuLower));
      
      if (!gpuMatch) {
        const gpuTokens = gpuLower.replace(/[^a-z0-9]/gi, ' ').split(/\s+/).filter(t => t.length > 1);
        if (gpuTokens.length > 0) {
          const matches = GPU_DATABASE.filter(g => {
            const gLower = g.name.toLowerCase();
            return gpuTokens.every(t => gLower.includes(t));
          });
          if (matches.length > 0) {
            matches.sort((a, b) => a.name.length - b.name.length);
            gpuMatch = matches[0];
          }
        }
      }

      let gpuTier = gpuMatch ? gpuMatch.tier : 'mid';
      let gpuVendor = gpuMatch ? gpuMatch.vendor : 'nvidia';

      if (!gpuMatch) {
        const isAmd = gpuLower.includes('amd') || gpuLower.includes('radeon') || gpuLower.includes('rx ') || gpuLower.includes('vega');
        const isIntel = gpuLower.includes('intel') || gpuLower.includes('arc') || gpuLower.includes('iris') || gpuLower.includes('uhd') || gpuLower.includes('hd graphics');
        gpuVendor = isAmd ? 'amd' : (isIntel ? 'intel' : 'nvidia');

        if (gpuLower.includes('5090') || gpuLower.includes('5080') || gpuLower.includes('4090') || gpuLower.includes('4080') || gpuLower.includes('7900') || gpuLower.includes('3090') || gpuLower.includes('3080') || gpuLower.includes('6950') || gpuLower.includes('6900')) {
          gpuTier = 'flagship';
        } else if (gpuLower.includes('4070') || gpuLower.includes('3070') || gpuLower.includes('7800') || gpuLower.includes('7700') || gpuLower.includes('6800') || gpuLower.includes('6700') || gpuLower.includes('b580') || gpuLower.includes('a770')) {
          gpuTier = 'high';
        } else if (gpuLower.includes('4060') || gpuLower.includes('3060') || gpuLower.includes('2060') || gpuLower.includes('1660') || gpuLower.includes('7600') || gpuLower.includes('6600') || gpuLower.includes('580') || gpuLower.includes('590') || gpuLower.includes('5700') || gpuLower.includes('5600') || gpuLower.includes('3050') || gpuLower.includes('a750') || gpuLower.includes('a580')) {
          gpuTier = 'mid';
        } else if (gpuLower.includes('1650') || gpuLower.includes('1050') || gpuLower.includes('750') || gpuLower.includes('560') || gpuLower.includes('550') || gpuLower.includes('460') || gpuLower.includes('1030') || gpuLower.includes('960') || gpuLower.includes('970') || gpuLower.includes('950') || gpuLower.includes('6400') || gpuLower.includes('6500')) {
          gpuTier = 'entry';
        } else if (gpuLower.includes('iris') || gpuLower.includes('uhd') || gpuLower.includes('vega') || gpuLower.includes('hd graphics') || gpuLower.includes('780m') || gpuLower.includes('890m')) {
          gpuTier = 'integrated';
          gpuVendor = 'integrated';
        }
      }

      // 3. Analyze RAM capacity with word boundary precision
      const is4gb = /\b(2|3|4)\s*gb\b/i.test(ramLower);
      const is6gb = /\b6\s*gb\b/i.test(ramLower);
      const is8gb = /\b8\s*gb\b/i.test(ramLower);

      // ==========================================
      // EXACT USER OPTIMIZATION RULES ENFORCEMENT
      // ==========================================

      // Rule 1: Processor Allocation (4 for 4-6 cores, 6 for 8 cores, 8 for 12+ cores)
      let cpuAlloc = '4 Cores (Quad/Hexa Core)';
      if (cores >= 12) {
        cpuAlloc = '8 Cores (12+ Core CPU)';
      } else if (cores >= 8) {
        cpuAlloc = '6 Cores (8-Core CPU)';
      }

      // Rule 2: Memory Allocation (6GB for 8GB users, 8GB for >8GB users, 3/4GB for <=6GB)
      let ramAlloc = '8192 MB (High Cache)';
      if (is4gb) {
        ramAlloc = '3072 MB (4GB System)';
      } else if (is6gb) {
        ramAlloc = '4096 MB (6GB System)';
      } else if (is8gb) {
        ramAlloc = '6144 MB (6GB)';
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

      // Rule 4: Storage Optimization across 15 distinct profiles
      let storagePacing = 'NVMe Gen 4 (Instant Shaders)';
      let isHdd = false;

      const sObj = STORAGE_OPTIONS.find(s => s.val === storageVal || s.label.toLowerCase().includes(storageVal.toLowerCase()));
      if (sObj) {
        storagePacing = sObj.desc || sObj.label;
        isHdd = sObj.tier === 'hdd';
      } else if (storageVal.includes('hdd')) {
        storagePacing = 'HDD (Paged & Buffered)';
        isHdd = true;
      } else if (storageVal.includes('gen5')) {
        storagePacing = 'NVMe Gen 5 (Instant <0.5ms Shaders)';
      } else if (storageVal.includes('gen4')) {
        storagePacing = 'NVMe Gen 4 (Instant Shaders)';
      } else if (storageVal.includes('gen3')) {
        storagePacing = 'NVMe Gen 3 (Fast Streaming)';
      } else if (storageVal.includes('sata')) {
        storagePacing = 'SATA SSD (Optimized)';
      }

      // Rule 5: DPI (160 low-end, 240 mid, 400/480 high-end)
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
      const dpiStr = `${resVal.toUpperCase()} • ${dpiVal}`;

      // Rule 6: CPU Smoothness Rule
      // High-End CPU + Low-End GPU shows 120 FPS on Smooth graphics
      let tier = 'Esports Tier';
      let fps = '120 FPS';
      let summary = 'Optimal Settings: Smooth + 120 FPS • Zero Stutter Guaranteed';
      let preset = 'Smooth + Ultra Extreme (120 FPS)';
      let latency = isHdd ? '~3.8ms (I/O Cache Active)' : '~2.8ms (-78% Fist Tool)';
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
        dpiVal = 'Native';
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
      if (detailStorage) detailStorage.innerText = storagePacing;
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

    // ⚡ Real Auto-Detect Hardware Engine from Browser APIs & Micro-Benchmarks
    if (autodetectBtn) {
      autodetectBtn.addEventListener('click', async () => {
        autodetectBtn.innerText = '⚡ Scanning Specs & Disk...';
        autodetectBtn.disabled = true;

        // 1. Detect Cores & Single-Core Speed via Micro-Benchmark
        const threads = navigator.hardwareConcurrency || 8;
        const t0 = performance.now();
        let benchSum = 0;
        for (let i = 0; i < 2000000; i++) benchSum += (i * 0.5) % 7;
        const cpuBenchMs = performance.now() - t0;

        // 2. Detect GPU accurately via WebGL UNMASKED_RENDERER_WEBGL with vendor protection
        let detectedGpu = null;
        let detectedVendor = null;
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
              const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
              const rLower = renderer.toLowerCase();

              if (rLower.includes('nvidia') || rLower.includes('geforce')) detectedVendor = 'nvidia';
              else if (rLower.includes('amd') || rLower.includes('radeon')) detectedVendor = 'amd';
              else if (rLower.includes('intel') || rLower.includes('arc') || rLower.includes('iris') || rLower.includes('uhd')) detectedVendor = 'intel';

              const cleaned = rLower
                .replace(/angle\s*\(/g, '')
                .replace(/direct3d11|d3d11|d3d12|vs_5_0|ps_5_0|vs_6_0|ps_6_0/g, '')
                .replace(/\(tm\)|\(r\)|directx|vulkan|opengl|es\s*[\d.]+/g, '')
                .trim();

              let bestMatch = null;
              let bestScore = -999;

              for (const gpu of GPU_DATABASE) {
                const gLower = gpu.name.toLowerCase();
                let score = 0;

                if (detectedVendor) {
                  if ((detectedVendor === 'intel' || detectedVendor === 'amd') && gpu.vendor === 'integrated') {
                    score += 20;
                  } else if (gpu.vendor === detectedVendor) {
                    score += 20;
                  } else {
                    score -= 100;
                  }
                }

                const modelNumMatch = gLower.match(/\b([a-z]?[0-9]{3,4}[a-z0-9]*)\b/i);
                if (modelNumMatch) {
                  const num = modelNumMatch[1].toLowerCase();
                  const numRegex = new RegExp(`\\b${num}\\b`, 'i');
                  if (numRegex.test(cleaned)) {
                    score += 65;
                  } else if (cleaned.includes(num)) {
                    score += 35;
                  }
                }

                if (gLower.includes('rtx') && cleaned.includes('rtx')) score += 15;
                if (gLower.includes('gtx') && cleaned.includes('gtx')) score += 15;
                if (gLower.includes('rx') && cleaned.includes('rx')) score += 15;
                if (gLower.includes('arc') && cleaned.includes('arc')) score += 35;
                if (gLower.includes('iris') && cleaned.includes('iris')) score += 50;
                if (gLower.includes('uhd') && cleaned.includes('uhd')) score += 40;
                if (gLower.includes('vega') && cleaned.includes('vega')) score += 40;
                if (gLower.includes('780m') && cleaned.includes('780m')) score += 60;
                if (gLower.includes('890m') && cleaned.includes('890m')) score += 60;

                const hasTi = /\bti\b/.test(gLower);
                const hasSuper = /\bsuper\b/.test(gLower);
                const hasXt = /\bxt\b/.test(gLower);
                const hasXtx = /\bxtx\b/.test(gLower);
                const hasMobile = /\bmobile|laptop\b/.test(gLower);

                const rHasTi = /\bti\b/.test(cleaned);
                const rHasSuper = /\bsuper\b/.test(cleaned);
                const rHasXt = /\bxt\b/.test(cleaned);
                const rHasXtx = /\bxtx\b/.test(cleaned);
                const rHasMobile = /\blaptop|mobile\b/.test(cleaned);

                if (hasTi && rHasTi) score += 30;
                if (hasTi && !rHasTi) score -= 35;
                if (!hasTi && rHasTi) score -= 35;

                if (hasSuper && rHasSuper) score += 30;
                if (hasSuper && !rHasSuper) score -= 35;
                if (!hasSuper && rHasSuper) score -= 35;

                if (hasXtx && rHasXtx) score += 35;
                if (hasXtx && !rHasXtx) score -= 40;
                if (!hasXtx && rHasXtx) score -= 40;

                if (hasXt && !hasXtx && rHasXt && !rHasXtx) score += 30;
                if (hasXt && !hasXtx && !rHasXt) score -= 35;
                if (!hasXt && rHasXt) score -= 35;

                if (hasMobile && rHasMobile) score += 30;
                if (hasMobile && !rHasMobile) score -= 15;

                if (score > bestScore) {
                  bestScore = score;
                  bestMatch = gpu;
                }
              }

              if (bestScore >= 40 && bestMatch) {
                detectedGpu = bestMatch.name;
              }
            }
          }
        } catch (e) {}

        if (!detectedGpu) {
          if (detectedVendor === 'amd') detectedGpu = 'AMD Radeon RX 6600 (8GB)';
          else if (detectedVendor === 'intel') detectedGpu = 'Intel Iris Xe Graphics (96 EUs)';
          else detectedGpu = 'NVIDIA GeForce RTX 3060 (12GB)';
        }
        if (gpuInput) gpuInput.value = detectedGpu;

        // 3. Intelligent CPU Detection (Thread Count + Micro-Benchmark + Platform)
        let detectedCpu = 'AMD Ryzen 5 5600 (6 Cores)';
        const isAmdPlatform = detectedVendor === 'amd';
        const isFastCore = cpuBenchMs < 6.5;

        if (threads >= 32) {
          detectedCpu = isAmdPlatform ? 'AMD Ryzen Threadripper 7970X (32 Cores)' : 'Intel Core Ultra 9 285K (24 Cores)';
        } else if (threads >= 24) {
          detectedCpu = isFastCore ? 'Intel Core i9-14900K (24 Cores)' : 'Intel Core i9-13900K (24 Cores)';
        } else if (threads >= 20) {
          detectedCpu = 'Intel Core i7-14700K (20 Cores)';
        } else if (threads >= 16) {
          if (isAmdPlatform || isFastCore) detectedCpu = 'AMD Ryzen 7 7800X3D (8 Cores)';
          else detectedCpu = 'Intel Core i7-13700K (16 Cores)';
        } else if (threads >= 12) {
          if (isAmdPlatform) detectedCpu = 'AMD Ryzen 5 5600 (6 Cores)';
          else if (isFastCore) detectedCpu = 'Intel Core i5-13400 (10 Cores)';
          else detectedCpu = 'Intel Core i5-12400 (6 Cores)';
        } else if (threads >= 8) {
          if (isFastCore) detectedCpu = 'Intel Core i3-12100 (4 Cores)';
          else detectedCpu = 'Intel Core i7-7700K (4 Cores)';
        } else {
          detectedCpu = 'Intel Pentium Gold G7400 (2 Cores)';
        }
        if (cpuInput) cpuInput.value = detectedCpu;

        // 4. Intelligent RAM Detection (deviceMemory + jsHeapSizeLimit + threads)
        let detectedRam = '16 GB Dual (2x8GB) DDR4-3200';
        const devMem = navigator.deviceMemory || 8;
        let heapLimit = 0;
        if (window.performance && performance.memory) {
          heapLimit = performance.memory.jsHeapSizeLimit || 0;
        }

        if (devMem >= 8) {
          if (threads >= 16 || heapLimit > 4100000000) {
            detectedRam = '32 GB Dual (2x16GB) DDR5-6000';
          } else {
            detectedRam = '16 GB Dual (2x8GB) DDR4-3200';
          }
        } else if (devMem === 4) {
          detectedRam = '8 GB Dual (2x4GB) DDR4-3200';
        } else {
          detectedRam = '4 GB Single DDR4';
        }
        if (ramInput) ramInput.value = detectedRam;

        // 5. Storage Auto-Detection via Real IndexedDB Disk Speed Benchmark
        let detectedStorage = 'nvme_gen4_pro';
        try {
          const bStart = performance.now();
          const testBuf = new Uint8Array(128 * 1024);
          const db = await new Promise((res, rej) => {
            const req = indexedDB.open('_fist_bench_db', 1);
            req.onupgradeneeded = () => req.result.createObjectStore('bench');
            req.onsuccess = () => res(req.result);
            req.onerror = () => rej();
          });
          const tx = db.transaction('bench', 'readwrite');
          tx.objectStore('bench').put(testBuf, 'k');
          await new Promise(r => tx.oncomplete = r);
          const diskElapsed = performance.now() - bStart;
          db.close();
          indexedDB.deleteDatabase('_fist_bench_db');

          if (diskElapsed < 7) {
            detectedStorage = 'nvme_gen4_pro';
          } else if (diskElapsed < 22) {
            detectedStorage = 'nvme_gen3_pro';
          } else if (diskElapsed < 55) {
            detectedStorage = 'sata_ssd_pro';
          } else {
            detectedStorage = 'hdd_7200';
          }
        } catch (e) {
          detectedStorage = 'nvme_gen4_pro';
        }
        if (storageSelect) storageSelect.value = detectedStorage;

        // 6. Display Resolution Detection
        const w = window.screen.width;
        if (resSelect) {
          if (w >= 3840) resSelect.value = '4k';
          else if (w >= 2560) resSelect.value = '1440p';
          else if (w >= 1920) resSelect.value = '1080p';
          else resSelect.value = '720p';
        }

        calculatePerformance();

        autodetectBtn.innerText = '⚡ Hardware Detected!';
        setTimeout(() => {
          autodetectBtn.innerText = '⚡ Auto-Detect';
          autodetectBtn.disabled = false;
        }, 2200);
      });
    }

    // Attach reactive listeners to all inputs
    [gameSelect, storageSelect, resSelect].forEach(sel => {
      if (sel) sel.addEventListener('change', calculatePerformance);
    });

    [cpuInput, gpuInput, ramInput].forEach(inp => {
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
