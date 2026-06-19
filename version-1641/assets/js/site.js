(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileNav() {
    var toggle = qs('[data-nav-toggle]');
    var links = qs('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function populateSelect(select, cards, attribute) {
    if (!select) {
      return;
    }
    var values = Array.from(new Set(cards.map(function (card) {
      return card.getAttribute(attribute) || '';
    }).filter(Boolean))).sort(function (a, b) {
      return a.localeCompare(b, 'zh-CN');
    });
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var grid = qs('[data-card-grid]', scope.parentElement) || qs('[data-card-grid]');
      if (!grid) {
        return;
      }
      var cards = qsa('.movie-card', grid);
      var keywordInput = qs('[data-filter-keyword]', scope);
      var categorySelect = qs('[data-filter-category]', scope);
      var regionSelect = qs('[data-filter-region]', scope);
      var typeSelect = qs('[data-filter-type]', scope);
      var sortSelect = qs('[data-filter-sort]', scope);
      var countEl = qs('[data-result-count]', scope);

      populateSelect(regionSelect, cards, 'data-region');
      populateSelect(typeSelect, cards, 'data-type');

      function cardText(card) {
        return normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
      }

      function apply() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var category = categorySelect ? categorySelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var matched = true;
          if (keyword && cardText(card).indexOf(keyword) === -1) {
            matched = false;
          }
          if (category && card.getAttribute('data-category') !== category) {
            matched = false;
          }
          if (region && card.getAttribute('data-region') !== region) {
            matched = false;
          }
          if (type && card.getAttribute('data-type') !== type) {
            matched = false;
          }
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (countEl) {
          countEl.textContent = String(visible);
        }
      }

      function sortCards() {
        var sortValue = sortSelect ? sortSelect.value : 'id';
        var sorted = cards.slice().sort(function (a, b) {
          if (sortValue === 'year') {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }
          if (sortValue === 'score') {
            return Number(b.getAttribute('data-score')) - Number(a.getAttribute('data-score'));
          }
          if (sortValue === 'title') {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
          }
          return 0;
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
        cards = sorted;
        apply();
      }

      [keywordInput, categorySelect, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      if (sortSelect) {
        sortSelect.addEventListener('change', sortCards);
      }
      apply();
    });
  }

  function initScrollPlayer() {
    qsa('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var frame = qs('[data-player-frame]');
        if (frame) {
          frame.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initFilters();
    initScrollPlayer();
  });
})();
