/* PulmoAI research website | R26-IT-065 */
(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress span");
  const timeline = document.querySelector(".timeline");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── hero: switch the films on once their images have loaded ── */
  const wall = document.querySelector(".wall");
  if (wall) {
    const imgs = Array.from(wall.querySelectorAll("img"));
    const loaded = imgs.map((img) => img.complete ? Promise.resolve() :
      new Promise((res) => { img.addEventListener("load", res, { once: true }); img.addEventListener("error", res, { once: true }); }));
    let started = false;
    const start = () => { if (!started) { started = true; requestAnimationFrame(() => wall.classList.add("play")); } };
    Promise.all(loaded).then(start);
    setTimeout(start, 2500); // never leave the films dark on a slow connection
  }

  /* ── scroll: header border, progress bar, timeline fill ────── */
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 8);
    progress.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : 0);

    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const mid = window.innerHeight * 0.6;
      const fill = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      timeline.style.setProperty("--fill", fill.toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ── navigation: mobile menu and dropdowns ─────────────────── */
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  const subs = document.querySelectorAll(".has-sub");

  function closeSubs(except) {
    subs.forEach((li) => {
      if (li === except) return;
      li.classList.remove("open");
      li.querySelector(".sub-toggle").setAttribute("aria-expanded", "false");
    });
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.querySelector(".sr-only").textContent = open ? "Open menu" : "Close menu";
    menu.classList.toggle("open", !open);
    if (open) closeSubs();
  });

  subs.forEach((li) => {
    const btn = li.querySelector(".sub-toggle");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = li.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      closeSubs(li);
    });
    li.addEventListener("mouseenter", () => {
      if (window.innerWidth > 860) { li.classList.add("open"); btn.setAttribute("aria-expanded", "true"); closeSubs(li); }
    });
    li.addEventListener("mouseleave", () => {
      if (window.innerWidth > 860) { li.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); }
    });
  });

  document.addEventListener("click", (e) => { if (!e.target.closest(".has-sub")) closeSubs(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openLi = document.querySelector(".has-sub.open");
      closeSubs();
      if (openLi) openLi.querySelector(".sub-toggle").focus();
    }
  });

  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    closeSubs();
    if (menu.classList.contains("open")) {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.querySelector(".sr-only").textContent = "Open menu";
    }
  }));

  /* ── scroll reveal ─────────────────────────────────────────── */
  const groups = ".gap-list, .objectives, .people, .files, .timeline, .tech";
  const targets = [];
  document.querySelectorAll(".section-head, .video-card").forEach((el) => targets.push(el));
  document.querySelectorAll(".section-body > *").forEach((el) => {
    if (el.matches(groups)) {
      Array.from(el.children).forEach((child, i) => { child.style.transitionDelay = (i % 4) * 80 + "ms"; targets.push(child); });
    } else {
      targets.push(el);
    }
  });
  document.querySelectorAll(".tech-group").forEach((el, i) => { el.style.transitionDelay = (i % 3) * 80 + "ms"; });

  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
    // the radiologist bar chart grows when it scrolls into view
    document.querySelectorAll(".ratio").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".ratio").forEach((el) => el.classList.add("in"));
  }

  /* ── milestones: mark completed and upcoming from today's date ── */
  if (timeline) {
    const now = new Date();
    const items = Array.from(timeline.querySelectorAll("li[data-end]"));
    const endOf = (li) => new Date(li.dataset.end + "T23:59:59");
    let nextEnd = null;
    items.forEach((li) => {
      const end = endOf(li);
      if (end < now) li.classList.add("done");
      else if (!nextEnd || end < nextEnd) nextEnd = end;
    });
    items.forEach((li) => {
      const time = li.querySelector("time");
      const tag = document.createElement("span");
      if (li.classList.contains("done")) {
        tag.className = "tag tag-done"; tag.textContent = "Completed";
      } else if (nextEnd && endOf(li).getTime() === nextEnd.getTime()) {
        li.classList.add("next"); tag.className = "tag tag-next"; tag.textContent = "Up next";
      } else return;
      time.appendChild(tag);
    });
  }

  /* ── tabs (keyboard accessible) ────────────────────────────── */
  document.querySelectorAll("[data-tabs]").forEach((tabs) => {
    const buttons = Array.from(tabs.querySelectorAll('[role="tab"]'));

    function select(btn, focus) {
      buttons.forEach((b) => {
        const on = b === btn;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) btn.focus();
    }

    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => select(btn));
      btn.addEventListener("keydown", (e) => {
        let j = null;
        if (e.key === "ArrowRight") j = (i + 1) % buttons.length;
        if (e.key === "ArrowLeft") j = (i - 1 + buttons.length) % buttons.length;
        if (e.key === "Home") j = 0;
        if (e.key === "End") j = buttons.length - 1;
        if (j !== null) { e.preventDefault(); select(buttons[j], true); }
      });
    });

    // the component strip under the hero opens the matching tab
    document.querySelectorAll("[data-tab]").forEach((link) => {
      link.addEventListener("click", (e) => {
        const btn = buttons.find((b) => b.getAttribute("aria-controls") === link.dataset.tab);
        if (!btn) return;
        e.preventDefault();
        select(btn);
        document.getElementById("components").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  });

  /* ── before / after comparison slider ──────────────────────── */
  document.querySelectorAll("[data-compare]").forEach((box) => {
    const range = box.querySelector('input[type="range"]');
    const set = (v) => box.style.setProperty("--pos", v + "%");
    range.addEventListener("input", () => set(range.value));
    set(range.value);

    if (!reduceMotion && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const frames = [50, 72, 28, 50];
        let k = 0;
        const step = () => {
          if (k >= frames.length || box.dataset.touched) return;
          const from = Number(range.value), to = frames[k++];
          const t0 = performance.now();
          const tick = (t) => {
            if (box.dataset.touched) return;
            const p = Math.min(1, (t - t0) / 450);
            const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
            const v = from + (to - from) * e;
            range.value = v; set(v);
            if (p < 1) requestAnimationFrame(tick); else setTimeout(step, 120);
          };
          requestAnimationFrame(tick);
        };
        setTimeout(step, 400);
      }, { threshold: 0.6 });
      io.observe(box);
      range.addEventListener("pointerdown", () => { box.dataset.touched = "1"; });
      range.addEventListener("keydown", () => { box.dataset.touched = "1"; });
    }
  });

  /* ── lung cancer: switch between branch heatmaps ───────────── */
  document.querySelectorAll("[data-branches]").forEach((box) => {
    const buttons = box.querySelectorAll("[data-show]");
    buttons.forEach((btn) => btn.addEventListener("click", () => {
      const key = btn.dataset.show;
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      box.querySelectorAll("[data-b]").forEach((img) => img.classList.toggle("on", img.dataset.b === key));
      box.querySelectorAll("[data-for]").forEach((p) => { p.hidden = p.dataset.for !== key; });
    }));
  });

  /* ── videos: load the YouTube player only when asked ───────── */
  document.querySelectorAll(".video[data-yt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (window.PULMO_PREVIEW) { window.open(btn.dataset.url, "_blank", "noopener"); return; }
      const box = document.createElement("div");
      box.className = "video";
      const frame = document.createElement("iframe");
      frame.src = "https://www.youtube.com/embed/" + btn.dataset.yt + "?autoplay=1&rel=0";
      frame.title = btn.getAttribute("aria-label").replace(/^Play /, "");
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.allowFullscreen = true;
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      box.appendChild(frame);
      btn.replaceWith(box);
    });
  });

  /* ── image zoom ────────────────────────────────────────────── */
  const dialog = document.querySelector("dialog.zoom");
  if (dialog && typeof dialog.showModal === "function") {
    const big = dialog.querySelector("img");
    const cap = dialog.querySelector("figcaption");
    let opener = null;

    document.querySelectorAll("img[data-zoom]").forEach((img) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "zoom-btn";
      btn.setAttribute("aria-label", "Enlarge image: " + img.alt);
      img.replaceWith(btn);
      btn.appendChild(img);
      btn.addEventListener("click", () => {
        const fig = img.closest("figure");
        const text = fig && fig.querySelector("figcaption");
        big.src = img.currentSrc || img.src;
        big.alt = img.alt;
        cap.textContent = text ? text.textContent : "";
        opener = btn;
        dialog.showModal();
      });
    });

    dialog.querySelector(".zoom-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => { if (opener) opener.focus(); });
  }

  /* ── contact form: opens the visitor's email app ───────────── */
  const form = document.querySelector(".contact-form");
  if (form) {
    const status = form.querySelector(".form-status");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fields = ["name", "email", "message"].map((n) => form.elements[n]);
      let firstBad = null;
      fields.forEach((f) => {
        const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
        f.setAttribute("aria-invalid", String(bad));
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        status.className = "form-status error";
        status.textContent = firstBad.name === "email" && firstBad.value
          ? "Enter a valid email address, for example name@example.com."
          : "Fill in your name, email and message before sending.";
        firstBad.focus();
        return;
      }
      if (window.PULMO_PREVIEW) {
        status.className = "form-status ok";
        status.textContent = "Preview only. On the live website this opens the visitor's email app with the message ready to send to " + form.dataset.email + ".";
        return;
      }
      const [name, email, message] = fields.map((f) => f.value.trim());
      const subject = encodeURIComponent("R26-IT-065 website enquiry from " + name);
      const body = encodeURIComponent(message + "\n\n" + name + "\n" + email);
      window.location.href = "mailto:" + form.dataset.email + "?subject=" + subject + "&body=" + body;
      status.className = "form-status ok";
      status.textContent = "Your email app should open with the message ready to send.";
    });
  }
})();
