(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');

      if (existing) {
        existing.addEventListener('load', resolve);
        existing.addEventListener('error', reject);
        resolve();
        return;
      }

      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setStatus(root, message) {
    var status = root.querySelector('[data-player-status]');

    if (status) {
      status.textContent = message;
    }
  }

  function getSource(videoId) {
    if (window.VIDEO_SOURCES && window.VIDEO_SOURCES[videoId]) {
      return window.VIDEO_SOURCES[videoId];
    }

    return window.DEFAULT_HLS_SOURCE;
  }

  function playWithNative(video, source, root, overlay) {
    video.src = source;
    video.play()
      .then(function () {
        overlay.classList.add('is-hidden');
        setStatus(root, '正在播放');
      })
      .catch(function () {
        setStatus(root, '浏览器阻止自动播放，请再次点击播放器播放');
      });
  }

  function playWithHls(video, source, root, overlay) {
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
      video.play()
        .then(function () {
          overlay.classList.add('is-hidden');
          setStatus(root, 'HLS 已初始化，正在播放');
        })
        .catch(function () {
          setStatus(root, '播放已就绪，请再次点击播放器播放');
        });
    });

    hls.on(window.Hls.Events.ERROR, function (_, data) {
      if (data && data.fatal) {
        setStatus(root, '播放源暂时不可用，请稍后重试或替换 m3u8 地址');
        hls.destroy();
      }
    });
  }

  function startPlayer(root) {
    var video = root.querySelector('video');
    var overlay = root.querySelector('[data-play-button]');
    var videoId = root.getAttribute('data-video-id');
    var source = getSource(videoId);

    if (!video || !source) {
      setStatus(root, '未找到播放源');
      return;
    }

    setStatus(root, '正在载入播放源');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      playWithNative(video, source, root, overlay);
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      playWithHls(video, source, root, overlay);
      return;
    }

    loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js')
      .then(function () {
        if (window.Hls && window.Hls.isSupported()) {
          playWithHls(video, source, root, overlay);
        } else {
          setStatus(root, '当前浏览器不支持 HLS 播放');
        }
      })
      .catch(function () {
        setStatus(root, 'HLS 播放器脚本载入失败');
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-player]').forEach(function (root) {
      var button = root.querySelector('[data-play-button]');

      if (button) {
        button.addEventListener('click', function () {
          startPlayer(root);
        });
      }
    });
  });
})();
