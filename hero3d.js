/* Empire Studio — interactive 3D hero (Three.js / WebGL)
   The studio's film posters float in real 3D space. They react to you:
   - move the mouse / tilt the phone: the whole scene leans with you
   - hover a poster: it grows, brightens and its gold frame lights up
   - click or tap a poster: it flies to the front and fills the stage;
     click again (or press Esc) to send it back
   - scroll: the camera pushes in as the hero leaves the screen
   If WebGL or the CDN is unavailable, or the visitor prefers reduced
   motion, the styled hero underneath (with its 2D gold dust) remains. */
(function () {
  var canvas = document.getElementById('hero-3d');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof THREE === 'undefined') return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  var hero = canvas.parentElement;
  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x14100a, 0.055);
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  var POSTERS = [
    'dracula.jpg', 'frankenstein.jpg', 'moby-dick.jpg', 'dorian-gray.jpg',
    'gatsby.jpg', 'les-miserables.jpg', 'odyssey.jpg', 'treasure-island.jpg',
    'pride-prejudice.jpg', 'hound.jpg', 'tale-of-two-cities.jpg', 'crime-punishment.jpg'
  ];
  var isMobile = Math.min(window.innerWidth, window.innerHeight) < 700;
  var COUNT = isMobile ? 7 : 11;

  var group = new THREE.Group();
  scene.add(group);
  var loader = new THREE.TextureLoader();
  var posters = [];

  for (var i = 0; i < COUNT; i++) {
    (function (i) {
      var holder = new THREE.Group();
      var w = 1.55, h = 2.25;
      var frameMat = new THREE.MeshBasicMaterial({ color: 0xc9a227 });
      var frame = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.14, h + 0.14), frameMat);
      frame.position.z = -0.012;
      holder.add(frame);
      var mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.92 });
      var face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      holder.add(face);
      loader.load('assets/posters/' + POSTERS[i % POSTERS.length], function (tex) {
        tex.minFilter = THREE.LinearFilter;
        mat.map = tex; mat.needsUpdate = true;
      });
      var ang = (i / COUNT) * Math.PI * 2;
      var rad = 3.1 + (i % 3) * 0.85;
      holder.position.set(Math.cos(ang) * rad, Math.sin(ang * 1.3) * 1.35, -((i * 7) % 5) * 0.8);
      holder.rotation.y = Math.cos(ang) * 0.5;
      holder.userData = {
        base: holder.position.clone(),
        baseRotY: holder.rotation.y,
        phase: i * 1.37,
        focus: false,
        frameMat: frameMat,
        faceMat: mat
      };
      group.add(holder);
      posters.push(holder);
    })(i);
  }

  // Gold dust
  var dustCount = isMobile ? 260 : 650;
  var pos = new Float32Array(dustCount * 3);
  for (var d = 0; d < dustCount; d++) {
    pos[d * 3] = (Math.random() - 0.5) * 18;
    pos[d * 3 + 1] = (Math.random() - 0.5) * 10;
    pos[d * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xd8b34a, size: 0.045, transparent: true, opacity: 0.75, depthWrite: false
  }));
  scene.add(dust);

  // ---- interaction state ----
  var mx = 0, my = 0, tx = 0, ty = 0;
  var ray = new THREE.Raycaster();
  var pointer = new THREE.Vector2(-10, -10);
  var hovered = null, focused = null;
  var scrollP = 0;
  var brightGold = new THREE.Color(0xffd977);

  function setPointer(e) {
    var r = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }
  window.addEventListener('pointermove', setPointer, { passive: true });
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null) return;
      tx = Math.max(-1, Math.min(1, e.gamma / 28));
      ty = Math.max(-1, Math.min(1, (e.beta - 45) / 28));
    }, { passive: true });
  }
  window.addEventListener('scroll', function () {
    var h = hero.offsetHeight || window.innerHeight;
    scrollP = Math.max(0, Math.min(1, window.scrollY / h));
  }, { passive: true });

  function pickHolder() {
    ray.setFromCamera(pointer, camera);
    var hits = ray.intersectObjects(group.children, true);
    if (!hits.length) return null;
    var o = hits[0].object;
    while (o && o.parent !== group) o = o.parent;
    return o;
  }

  var downX = 0, downY = 0;
  hero.addEventListener('pointerdown', function (e) { downX = e.clientX; downY = e.clientY; });
  hero.addEventListener('pointerup', function (e) {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
    if (e.target.closest && e.target.closest('a, button')) return;
    setPointer(e);
    var hit = pickHolder();
    if (focused && hit !== focused) { focused.userData.focus = false; focused = null; }
    if (hit) {
      if (focused === hit) { hit.userData.focus = false; focused = null; }
      else { hit.userData.focus = true; focused = hit; }
    }
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && focused) { focused.userData.focus = false; focused = null; }
  });

  function resize() {
    var w = hero.clientWidth, h = hero.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  var running = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { running = en[0].isIntersecting; }, { threshold: 0.02 }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () { running = !document.hidden; });

  var clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    if (!running) return;
    var t = clock.getElapsedTime();
    mx += (tx - mx) * 0.045;
    my += (ty - my) * 0.045;

    hovered = pickHolder();
    canvas.style.cursor = hovered ? 'pointer' : '';

    for (var i = 0; i < posters.length; i++) {
      var p = posters[i], u = p.userData;
      var sway = Math.sin(t * 0.55 + u.phase) * 0.07;
      var targetPos, targetScale, targetOp;
      if (u.focus) {
        targetPos = { x: 0, y: 0, z: 4.4 };
        targetScale = 1.55;
        targetOp = 1;
        p.rotation.y += (0 - p.rotation.y) * 0.08;
        p.rotation.x += (0 - p.rotation.x) * 0.08;
      } else {
        targetPos = { x: u.base.x, y: u.base.y + sway, z: u.base.z };
        targetScale = (hovered === p) ? 1.28 : 1;
        targetOp = focused ? 0.22 : (hovered === p ? 1 : 0.92);
        p.rotation.y += ((u.baseRotY + mx * 0.25) - p.rotation.y) * 0.06;
        p.rotation.x += (Math.sin(t * 0.4 + u.phase) * 0.05 - p.rotation.x) * 0.06;
      }
      p.position.x += (targetPos.x - p.position.x) * 0.07;
      p.position.y += (targetPos.y - p.position.y) * 0.07;
      p.position.z += (targetPos.z - p.position.z) * 0.07;
      var s = p.scale.x + (targetScale - p.scale.x) * 0.09;
      p.scale.set(s, s, s);
      u.faceMat.opacity += (targetOp - u.faceMat.opacity) * 0.1;
      u.frameMat.color.lerp(brightGold, (hovered === p || u.focus) ? 0.15 : 0.05);
      if (hovered !== p && !u.focus) u.frameMat.color.lerp(new THREE.Color(0xc9a227), 0.08);
    }

    group.rotation.y = mx * 0.22 + scrollP * 0.4;
    group.rotation.x = my * 0.1;
    group.position.x = mx * 0.35;
    group.position.y = -my * 0.25;
    camera.position.z = 8 - scrollP * 1.7;
    dust.rotation.y = t * 0.014;
    renderer.render(scene, camera);
  })();
})();
