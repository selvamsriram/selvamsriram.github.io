const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
const themeButtons = Array.from(document.querySelectorAll('[data-theme-toggle]'));

const currentTheme = () => document.documentElement.dataset.theme || (themeMedia.matches ? 'dark' : 'light');
const syncThemeButtons = () => {
  const activeTheme = currentTheme();
  const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
  themeButtons.forEach((button) => {
    button.dataset.currentTheme = activeTheme;
    button.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
    button.setAttribute('title', `Switch to ${nextTheme} mode`);
    button.setAttribute('aria-pressed', activeTheme === 'dark' ? 'true' : 'false');
  });
};

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    document.documentElement.dataset.theme = currentTheme() === 'dark' ? 'light' : 'dark';
    syncThemeButtons();
  });
});

themeMedia.addEventListener?.('change', () => {
  delete document.documentElement.dataset.theme;
  syncThemeButtons();
});
syncThemeButtons();

const reveal = (element, instant = false) => {
  element.dataset.revealed = 'true';
  if (instant) element.style.transition = 'none';
  element.style.opacity = '1';
  element.style.transform = 'none';
};

const revealElements = Array.from(document.querySelectorAll('[data-reveal]'));
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => reveal(element, true));
} else {
  revealElements.forEach((element) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(16px)';
    element.style.transition = element.style.transition || 'opacity 900ms cubic-bezier(.2,.7,.2,1), transform 900ms cubic-bezier(.2,.7,.2,1)';
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number.parseInt(entry.target.dataset.delay || '0', 10);
      window.setTimeout(() => reveal(entry.target), delay);
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
  revealElements.forEach((element) => revealObserver.observe(element));
  window.setTimeout(() => revealElements.filter((element) => !element.dataset.revealed).forEach((element) => reveal(element, true)), 3000);
}

const narrowNav = document.querySelector('[data-nav-narrow]');
const narrowScroller = document.querySelector('[data-nav-narrow-scroll]');
let narrowFrame = 0;
let narrowHideTimer = 0;

const updateNarrowIndicator = () => {
  narrowFrame = 0;
  if (!narrowNav || !narrowScroller) return;
  const maxScroll = Math.max(0, narrowScroller.scrollWidth - narrowScroller.clientWidth);
  const trackWidth = Math.max(0, narrowNav.clientWidth - 98);
  const visibleRatio = narrowScroller.scrollWidth ? Math.min(1, narrowScroller.clientWidth / narrowScroller.scrollWidth) : 1;
  const thumbWidth = maxScroll > 1 ? Math.max(42, trackWidth * visibleRatio) : trackWidth;
  const scrollRatio = maxScroll > 0 ? narrowScroller.scrollLeft / maxScroll : 0;
  const thumbTravel = Math.max(0, trackWidth - thumbWidth);
  narrowNav.style.setProperty('--nav-scroll-thumb-width', `${thumbWidth.toFixed(1)}px`);
  narrowNav.style.setProperty('--nav-scroll-thumb-x', `${(thumbTravel * scrollRatio).toFixed(1)}px`);
  narrowScroller.dataset.navScrollEdge = maxScroll <= 1 ? 'none' : narrowScroller.scrollLeft <= 2 ? 'start' : narrowScroller.scrollLeft >= maxScroll - 2 ? 'end' : 'middle';
};

const scheduleNarrowIndicator = () => {
  if (!narrowFrame) narrowFrame = window.requestAnimationFrame(updateNarrowIndicator);
};

const revealNarrowIndicator = () => {
  if (!narrowNav) return;
  narrowNav.dataset.navScrollActive = 'true';
  window.clearTimeout(narrowHideTimer);
  narrowHideTimer = window.setTimeout(() => { narrowNav.dataset.navScrollActive = 'false'; }, 900);
};

if (narrowNav && narrowScroller) {
  narrowScroller.addEventListener('scroll', scheduleNarrowIndicator, { passive: true });
  ['pointerdown', 'pointermove', 'wheel', 'keydown', 'click'].forEach((eventName) => narrowScroller.addEventListener(eventName, revealNarrowIndicator, { passive: true }));
  window.addEventListener('resize', scheduleNarrowIndicator);
  const activeLink = narrowScroller.querySelector('.is-active');
  if (activeLink) {
    const contextParent = activeLink.classList.contains('narrow-article-link')
      && activeLink.previousElementSibling?.classList.contains('narrow-context-link')
      ? activeLink.previousElementSibling
      : null;
    narrowScroller.scrollLeft = contextParent
      ? Math.max(0, contextParent.offsetLeft - 10)
      : Math.max(0, activeLink.offsetLeft - ((narrowScroller.clientWidth - activeLink.offsetWidth) / 2));
  }
  updateNarrowIndicator();
}

const progress = document.querySelector('[data-reading-progress]');
if (progress) {
  const updateProgress = () => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = available > 0 ? Math.min(100, Math.max(0, (window.scrollY / available) * 100)) : 0;
    progress.style.width = `${percentage}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

const articleBody = document.querySelector('.article-body');
const tableOfContents = document.querySelector('[data-article-toc]');
const narrowTableOfContents = document.querySelector('[data-article-toc-narrow]');
if (articleBody && (tableOfContents || narrowTableOfContents)) {
  const headings = Array.from(articleBody.querySelectorAll('h2'));
  const tocTargets = [tableOfContents, narrowTableOfContents].filter(Boolean);
  const createTocLink = (heading, index) => {
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.title = heading.textContent;
    const number = document.createElement('span');
    number.className = 'toc-number';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(index + 1).padStart(2, '0');
    const label = document.createElement('span');
    label.className = 'toc-label';
    label.textContent = heading.textContent;
    link.append(number, label);
    return link;
  };

  headings.forEach((heading, index) => {
    heading.id = `section-${String(index + 1).padStart(2, '0')}`;
    tocTargets.forEach((target) => target.append(createTocLink(heading, index)));
  });

  if (headings.length && 'IntersectionObserver' in window) {
    const tocLinks = tocTargets.flatMap((target) => Array.from(target.querySelectorAll('a')));
    const railScroller = tableOfContents?.closest('.rail-links');
    const markActive = (id) => {
      tocLinks.forEach((link) => {
        const isActive = link.hash === `#${id}`;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      const activeRailLink = tableOfContents?.querySelector('.is-active');
      if (!railScroller || !activeRailLink || !activeRailLink.offsetParent) return;
      const scrollerBounds = railScroller.getBoundingClientRect();
      const linkBounds = activeRailLink.getBoundingClientRect();
      if (linkBounds.top < scrollerBounds.top + 8) {
        railScroller.scrollBy({ top: linkBounds.top - scrollerBounds.top - 12, behavior: reduceMotion ? 'auto' : 'smooth' });
      } else if (linkBounds.bottom > scrollerBounds.bottom - 8) {
        railScroller.scrollBy({ top: linkBounds.bottom - scrollerBounds.bottom + 12, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    };
    markActive(headings[0].id);
    const headingObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) markActive(visible[0].target.id);
    }, { rootMargin: '-12% 0px -72% 0px', threshold: 0 });
    headings.forEach((heading) => headingObserver.observe(heading));
  }
}

const desktopRailScroller = document.querySelector('.rail-links');
let desktopRailFrame = 0;
const updateDesktopRailEdge = () => {
  desktopRailFrame = 0;
  if (!desktopRailScroller) return;
  const maxScroll = Math.max(0, desktopRailScroller.scrollHeight - desktopRailScroller.clientHeight);
  desktopRailScroller.dataset.railScrollEdge = maxScroll <= 1
    ? 'none'
    : desktopRailScroller.scrollTop <= 2
      ? 'start'
      : desktopRailScroller.scrollTop >= maxScroll - 2
        ? 'end'
        : 'middle';
};
const scheduleDesktopRailEdge = () => {
  if (!desktopRailFrame) desktopRailFrame = window.requestAnimationFrame(updateDesktopRailEdge);
};
if (desktopRailScroller) {
  desktopRailScroller.addEventListener('scroll', scheduleDesktopRailEdge, { passive: true });
  window.addEventListener('resize', scheduleDesktopRailEdge);
  updateDesktopRailEdge();
}

const essayMenuToggle = document.querySelector('[data-essay-menu-toggle]');
const essayMenu = document.querySelector('[data-essay-menu]');
const essayMenuClose = document.querySelector('[data-essay-menu-close]');
const setEssayMenuOpen = (open) => {
  if (!essayMenuToggle || !essayMenu) return;
  essayMenu.hidden = !open;
  essayMenuToggle.setAttribute('aria-expanded', String(open));
  const indicator = essayMenuToggle.lastElementChild;
  if (indicator) indicator.textContent = open ? '−' : '+';
};

if (essayMenuToggle && essayMenu) {
  essayMenuToggle.addEventListener('click', () => setEssayMenuOpen(essayMenu.hidden));
  essayMenuClose?.addEventListener('click', () => {
    setEssayMenuOpen(false);
    essayMenuToggle.focus();
  });
  essayMenu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setEssayMenuOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || essayMenu.hidden) return;
    setEssayMenuOpen(false);
    essayMenuToggle.focus();
  });
  document.addEventListener('click', (event) => {
    if (!essayMenu.hidden && !narrowNav?.contains(event.target)) setEssayMenuOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1059 && !essayMenu.hidden) setEssayMenuOpen(false);
  });
}

const glow = document.querySelector('[data-hero-glow]');
const glowSection = glow?.parentElement;
if (glow && glowSection && !reduceMotion) {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let glowFrame = 0;
  const animateGlow = () => {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;
    glow.style.transform = `translate(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px)`;
    if (Math.abs(targetX - currentX) > 0.3 || Math.abs(targetY - currentY) > 0.3) glowFrame = window.requestAnimationFrame(animateGlow);
    else glowFrame = 0;
  };
  glowSection.addEventListener('mousemove', (event) => {
    const rect = glowSection.getBoundingClientRect();
    targetX = (event.clientX - rect.left) - 260;
    targetY = (event.clientY - rect.top) - 300;
    if (!glowFrame) glowFrame = window.requestAnimationFrame(animateGlow);
  });
}
