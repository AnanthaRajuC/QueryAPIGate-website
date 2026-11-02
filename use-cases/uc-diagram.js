/* Use-case diagrams: a fixed canvas, scaled down to fit its column, and the animation loop the pulses use.
   Shared by every use case; a page adds its own markup and its own route table, and nothing here knows either.

   Markup: <div class="ucd-wrap" data-w="1440" data-h="640"><div class="ucd-canvas">...</div></div>
   Everything in the canvas is position:absolute, in canvas pixels. The canvas is scaled by min(1, wrap width / data-w),
   never up, and the wrap's height follows: the same arithmetic as Home's diagramTransform and wrapHeight. */
(function () {
  var reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function fit(wrap) {
    var canvas = wrap.querySelector('.ucd-canvas'); if (!canvas) return;
    var w = +wrap.getAttribute('data-w') || 1440, h = +wrap.getAttribute('data-h') || 640;
    var s = Math.min(1, wrap.clientWidth / w);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    canvas.style.transform = 'scale(' + s + ')';
    wrap.style.height = Math.round(h * s) + 'px';
  }
  function fitAll() {
    var wraps = document.querySelectorAll('.ucd-wrap');
    for (var i = 0; i < wraps.length; i++) {
      fit(wraps[i]);
      if (window.ResizeObserver && !wraps[i]._ucdRO) { (wraps[i]._ucdRO = new ResizeObserver(fit.bind(null, wraps[i]))).observe(wraps[i]); }
    }
  }

  // The length of a cubic Bezier, in 40 steps: what a pulse's timing is worked out from, as on Home.
  function bez(p0, p1, p2, p3) {
    var L = 0, px = p0[0], py = p0[1];
    for (var j = 1; j <= 40; j++) {
      var t = j / 40, u = 1 - t;
      var x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
      var y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
      L += Math.hypot(x - px, y - py); px = x; py = y;
    }
    return L;
  }

  // Each frame, for every pulse ({begin, dur} in seconds, as its <animate> elements have them), calls
  // onFrame(pulse, f, passed): f is where the pulse is in its cycle, 0 to 1, and passed(m) is true on the one frame
  // the pulse crosses m, including across the cycle's wrap. Lifted from the Home diagram's loop.
  function loop(svg, pulses, onFrame) {
    var raf = 0, stopped = false;
    function frame() {
      if (stopped) return;
      raf = requestAnimationFrame(frame);
      if (!svg.isConnected) return;
      var t = svg.getCurrentTime();
      for (var i = 0; i < pulses.length; i++) {
        var p = pulses[i];
        var f = (((t - p.begin) / p.dur) % 1 + 1) % 1;
        var last = p.last == null ? f : p.last; p.last = f;
        onFrame(p, f, function (m) { return (last < m && f >= m) || (last > f && (m > last || m <= f)); });
      }
    }
    frame();
    return function () { stopped = true; cancelAnimationFrame(raf); };
  }

  // Lights an element for a moment: adds .lit, and takes it off ms later unless it was lit again meanwhile.
  function flash(el, ms) {
    if (!el) return;
    var n = (el._ucdN = (el._ucdN || 0) + 1);
    el.classList.add('lit');
    setTimeout(function () { if (el._ucdN === n) el.classList.remove('lit'); }, ms || 900);
  }

  window.UCD = { reduced: reduced, fit: fitAll, bez: bez, loop: loop, flash: flash };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fitAll); else fitAll();
  window.addEventListener('load', fitAll);
})();
