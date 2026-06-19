(function() {
  "use strict";

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function updateHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) {
      return;
    }
    if (window.scrollY > 40) {
      header.classList.add("is-solid");
    } else {
      header.classList.remove("is-solid");
    }
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-menu]");
    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      if (timer || slides.length <= 1) {
        return;
      }
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        stop();
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    var existing = new Set(Array.prototype.map.call(select.options, function(option) {
      return option.value;
    }));

    values.forEach(function(value) {
      if (!value || existing.has(value)) {
        return;
      }
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
      existing.add(value);
    });
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-form]");
    if (!panel) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var searchInput = panel.querySelector("[data-filter-search]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var sortSelect = panel.querySelector("[data-filter-sort]");
    var countBox = panel.querySelector("[data-result-count]");
    var emptyState = document.querySelector("[data-empty-state]");

    var regions = Array.from(new Set(cards.map(function(card) {
      return card.getAttribute("data-region") || "";
    }))).sort();

    var types = Array.from(new Set(cards.map(function(card) {
      return card.getAttribute("data-type") || "";
    }))).sort();

    var years = Array.from(new Set(cards.map(function(card) {
      return card.getAttribute("data-year") || "";
    }))).filter(Boolean).sort(function(a, b) {
      return Number(b) - Number(a);
    });

    fillSelect(regionSelect, regions);
    fillSelect(typeSelect, types);
    fillSelect(yearSelect, years);

    var query = getQuery("q");
    if (query && searchInput) {
      searchInput.value = query;
    }

    function applySort(visibleCards) {
      if (!sortSelect) {
        return;
      }
      var value = sortSelect.value;
      var container = visibleCards.length ? visibleCards[0].parentNode : null;
      if (!container) {
        return;
      }

      var sorted = cards.slice().sort(function(a, b) {
        if (value === "views-desc") {
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        }
        if (value === "title-asc") {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        }
        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
      });

      sorted.forEach(function(card) {
        container.appendChild(card);
      });
    }

    function applyFilter() {
      var keyword = normalize(searchInput && searchInput.value);
      var region = normalize(regionSelect && regionSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = [];

      cards.forEach(function(card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));

        var isMatch = true;
        if (keyword && text.indexOf(keyword) === -1) {
          isMatch = false;
        }
        if (region && cardRegion !== region) {
          isMatch = false;
        }
        if (type && cardType !== type) {
          isMatch = false;
        }
        if (year && cardYear !== year) {
          isMatch = false;
        }

        card.hidden = !isMatch;
        if (isMatch) {
          visible.push(card);
        }
      });

      applySort(visible);

      if (countBox) {
        countBox.textContent = String(visible.length);
      }
      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible.length === 0);
      }
    }

    [searchInput, regionSelect, typeSelect, yearSelect, sortSelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }

  function initGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".global-search-form"));
    forms.forEach(function(form) {
      form.addEventListener("submit", function(event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function initPlayer(Hls) {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function(shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      var status = shell.querySelector("[data-player-status]");
      var source = shell.getAttribute("data-src");
      var hlsInstance = null;
      var isReady = false;

      if (!video || !source) {
        if (status) {
          status.textContent = "当前页面未检测到播放源";
        }
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachSource() {
        if (isReady) {
          return;
        }

        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
            setStatus("播放源已就绪，点击画面或播放键即可观看");
          });
          hlsInstance.on(Hls.Events.ERROR, function(eventName, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus("网络加载异常，正在重新连接播放源");
              hlsInstance.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus("媒体解码异常，正在尝试恢复播放");
              hlsInstance.recoverMediaError();
            } else {
              setStatus("播放源暂时无法恢复，请稍后再试");
              hlsInstance.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          setStatus("播放源已就绪，点击画面或播放键即可观看");
        } else {
          video.src = source;
          setStatus("浏览器将尝试直接播放当前视频源");
        }

        isReady = true;
      }

      function play() {
        attachSource();
        shell.classList.add("is-started");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function() {
            setStatus("请再次点击播放器开始播放");
          });
        }
      }

      if (button) {
        button.addEventListener("click", function(event) {
          event.preventDefault();
          play();
        });
      }

      video.addEventListener("play", function() {
        shell.classList.add("is-started");
      });

      video.addEventListener("pause", function() {
        if (video.currentTime === 0) {
          shell.classList.remove("is-started");
        }
      });

      attachSource();
    });
  }

  window.SitePlayer = {
    initPlayer: initPlayer
  };

  document.addEventListener("DOMContentLoaded", function() {
    updateHeader();
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initGlobalSearch();
  });

  window.addEventListener("scroll", updateHeader, { passive: true });
})();
