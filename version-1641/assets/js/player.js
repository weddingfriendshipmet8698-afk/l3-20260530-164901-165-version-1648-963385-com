import { H as Hls } from '../libs/hls-dru42stk.js';

function setupPlayer(video) {
  const src = video.getAttribute('data-src');
  const frame = video.closest('[data-player-frame]');
  const overlay = frame ? frame.querySelector('[data-play-overlay]') : null;
  let hlsInstance = null;
  let isReady = false;

  function loadSource() {
    if (!src || isReady) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      isReady = true;
      return;
    }

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        isReady = true;
      });
      hlsInstance.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        }
      });
      isReady = true;
    }
  }

  function playVideo() {
    loadSource();
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    if (frame) {
      frame.classList.add('is-playing');
    }
  });

  video.addEventListener('pause', function () {
    if (frame && video.currentTime === 0) {
      frame.classList.remove('is-playing');
    }
  });

  video.addEventListener('mouseenter', loadSource, { once: true });
  video.addEventListener('focus', loadSource, { once: true });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.js-hls-player').forEach(setupPlayer);
});
