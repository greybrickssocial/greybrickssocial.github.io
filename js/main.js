// ============================================================
// GREY BRICKS — site behaviour
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- sticky nav ---- */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- mobile menu ---- */
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  /* ---- hero carousel ---- */
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-dot');
  let heroIndex = 0;
  let heroTimer;

  function goToSlide(i) {
    if (!heroSlides.length) return;
    heroSlides[heroIndex].classList.remove('active');
    heroDots[heroIndex] && heroDots[heroIndex].classList.remove('active');
    heroIndex = (i + heroSlides.length) % heroSlides.length;
    heroSlides[heroIndex].classList.add('active');
    heroDots[heroIndex] && heroDots[heroIndex].classList.add('active');
  }
  function nextSlide() { goToSlide(heroIndex + 1); }
  function prevSlide() { goToSlide(heroIndex - 1); }
  function startHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(nextSlide, 6000);
  }
  if (heroSlides.length) {
    startHeroTimer();
    document.querySelector('.hero-next')?.addEventListener('click', () => { nextSlide(); startHeroTimer(); });
    document.querySelector('.hero-prev')?.addEventListener('click', () => { prevSlide(); startHeroTimer(); });
    heroDots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); startHeroTimer(); }));

    // touch swipe
    let touchX = null;
    const heroEl = document.querySelector('.hero');
    heroEl?.addEventListener('touchstart', e => touchX = e.touches[0].clientX, { passive: true });
    heroEl?.addEventListener('touchend', e => {
      if (touchX === null) return;
      const diff = e.changedTouches[0].clientX - touchX;
      if (Math.abs(diff) > 50) { diff > 0 ? prevSlide() : nextSlide(); startHeroTimer(); }
      touchX = null;
    }, { passive: true });
  }

  /* ---- scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---- animated counters ---- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 1600;
        const start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = (target % 1 === 0 ? Math.floor(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countIo.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => countIo.observe(el));
  }

  /* ---- project filter (Our Projects page) ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectSections = document.querySelectorAll('.project-section');
  const sectionDividers = document.querySelectorAll('.project-section + .brick-course');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        const showAll = filter === 'all';
        projectSections.forEach(section => {
          const show = showAll || section.id === filter.toLowerCase();
          section.style.display = show ? '' : 'none';
          if (show) {
            section.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('in'));
          }
        });
        sectionDividers.forEach(div => {
          div.style.display =
            showAll || div.previousElementSibling.style.display !== 'none' ? '' : 'none';
        });
      });
    });
  }

  /* ---- contact form (static demo submit) ---- */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Message Sent';
      btn.disabled = true;
      form.querySelectorAll('input, textarea, select').forEach(f => f.disabled = true);
      const note = form.querySelector('.form-note');
      if (note) note.textContent = "Thank you — our team will get back to you shortly.";
      setTimeout(() => {
        form.reset();
        form.querySelectorAll('input, textarea, select').forEach(f => f.disabled = false);
        btn.textContent = original;
        btn.disabled = false;
        if (note) note.textContent = '';
      }, 4000);
    });
  }

});
