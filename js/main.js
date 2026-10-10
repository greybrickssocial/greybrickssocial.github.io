// ============================================================
// GREY BRICKS — site behaviour
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  /* ---- sticky nav ---- */
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- mobile menu ---- */
  const toggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("open");
      mobileMenu.classList.toggle("open");
      document.body.style.overflow = mobileMenu.classList.contains("open")
        ? "hidden"
        : "";
    });
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        toggle.classList.remove("open");
        mobileMenu.classList.remove("open");
        document.body.style.overflow = "";
      }),
    );
  }

  /* ---- hero carousel ---- */
  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroDots = document.querySelectorAll(".hero-dot");
  let heroIndex = 0;
  let heroTimer;

  function goToSlide(i) {
    if (!heroSlides.length) return;
    heroSlides[heroIndex].classList.remove("active");
    heroDots[heroIndex] && heroDots[heroIndex].classList.remove("active");
    heroIndex = (i + heroSlides.length) % heroSlides.length;
    heroSlides[heroIndex].classList.add("active");
    heroDots[heroIndex] && heroDots[heroIndex].classList.add("active");
  }
  function nextSlide() {
    goToSlide(heroIndex + 1);
  }
  function prevSlide() {
    goToSlide(heroIndex - 1);
  }
  function startHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(nextSlide, 6000);
  }
  if (heroSlides.length) {
    startHeroTimer();
    document.querySelector(".hero-next")?.addEventListener("click", () => {
      nextSlide();
      startHeroTimer();
    });
    document.querySelector(".hero-prev")?.addEventListener("click", () => {
      prevSlide();
      startHeroTimer();
    });
    heroDots.forEach((dot, i) =>
      dot.addEventListener("click", () => {
        goToSlide(i);
        startHeroTimer();
      }),
    );

    // touch swipe
    let touchX = null;
    const heroEl = document.querySelector(".hero");
    heroEl?.addEventListener(
      "touchstart",
      (e) => (touchX = e.touches[0].clientX),
      { passive: true },
    );
    heroEl?.addEventListener(
      "touchend",
      (e) => {
        if (touchX === null) return;
        const diff = e.changedTouches[0].clientX - touchX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? prevSlide() : nextSlide();
          startHeroTimer();
        }
        touchX = null;
      },
      { passive: true },
    );
  }

  /* ---- scroll reveal ---- */
  const revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---- animated counters ---- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const countIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || "";
          const duration = 1600;
          const start = performance.now();
          function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const val = target * eased;
            el.textContent =
              (target % 1 === 0 ? Math.floor(val) : val.toFixed(1)) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          countIo.unobserve(el);
        });
      },
      { threshold: 0.4 },
    );
    counters.forEach((el) => countIo.observe(el));
  }

  /* ---- project filter (Our Projects page) ---- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectSections = document.querySelectorAll(".project-section");
  const sectionDividers = document.querySelectorAll(
    ".project-section + .brick-course",
  );
  if (filterBtns.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.filter;
        const showAll = filter === "all";
        projectSections.forEach((section) => {
          const show = showAll || section.id === filter.toLowerCase();
          section.style.display = show ? "" : "none";
          if (show) {
            section
              .querySelectorAll(".reveal, .reveal-stagger")
              .forEach((el) => el.classList.add("in"));
          }
        });
        sectionDividers.forEach((div) => {
          div.style.display =
            showAll || div.previousElementSibling.style.display !== "none"
              ? ""
              : "none";
        });
      });
    });
  }

  /* ---- contact form ---- */
  const form = document.querySelector(".contact-form");
  if (form) {
    const cfg = window.GB_CONFIG || {};
    const note = form.querySelector(".form-note");
    const submit = form.querySelector('button[type="submit"]');
    const submitLabel = form.querySelector(".contact-submit-label");
    const fields = [...form.querySelectorAll("input, textarea, select")];
    const editable = fields.filter((f) => f.type !== "hidden");

    const setNote = (text, state) => {
      if (!note) return;
      note.textContent = text || "";
      note.className = "form-note" + (state ? " is-" + state : "");
    };

    /* only the button is disabled: sendForm reads FormData, which skips disabled fields */
    const setBusy = (busy) => {
      if (submit) submit.disabled = busy;
      form.setAttribute("aria-busy", busy);
      if (submitLabel)
        submitLabel.textContent = busy ? "Sending…" : "Send Message";
    };

    const clearErrors = () => {
      editable.forEach((f) => f.removeAttribute("aria-invalid"));
    };

    const markInvalid = (el) => {
      const clear = () => {
        el.removeAttribute("aria-invalid");
        el.removeEventListener("input", clear);
      };
      el.setAttribute("aria-invalid", "true");
      el.addEventListener("input", clear);
      el.focus();
    };

    const read = () => {
      const out = {};
      editable.forEach((f) => {
        if (f.name) out[f.name] = f.value.trim();
      });
      return out;
    };

    const fullnameEl = form.querySelector("#fullname");
    const mobileEl = form.querySelector("#mobile");
    const emailEl = form.querySelector("#email");
    const messageEl = form.querySelector("#message");
    const honeypot = form.querySelector("#company_website");

    /* reject implausible numbers (7-15 digits, allowing + and spaces) */
    const phoneDigits = (v) => v.replace(/\D/g, "");

    const validate = () => {
      clearErrors();
      const data = read();
      const fail = (el, msg) => {
        markInvalid(el);
        setNote(msg, "error");
        return false;
      };

      if (data.fullname.trim().length < 3)
        return fail(fullnameEl, "Please enter your full name.");

      const digits = phoneDigits(data.mobile);
      if (digits.length < 7 || digits.length > 15)
        return fail(mobileEl, "Please enter a valid mobile number.");

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email))
        return fail(emailEl, "Please enter a valid email address.");

      if (data.message.trim().length < 10)
        return fail(
          messageEl,
          "Please add a little more detail to your message.",
        );

      setNote("");
      return true;
    };

    const setHidden = (name, value) => {
      const el = form.querySelector(`[name="${name}"]`);
      if (el) el.value = value;
    };

    /* pre-select the project when arriving from a project card link */
    const prefillProject = () => {
      const select = form.querySelector("#project");
      if (!select) return;
      const wanted = new URLSearchParams(window.location.search).get("project");
      if (!wanted) return;
      const match = [...select.options].find((o) => o.value === wanted.trim());
      if (match) select.value = match.value;
    };
    prefillProject();

    const stampContext = (data) => {
      const project = data.project || "";
      setHidden("enquiry_type", project || "General enquiry");
      setHidden("email_subject", `New enquiry — ${project || "General"}`);
      setHidden("source_page", document.referrer || window.location.href);
      setHidden(
        "submitted_at",
        new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      );
      setHidden("recipient", cfg.contactEmail || "");
    };

    const isConfigured = () =>
      Boolean(
        window.emailjs &&
        cfg.emailjsPublicKey &&
        cfg.emailjsServiceId &&
        cfg.emailjsTemplateId &&
        !/REPLACE_ME/.test(
          cfg.emailjsPublicKey + cfg.emailjsServiceId + cfg.emailjsTemplateId,
        ),
      );

    /* EmailJS rejects with { status, text, message } — surface it usefully */
    const describeError = (err) => {
      const status =
        err && (err.status || (err.response && err.response.status));
      const text =
        (err && (err.text || err.message)) ||
        (err && err.response && err.response.text) ||
        "Unknown error";
      console.error(
        `[Grey Bricks] Enquiry failed (${status || "no status"}): ${text}`,
        err,
      );
      return { status, text: String(text) };
    };

    /* append ?debug=1 to the URL to show the real reason on the page */
    const debugMode = new URLSearchParams(window.location.search).has("debug");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = read();

      /* bot filled the hidden field — pretend it worked, send nothing */
      if (honeypot && honeypot.value) {
        form.reset();
        setNote(
          "Thank you — our team will get back to you shortly.",
          "success",
        );
        return;
      }

      if (!validate()) return;

      if (!isConfigured()) {
        setNote(
          "Enquiries are temporarily unavailable. Please call or WhatsApp us on +91 91727 32323.",
          "error",
        );
        return;
      }

      stampContext(data);
      setBusy(true);
      setNote("Sending your enquiry…", "pending");

      window.emailjs
        .sendForm(cfg.emailjsServiceId, cfg.emailjsTemplateId, form, {
          publicKey: cfg.emailjsPublicKey,
        })

        .then(() => {
          form.reset();
          setNote(
            `Thank you, ${data.fullname.split(" ")[0]}. Our team will get back to you shortly.`,
            "success",
          );
        })
        .catch((err) => {
          const { status, text } = describeError(err);
          setNote(
            "Sorry, we could not send that. Please try again, or call us on +91 91727 32323.",
            "error",
          );
          if (debugMode) {
            const dbg = form.querySelector(".form-debug");
            if (dbg) {
              dbg.hidden = false;
              dbg.textContent = `Debug — HTTP ${status || "?"}: ${text}`;
            }
          }
        })
        .finally(() => setBusy(false));
    });
  }
});
