(function() {
    const toggle = document.querySelector('.menu-toggle');
    const panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function() {
            const open = panel.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', open);
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(slider.querySelectorAll('.hero-dot'));
        const prev = slider.querySelector('.hero-control.prev');
        const next = slider.querySelector('.hero-control.next');
        let active = 0;
        let timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === active);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === active);
            });
        }

        function move(delta) {
            show(active + delta);
            restart();
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function() {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener('click', function() {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function() {
                move(-1);
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                move(1);
            });
        }

        restart();
    }

    const cardSearch = document.querySelector('[data-card-search]');
    const cardList = document.querySelector('[data-card-list]');
    const emptyState = document.querySelector('[data-empty-state]');
    const filterButtons = Array.from(document.querySelectorAll('[data-filter-value]'));

    if (cardSearch && cardList) {
        const cards = Array.from(cardList.querySelectorAll('[data-card]'));
        let filterValue = 'all';

        function applyFilter() {
            const keyword = cardSearch.value.trim().toLowerCase();
            let visible = 0;

            cards.forEach(function(card) {
                const text = ((card.dataset.title || '') + ' ' + (card.dataset.meta || '')).toLowerCase();
                const matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                const matchesFilter = filterValue === 'all' || text.indexOf(filterValue.toLowerCase()) !== -1;
                const show = matchesKeyword && matchesFilter;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        cardSearch.addEventListener('input', applyFilter);

        filterButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                filterButtons.forEach(function(item) {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                filterValue = button.dataset.filterValue || 'all';
                applyFilter();
            });
        });
    }
})();
