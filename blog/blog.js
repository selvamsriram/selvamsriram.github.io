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
articleBody?.querySelectorAll('h2').forEach((heading, index) => {
  heading.id = `section-${String(index + 1).padStart(2, '0')}`;
});

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
