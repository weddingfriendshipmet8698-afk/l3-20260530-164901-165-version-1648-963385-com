(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-miss');
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        show(current);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-card-search]');
    var sort = scope.querySelector('[data-card-sort]');
    var grid = scope.querySelector('[data-card-grid]');
    var empty = scope.querySelector('[data-empty]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !query || text.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (sort) {
        var mode = sort.value;
        var sorted = cards.slice().sort(function (a, b) {
          if (mode === 'year') {
            return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
          }
          if (mode === 'hot') {
            return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
          }
          return Number(a.getAttribute('data-id') || 0) - Number(b.getAttribute('data-id') || 0);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
      input.addEventListener('input', apply);
    }

    if (sort) {
      sort.addEventListener('change', apply);
    }

    apply();
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById('movie-player');
  var cover = document.querySelector('[data-player-cover]');
  var started = false;
  var hlsInstance = null;

  if (!video || !sourceUrl) {
    return;
  }

  function start() {
    if (cover) {
      cover.classList.add('is-hidden');
    }

    if (started) {
      video.play().catch(function () {});
      return;
    }

    started = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
      video.load();
    } else {
      video.src = sourceUrl;
      video.play().catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (!started) {
      start();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
