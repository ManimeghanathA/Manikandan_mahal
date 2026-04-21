/* ═══════════════════════════════════════════════════════
   MANIKANDAN MAHAL — SCRIPTS.JS
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── HEADER: transparent at top, solid on scroll ── */
  const header = document.getElementById('main-header');
  function updateHeader() {
    // Keep header transparent (no black/blur state) even while scrolling.
    header.classList.add('transparent');
    header.classList.remove('scrolled');
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ── PARALLAX MOTION (no photos, pure UI/UX) ── */
  const parallaxSection = document.getElementById('parallax');
  const parallaxBg = parallaxSection ? parallaxSection.querySelector('.parallax-bg') : null;
  const parallaxCards = parallaxSection ? parallaxSection.querySelectorAll('.p-card') : [];
  let ticking = false;

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  function updateParallax() {
    ticking = false;
    if (!parallaxSection || !parallaxBg) return;

    const rect = parallaxSection.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    // progress 0..1 while section passes through viewport
    const progress = clamp01((vh - rect.top) / (vh + rect.height));

    // background moves slower than scroll
    const bgPx = (progress - 0.5) * -70; // subtle
    parallaxBg.style.setProperty('--px', `${bgPx}px`);

    // cards drift slightly for depth
    parallaxCards.forEach((card, i) => {
      const dir = (i % 2 === 0) ? 1 : -1;
      const cardPx = (progress - 0.5) * (12 + i * 4) * dir;
      card.style.setProperty('--pc', `${cardPx}px`);
    });
  }

  function requestParallaxUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateParallax);
  }

  updateParallax();
  window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
  window.addEventListener('resize', requestParallaxUpdate);

  /* ── HAMBURGER ── */
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav  = document.getElementById('mobileNav');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });

  /* ── MAIN SLIDESHOW ── */
  const slides        = document.querySelectorAll('#slideList .slide-item');
  const dotsContainer = document.getElementById('slideDots');
  let   currentSlide  = 0;
  let   slideTimer;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'slide-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Slide ${i + 1}`);
    d.addEventListener('click', () => goSlide(i));
    dotsContainer.appendChild(d);
  });

  function goSlide(n) {
    slides[currentSlide].classList.remove('active');
    dotsContainer.children[currentSlide].classList.remove('active');
    currentSlide = ((n % slides.length) + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dotsContainer.children[currentSlide].classList.add('active');
    clearInterval(slideTimer);
    slideTimer = setInterval(() => goSlide(currentSlide + 1), 4800);
  }

  document.getElementById('slideNext').addEventListener('click', () => goSlide(currentSlide + 1));
  document.getElementById('slidePrev').addEventListener('click', () => goSlide(currentSlide - 1));
  slideTimer = setInterval(() => goSlide(currentSlide + 1), 4800);

  /* ── FULLSCREEN SLIDESHOW ── */
  const fsOverlay     = document.getElementById('fullscreenOverlay');
  const fsContainer   = document.getElementById('fsSlideContainer');
  const fsThumbStrip  = document.getElementById('fsThumbStrip');
  let fsSlides        = [];
  let fsCurrent       = 0;
  let fsTimer;

  document.getElementById('fullscreenBtn').addEventListener('click', () => {
    const imgs = document.querySelectorAll('#slideList .slide-item img');
    fsContainer.innerHTML = '';
    fsThumbStrip.innerHTML = '';
    fsSlides = [];

    imgs.forEach((img, i) => {
      // Full slide
      const div = document.createElement('div');
      div.className = 'fs-slide' + (i === 0 ? ' active' : '');
      const image = document.createElement('img');
      image.src = img.src;
      image.alt = img.alt || '';
      div.appendChild(image);
      fsContainer.appendChild(div);
      fsSlides.push(div);

      // Thumbnail
      const thumb = document.createElement('div');
      thumb.className = 'fs-thumb' + (i === 0 ? ' active' : '');
      const tImg = document.createElement('img');
      tImg.src = img.src;
      tImg.alt = '';
      thumb.appendChild(tImg);
      thumb.addEventListener('click', () => goFS(i));
      fsThumbStrip.appendChild(thumb);
    });

    fsCurrent = currentSlide;
    updateFS();
    fsOverlay.classList.add('active');
    fsTimer = setInterval(() => goFS(fsCurrent + 1), 4000);
  });

  function updateFS() {
    fsSlides.forEach((s, i) => s.classList.toggle('active', i === fsCurrent));
    fsThumbStrip.querySelectorAll('.fs-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === fsCurrent);
    });
  }

  function goFS(n) {
    fsCurrent = ((n % fsSlides.length) + fsSlides.length) % fsSlides.length;
    updateFS();
  }

  document.getElementById('fsClose').addEventListener('click', () => {
    fsOverlay.classList.remove('active');
    clearInterval(fsTimer);
  });
  document.getElementById('fsNext').addEventListener('click', () => {
    clearInterval(fsTimer);
    goFS(fsCurrent + 1);
    fsTimer = setInterval(() => goFS(fsCurrent + 1), 4000);
  });
  document.getElementById('fsPrev').addEventListener('click', () => {
    clearInterval(fsTimer);
    goFS(fsCurrent - 1);
    fsTimer = setInterval(() => goFS(fsCurrent + 1), 4000);
  });
  // Close on backdrop click
  fsOverlay.addEventListener('click', e => {
    if (e.target === fsOverlay) {
      fsOverlay.classList.remove('active');
      clearInterval(fsTimer);
    }
  });
  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (!fsOverlay.classList.contains('active')) return;
    if (e.key === 'ArrowRight') { clearInterval(fsTimer); goFS(fsCurrent + 1); fsTimer = setInterval(() => goFS(fsCurrent + 1), 4000); }
    if (e.key === 'ArrowLeft')  { clearInterval(fsTimer); goFS(fsCurrent - 1); fsTimer = setInterval(() => goFS(fsCurrent + 1), 4000); }
    if (e.key === 'Escape') { fsOverlay.classList.remove('active'); clearInterval(fsTimer); }
  });

  /* ── HONEYCOMB — true horizontal honeycomb layout ── */
  const honeycombEl = document.getElementById('honeycomb');
  const hexItems    = Array.from(document.querySelectorAll('.hex-item'));

  honeycombEl.innerHTML = '';
  let idx = 0;
  let colNum = 0;

  while (idx < hexItems.length) {
    // 2 items per column for an infinite horizontal strip
    const count = 2;
    const col   = document.createElement('div');
    col.className = 'hc-col';
    for (let j = 0; j < count && idx < hexItems.length; j++, idx++) {
      col.appendChild(hexItems[idx]);
    }
    honeycombEl.appendChild(col);
    colNum++;
  }

  /* ── LIGHTBOX ── */
  const lightbox     = document.getElementById('lightbox');
  const lightboxImg  = document.getElementById('lightboxImg');
  document.querySelectorAll('.hex-item').forEach(item => {
    item.addEventListener('click', () => {
      lightboxImg.src = item.dataset.src;
      lightbox.classList.add('open');
    });
  });
  document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') lightbox.classList.remove('open');
  });

  /* ── SCROLL REVEAL ── */
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.10 });
  reveals.forEach(el => revealObserver.observe(el));

  // Stagger children
  document.querySelectorAll('.events-grid, .events-row2, .facilities-grid, .facilities-row2, .testimonials, .norms-grid, .contact-cards').forEach(grid => {
    grid.querySelectorAll(':scope > *').forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.06}s`;
    });
  });

});
