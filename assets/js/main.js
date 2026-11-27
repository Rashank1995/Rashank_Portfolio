/* ============================================================
   Rashank R — Portfolio interactions
   Vanilla JS. No dependencies. Everything degrades gracefully:
   with JavaScript off, every piece of content is still visible.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = function () { return mqReduce.matches; };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* One shared scroll/resize tick. Deliberately timer-driven rather than
     rAF-only: rAF is throttled in background/embedded renderers, and some
     of these callbacks decide whether content is visible at all. */
  var onTick = [];

  /* ---------- 1. Header state + floating back-to-top ---------- */
  (function header() {
    var hdr = $('.hdr'), top = $('.totop');
    onTick.push(function () {
      var y = window.scrollY;
      if (hdr) hdr.classList.toggle('is-stuck', y > 8);
      // shown once past the first screen, hidden again at the very end where
      // the footer carries its own "Back to top" link
      var nearEnd = y + innerHeight > document.documentElement.scrollHeight - 160;
      if (top) top.classList.toggle('is-shown', y > innerHeight * 0.8 && !nearEnd);
    });
  })();

  /* ---------- 2. Menu overlay ---------------------------------- */
  (function menu() {
    var m = $('#menu'), open = $('.hdr__menu'), close = $('.menu__close');
    if (!m || !open) return;
    var outside = $$('body > header, body > main, body > footer, body > .totop, body > .skip');
    $$('.menu__nav li', m).forEach(function (li, i) { li.style.setProperty('--d', (0.08 + i * 0.05) + 's'); });

    var set = function (isOpen) {
      m.classList.toggle('is-open', isOpen);
      m.setAttribute('aria-hidden', String(!isOpen));
      open.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('is-locked', isOpen);
      outside.forEach(function (el) { el.inert = isOpen; });
      if (isOpen) { (close || m).focus({ preventScroll: true }); }
      else { open.focus({ preventScroll: true }); }
    };
    open.addEventListener('click', function () { set(true); });
    if (close) close.addEventListener('click', function () { set(false); });
    m.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && m.classList.contains('is-open')) set(false);
    });
  })();

  /* ---------- 3. Reveal on scroll ------------------------------
     Geometry-based rather than IntersectionObserver: IO is silently
     throttled in some embedded renderers, and content hidden until
     revealed must never depend on that. */
  (function reveal() {
    var items = $$('[data-reveal], .lines, .media--reveal');
    if (!items.length) return;
    if (reduce()) { items.forEach(function (el) { el.classList.add('is-in'); }); return; }

    $$('[data-stagger]').forEach(function (p) {
      var step = parseFloat(p.getAttribute('data-stagger')) || 0.08;
      Array.prototype.forEach.call(p.children, function (child, i) {
        if (!child.style.getPropertyValue('--d')) child.style.setProperty('--d', (i * step) + 's');
      });
    });
    $$('.lines').forEach(function (b) {
      var base = parseFloat(b.getAttribute('data-delay')) || 0;
      $$('.ln > span', b).forEach(function (s, i) { s.style.setProperty('--d', (base + i * 0.09) + 's'); });
    });

    var pending = items.slice();
    onTick.push(function () {
      if (!pending.length) return;
      var trigger = innerHeight * 0.9, still = [];
      for (var i = 0; i < pending.length; i++) {
        var r = pending[i].getBoundingClientRect();
        if (r.top < trigger && r.bottom > 0) pending[i].classList.add('is-in');
        else still.push(pending[i]);
      }
      pending = still;
    });
  })();

  /* ---------- 4. Counters --------------------------------------
     The final figure stays in the markup (and in a visually hidden copy
     for screen readers); only the visible copy counts up, once. */
  (function counters() {
    var els = $$('[data-count]');
    if (!els.length || reduce()) return;
    var list = [];
    els.forEach(function (el) {
      var txt = el.textContent.trim();
      var m = txt.match(/^([^\d]*)([\d.]+)(.*)$/);
      if (!m) return;
      var sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = txt;
      var vis = document.createElement('span');
      vis.setAttribute('aria-hidden', 'true');
      el.textContent = '';
      el.appendChild(sr);
      el.appendChild(vis);
      var dec = (m[2].split('.')[1] || '').length;
      var item = { el: el, vis: vis, pre: m[1], to: parseFloat(m[2]), post: m[3], dec: dec, done: false };
      vis.textContent = item.pre + (0).toFixed(dec) + item.post;
      list.push(item);
    });
    var run = function (it) {
      it.done = true;
      var t0 = null, dur = 1600;
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        it.vis.textContent = it.pre + (it.to * e).toFixed(it.dec) + it.post;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      // if rAF never fires (background tab), still land on the real figure
      setTimeout(function () { it.vis.textContent = it.pre + it.to.toFixed(it.dec) + it.post; }, dur + 400);
    };
    onTick.push(function () {
      for (var i = 0; i < list.length; i++) {
        if (list[i].done) continue;
        var r = list[i].el.getBoundingClientRect();
        if (r.top < innerHeight * 0.88 && r.bottom > 0) run(list[i]);
      }
    });
  })();

  /* ---------- 5. Statement: words light up as you scroll ------- */
  (function tint() {
    var el = $('[data-tint]');
    if (!el || reduce()) return;
    var text = el.textContent.trim();
    el.textContent = '';
    text.split(/(\s+)/).forEach(function (part) {
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(part)); return; }
      var s = document.createElement('span');
      s.className = 'w';
      s.textContent = part;
      el.appendChild(s);
    });
    var words = $$('.w', el);
    onTick.push(function () {
      var r = el.getBoundingClientRect();
      var p = 1 - (r.top - innerHeight * 0.2) / (innerHeight * 0.5);
      p = Math.max(0, Math.min(1, p));
      var upto = Math.round(p * words.length);
      for (var i = 0; i < words.length; i++) words[i].style.color = i < upto ? '' : 'rgba(255,255,255,.28)';
    });
  })();

  /* ---------- 6. Marquee bands --------------------------------- */
  (function marquee() {
    $$('.marquee').forEach(function (m) {
      var track = $('.marquee__track', m), group = $('.marquee__group', m);
      if (!track || !group) return;
      var clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
      var speed = parseFloat(m.getAttribute('data-speed')) || 55; // px per second
      var setDur = function () {
        var w = group.getBoundingClientRect().width;
        if (w) track.style.setProperty('--dur', (w / speed) + 's');
      };
      setDur();
      window.addEventListener('resize', setDur);
      window.addEventListener('load', setDur);
    });
  })();

  /* ---------- 7. Slider (working across teams) -----------------
     A scroll-snap row that works by swipe and scroll on its own;
     the buttons and counter are an enhancement. */
  (function slider() {
    $$('[data-slider]').forEach(function (s) {
      var track = $('.slider__track', s);
      var slides = $$('.slide', s);
      var prev = $('[data-prev]', s), next = $('[data-next]', s);
      var cur = $('[data-cur]', s), fill = $('.slider__fill', s);
      if (!track || !slides.length) return;
      var index = -1;
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };

      var current = function () {
        var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bestD = Infinity;
        slides.forEach(function (el, i) {
          var c = el.offsetLeft + el.offsetWidth / 2;
          var d = Math.abs(c - mid);
          if (d < bestD) { bestD = d; best = i; }
        });
        return best;
      };
      var sync = function () {
        var i = current();
        if (i === index) return;
        index = i;
        slides.forEach(function (el, j) { el.classList.toggle('is-current', j === i); });
        if (cur) cur.textContent = pad(i + 1);
        if (fill) fill.style.setProperty('--p', String((i + 1) / slides.length));
        if (prev) prev.disabled = i === 0;
        if (next) next.disabled = i === slides.length - 1;
      };
      var go = function (i) {
        i = Math.max(0, Math.min(slides.length - 1, i));
        var el = slides[i];
        track.scrollTo({ left: el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2, behavior: reduce() ? 'auto' : 'smooth' });
      };
      if (prev) prev.addEventListener('click', function () { go(index - 1); });
      if (next) next.addEventListener('click', function () { go(index + 1); });
      var t = null;
      track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(sync, 60); }, { passive: true });
      window.addEventListener('resize', function () { index = -1; sync(); });
      sync();
    });
  })();

  /* ---------- 7b. Stacked role cards: one shared height --------
     The cards stick on wide, tall screens and slide over each other.
     A shorter card on top would leave the one beneath showing below
     it, so while stacking is on, every card takes the tallest height.
     Matches the media query in main.css §12. */
  (function roles() {
    var cards = $$('.role');
    if (!cards.length) return;
    var mq = window.matchMedia('(min-width: 1024px) and (min-height: 760px)');
    var fit = function () {
      cards.forEach(function (c) { c.style.minHeight = ''; });
      if (!mq.matches) return;
      var max = 0;
      cards.forEach(function (c) { max = Math.max(max, c.offsetHeight); });
      cards.forEach(function (c) { c.style.minHeight = max + 'px'; });
    };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('load', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  })();

  /* ---------- 8. Local clock (Asia/Kolkata) -------------------- */
  (function clock() {
    var els = $$('[data-clock]');
    if (!els.length) return;
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
    } catch (e) { return; }
    var tick = function () {
      var t = fmt.format(new Date()).toUpperCase();
      els.forEach(function (el) { el.textContent = t; });
    };
    tick();
    setInterval(tick, 20000);
  })();

  /* ---------- 9. Footer year ----------------------------------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- 10. Run the shared tick -------------------------- */
  (function ticker() {
    var queued = false, last = 0;
    var run = function () { queued = false; last = Date.now(); for (var i = 0; i < onTick.length; i++) onTick[i](); };
    var request = function () {
      if (Date.now() - last > 50) { run(); return; }
      if (!queued) { queued = true; setTimeout(run, 50); }
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    window.addEventListener('load', request);
    document.addEventListener('visibilitychange', request);
    run();
    // follow-up passes catch late layout shifts (webfonts, images)
    [120, 400, 900, 1800].forEach(function (t) { setTimeout(run, t); });
  })();
})();
