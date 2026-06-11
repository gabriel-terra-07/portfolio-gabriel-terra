/* Gabriel Terra — Portfólio · interações */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- partículas (rede de nós) ---------- */
  var canvas = document.getElementById("particles");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var W = 0, H = 0;
    var COLORS = ["rgba(34,211,238,", "rgba(232,121,249,", "rgba(139,92,246,"];

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = rect.width;
      H = canvas.height = rect.height;
    }

    function initParticles() {
      particles = [];
      var count = Math.min(70, Math.floor((W * H) / 16000));
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6,
          c: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      var LINK = 130;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + "0.55)";
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = "rgba(34,211,238," + (0.10 * (1 - d / LINK)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(tick);
    }

    resize();
    initParticles();
    tick();
    window.addEventListener("resize", function () {
      resize();
      initParticles();
    });
  }

  /* ---------- efeito de digitação ---------- */
  var typedEl = document.querySelector(".hero-role .typed");
  if (typedEl) {
    var ROLES = [
      "Analista de Sistemas",
      "Integração & APIs",
      "IBM API Connect · ACE/IIB",
      "AWS API Gateway · REST",
      "OAuth2 · JWT · Segurança de APIs"
    ];
    if (reduceMotion) {
      typedEl.textContent = ROLES[0];
    } else {
      var roleIdx = 0, charIdx = 0, deleting = false;
      (function type() {
        var word = ROLES[roleIdx];
        typedEl.textContent = word.slice(0, charIdx);
        var delay;
        if (!deleting) {
          charIdx++;
          delay = 55 + Math.random() * 50;
          if (charIdx > word.length) { deleting = true; delay = 2100; }
        } else {
          charIdx--;
          delay = 28;
          if (charIdx === 0) {
            deleting = false;
            roleIdx = (roleIdx + 1) % ROLES.length;
            delay = 420;
          }
        }
        setTimeout(type, delay);
      })();
    }
  }

  /* ---------- glitch periódico no nome ---------- */
  var glitchEls = document.querySelectorAll(".glitch");
  if (glitchEls.length && !reduceMotion) {
    setInterval(function () {
      glitchEls.forEach(function (el) {
        el.classList.add("glitching");
        setTimeout(function () { el.classList.remove("glitching"); }, 340);
      });
    }, 3800);
  }

  /* ---------- reveal on scroll ----------
     IO quando disponível + fallback por posição de scroll,
     para que o conteúdo nunca dependa só do callback do IO. */
  var revealPending = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealIn(el) {
    if (el.classList.contains("in")) return;
    el.classList.add("in");
    var idx = revealPending.indexOf(el);
    if (idx !== -1) revealPending.splice(idx, 1);
  }

  function checkReveals() {
    if (!revealPending.length) return;
    var vh = window.innerHeight;
    for (var i = revealPending.length - 1; i >= 0; i--) {
      var rect = revealPending[i].getBoundingClientRect();
      if (rect.top < vh * 0.92 && rect.bottom > 0) revealIn(revealPending[i]);
    }
  }

  if (reduceMotion) {
    revealPending.slice().forEach(revealIn);
  } else {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealIn(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealPending.forEach(function (el) { io.observe(el); });
    }
    window.addEventListener("scroll", checkReveals, { passive: true });
    window.addEventListener("resize", checkReveals, { passive: true });
    checkReveals();
    window.addEventListener("load", checkReveals);
  }

  /* ---------- barra de progresso + link ativo ---------- */
  var progress = document.querySelector(".scroll-progress");
  var navLinks = document.querySelectorAll(".nav-links a");
  var sections = [];
  navLinks.forEach(function (a) {
    var id = a.getAttribute("href");
    if (id && id.charAt(0) === "#") {
      var sec = document.querySelector(id);
      if (sec) sections.push({ link: a, el: sec });
    }
  });

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";

    var current = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el.getBoundingClientRect().top <= window.innerHeight * 0.4) {
        current = sections[i];
      }
    }
    sections.forEach(function (s) {
      s.link.classList.toggle("active", s === current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- brilho que segue o cursor ---------- */
  var glow = document.querySelector(".cursor-glow");
  if (glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mousemove", function (e) {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    });
  } else if (glow) {
    glow.style.display = "none";
  }
})();
