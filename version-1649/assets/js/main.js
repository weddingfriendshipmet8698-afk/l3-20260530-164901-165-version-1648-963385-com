(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    if (menuButton) {
      menuButton.addEventListener('click', function () {
        document.body.classList.toggle('menu-open');
      });
    }

    var hero = document.querySelector('.hero');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
      var prev = hero.querySelector('.hero-arrow.prev');
      var next = hero.querySelector('.hero-arrow.next');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    var filterForm = document.querySelector('[data-filter-form]');
    if (filterForm) {
      var search = filterForm.querySelector('[name="q"]');
      var category = filterForm.querySelector('[name="category"]');
      var region = filterForm.querySelector('[name="region"]');
      var year = filterForm.querySelector('[name="year"]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));
      var empty = document.querySelector('.empty-state');
      var params = new URLSearchParams(window.location.search);

      if (search && params.get('q')) {
        search.value = params.get('q');
      }

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function applyFilter() {
        var q = normalize(search ? search.value : '');
        var c = category ? category.value : '';
        var r = region ? region.value : '';
        var y = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.category,
            card.dataset.region,
            card.dataset.year,
            card.dataset.tags
          ].join(' '));
          var matchSearch = !q || text.indexOf(q) !== -1;
          var matchCategory = !c || card.dataset.category === c;
          var matchRegion = !r || card.dataset.region === r;
          var matchYear = !y || card.dataset.year === y;
          var showCard = matchSearch && matchCategory && matchRegion && matchYear;
          card.style.display = showCard ? '' : 'none';
          if (showCard) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      }

      ['input', 'change'].forEach(function (eventName) {
        filterForm.addEventListener(eventName, applyFilter);
      });

      applyFilter();
    }
  });
})();
