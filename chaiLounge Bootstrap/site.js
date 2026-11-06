/* ============================================================
   Chai Lounge - shared site script
   Plain JavaScript, no libraries: animated mobile menu,
   scroll reveal, photo carousel, front-end form confirmations.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Animated mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function setMenu(open) {
    if (!toggle || !mobileMenu) { return; }
    toggle.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('menu-open', open);
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      setMenu(!mobileMenu.classList.contains('open'));
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { setMenu(false); }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealItems = document.querySelectorAll('[data-reveal]');
  if (revealItems.length) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });
      revealItems.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ---------- Photo carousel ---------- */
  var carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    var track = carousel.querySelector('.carousel-track');
    var slides = carousel.querySelectorAll('.carousel-slide');
    var prevBtn = carousel.querySelector('.carousel-arrow.prev');
    var nextBtn = carousel.querySelector('.carousel-arrow.next');
    var dotsWrap = carousel.querySelector('.carousel-dots');
    var index = 0;
    var timer = null;
    var autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var dots = [];
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to photo ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); restart(); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      dots.forEach(function (dot, d) {
        dot.classList.toggle('active', d === index);
      });
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }
    function start() {
      if (!autoplay || timer) { return; }
      timer = window.setInterval(next, 4500);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    function restart() { stop(); start(); }

    if (nextBtn) { nextBtn.addEventListener('click', function () { next(); restart(); }); }
    if (prevBtn) { prevBtn.addEventListener('click', function () { prev(); restart(); }); }
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);

    /* Touch swipe */
    var touchX = null;
    carousel.addEventListener('touchstart', function (event) {
      touchX = event.changedTouches[0].clientX;
      stop();
    }, { passive: true });
    carousel.addEventListener('touchend', function (event) {
      if (touchX === null) { return; }
      var dx = event.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) { next(); } else { prev(); }
      }
      touchX = null;
      start();
    }, { passive: true });

    goTo(0);
    start();
  }

  /* ---------- Front-end only forms ----------
     There is no back end on this static site, so submitting a
     form swaps in a confirmation message instead of posting. */
  document.querySelectorAll('form[data-front-end]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var success = document.getElementById(form.getAttribute('data-success'));
      form.style.display = 'none';
      if (success) {
        success.classList.add('show');
        success.setAttribute('tabindex', '-1');
        success.focus();
      }
    });
  });
})();
