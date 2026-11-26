/* Empire Studio — loads trailers added through the admin portal
   and places them at the top of the portfolio grid, in the same
   card style as the films built into the page. If the database is
   not connected yet, the page simply shows the built-in films. */
(function () {
  "use strict";
  var cfg = window.EMPIRE_SUPABASE;
  if (!cfg || !cfg.url || !cfg.anonKey) return;

  var grid = document.querySelector(".grid");
  if (!grid) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function cardHtml(t) {
    var poster = t.poster_url ? ' poster="' + esc(t.poster_url) + '"' : "";
    return '' +
      '<div class="work-media video">' +
        '<video controls preload="none"' + poster + ' src="' + esc(t.video_url) + '"></video>' +
        '<span class="badge film">' + esc(t.badge || "Finished Film") + '</span>' +
      '</div>' +
      '<div class="work-body">' +
        '<span class="work-cat">' + esc(t.category_label || "Book Trailer") + '</span>' +
        '<h3>' + esc(t.title) + '</h3>' +
        '<p>' + esc(t.description || "") + '</p>' +
      '</div>';
  }

  function bindCard(card) {
    card.classList.add("in");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    card.addEventListener("mousemove", function (ev) {
      var r = card.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width - 0.5;
      var y = (ev.clientY - r.top) / r.height - 0.5;
      card.style.transform = "perspective(900px) rotateY(" + (x * 7).toFixed(2) +
        "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateY(-4px)";
    });
    card.addEventListener("mouseleave", function () { card.style.transform = ""; });
  }

  function applyActiveFilter() {
    var active = document.querySelector(".filter-btn.active");
    if (!active) return;
    var f = active.getAttribute("data-filter");
    document.querySelectorAll(".work-card[data-cat]").forEach(function (card) {
      var cats = (card.getAttribute("data-cat") || "").split(" ");
      var show = f === "all" || cats.indexOf(f) !== -1;
      card.classList.toggle("hide", !show);
    });
  }

  fetch(cfg.url + "/rest/v1/trailers?select=*&order=created_at.desc", {
    headers: { apikey: cfg.anonKey, Authorization: "Bearer " + cfg.anonKey }
  })
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (rows) {
      if (!rows || !rows.length) return;
      // Insert in listed order at the top of the grid.
      rows.slice().reverse().forEach(function (t) {
        var el = document.createElement("article");
        el.className = "work-card reveal";
        el.setAttribute("data-tilt", "");
        el.setAttribute("data-cat", t.category || "trailer");
        el.innerHTML = cardHtml(t);
        grid.insertBefore(el, grid.firstChild);
        bindCard(el);
      });
      applyActiveFilter();
    })
    .catch(function () { /* offline or not set up: built-in films still show */ });
})();
