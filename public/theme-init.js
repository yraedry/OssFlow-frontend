try {
  var stored = localStorage.getItem('ossflow-theme');
  var t = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.classList.add(t);
} catch (e) {
  document.documentElement.classList.add('dark');
}
