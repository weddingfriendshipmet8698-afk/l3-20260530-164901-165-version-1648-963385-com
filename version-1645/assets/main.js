(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = next % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setFilters() {
    var search = document.querySelector("[data-card-search]");
    var year = document.querySelector("[data-year-filter]");
    var type = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty]");
    if (!search && !year && !type && !cards.length) {
      return;
    }
    function apply() {
      var q = normalize(search && search.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var ok = (!q || text.indexOf(q) !== -1) && (!y || cardYear === y) && (!t || cardType.indexOf(t) !== -1);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    if (search) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        search.value = q;
      }
      search.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    if (type) {
      type.addEventListener("change", apply);
    }
    apply();
  }

  function setPlayer(config) {
    var video = document.getElementById(config.videoId);
    var trigger = document.querySelector(config.triggerSelector);
    if (!video || !trigger) {
      return;
    }
    var loaded = false;
    function load() {
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = config.source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            maxBufferLength: 30
          });
          hls.loadSource(config.source);
          hls.attachMedia(video);
          video.hlsPlayer = hls;
        } else {
          video.src = config.source;
        }
        loaded = true;
      }
      trigger.classList.add("is-hidden");
      video.controls = true;
      var playAction = video.play();
      if (playAction && typeof playAction.catch === "function") {
        playAction.catch(function () {});
      }
    }
    trigger.addEventListener("click", load);
    video.addEventListener("click", function () {
      if (!loaded) {
        load();
      }
    });
  }

  window.initMoviePlayer = setPlayer;

  ready(function () {
    setMenu();
    setHero();
    setFilters();
  });
})();
