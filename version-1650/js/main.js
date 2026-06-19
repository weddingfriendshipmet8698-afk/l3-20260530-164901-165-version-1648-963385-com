(function () {
  var mobileButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      var expanded = mobileButton.getAttribute('aria-expanded') === 'true';
      mobileButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.removeAttribute('src');
      image.classList.add('image-missing');
    });
  });

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var previous = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
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
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupVideoLibrary() {
    var list = document.getElementById('video-list');
    if (!list) {
      return;
    }

    var searchInput = document.getElementById('video-search-input');
    var categoryFilter = document.getElementById('video-category-filter');
    var sortFilter = document.getElementById('video-sort-filter');
    var visibleCount = document.getElementById('visible-count');
    var emptyState = document.getElementById('empty-state');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);

    if (searchInput && params.get('search')) {
      searchInput.value = params.get('search');
    }

    if (categoryFilter && params.get('category')) {
      categoryFilter.value = params.get('category');
    }

    if (sortFilter && params.get('sort')) {
      sortFilter.value = params.get('sort');
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-category'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.textContent
      ].join(' '));
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var category = categoryFilter ? categoryFilter.value : 'all';
      var sort = sortFilter ? sortFilter.value : 'latest';
      var visible = 0;

      cards.sort(function (a, b) {
        if (sort === 'popular') {
          return Number(b.getAttribute('data-heat')) - Number(a.getAttribute('data-heat'));
        }
        if (sort === 'year') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }
        if (sort === 'title') {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        }
        return String(b.getAttribute('data-date')).localeCompare(String(a.getAttribute('data-date')));
      }).forEach(function (card) {
        list.appendChild(card);
      });

      cards.forEach(function (card) {
        var matchesCategory = category === 'all' || card.getAttribute('data-category') === category;
        var matchesQuery = query === '' || cardText(card).indexOf(query) !== -1;
        var show = matchesCategory && matchesQuery;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = String(visible);
      }

      if (emptyState) {
        emptyState.hidden = visible > 0;
      }
    }

    [searchInput, categoryFilter, sortFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player-start]').forEach(function (button) {
      button.addEventListener('click', function () {
        var videoId = button.getAttribute('data-video-target');
        var video = document.getElementById(videoId);
        if (!video) {
          return;
        }

        var source = video.getAttribute('data-src');
        if (!source) {
          return;
        }

        function playVideo() {
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!video._hlsInstance) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
          }
          playVideo();
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) {
            video.src = source;
          }
          playVideo();
        } else {
          video.src = source;
          playVideo();
        }

        button.classList.add('is-hidden');
      });
    });
  }

  setupHero();
  setupVideoLibrary();
  setupPlayers();
})();
