/* ============================================================
   SKETCHBOOK — all behaviour.
   STUDIO and WORKS below are the single content source: add a
   work there and it appears in the book, the contents row and
   the mobile gallery. Presentation lives in css/styles.css.
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     CONTENT — the single source for the whole page.
     Add a work here and it appears in the book, in the contents
     row and in the mobile gallery. `plate: null` renders a
     labelled placeholder plate instead of an image.
     ========================================================== */
  var STUDIO = {
    name: 'carpediemsnutz',
    blurb: 'Paintings,sketches, and some notes with them.',
    discipline: 'Paintings and sketches',
    range: 'Works and notes, 2021\u20132026',
   
    /* the line under the wordmark on the front page */
    kicker: 'some of my works \u00b7 2021\u20142026'
  };

  var WORKS = [
    {
      title: 'portrait',
      meta: 'digital/krita \u00b7 2026/08',
      plate: 'assets/ass.jpg',
      note: 'i painted this on a whim and was actually trying to practice just rendering skins and then ended up finishing it coz really liked the how the render turned out',
      bg: '#6f5a45',
      spec: { medium: 'digital/krita', size: '', year: '2026/08' }
    },
    {
      title: 'himeno',
      meta: ' paper sketch \u00b7 2023/12',
      plate: 'assets/ass2.jpeg',
      note: 'i drew this back when i was in hostel in my sketchbook instead of actually studying for my board exams.',
      bg: '#8a6f52',
      spec: { medium: 'paper skecth', size: '', year: '2023/12' }
    },
    {
      title: 'WIP',
      meta: ' digital/krita \u00b7 2023/09',
      plate: 'assets/78.png',
      note: 'one of my first proper portraits that i loved to paint and actually looked good spent a lot of time in this work tho the finished version was a bit dissapointing',
      bg: '#8a6f52',
      spec: { medium: 'digital/krita', size: '', year: '2023/09' }
    },
    {
      title: 'rei',
      meta: 'digital/krita \u00b7 2026/08',
      plate: 'assets/reiass.jpg',
      note: 'i tried anime style after many years and surprinsingly it suits my style and i actually loved it will def do more ',
      bg: '#5f6f7c',
      spec: { medium: 'digital/krita', size: '', year: '2026/08' }
    }
  ];

  var PALETTES = ['warm', 'kraft', 'slate'];
  var PKEY = 'sketchbook.palette';

  /* ==========================================================
     SMALL HELPERS
     ========================================================== */
  var doc = document;
  var root = doc.documentElement;

  function esc(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function node(html) {
    var t = doc.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function hexRgb(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  /* amount: -1 = toward black, +1 = toward white */
  function tint(hex, amount) {
    var rgb = hexRgb(hex);
    var target = amount < 0 ? 0 : 255;
    var k = Math.abs(amount);
    return 'rgb(' +
      Math.round(rgb[0] + (target - rgb[0]) * k) + ', ' +
      Math.round(rgb[1] + (target - rgb[1]) * k) + ', ' +
      Math.round(rgb[2] + (target - rgb[2]) * k) + ')';
  }

  function altFor(work) {
    return work.title + ' \u2014 ' + work.spec.medium + ', ' + work.spec.year;
  }

  /* Gallery-size plate: framed, because it is a card in a vertical stack
     rather than a page in a book. */
  function plateMarkup(work) {
    if (work.plate) {
      return '<img class="plate-photo" src="' + esc(work.plate) + '" alt="' + esc(altFor(work)) +
             '" loading="lazy" decoding="async">';
    }
    return placeholder(work, 'plate plate--empty', false);
  }

  /* A labelled tonal composition in the work's own colour. Never an invented
     illustration, and never a silent gap in the page. `decorative` marks the
     second copy of a plate, which should not be announced twice. `index` is
     passed only for book pages, where a placeholder carries its own printed
     label; at gallery size the caption underneath already names it. */
  function placeholder(work, className, decorative, index) {
    var label = 'Placeholder plate for ' + work.title + ' \u2014 artwork not yet photographed';
    var plaque = typeof index === 'number'
      ? '<span class="plate-label">' +
          '<span class="plate-label-num">Plate ' + pad2(index + 1) + '</span>' +
          '<span>Not yet photographed</span>' +
        '</span>'
      : '';
    return '<div class="' + className + '"' +
           (decorative ? ' aria-hidden="true"' : ' role="img" aria-label="' + esc(label) + '"') +
           ' style="--plate-hi:' + tint(work.bg, 0.42) +
           ';--plate-mid:' + work.bg +
           ';--plate-lo:' + tint(work.bg, -0.44) + '">' + plaque + '</div>';
  }

  /* Book-size plate: one picture twice the width of a leaf, clipped by the page
     it sits in, so a single artwork runs through the gutter and off all four
     edges. The verso half carries the real alt text; the recto half is the same
     picture again, so it is hidden from assistive tech to avoid reading twice. */
  function bleedMarkup(work, isVerso, index) {
    if (work.plate) {
      var alt = isVerso ? esc(altFor(work)) : '';
      return '<div class="bleed">' +
               '<img src="' + esc(work.plate) + '" alt="' + alt + '"' +
               (isVerso ? '' : ' aria-hidden="true"') +
               ' loading="lazy" decoding="async">' +
             '</div>';
    }
    return placeholder(work, 'bleed bleed--empty', !isVerso, isVerso ? index : undefined);
  }

  /* ==========================================================
     PAPER PALETTES
     ========================================================== */
  var swatches = Array.prototype.slice.call(doc.querySelectorAll('.swatch'));

  function setPalette(id, persist) {
    if (PALETTES.indexOf(id) < 0) id = 'warm';
    root.setAttribute('data-palette', id);
    swatches.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.palette === id));
    });
    if (persist) {
      try { localStorage.setItem(PKEY, id); } catch (e) { /* private mode */ }
    }
  }

  swatches.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setPalette(btn.dataset.palette, true);
    });
  });

  /* ==========================================================
     1 + 2. BUILD THE PAGE DOM FROM `WORKS`
     ========================================================== */
  function boardPage(kind) {
    var isBack = kind === 'back';
    var kicker = isBack ? 'Colophon' : 'Sketchbook';
    var side = isBack ? 'left' : 'right';

    var body = isBack
      ? '<p class="board-sub">' + WORKS.length +
        ' works, documented and annotated.<br>' + esc(STUDIO.place) + '</p>'
      : '<p class="board-sub">' + esc(STUDIO.discipline) + '<br>' +
        esc(STUDIO.range) + '</p>';

    return node(
      '<div class="page" data-density="hard" data-side="' + side + '">' +
        '<div class="page-inner board' + (isBack ? ' board--back' : '') + '">' +
          '<span class="spine" aria-hidden="true"></span>' +
          '<p class="board-kicker">' + kicker + '</p>' +
          '<div class="board-body' + (isBack ? ' board-body--back' : '') + '">' +
            (isBack ? '' : '<p class="board-name">' + esc(STUDIO.name) + '</p>') +
            '<span class="board-rule" aria-hidden="true"></span>' +
            body +
          '</div>' +
          (isBack ? '' : '<p class="board-hint">Click to open</p>') +
        '</div>' +
      '</div>'
    );
  }

  /* One work, one spread. Both leaves are plate and nothing else: a single
     picture twice the width of a leaf, one half clipped by each page, so the
     artwork runs through the gutter and off all four edges with no frame. The
     annotation that used to sit over the verso now lives in the plate-info
     band under the book — see fillInfo/showInfo below. */
  function spreadPages(work, index) {
    var verso = node(
      '<div class="page" data-density="soft" data-side="left" data-half="left">' +
        '<div class="page-inner page-inner--bleed">' +
          bleedMarkup(work, true, index) +
        '</div>' +
      '</div>'
    );

    var recto = node(
      '<div class="page" data-density="soft" data-side="right" data-half="right">' +
        '<div class="page-inner page-inner--bleed">' +
          bleedMarkup(work, false, index) +
        '</div>' +
      '</div>'
    );

    return [verso, recto];
  }

  /* With showCover, StPageFlip lays spreads out as [0], [1,2], [3,4] ...
     where the low index is the LEFT leaf and the high index the RIGHT one.
     A work therefore occupies exactly one spread: its verso first, its recto
     second, with the single plate bleeding across both. Total (cover + 2n +
     back) is always even, so the last spread is never left half-empty. */
  function buildPages() {
    var pages = [boardPage('front')];
    WORKS.forEach(function (work, i) {
      var spread = spreadPages(work, i);
      pages.push(spread[0]);
      pages.push(spread[1]);
    });
    pages.push(boardPage('back'));
    return pages;
  }

  /* ==========================================================
     CONTENTS ROW + MOBILE GALLERY
     ========================================================== */
  var contentsList = doc.getElementById('contents-list');
  var gallery = doc.getElementById('gallery');
  var contentsButtons = [];

  var plateInfo = doc.getElementById('plate-info');
  var infoNum = doc.getElementById('plate-info-num');
  var infoTitle = doc.getElementById('plate-info-title');
  var infoMeta = doc.getElementById('plate-info-meta');
  var infoNote = doc.getElementById('plate-info-note');
  var infoSpec = doc.getElementById('plate-info-spec');
  var infoFlag = doc.getElementById('plate-info-flag');

  var SPEC_LABELS = { medium: 'Medium', size: 'Size', year: 'Year' };

  /* work i is one spread: its verso is 2i + 1, its recto 2i + 2 */
  function spreadPageOf(i) { return i * 2 + 1; }

  WORKS.forEach(function (work, i) {
    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.innerHTML = '<span class="contents-num">' + pad2(i + 1) + '</span>' +
                    '<span>' + esc(work.title) + '</span>';
    btn.addEventListener('click', function () {
      if (!flip || flip.getState() === 'flipping') return;
      flip.turnToPage(spreadPageOf(i));
    });

    var li = doc.createElement('li');
    li.appendChild(btn);
    contentsList.appendChild(li);
    contentsButtons.push(btn);

    gallery.appendChild(node(
      '<figure class="g-card">' +
        '<div class="plate-frame">' + plateMarkup(work) + '</div>' +
        '<figcaption>' +
          '<h3>' + esc(work.title) + '</h3>' +
          '<p class="cap-meta">Plate ' + pad2(i + 1) + ' \u00b7 ' + esc(work.meta) + '</p>' +
          (work.plate ? '' : '<p class="cap-flag">Not yet photographed</p>') +
          (work.note ? '<p class="g-note">' + esc(work.note) + '</p>' : '') +
        '</figcaption>' +
      '</figure>'
    ));
  });

  /* ---- the annotation box: turned over with the spread ----------------
     `n` is a work index, or -1 for either cover. The box is hidden on the
     covers, and only re-fades when the work actually changes — a single flip
     fires changeState several times, and restriking the fade each time would
     make the box flicker through the turn. */
  var shownInfo = -2;

  function fillInfo(n) {
    var work = WORKS[n];
    if (!work) return;

    infoNum.textContent = 'Plate ' + pad2(n + 1);
    infoTitle.textContent = work.title;
    infoMeta.textContent = work.meta;
    infoNote.textContent = work.note;

    var rows = '';
    Object.keys(SPEC_LABELS).forEach(function (key) {
      if (!work.spec || !work.spec[key]) return;
      rows += '<dt>' + SPEC_LABELS[key] + '</dt>' +
              '<dd>' + esc(work.spec[key]) + '</dd>';
    });
    infoSpec.innerHTML = rows;

    infoFlag.hidden = !!work.plate;
  }

  function showInfo(n) {
    if (!plateInfo || n === shownInfo) return;
    shownInfo = n;

    if (n < 0) {
      plateInfo.hidden = true;
      return;
    }

    plateInfo.hidden = false;
    fillInfo(n);

    /* restart the fade: drop the class, force a style pass, put it back */
    plateInfo.classList.remove('is-shown');
    void plateInfo.offsetHeight;
    plateInfo.classList.add('is-shown');
  }

  /* masthead, blurb and the front page's kicker, all drawn from STUDIO so the
     words live in one place */
  doc.getElementById('m-name').textContent = STUDIO.name;
  doc.getElementById('hero-kicker').textContent = STUDIO.kicker;
  doc.getElementById('blurb').textContent = STUDIO.blurb;
  doc.title = 'Sketchbook \u2014 ' + STUDIO.name;

  /* 3. INITIALISE THE FLIPBOOK — only once the DOM exists */
  var bookEl = doc.getElementById('book');
  var btnBack = doc.getElementById('btn-back');
  var btnTurn = doc.getElementById('btn-turn');
  var counterPage = doc.getElementById('counter-page');
  var counterWork = doc.getElementById('counter-work');

  var deskMq = window.matchMedia('(min-width: 901px)');
  var flip = null;
  var pageCount = 0;

  function workIndexFor(pageIndex) {
    if (pageIndex < 1 || pageIndex > pageCount - 2) return -1;
    return Math.floor((pageIndex - 1) / 2);
  }

  function sync() {
    if (!flip) return;

    var i = flip.getCurrentPageIndex();
    var last = pageCount - 1;

    btnBack.disabled = i <= 0;
    btnTurn.disabled = i >= last;

    if (i === 0) {
      counterPage.textContent = 'Cover';
      counterWork.textContent = '';
    } else if (i >= last) {
      counterPage.textContent = 'Back cover';
      counterWork.textContent = '';
    } else {
      /* a work is one spread, so the leaf indices are odd; count works
         instead, and the number runs 1..n with no gaps. */
      counterPage.textContent = 'Page ' + (workIndexFor(i) + 1) + ' / ' + WORKS.length;
      var work = WORKS[workIndexFor(i)];
      counterWork.textContent = work ? work.title : '';
    }

    var active = workIndexFor(i);
    contentsButtons.forEach(function (btn, n) {
      if (n === active) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });

    /* the covers return -1, which hides the panel */
    showInfo(active);
  }

  function initFlip() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* maxWidth must stay .book-stage max-width / 2 in css/styles.css
       (1240 / 2 = 620). Change both together. */
    flip = new St.PageFlip(bookEl, {
      width: 420,
      height: 560,            /* 3:4 leaf -> a 2:3 spread */
      size: 'stretch',
      minWidth: 300,
      maxWidth: 620,         /* must stay .book-stage max-width / 2 (1240/2) */
      minHeight: 400,
      maxHeight: 720,
      showCover: true,        /* page 0 renders alone */
      usePortrait: false,     /* always a spread; phones get the gallery */
      autoSize: true,
      startPage: 0,
      drawShadow: !reduce,
      maxShadowOpacity: reduce ? 0 : 0.35,
      flippingTime: reduce ? 1 : 820,   /* must be > 0 or StPageFlip throws */
      showPageCorners: true,  /* corner-grab */
      disableFlipByClick: false,
      clickEventForward: true,
      useMouseEvents: true,
      mobileScrollSupport: true,
      swipeDistance: 30,
      startZIndex: 0
    });

    /* loadFromHTML must come after the page elements exist. */
    flip.loadFromHTML(buildPages());

    pageCount = flip.getPageCount();

    /* the handler receives { data, object } */
    flip.on('flip', function (e) {
      if (typeof e.data === 'number') sync();
    });
    flip.on('changeState', function () { sync(); });
    flip.on('changeOrientation', function () { sync(); });

    sync();
  }

  function ensureBook() {
    if (flip || !deskMq.matches) return;
    initFlip();
  }

  /* No flipbook — blocked CDN, offline, no JavaScript. The gallery stands in. */
  if (!window.St || !window.St.PageFlip) {
    root.classList.add('no-flip');
  } else {
    if (deskMq.addEventListener) deskMq.addEventListener('change', ensureBook);
    else if (deskMq.addListener) deskMq.addListener(ensureBook);
    ensureBook();
  }

  /* 
     4. CONTROLS */
  btnBack.addEventListener('click', function () {
    if (flip) flip.flipPrev();
  });

  btnTurn.addEventListener('click', function () {
    if (flip) flip.flipNext();
  });

  doc.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    /* Ignore the arrow keys while a control has focus. Checked twice on
       purpose: a real keydown targets the focused element, but a synthesised
       one can be dispatched on document, and `focus is inside a button` is
       the rule that actually matters. */
    if (e.target && e.target.closest && e.target.closest('button')) return;
    if (doc.activeElement && doc.activeElement.closest && doc.activeElement.closest('button')) return;
    if (!flip) return;
    e.preventDefault();
    if (e.key === 'ArrowLeft') flip.flipPrev();
    else flip.flipNext();
  });

  setPalette(root.getAttribute('data-palette') || 'warm', false);
})();
