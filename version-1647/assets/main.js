(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(text) {
    return (text || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var menu = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (menu && panel) {
      menu.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var index = 0;
      var show = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          show(index + 1);
        }, 5200);
      }
    }

    var filterBars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
    filterBars.forEach(function (bar) {
      var buttons = Array.prototype.slice.call(bar.querySelectorAll("[data-filter-btn]"));
      var list = document.querySelector("[data-card-list]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-card]")) : [];
      if (buttons.length) {
        buttons[0].classList.add("active");
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.getAttribute("data-filter-btn");
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          cards.forEach(function (card) {
            var cardValue = card.getAttribute("data-filter") || "";
            var visible = value === "全部" || cardValue.indexOf(value) !== -1;
            card.classList.toggle("hidden-by-filter", !visible);
          });
        });
      });
    });

    var searchInput = document.getElementById("searchInput");
    var searchList = document.querySelector("[data-search-page]");
    if (searchInput && searchList) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      searchInput.value = initial;
      var cards = Array.prototype.slice.call(searchList.querySelectorAll("[data-card]"));
      var runSearch = function () {
        var q = normalize(searchInput.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          card.classList.toggle("hidden-by-search", q && text.indexOf(q) === -1);
        });
      };
      searchInput.addEventListener("input", runSearch);
      runSearch();
    }
  });
})();

function initMoviePlayer(source) {
  var bind = function () {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("playButton");
    if (!video || !button || !source) {
      return;
    }
    var loaded = false;
    var load = function () {
      if (!loaded) {
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      button.classList.add("is-hidden");
      var play = video.play();
      if (play && typeof play.catch === "function") {
        play.catch(function () {});
      }
    };
    button.addEventListener("click", load);
    video.addEventListener("click", function () {
      if (video.paused) {
        load();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
  };
  if (document.readyState !== "loading") {
    bind();
  } else {
    document.addEventListener("DOMContentLoaded", bind);
  }
}
