/* ================================================
   NARGIZ GRIGORYAN PORTFOLIO — JS
   ================================================ */

const PRESENTATIONS = [
  {
    id: "roadport",
    title: "Roadport — Investment Memo",
    catLabel: "Print & Data Design",
    folder: "presentations/roadport",
    pages: 8,
    ratios: [1.7787, 1.7787, 1.7787, 1.7787, 1.7787, 1.7787, 1.7787, 1.7787]
  },
  {
    id: "narekatsin",
    title: "Narekatsin — Jewelry Catalog",
    catLabel: "Catalog Design",
    folder: "presentations/narekatsin",
    pages: 6,
    ratios: [1.7804, 1.7804, 1.4308, 1.4308, 1.4308, 1.7544]
  },
  {
    id: "makhmur",
    title: "Մախմուր — Fashion Brand",
    catLabel: "Brand Identity",
    folder: "presentations/makhmur",
    pages: 2,
    ratios: [1.7804, 1.7804]
  },
  {
    id: "machalet",
    title: "Ma'chalet — Interior Moodboard",
    catLabel: "Interior Design",
    folder: "presentations/machalet",
    pages: 4,
    ratios: [1.414, 1.414, 1.414, 1.414]
  },
  {
    id: "mosquitoman",
    title: "Mosquitoman — Sales Team Training",
    catLabel: "Slide Deck Design",
    folder: "presentations/mosquitoman",
    pages: 4,
    ratios: [1.7787, 1.7787, 1.7787, 1.7787]
  }
];

let deckIdx   = 0;
let spreadIdx = 0;

function pad2(n) { return String(n).padStart(2, '0'); }

/* ---- pair up a deck's pages into book spreads: [1,2], [3,4], ... ---- */
function getSpreads(d) {
  const spreads = [];
  for (let i = 1; i <= d.pages; i += 2) {
    spreads.push(i + 1 <= d.pages ? [i, i + 1] : [i, null]);
  }
  return spreads;
}

/* ---- deck tabs ---- */
function renderDeckTabs() {
  const tabs = document.getElementById('deckTabs');
  tabs.innerHTML = '';
  PRESENTATIONS.forEach((d, i) => {
    const btn = document.createElement('button');
    btn.className = 'deck-tab' + (i === deckIdx ? ' active' : '');
    btn.innerHTML = `<img src="${d.folder}/01.jpg" alt="${d.title}" loading="lazy"><span>${d.title}</span>`;
    btn.addEventListener('click', () => { deckIdx = i; spreadIdx = 0; updateDeck(); });
    tabs.appendChild(btn);
  });
}

/* ---- update viewer to current deck/spread ---- */
function updateDeck() {
  const d = PRESENTATIONS[deckIdx];
  const spreads = getSpreads(d);
  const [a, b] = spreads[spreadIdx];

  const stage = document.getElementById('deckStage');
  const left  = document.getElementById('deckPageLeft');
  const right = document.getElementById('deckPageRight');
  const spine = document.getElementById('deckSpine');

  left.src = `${d.folder}/${pad2(a)}.jpg`;
  const ra = d.ratios[a - 1];

  if (b) {
    const rb = d.ratios[b - 1];
    right.src = `${d.folder}/${pad2(b)}.jpg`;
    right.classList.remove('hidden');
    left.classList.remove('solo');
    spine.classList.remove('hidden');
    stage.classList.remove('solo-page');
    left.style.flex  = `${ra} 1 0`;
    right.style.flex = `${rb} 1 0`;
    stage.style.aspectRatio = `${ra + rb} / 1`;
  } else {
    right.classList.add('hidden');
    left.classList.add('solo');
    spine.classList.add('hidden');
    stage.classList.add('solo-page');
    left.style.flex = `1 1 0`;
    stage.style.aspectRatio = `${ra} / 1`;
  }

  document.getElementById('deckTitle').textContent = d.title;
  document.getElementById('deckCat').textContent   = d.catLabel;
  document.getElementById('deckCount').textContent = b ? `${a}–${b} / ${d.pages}` : `${a} / ${d.pages}`;
  document.getElementById('deckProgressBar').style.width = `${((b || a) / d.pages) * 100}%`;

  document.querySelectorAll('.deck-tab').forEach((t, i) => t.classList.toggle('active', i === deckIdx));

  const atStart = deckIdx === 0 && spreadIdx === 0;
  const atEnd   = deckIdx === PRESENTATIONS.length - 1 && spreadIdx === spreads.length - 1;
  document.getElementById('deckPrev').disabled = atStart;
  document.getElementById('deckNext').disabled = atEnd;
}

/* ---- book-style page-turn animation, then swap content ---- */
function flipPage(dir, applyChange) {
  const el = document.getElementById(dir > 0 ? 'deckPageRight' : 'deckPageLeft');

  if (el.classList.contains('hidden')) { applyChange(); updateDeck(); return; }

  const outAngle = dir > 0 ? -92 : 92;
  const inAngle  = dir > 0 ?  92 : -92;

  el.style.transition = 'transform 0.26s cubic-bezier(.4,0,.2,1)';
  el.style.transform  = `rotateY(${outAngle}deg)`;
  el.style.boxShadow  = dir > 0 ? '-24px 0 40px rgba(0,0,0,0.45)' : '24px 0 40px rgba(0,0,0,0.45)';

  setTimeout(() => {
    applyChange();
    updateDeck();
    el.style.transition = 'none';
    el.style.transform  = `rotateY(${inAngle}deg)`;
    el.offsetHeight; /* force reflow */
    el.style.transition = 'transform 0.26s cubic-bezier(.4,0,.2,1)';
    el.style.transform  = 'rotateY(0deg)';
    el.style.boxShadow  = 'none';
  }, 260);
}

/* ---- flip to next/prev spread, crossing deck boundaries ---- */
function gotoSpread(dir) {
  const d = PRESENTATIONS[deckIdx];
  const spreads = getSpreads(d);
  let nextDeck   = deckIdx;
  let nextSpread = spreadIdx + dir;

  if (nextSpread < 0) {
    if (deckIdx === 0) return;
    nextDeck = deckIdx - 1;
    nextSpread = getSpreads(PRESENTATIONS[nextDeck]).length - 1;
  } else if (nextSpread >= spreads.length) {
    if (deckIdx === PRESENTATIONS.length - 1) return;
    nextDeck = deckIdx + 1;
    nextSpread = 0;
  }

  flipPage(dir, () => { deckIdx = nextDeck; spreadIdx = nextSpread; });
}

/* ---- deck viewer ---- */
function initDeckViewer() {
  renderDeckTabs();
  updateDeck();

  document.getElementById('deckPrev').addEventListener('click', () => gotoSpread(-1));
  document.getElementById('deckNext').addEventListener('click', () => gotoSpread(1));

  document.addEventListener('keydown', e => {
    const work = document.getElementById('work');
    const r = work.getBoundingClientRect();
    const inView = r.top < window.innerHeight * 0.7 && r.bottom > window.innerHeight * 0.3;
    if (!inView) return;
    if (e.key === 'ArrowLeft')  gotoSpread(-1);
    if (e.key === 'ArrowRight') gotoSpread(1);
  });

  const stage = document.getElementById('deckStage');
  let touchX = null;
  stage.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) gotoSpread(dx < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });
}

/* ---- nav scroll ---- */
function initNav() {
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---- mobile nav ---- */
function initMobileNav() {
  const toggle  = document.querySelector('.nav-toggle');
  const drawer  = document.querySelector('.nav-drawer');
  const overlay = document.querySelector('.nav-overlay');

  function setOpen(open) {
    drawer.classList.toggle('open', open);
    overlay.classList.toggle('show', open);
    toggle.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));
  overlay.addEventListener('click', () => setOpen(false));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
}

/* ---- scroll reveal ---- */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  document.querySelectorAll(
    '.timeline-item, .cert-card, .stat-card, .about-left, .about-right, .skills-block'
  ).forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 3 === 1) el.classList.add('reveal-d1');
    if (i % 3 === 2) el.classList.add('reveal-d2');
    observer.observe(el);
  });
}

/* ---- smooth scroll ---- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = document.getElementById('nav').offsetHeight;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });
}

/* ---- active nav highlight ---- */
function initActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ---- init ---- */

/* ---- Scroll progress bar ---- */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}

/* ---- Custom cursor ---- */
function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.body.classList.add('custom-cursor');

  const dot  = document.createElement('div'); dot.className  = 'c-dot';
  const ring = document.createElement('div'); ring.className = 'c-ring';
  document.body.append(dot, ring);

  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function tick() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  })();

  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [role="button"], .deck-tab, .deck-page')) {
      ring.classList.add('expand');
    } else {
      ring.classList.remove('expand');
    }
  });
}

/* ---- Hero animated blobs ---- */
function initHeroBlobs() {
  const hero  = document.querySelector('.hero');
  const inner = hero.querySelector('.hero-inner');
  const wrap  = document.createElement('div');
  wrap.className = 'hero-blobs';
  for (let i = 0; i < 3; i++) {
    const b = document.createElement('div');
    b.className = 'hero-blob';
    wrap.appendChild(b);
  }
  hero.insertBefore(wrap, inner);
}

/* ---- Print Design gallery ---- */
const PRINT_CATEGORIES = [
  {
    id: "flyer",
    label: "Flyer",
    images: ["print/flyer/01.jpg", "print/flyer/02.jpg", "print/flyer/03.jpg"]
  },
  {
    id: "magazine",
    label: "Magazine",
    images: ["print/magazine/02.jpg", "print/magazine/01.jpg", "print/magazine/03.jpg"]
  },
  {
    id: "menu",
    label: "Menu",
    images: ["print/menu/03.jpg", "print/menu/01.jpg", "print/menu/02.jpg"]
  },
  {
    id: "brochure",
    label: "Brochure",
    images: ["print/brochure/01.jpg", "print/brochure/02.jpg", "print/brochure/03.jpg"]
  }
];

let printCatIdx = 0;
let printLbIdx  = 0;

function initPrint() {
  const catTabs = document.getElementById('printCatTabs');
  const grid    = document.getElementById('printGrid');
  const lb      = document.getElementById('printLightbox');
  const lbImg   = document.getElementById('printLbImg');
  const lbClose = document.getElementById('printLbClose');
  const lbPrev  = document.getElementById('printLbPrev');
  const lbNext  = document.getElementById('printLbNext');
  if (!catTabs) return;

  function openLb(idx) {
    const cat = PRINT_CATEGORIES[printCatIdx];
    printLbIdx = idx;
    lbImg.classList.remove('lb-loaded');
    lbImg.src = cat.images[idx];
    lbImg.onload = () => lbImg.classList.add('lb-loaded');
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbPrev.disabled = idx === 0;
    lbNext.disabled = idx === cat.images.length - 1;
  }

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navLb(dir) {
    const cat = PRINT_CATEGORIES[printCatIdx];
    const n = printLbIdx + dir;
    if (n >= 0 && n < cat.images.length) openLb(n);
  }

  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', () => navLb(-1));
  lbNext.addEventListener('click', () => navLb(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') navLb(-1);
    if (e.key === 'ArrowRight') navLb(1);
  });

  function loadCategory(idx) {
    printCatIdx = idx;
    const cat = PRINT_CATEGORIES[idx];
    catTabs.querySelectorAll('.print-cat-tab').forEach((t, i) =>
      t.classList.toggle('active', i === idx));

    grid.innerHTML = '';
    grid.style.setProperty('--print-cols', cat.images.length);
    cat.images.forEach((src, i) => {
      const card = document.createElement('div');
      card.className = 'print-card';
      const img = document.createElement('img');
      img.src = src;
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.alt = `${cat.label} ${i + 1}`;
      card.appendChild(img);
      card.addEventListener('click', () => openLb(i));
      grid.appendChild(card);
    });
  }

  PRINT_CATEGORIES.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'print-cat-tab' + (i === 0 ? ' active' : '');
    btn.textContent = cat.label;
    btn.addEventListener('click', () => loadCategory(i));
    catTabs.appendChild(btn);
  });

  loadCategory(0);
}

/* ---- SMM Design gallery ---- */
function initSMM() {
  const grid = document.getElementById('smmGrid');
  if (!grid) return;
  for (let i = 1; i <= 6; i++) {
    const card = document.createElement('div');
    card.className = 'smm-card';
    card.innerHTML = `<img src="smm/${String(i).padStart(2,'0')}.jpg" alt="SMM Design ${i}" loading="lazy">`;
    grid.appendChild(card);
  }
}

const BRAND_IMAGES = [
  { src: "brand/01.jpg", label: "Elvara" },
  { src: "brand/02.jpg", label: "Elvoris" },
  { src: "brand/03.jpg", label: "Artuyt Design" },
  { src: "brand/04.jpg", label: "Aqentra" },
  { src: "brand/05.jpg", label: "Cubixo Games" },
  { src: "brand/06.jpg", label: "Agrivant" },
  { src: "brand/07.jpg", label: "Shawarma Vibes" },
  { src: "brand/08.jpg", label: "Floveya Dance" },
];

let brandLbIdx = 0;

function initBrand() {
  const grid   = document.getElementById('brandGrid');
  const lb     = document.getElementById('brandLightbox');
  const lbImg  = document.getElementById('brandLbImg');
  const lbClose = document.getElementById('brandLbClose');
  const lbPrev  = document.getElementById('brandLbPrev');
  const lbNext  = document.getElementById('brandLbNext');
  if (!grid) return;

  function openLb(idx) {
    brandLbIdx = idx;
    lbImg.classList.remove('lb-loaded');
    lbImg.src = BRAND_IMAGES[idx].src;
    lbImg.alt = BRAND_IMAGES[idx].label;
    lbImg.onload = () => lbImg.classList.add('lb-loaded');
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbPrev.disabled = idx === 0;
    lbNext.disabled = idx === BRAND_IMAGES.length - 1;
  }

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navLb(dir) {
    const n = brandLbIdx + dir;
    if (n >= 0 && n < BRAND_IMAGES.length) openLb(n);
  }

  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', () => navLb(-1));
  lbNext.addEventListener('click', () => navLb(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') navLb(-1);
    if (e.key === 'ArrowRight') navLb(1);
  });

  BRAND_IMAGES.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'brand-card';
    const img = document.createElement('img');
    img.src = item.src;
    img.loading = i < 2 ? 'eager' : 'lazy';
    img.alt = item.label;
    card.appendChild(img);
    card.addEventListener('click', () => openLb(i));

    const label = document.createElement('span');
    label.className = 'brand-label';
    label.textContent = item.label;

    const wrapper = document.createElement('div');
    wrapper.className = 'brand-item';
    wrapper.appendChild(card);
    wrapper.appendChild(label);
    grid.appendChild(wrapper);
  });
}

const PKG_IMAGES = [
  { src: "packaging/01.jpg", label: "Bonno Snacks" },
  { src: "packaging/02.jpg", label: "Good Product" },
  { src: "packaging/03.jpg", label: "Shawarma Vibes" },
  { src: "packaging/04.jpg", label: "Khacheni Vodka" },
  { src: "packaging/05.jpg", label: "Batonic" },
];

let pkgLbIdx = 0;

function initPackaging() {
  const grid    = document.getElementById('pkgGrid');
  const lb      = document.getElementById('pkgLightbox');
  const lbImg   = document.getElementById('pkgLbImg');
  const lbClose = document.getElementById('pkgLbClose');
  const lbPrev  = document.getElementById('pkgLbPrev');
  const lbNext  = document.getElementById('pkgLbNext');
  if (!grid) return;

  function openLb(idx) {
    pkgLbIdx = idx;
    lbImg.classList.remove('lb-loaded');
    lbImg.src = PKG_IMAGES[idx].src;
    lbImg.alt = PKG_IMAGES[idx].label;
    lbImg.onload = () => lbImg.classList.add('lb-loaded');
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbPrev.disabled = idx === 0;
    lbNext.disabled = idx === PKG_IMAGES.length - 1;
  }

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navLb(dir) {
    const n = pkgLbIdx + dir;
    if (n >= 0 && n < PKG_IMAGES.length) openLb(n);
  }

  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', () => navLb(-1));
  lbNext.addEventListener('click', () => navLb(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') navLb(-1);
    if (e.key === 'ArrowRight') navLb(1);
  });

  PKG_IMAGES.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'pkg-card';
    const img = document.createElement('img');
    img.src = item.src;
    img.loading = i < 3 ? 'eager' : 'lazy';
    img.alt = item.label;
    card.appendChild(img);
    card.addEventListener('click', () => openLb(i));

    const label = document.createElement('span');
    label.className = 'pkg-label';
    label.textContent = item.label;

    const wrapper = document.createElement('div');
    wrapper.className = 'pkg-item';
    wrapper.appendChild(card);
    wrapper.appendChild(label);
    grid.appendChild(wrapper);
  });
}

/* ── AI DUAL CAROUSELS ────────────────────────────── */
function initAI() {
  function initPdfCar(id) {
    const car = document.getElementById(id);
    if (!car) return;
    const slides  = car.querySelectorAll('.ai-pdf-slide');
    const counter = car.querySelector('.ai-pdf-counter');
    let cur = 0;

    function goTo(idx) {
      slides[cur].classList.remove('active');
      cur = (idx + slides.length) % slides.length;
      slides[cur].classList.add('active');
      if (counter) counter.textContent = `${cur + 1} / ${slides.length}`;
    }

    car.querySelectorAll('.ai-car-btn').forEach(btn => {
      const dir = parseInt(btn.dataset.dir, 10);
      if (!isNaN(dir)) btn.addEventListener('click', () => goTo(cur + dir));
    });
  }

  initPdfCar('aiCarLeft');
  initPdfCar('aiCarRight');
}

/* ---- Auto-play videos only when visible ---- */
function initVideos() {
  const videos = document.querySelectorAll('.ai-video-item video');
  if (!videos.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.play();
      else e.target.pause();
    });
  }, { threshold: 0.25 });
  videos.forEach(v => observer.observe(v));
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initCursor();
  initHeroBlobs();
  initDeckViewer();
  initSMM();
  initPrint();
  initBrand();
  initPackaging();
  initAI();
  initVideos();
  initNav();
  initMobileNav();
  initReveal();
  initSmoothScroll();
  initActiveLinks();
});
