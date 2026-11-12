// FENIXA_THUMB(src): ruta de la miniatura WebP de una foto si existe en el manifiesto; si no, el original.
(function () {
  window.FENIXA_THUMB = function (src) {
    const m = window.FENIXA_THUMBS;
    return src && m && m[src] === 1 && src.indexOf('assets/') === 0 ? 'assets/thumbs/' + src.slice(7) + '.webp' : src;
  };
})();
