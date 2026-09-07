// ── Mobile nav ──
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

document.querySelectorAll('.nav-link').forEach((link) => {
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
    if (hashMode !== 'tab') return;
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
  allowed: ['travel', 'music'],
  defaultTab: 'travel',
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
