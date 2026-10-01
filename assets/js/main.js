/* ============================================================
   Rashank R — Portfolio interactions
   Vanilla JS. No dependencies. Everything degrades gracefully
   and is fully disabled under prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduce = function () { return mqReduce.matches; };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- 0. Theme ----------------------------------------
     The stored choice is already applied by the inline bootstrap in
     <head>, before first paint. This only wires the toggle, keeps the
     button's label describing the *action*, and keeps following the OS
     for as long as nobody has chosen. */
  (function theme() {
    var buttons = $$('[data-theme-toggle]');
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var meta = $('meta[name="theme-color"]');
    var timer = null;

    var current = function () {
      var attr = root.getAttribute('data-theme');
      if (attr === 'light' || attr === 'dark') return attr;
      return mq.matches ? 'dark' : 'light';
    };

    var sync = function () {
      var t = current();
      var label = t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
      buttons.forEach(function (b) {
        b.setAttribute('aria-label', label);
        b.setAttribute('title', label);
      });
      if (meta) meta.setAttribute('content', t === 'dark' ? '#0d0d0e' : '#f3f1ed');
    };

    sync();

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var next = current() === 'dark' ? 'light' : 'dark';
        if (!reduce()) {
          root.classList.add('theme-switching');
          clearTimeout(timer);
          timer = setTimeout(function () { root.classList.remove('theme-switching'); }, 420);
        }
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('rr:theme', next); } catch (e) { /* private mode */ }
        sync();
      });
    });

    var onSystem = function () { if (!root.hasAttribute('data-theme')) sync(); };
    if (mq.addEventListener) mq.addEventListener('change', onSystem);
    else if (mq.addListener) mq.addListener(onSystem);
  })();

  /* ---------- 1. Preloader ------------------------------------ */
  (function preloader() {
    var el = $('.preloader');
    if (!el) return;

    // `is-entering` drives a keyframe animation on .page that includes a
    // transform. Left on the element it keeps filling, and a filling transform
    // animation makes .page a containing block for position:fixed descendants,
    // which quietly breaks anything fixed inside it. Drop the class once it runs.
    var enter = function () {
      root.classList.add('is-entering');
      setTimeout(function () { root.classList.remove('is-entering'); }, 900);
    };

    if (reduce() || sessionStorage.getItem('rr:seen') === '1') {
      el.parentNode.removeChild(el);
      enter();
      return;
    }
    var done = function () {
      el.classList.add('is-done');
      enter();
      sessionStorage.setItem('rr:seen', '1');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1500);
    };
    window.addEventListener('load', function () { setTimeout(done, 480); });
    // safety net if `load` is slow
    setTimeout(done, 2600);
  })();

  /* ---------- 2. Custom cursor -------------------------------- */
  (function cursor() {
    if (!mqFine.matches || reduce()) return;
    var c = $('.cursor');
    if (!c) return;
    root.classList.add('has-cursor');
    var dot = $('.cursor__dot', c), ring = $('.cursor__ring', c), label = $('.cursor__label', c);
    var mx = innerWidth / 2, my = innerHeight / 2, dx = mx, dy = my, rx = mx, ry = my;

    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('mouseleave', function () { c.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { c.style.opacity = '1'; });

    (function loop() {
      dx += (mx - dx) * 0.9; dy += (my - dy) * 0.9;
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      dot.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('[data-cursor]');
      if (t) {
        var txt = t.getAttribute('data-cursor');
        label.textContent = txt;
        c.classList.toggle('is-active', txt !== '');
        c.classList.toggle('is-small', txt === '');
        return;
      }
      if (e.target.closest('a,button')) { c.classList.add('is-small'); c.classList.remove('is-active'); label.textContent = ''; return; }
      c.classList.remove('is-active', 'is-small');
      label.textContent = '';
    });
  })();

  /* ---------- 3. Navigation ----------------------------------- */
  (function nav() {
    var n = $('.nav');
    if (!n) return;
    var last = 0;
    var onScroll = function () {
      var y = window.scrollY;
      n.classList.toggle('is-stuck', y > 24);
      // hide when scrolling down past the fold, show on scroll up
      if (!document.body.classList.contains('menu-open')) {
        n.classList.toggle('is-hidden', y > 420 && y > last + 4);
      }
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------- 4. Mobile menu ---------------------------------- */
  (function menu() {
    var m = $('.menu'), b = $('.burger');
    if (!m || !b) return;
    var links = $$('.menu__nav a', m);
    links.forEach(function (a, i) { a.style.setProperty('--d', (0.12 + i * 0.06) + 's'); });

    var setOpen = function (open) {
      m.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      document.body.classList.toggle('is-locked', open);
      b.setAttribute('aria-expanded', String(open));
      b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      m.setAttribute('aria-hidden', String(!open));
      if (open) { (links[0] || m).focus({ preventScroll: true }); }
    };
    b.addEventListener('click', function () { setOpen(!m.classList.contains('is-open')); });
    m.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && m.classList.contains('is-open')) { setOpen(false); b.focus(); }
    });
    window.addEventListener('resize', function () {
      if (innerWidth > 1023 && m.classList.contains('is-open')) setOpen(false);
    });
  })();

  /* ---------- 5. Scroll progress ------------------------------ */
  (function progress() {
    var fill = $('.progress__fill');
    if (!fill) return;
    var ticking = false;
    var update = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
      fill.style.transform = 'scaleX(' + p + ')';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------- 6. Reveal on scroll ----------------------------- */
  /* Geometry-based rather than IntersectionObserver: IO is silently
     throttled in some embedded/background renderers, and content that is
     hidden until revealed must never depend on that. */
  var onTick = [];
  (function reveal() {
    var items = $$('[data-reveal], .lines, .media--reveal');
    if (!items.length) return;
    if (reduce()) { items.forEach(function (el) { el.classList.add('is-in'); }); return; }

    // stagger siblings that share a [data-stagger] parent
    $$('[data-stagger]').forEach(function (p) {
      var step = parseFloat(p.getAttribute('data-stagger')) || 0.08;
      Array.prototype.forEach.call(p.children, function (child, i) {
        if (!child.style.getPropertyValue('--d')) child.style.setProperty('--d', (i * step) + 's');
      });
    });
    // stagger the lines inside each .lines block
    $$('.lines').forEach(function (b) {
      var base = parseFloat(b.getAttribute('data-delay')) || 0;
      $$('.ln > span', b).forEach(function (s, i) { s.style.setProperty('--d', (base + i * 0.085) + 's'); });
    });

    var pending = items.slice();
    onTick.push(function () {
      if (!pending.length) return;
      var vh = innerHeight, trigger = vh * 0.9, still = [];
      for (var i = 0; i < pending.length; i++) {
        var el = pending[i], r = el.getBoundingClientRect();
        if (r.top < trigger && r.bottom > 0) el.classList.add('is-in');
        else still.push(el);
      }
      pending = still;
    });
  })();

  /* ---------- 7. Magnetic buttons ----------------------------- */
  (function magnetic() {
    if (!mqFine.matches || reduce()) return;
    $$('[data-magnetic]').forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-magnetic')) || 0.28;
      var raf = null, tx = 0, ty = 0, cx = 0, cy = 0;
      var run = function () {
        cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
        el.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
        if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) raf = requestAnimationFrame(run);
        else { raf = null; el.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)'; }
      };
      var kick = function () { if (!raf) raf = requestAnimationFrame(run); };
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * strength;
        ty = (e.clientY - (r.top + r.height / 2)) * strength;
        kick();
      });
      el.addEventListener('mouseleave', function () { tx = 0; ty = 0; kick(); });
    });
  })();

  /* ---------- 8. Hero field follows the cursor ---------------- */
  (function field() {
    if (!mqFine.matches || reduce()) return;
    var blobs = $$('.field__blob');
    if (!blobs.length) return;
    var hero = $('.hero') || document.body;
    hero.addEventListener('mousemove', function (e) {
      var x = (e.clientX / innerWidth - 0.5);
      var y = (e.clientY / innerHeight - 0.5);
      blobs.forEach(function (b, i) {
        var k = (i + 1) * 22;
        b.style.transform = 'translate3d(' + (x * k).toFixed(1) + 'px,' + (y * k).toFixed(1) + 'px,0)';
      });
    }, { passive: true });
  })();

  /* ---------- 9. Image parallax -------------------------------
     Applied to project covers, case-study figures and the portraits.
     Written to the independent `translate` property, never `transform`:
     the reveal zoom and the hover scale already own `transform`, and
     setting it here would silently cancel both. Images in these frames
     are given ~14% extra height in CSS so the travel never exposes an
     edge. Off entirely under reduced motion and on narrow screens. */
  (function parallax() {
    var SEL = '.proj__media img, .cs-fig .media img, .portrait__frame img, [data-parallax]';
    var els = $$(SEL);
    if (!els.length) return;

    var clear = function () {
      els.forEach(function (el) { el.style.removeProperty('translate'); });
    };
    if (reduce()) { clear(); return; }

    // Matches the CSS breakpoint that grants the images their headroom.
    // Deliberately matchMedia and not innerWidth: under page zoom the two
    // disagree, and the pair falling out of step means either oversized
    // images that never move, or movement with no slack to absorb it.
    var mqNarrow = window.matchMedia('(max-width: 767px)');

    var ticking = false;
    var update = function () {
      ticking = false;
      // narrow frames are near full-bleed, where the movement reads as drift
      // rather than depth, so it is cheaper and calmer to skip it
      if (mqNarrow.matches) { clear(); return; }
      var vh = innerHeight;
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        var amount = parseFloat(el.getAttribute('data-parallax')) || 5; // % of own height
        var progress = (r.top + r.height / 2 - vh / 2) / vh;           // -1 .. 1
        if (progress < -1.4) progress = -1.4; else if (progress > 1.4) progress = 1.4;
        el.style.translate = '0 ' + (progress * amount).toFixed(2) + '%';
      }
    };
    var request = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    window.addEventListener('load', request);
    if (mqNarrow.addEventListener) mqNarrow.addEventListener('change', request);
    if (mqReduce.addEventListener) {
      mqReduce.addEventListener('change', function () {
        if (reduce()) clear(); else request();
      });
    }
    update();
    [200, 600, 1400].forEach(function (t) { setTimeout(update, t); });
  })();

  /* ---------- 10. Experience accordion ------------------------ */
  (function accordion() {
    var items = $$('.xp__item');
    if (!items.length) return;
    items.forEach(function (item) {
      var btn = $('.xp__btn', item), panel = $('.xp__panel', item);
      if (!btn || !panel) return;
      var inner = $('.xp__panel-in', panel);
      var setH = function (open) {
        panel.style.height = open ? inner.scrollHeight + 'px' : '0px';
      };
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        if (!open) {
          items.forEach(function (o) {
            if (o === item) return;
            var ob = $('.xp__btn', o), op = $('.xp__panel', o);
            if (ob && ob.getAttribute('aria-expanded') === 'true') { ob.setAttribute('aria-expanded', 'false'); op.style.height = '0px'; }
          });
        }
        btn.setAttribute('aria-expanded', String(!open));
        setH(!open);
      });
      window.addEventListener('resize', function () {
        if (btn.getAttribute('aria-expanded') === 'true') setH(true);
      });
    });
    // open the most recent role by default on wide screens
    if (innerWidth > 860 && items[0]) {
      var b0 = $('.xp__btn', items[0]), p0 = $('.xp__panel', items[0]);
      b0.setAttribute('aria-expanded', 'true');
      p0.style.height = $('.xp__panel-in', p0).scrollHeight + 'px';
    }
  })();

  /* ---------- 11. Sticky process counter ---------------------- */
  (function processCounter() {
    var count = $('.process__count span');
    var steps = $$('.pstep');
    if (!count || !steps.length) return;
    var current = '';
    onTick.push(function () {
      var mid = innerHeight / 2, best = null, bestDist = Infinity;
      for (var i = 0; i < steps.length; i++) {
        var r = steps[i].getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        var d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) { bestDist = d; best = steps[i]; }
      }
      if (!best) return;
      var n = best.getAttribute('data-step');
      if (n === current) return;
      current = n;
      if (reduce()) { count.textContent = n; return; }
      count.style.transform = 'translateY(-105%)';
      count.style.opacity = '0';
      setTimeout(function () {
        count.textContent = n;
        count.style.transition = 'none';
        count.style.transform = 'translateY(105%)';
        void count.offsetWidth;
        count.style.transition = '';
        count.style.transform = 'translateY(0)';
        count.style.opacity = '1';
      }, 240);
    });
  })();

  /* ---------- 11b. One shared scroll/resize tick --------------- */
  (function ticker() {
    if (!onTick.length) return;
    var queued = false, last = 0;
    var run = function () { queued = false; last = Date.now(); for (var i = 0; i < onTick.length; i++) onTick[i](); };
    // deliberately not rAF-driven: rAF is throttled in background/embedded
    // renderers, and these toggles decide whether content is visible at all
    var request = function () {
      var now = Date.now();
      if (now - last > 60) { run(); return; }
      if (!queued) { queued = true; setTimeout(run, 60); }
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    window.addEventListener('load', request);
    document.addEventListener('visibilitychange', request);
    run();
    // a few follow-up passes catch late layout shifts (webfonts, images)
    [120, 400, 900, 1800].forEach(function (t) { setTimeout(run, t); });
  })();

  /* ---------- 12. Seamless marquees --------------------------- */
  (function marquee() {
    $$('.marquee').forEach(function (m) {
      var track = $('.marquee__track', m);
      var group = $('.marquee__group', track);
      if (!track || !group) return;
      var clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
      // keep a constant pixel speed regardless of content width
      var speed = parseFloat(m.getAttribute('data-speed')) || 55; // px / second
      var setDur = function () {
        var w = group.getBoundingClientRect().width;
        if (w) track.style.setProperty('--dur', (w / speed) + 's');
      };
      setDur();
      window.addEventListener('resize', setDur);
    });
  })();

  /* ---------- 12b. Scrollable rails ---------------------------
     A region you can only reach by scrolling sideways has to be focusable,
     or keyboard users can't read past the first card. But it is a plain
     grid at >=1024 with nothing to scroll, where a tab stop would just be
     an empty one — so the attribute tracks whether it actually overflows. */
  (function rails() {
    var rails = $$('.wgrid');
    if (!rails.length) return;
    var sync = function () {
      rails.forEach(function (r) {
        if (r.scrollWidth > r.clientWidth + 1) {
          r.setAttribute('tabindex', '0');
          r.setAttribute('role', 'group');
        } else {
          r.removeAttribute('tabindex');
          r.removeAttribute('role');
        }
      });
    };
    sync();
    window.addEventListener('resize', sync);
    window.addEventListener('load', sync);
    [300, 900].forEach(function (t) { setTimeout(sync, t); });
  })();

  /* ---------- 13. Local clock (Asia/Kolkata) ------------------ */
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

  /* ---------- 14. Statement word-by-word tint ----------------- */
  (function statementTint() {
    var el = $('[data-tint]');
    if (!el || reduce()) return;
    var text = el.textContent.trim();
    el.textContent = '';
    text.split(/(\s+)/).forEach(function (part) {
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(part)); return; }
      var s = document.createElement('span');
      s.className = 'w';
      s.style.color = 'var(--ink-3)';
      s.textContent = part;
      el.appendChild(s);
    });
    var words = $$('.w', el);
    var ticking = false;
    var update = function () {
      var r = el.getBoundingClientRect();
      var p = 1 - (r.top - innerHeight * 0.18) / (innerHeight * 0.55);
      p = Math.max(0, Math.min(1, p));
      var upto = Math.round(p * words.length);
      words.forEach(function (w, i) { w.style.color = i < upto ? 'var(--ink)' : 'var(--ink-3)'; });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------- 15. Smooth anchors + page transitions ----------- */
  (function navigation() {
    // in-page anchors
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id === '#' || id === '#0') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'start' });
      history.pushState(null, '', id);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });

    // cross-page fade
    if (reduce()) return;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      if (a.target === '_blank' || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;
      if (url.href === location.href) return;
      e.preventDefault();
      root.classList.add('is-leaving');
      setTimeout(function () { location.href = url.href; }, 400);
    });
    window.addEventListener('pageshow', function () { root.classList.remove('is-leaving'); });
  })();

  /* ---------- 16. Footer year --------------------------------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
