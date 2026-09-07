// ── Mobile nav ──
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ── Header scroll shadow ──
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Active nav link on scroll ──
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

function setActiveNav() {
  const scrollPos = window.scrollY + 100;
  let current = 'home';

  sections.forEach((section) => {
    if (scrollPos >= section.offsetTop) {
      current = section.id;
    }
  });

  const pathSection = document.querySelector('.path-section');
  if (pathSection) {
    const top = pathSection.offsetTop;
    const next = pathSection.nextElementSibling;
    const bottom = next ? next.offsetTop : top + pathSection.offsetHeight;
    if (scrollPos >= top && scrollPos < bottom) {
      current = document.querySelector('.path-tab.is-active')?.dataset.tab || 'education';
    }
  }

  navLinkEls.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

window.addEventListener('scroll', setActiveNav, { passive: true });
setActiveNav();

// ── Back to top ──
document.querySelector('.back-to-top')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Reveal on scroll ──
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
revealEls.forEach((el) => revealObserver.observe(el));

// ── Experience: show two roles, scroll inside the list for the rest ──
function initExperienceScroll() {
  const scroller = document.getElementById('experience-scroll');
  if (!scroller) return () => {};

  const items = scroller.querySelectorAll('.timeline-item');
  if (items.length <= 2) return () => {};

  function setHeight() {
    const second = items[1];
    const height = second.offsetTop + second.offsetHeight;
    if (height > 0) scroller.style.maxHeight = `${height}px`;
    updateFade();
  }

  function updateFade() {
    const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4;
    scroller.classList.toggle('at-end', atEnd);
  }

  setHeight();
  scroller.addEventListener('scroll', updateFade, { passive: true });
  window.addEventListener('resize', setHeight);
  if (window.ResizeObserver) {
    new ResizeObserver(setHeight).observe(scroller.querySelector('.timeline'));
  }

  return setHeight;
}

const refreshExperienceScroll = initExperienceScroll();

function initSnapCarousel({ carousel, nav, dotsEl, prevBtn, nextBtn, hint, nextLabels }) {
  if (!carousel || !nav || !dotsEl || !prevBtn || !nextBtn) return () => {};

  function pageWidth() {
    return carousel.clientWidth;
  }

  function pageCount() {
    if (!pageWidth()) return 1;
    return Math.max(1, Math.round(carousel.scrollWidth / pageWidth()));
  }

  function activePage() {
    if (!pageWidth()) return 0;
    return Math.min(pageCount() - 1, Math.round(carousel.scrollLeft / pageWidth()));
  }

  function renderDots() {
    const n = pageCount();
    nav.classList.toggle('is-single', pageWidth() > 0 && n <= 1);
    dotsEl.innerHTML = Array.from({ length: n }, (_, i) => (
      `<button type="button" class="projects-scroll-dot${i === 0 ? ' active' : ''}" data-page="${i}" aria-label="Page ${i + 1}"></button>`
    )).join('');
  }

  function updateNav() {
    const page = activePage();
    const atStart = page === 0;
    const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10;
    dotsEl.querySelectorAll('.projects-scroll-dot').forEach((dot) => {
      dot.classList.toggle('active', parseInt(dot.dataset.page, 10) === page);
    });
    prevBtn.classList.toggle('hidden', atStart);
    nextBtn.classList.toggle('hidden', atEnd || pageCount() <= 1);
    if (nextLabels?.length) {
      nextBtn.textContent = nextLabels[page] || 'more →';
    }
  }

  function goTo(index) {
    const target = Math.max(0, Math.min(pageCount() - 1, index));
    carousel.scrollTo({ left: target * pageWidth(), behavior: 'smooth' });
  }

  function refresh() {
    renderDots();
    updateNav();
  }

  refresh();

  carousel.addEventListener('scroll', () => {
    updateNav();
    hint?.classList.add('dismissed');
  }, { passive: true });

  prevBtn.addEventListener('click', () => goTo(activePage() - 1));
  nextBtn.addEventListener('click', () => goTo(activePage() + 1));

  dotsEl.addEventListener('click', (e) => {
    const dot = e.target.closest('.projects-scroll-dot');
    if (!dot) return;
    goTo(parseInt(dot.dataset.page, 10));
  });

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refresh, 120);
  };
  window.addEventListener('resize', onResize);
  if (window.ResizeObserver) {
    new ResizeObserver(onResize).observe(carousel);
  }

  return refresh;
}

const refreshMusicCarousel = initSnapCarousel({
  carousel: document.getElementById('music-carousel'),
  nav: document.getElementById('music-carousel-nav'),
  dotsEl: document.getElementById('music-scroll-dots'),
  prevBtn: document.getElementById('music-nav-prev'),
  nextBtn: document.getElementById('music-nav-next'),
  hint: document.getElementById('music-swipe-hint'),
  nextLabels: ['fav artist →', 'fav song →', 'more artists →'],
});

// ── Education / Experience / Skills tabs ──
function initSectionTabs(root, { allowed, defaultTab, hashMode }) {
  if (!root) return;

  const tabs = root.querySelectorAll('.path-tab');
  const panels = root.querySelectorAll('.path-panel');
  if (!tabs.length) return;

  const allowedSet = new Set(allowed);

  function showTab(name, { updateHash = true } = {}) {
    const tabName = allowedSet.has(name) ? name : defaultTab;

    tabs.forEach((tab) => {
      const selected = tab.dataset.tab === tabName;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
    });

    panels.forEach((panel) => {
      const selected = panel.dataset.panel === tabName;
      panel.classList.toggle('is-hidden', !selected);
      panel.hidden = !selected;
    });

    if (tabName === 'experience') {
      requestAnimationFrame(() => {
        refreshExperienceScroll();
        requestAnimationFrame(refreshExperienceScroll);
      });
    }

    if (tabName === 'music') {
      requestAnimationFrame(() => {
        refreshMusicCarousel();
        requestAnimationFrame(refreshMusicCarousel);
      });
    }

    if (updateHash && hashMode === 'tab') {
      const nextHash = `#${tabName}`;
      if (location.hash !== nextHash) {
        history.replaceState(null, '', nextHash);
      }
    }

    setActiveNav();
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
  });

  function tabFromHash() {
    const hash = location.hash.replace('#', '');
    if (allowedSet.has(hash)) {
      showTab(hash, { updateHash: false });
    }
  }

  window.addEventListener('hashchange', tabFromHash);
  tabFromHash();
}

initSectionTabs(document.querySelector('.path-section'), {
  allowed: ['education', 'experience', 'skills'],
  defaultTab: 'education',
  hashMode: 'tab',
});

initSectionTabs(document.getElementById('random'), {
  allowed: ['dance', 'music', 'travel', 'content'],
  defaultTab: 'dance',
  hashMode: 'section',
});

initSnapCarousel({
  carousel: document.getElementById('projects-carousel'),
  nav: document.getElementById('projects-carousel-nav'),
  dotsEl: document.getElementById('projects-scroll-dots'),
  prevBtn: document.getElementById('projects-nav-prev'),
  nextBtn: document.getElementById('projects-nav-next'),
  hint: document.getElementById('projects-swipe-hint'),
});

// ── Load blog posts ──
async function loadBlog() {  const grid = document.getElementById('blog-grid');

  try {
    const response = await fetch('data/blog.json');
    if (!response.ok) throw new Error('Failed to load blog data');

    const { posts } = await response.json();

    if (!posts || posts.length === 0) {
      grid.innerHTML = '<p class="blog-loading">No posts found.</p>';
      return;
    }

    grid.innerHTML = posts.map((post) => `
      <article class="blog-card reveal">
        ${post.image ? `<img class="blog-card-image" src="${post.image}" alt="" loading="lazy" />` : ''}
        <div class="blog-card-body">
          <time class="blog-card-date">${formatDate(post.date)}</time>
          <h3 class="blog-card-title">${escapeHtml(post.title)}</h3>
          <p class="blog-card-excerpt">${escapeHtml(post.excerpt)}</p>
          ${post.tags?.length ? `
            <div class="blog-tags">
              ${post.tags.slice(0, 3).map((t) => `<span class="blog-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
          ` : ''}
          <a class="blog-card-link" href="${post.link}" target="_blank" rel="noopener noreferrer">Read on Medium →</a>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  } catch {
    grid.innerHTML = `
      <p class="blog-loading">
        Couldn't load posts right now.
        <a href="https://medium.com/@pragya_sen1" target="_blank" rel="noopener noreferrer">Visit Medium →</a>
      </p>`;
  }
}

async function loadDance() {
  const grid = document.getElementById('dance-grid');
  const profileUrl = 'https://www.instagram.com/pragya.sen1';

  try {
    const response = await fetch('data/dance.json');
    if (!response.ok) throw new Error('Failed to load dance data');

    const { posts } = await response.json();

    if (!posts || posts.length === 0) {
      grid.innerHTML = `
        <p class="dance-loading">
          No dance posts found yet.
          <a href="${profileUrl}" target="_blank" rel="noopener noreferrer">Visit Instagram →</a>
        </p>`;
      return;
    }

    grid.innerHTML = posts.map((post) => `
      <a class="dance-card reveal" href="${post.link}" target="_blank" rel="noopener noreferrer" aria-label="Watch dance reel on Instagram">
        <img class="dance-card-image" src="${post.image}" alt="" loading="lazy" />
        <span class="dance-card-badge">Reel</span>
        <span class="dance-card-hover">View on Instagram</span>
      </a>
    `).join('');

    grid.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  } catch {
    grid.innerHTML = `
      <p class="dance-loading">
        Couldn't load posts right now.
        <a href="${profileUrl}" target="_blank" rel="noopener noreferrer">Visit Instagram →</a>
      </p>`;
  }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

loadBlog();
loadDance();
initDigitalSky();

function initDigitalSky() {
  const atlas = document.getElementById('sky-atlas');
  const stats = document.getElementById('sky-stats');
  if (!atlas || !stats) return;

  const SESSION_KEY = 'sky-visit-counted';
  const CACHE_KEY = 'sky-visit-count';
  const NAMESPACE = 'pragyasen-github-io';
  const COUNTER = 'personal-website-sky';
  const HOSTS = ['https://abacus.jsn.cam', 'https://abacus.jasoncameron.dev'];
  const MAX_RENDER = 240;
  const CELESTIAL = ['moon', 'saturn', 'comet', 'planet', 'rocket'];

  const ICONS = {
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 1.4l2.05 6.9H21l-5.6 4.2 2.1 7-5.5-4.05L6.5 19.5l2.1-7L3 8.3h6.95z"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.2 3.1a8.6 8.6 0 1 0 6.7 14.3A9 9 0 0 1 14.2 3.1z"/></svg>',
    saturn: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="5.2" fill="currentColor"/></svg>',
    comet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4l7.2 3.1L8.9 11.2 4 4zm8.6 4.4 2.1 2.1-1.2 3.2-2.1-2.1 1.2-3.2zM14.8 12.2a4.2 4.2 0 1 1-5.9 5.9 4.2 4.2 0 0 1 5.9-5.9z"/></svg>',
    planet: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="currentColor" opacity=".9"/><path fill="none" stroke="#050e1c" stroke-width="1.4" d="M7.2 10.2c2.2 1.4 7.4 1.6 9.6.2"/></svg>',
    rocket: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.8 3.2c2.8 1.1 5 3.8 5.9 7.1-2.2-.2-4.6-1.2-6.4-3-1.8-1.8-2.8-4.2-3-6.4 1.1.3 2.4.8 3.5 2.3zM8.4 10.1l5.5 5.5-2.4 1.2-4.3-4.3 1.2-2.4zm-2.7 6.6 2.6.7.7 2.6-2.2 1.1-2.2-2.2 1.1-2.2z"/></svg>',
  };

  function mark(kind) {
    const span = document.createElement('span');
    span.className = `sky-mark sky-mark--${kind}`;
    span.innerHTML = ICONS[kind] || ICONS.star;
    return span;
  }

  function render(visits) {
    const bodies = Math.floor(visits / 5);
    stats.textContent = `${visits} visits · ${visits} stars born · ${bodies} celestial friends joined`;

    const show = Math.min(visits, MAX_RENDER);
    const frag = document.createDocumentFragment();
    atlas.replaceChildren();

    for (let i = 1; i <= show; i += 1) {
      frag.appendChild(mark('star'));
      if (i % 5 === 0) {
        frag.appendChild(mark(CELESTIAL[(i / 5 - 1) % CELESTIAL.length]));
      }
    }

    atlas.appendChild(frag);
  }

  async function readCount(increment) {
    const path = increment ? 'hit' : 'get';
    let lastError = new Error('counter unavailable');

    for (const host of HOSTS) {
      try {
        const response = await fetch(`${host}/${path}/${NAMESPACE}/${COUNTER}`);
        if (response.ok) {
          const data = await response.json();
          return Number(data.value) || 0;
        }
        if (!increment && response.status === 404) return 0;
        lastError = new Error(`counter ${response.status}`);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }

  (async () => {
    const alreadyCounted = sessionStorage.getItem(SESSION_KEY) === '1';
    const cached = Number(localStorage.getItem(CACHE_KEY) || 0);

    if (cached > 0) render(cached);

    try {
      const visits = await readCount(!alreadyCounted);
      if (!alreadyCounted) sessionStorage.setItem(SESSION_KEY, '1');
      localStorage.setItem(CACHE_KEY, String(visits));
      render(visits);
    } catch {
      if (!cached) {
        stats.textContent = "couldn't count visits right now — the sky will fill in soon";
      }
    }
  })();
}
