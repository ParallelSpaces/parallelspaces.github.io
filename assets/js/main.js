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

/* ---- 0. FAQ search (faq.html only) ------------------------- */
(function () {
  "use strict";
  var input = document.getElementById("faq-search");
  if (!input) return;

  var items   = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
  var groups  = Array.prototype.slice.call(document.querySelectorAll(".faq-group-title"));
  var empty   = document.getElementById("faq-empty");

  function filter() {
    var q = input.value.trim().toLowerCase();
    var anyVisible = false;

    items.forEach(function (item) {
      var text  = item.textContent.toLowerCase();
      var match = q === "" || text.indexOf(q) !== -1;
      item.style.display = match ? "" : "none";
      if (match) {
        anyVisible = true;
        item.open = q !== "";   // auto-expand matches, collapse when cleared
      }
    });

    // Hide a group header if every item under it is hidden.
    groups.forEach(function (g) {
      var sib = g.nextElementSibling;
      var hasAny = false;
      while (sib && !sib.classList.contains("faq-group-title")) {
        if (sib.classList && sib.classList.contains("faq-item")
            && sib.style.display !== "none") { hasAny = true; break; }
        sib = sib.nextElementSibling;
      }
      g.style.display = (q === "" || hasAny) ? "" : "none";
    });

    if (empty) empty.hidden = anyVisible || q === "";
  }

  input.addEventListener("input", filter);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { input.value = ""; filter(); input.blur(); }
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
