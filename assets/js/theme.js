/* Runs before CSS to avoid a flash of the wrong theme. No network requests. */
(() => {
  'use strict';
  const valid = ['system', 'light', 'dark'];
  let choice = 'system';
  try { const stored = localStorage.getItem('jc-theme'); if (valid.includes(stored)) choice = stored; } catch (_) {}
  document.documentElement.classList.add('js');
  document.documentElement.dataset.themeChoice = choice;
  document.documentElement.dataset.theme = choice === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : choice;
})();
