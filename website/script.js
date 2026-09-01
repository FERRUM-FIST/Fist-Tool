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

  // 7. HARDWARE FPS CHECKER
  const hwCheckBtn = document.getElementById('hw-check-btn');
  const hwCpu = document.getElementById('hw-cpu');
  const hwGpu = document.getElementById('hw-gpu');
  const hwResultBox = document.getElementById('hw-result-box');
  const hwResTier = document.getElementById('hw-res-tier');
  const hwResFps = document.getElementById('hw-res-fps');
  const hwResDesc = document.getElementById('hw-res-desc');

  if (hwCheckBtn) {
    hwCheckBtn.addEventListener('click', () => {
      const cpu = hwCpu.value;
      const gpu = hwGpu.value;
      
      let tier = 'Esports Tier';
      let fps = '120 FPS';
      let desc = 'Optimal Settings: Smooth + Ultra Extreme (120 FPS) • 6 Cores • 8GB RAM Alloc';
      let color = 'var(--color-cyan)';
      let shadowColor = 'rgba(0, 229, 255, 0.4)';
      let bgColor = 'rgba(0, 229, 255, 0.05)';
      let borderColor = 'rgba(0, 229, 255, 0.3)';

      // Logic Evaluation
      if (cpu === 'budget' || gpu === 'budget') {
        tier = 'Budget Tier';
        fps = '60 FPS';
        desc = 'Optimal Settings: Smooth + Extreme (60 FPS) • 4 Cores • 6GB RAM Alloc';
        color = 'var(--text-primary)';
        shadowColor = 'rgba(255, 255, 255, 0.2)';
        bgColor = 'rgba(255, 255, 255, 0.05)';
        borderColor = 'rgba(255, 255, 255, 0.2)';
        if (cpu === 'flagship' && gpu === 'budget') {
           fps = '60 FPS (GPU Bottleneck)';
        }
      } else if (cpu === 'flagship' && gpu === 'flagship') {
        tier = 'Flagship Tier';
        fps = '120 FPS';
        desc = 'Optimal Settings: Ultra HDR + Ultra Extreme (120 FPS) • 8 Cores • 8GB RAM Alloc';
        color = 'var(--color-green)';
        shadowColor = 'rgba(0, 255, 102, 0.4)';
        bgColor = 'rgba(0, 255, 102, 0.05)';
        borderColor = 'rgba(0, 255, 102, 0.3)';
      }

      // Display Results with Animation
      hwResTier.innerText = tier;
      hwResTier.style.color = color;
      hwResFps.innerText = fps;
      hwResFps.style.color = color;
      hwResFps.style.textShadow = `0 0 20px ${shadowColor}`;
      hwResDesc.innerText = desc;
      hwResultBox.style.background = bgColor;
      hwResultBox.style.borderColor = borderColor;

      hwResultBox.animate([
        { opacity: 0, transform: 'scale(0.95)' },
        { opacity: 1, transform: 'scale(1)' }
      ], { duration: 300, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    });
  }

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
