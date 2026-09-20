/* ============================================================
   Paper tone, applied before the first paint.
   Loaded synchronously from <head> on purpose: with `defer`, or
   from the end of <body>, it would run after the desk had already
   been painted and the wrong palette would flash on every load.
   ============================================================ */
(function () {
  var allowed = ['warm', 'kraft', 'slate'];
  var id = 'warm';
  try { id = localStorage.getItem('sketchbook.palette') || 'warm'; } catch (e) {}
  if (allowed.indexOf(id) < 0) id = 'warm';
  document.documentElement.setAttribute('data-palette', id);
})();
