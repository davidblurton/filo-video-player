(function (window, document) {
  const m = document.currentScript;

  const loader = document.createElement("script");
  loader.setAttribute("src", "https://cdn.jsdelivr.net/npm/hls.js@latest");
  m.parentNode.insertBefore(loader, m);

  const video = document.createElement("video");
  video.setAttribute("controls", "");
  video.setAttribute("width", "720");

  m.parentNode.insertBefore(video, m);

  document.head.insertAdjacentHTML(
    "beforeend",
    `<style>video::-webkit-media-controls-timeline {
    display: none;
}</style>`
  );

  loader.onload = function () {
    var hls = new Hls({
      liveDurationInfinity: true,
    });

    // bind them together
    hls.attachMedia(video);
    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
      console.log("video and hls.js are now bound together !");
      hls.loadSource(
        "https://stream.nfp.is/live/smil:multi.smil/playlist.m3u8"
      );

      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        console.log(
          "manifest loaded, found " + data.levels.length + " quality level"
        );
      });
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            console.log("fatal network error encountered, try to recover");
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log("fatal media error encountered, try to recover");
            hls.recoverMediaError();
            break;
          default:
            // cannot recover
            hls.destroy();
            break;
        }
      }
    });
  };
})(window, document);
