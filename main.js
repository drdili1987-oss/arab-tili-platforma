/**
 * ILM PLATFORM — Main JavaScript
 * Modern Uzbek-language Islamic education platform
 * 
 * Sections:
 *  1. Utility Functions
 *  2. Navigation
 *  3. Smooth Scroll & Scroll Effects
 *  4. Statistics Counter Animation
 *  5. Test System
 *  6. AI Chat Interface
 *  7. Telegram Bot Button
 *  8. Page Load & Init
 */

'use strict';

// ============================================================
// 1. UTILITY FUNCTIONS
// ============================================================

/**
 * Format seconds into MM:SS string
 * @param {number} seconds
 * @returns {string}
 */
function formatTime(seconds) {
  var mins = Math.floor(seconds / 60);
  var secs = seconds % 60;
  return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
}

/**
 * Debounce — delay execution until after `wait` ms of inactivity
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
function debounce(func, wait) {
  var timeout;
  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Get the current page name from the URL (e.g. "testlar", "fanlar")
 * @returns {string}
 */
function getCurrentPage() {
  var path = window.location.pathname;
  var filename = path.substring(path.lastIndexOf('/') + 1);
  filename = filename.split('?')[0].split('#')[0];
  // Strip .html extension
  return filename.replace('.html', '') || 'index';
}

/**
 * Get a formatted timestamp string for chat messages
 * @returns {string}
 */
function getTimestamp() {
  var now = new Date();
  var h = now.getHours();
  var m = now.getMinutes();
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}


// ============================================================
// 2. NAVIGATION
// ============================================================

var Navigation = (function () {

  var navbarToggler = null;
  var navbarCollapse = null;
  var navbar = null;
  var dropdownToggles = [];

  /**
   * Initialize navigation: mobile toggle, dropdowns, sticky shadow, active links
   */
  function init() {
    navbar = document.querySelector('.navbar');
    navbarToggler = document.querySelector('.navbar-toggler');
    navbarCollapse = document.querySelector('.navbar-collapse');
    dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    if (navbarToggler && navbarCollapse) {
      initMobileMenu();
    }

    if (dropdownToggles.length) {
      initDropdowns();
    }

    initStickyShadow();
    highlightActiveLink();
  }

  // -- Mobile menu ----------------------------------------------------------

  function initMobileMenu() {
    // Toggle menu on hamburger click
    navbarToggler.addEventListener('click', function (e) {
      e.stopPropagation();
      navbarCollapse.classList.toggle('show');
      navbarToggler.classList.toggle('collapsed');
      navbarToggler.setAttribute(
        'aria-expanded',
        navbarCollapse.classList.contains('show')
      );
    });

    // Close menu when a nav link is clicked
    var navLinks = navbarCollapse.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (
        navbarCollapse.classList.contains('show') &&
        !navbarCollapse.contains(e.target) &&
        !navbarToggler.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  function closeMenu() {
    if (navbarCollapse) {
      navbarCollapse.classList.remove('show');
      if (navbarToggler) {
        navbarToggler.classList.add('collapsed');
        navbarToggler.setAttribute('aria-expanded', 'false');
      }
    }
  }

  // -- Dropdowns ------------------------------------------------------------

  function initDropdowns() {
    dropdownToggles.forEach(function (toggle) {
      var parent = toggle.parentElement;
      var menu = parent ? parent.querySelector('.dropdown-menu') : null;

      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // Close other open dropdowns first
        dropdownToggles.forEach(function (other) {
          if (other !== toggle) {
            var otherParent = other.parentElement;
            if (otherParent) {
              otherParent.classList.remove('show');
              var otherMenu = otherParent.querySelector('.dropdown-menu');
              if (otherMenu) otherMenu.classList.remove('show');
            }
          }
        });

        // Toggle this dropdown
        if (parent) parent.classList.toggle('show');
        if (menu) menu.classList.toggle('show');
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', function () {
      dropdownToggles.forEach(function (toggle) {
        var parent = toggle.parentElement;
        if (parent) {
          parent.classList.remove('show');
          var menu = parent.querySelector('.dropdown-menu');
          if (menu) menu.classList.remove('show');
        }
      });
    });
  }

  // -- Sticky navbar shadow -------------------------------------------------

  function initStickyShadow() {
    if (!navbar) return;

    var onScroll = debounce(function () {
      if (window.scrollY > 50) {
        navbar.classList.add('navbar-shadow');
      } else {
        navbar.classList.remove('navbar-shadow');
      }
    }, 10);

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load
    onScroll();
  }

  // -- Active link highlighting ---------------------------------------------

  function highlightActiveLink() {
    var currentPage = getCurrentPage();
    var navLinks = document.querySelectorAll('.navbar .nav-link');

    navLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var linkPage = href.replace('.html', '').replace('./', '').replace('/', '');

      if (!linkPage) linkPage = 'index';

      // Exact match or prefix match (darslar-sarf -> darslar)
      if (
        linkPage === currentPage ||
        (currentPage.startsWith('darslar') && linkPage === 'fanlar')
      ) {
        link.classList.add('active');

        // If inside a dropdown, also mark the parent toggle
        var dropdownParent = link.closest('.dropdown');
        if (dropdownParent) {
          var parentToggle = dropdownParent.querySelector('.dropdown-toggle');
          if (parentToggle) parentToggle.classList.add('active');
        }
      }
    });
  }

  return { init: init };
})();


// ============================================================
// 3. SMOOTH SCROLL & SCROLL EFFECTS
// ============================================================

var ScrollEffects = (function () {

  var scrollTopBtn = null;

  function init() {
    initSmoothScroll();
    initScrollToTop();
    initFadeInOnScroll();
  }

  // -- Smooth scroll for anchor links ---------------------------------------

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '#!') return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // -- Scroll-to-top button -------------------------------------------------

  function initScrollToTop() {
    scrollTopBtn = document.querySelector('.scroll-to-top');

    // Create button if not present in HTML
    if (!scrollTopBtn) {
      scrollTopBtn = document.createElement('button');
      scrollTopBtn.className = 'scroll-to-top';
      scrollTopBtn.setAttribute('aria-label', 'Yuqoriga qaytish');
      scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
      document.body.appendChild(scrollTopBtn);
    }

    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var onScroll = debounce(function () {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, 10);

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // -- Fade-in animation on scroll (IntersectionObserver) -------------------

  function initFadeInOnScroll() {
    var fadeElements = document.querySelectorAll('.fade-in-up');

    if (!fadeElements.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('appeared');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );

      fadeElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show everything immediately
      fadeElements.forEach(function (el) {
        el.classList.add('appeared');
      });
    }
  }

  return { init: init };
})();


// ============================================================
// 4. STATISTICS COUNTER ANIMATION
// ============================================================

var StatsCounter = (function () {

  var animated = false;

  function init() {
    var counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    if ('IntersectionObserver' in window) {
      var statsSection =
        document.querySelector('.stats-section') ||
        document.querySelector('.statistics') ||
        (counters[0] ? counters[0].closest('section') : null);

      if (!statsSection) return;

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !animated) {
              animated = true;
              animateCounters(counters);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      observer.observe(statsSection);
    } else {
      // Fallback
      animateCounters(counters);
    }
  }

  /**
   * Animate a set of counter elements from 0 to their data-target value
   * @param {NodeList} counters
   */
  function animateCounters(counters) {
    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-target'), 10) || 0;
      var duration = 2000; // 2 seconds
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease-out quad
        var eased = 1 - (1 - progress) * (1 - progress);
        var current = Math.floor(eased * target);

        counter.textContent = current;

        // Append suffix like "+" if data attribute present
        var suffix = counter.getAttribute('data-suffix') || '';
        if (suffix) counter.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target + suffix;
        }
      }

      requestAnimationFrame(step);
    });
  }

  return { init: init };
})();


// ============================================================
// 5. TEST SYSTEM
// ============================================================

var TestSystem = (function () {

  // ---- Test data ----------------------------------------------------------

  var testData = {
    sarf: {
      name: 'Sarf',
      questions: [
        { question: "Sarf ilmi nimani o'rganadi?", options: ["Jumlalar tuzilishini", "So'zlar shaklini va yasalishini", "Nutq san'atini", "Fiqh qoidalarini"], correct: 1 },
        { question: "Fe'lning nechta asosiy turi bor?", options: ["2 ta", "3 ta", "4 ta", "5 ta"], correct: 1 },
        { question: "\"Masdar\" nima?", options: ["Sifat", "Olmosh", "Fe'ldan yasalgan ot", "Buyruq fe'l"], correct: 2 },
        { question: "Ism fa'il qanday shaklda bo'ladi?", options: ["Maf'ul shakli", "Fe'l shakli", "Ishlovchi ism shakli", "Joy ism shakli"], correct: 2 },
        { question: "\"Mujarrad fe'l\" nima?", options: ["Qo'shimchali fe'l", "Asl holatdagi fe'l", "O'tgan zamon fe'l", "Buyruq fe'l"], correct: 1 },
        { question: "\"Mazid fe'l\" nima?", options: ["Asl fe'l", "Qo'shimcha harflar bilan yasalgan fe'l", "O'tgan fe'l", "Kelasi zamon fe'l"], correct: 1 },
        { question: "Ism maf'ul nima?", options: ["Ishlovchi", "Qilingan ism shakli", "Sifat", "Ravish"], correct: 1 },
        { question: "Fe'l tuslanishi qanday nomlanadi?", options: ["I'rob", "Tasrif", "Sarf", "Nahv"], correct: 1 },
        { question: "\"Ism\" so'z turkumiga nima kiradi?", options: ["Faqat otlar", "Otlar, sifatlar va olmoshlar", "Faqat fe'llar", "Faqat harflar"], correct: 1 },
        { question: "O'tgan zamon fe'li qanday nomlanadi?", options: ["Fe'l muzorii", "Fe'l amr", "Fe'l moziy", "Masdar"], correct: 2 },
        { question: "Hozirgi-kelasi zamon fe'li nima?", options: ["Fe'l moziy", "Fe'l muzorii", "Fe'l amr", "Ism"], correct: 1 },
        { question: "Buyruq fe'li qanday nomlanadi?", options: ["Fe'l moziy", "Fe'l muzorii", "Fe'l amr", "Masdar"], correct: 2 }
      ]
    },
    nahv: {
      name: 'Nahv',
      questions: [
        { question: "Nahv ilmi nimani o'rganadi?", options: ["So'z yasalishini", "Jumlalar tuzilishini", "Nutq san'atini", "So'z ma'nosini"], correct: 1 },
        { question: "Ismning nechta holati bor?", options: ["2", "3", "4", "5"], correct: 1 },
        { question: "Jumlai ismiyya nima?", options: ["Fe'l bilan boshlanadigan jumla", "Ism bilan boshlanadigan jumla", "Harf bilan boshlanadigan jumla", "Savol jumla"], correct: 1 },
        { question: "Mubtado nima?", options: ["Gapning ega bo'lagi", "Gapning kesimi", "Fe'l", "Harf"], correct: 0 },
        { question: "Xabar nima?", options: ["Ega", "Gapning kesim bo'lagi", "To'ldiruvchi", "Aniqlovchi"], correct: 1 },
        { question: "Raf' holati qachon qo'llaniladi?", options: ["Mubtado uchun", "Maf'ul uchun", "Jar uchun", "Faqat fe'l uchun"], correct: 0 },
        { question: "\"Inna\" harfi nimaga ta'sir qiladi?", options: ["Xabarga", "Mubtadoga — uni nasb qiladi", "Fe'lga", "Hech nimaga"], correct: 1 },
        { question: "\"Kaana\" fe'li nimaga ta'sir qiladi?", options: ["Mubtadoga", "Xabarga — uni nasb qiladi", "Fe'lga", "Harfga"], correct: 1 },
        { question: "Maf'ul bih nima?", options: ["Ega", "To'ldiruvchi", "Kesim", "Hol"], correct: 1 },
        { question: "Jar harflari nimaga xizmat qiladi?", options: ["Fe'lga bog'lashga", "Ismni jarr holatiga o'tkazishga", "Xabar yasashga", "Mubtado belgilashga"], correct: 1 },
        { question: "Atf harfi nima?", options: ["Bog'lovchi harf", "Inkor harfi", "Savol harfi", "Shart harfi"], correct: 0 },
        { question: "Jumlai fe'liyya nima bilan boshlanadi?", options: ["Ism", "Harf", "Fe'l", "Sifat"], correct: 2 }
      ]
    },
    balogat: {
      name: "Balog'at",
      questions: [
        { question: "Balog'at ilmi nimani o'rganadi?", options: ["Grammatikani", "Nutq san'atini", "So'z yasalishini", "Fe'l tuslanishini"], correct: 1 },
        { question: "Ilmul ma'oniy nima?", options: ["So'z bezaklari", "Ma'no ilmi", "Ko'chimlar", "O'xshatish"], correct: 1 },
        { question: "Tashbih nima?", options: ["Ko'chma ma'no", "O'xshatish san'ati", "Kinoya", "Mubolag'a"], correct: 1 },
        { question: "Majoz nima?", options: ["Haqiqiy ma'no", "Ko'chma ma'no", "O'xshatish", "Takrorlash"], correct: 1 },
        { question: "Isti'ora nima?", options: ["Kinoya", "Tashbih turi", "Yashirin o'xshatish", "Takrorlash"], correct: 2 },
        { question: "Kinoya nima?", options: ["Ochiq aytmasdan anglatish", "O'xshatish", "Mubolag'a", "Ko'chma ma'no"], correct: 0 },
        { question: "Ilmul bayan nimani o'rganadi?", options: ["Jumlalar tuzilishini", "Ifodalash usullarini", "So'z yasalishini", "Grammatikani"], correct: 1 },
        { question: "Ilmul bade' nimani o'rganadi?", options: ["Ma'no ilmini", "So'z bezaklarini", "Grammatikani", "Fe'l shakllarini"], correct: 1 },
        { question: "\"Tashbih\"ning asosiy elementlari nechta?", options: ["2", "3", "4", "5"], correct: 2 },
        { question: "Balog'at nechta asosiy bo'limdan iborat?", options: ["2", "3", "4", "5"], correct: 1 },
        { question: "Ochiq isti'ora nima?", options: ["Mushabbah zikr qilingan", "Mushabbahun bih zikr qilingan", "Ikkalasi ham bor", "Ikkalasi ham yo'q"], correct: 0 },
        { question: "Tashbih tamsiliy nima?", options: ["Oddiy o'xshatish", "Murakkab holat o'xshatish", "Kinoya", "Majoz"], correct: 1 }
      ]
    },
    usul: {
      name: 'Usulul fiqh',
      questions: [
        { question: "Usulul fiqh nima?", options: ["Fiqh qoidalarining asoslarini o'rganadigan ilm", "Hadis ilmi", "Tafsir ilmi", "Sarf ilmi"], correct: 0 },
        { question: "Fiqhning birinchi dalili nima?", options: ["Ijmo'", "Qur'on", "Qiyos", "Sunna"], correct: 1 },
        { question: "Ijmo' nima?", options: ["Bitta olimning fikri", "Olimlar yakdilligi", "Qiyos", "Hadis"], correct: 1 },
        { question: "Qiyos nima?", options: ["Yakdillik", "Analogiya usuli", "Hadis", "Qur'on oyati"], correct: 1 },
        { question: "Ijtihod nima?", options: ["Taqlid qilish", "Mustaqil fikr yuritish", "Hadis rivoyat qilish", "Qur'on o'qish"], correct: 1 },
        { question: "Sunnaning turlari nechta?", options: ["2", "3", "4", "5"], correct: 1 },
        { question: "Taqlid nima?", options: ["Mustaqil fikrlash", "Boshqa olimga ergashish", "Dalil keltirish", "Ijmo' qilish"], correct: 1 },
        { question: "Maqosidush shari'a nima?", options: ["Fiqh qoidalari", "Shariat maqsadlari", "Hadis turlari", "Qur'on tafsirlari"], correct: 1 },
        { question: "Qur'ondan hukm chiqarishning asosiy usuli?", options: ["Qiyos", "Dalalat turlari", "Taqlid", "Shaxsiy fikr"], correct: 1 },
        { question: "\"Nass\" nima?", options: ["Yashirin ma'no", "Ochiq va aniq dalil", "Qiyos", "Ijmo'"], correct: 1 },
        { question: "Zaruriyot nechta?", options: ["3", "5", "7", "10"], correct: 1 },
        { question: "Maslahat mursala nima?", options: ["Nass bilan belgilangan", "Umumiy manfaat asosida hukm", "Qiyos", "Ijmo'"], correct: 1 }
      ]
    }
  };

  // ---- State --------------------------------------------------------------

  var currentSubject = null;    // key into testData
  var currentQuestion = 0;      // index of the question being shown
  var selectedAnswers = [];     // array of selected option indices (or -1)
  var timerInterval = null;
  var elapsedSeconds = 0;

  // ---- DOM references (resolved lazily) -----------------------------------

  function el(selector) {
    return document.querySelector(selector);
  }

  // ---- Public API ---------------------------------------------------------

  function init() {
    // Only initialise on the test page
    if (!el('.test-section') && !el('#test-container') && !el('.subject-cards')) return;

    // Bind subject card clicks
    var subjectCards = document.querySelectorAll('.subject-card[data-subject]');
    subjectCards.forEach(function (card) {
      card.addEventListener('click', function () {
        selectSubject(this.getAttribute('data-subject'));
      });
    });

    // Bind navigation buttons (they may not exist yet — use delegation)
    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-test-action]');
      if (!target) return;

      var action = target.getAttribute('data-test-action');
      switch (action) {
        case 'next':     nextQuestion(); break;
        case 'prev':     prevQuestion(); break;
        case 'submit':   submitTest(); break;
        case 'reset':    resetTest(); break;
        default: break;
      }
    });

    // Also handle option clicks via delegation
    document.addEventListener('click', function (e) {
      var option = e.target.closest('.test-option');
      if (!option) return;
      var idx = parseInt(option.getAttribute('data-option-index'), 10);
      if (!isNaN(idx)) selectOption(idx);
    });
  }

  // ---- Subject selection --------------------------------------------------

  function selectSubject(subjectKey) {
    if (!testData[subjectKey]) return;

    currentSubject = subjectKey;
    currentQuestion = 0;
    selectedAnswers = new Array(testData[subjectKey].questions.length).fill(-1);
    elapsedSeconds = 0;

    // Hide subject selection, show quiz area
    var selectionArea = el('.subject-selection') || el('.subject-cards-container');
    var quizArea = el('.quiz-area') || el('#quiz-area');

    if (selectionArea) selectionArea.style.display = 'none';
    if (quizArea) quizArea.style.display = 'block';

    // Start timer
    startTimer();

    // Render first question
    renderQuestion(0);
    updateProgressBar();
  }

  // ---- Timer --------------------------------------------------------------

  function startTimer() {
    stopTimer();
    var timerEl = el('.test-timer') || el('#test-timer');
    elapsedSeconds = 0;
    if (timerEl) timerEl.textContent = formatTime(0);

    timerInterval = setInterval(function () {
      elapsedSeconds++;
      if (timerEl) timerEl.textContent = formatTime(elapsedSeconds);
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // ---- Rendering ----------------------------------------------------------

  function renderQuestion(index) {
    if (!currentSubject) return;
    var questions = testData[currentSubject].questions;
    if (index < 0 || index >= questions.length) return;

    currentQuestion = index;
    var q = questions[index];

    // Question number & text
    var qNumEl = el('.question-number') || el('#question-number');
    var qTextEl = el('.question-text') || el('#question-text');

    if (qNumEl) qNumEl.textContent = 'Savol ' + (index + 1) + '/' + questions.length;
    if (qTextEl) qTextEl.textContent = q.question;

    // Render options
    var optionsContainer = el('.test-options') || el('#test-options');
    if (optionsContainer) {
      var labels = ['A', 'B', 'C', 'D'];
      var html = '';
      q.options.forEach(function (opt, i) {
        var selectedClass = selectedAnswers[index] === i ? ' selected' : '';
        html +=
          '<div class="test-option' + selectedClass + '" data-option-index="' + i + '">' +
            '<span class="option-letter">' + labels[i] + '</span>' +
            '<span class="option-text">' + escapeHTML(opt) + '</span>' +
          '</div>';
      });
      optionsContainer.innerHTML = html;
    }

    // Show/hide prev/next/submit buttons
    var prevBtn = el('[data-test-action="prev"]');
    var nextBtn = el('[data-test-action="next"]');
    var submitBtn = el('[data-test-action="submit"]');

    if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : '';
    if (nextBtn) nextBtn.style.display = index === questions.length - 1 ? 'none' : '';
    if (submitBtn) submitBtn.style.display = index === questions.length - 1 ? '' : 'none';

    updateProgressBar();
  }

  // ---- Option selection ---------------------------------------------------

  function selectOption(optionIndex) {
    selectedAnswers[currentQuestion] = optionIndex;

    // Update visual state
    var options = document.querySelectorAll('.test-option');
    options.forEach(function (opt) {
      opt.classList.remove('selected');
    });
    var selected = document.querySelector('.test-option[data-option-index="' + optionIndex + '"]');
    if (selected) selected.classList.add('selected');
  }

  // ---- Navigation ---------------------------------------------------------

  function nextQuestion() {
    if (!currentSubject) return;
    var questions = testData[currentSubject].questions;
    if (currentQuestion < questions.length - 1) {
      renderQuestion(currentQuestion + 1);
    }
  }

  function prevQuestion() {
    if (currentQuestion > 0) {
      renderQuestion(currentQuestion - 1);
    }
  }

  // ---- Progress bar -------------------------------------------------------

  function updateProgressBar() {
    var bar = el('.test-progress-bar') || el('#test-progress-bar');
    if (!bar || !currentSubject) return;

    var total = testData[currentSubject].questions.length;
    var answered = selectedAnswers.filter(function (a) { return a !== -1; }).length;
    var pct = Math.round((answered / total) * 100);
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', pct);

    var barText = el('.test-progress-text') || el('#test-progress-text');
    if (barText) barText.textContent = answered + '/' + total;
  }

  // ---- Submit & Results ---------------------------------------------------

  function submitTest() {
    if (!currentSubject) return;
    stopTimer();

    var questions = testData[currentSubject].questions;
    var score = 0;

    questions.forEach(function (q, i) {
      if (selectedAnswers[i] === q.correct) score++;
    });

    showResults(score, questions.length);
  }

  function showResults(score, total) {
    var pct = Math.round((score / total) * 100);
    var questions = testData[currentSubject].questions;

    // Build result modal / section
    var resultsContainer = el('.test-results') || el('#test-results');
    var quizArea = el('.quiz-area') || el('#quiz-area');

    if (quizArea) quizArea.style.display = 'none';

    if (resultsContainer) {
      // Score circle
      var resultClass = pct >= 80 ? 'excellent' : pct >= 60 ? 'good' : pct >= 40 ? 'average' : 'poor';

      var html =
        '<div class="results-content">' +
          '<h2 class="results-title">Natijalar — ' + escapeHTML(testData[currentSubject].name) + '</h2>' +
          '<div class="score-circle ' + resultClass + '">' +
            '<div class="score-percent">' + pct + '%</div>' +
            '<div class="score-text">' + score + '/' + total + ' to\'g\'ri</div>' +
          '</div>' +
          '<div class="time-spent">Sarflangan vaqt: ' + formatTime(elapsedSeconds) + '</div>' +
          '<div class="results-detail">';

      questions.forEach(function (q, i) {
        var isCorrect = selectedAnswers[i] === q.correct;
        var icon = isCorrect ? '<i class="fas fa-check-circle correct-icon"></i>' : '<i class="fas fa-times-circle wrong-icon"></i>';
        var labels = ['A', 'B', 'C', 'D'];
        var userAnswer = selectedAnswers[i] >= 0 ? labels[selectedAnswers[i]] + ') ' + q.options[selectedAnswers[i]] : 'Javob berilmagan';
        var correctAnswer = labels[q.correct] + ') ' + q.options[q.correct];

        html +=
          '<div class="result-item ' + (isCorrect ? 'correct' : 'wrong') + '">' +
            '<div class="result-question">' + icon + ' ' + (i + 1) + '. ' + escapeHTML(q.question) + '</div>' +
            '<div class="result-answer">Sizning javobingiz: ' + escapeHTML(userAnswer) + '</div>' +
            (isCorrect ? '' : '<div class="result-correct">To\'g\'ri javob: ' + escapeHTML(correctAnswer) + '</div>') +
          '</div>';
      });

      html +=
          '</div>' +
          '<div class="results-actions">' +
            '<button class="btn btn-primary" data-test-action="reset">Qayta topshirish</button>' +
          '</div>' +
        '</div>';

      resultsContainer.innerHTML = html;
      resultsContainer.style.display = 'block';

      // Animate score circle
      animateScoreCircle(resultsContainer, pct);
    }
  }

  /**
   * Animate the score percentage from 0 to the final value
   */
  function animateScoreCircle(container, targetPct) {
    var pctEl = container.querySelector('.score-percent');
    if (!pctEl) return;

    var current = 0;
    var duration = 1500;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * targetPct);
      pctEl.textContent = current + '%';

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        pctEl.textContent = targetPct + '%';
      }
    }

    requestAnimationFrame(step);
  }

  // ---- Reset --------------------------------------------------------------

  function resetTest() {
    stopTimer();
    currentSubject = null;
    currentQuestion = 0;
    selectedAnswers = [];
    elapsedSeconds = 0;

    // Hide results & quiz, show subject selection
    var resultsContainer = el('.test-results') || el('#test-results');
    var quizArea = el('.quiz-area') || el('#quiz-area');
    var selectionArea = el('.subject-selection') || el('.subject-cards-container');

    if (resultsContainer) { resultsContainer.style.display = 'none'; resultsContainer.innerHTML = ''; }
    if (quizArea) quizArea.style.display = 'none';
    if (selectionArea) selectionArea.style.display = '';

    // Reset progress bar
    var bar = el('.test-progress-bar') || el('#test-progress-bar');
    if (bar) { bar.style.width = '0%'; bar.setAttribute('aria-valuenow', 0); }
    var barText = el('.test-progress-text') || el('#test-progress-text');
    if (barText) barText.textContent = '';
  }

  // ---- Helpers ------------------------------------------------------------

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  return { init: init, selectSubject: selectSubject };
})();


// ============================================================
// 6. AI CHAT INTERFACE
// ============================================================

var AIChat = (function () {

  // Predefined keyword-based bot responses (UI only, no real API)
  var responses = {
    greetings: {
      keywords: ['salom', 'assalomu', 'hello', 'hi', 'hey', 'hayrli'],
      answer: "Assalomu alaykum! ILM Platform-ga xush kelibsiz! 😊 Sizga qanday yordam bera olaman?"
    },
    sarf: {
      keywords: ['sarf', 'morphology', "so'z yasalish", "fe'l", 'tuslanish'],
      answer: "Sarf — arab tili morfologiyasi bo'lib, so'zlar shaklini va yasalishini o'rganadi. Platformamizda 8 ta Sarf darsi mavjud. Darslar sahifasiga o'ting yoki test topshiring!"
    },
    nahv: {
      keywords: ['nahv', 'syntax', 'jumla', 'grammatika', 'mubtado', 'xabar'],
      answer: "Nahv — arab tilining sintaksisi bo'lib, jumlalar tuzilishini o'rganadi. Nahv bo'limida 8 ta dars va 12 ta test savoli mavjud."
    },
    balogat: {
      keywords: ['balog', 'rhetoric', 'tashbih', 'majoz', "isti'ora", 'bayan'],
      answer: "Balog'at — nutq san'ati bo'lib, uchta asosiy bo'limdan iborat: Ilmul ma'oniy, Ilmul bayan va Ilmul bade'. Darslarimizda batafsil o'rganishingiz mumkin!"
    },
    usul: {
      keywords: ['usul', 'fiqh', 'ijtihod', 'qiyos', "ijmo'"],
      answer: "Usulul fiqh — fiqh qoidalarining asoslarini o'rganadigan ilm. Bu fanda Qur'on, Sunna, Ijmo' va Qiyos kabi dalillar o'rganiladi."
    },
    test: {
      keywords: ['test', 'savol', 'imtihon', 'sinov', 'natija'],
      answer: "Testlar sahifasida 4 ta fandan 12 tadan savol mavjud. Har bir fan bo'yicha bilimingizni sinab ko'ring! Testlar sahifasiga o'ting: testlar.html"
    },
    platform: {
      keywords: ['platforma', 'platform', 'sayt', 'ilm', 'nima'],
      answer: "ILM PLATFORM — islom ilmlarini zamonaviy usulda o'rganish uchun yaratilgan ta'limiy platforma. Sarf, Nahv, Balog'at va Usulul fiqh fanlarini o'z ichiga oladi."
    },
    telegram: {
      keywords: ['telegram', 'bot', 'kanal'],
      answer: "Telegram botimizga qo'shiling! @ilm_platform_bot orqali darslar, testlar va yangiliklar haqida xabardor bo'ling. 👉 https://t.me/ilm_platform_bot"
    },
    thanks: {
      keywords: ['rahmat', "tashakkur", 'thanks', 'yordam'],
      answer: "Marhamat! Yana savol bo'lsa, bemalol yozing. ILM Platform har doim sizning xizmatingizda! 📚"
    }
  };

  var defaultResponse = "Uzr, hozirda men faqat cheklangan savollarga javob bera olaman. Tez orada to'liq AI xizmati ishga tushadi!";

  // DOM references
  var chatMessages = null;
  var chatInput = null;
  var sendBtn = null;

  function init() {
    chatMessages = document.querySelector('.chat-messages') || document.querySelector('#chat-messages') || document.querySelector('#chatMessages') || document.querySelector('.ai-chat-messages');
    chatInput = document.querySelector('.chat-input input') || document.querySelector('#chat-input') || document.querySelector('#chatInput') || document.querySelector('.ai-chat-input');
    sendBtn = document.querySelector('.chat-send-btn') || document.querySelector('#chat-send') || document.querySelector('#chatSend') || document.querySelector('.ai-chat-send');

    if (!chatMessages || !chatInput) return;

    // Send button click
    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        sendMessage();
      });
    }

    // Enter key
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  /**
   * Send a message: display user bubble, show typing, then respond
   */
  function sendMessage() {
    var text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatInput.value = '';

    // Show typing indicator, then respond after a short delay
    showTypingIndicator();

    var reply = getBotResponse(text);
    var delay = 800 + Math.random() * 800;

    setTimeout(function () {
      hideTypingIndicator();
      addMessage(reply, 'bot');
    }, delay);
  }

  /**
   * Add a message bubble to the chat area
   * @param {string} text
   * @param {'user'|'bot'} sender
   */
  function addMessage(text, sender) {
    if (!chatMessages) return;

    var isUser = sender === 'user';
    var bubble = document.createElement('div');
    bubble.className = 'ai-message ai-' + sender + '-message chat-message ' + sender + '-message';

    var avatar = document.createElement('div');
    avatar.className = 'ai-message-avatar message-avatar';
    avatar.textContent = isUser ? '👤' : '🤖';

    var content = document.createElement('div');
    content.className = 'ai-message-content message-content';

    var p = document.createElement('p');
    p.textContent = text;
    content.appendChild(p);

    var timestamp = document.createElement('span');
    timestamp.className = 'message-time';
    timestamp.style.fontSize = '0.72rem';
    timestamp.style.opacity = '0.75';
    timestamp.style.display = 'block';
    timestamp.style.marginTop = '4px';
    timestamp.textContent = getTimestamp();
    content.appendChild(timestamp);

    bubble.appendChild(avatar);
    bubble.appendChild(content);

    chatMessages.appendChild(bubble);

    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Show a "..." typing indicator
   */
  function showTypingIndicator() {
    if (!chatMessages) return;
    hideTypingIndicator();

    var indicator = document.createElement('div');
    indicator.className = 'ai-message ai-bot-message chat-message bot-message';
    indicator.id = 'typing-indicator';

    var avatar = document.createElement('div');
    avatar.className = 'ai-message-avatar message-avatar';
    avatar.textContent = '🤖';

    var content = document.createElement('div');
    content.className = 'ai-message-content message-content typing-indicator';
    content.innerHTML = '<span style="display:inline-block;width:8px;height:8px;background:var(--clr-text-light);border-radius:50%;margin:0 2px;"></span><span style="display:inline-block;width:8px;height:8px;background:var(--clr-text-light);border-radius:50%;margin:0 2px;"></span><span style="display:inline-block;width:8px;height:8px;background:var(--clr-text-light);border-radius:50%;margin:0 2px;"></span>';

    indicator.appendChild(avatar);
    indicator.appendChild(content);
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Remove the typing indicator
   */
  function hideTypingIndicator() {
    var indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  /**
   * Determine a bot response based on keyword matching
   * @param {string} userText
   * @returns {string}
   */
  function getBotResponse(userText) {
    var lower = userText.toLowerCase();

    for (var key in responses) {
      if (!responses.hasOwnProperty(key)) continue;
      var entry = responses[key];
      for (var i = 0; i < entry.keywords.length; i++) {
        if (lower.indexOf(entry.keywords[i]) !== -1) {
          return entry.answer;
        }
      }
    }

    return defaultResponse;
  }

  return { init: init };
})();


// ============================================================
// 7. TELEGRAM BOT BUTTON
// ============================================================

var TelegramButton = (function () {

  function init() {
    // If button already exists in HTML, just add behaviour
    var existing = document.querySelector('.telegram-float');
    if (existing) {
      addTooltipBehaviour(existing);
      return;
    }

    // Create floating Telegram button
    var btn = document.createElement('a');
    btn.href = 'https://t.me/ilm_platform_bot';
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.className = 'telegram-float';
    btn.setAttribute('aria-label', 'Telegram bot');
    btn.innerHTML = '<i class="fab fa-telegram-plane"></i>';

    // Tooltip
    var tooltip = document.createElement('span');
    tooltip.className = 'telegram-tooltip';
    tooltip.textContent = "Telegram botimizga qo'shiling!";
    btn.appendChild(tooltip);

    document.body.appendChild(btn);

    // Pulse animation on first visit
    if (!sessionStorage.getItem('ilm_tg_seen')) {
      btn.classList.add('pulse');
      sessionStorage.setItem('ilm_tg_seen', '1');

      // Remove pulse after 6 seconds
      setTimeout(function () {
        btn.classList.remove('pulse');
      }, 6000);
    }

    addTooltipBehaviour(btn);
  }

  function addTooltipBehaviour(btn) {
    var tooltip = btn.querySelector('.telegram-tooltip');
    if (!tooltip) return;

    // Show tooltip on hover / first few seconds
    btn.addEventListener('mouseenter', function () {
      tooltip.classList.add('visible');
    });
    btn.addEventListener('mouseleave', function () {
      tooltip.classList.remove('visible');
    });

    // Show briefly on page load (first visit only)
    if (!sessionStorage.getItem('ilm_tg_tooltip_shown')) {
      sessionStorage.setItem('ilm_tg_tooltip_shown', '1');
      setTimeout(function () {
        tooltip.classList.add('visible');
      }, 2000);
      setTimeout(function () {
        tooltip.classList.remove('visible');
      }, 6000);
    }
  }

  return { init: init };
})();


// ============================================================
// 8. PAGE LOAD & INITIALISATION
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

  // ---- Core modules (every page) ----
  Navigation.init();
  ScrollEffects.init();
  TelegramButton.init();

  // ---- Auto-tag animatable elements ----
  var animatableSelectors = [
    '.feature-card',
    '.subject-card',
    '.lesson-card',
    '.stat-item',
    '.section-title',
    '.cta-section',
    '.about-text'
  ];

  animatableSelectors.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (!el.classList.contains('fade-in-up')) {
        el.classList.add('fade-in-up');
      }
    });
  });

  // Re-init fade observer now that we have tagged extra elements
  // (IntersectionObserver handles elements added before observe)
  var freshFadeEls = document.querySelectorAll('.fade-in-up:not(.appeared)');
  if (freshFadeEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('appeared');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    freshFadeEls.forEach(function (el) { observer.observe(el); });
  }

  // ---- Page-specific features ----
  var page = getCurrentPage();

  if (page === 'index' || page === '' || document.body.classList.contains('home-page') || document.querySelector('.hero')) {
    StatsCounter.init();
  }

  if (page === 'testlar' || document.body.classList.contains('testlar-page') || document.querySelector('.test-section') || document.querySelector('.subject-selection')) {
    TestSystem.init();
  }

  // AI Chat — initialise if chat container exists (could be on any page)
  AIChat.init();
});
