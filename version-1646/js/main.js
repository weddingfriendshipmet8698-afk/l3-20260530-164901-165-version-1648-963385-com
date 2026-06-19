(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupImages() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-missing');
      });
    });
  }

  function setupHero() {
    var root = qs('[data-hero-carousel]');

    if (!root) {
      return;
    }

    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var previous = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);

        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-category') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function setupCardFilters() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-card-grid]');

    if (!panel || !grid) {
      return;
    }

    var cards = qsa('.movie-card', grid);
    var keywordInput = qs('[data-filter-keyword]', panel);
    var typeSelect = qs('[data-filter-type]', panel);
    var sortSelect = qs('[data-sort-cards]', panel);
    var counter = qs('[data-result-count]');

    function apply() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
        var matchesType = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1;
        var show = matchesKeyword && matchesType;
        card.style.display = show ? '' : 'none';
        visible += show ? 1 : 0;
      });

      if (counter) {
        counter.textContent = '共 ' + visible + ' 部影片';
      }
    }

    function sortCards() {
      var value = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();

      if (value === 'score') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
        });
      }

      if (value === 'views') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
        });
      }

      if (value === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });

      apply();
    }

    [keywordInput, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }

    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupImages();
    setupHero();
    setupSearchForms();
    setupCardFilters();
  });
})();
