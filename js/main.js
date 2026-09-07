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
