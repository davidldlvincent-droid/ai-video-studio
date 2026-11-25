/* ============================================================
   OLABOBOYE FASEMIRE — AI VIDEO STUDIO FOR AUTHORS
   Nav, reveal animations, 3D tilt, portfolio filter,
   lightbox, gold-dust particles, contact form (mailto).
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  var burger = document.querySelector(".burger");
  var navLinks = document.querySelector(".nav-links");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { navLinks.classList.remove("open"); });
    });
  }

  /* ---------- Active nav link ---------- */
  var page = document.body.getAttribute("data-page");
  if (page && navLinks) {
    navLinks.querySelectorAll("a").forEach(function (a) {
      if (a.getAttribute("data-nav") === page) a.classList.add("active");
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 3D tilt on cards ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("mousemove", function (ev) {
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- Portfolio filter ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var cards = document.querySelectorAll(".work-card[data-cat]");
  if (filterBtns.length && cards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var f = btn.getAttribute("data-filter");
        cards.forEach(function (card) {
          var cats = (card.getAttribute("data-cat") || "").split(" ");
          var show = f === "all" || cats.indexOf(f) !== -1;
          card.classList.toggle("hide", !show);
        });
      });
    });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector("figcaption");
    document.querySelectorAll(".work-media").forEach(function (media) {
      media.addEventListener("click", function () {
        var img = media.querySelector("img");
        if (!img) return;
        var card = media.closest(".work-card");
        var title = card ? card.querySelector("h3").textContent : "";
        var cat = card ? card.querySelector(".work-cat").textContent : "";
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCap.innerHTML = "<strong>" + title + "</strong> — " + cat;
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });
    var closeLb = function () {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    };
    lightbox.addEventListener("click", closeLb);
    var closeBtn = lightbox.querySelector(".lightbox-close");
    if (closeBtn) closeBtn.addEventListener("click", closeLb);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLb();
    });
  }

  /* ---------- Gold dust particles (hero) ---------- */
  var canvas = document.getElementById("gold-dust");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var W, H;
    function resize() {
      var hero = canvas.parentElement;
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    function make() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.6 + Math.random() * 1.8,
        vy: -(0.12 + Math.random() * 0.35),
        vx: (Math.random() - 0.5) * 0.18,
        a: 0.15 + Math.random() * 0.55,
        tw: Math.random() * Math.PI * 2
      };
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) {
        p.y += p.vy; p.x += p.vx; p.tw += 0.02;
        if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
        var alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(232, 150, 158, " + alpha.toFixed(3) + ")";
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    resize();
    for (var i = 0; i < 55; i++) particles.push(make());
    window.addEventListener("resize", resize);
    tick();
  }

  /* ---------- Contact form -> opens the visitor's email app ---------- */
  var form = document.getElementById("order-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("f-name").value.trim();
      var email = document.getElementById("f-email").value.trim();
      var book = document.getElementById("f-book").value.trim();
      var genre = document.getElementById("f-genre").value;
      var service = document.getElementById("f-service").value;
      var msg = document.getElementById("f-message").value.trim();
      var subject = "New trailer order — " + (book || "my book") + " (" + name + ")";
      var body =
        "Hello Olaboboye,\n\n" +
        "I would like to order a trailer for my book.\n\n" +
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Book title: " + book + "\n" +
        "Genre: " + genre + "\n" +
        "Service: " + service + "\n\n" +
        "About the book:\n" + msg + "\n";
      window.location.href =
        "mailto:contactmadelinemiller@gmail.com?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      var note = document.getElementById("form-note");
      if (note) note.textContent = "Your email app is opening with the order ready to send. If it does not open, email us directly at contactmadelinemiller@gmail.com.";
    });
  }
})();
