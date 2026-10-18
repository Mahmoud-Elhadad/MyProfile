/* ==========================================================================
   js/main.js — all behaviour. Reads content from window.PORTFOLIO (js/data.js).
   No libraries, no build step, no network requests.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.PORTFOLIO || {};
  var site = D.site || {};
  var profile = D.profile || {};
  var projects = Array.isArray(D.projects) ? D.projects : [];
  var skillCategories = Array.isArray(D.skillCategories) ? D.skillCategories : [];
  var formConfig = D.form || {};

  var qs = function (sel, root) { return (root || document).querySelector(sel); };
  var qsa = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  var STORAGE_KEY = 'portfolio-theme';

  /* ------------------------------------------------------------------------
     Small helpers
     ---------------------------------------------------------------------- */

  // Escape user-supplied strings before they touch innerHTML.
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isPlaceholderText(value) {
    if (typeof value !== 'string') return true;
    var t = value.trim();
    return t === '' || /^\[[\s\S]*\]$/.test(t) || /\[[^\]]{3,}\]/.test(t);
  }

  function isUsableUrl(value) {
    return typeof value === 'string' && /^https?:\/\/.+\..{2,}/i.test(value.trim());
  }

  function isUsableEmail(value) {
    return typeof value === 'string' &&
      !isPlaceholderText(value) &&
      /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value.trim());
  }

  // Every decorative animation asks this first. Nothing here is required to
  // read the page, so reduced-motion users simply get the static version.
  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Turn a value into safe markup; placeholders stay visually flagged.
  // Long passages get a tinted, readable treatment instead of monospace.
  function rich(value) {
    var safe = esc(value);
    if (isPlaceholderText(value)) {
      var long = String(value).trim().length > 70;
      return '<span class="ph' + (long ? ' ph--long' : '') + '">' + safe + '</span>';
    }
    return safe;
  }

  function textOrPlaceholder(value, note) {
    if (value == null || String(value).trim() === '') {
      return '<p class="missing">[not provided — add ' + esc(note) + ' in js/data.js]</p>';
    }
    return '<p>' + rich(value) + '</p>';
  }

  function initials(name) {
    var stripped = String(name || '').replace(/\[[\s\S]*?\]/g, ' ').trim();
    var parts = stripped.split(/\s+/).filter(Boolean);
    if (!parts.length) return '??';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Write one value into every element that asks for it.
  function bindText(key, value) {
    qsa('[data-bind="' + key + '"]').forEach(function (el) {
      el.innerHTML = rich(value);
    });
  }

  /* ------------------------------------------------------------------------
     1. THEME TOGGLE (remembered between visits)
     ---------------------------------------------------------------------- */
  function initTheme() {
    var root = document.documentElement;
    var buttons = qsa('.theme-toggle');
    var metaTheme = qs('meta[name="theme-color"]');

    function sync() {
      var theme = root.dataset.theme === 'light' ? 'light' : 'dark';
      buttons.forEach(function (btn) {
        var isLight = theme === 'light';
        // aria-pressed = "the light-theme switch is on"
        btn.setAttribute('aria-pressed', String(isLight));
        btn.setAttribute('aria-label', 'Switch to ' + (isLight ? 'dark' : 'light') + ' theme');
        var label = qs('#theme-toggle-label', btn);
        if (label) label.textContent = isLight ? 'Light' : 'Dark';
      });
      if (metaTheme) {
        metaTheme.setAttribute('content', theme === 'light' ? '#f6f8fb' : '#0b1016');
      }
    }

    function toggle() {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* storage blocked */ }
      sync();
    }

    buttons.forEach(function (btn) { btn.addEventListener('click', toggle); });
    sync();
  }

  /* ------------------------------------------------------------------------
     2. MOBILE NAVIGATION
     ---------------------------------------------------------------------- */
  function initMenu() {
    var toggle = qs('#menu-toggle');
    var nav = qs('#primary-nav');
    var text = qs('#menu-toggle-text');
    var breakpoint = window.matchMedia('(min-width: 60rem)');
    if (!toggle || !nav) return;

    function isOpen() { return nav.classList.contains('is-open'); }

    function open(moveFocus) {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');
      if (text) text.textContent = 'Close';
      if (moveFocus !== false) {
        var first = qs('.nav-link', nav);
        if (first) first.focus();
      }
    }

    function close(returnFocus) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      if (text) text.textContent = 'Menu';
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      if (isOpen()) close(true); else open(true);
    });

    // Close after choosing a destination (touch users expect this).
    nav.addEventListener('click', function (event) {
      var link = event.target.closest ? event.target.closest('a') : null;
      if (link && !breakpoint.matches) close(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen() && !breakpoint.matches) {
        close(true);
      }
    });

    document.addEventListener('click', function (event) {
      if (!isOpen() || breakpoint.matches) return;
      if (!event.target || !event.target.closest) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      close(false);
    });

    // Leaving the mobile layout must not leave a half-open menu behind.
    var onBreak = function () { if (breakpoint.matches) close(false); else nav.classList.remove('is-open'); };
    if (breakpoint.addEventListener) breakpoint.addEventListener('change', onBreak);
    else if (breakpoint.addListener) breakpoint.addListener(onBreak);
  }

  /* ------------------------------------------------------------------------
     2b. IN-PAGE ANCHORS — after jumping, put the keyboard/screen-reader focus
         on the section that was arrived at, so Tab continues from there
         instead of restarting at the top of the document.
     ---------------------------------------------------------------------- */
  function initAnchorFocus() {
    document.addEventListener('click', function (event) {
      var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;
      if (!link) return;

      var id = link.getAttribute('href').slice(1);
      if (!id) return; // bare "#" — leave the browser alone
      var target = document.getElementById(id);
      if (!target || target.classList.contains('top-anchor')) return;

      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      // Delay one tick so the browser's own scroll finishes first.
      window.setTimeout(function () {
        target.focus({ preventScroll: true });
      }, 80);
    });
  }

  /* ------------------------------------------------------------------------
     3. STATIC TEXT + PROFILE BINDINGS
     ---------------------------------------------------------------------- */
  function initContent() {
    bindText('name', profile.name || '[Your Name]');
    bindText('role_short', profile.roleShort || profile.role || '[Your role]');
    bindText('hero_intro', site.heroIntro || '[Edit site.heroIntro in js/data.js]');
    bindText('about_summary', site.aboutSummary || '[Edit site.aboutSummary in js/data.js]');
    bindText('projects_summary', site.projectsSummary || '[Edit site.projectsSummary in js/data.js]');
    bindText('contact_summary', site.contactSummary || '[Edit site.contactSummary in js/data.js]');

    var bio = Array.isArray(site.aboutBio) ? site.aboutBio : [];
    var bio1 = qs('[data-bind="about_bio_1"]');
    var bio2 = qs('[data-bind="about_bio_2"]');
    if (bio1) bio1.innerHTML = rich(bio[0] || '[Add site.aboutBio[0] in js/data.js]');
    if (bio2) {
      if (bio.length > 1) {
        bio2.innerHTML = rich(bio[1]);
        for (var bi = bio.length - 1; bi >= 2; bi--) {
          var extra = document.createElement('p');
          extra.innerHTML = rich(bio[bi]);
          bio2.parentNode.insertBefore(extra, bio2.nextSibling);
        }
      } else bio2.remove();
    }

    var tagline = qs('[data-bind="footer_tagline"]');
    if (tagline) {
      if (String(site.footerTagline || '').trim() === '') tagline.remove();
      else tagline.innerHTML = rich(site.footerTagline);
    }

    if (profile.availability) {
      var eyebrow = qs('.eyebrow');
      if (eyebrow) {
        eyebrow.innerHTML = '<span aria-hidden="true">●</span> ' + rich(profile.availability);
      }
    }

    renderLinkList('#hero-links', profile.links, 'pill');
    renderLinkList('#footer-social', profile.links, 'plain');
    renderFooterEmail();
    renderFocusList('#about-focus', profile.focus);
    renderPrinciples('#about-principles', profile.principles);
    renderTimeline('#timeline-block', '#timeline', profile.timeline);
    renderSkills('#skills-grid', skillCategories);
  }

  /* ------------------------------------------------------------------------
     4. LISTS OF LINKS — real links or honest placeholders, never dead hrefs
     ---------------------------------------------------------------------- */
  var GLYPHS = {
    github: 'GH', linkedin: 'in', website: 'www', email: '@', phone: 'tel',
    twitter: 'X', whatsapp: 'WA', facebook: 'fb', dribbble: 'db', stackoverflow: 'so'
  };

  function linkMarkup(link, style) {
    var label = link.label || link.kind || 'Link';
    var glyph = GLYPHS[String(link.kind || '').toLowerCase()] || '↗';
    var glyphBox = style === 'plain'
      ? '<span class="footer-glyph" aria-hidden="true">' + esc(glyph) + '</span>'
      : '<span class="hero-links__glyph" aria-hidden="true">' + esc(glyph) + '</span>';

    if (!isUsableUrl(link.url)) {
      var hint = 'No ' + label.toLowerCase() + ' URL yet — add it to profile.links in js/data.js';
      if (style === 'plain') {
        return '<span class="is-placeholder" aria-disabled="true" title="' + esc(hint) + '">' +
          glyphBox + '<span>' + esc(label) + ': [add URL]</span></span>';
      }
      return '<span class="is-placeholder" aria-disabled="true" title="' + esc(hint) + '">' +
        glyphBox + esc(label) + ' — [add URL]</span>';
    }

    return '<a href="' + esc(link.url) + '" target="_blank" rel="noopener noreferrer"' +
      (style === 'plain' ? ' class="footer-link"' : '') + '>' + glyphBox + esc(label) +
      '<span class="visually-hidden"> (opens in a new tab)</span></a>';
  }

  function renderLinkList(selector, links, style) {
    var host = qs(selector);
    if (!host) return;
    var items = Array.isArray(links) ? links : [];
    if (!items.length) {
      host.innerHTML = '<li><span class="is-placeholder" aria-disabled="true">' +
        '[no profile links yet — add them to profile.links in js/data.js]</span></li>';
      return;
    }
    host.innerHTML = items.map(function (l) {
      return '<li>' + linkMarkup(l, style) + '</li>';
    }).join('');
  }

  function renderFooterEmail() {
    var host = qs('#footer-email');
    if (!host) return;
    if (isUsableEmail(profile.email)) {
      host.innerHTML = '<a href="mailto:' + esc(String(profile.email).trim()) + '">' +
        esc(profile.email) + '</a>';
    } else {
      host.innerHTML = '<span class="is-placeholder" aria-disabled="true">' +
        'Email: [add profile.email in js/data.js]</span>';
    }
  }

  function renderFocusList(selector, items) {
    var host = qs(selector);
    if (!host) return;
    var list = Array.isArray(items) ? items : [];
    if (!list.length) { host.hidden = true; return; }
    host.innerHTML = list.map(function (i) { return '<li>' + rich(i) + '</li>'; }).join('');
  }

  function renderPrinciples(selector, items) {
    var host = qs(selector);
    if (!host) return;
    var list = Array.isArray(items) ? items : [];
    if (!list.length) {
      var panel = host.closest('.panel');
      if (panel) panel.hidden = true;
      return;
    }
    host.innerHTML = list.map(function (i) { return '<li>' + rich(i) + '</li>'; }).join('');
  }

  /* ------------------------------------------------------------------------
     5. EDUCATION & CERTIFICATIONS TIMELINE — hidden while the list is empty
     ---------------------------------------------------------------------- */
  function renderTimeline(blockSelector, listSelector, items) {
    var block = qs(blockSelector);
    var host = qs(listSelector);
    if (!block || !host) return;
    var list = Array.isArray(items) ? items : [];
    if (!list.length) { block.hidden = true; return; }
    block.hidden = false;

    function card(entry) {
      return '<li class="cred">' +
        (entry.period ? '<span class="cred__period">' + rich(entry.period) + '</span>' : '') +
        '<p class="cred__title">' + rich(entry.title || '[Qualification]') + '</p>' +
        '<p class="cred__org">' + rich(entry.org || '[Organisation]') + '</p>' +
        (entry.description ? '<p class="cred__desc">' + rich(entry.description) + '</p>' : '') +
        '</li>';
    }
    function column(title, mark, entries) {
      if (!entries.length) return '';
      return '<section class="cred-col" aria-label="' + esc(title) + '">' +
        '<h4 class="cred-col__title"><span class="cred-col__mark" aria-hidden="true">' + mark + '</span>' +
        esc(title) + '<span class="cred-col__count">' + entries.length + '</span></h4>' +
        '<ul class="cred-list">' + entries.map(card).join('') + '</ul></section>';
    }
    var edu = list.filter(function (e) { return e.type === 'Education'; });
    var certs = list.filter(function (e) { return e.type === 'Certification'; });
    host.innerHTML = column('Education', 'EDU', edu) + column('Certifications', 'CERT', certs);
  }

  /* ------------------------------------------------------------------------
     6. SKILLS
     ---------------------------------------------------------------------- */
  function renderSkills(selector, categories) {
    var host = qs(selector);
    if (!host) return;
    if (!categories.length) {
      host.innerHTML = '<p class="placeholder-note">[No skill categories defined — ' +
        'add them to <code>skillCategories</code> in <code>js/data.js</code>.]</p>';
      return;
    }
    host.innerHTML = categories.map(function (cat, index) {
      var chips = (Array.isArray(cat.items) ? cat.items : []).map(function (item) {
        var name = typeof item === 'string' ? item : item.name;
        var level = typeof item === 'string' ? '' : item.level;
        return '<li><span class="chip chip--tag">' + rich(name) +
          (level ? ' <span class="skill-level">· ' + rich(level) + '</span>' : '') +
          '</span></li>';
      }).join('');
      return '<article class="skill-card reveal" style="--reveal-i:' + Math.min(index, 6) + '">' +
        '<header class="skill-card__head">' +
        '<h3 class="skill-card__title">' + rich(cat.title || '[Category]') + '</h3>' +
        (cat.note ? '<p class="skill-card__note">' + rich(cat.note) + '</p>' : '') +
        '</header>' +
        '<ul class="skill-list">' + chips + '</ul>' +
        '</article>';
    }).join('');
  }

  /* ------------------------------------------------------------------------
     7. PROJECTS + FILTERS
     ---------------------------------------------------------------------- */
  var state = { filter: 'All', openId: null, lastTrigger: null };

  function projectCategories() {
    var preferred = ['Laravel', 'API', 'Other'];
    var found = [];
    projects.forEach(function (p) {
      (Array.isArray(p.categories) ? p.categories : []).forEach(function (c) {
        var name = String(c).trim();
        if (name && found.indexOf(name) === -1) found.push(name);
      });
    });
    var ordered = preferred.filter(function (c) { return found.indexOf(c) !== -1; });
    var extras = found.filter(function (c) { return ordered.indexOf(c) === -1; })
      .sort(function (a, b) { return a.localeCompare(b); });
    return ordered.concat(extras);
  }

  function countFor(filter) {
    if (filter === 'All') return projects.length;
    return projects.filter(function (p) {
      return (Array.isArray(p.categories) ? p.categories : [])
        .some(function (c) { return String(c).trim() === filter; });
    }).length;
  }

  function renderFilters() {
    var host = qs('#filters');
    if (!host) return;
    var cats = projectCategories();
    var all = ['All'].concat(cats); // "All" is always present so the state is never orphaned

    host.innerHTML = all.map(function (cat) {
      var pressed = cat === state.filter ? 'true' : 'false';
      var count = countFor(cat);
      return '<button type="button" class="filter" data-filter="' + esc(cat) + '"' +
        ' aria-pressed="' + pressed + '">' + esc(cat) +
        ' <span class="filter__count" aria-hidden="true">' + count + '</span>' +
        '<span class="visually-hidden">' + count + (count === 1 ? ' project' : ' projects') + '</span>' +
        '</button>';
    }).join('');

    host.addEventListener('click', function (event) {
      var btn = event.target.closest('.filter');
      if (!btn) return;
      setFilter(btn.dataset.filter);
    });
  }

  function setFilter(cat) {
    state.filter = cat;
    qsa('.filter').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.filter === cat));
    });
    applyFilter();
    playFilterWave();
  }

  // The visible order feeds the CSS stagger (--reveal-i), so a filter change
  // arrives as a wave instead of a swap.
  var filterWaveTimer = 0;
  function playFilterWave() {
    if (prefersReducedMotion()) return;
    var grid = qs('#project-grid');
    if (!grid) return;
    grid.classList.remove('is-filtering');
    void grid.offsetWidth; // force a reflow so the animation restarts
    grid.classList.add('is-filtering');
    window.clearTimeout(filterWaveTimer);
    filterWaveTimer = window.setTimeout(function () {
      grid.classList.remove('is-filtering');
    }, 900);
  }

  function cardMarkup(project, index) {
    var cats = (Array.isArray(project.categories) ? project.categories : [])
      .map(function (c) { return '<span class="card__cat">' + rich(c) + '</span>'; }).join('');
    var tags = (Array.isArray(project.tags) ? project.tags : [])
      .map(function (t) { return '<span class="chip chip--tag">' + rich(t) + '</span>'; }).join('');

    function actionLink(url, label, primary, glyph) {
      return '<a class="card__action ' + (primary ? 'card__action--primary' : '') + '" href="' + esc(url) +
        '" target="_blank" rel="noopener noreferrer"><span class="card__action-glyph" aria-hidden="true">' + glyph +
        '</span>' + esc(label) + '<span class="visually-hidden"> for ' + esc(project.title || 'this project') +
        ' (opens in a new tab)</span></a>';
    }
    var actionList = [];
    if (isUsableUrl(project.links && project.links.demo)) actionList.push(actionLink(project.links.demo, 'Live demo', true, '▶'));
    if (Array.isArray(project.extraLinks) && project.extraLinks.length) {
      project.extraLinks.forEach(function (l) { actionList.push(actionLink(l.url, l.label, false, '&lt;/&gt;')); });
    } else if (isUsableUrl(project.links && project.links.repo)) {
      actionList.push(actionLink(project.links.repo, 'Source code', false, '&lt;/&gt;'));
    }
    var realLinks = actionList.length
      ? '<div class="card__actions card__actions--' + Math.min(actionList.length, 2) + '">' + actionList.join('') + '</div>' : '';

    var metaBits = [project.year, project.status].filter(function (v) {
      return v && String(v).trim() !== '';
    }).map(rich).join(' · ');

    var sampleBadge = (project.sample && site.markSamplesAsPlaceholders)
      ? '<p class="badge badge--sample">Placeholder sample</p>' : '';

    return '<article class="card reveal" data-index="' + index + '" data-id="' + esc(project.id) + '"' +
      ' data-categories="' + esc((project.categories || []).join('|')) + '">' +
      '<header class="card__top">' +
      '<span class="card__mono" aria-hidden="true">' + esc(initials(project.title)) + '</span>' +
      '<span class="card__cats">' + cats + '</span>' +
      '</header>' +
      (sampleBadge ? '<div>' + sampleBadge + '</div>' : '') +
      '<h3 class="card__title"><button type="button" class="card__link" data-open-project="' +
      esc(project.id) + '" aria-haspopup="dialog">' + rich(project.title || '[Project Name]') +
      '</button></h3>' +
      (project.subtitle ? '<p class="card__subtitle">' + rich(project.subtitle) + '</p>' : '') +
      '<p class="card__summary">' + rich(project.summary || '[Add a short description]') + '</p>' +
      '<div class="card__tags">' + tags + '</div>' +
      realLinks +
      '<footer class="card__foot">' +
      '<span class="card__meta">' + (metaBits || '') + '</span>' +
      '<button type="button" class="card__details" data-open-project="' + esc(project.id) + '"' +
      ' aria-haspopup="dialog">View details' +
      '<span class="visually-hidden"> for ' + rich(project.title || 'this project') + '</span>' +
      '<span class="card__details-arrow" aria-hidden="true">→</span></button>' +
      '</footer>' +
      '</article>';
  }

  function renderProjects() {
    var grid = qs('#project-grid');
    if (!grid) return;

    if (!projects.length) {
      grid.innerHTML = '';
      var empty = qs('#empty-state');
      if (empty) {
        empty.hidden = false;
        var body = qs('.empty-state__body', empty);
        if (body) body.innerHTML =
          'The <code>projects</code> array in <code>js/data.js</code> is empty. ' +
          'Add your first real project there.';
      }
      var status = qs('#results-status');
      if (status) status.textContent = 'No projects to show yet.';
      return;
    }

    grid.innerHTML = projects.map(cardMarkup).join('');

    grid.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-open-project]');
      if (!trigger) return;
      openProject(trigger.dataset.openProject, trigger);
    });

    applyFilter();
  }

  function applyFilter() {
    var cards = qsa('#project-grid .card');
    var shown = 0;
    cards.forEach(function (card) {
      var cats = card.dataset.categories ? card.dataset.categories.split('|') : [];
      var match = state.filter === 'All' || cats.indexOf(state.filter) !== -1;
      card.hidden = !match;
      if (match) {
        card.style.setProperty('--reveal-i', String(Math.min(shown, 6)));
        shown += 1;
      }
    });

    var empty = qs('#empty-state');
    if (empty) {
      empty.hidden = shown !== 0;
      var label = qs('[data-empty-label]', empty);
      if (label) label.textContent = '“' + state.filter + '”';
    }

    var status = qs('#results-status');
    if (status) {
      status.textContent = shown === 0
        ? 'No projects match “' + state.filter + '”.'
        : 'Showing ' + shown + ' of ' + cards.length + ' project' + (cards.length === 1 ? '' : 's') +
          (state.filter === 'All' ? '' : ' in “' + state.filter + '”') + '.';
    }
  }

  /* ------------------------------------------------------------------------
     8. PROJECT DETAIL DIALOG — focus trapped, Escape closes, focus returns
     ---------------------------------------------------------------------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

  function dialogElements() {
    return {
      dialog: qs('#project-dialog'),
      panel: qs('#dialog-panel'),
      body: qs('#dialog-body'),
      title: qs('#dialog-title'),
      kicker: qs('#dialog-kicker'),
      meta: qs('#dialog-meta'),
      badge: qs('#dialog-badge'),
      links: qs('#dialog-links'),
      close: qs('#dialog-close')
    };
  }

  function dialogLink(kind, url, label) {
    var isDemo = kind === 'demo';
    var glyph = isDemo ? '<span aria-hidden="true">▶</span> ' : '<span aria-hidden="true">&lt;/&gt;</span> ';
    var cls = 'button button--small ' + (isDemo ? 'button--primary' : 'button--ghost');
    if (isUsableUrl(url)) {
      return '<a class="' + cls + '" href="' + esc(url) +
        '" target="_blank" rel="noopener noreferrer">' + glyph + esc(label) +
        '<span class="visually-hidden"> (opens in a new tab)</span></a>';
    }
    return '';
  }

  function fillDialog(project) {
    var el = dialogElements();

    el.title.innerHTML = rich(project.title || '[Project Name]');
    el.kicker.textContent = 'Project detail';
    el.meta.innerHTML = [project.year, project.status, project.role]
      .filter(function (v) { return v && String(v).trim() !== ''; })
      .map(rich).join(' · ');

    if (el.badge) {
      el.badge.hidden = !(project.sample && site.markSamplesAsPlaceholders);
    }

    var sections = [];

    sections.push(section('Overview', textOrPlaceholder(project.overview, 'project.overview')));
    if (project.problem) sections.push(section('Problem', textOrPlaceholder(project.problem, 'project.problem')));
    if (project.solution) sections.push(section('Solution', textOrPlaceholder(project.solution, 'project.solution')));

    (Array.isArray(project.sections) ? project.sections : []).forEach(function (sec) {
      if (sec && sec.title && sec.text) sections.push(section(sec.title, '<p>' + rich(sec.text) + '</p>'));
    });

    var features = Array.isArray(project.features) ? project.features : [];
    sections.push(section('Key features', features.length
      ? '<ul class="feature-list">' + features.map(function (f) {
        return '<li>' + rich(f) + '</li>';
      }).join('') + '</ul>'
      : '<p class="missing">[not provided — add project.features in js/data.js]</p>'));

    var tech = Array.isArray(project.tags) ? project.tags : [];
    sections.push(section('Technologies', tech.length
      ? '<div class="tech-row">' + tech.map(function (t) {
        return '<span class="chip chip--tag">' + rich(t) + '</span>';
      }).join('') + '</div>'
      : '<p class="missing">[not provided — add project.tags in js/data.js]</p>'));

    var highlights = Array.isArray(project.highlights) ? project.highlights : [];
    if (highlights.length) {
      sections.push(section('Results', '<div class="tech-row">' + highlights.map(function (h) {
        return '<span class="chip">' + rich(h) + '</span>';
      }).join('') + '</div>'));
    }
    if (project.results) {
      sections.push(section('Outcomes', textOrPlaceholder(project.results, 'project.results')));
    }

    el.body.innerHTML = sections.join('');

    var links = project.links || {};
    var LABELS = { demo: 'Live demo', repo: 'Source code', caseStudy: 'Case study' };
    var row = Object.keys(LABELS)
      // Only offer a button when the key exists in your data: an omitted
      // "caseStudy" stays hidden, an empty "caseStudy: ''" shows "[not set]".
      .filter(function (key) {
        return isUsableUrl(links[key]);
      })
      .map(function (key) { return dialogLink(key, links[key], LABELS[key]); })
      .join('');
    if (Array.isArray(project.extraLinks) && project.extraLinks.length) {
      row = project.extraLinks.map(function (l) { return dialogLink('repo', l.url, 'Source: ' + l.label); }).join('');
    }
    el.links.innerHTML = row || '<span class="missing" style="margin:0">[no links yet — add project.links in js/data.js]</span>';
  }

  function section(heading, inner) {
    return '<div class="dialog__section"><h3>' + esc(heading) + '</h3>' + inner + '</div>';
  }

  function focusables() {
    var el = dialogElements();
    return qsa(FOCUSABLE, el.panel).filter(function (node) {
      return node.offsetWidth > 0 || node.offsetHeight > 0 || node === document.activeElement;
    });
  }

  function openProject(id, trigger) {
    var project = projects.filter(function (p) { return String(p.id) === String(id); })[0];
    if (!project) return;
    var el = dialogElements();
    if (!el.dialog) return;

    state.lastTrigger = trigger || null;
    state.openId = String(id);

    fillDialog(project);
    el.dialog.hidden = false;
    document.body.classList.add('is-modal-open');
    el.body.scrollTop = 0;
    // preventScroll: focusing the scroll container can otherwise jump it down
    el.body.focus({ preventScroll: true });
    el.body.scrollTop = 0;

    // Mirror the open project in the URL so it can be shared or bookmarked.
    // Guarded: file:// previews can refuse history calls, and the dialog must
    // still open even if they do.
    try {
      if (history.replaceState) history.replaceState(null, '', '#project-' + encodeURIComponent(id));
    } catch (e) { /* no history access — the dialog simply is not deep-linked */ }
  }

  function closeProject(returnFocus) {
    var el = dialogElements();
    if (!el.dialog || el.dialog.hidden) return;

    el.dialog.hidden = true;
    document.body.classList.remove('is-modal-open');
    state.openId = null;

    try {
      if (history.replaceState) {
        history.replaceState(null, '', location.pathname + location.search);
      } else {
        location.hash = '';
      }
    } catch (e) { /* ignore */ }

    if (returnFocus !== false && state.lastTrigger && document.contains(state.lastTrigger)) {
      state.lastTrigger.focus();
    }
    state.lastTrigger = null;
  }

  function initDialog() {
    var el = dialogElements();
    if (!el.dialog) return;

    el.body.setAttribute('tabindex', '-1');

    el.dialog.addEventListener('click', function (event) {
      if (event.target.closest('[data-close-dialog]')) closeProject(true);
    });

    document.addEventListener('keydown', function (event) {
      if (el.dialog.hidden) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeProject(true);
        return;
      }

      if (event.key === 'Tab') {
        var nodes = focusables();
        if (!nodes.length) { event.preventDefault(); return; }
        var first = nodes[0];
        var last = nodes[nodes.length - 1];
        var active = document.activeElement;

        // Focus escaped behind the modal — pull it back inside.
        if (!el.panel.contains(active)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
          return;
        }
        if (event.shiftKey && active === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
      }
    });

    // Close when the URL stops pointing at a project (back button, manual edit).
    window.addEventListener('hashchange', function () {
      if (location.hash.indexOf('#project-') !== 0) closeProject(false);
    });

    // "Show all projects" in the empty state.
    var reset = qs('#empty-reset');
    if (reset) reset.addEventListener('click', function () {
      setFilter('All');
      var first = qs('.filter');
      if (first) first.focus();
    });

    // Deep link support: index.html#project-your-id opens that dialog.
    var hash = location.hash;
    if (hash.indexOf('#project-') === 0) {
      var id = decodeURIComponent(hash.slice(9));
      var trigger = qs('#project-grid [data-open-project="' + id.replace(/"/g, '\\"') + '"]');
      if (trigger) openProject(id, trigger);
    }
  }

  /* ------------------------------------------------------------------------
     9. CONTACT SECTION + FORM
     ---------------------------------------------------------------------- */
  function renderContactChannels() {
    var host = qs('#contact-list');
    if (!host) return;
    var rows = [];

    if (isUsableEmail(profile.email)) {
      rows.push('<li class="contact-item"><span class="contact-item__label" aria-hidden="true">@</span>' +
        '<a class="contact-item__value" href="mailto:' + esc(profile.email.trim()) + '">' +
        esc(profile.email) + '</a></li>');
    } else {
      rows.push('<li class="contact-item"><span class="contact-item__label" aria-hidden="true">@</span>' +
        '<span class="contact-item__value is-placeholder">Email — add <code>profile.email</code> in ' +
        '<code>js/data.js</code>. The form stays disabled until you do.</span></li>');
    }

    if (String(profile.phone || '').trim() !== '') {
      rows.push('<li class="contact-item"><span class="contact-item__label" aria-hidden="true">tel</span>' +
        richPhone(profile.phone) + '</li>');
    }
    if (String(profile.location || '').trim() !== '') {
      rows.push('<li class="contact-item"><span class="contact-item__label" aria-hidden="true">⌂</span>' +
        '<span class="contact-item__value">' + rich(profile.location) + '</span></li>');
    }

    (Array.isArray(profile.links) ? profile.links : []).forEach(function (link) {
      if (!isUsableUrl(link.url)) {
        rows.push('<li class="contact-item"><span class="contact-item__label" aria-hidden="true">' +
          esc(GLYPHS[String(link.kind || '').toLowerCase()] || '↗') + '</span>' +
          '<span class="contact-item__value is-placeholder">' + esc(link.label || 'Link') +
          ': [add your URL in js/data.js]</span></li>');
        return;
      }
      rows.push('<li class="contact-item"><span class="contact-item__label" aria-hidden="true">' +
        esc(GLYPHS[String(link.kind || '').toLowerCase()] || '↗') + '</span>' +
        '<a href="' + esc(link.url) + '" target="_blank" rel="noopener noreferrer">' +
        esc(link.label || 'Profile') + '<span class="visually-hidden"> (' +
        esc(link.url) + ', opens in a new tab)</span></a></li>');
    });

    host.innerHTML = rows.join('');
  }

  function richPhone(phone) {
    var digits = String(phone).replace(/[^\d+]/g, '');
    if (digits.length > 6 && !isPlaceholderText(phone)) {
      return '<a class="contact-item__value" href="tel:' + esc(digits) + '">' + esc(phone) + '</a>';
    }
    return '<span class="contact-item__value">' + rich(phone) + '</span>';
  }

  function initForm() {
    var form = qs('#contact-form');
    if (!form) return;

    var fields = {
      name: qs('#contact-name'),
      email: qs('#contact-email'),
      subject: qs('#contact-subject'),
      message: qs('#contact-message')
    };
    var errEls = {
      name: qs('#error-name'),
      email: qs('#error-email'),
      subject: qs('#error-subject'),
      message: qs('#error-message')
    };
    var successEl = qs('#form-success');
    var errorEl = qs('#form-error');
    var fallbackHost = qs('#fallback-mail');
    var touched = false;

    function setError(key, message) {
      var input = fields[key];
      var el = errEls[key];
      if (!input || !el) return;
      if (message) {
        el.textContent = message;
        el.hidden = false;
        input.setAttribute('aria-invalid', 'true');
      } else {
        el.textContent = '';
        el.hidden = true;
        input.removeAttribute('aria-invalid');
      }
    }

    function showSuccess(text) {
      errorEl.hidden = true;
      successEl.textContent = text;
      successEl.hidden = false;
    }
    function showError(text) {
      successEl.hidden = true;
      errorEl.textContent = text;
      errorEl.hidden = false;
    }
    function clearFeedback() {
      successEl.hidden = true;
      errorEl.hidden = true;
    }

    function validate() {
      var problems = [];
      var values = {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        subject: fields.subject.value.trim(),
        message: fields.message.value.trim()
      };

      ['name', 'email', 'subject', 'message'].forEach(function (k) { setError(k, ''); });

      if (values.name.length < 2) problems.push(['name', 'Please type your name (2 characters or more).']);
      if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(values.email)) {
        problems.push(['email', 'Please type a valid email address, e.g. you@example.com.']);
      }
      var min = formConfig.minMessageLength || 10;
      var max = formConfig.maxMessageLength || 4000;
      if (values.message.length < min) {
        problems.push(['message', 'Please add a little more detail (at least ' + min + ' characters).']);
      } else if (values.message.length > max) {
        problems.push(['message', 'Please shorten this to ' + max + ' characters or fewer.']);
      }

      problems.forEach(function (p) { setError(p[0], p[1]); });
      return {
        ok: problems.length === 0,
        problems: problems,
        values: values,
        firstBad: problems.length ? fields[problems[0][0]] : null
      };
    }

    function buildMailto(v) {
      var to = String(profile.email).trim();
      var prefix = formConfig.subjectPrefix || 'Portfolio message from';
      var fallbackSubject = formConfig.defaultSubject || 'Project enquiry';
      var subject = (v.subject || fallbackSubject) + ' — ' + prefix + ' ' + v.name;
      var body = [
        v.message,
        '',
        '--',
        'From: ' + v.name + ' <' + v.email + '>',
        v.subject ? 'Subject: ' + v.subject : '',
        'Sent from the portfolio contact form.'
      ].filter(function (line) { return line !== ''; }).join('\r\n');

      // The address itself stays un-encoded (percent-encoding the "@" breaks
      // some mail clients); only the subject and body are encoded.
      return 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    }

    // Keep the always-available fallback link honest.
    function refreshFallback() {
      if (!fallbackHost) return;
      if (isUsableEmail(profile.email)) {
        var plain = 'mailto:' + String(profile.email).trim() +
          '?subject=' + encodeURIComponent(formConfig.defaultSubject || 'Project enquiry');
        fallbackHost.innerHTML = '<a href="' + esc(plain) + '">email ' +
          esc(profile.email) + ' directly</a>';
      } else {
        fallbackHost.innerHTML = 'set your address in <code>js/data.js</code> → <code>profile.email</code>';
      }
    }
    refreshFallback();

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      touched = true;
      clearFeedback();

      var result = validate();
      if (!result.ok) {
        showError('Please check the ' + result.problems.length +
          ' highlighted field' + (result.problems.length > 1 ? 's' : '') +
          ' above, then send again.');
        if (result.firstBad) result.firstBad.focus();
        return;
      }

      if (!isUsableEmail(profile.email)) {
        showError('This site has no email address configured yet. ' +
          'Add profile.email in js/data.js, then the form will open your mail app.');
        return;
      }

      var endpoint = String(formConfig.endpoint || '').trim();

      if (isUsableUrl(endpoint)) {
        var payload = new FormData();
        payload.append('name', result.values.name);
        payload.append('email', result.values.email);
        payload.append('subject', result.values.subject || (formConfig.defaultSubject || 'Project enquiry'));
        payload.append('message', result.values.message);

        showSuccess('Sending…');
        fetch(endpoint, { method: 'POST', body: payload, headers: { Accept: 'application/json' } })
          .then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            form.reset();
            showSuccess('Message sent. Thank you — ' + result.values.name + ', I will reply to ' +
              result.values.email + '.');
          })
          .catch(function () {
            showError('The form service did not respond. Use the direct email link below instead.');
          });
        return;
      }

      // Static-host behaviour: hand the message to the visitor's mail app.
      var url = buildMailto(result.values);
      try {
        window.location.href = url;
        showSuccess('Opening your email app with the message filled in. ' +
          'Nothing was sent by this site — GitHub Pages is static, so press Send in your mail app. ' +
          'If nothing opened, use the direct link below.');
      } catch (e) {
        showError('Your browser blocked the mail window. Use the direct email link below instead.');
      }
    });

    form.addEventListener('input', function (event) {
      if (!touched) return;
      var key = event.target.name;
      if (key && errEls[key] && !errEls[key].hidden) validate();
    });

    form.addEventListener('reset', function () {
      ['name', 'email', 'subject', 'message'].forEach(function (k) { setError(k, ''); });
      clearFeedback();
      touched = false;
    });
  }

  /* ------------------------------------------------------------------------
     9b. PORTRAIT SLOT
     Two honest states: a file you committed (profile.photo) or a labelled
     empty frame. The optional picker previews an image on THIS device with
     FileReader and may remember it in localStorage — it never uploads, and
     other visitors can never see it.
     ---------------------------------------------------------------------- */
  var PHOTO_STORE_KEY = 'portfolio-portrait-preview';
  var PHOTO_STORE_LIMIT = 700 * 1024; // ~0.7 MB of base64 text is the keep-it budget

  function initPortrait() {
    var root = qs('#portrait');
    var img = qs('#portrait-img');
    var empty = qs('#portrait-empty');
    var emptyLabel = qs('#portrait-empty-label');
    var badge = qs('#portrait-badge');
    var hint = qs('#portrait-hint');
    var fileInput = qs('#portrait-file');
    var clearBtn = qs('#portrait-clear');
    var statusEl = qs('#portrait-status');
    if (!root || !img || !empty) return;

    var configured = String(profile.photo == null ? '' : profile.photo).trim();
    var hasConfigured = configured !== '' && !isPlaceholderText(configured);
    var publishedWorks = false;

    var HOW_TO =
      'Set <code>profile.photo</code> in <code>js/data.js</code> to something like ' +
      '<code>assets/me.jpg</code>, then put the file in the <code>assets/</code> folder. ' +
      'Sizes and formats: <code>assets/README.md</code>.';

    var MISSING_NOTE =
      'No readable image at <code>' + esc(configured) + '</code>. Put the file at that exact ' +
      'path — folder and file names are case sensitive on GitHub Pages — or change ' +
      '<code>profile.photo</code> in <code>js/data.js</code>.';

    var PUBLISHED_NOTE =
      'Loaded from <code>' + esc(configured) + '</code>. Overwrite that file to change the ' +
      'picture, and keep <code>profile.photoAlt</code> describing it.';

    var PREVIEW_NOTE =
      'Local preview from this device. Nothing was uploaded: visitors only see an image you ' +
      'commit to <code>assets/</code> and point <code>profile.photo</code> at.';

    function altText() {
      var alt = String(profile.photoAlt == null ? '' : profile.photoAlt).trim();
      if (alt !== '' && !isPlaceholderText(alt)) return alt;
      if (!isPlaceholderText(profile.name)) {
        return 'Portrait photograph of ' + String(profile.name).trim();
      }
      return 'Portrait photograph of the site owner';
    }

    function announce(message) {
      if (statusEl) statusEl.textContent = message;
    }

    function isImageData(value) {
      return /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
    }

    function readStore() {
      try { return String(window.localStorage.getItem(PHOTO_STORE_KEY) || ''); }
      catch (e) { return ''; } // private mode / storage blocked
    }

    function showEmptyFrame(label, noteHtml) {
      root.dataset.photoState = hasConfigured ? 'missing' : 'empty';
      img.hidden = true;
      img.removeAttribute('src');
      img.removeAttribute('alt');
      empty.hidden = false;
      if (emptyLabel) emptyLabel.textContent = label;
      if (hint) hint.innerHTML = noteHtml;
      if (badge) badge.hidden = true;
      if (clearBtn) clearBtn.hidden = true;
    }

    function showPhoto(src, state, noteHtml) {
      root.dataset.photoState = state;
      img.alt = altText();
      img.src = src;
      img.hidden = false;
      empty.hidden = true;
      if (hint) hint.innerHTML = noteHtml;
      if (badge) badge.hidden = state !== 'preview';
      if (clearBtn) clearBtn.hidden = state !== 'preview';
    }

    function revertToNoPublished() {
      if (hasConfigured) showEmptyFrame('Photo not found', MISSING_NOTE);
      else showEmptyFrame('Mahmoud Elhadad', HOW_TO);
    }

    function restorePreview() {
      var stored = readStore();
      if (!isImageData(stored)) return false;
      showPhoto(stored, 'preview', PREVIEW_NOTE);
      return true;
    }

    // 1. the committed file wins if it exists…
    if (hasConfigured) {
      var probe = new Image();
      probe.onload = function () {
        if (!probe.naturalWidth) {
          showEmptyFrame('Photo not found', MISSING_NOTE);
          restorePreview();
          return;
        }
        publishedWorks = true;
        showPhoto(configured, 'published', PUBLISHED_NOTE);
      };
      probe.onerror = function () {
        showEmptyFrame('Photo not found', MISSING_NOTE);
        restorePreview();
      };
      probe.src = configured;
    } else {
      // 2. …then a preview this browser remembers…
      if (!restorePreview()) {
        // 3. …then say plainly that no photo has been added yet.
        revertToNoPublished();
      }
    }

    if (fileInput) {
      fileInput.addEventListener('change', function () {
        var picked = fileInput.files && fileInput.files[0];
        if (!picked) return;

        if (!/^image\//i.test(picked.type || '')) {
          announce('That file is not an image. Choose a JPG, PNG, WebP or GIF.');
          fileInput.value = '';
          return;
        }

        var reader = new FileReader();
        reader.onload = function () {
          fileInput.value = '';
          var data = String(reader.result || '');
          if (!isImageData(data)) {
            announce('Your browser could not read that file as an image. Try exporting a smaller JPG.');
            return;
          }
          showPhoto(data, 'preview', PREVIEW_NOTE);

          var kept = false;
          if (data.length <= PHOTO_STORE_LIMIT) {
            try {
              window.localStorage.setItem(PHOTO_STORE_KEY, data);
              kept = true;
            } catch (e) { kept = false; }
          }
          announce(kept
            ? 'Previewing “' + picked.name + '” (' + Math.round(picked.size / 1024) +
              ' KB). It is kept in this browser only — nothing was uploaded, and no visitor can see it.'
            : 'Previewing “' + picked.name + '” for this visit only: it is over about ' +
              Math.round(PHOTO_STORE_LIMIT / 1024) + ' KB, so it is not remembered after a reload. ' +
              'Compress it or commit it to assets/ instead.');
        };
        reader.onerror = function () {
          fileInput.value = '';
          announce('That file could not be opened. Try a different image.');
        };
        reader.readAsDataURL(picked);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        try { window.localStorage.removeItem(PHOTO_STORE_KEY); } catch (e) { /* nothing to forget */ }
        if (publishedWorks) showPhoto(configured, 'published', PUBLISHED_NOTE);
        else revertToNoPublished();
        announce('Preview removed from this browser.');
      });
    }
  }

  /* ------------------------------------------------------------------------
     10. NAVIGATION ACTIVE STATE + SUBTLE REVEAL
     ---------------------------------------------------------------------- */
  function initScrollSpy() {
    var links = qsa('.nav-link');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) map[id] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    Object.keys(map).forEach(function (id) {
      var section = document.getElementById(id);
      observer.observe(section);
    });
  }

  function initReveal() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    document.body.classList.add('reveal-js');
    qsa('.section__head, .hero-copy, .panel, .card, .skill-card, .contact-form, .filter-bar')
      .forEach(function (el) { el.classList.add('reveal'); });

    function show(el) { el.classList.add('is-visible'); }

    // Anything already inside the viewport becomes visible immediately.
    function revealInViewport() {
      var limit = window.innerHeight || document.documentElement.clientHeight;
      qsa('.reveal:not(.is-visible)').forEach(function (el) {
        var box = el.getBoundingClientRect();
        if (box.top < limit * 0.92 && box.bottom > 0) show(el);
      });
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          show(entry.target);
          obs.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

      qsa('.reveal').forEach(function (el) { observer.observe(el); });

      // Safety nets: a scroll observer can be throttled or missed entirely in
      // unusual environments, and invisible content is never acceptable.
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          ticking = false;
          revealInViewport();
        });
      }, { passive: true });
      window.addEventListener('resize', revealInViewport);

      // Absolute fallback: after 4s everything is simply shown.
      window.setTimeout(function () { qsa('.reveal').forEach(show); }, 4000);
    } else {
      qsa('.reveal').forEach(show);
    }

    revealInViewport();
  }

  /* ------------------------------------------------------------------------
     10b. MOTION LAYER — all of it is decoration, none of it is needed to
          read the page, and every piece is skipped for reduced motion.
     ---------------------------------------------------------------------- */
  function initMotionLayer() {
    /* Reading progress: a hairline under the sticky header. */
    var bar = qs('#scroll-progress-bar');
    if (bar) {
      var header = qs('.site-header');
      var updateProgress = function () {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var ratio = max > 0 ? Math.min(1, Math.max(0, (window.pageYOffset || doc.scrollTop) / max)) : 0;
        bar.style.setProperty('--progress', ratio.toFixed(4));
        if (header) header.dataset.scrolled = ratio > 0.02 ? 'yes' : 'no';
      };
      var progressTick = false;
      window.addEventListener('scroll', function () {
        if (progressTick) return;
        progressTick = true;
        window.requestAnimationFrame(function () {
          progressTick = false;
          updateProgress();
        });
      }, { passive: true });
      window.addEventListener('resize', updateProgress);
      updateProgress();
    }

    /* Cursor spotlight on project cards: pointer-driven, so hover devices only. */
    var grid = qs('#project-grid');
    if (grid && !prefersReducedMotion() && window.matchMedia &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      grid.addEventListener('pointermove', function (event) {
        var card = event.target.closest ? event.target.closest('.card') : null;
        if (!card) return;
        var box = card.getBoundingClientRect();
        if (!box.width || !box.height) return;
        card.style.setProperty('--px', (((event.clientX - box.left) / box.width) * 100).toFixed(1) + '%');
        card.style.setProperty('--py', (((event.clientY - box.top) / box.height) * 100).toFixed(1) + '%');
      }, { passive: true });
    }
  }

  /* Stats strip: numbers count up (or down) once when they scroll into view. */
  function renderStats() {
    var host = qs('#stats');
    var list = Array.isArray(window.PORTFOLIO.stats) ? window.PORTFOLIO.stats : [];
    if (!host) return;
    if (!list.length) { host.remove(); return; }
    host.innerHTML = list.map(function (st, i) {
      var end = st.value === 'projects' ? projects.length : Number(st.value);
      var start = st.from != null ? Number(st.from) : 0;
      var dec = st.decimals || 0;
      return '<li class="stat reveal" style="--reveal-i:' + i + '">' +
        '<span class="stat__value" data-from="' + start + '" data-to="' + end + '" data-dec="' + dec + '">' +
        end.toFixed(dec) + '</span><span class="stat__label">' + esc(st.label) + '</span></li>';
    }).join('');
  }

  function initCountUp() {
    var nodes = qsa('.stat__value');
    if (!nodes.length || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    function run(el) {
      var from = Number(el.dataset.from), to = Number(el.dataset.to), dec = Number(el.dataset.dec);
      var t0 = null, dur = 1100;
      function frame(t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - k, 3);
        el.textContent = (from + (to - from) * eased).toFixed(dec);
        if (k < 1) window.requestAnimationFrame(frame);
      }
      el.textContent = from.toFixed(dec);
      window.requestAnimationFrame(frame);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target); io.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* Extra polish: stagger, tilt on the CV preview, floating back-to-top. */
  function initPolish() {
    var groups = ['.cred-list', '.focus-list', '.skill-list', '.resume-points'];
    groups.forEach(function (sel) {
      qsa(sel).forEach(function (group) {
        Array.prototype.forEach.call(group.children, function (child, i) {
          child.classList.add('reveal');
          child.style.setProperty('--reveal-i', String(Math.min(i, 6)));
        });
      });
    });
    qsa('.resume-copy, .resume-preview, .cred-col__title').forEach(function (el) { el.classList.add('reveal'); });

    var top = qs('#to-top');
    if (top) {
      var bar = qs('#to-top-bar');
      var LEN = 131.95;
      var ticking = false;
      var update = function () {
        ticking = false;
        var y = window.pageYOffset || document.documentElement.scrollTop;
        var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        var show = y > 500;
        if (show) { top.hidden = false; requestAnimationFrame(function () { top.classList.add('is-visible'); }); }
        else { top.classList.remove('is-visible'); }
        if (bar) bar.style.strokeDashoffset = String(LEN * (1 - Math.min(1, y / max)));
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      top.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      });
      update();
    }

    // Portrait: tap to swap photos on touch screens (hover handles desktop)
    var pf = qs('.portrait__frame');
    if (pf && window.matchMedia && window.matchMedia('(hover: none)').matches) {
      pf.addEventListener('click', function () { pf.classList.toggle('is-alt'); });
    }

    var prev = qs('.resume-preview');
    if (prev && !prefersReducedMotion() && window.matchMedia &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      prev.addEventListener('pointermove', function (e) {
        var b = prev.getBoundingClientRect();
        var x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
        prev.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
        prev.style.setProperty('--ry', (x * 6).toFixed(2) + 'deg');
      });
      prev.addEventListener('pointerleave', function () {
        prev.style.setProperty('--rx', '0deg'); prev.style.setProperty('--ry', '0deg');
      });
    }
  }

  function initYear() {
    var el = qs('#year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  // The "everything in brackets is a placeholder" banner disappears once you
  // have replaced every placeholder on the page — it is a checklist, not décor.
  function refreshPlaceholderNotice() {
    var remaining = qsa('.ph').length + qsa('.is-placeholder').length;
    qsa('[data-placeholder-note]').forEach(function (el) {
      el.hidden = remaining === 0;
    });
  }

  /* ------------------------------------------------------------------------
     BOOT
     ---------------------------------------------------------------------- */
  function boot() {
    initTheme();
    initMenu();
    initAnchorFocus();
    initContent();
    initPortrait();
    renderContactChannels();
    renderFilters();
    renderProjects();
    initDialog();
    initForm();
    initYear();
    refreshPlaceholderNotice();
    initScrollSpy();
    renderStats();
    initPolish();
    initReveal();
    initMotionLayer();
    initCountUp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
