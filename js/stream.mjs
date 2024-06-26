export const streamWebCamVideo = (isFrontCamera = true) => {
  const video = document.getElementById("stream");
  const constraints = {
    video: {
      facingMode: isFrontCamera ? "user" : "environment", // Toggle between front and rear cameras
      zoom: true,
    },
  };
  window.navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = (e) => {
        isFrontCamera && video.classList.add("flip");
        !isFrontCamera && video.classList.remove("flip");
        video.play();
      };
      const [track] = stream.getVideoTracks();
      const capabilities = track.getCapabilities();
      const settings = track.getSettings();

      const input = document.querySelector('input[type="range"]');

      // Check whether zoom is supported or not.
      if (!("zoom" in settings)) {
        return Promise.reject("Zoom is not supported by " + track.label);
      }

      // Map zoom to a slider element.
      input.min = capabilities.zoom.min;
      input.max = capabilities.zoom.max;
      input.step = capabilities.zoom.step;
      input.value = settings.zoom;

      document.querySelector(".zoom-multiplier").textContent = `${~~capabilities
        .zoom.min}x ${
        ~~(capabilities.zoom.max + 3 * capabilities.zoom.min) / 4
      }x ${
        ~~(3 * capabilities.zoom.max + capabilities.zoom.min) / 4
      }x ${~~capabilities.zoom.max}x`;

      console.log("min:", capabilities.zoom.min);
      console.log("max:", capabilities.zoom.max);
      console.log("step:", capabilities.zoom.step);
      console.log("value:", settings.zoom);

      input.oninput = function (event) {
        track.applyConstraints({ advanced: [{ zoom: event.target.value }] });
        document.querySelector(".slider").style.left =
          ((input.value - 1) * 120) / (capabilities.zoom.max - 1) + 3 + "px";
      };
      input.hidden = false;
      document.querySelector(".range-container").style.visibility = "visible";
    })
    .catch((e) => {
      console.error(e);
    });
};
