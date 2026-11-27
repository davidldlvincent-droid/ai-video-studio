/* ============================================================
   EMPIRE STUDIO — WebGL hero scene (Three.js)
   Floating film posters in 3D depth + gold dust, mouse parallax.
   Pure enhancement: if WebGL or the Three.js CDN is unavailable,
   the page keeps its styled hero and the 2D gold-dust canvas.
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("hero-3d");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.THREE) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.05);
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  var world = new THREE.Group();
  scene.add(world);

  /* ---------- Floating film posters ---------- */
  var POSTERS = [
    "assets/posters/dracula.jpg",
    "assets/posters/moby-dick.jpg",
    "assets/posters/frankenstein.jpg",
    "assets/posters/three-musketeers.jpg",
    "assets/posters/christmas-carol.jpg",
    "assets/posters/dorian-gray.jpg",
    "assets/posters/time-machine.jpg",
    "assets/posters/20000-leagues.jpg",
    "assets/posters/jekyll-hyde.jpg",
    "assets/posters/oliver-twist.jpg"
  ];
  var isMobile = window.innerWidth < 720;
  var loader = new THREE.TextureLoader();
  var planes = [];
  var goldMat = new THREE.MeshBasicMaterial({ color: 0xc9a227, fog: true });

  POSTERS.slice(0, isMobile ? 6 : POSTERS.length).forEach(function (src, i) {
    loader.load(src, function (tex) {
      var w = 2.3, h = 1.3;
      var group = new THREE.Group();
      var frame = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.07, h + 0.07), goldMat);
      var poster = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: isMobile ? 0.4 : 0.62, fog: true })
      );
      poster.position.z = 0.012;
      group.add(frame);
      group.add(poster);
      // Spread across the field, biased right of the headline text.
      var col = i % 5, row = Math.floor(i / 5);
      group.position.set(
        -5.5 + col * 2.9 + (row ? 1.2 : 0),
        2.4 - row * 3.4 + (i % 2 ? 0.5 : -0.3),
        -1.5 - (i % 4) * 1.4
      );
      group.rotation.y = (i % 2 ? -1 : 1) * (0.12 + (i % 3) * 0.05);
      group.userData = {
        baseY: group.position.y,
        baseX: group.position.x,
        phase: i * 1.37,
        speed: 0.35 + (i % 4) * 0.09,
        rot: (i % 2 ? 1 : -1) * 0.05
      };
      world.add(group);
      planes.push(group);
    });
  });

  /* ---------- Gold dust in 3D ---------- */
  var COUNT = isMobile ? 260 : 650;
  var pos = new Float32Array(COUNT * 3);
  for (var i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xd9a441, size: 0.045, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false
  }));
  scene.add(dust);

  /* ---------- Interaction & lifecycle ---------- */
  var mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener("pointermove", function (ev) {
    tx = (ev.clientX / window.innerWidth - 0.5) * 2;
    ty = (ev.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  var visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }).observe(canvas);
  }

  function resize() {
    var w = canvas.clientWidth || canvas.parentElement.clientWidth;
    var h = canvas.clientHeight || canvas.parentElement.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  var clock = new THREE.Clock();
  (function tick() {
    requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    var t = clock.getElapsedTime();
    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;
    world.rotation.y = mx * 0.16;
    world.rotation.x = my * 0.09;
    world.position.x = mx * 0.35;
    dust.rotation.y = t * 0.014;
    dust.position.y = Math.sin(t * 0.18) * 0.25;
    for (var j = 0; j < planes.length; j++) {
      var p = planes[j], u = p.userData;
      p.position.y = u.baseY + Math.sin(t * u.speed + u.phase) * 0.28;
      p.position.x = u.baseX + Math.cos(t * u.speed * 0.7 + u.phase) * 0.18;
      p.rotation.z = Math.sin(t * u.speed * 0.8 + u.phase) * u.rot;
    }
    renderer.render(scene, camera);
  })();
})();
