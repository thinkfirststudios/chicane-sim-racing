/* Chicane Sim Racing — spec mockup. Fast, clean, mechanical: a flag dropping, not a neon pulse.
   Everything renders in its final state without JS or under reduced motion. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) root.classList.add("js-motion");

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("site-nav"), head = document.querySelector(".site-head");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      nav.style.setProperty("--nav-top", head.getBoundingClientRect().bottom + "px");
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Close" : "Menu";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { btn.click(); btn.focus(); } });
  }
  if (head) {
    var onScroll = function () { head.classList.toggle("is-condensed", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  // Rotating hero word — theirs: RUSH / THRILL / ADRENALINE / INTENSITY / EXCITEMENT. Reduced motion holds the first word.
  var rot = document.querySelector("[data-rotate]");
  if (rot && root.classList.contains("js-motion")) {
    var words = rot.getAttribute("data-rotate").split("|"), i = 0, span = rot.querySelector("span");
    setInterval(function () {
      rot.classList.add("swap");
      setTimeout(function () {
        i = (i + 1) % words.length; span.textContent = words[i];
        rot.classList.remove("swap"); rot.classList.add("enter");
        void rot.offsetWidth; rot.classList.remove("enter");
      }, 220);
    }, 2620);
  }

  // Count-up — verified published figures only. Decimal-aware. The final value is already in the HTML.
  function countUp(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    if (isNaN(end) || reduce) return;
    var dec = (el.getAttribute("data-count").split(".")[1] || "").length, t0 = null, dur = 560;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = end.toFixed(dec);
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll(".rows-in tbody tr").forEach(function (tr) {
    tr.style.setProperty("--r", Array.prototype.indexOf.call(tr.parentNode.children, tr));
  });

  // Chequer-mask wipe: a 6-column grid of squares clears diagonally, 24ms stagger. Capped at three per page by markup.
  if (root.classList.contains("js-motion")) {
    document.querySelectorAll(".cq-wipe").forEach(function (el) {
      var h = el.getBoundingClientRect().height, w = el.getBoundingClientRect().width, rows = Math.max(3, Math.round(h / (w / 6)));
      var cover = document.createElement("div"); cover.className = "cq-cover"; cover.setAttribute("aria-hidden", "true");
      for (var r = 0; r < rows; r++) for (var c = 0; c < 6; c++) {
        var sq = document.createElement("i"); sq.style.setProperty("--d", r + c); cover.appendChild(sq);
      }
      cover.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";
      el.appendChild(cover);
    });
    document.querySelectorAll(".rv-stagger").forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) { c.classList.add("rv"); c.style.setProperty("--i", i); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        en.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    document.querySelectorAll(".rv, .rows-in, .cq-wipe").forEach(function (el) { io.observe(el); });
  }

  // Forms — not wired. Red = error, white = valid. No other state colours.
  document.querySelectorAll("form[data-mock]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var errId = f.id + "-err", err = document.getElementById(errId);
        var bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
        f.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad) {
          ok = false;
          if (!err) {
            err = document.createElement("p"); err.className = "err"; err.id = errId;
            err.textContent = f.type === "email" ? "Enter a valid email address." : "Please fill this in.";
            f.insertAdjacentElement("afterend", err); f.setAttribute("aria-describedby", errId);
          }
        } else if (err) { err.remove(); f.removeAttribute("aria-describedby"); }
      });
      if (!ok) { var first = form.querySelector('[aria-invalid="true"]'); if (first) first.focus(); return; }
      var status = form.querySelector(".form-status");
      status.hidden = false;
      status.textContent = "Mockup only — [FORM ENDPOINT — NOT WIRED]. Nothing was sent. To reach Chicane now, call (501) 615-8529.";
      status.focus();
    });
  });
})();
