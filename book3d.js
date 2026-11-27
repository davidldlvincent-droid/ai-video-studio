/* Empire Studio — the rotating 3D book in the call-to-action band.
   A cloth-bound book with a gold frame and the studio name on its cover,
   built from real 3D geometry. It turns slowly, leans toward the visitor's
   pointer, and floats over gold dust. Falls back silently if WebGL fails. */
(function () {
  var canvas = document.getElementById('book-3d');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof THREE === 'undefined') return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { canvas.style.display = 'none'; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

  var wrap = canvas.parentElement;
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.4, 7.2);

  scene.add(new THREE.AmbientLight(0xfff2d8, 0.75));
  var key = new THREE.DirectionalLight(0xffe9b8, 1.15);
  key.position.set(4, 6, 6);
  scene.add(key);
  var rim = new THREE.PointLight(0xc9a227, 1.1, 30);
  rim.position.set(-5, 2, 3);
  scene.add(rim);

  // Cover texture drawn on a 2D canvas: deep red cloth, gold frame, studio name
  function coverTexture() {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 724;
    var g = c.getContext('2d');
    g.fillStyle = '#7e1622';
    g.fillRect(0, 0, 512, 724);
    var grad = g.createLinearGradient(0, 0, 512, 724);
    grad.addColorStop(0, 'rgba(255,220,150,0.16)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.28)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 724);
    g.strokeStyle = '#c9a227';
    g.lineWidth = 5;
    g.strokeRect(34, 34, 444, 656);
    g.lineWidth = 1.6;
    g.strokeRect(52, 52, 408, 620);
    g.fillStyle = '#e9cf87';
    g.textAlign = 'center';
    g.font = '44px Georgia, serif';
    g.fillText('✦', 256, 210);
    g.font = '600 54px Georgia, serif';
    g.fillText('EMPIRE', 256, 330);
    g.font = '600 40px Georgia, serif';
    g.fillText('STUDIO', 256, 392);
    g.font = 'italic 25px Georgia, serif';
    g.fillStyle = '#d8b34a';
    g.fillText('Stories, brought to the screen', 256, 470);
    g.font = '30px Georgia, serif';
    g.fillText('✦', 256, 600);
    var tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }

  var book = new THREE.Group();
  var W = 2.3, H = 3.25, D = 0.34;
  var cloth = new THREE.MeshStandardMaterial({ color: 0x7e1622, roughness: 0.72, metalness: 0.08 });
  var gold = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.32, metalness: 0.85 });
  var pagesMat = new THREE.MeshStandardMaterial({ color: 0xf3e9cf, roughness: 0.95 });

  var cover = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), cloth);
  book.add(cover);
  var pages = new THREE.Mesh(new THREE.BoxGeometry(W - 0.1, H - 0.12, D - 0.07), pagesMat);
  pages.position.x = 0.055;
  book.add(pages);
  var front = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.02, H - 0.02),
    new THREE.MeshStandardMaterial({ map: coverTexture(), roughness: 0.6, metalness: 0.1 })
  );
  front.position.z = D / 2 + 0.002;
  book.add(front);
  var spine = new THREE.Mesh(new THREE.BoxGeometry(0.09, H, D + 0.012), gold);
  spine.position.x = -W / 2 + 0.045;
  book.add(spine);
  var band1 = new THREE.Mesh(new THREE.BoxGeometry(W, 0.045, D + 0.012), gold);
  band1.position.y = H / 2 - 0.35;
  book.add(band1);
  var band2 = band1.clone();
  band2.position.y = -H / 2 + 0.35;
  book.add(band2);
  scene.add(book);

  // soft shadow
  var shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.9, 40),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.15;
  scene.add(shadow);

  // gold dust around the book
  var N = 220, pos = new Float32Array(N * 3);
  for (var i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 8;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 5.5;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 0.5;
  }
  var dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var dust = new THREE.Points(dg, new THREE.PointsMaterial({
    color: 0xd8b34a, size: 0.05, transparent: true, opacity: 0.8, depthWrite: false
  }));
  scene.add(dust);

  var mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', function (e) {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    var w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  var running = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { running = en[0].isIntersecting; }, { threshold: 0.05 }).observe(wrap);
  }
  document.addEventListener('visibilitychange', function () { running = !document.hidden; });

  var clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    if (!running) return;
    var t = clock.getElapsedTime();
    mx += (tx - mx) * 0.04;
    my += (ty - my) * 0.04;
    book.rotation.y = t * 0.45 + mx * 0.7;
    book.rotation.x = Math.sin(t * 0.6) * 0.06 + my * 0.25;
    book.position.y = Math.sin(t * 0.9) * 0.14;
    shadow.material.opacity = 0.22 - Math.sin(t * 0.9) * 0.05;
    var sc = 1 - Math.sin(t * 0.9) * 0.03;
    shadow.scale.set(sc, sc, sc);
    dust.rotation.y = t * 0.03;
    renderer.render(scene, camera);
  })();
})();
