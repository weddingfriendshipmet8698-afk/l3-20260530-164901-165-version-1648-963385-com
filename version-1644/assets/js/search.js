(function() {
    const input = document.getElementById('search-input');
    const status = document.getElementById('search-status');
    const results = document.getElementById('search-results');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    function escapeText(value) {
        return String(value || '').replace(/[&<>"]/g, function(char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function renderCard(movie) {
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + escapeText(movie.url) + '">',
            '<img src="' + escapeText(movie.poster) + '" alt="' + escapeText(movie.title) + ' 海报" loading="lazy">',
            '<span class="play-hover">播放</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-meta-line"><span>' + escapeText(movie.year) + '</span><span>' + escapeText(movie.region) + '</span><span>' + escapeText(movie.type) + '</span></div>',
            '<h2><a href="' + escapeText(movie.url) + '">' + escapeText(movie.title) + '</a></h2>',
            '<p>' + escapeText(movie.desc) + '</p>',
            '<div class="tag-row"><span>' + escapeText(movie.category) + '</span><span>' + escapeText(movie.genre) + '</span></div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function search(query) {
        const keyword = query.trim().toLowerCase();
        const source = Array.isArray(window.SearchMovies) ? window.SearchMovies : [];
        const matched = source.filter(function(movie) {
            const value = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, movie.desc].join(' ').toLowerCase();
            return !keyword || value.indexOf(keyword) !== -1;
        }).slice(0, 80);

        results.innerHTML = matched.map(renderCard).join('');
        if (keyword) {
            status.textContent = matched.length ? '搜索结果' : '没有找到匹配内容';
        } else {
            status.textContent = '热门推荐';
        }
    }

    if (input) {
        input.value = initialQuery;
        input.addEventListener('input', function() {
            search(input.value);
        });
    }

    search(initialQuery);
})();
