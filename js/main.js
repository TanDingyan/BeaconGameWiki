/* =========================================================
 * BeaconGame Wiki - 全局脚本
 * 职责：
 *   1. 计算"站点根目录"（子路径部署核心，见 getSiteRoot）
 *   2. 动态生成顶部导航栏 → <nav id="navbar">
 *   3. 动态生成文档侧栏 → <aside id="sidebar">（仅文档页有该元素）
 *   4. 浅色/深色主题切换 + localStorage 持久化
 *   5. 首页项目卡片渲染（数据源 PROJECTS）
 *   6. 文档页滚动高亮（scroll spy）
 *
 * 铁律：全站不使用以 "/" 开头的绝对路径。
 * ========================================================= */
(function () {
  'use strict';

  /* =======================================================
   * 一、站点根目录解析
   * 站点部署在 https://tandingyan.github.io/beacongame/
   * 本文件位于 <站点根>/js/main.js，
   * 因此"js/ 目录的上一级"就是站点根。用 currentScript 反推，
   * 与页面层级无关，首页和任意子目录页都能拿到正确根。
   * ======================================================= */
  var SITE_ROOT = (function () {
    var manual = document.documentElement.getAttribute('data-site-root');
    if (manual) return manual.charAt(manual.length - 1) === '/' ? manual : manual + '/';

    var self = document.currentScript;
    if (self && self.src) {
      try {
        // new URL('../', 本文件绝对 URL) → 站点根（兼容本地 file:// 双击打开）
        return new URL('../', new URL(self.src, location.href)).href;
      } catch (e) {}
    }
    return './';
  })();

  /** 把"相对于站点根"的路径拼成当前页面可用的完整 URL */
  function url(path) {
    return SITE_ROOT + String(path).replace(/^\/+/, '');
  }

  /* =======================================================
   * 二、顶部导航数据
   * href 写成"相对站点根"的形式，由 url() 统一转换，
   * 首页与文档页共用同一份配置。
   * ======================================================= */
  var NAV_LINKS = [
    { label: '首页',     href: 'index.html' },
    { label: '游戏设计', href: 'design.html' },
    { label: '更新日志', href: 'changelog.html' },
    { label: '下载',     href: 'download/BeaconGame-6.5.jar' }
  ];

  /* =======================================================
   * 三、文档侧栏数据（仅文档页使用）
   * 指向具体页面 + 锚点；锚点在同一页（design.html）内即可平滑跳转。
   * ======================================================= */
  var SIDEBAR = [
    { label: '一 · 总览与术语',     href: 'design.html#ch1' },
    { label: '二 · 核心对局流程',   href: 'design.html#ch2' },
    { label: '三 · 信标系统',       href: 'design.html#ch3' },
    { label: '四 · 技能系统',       href: 'design.html#ch4' },
    { label: '五 · 对局事件系统',   href: 'design.html#ch5' },
    { label: '六 · 竞技场与边界',   href: 'design.html#ch6' },
    { label: '七 · 大厅与虚空世界', href: 'design.html#ch7' },
    { label: '八 · HUD 与提示',     href: 'design.html#ch8' },
    { label: '九 · 玩家状态与重生', href: 'design.html#ch9' },
    { label: '十 · 统计与排行',     href: 'design.html#ch10' },
    { label: '十一 · 配置与指令',   href: 'design.html#ch11' },
    { label: '十二 · 扩展点',       href: 'design.html#ch12' },
    { label: '更新日志',           href: 'changelog.html' }
  ];

  /* =======================================================
   * 四、项目数据（首页卡片）
   * 新增项目只改这里，HTML/CSS 不动。
   * ======================================================= */
  var PROJECTS = [
    {
      title: '信标攻防 Beacon Attack & Defense',
      desc: 'Minecraft Java 版 26.2（Paper）服务器小游戏插件：不对称限时攻防，防守方埋标守护，进攻方限时破标。',
      tags: ['Minecraft', 'Paper', '小游戏插件'],
      url: 'design.html',
      icon: '🏆',
      status: '已发布'
    },
    {
      title: '竞技场地图包 BeaconGame 1–4',
      desc: '随插件附带的四张虚空竞技场：边界由领地插件托管，立体走位与高空战术是核心玩法。',
      tags: ['Minecraft', '地图'],
      url: 'design.html#ch6',
      icon: '🗺️',
      status: '已发布'
    },
    {
      title: '本 Wiki 站点',
      desc: '纯原生 HTML / CSS / JS 手写的静态文档站，托管于 GitHub Pages，支持浅/深色模式与移动端适配。',
      tags: ['前端', '静态站'],
      url: 'index.html',
      icon: '📚',
      status: '已发布'
    }
  ];

  /* =======================================================
   * 五、路径/激活判断辅助
   * ======================================================= */
  function pathKey() {
    var p = location.pathname.replace(/index\.html$/, '').replace(/design\.html$/, '').replace(/changelog\.html$/, '');
    return p.replace(/\/+$/, '') || '/';
  }
  function isActivePage(href) {
    if (href.indexOf('#') !== -1) return false; // 锚点不高亮，避免误判
    try {
      var target = new URL(url(href), location.href);
      return target.pathname.replace(/index\.html$/, '').replace(/\/+$/, '') === pathKey();
    } catch (e) { return false; }
  }

  /* =======================================================
   * 六、顶部导航渲染
   * ======================================================= */
  function buildNavbar() {
    var nav = document.getElementById('navbar');
    if (!nav) return;

    var links = NAV_LINKS.map(function (item) {
      return '<li><a href="' + url(item.href) + '"' +
             (isActivePage(item.href) ? ' class="is-active"' : '') + '>' + item.label + '</a></li>';
    }).join('');

    nav.className = 'navbar';
    nav.innerHTML =
      '<div class="nav-inner">' +
        '<a class="brand" href="' + url('index.html') + '">' +
          '<span class="brand-logo">🏆</span><span>BeaconGame Wiki</span>' +
        '</a>' +
        '<button class="nav-toggle" id="navToggle" aria-label="展开导航菜单" aria-expanded="false">☰</button>' +
        '<ul class="nav-links" id="navLinks">' + links +
          '<li><button class="theme-toggle" id="themeToggle" aria-label="切换深色/浅色模式">🌙</button></li>' +
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
  }

  /* =======================================================
   * 七、文档侧栏渲染（scroll spy）
   * ======================================================= */
  function buildSidebar() {
    var aside = document.getElementById('sidebar');
    if (!aside) return;

    aside.className = 'sidebar';
    aside.innerHTML =
      '<p class="sidebar-title">游戏设计文档</p>' +
      '<ul>' +
        SIDEBAR.map(function (item) {
          var active = isActivePage(item.href) ? ' class="is-active"' : '';
          return '<li><a href="' + url(item.href) + '"' + active + '>' + item.label + '</a></li>';
        }).join('') +
      '</ul>' +
      '<a class="back" href="' + url('index.html') + '">← 返回首页</a>';

    // 仅当在本页（design.html）内才做滚动高亮
    var onDoc = location.pathname.indexOf('design.html') !== -1;
    if (onDoc) initScrollSpy();
  }

  function initScrollSpy() {
    var sections = document.querySelectorAll('.docs-content section[id]');
    if (!sections.length || !('IntersectionObserver' in window)) return;
    var linkMap = {};
    SIDEBAR.forEach(function (item) {
      var m = item.href.match(/#(ch\d+)$/);
      if (m) linkMap[m[1]] = item;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          var links = document.querySelectorAll('.sidebar a');
          links.forEach(function (a) {
            var href = a.getAttribute('href') || '';
            a.classList.toggle('is-active', href.indexOf('#' + id) !== -1);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* =======================================================
   * 八、主题切换
   * 初始主题由 <head> 内联脚本写好（防闪烁），这里只做点击切换。
   * ======================================================= */
  var THEME_KEY = 'beacongame-theme'; // 必须与各页面 <head> 内联脚本的 key 一致

  function syncThemeButton() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.textContent = dark ? '☀️' : '🌙';
    btn.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
  }
  function bindThemeButton() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    syncThemeButton();
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      syncThemeButton();
    });
  }

  /* =======================================================
   * 九、项目卡片渲染 + 标签筛选
   * ======================================================= */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function renderCards(tag) {
    var box = document.getElementById('project-list');
    if (!box) return;
    var list = (!tag || tag === '全部') ? PROJECTS
             : PROJECTS.filter(function (p) { return p.tags.indexOf(tag) !== -1; });
    if (!list.length) { box.innerHTML = '<p class="empty">该标签下暂无项目。</p>'; return; }
    box.innerHTML = list.map(function (p) {
      var badge = p.status === '已发布' ? 'badge badge-ok' : 'badge badge-warn';
      return '' +
        '<a class="card" href="' + url(p.url) + '">' +
          '<div class="card-head"><span class="card-icon">' + escapeHtml(p.icon) + '</span>' +
            '<span class="' + badge + '">' + escapeHtml(p.status) + '</span></div>' +
          '<h3 class="card-title">' + escapeHtml(p.title) + '</h3>' +
          '<p class="card-desc">' + escapeHtml(p.desc) + '</p>' +
          '<div class="card-tags">' + p.tags.map(function (t) {
            return '<span class="tag">' + escapeHtml(t) + '</span>';
          }).join('') + '</div>' +
        '</a>';
    }).join('');
  }
  function renderProjectFilters() {
    var tagBox = document.getElementById('project-tags');
    if (!tagBox) return;
    var tags = [];
    PROJECTS.forEach(function (p) {
      p.tags.forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });
    });
    var all = ['全部'].concat(tags);
    tagBox.innerHTML = all.map(function (t, i) {
      return '<button type="button" data-tag="' + escapeHtml(t) + '"' +
             (i === 0 ? ' class="is-active"' : '') + '>' + escapeHtml(t) + '</button>';
    }).join('');
    tagBox.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('button[data-tag]') : null;
      if (!btn) return;
      Array.prototype.forEach.call(tagBox.querySelectorAll('button'), function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      renderCards(btn.getAttribute('data-tag'));
    });
    renderCards('全部');
  }

  /* =======================================================
   * 十、页脚年份
   * ======================================================= */
  function fillYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* =======================================================
   * 十一、启动（defer 引入，DOM 已就绪）
   * ======================================================= */
  buildNavbar();
  buildSidebar();
  renderProjectFilters();
  fillYear();

})();
