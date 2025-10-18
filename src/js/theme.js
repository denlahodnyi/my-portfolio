const storageKey = 'theme';
let theme = localStorage.getItem(storageKey);

if (theme) document.documentElement.dataset.theme = theme;

const toggleButton = document.getElementById('theme-toggle');

toggleButton.parentElement.style.display = 'block';

function setTheme(newTheme) {
  const allowMotion = window.matchMedia(
    '(prefers-reduced-motion: no-preference)'
  ).matches;
  localStorage.setItem(storageKey, newTheme);

  if (document.startViewTransition && allowMotion) {
    document.startViewTransition(() => {
      document.documentElement.dataset.theme = newTheme;
    });
  } else {
    document.documentElement.dataset.theme = newTheme;
  }
}

toggleButton.addEventListener('click', () => {
  const isSystemDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;
  theme = localStorage.getItem(storageKey);

  if (!theme && isSystemDark) setTheme('🌞');
  else if (!theme) setTheme('🌙');
  else if (theme === '🌞') setTheme('🌙');
  else setTheme('🌞');
});
