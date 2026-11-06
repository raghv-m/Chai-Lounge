/* Chai Lounge - shared site script. Plain JavaScript, no
   libraries: mobile menu, scroll reveal, carousel, forms. */
(function () {
  'use strict';

  /* ---------- Animated mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function setMenu(open, returnFocus) {
    if (!toggle || !mobileMenu) { return; }
    toggle.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      /* Move keyboard focus into the menu so it can be used without a pointer */
      var firstLink = mobileMenu.querySelector('.mobile-links a') || mobileMenu.querySelector('a');
      if (firstLink) {
        window.setTimeout(function () { firstLink.focus(); }, 80);
      }
    } else if (returnFocus) {
      toggle.focus();
    }
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      setMenu(!mobileMenu.classList.contains('open'));
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (!mobileMenu.classList.contains('open')) { return; }
      if (event.key === 'Escape') { setMenu(false, true); }
      if (event.key === 'Tab') {
        /* Keep Tab cycling inside the open menu (toggle + menu links) */
        var focusables = [toggle].concat(
          Array.prototype.slice.call(mobileMenu.querySelectorAll('a'))
        );
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }
    });
  }

  /* ---------- Scroll reveal ----------
     Hidden state is armed from here (html.reveal-on), so a script
     failure leaves content visible. Zero-threshold observer plus a
     scroll listener plus a timed backstop: nothing stays blank. */
  var revealItems = document.querySelectorAll('[data-reveal]');
  if (revealItems.length) {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      document.documentElement.classList.add('reveal-on');
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px 12% 0px' });
      revealItems.forEach(function (el) { observer.observe(el); });
      var revealPassed = function () {
        revealItems.forEach(function (el) {
          if (!el.classList.contains('is-visible') &&
              el.getBoundingClientRect().top < window.innerHeight * 0.98) {
            el.classList.add('is-visible');
            observer.unobserve(el);
          }
        });
      };
      window.addEventListener('scroll', revealPassed, { passive: true });
      revealPassed();
      window.setTimeout(function () {
        revealItems.forEach(function (el) { el.classList.add('is-visible'); });
      }, 3000);
    }
  }

  /* ---------- Photo carousel ----------
     Autoplay pauses on hover/focus/touch, stops for good after any
     manual navigation, and never runs under reduced motion. */
  var carousel = document.querySelector('[data-carousel]');
  if (carousel) {
    var track = carousel.querySelector('.carousel-track');
    var slides = carousel.querySelectorAll('.carousel-slide');
    var prevBtn = carousel.querySelector('.carousel-arrow.prev');
    var nextBtn = carousel.querySelector('.carousel-arrow.next');
    var dotsWrap = carousel.querySelector('.carousel-dots');
    var status = carousel.querySelector('[data-carousel-status]');
    var index = 0;
    var timer = null;
    var autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var userStopped = false;

    var dots = [];
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Go to photo ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); stopForGood(); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      dots.forEach(function (dot, d) {
        var active = d === index;
        dot.classList.toggle('active', active);
        if (active) { dot.setAttribute('aria-current', 'true'); }
        else { dot.removeAttribute('aria-current'); }
      });
      slides.forEach(function (slide, s) {
        slide.setAttribute('aria-hidden', s === index ? 'false' : 'true');
      });
      if (status) {
        var img = slides[index].querySelector('img');
        status.textContent = 'Photo ' + (index + 1) + ' of ' + slides.length +
          (img && img.alt ? ': ' + img.alt : '');
      }
    }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }
    function start() {
      if (!autoplay || userStopped || timer) { return; }
      timer = window.setInterval(next, 4500);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    function stopForGood() { userStopped = true; stop(); }

    if (nextBtn) { nextBtn.addEventListener('click', function () { next(); stopForGood(); }); }
    if (prevBtn) { prevBtn.addEventListener('click', function () { prev(); stopForGood(); }); }
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });

    /* Arrow keys move between photos when the carousel has focus */
    carousel.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { event.preventDefault(); next(); stopForGood(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); prev(); stopForGood(); }
    });

    /* Touch swipe: pause while touching, swipe to change photo */
    var touchX = null;
    carousel.addEventListener('touchstart', function (event) {
      touchX = event.changedTouches[0].clientX;
      stop();
    }, { passive: true });
    carousel.addEventListener('touchend', function (event) {
      if (touchX === null) { return; }
      var dx = event.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 40) {
        if (dx < 0) { next(); } else { prev(); }
        stopForGood();
      } else {
        start();
      }
    }, { passive: true });

    goTo(0);
    start();
  }

  /* Front-end only forms: no back end, so a submit swaps in
     a confirmation message instead of posting. */
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
