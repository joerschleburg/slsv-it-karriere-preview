/* ============================================
   SLSV Lotto Bayern — IT-Karriere-Landingpage
   JavaScript: Interaktionen & Animationen
   ============================================ */

(function() {
  'use strict';

  // ========================================
  // 1. SCROLL ANIMATIONS (IntersectionObserver)
  // ========================================
  function initScrollAnimations() {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right')
        .forEach(function(el) { el.classList.add('is-visible'); });
      return;
    }

    var observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right')
      .forEach(function(el) { observer.observe(el); });
  }

  // ========================================
  // 2. COUNTER ANIMATION (Fakten-Leiste)
  // ========================================
  function initCounters() {
    var counterElements = document.querySelectorAll('.facts__number[data-target]');
    if (counterElements.length === 0) return;

    var counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterElements.forEach(function(el) { counterObserver.observe(el); });
  }

  function animateCounter(element) {
    var target = parseFloat(element.dataset.target);
    if (isNaN(target)) return; // skip text cards like "Theresienwiese"

    var suffix = element.dataset.suffix || '';
    var decimals = parseInt(element.dataset.decimals) || 0;
    var duration = 2000;
    var startTime = performance.now();

    function update(currentTime) {
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // easeOutQuart for smooth deceleration
      var eased = 1 - Math.pow(1 - progress, 4);
      var current = eased * target;

      element.textContent = current.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ========================================
  // 3. STICKY NAVIGATION (SLSV Corporate Header)
  // ========================================
  function initStickyNav() {
    var siteHeader = document.getElementById('nav');
    var subnav = document.getElementById('subnav');
    var hero = document.getElementById('hero');
    if (!siteHeader || !hero) return;

    // Add subtle shadow when scrolled past hero
    var navObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        siteHeader.classList.toggle('site-header--scrolled', !entry.isIntersecting);
      });
    }, { threshold: 0, rootMargin: '-108px 0px 0px 0px' });

    navObserver.observe(hero);

    // Active section highlighting for subnav links
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav__link');

    var sectionObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function(link) {
            link.classList.toggle('nav__link--active',
              link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-50% 0px -50% 0px' });

    sections.forEach(function(section) { sectionObserver.observe(section); });
  }

  // ========================================
  // 4. MOBILE NAV TOGGLE
  // ========================================
  function initMobileNav() {
    var burger = document.getElementById('nav-burger');
    var subnavLinks = document.getElementById('nav-links');
    if (!burger || !subnavLinks) return;

    burger.addEventListener('click', function() {
      var isOpen = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', !isOpen);
      burger.setAttribute('aria-label', isOpen ? 'Menü öffnen' : 'Menü schließen');
      subnavLinks.classList.toggle('nav__links--open');
      document.body.classList.toggle('no-scroll', !isOpen);
    });

    // Close on link click
    subnavLinks.querySelectorAll('.subnav__link').forEach(function(link) {
      link.addEventListener('click', function() {
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Menü öffnen');
        subnavLinks.classList.remove('nav__links--open');
        document.body.classList.remove('no-scroll');
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Menü öffnen');
        subnavLinks.classList.remove('nav__links--open');
        document.body.classList.remove('no-scroll');
        burger.focus();
      }
    });
  }

  // ========================================
  // 5. FLOATING CTA BUTTON
  // ========================================
  function initStickyCTA() {
    var stickyBtn = document.getElementById('sticky-btn');
    var aboutSection = document.getElementById('about');
    var footerCTA = document.getElementById('footer-cta');
    if (!stickyBtn || !aboutSection || !footerCTA) return;

    var isAboutPassed = false;

    // Show after scrolling past "about" section
    var showObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          isAboutPassed = true;
          stickyBtn.hidden = false;
          stickyBtn.setAttribute('aria-hidden', 'false');
          requestAnimationFrame(function() {
            stickyBtn.classList.add('sticky-btn--visible');
          });
        }
      });
    }, { threshold: 0 });

    showObserver.observe(aboutSection);

    // Hide when footer-CTA is in view
    var hideObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (isAboutPassed) {
          stickyBtn.classList.toggle('sticky-btn--visible', !entry.isIntersecting);
        }
      });
    }, { threshold: 0.1 });

    hideObserver.observe(footerCTA);
  }

  // ========================================
  // 6. JOB CARD ACCORDIONS
  // ========================================
  function initJobAccordions() {
    document.querySelectorAll('.jobs__card-header').forEach(function(header) {
      header.addEventListener('click', function() {
        toggleAccordion(header);
      });

      header.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAccordion(header);
        }
      });
    });
  }

  function toggleAccordion(trigger) {
    var isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    var targetId = trigger.getAttribute('aria-controls');
    var target = document.getElementById(targetId);
    if (!target) return;

    trigger.setAttribute('aria-expanded', !isExpanded);
    target.hidden = isExpanded;
  }

  // ========================================
  // 7. FAQ ACCORDION
  // ========================================
  function initFAQAccordion() {
    document.querySelectorAll('.faq__question').forEach(function(button) {
      button.addEventListener('click', function() {
        var isExpanded = button.getAttribute('aria-expanded') === 'true';
        var targetId = button.getAttribute('aria-controls');
        var target = document.getElementById(targetId);
        if (!target) return;

        // Close all others (only-one-open behavior)
        document.querySelectorAll('.faq__question[aria-expanded="true"]')
          .forEach(function(other) {
            if (other !== button) {
              other.setAttribute('aria-expanded', 'false');
              var otherTarget = document.getElementById(other.getAttribute('aria-controls'));
              if (otherTarget) otherTarget.hidden = true;
            }
          });

        button.setAttribute('aria-expanded', !isExpanded);
        target.hidden = isExpanded;
      });
    });
  }

  // ========================================
  // 8. CONTACT FORM VALIDATION
  // ========================================
  function initContactForm() {
    var form = document.querySelector('.contact__form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var name = form.querySelector('#contact-name');
      var email = form.querySelector('#contact-email');
      var privacy = form.querySelector('#contact-privacy');
      var isValid = true;

      // Clear previous errors
      form.querySelectorAll('.form-group__input--error').forEach(function(el) {
        el.classList.remove('form-group__input--error');
      });

      // Validate required fields
      [name, email].forEach(function(field) {
        if (!field || !field.checkValidity()) {
          if (field) field.classList.add('form-group__input--error');
          isValid = false;
        }
      });

      // Validate checkbox
      if (privacy && !privacy.checked) {
        privacy.classList.add('form-group__input--error');
        isValid = false;
      }

      if (isValid) {
        // Show success message (static version)
        form.innerHTML = '<div class="contact__success">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E8B829" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto var(--space-lg);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' +
          '<h3>Danke für deine Nachricht!</h3>' +
          '<p>Wir melden uns zeitnah bei dir.</p>' +
          '</div>';
      }
    });

    // Real-time validation feedback
    form.querySelectorAll('input[required], select[required]').forEach(function(field) {
      field.addEventListener('blur', function() {
        if (field.value && field.checkValidity()) {
          field.classList.remove('form-group__input--error');
        }
      });
    });
  }

  // ========================================
  // 9. SMOOTH SCROLL (progressive enhancement)
  // ========================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var href = anchor.getAttribute('href');
        if (href === '#') return;

        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Update URL without page jump
          if (history.pushState) {
            history.pushState(null, null, href);
          }
        }
      });
    });
  }

  // ========================================
  // 10. CULTURE IMAGE SLIDER
  // ========================================
  function initCultureSlider() {
    var track = document.getElementById('culture-slider-track');
    var prevBtn = document.getElementById('slider-prev');
    var nextBtn = document.getElementById('slider-next');
    var dotsContainer = document.getElementById('slider-dots');
    if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

    var slides = track.querySelectorAll('.slider__slide');
    var totalSlides = slides.length;
    if (totalSlides === 0) return;

    var currentIndex = 0;
    var gap = 16; // 1rem
    var startX = 0;
    var isDragging = false;

    function getSlidesPerView() {
      var w = window.innerWidth;
      if (w >= 1024) return 3;
      if (w >= 768) return 2;
      return 1;
    }

    function getMaxIndex() {
      return Math.max(0, totalSlides - getSlidesPerView());
    }

    function goToSlide(index) {
      var perView = getSlidesPerView();
      var maxIdx = Math.max(0, totalSlides - perView);
      currentIndex = Math.max(0, Math.min(index, maxIdx));

      var slideWidth = track.parentElement.offsetWidth;
      var singleWidth = (slideWidth - gap * (perView - 1)) / perView;
      var offset = currentIndex * (singleWidth + gap);
      track.style.transform = 'translateX(-' + offset + 'px)';

      updateButtons();
      updateDots();
    }

    function updateButtons() {
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= getMaxIndex();
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      var count = getMaxIndex() + 1;
      if (count <= 1) return;

      for (var i = 0; i < count; i++) {
        var dot = document.createElement('button');
        dot.className = 'slider__dot' + (i === currentIndex ? ' slider__dot--active' : '');
        dot.setAttribute('aria-label', 'Bild ' + (i + 1));
        dot.dataset.index = i;
        dot.addEventListener('click', function() {
          goToSlide(parseInt(this.dataset.index));
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      var dots = dotsContainer.querySelectorAll('.slider__dot');
      dots.forEach(function(dot, i) {
        dot.classList.toggle('slider__dot--active', i === currentIndex);
      });
    }

    prevBtn.addEventListener('click', function() {
      goToSlide(currentIndex - 1);
    });

    nextBtn.addEventListener('click', function() {
      goToSlide(currentIndex + 1);
    });

    // Touch / swipe support
    track.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
      if (!isDragging) return;
      isDragging = false;
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goToSlide(currentIndex + (diff > 0 ? 1 : -1));
      }
    }, { passive: true });

    // Resize handler
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        var maxIdx = getMaxIndex();
        if (currentIndex > maxIdx) currentIndex = maxIdx;
        buildDots();
        goToSlide(currentIndex);
      }, 150);
    });

    // Init
    buildDots();
    updateButtons();
  }

  // ========================================
  // TYPING ANIMATION (Arbeitsweise Terminal)
  // ========================================
  function initTypingAnimation() {
    var terminal = document.getElementById('typing-terminal');
    if (!terminal) return;

    var lines = terminal.querySelectorAll('.typing-line');
    var cursor = terminal.querySelector('.typing-cursor');
    var hasPlayed = false;

    function typeLineText(lineEl, text, charDelay, callback) {
      var i = 0;
      // Detect prompt character
      var promptChar = '';
      var restText = text;
      if (text.charAt(0) === '$' || text.charAt(0) === '>') {
        promptChar = text.charAt(0);
        restText = text.substring(1);
      }

      lineEl.textContent = '';
      lineEl.style.opacity = '1';
      lineEl.classList.add('is-typed');

      if (promptChar) {
        var span = document.createElement('span');
        span.className = 'typing-prompt';
        span.textContent = promptChar;
        lineEl.appendChild(span);
      }

      var textNode = document.createTextNode('');
      lineEl.appendChild(textNode);

      // Move cursor next to current line
      lineEl.appendChild(cursor);
      cursor.classList.add('is-active');

      function typeNext() {
        if (i < restText.length) {
          textNode.textContent += restText.charAt(i);
          i++;
          setTimeout(typeNext, charDelay);
        } else {
          if (callback) callback();
        }
      }
      typeNext();
    }

    function startTyping() {
      if (hasPlayed) return;
      hasPlayed = true;

      var lineIndex = 0;
      function processNextLine() {
        if (lineIndex >= lines.length) {
          // Done — park cursor at end
          return;
        }
        var line = lines[lineIndex];
        var text = line.getAttribute('data-text');

        if (!text) {
          // Empty line
          line.style.opacity = '1';
          line.classList.add('is-typed');
          lineIndex++;
          setTimeout(processNextLine, 100);
          return;
        }

        var speed = lineIndex === 0 ? 20 : 30;
        typeLineText(line, text, speed, function() {
          lineIndex++;
          setTimeout(processNextLine, 250);
        });
      }
      processNextLine();
    }

    var wrapper = terminal.closest('.stack__typing-terminal') || terminal;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          startTyping();
          observer.unobserve(wrapper);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(wrapper);
  }

  // ========================================
  // INIT
  // ========================================
  function init() {
    initScrollAnimations();
    initCounters();
    initStickyNav();
    initMobileNav();
    initStickyCTA();
    initJobAccordions();
    initFAQAccordion();
    initContactForm();
    initSmoothScroll();
    initCultureSlider();
    initTypingAnimation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
