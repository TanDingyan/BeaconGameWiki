/* =========================================================
 * BeaconGame Wiki - 全局脚本
 * 职责：
 *   1. 计算站点根目录（子路径部署核心）
 *   2. 顶部导航栏 / 文档侧栏（均按根路径拼接，与页面层级无关）
 *   3. 浅色/深色主题切换 + localStorage 持久化
 *   4. 中/英语言切换 + localStorage 持久化（内容双份并存，靠 data-en 切换）
 *   5. 首页项目卡片（数据源 PROJECTS，含中英文案）
 *   6. 文档页滚动高亮（scroll spy）
 *
 * 铁律：全站不使用以 "/" 开头的绝对路径。
 * 双语实现：静态 HTML 里中文为默认内容，英文写在元素的 data-en 属性中；
 *           切换语言时由 applyTranslations() 在「中文原文」与「data-en」间替换 innerHTML。
 * ========================================================= */
(function () {
  'use strict';

  /* ============ 一、站点根目录解析 ============ */
  var SITE_ROOT = (function () {
    var manual = document.documentElement.getAttribute('data-site-root');
    if (manual) return manual.charAt(manual.length - 1) === '/' ? manual : manual + '/';
    var self = document.currentScript;
    if (self && self.src) {
      try { return new URL('../', new URL(self.src, location.href)).href; } catch (e) {}
    }
    return './';
  })();
  function url(path) { return SITE_ROOT + String(path).replace(/^\/+/, ''); }

  /* ============ 二、语言切换 ============ */
  var LANG_KEY = 'beacongame-lang';
  function getLang() { return document.documentElement.classList.contains('lang-en') ? 'en' : 'zh'; }

  // 把带 data-en 的元素在「中文原文」和「英文译文」间切换
  function applyTranslations(lang) {
    var nodes = document.querySelectorAll('[data-en]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!('zh' in el.dataset)) el.dataset.zh = el.innerHTML;  // 首次缓存中文原文
      el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.zh;
    }
  }
  function setLang(lang) {
    if (lang === 'en') document.documentElement.classList.add('lang-en');
    else document.documentElement.classList.remove('lang-en');
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    applyTranslations(lang);
    updateNavLang(lang);
    updateSidebarLang(lang);
    updateLangButton(lang);
    renderCards(currentTag);   // 项目卡片文案也随语言刷新
  }

  /* ============ 三、导航 / 侧栏数据（中英） ============ */
  var NAV_LINKS = [
    { zh: '首页',     en: 'Home',      href: 'index.html' },
    { zh: '游戏设计', en: 'Design',    href: 'design.html' },
    { zh: '更新日志', en: 'Changelog', href: 'changelog.html' },
    { zh: '赞助',     en: 'Donate',    href: 'index.html#donate' },
    { zh: '下载',     en: 'Download',  href: 'download/BeaconGame-6.5.jar' },
    // external: true 表示外链，跳过 url() 拼接、新标签打开
    { zh: '作品主页', en: 'Modrinth',  href: 'https://modrinth.com/plugin/beacongame', external: true }
  ];

  var SIDEBAR = [
    { zh: '一 · 总览与术语',     en: '1 · Overview & Terms',  href: 'design.html#ch1' },
    { zh: '二 · 核心对局流程',   en: '2 · Match Flow',        href: 'design.html#ch2' },
    { zh: '三 · 信标系统',       en: '3 · Beacon System',     href: 'design.html#ch3' },
    { zh: '四 · 技能系统',       en: '4 · Skill System',      href: 'design.html#ch4' },
    { zh: '五 · 对局事件系统',   en: '5 · Match Events',      href: 'design.html#ch5' },
    { zh: '六 · 竞技场与边界',   en: '6 · Arena & Borders',   href: 'design.html#ch6' },
    { zh: '七 · 大厅与虚空世界', en: '7 · Lobby & Void',      href: 'design.html#ch7' },
    { zh: '八 · HUD 与提示',     en: '8 · HUD & Prompts',     href: 'design.html#ch8' },
    { zh: '九 · 玩家状态与重生', en: '9 · State & Respawn',   href: 'design.html#ch9' },
    { zh: '十 · 统计与排行',     en: '10 · Stats & Ranking',  href: 'design.html#ch10' },
    { zh: '十一 · 配置与指令',   en: '11 · Config & Commands',href: 'design.html#ch11' },
    { zh: '十二 · 扩展点',       en: '12 · Extension Points', href: 'design.html#ch12' },
    { zh: '更新日志',           en: 'Changelog',             href: 'changelog.html' }
  ];

  /* ============ 四、项目卡片数据（首页，含中英文案） ============ */
  var PROJECTS = [
    {
      zhTitle: '信标攻防 Beacon Attack & Defense',
      enTitle: 'Beacon Attack & Defense',
      zhDesc: 'Minecraft Java 版 26.2（Paper）服务器小游戏插件：不对称限时攻防，防守方埋标守护，进攻方限时破标。',
      enDesc: 'A Minecraft Java 26.2 (Paper) minigame plugin: asymmetric timed attack/defense — defenders hide beacons, attackers breach them before time runs out.',
      tags: ['Minecraft', 'Paper', '小游戏插件'],
      enTags: ['Minecraft', 'Paper', 'Mini-game'],
      url: 'design.html', icon: '🏆', status: '已发布', enStatus: 'Released'
    },
    {
      zhTitle: '竞技场地图包 BeaconGame 1–4',
      enTitle: 'Arena Maps BeaconGame 1–4',
      zhDesc: '随插件附带的四张虚空竞技场：边界由领地插件托管，立体走位与高空战术是核心玩法。',
      enDesc: 'Four void arenas bundled with the plugin. Borders are handled by a领地 (claim) plugin; vertical movement and high-altitude tactics are core.',
      tags: ['Minecraft', '地图'],
      enTags: ['Minecraft', 'Maps'],
      url: 'design.html#ch6', icon: '🗺️', status: '已发布', enStatus: 'Released'
    },
    {
      zhTitle: '本 Wiki 站点',
      enTitle: 'This Wiki Site',
      zhDesc: '纯原生 HTML / CSS / JS 手写的静态文档站，托管于 GitHub Pages，支持浅/深色模式与移动端适配。',
      enDesc: 'A static docs site hand-written in plain HTML/CSS/JS, hosted on GitHub Pages, with light/dark mode and mobile support.',
      tags: ['前端', '静态站'],
      enTags: ['Frontend', 'Static'],
      url: 'index.html', icon: '📚', status: '已发布', enStatus: 'Released'
    }
  ];

  /* ============ 四-B、鸣谢名单数据 ============ */
  /* 名单已外部化到 data/thanks.js（全局 window.THANKS），不再硬编码于此；
     新增人员只需编辑该数据文件，HTML/CSS/本文件都不用动。
     读取时统一用 window.THANKS，并兜底为空数组，防止数据文件未加载时报错。 */

  /* ============ 五、路径 / 激活判断 ============ */
  function pathKey() {
    var p = location.pathname
      .replace(/index\.html$/, '').replace(/design\.html$/, '').replace(/changelog\.html$/, '');
    return p.replace(/\/+$/, '') || '/';
  }
  function isActivePage(href) {
    if (href.indexOf('#') !== -1) return false;
    try {
      var t = new URL(url(href), location.href);
      return t.pathname.replace(/index\.html$/, '').replace(/\/+$/, '') === pathKey();
    } catch (e) { return false; }
  }

  /* ============ 六、顶部导航渲染 ============ */
  function buildNavbar() {
    var nav = document.getElementById('navbar'); if (!nav) return;
    var lang = getLang();
    var links = NAV_LINKS.map(function (item, i) {
      var label = lang === 'en' ? item.en : item.zh;
      var href = item.external ? item.href : url(item.href);   // 外链不拼站点根
      var active = (!item.external && isActivePage(item.href)) ? ' class="is-active"' : '';
      var ext = item.external ? ' target="_blank" rel="noopener"' : '';
      return '<li><a href="' + href + '"' + ext + ' data-nav-i="' + i + '"' + active + '>' + label + '</a></li>';
    }).join('');

    nav.className = 'navbar';
    nav.innerHTML =
      '<div class="nav-inner">' +
        '<a class="brand" href="' + url('index.html') + '">' +
          '<span class="brand-logo">🏆</span><span>BeaconGame Wiki</span></a>' +
        '<button class="nav-toggle" id="navToggle" aria-label="菜单" aria-expanded="false">☰</button>' +
        '<ul class="nav-links" id="navLinks">' + links +
          '<li><button class="lang-toggle" id="langToggle" aria-label="切换语言">EN</button></li>' +
          '<li><button class="theme-toggle" id="themeToggle" aria-label="主题">🌙</button></li>' +
        '</ul>' +
      '</div>';

    var toggle = document.getElementById('navToggle');
    var linksEl = document.getElementById('navLinks');
    if (toggle && linksEl) {
      toggle.addEventListener('click', function () {
        var open = linksEl.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      linksEl.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') { linksEl.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
      });
    }
    bindThemeButton();
    bindLangButton();
    updateLangButton(lang);
  }
  function updateNavLang(lang) {
    var links = document.querySelectorAll('#navLinks a[data-nav-i]');
    links.forEach(function (a) {
      var i = +a.getAttribute('data-nav-i');
      if (NAV_LINKS[i]) a.textContent = lang === 'en' ? NAV_LINKS[i].en : NAV_LINKS[i].zh;
    });
  }
  function updateLangButton(lang) {
    var b = document.getElementById('langToggle');
    if (b) b.textContent = lang === 'en' ? '中' : 'EN';
  }
  function bindLangButton() {
    var b = document.getElementById('langToggle');
    if (!b) return;
    b.addEventListener('click', function () { setLang(getLang() === 'en' ? 'zh' : 'en'); });
  }

  /* ============ 七、文档侧栏渲染（scroll spy） ============ */
  function buildSidebar() {
    var aside = document.getElementById('sidebar'); if (!aside) return;
    var lang = getLang();
    var items = SIDEBAR.map(function (item, i) {
      var label = lang === 'en' ? item.en : item.zh;
      var active = isActivePage(item.href) ? ' class="is-active"' : '';
      return '<li><a href="' + url(item.href) + '" data-side-i="' + i + '"' + active + '>' + label + '</a></li>';
    }).join('');
    aside.className = 'sidebar';
    aside.innerHTML =
      '<p class="sidebar-title" data-en="Game Design Doc" data-zh="游戏设计文档">游戏设计文档</p>' +
      '<ul>' + items + '</ul>' +
      '<a class="back" href="' + url('index.html') + '" data-side-back>' +
        (lang === 'en' ? '← Back to Home' : '← 返回首页') + '</a>';

    if (location.pathname.indexOf('design.html') !== -1) initScrollSpy();
  }
  function updateSidebarLang(lang) {
    var links = document.querySelectorAll('.sidebar a[data-side-i]');
    links.forEach(function (a) {
      var i = +a.getAttribute('data-side-i');
      if (SIDEBAR[i]) a.textContent = lang === 'en' ? SIDEBAR[i].en : SIDEBAR[i].zh;
    });
    var title = document.querySelector('.sidebar-title');
    if (title) title.textContent = lang === 'en' ? 'Game Design Doc' : '游戏设计文档';
    var back = document.querySelector('.sidebar [data-side-back]');
    if (back) back.textContent = lang === 'en' ? '← Back to Home' : '← 返回首页';
  }
  function initScrollSpy() {
    var sections = document.querySelectorAll('.docs-content section[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          document.querySelectorAll('.sidebar a').forEach(function (a) {
            a.classList.toggle('is-active', (a.getAttribute('href') || '').indexOf('#' + id) !== -1);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ============ 八、主题切换 ============ */
  var THEME_KEY = 'beacongame-theme';
  function syncThemeButton() {
    var btn = document.getElementById('themeToggle'); if (!btn) return;
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.textContent = dark ? '☀️' : '🌙';
    btn.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
  }
  function bindThemeButton() {
    var btn = document.getElementById('themeToggle'); if (!btn) return;
    syncThemeButton();
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      syncThemeButton();
    });
  }

  /* ============ 九、项目卡片渲染 + 标签筛选 ============ */
  var currentTag = '全部';
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function renderCards(tag) {
    var box = document.getElementById('project-list'); if (!box) return;
    var lang = getLang();
    currentTag = tag || currentTag;
    var list = (currentTag === '全部' || currentTag === 'All')
      ? PROJECTS
      : PROJECTS.filter(function (p) {
          var tags = lang === 'en' ? p.enTags : p.tags;
          return tags.indexOf(currentTag) !== -1;
        });
    if (!list.length) { box.innerHTML = '<p class="empty">' + (lang === 'en' ? 'No projects under this tag.' : '该标签下暂无项目。') + '</p>'; return; }
    box.innerHTML = list.map(function (p) {
      var title = lang === 'en' ? p.enTitle : p.zhTitle;
      var desc  = lang === 'en' ? p.enDesc : p.zhDesc;
      var tags  = lang === 'en' ? p.enTags : p.tags;
      var status = lang === 'en' ? p.enStatus : p.status;
      var badge = status === '已发布' || status === 'Released' ? 'badge badge-ok' : 'badge badge-warn';
      return '' +
        '<a class="card" href="' + url(p.url) + '">' +
          '<div class="card-head"><span class="card-icon">' + p.icon + '</span>' +
            '<span class="' + badge + '">' + status + '</span></div>' +
          '<h3 class="card-title">' + escapeHtml(title) + '</h3>' +
          '<p class="card-desc">' + escapeHtml(desc) + '</p>' +
          '<div class="card-tags">' + tags.map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' +
        '</a>';
    }).join('');
  }
  function renderProjectFilters() {
    var tagBox = document.getElementById('project-tags'); if (!tagBox) return;
    var lang = getLang();
    var tags = [];
    PROJECTS.forEach(function (p) {
      (lang === 'en' ? p.enTags : p.tags).forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });
    });
    var all = ['全部', 'All'].slice(0, 1).concat([lang === 'en' ? 'All' : '全部']).concat(tags);
    // 简化：首项固定为「全部 / All」
    all = [lang === 'en' ? 'All' : '全部'].concat(tags);
    tagBox.innerHTML = all.map(function (t, i) {
      var active = (lang === 'en' ? 'All' : '全部') === t ? ' is-active' : '';
      if (i === 0) active = ' is-active';
      return '<button type="button" data-tag="' + escapeHtml(t) + '" class="' + active.trim() + '">' + escapeHtml(t) + '</button>';
    }).join('');
    tagBox.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('button[data-tag]') : null;
      if (!btn) return;
      Array.prototype.forEach.call(tagBox.querySelectorAll('button'), function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      currentTag = btn.getAttribute('data-tag');
      renderCards(currentTag);
    });
    renderCards(lang === 'en' ? 'All' : '全部');
  }

  /* ============ 十、页脚年份 ============ */
  function fillYear() {
    var el = document.getElementById('year'); if (el) el.textContent = new Date().getFullYear();
  }

  /* ============ 十-B、鸣谢名单渲染 ============ */
  function renderThanks() {
    var box = document.getElementById('thanks-list'); if (!box) return;  // 仅捐款区所在页存在
    var list = window.THANKS || [];   // 名单来自 data/thanks.js（全局），兜底为空数组防报错
    if (!list.length) { box.innerHTML = '<span class="thanks-empty">—</span>'; return; }
    // 姓名是专有名词，无需翻译；用 escapeHtml 防 XSS（数据若改为外部来源也安全）
    box.innerHTML = list.map(function (p) {
      return '<span class="thanks-chip">' + escapeHtml(p.name) + '</span>';
    }).join('');
  }

  /* ============ 十一、启动 ============ */
  buildNavbar();
  buildSidebar();
  renderProjectFilters();
  renderThanks();
  fillYear();
  // 应用已保存语言：先把中文原文缓存进 dataset.zh，若英文则切到 data-en
  applyTranslations(getLang());

})();
