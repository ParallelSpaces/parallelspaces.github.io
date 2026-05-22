/* ============================================================
   Parallel Spaces — site scripts
   What's New page: pull the latest release straight from the
   Mac App Store via the public iTunes Lookup API.

   The iTunes API sends no CORS headers, so a normal fetch() is
   blocked in the browser — but it supports JSONP via ?callback=.
   We inject a <script> tag and read the result that way.
   ============================================================ */

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
