function initMoviePlayer(url) {
  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('playOverlay');
  var hlsInstance = null;

  if (!video || !overlay || !url) {
    return;
  }

  function bindStream() {
    if (video.dataset.ready === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = url;
    }

    video.dataset.ready = '1';
  }

  function playVideo() {
    bindStream();
    overlay.classList.add('is-hidden');
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('ended', function () {
    overlay.classList.remove('is-hidden');
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
