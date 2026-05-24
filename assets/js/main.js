/* ============================================================
   Parallel Spaces — site scripts
   Loaded on every page.
     1. Rewrite App Store links to open the Mac App Store app
        (macappstore://) when the visitor is on a real Mac.
        Everywhere else, the regular web link is kept.
     2. (whats-new.html only) Pull the latest release straight
        from the App Store via the iTunes Lookup API. The API
        sends no CORS headers, so we use JSONP via ?callback=.
   ============================================================ */

/* ---- 0. Mobile nav hamburger ------------------------------- */
(function () {
  "use strict";
  var nav = document.querySelector(".nav");
  if (!nav) return;
  var wrap  = nav.querySelector(".wrap");
  var links = nav.querySelector(".nav-links");
  var cta   = nav.querySelector(".nav-cta");
  if (!wrap || !links) return;

  var btn = document.createElement("button");
  btn.className = "nav-toggle";
  btn.setAttribute("aria-label", "Open menu");
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = "<span></span><span></span><span></span>";

  // Insert before CTA so order is: brand … links … hamburger … CTA
  if (cta) wrap.insertBefore(btn, cta);
  else     wrap.appendChild(btn);

  function setOpen(open) {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  btn.addEventListener("click", function () {
    setOpen(!nav.classList.contains("open"));
  });

  // Close when a link in the menu is tapped
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setOpen(false);
  });

  // Close on resize back to desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 760 && nav.classList.contains("open")) setOpen(false);
  });

  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("open")) setOpen(false);
  });
})();

/* ---- Lightbox carousel ------------------------------------- */
(function () {
  "use strict";
  var grid = document.getElementById("screenshots-grid");
  var lb   = document.getElementById("lightbox");
  if (!grid || !lb) return;

  var imgEl     = document.getElementById("lb-img");
  var closeBtn  = document.getElementById("lb-close");
  var prevBtn   = document.getElementById("lb-prev");
  var nextBtn   = document.getElementById("lb-next");
  var counterEl = document.getElementById("lb-counter");

  // Collect shots in DOM order
  var shots = Array.prototype.slice.call(grid.querySelectorAll(".shot"));
  if (!shots.length) return;

  var items = shots.map(function (btn) {
    var img = btn.querySelector("img");
    return { src: img.src, alt: img.alt || "" };
  });

  var current = 0;

  function show(i) {
    current = (i + items.length) % items.length;
    imgEl.src = items[current].src;
    imgEl.alt = items[current].alt;
    counterEl.textContent = (current + 1) + " / " + items.length;
  }

  function open(i) {
    show(i);
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }

  // Wire shot buttons
  shots.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idx = parseInt(btn.dataset.index || "0", 10);
      open(idx);
    });
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function (e) { e.stopPropagation(); show(current - 1); });
  nextBtn.addEventListener("click", function (e) { e.stopPropagation(); show(current + 1); });

  // Click outside image closes
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.classList.contains("lightbox-img-wrap")) close();
  });

  // Keyboard nav
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape")     close();
    if (e.key === "ArrowLeft")  show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  // Swipe on touch
  var startX = null;
  lb.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend",   function (e) {
    if (startX == null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();

/* ---- 1. Mac App Store deep-link ---------------------------- */
(function () {
  "use strict";
  // iPadOS Safari reports as Mac but has touch — exclude it,
  // because macappstore:// doesn't exist on iPad.
  var isTouchMac = (navigator.maxTouchPoints || 0) > 1;
  var isMac =
    !isTouchMac && (
      (navigator.userAgentData && navigator.userAgentData.platform === "macOS") ||
      /Mac/.test(navigator.platform || "") ||
      /Mac OS X/.test(navigator.userAgent || "")
    );
  if (!isMac) return;
  var WEB = "https://apps.apple.com/app/id6772172563";
  var APP = "macappstore://apps.apple.com/app/id6772172563";
  var links = document.querySelectorAll('a[href="' + WEB + '"]');
  for (var i = 0; i < links.length; i++) { links[i].href = APP; }
})();

(function () {
  "use strict";

  var APP_ID = "6772172563";
  var releasesEl = document.getElementById("releases");
  if (!releasesEl) return; // only runs on whats-new.html

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      year: "numeric", month: "long", day: "numeric"
    });
  }

  function show(html) { releasesEl.innerHTML = html; }

  function renderRelease(app) {
    var ver = esc(app.version || "");
    var notes = esc(app.releaseNotes || "No release notes were provided for this version.");
    var date = fmtDate(app.currentVersionReleaseDate);
    show(
      '<div class="release">' +
        '<div class="release-head">' +
          '<span class="release-ver">Version ' + ver + "</span>" +
          '<span class="release-badge">Latest</span>' +
          (date ? '<span class="release-date">' + esc(date) + "</span>" : "") +
        "</div>" +
        '<div class="release-notes">' + notes + "</div>" +
      "</div>"
    );
  }

  function renderComingSoon() {
    show(
      '<div class="release">' +
        '<div class="release-head"><span class="release-ver">Coming soon</span></div>' +
        '<div class="release-notes">Parallel Spaces is on its way to the Mac App Store. ' +
        "Release notes will appear here automatically once it’s live.</div>" +
      "</div>"
    );
  }

  function renderError() {
    show(
      '<div class="release">' +
        '<div class="release-notes muted">Couldn’t load release notes right now. ' +
        'Check the latest version on the ' +
        '<a href="https://apps.apple.com/app/id' + APP_ID + '">Mac App Store</a>.</div>' +
      "</div>"
    );
  }

  // ---- JSONP request ------------------------------------------
  var CB = "psItunesCallback";
  var done = false;
  var script;
  var timer;

  function cleanup() {
    try { delete window[CB]; } catch (e) { window[CB] = undefined; }
    if (script && script.parentNode) script.parentNode.removeChild(script);
  }

  window[CB] = function (data) {
    if (done) return;
    done = true;
    clearTimeout(timer);
    var app = data && data.results && data.results[0];
    if (app && app.version) { renderRelease(app); }
    else { renderComingSoon(); }
    cleanup();
  };

  script = document.createElement("script");
  script.src = "https://itunes.apple.com/lookup?id=" + APP_ID + "&callback=" + CB;
  script.onerror = function () {
    if (done) return;
    done = true;
    clearTimeout(timer);
    renderError();
    cleanup();
  };
  document.head.appendChild(script);

  timer = setTimeout(function () {
    if (done) return;
    done = true;
    renderError();
    cleanup();
  }, 8000);
})();
