const cursor = document.querySelector('.cursor');
const progress = document.querySelector('.progress span');
const track = document.querySelector('.horizontal-track');
const menuButton = document.querySelector('.menu-button');

window.addEventListener('pointermove', (event) => {
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
});

document.querySelectorAll('a, button, [data-cursor]').forEach((element) => {
  element.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
  element.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
});

window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${(window.scrollY / scrollable) * 100}%`;

  const explore = document.querySelector('.explore');
  const bounds = explore.getBoundingClientRect();
  if (bounds.top < window.innerHeight && bounds.bottom > 0) {
    const travel = Math.min(360, Math.max(0, (window.innerHeight - bounds.top) * 0.22));
    track.style.setProperty('--track-shift', `${-travel}px`);
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  document.body.classList.toggle('menu-open', !isOpen);
});

document.querySelectorAll('.menu-panel a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
  });
});

document.querySelectorAll('.thing-row').forEach((row) => {
  row.addEventListener('mouseenter', () => {
    const colors = { yellow: '#e9ff4f', blue: '#4c8dff', pink: '#ff6d9e', green: '#71e0a4' };
    row.style.setProperty('--row-color', colors[row.dataset.color]);
  });
});