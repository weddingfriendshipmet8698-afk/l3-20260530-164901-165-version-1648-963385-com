(function () {
  var movies = [];
  var els = {};

  function qs(selector) {
    return document.querySelector(selector);
  }

  function uniqueValues(key) {
    var values = [];

    movies.forEach(function (movie) {
      var value = movie[key];

      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });

    return values.sort();
  }

  function fillSelect(select, values) {
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function movieText(movie) {
    return [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.tags.join(' '),
      movie.oneLine,
      movie.categoryName
    ].join(' ').toLowerCase();
  }

  function renderCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + movie.detailUrl + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">',
      '    <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '    <span class="poster-score">' + movie.score.toFixed(1) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <h3><a href="' + movie.detailUrl + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
      '    <p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function applySearch() {
    var keyword = els.keyword.value.trim().toLowerCase();
    var region = els.region.value;
    var type = els.type.value;
    var sort = els.sort.value;

    var results = movies.filter(function (movie) {
      var matchesKeyword = !keyword || movieText(movie).indexOf(keyword) !== -1;
      var matchesRegion = !region || movie.region === region;
      var matchesType = !type || movie.type === type;

      return matchesKeyword && matchesRegion && matchesType;
    });

    if (sort === 'score') {
      results.sort(function (a, b) {
        return b.score - a.score || b.views - a.views;
      });
    }

    if (sort === 'views') {
      results.sort(function (a, b) {
        return b.views - a.views;
      });
    }

    if (sort === 'year') {
      results.sort(function (a, b) {
        return Number(b.year) - Number(a.year) || b.score - a.score;
      });
    }

    els.count.textContent = '找到 ' + results.length + ' 部影片';
    els.results.innerHTML = results.slice(0, 500).map(renderCard).join('\n');

    if (results.length > 500) {
      els.count.textContent += '，当前显示前 500 部，可继续输入关键词缩小范围';
    }
  }

  function readInitialQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (q) {
      els.keyword.value = q;
    }
  }

  function init() {
    els.keyword = qs('[data-search-keyword]');
    els.region = qs('[data-search-region]');
    els.type = qs('[data-search-type]');
    els.sort = qs('[data-search-sort]');
    els.count = qs('[data-search-count]');
    els.results = qs('[data-search-results]');

    if (!els.keyword || !els.results) {
      return;
    }

    fetch('data/movies.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (payload) {
        movies = payload.movies || [];
        fillSelect(els.region, uniqueValues('region'));
        fillSelect(els.type, uniqueValues('type'));
        readInitialQuery();
        applySearch();
      })
      .catch(function () {
        els.count.textContent = '片库数据载入失败，请检查 data/movies.json 文件。';
      });

    [els.keyword, els.region, els.type, els.sort].forEach(function (control) {
      control.addEventListener('input', applySearch);
      control.addEventListener('change', applySearch);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
