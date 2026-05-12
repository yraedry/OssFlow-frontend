try {
  var stored = localStorage.getItem('ossflow-theme');
  var t = stored || 'dark';
  document.documentElement.classList.add(t);
} catch (e) {
  document.documentElement.classList.add('dark');
}
