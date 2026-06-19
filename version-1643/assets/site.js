import { H as Hls } from "./hls.js";

const header = document.querySelector("[data-header]");

function updateHeaderState() {
  if (!header || header.classList.contains("solid")) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 50);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

for (const toggle of document.querySelectorAll("[data-mobile-toggle]")) {
  toggle.addEventListener("click", () => {
    const panel = document.querySelector("[data-mobile-panel]");
    if (panel) {
      panel.classList.toggle("is-open");
    }
  });
}

function initHeroCarousel() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));

  if (slides.length <= 1) {
    return;
  }

  let index = 0;
  let timer = null;

  function showSlide(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function schedule() {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(index + 1), 5200);
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      showSlide(dotIndex);
      schedule();
    });
  });

  hero.addEventListener("mouseenter", () => window.clearInterval(timer));
  hero.addEventListener("mouseleave", schedule);
  schedule();
}

function initSearchScopes() {
  for (const scope of document.querySelectorAll("[data-search-scope]")) {
    const input = scope.querySelector("[data-search-input]");
    const chips = Array.from(scope.querySelectorAll("[data-filter]"));
    const cards = Array.from(scope.querySelectorAll("[data-card]"));
    let activeFilter = "all";

    function applyFilters() {
      const query = input ? input.value.trim().toLowerCase() : "";

      for (const card of cards) {
        const searchText = (card.dataset.search || "").toLowerCase();
        const filterValue = card.dataset.filterValue || "";
        const queryMatch = !query || searchText.includes(query);
        const filterMatch = activeFilter === "all" || filterValue === activeFilter;
        card.classList.toggle("hidden-by-filter", !(queryMatch && filterMatch));
      }
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        activeFilter = chip.dataset.filter || "all";
        chips.forEach((item) => item.classList.toggle("is-active", item === chip));
        applyFilters();
      });
    });
  }
}

function attachHls(video, source, message) {
  if (video.dataset.ready === "1") {
    return;
  }

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    video.dataset.ready = "1";
    video._hlsInstance = hls;

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (message && data && data.fatal) {
        message.textContent = "播放源暂时无法连接，请稍后重试。";
      }
    });

    return;
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    video.dataset.ready = "1";
    return;
  }

  if (message) {
    message.textContent = "当前浏览器不支持 HLS 播放。";
  }
}

function initVideoPlayers() {
  for (const button of document.querySelectorAll("[data-play]")) {
    button.addEventListener("click", async () => {
      const shell = button.closest("[data-player]");
      if (!shell) {
        return;
      }

      const video = shell.querySelector("video");
      const message = shell.querySelector("[data-player-message]");
      const source = shell.dataset.src;

      if (!video || !source) {
        if (message) {
          message.textContent = "播放器初始化失败。";
        }
        return;
      }

      button.classList.add("is-hidden");
      video.controls = true;
      attachHls(video, source, message);

      try {
        await video.play();
      } catch (_error) {
        if (message) {
          message.textContent = "已加载播放源，请点击播放器继续播放。";
        }
      }
    });
  }
}

initHeroCarousel();
initSearchScopes();
initVideoPlayers();
