export let mediaRecorder = null;
let chunks = [];
let startTime = null;
let timerInterval;
const recordingIndicator = document.createElement("div");

export const captureVideo = () => {
  const videoButton = document.querySelector(".capture-button");
  videoButton.addEventListener("click", () => {
    const isVideoMode = document.querySelector(
      ".switch-camera-video-photo-mode input[type='radio'][name='modes']:checked").value === "video-mode"
    if (!isVideoMode) return;
    const facingModeButton = document.querySelector(
      ".switch-camera-facing-mode"
    );
    recordVideo(facingModeButton);
  });
};
const modes = document.querySelectorAll(
  ".switch-camera-video-photo-mode input[type='radio']"
);
modes.forEach(mode => mode.addEventListener("change", () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    clearInterval(timerInterval);
  }
}));

const recordVideo = async (facingModeButton) => {
  const video = document.getElementById("stream");
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    clearInterval(timerInterval);
    return;
  }
  try {
    mediaRecorder = new MediaRecorder(video.srcObject);
    startTime = Date.now();
    mediaRecorder.start();
    mediaRecorder.ondataavailable = (event) => {
      const blob = new Blob([event.data], {
        type: "video/mp4",
      });
      chunks.push(blob);
    };

    recordingIndicator.textContent = "00:00:00";
    recordingIndicator.classList.add("record");
    document.body.appendChild(recordingIndicator);

    timerInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      recordingIndicator.textContent = formatTime(elapsedTime);
    }, 1000);

    mediaRecorder.onstop = () => {
      saveRecordedVideo();
      clearInterval(timerInterval);
    };


    facingModeButton.addEventListener("click", () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        clearInterval(timerInterval);
      }
    });
  } catch (e) {
    console.error(e);
  }
};

const saveRecordedVideo = () => {
  recordingIndicator.remove();
  if (!chunks.length) {
    console.error("No recorded video data available.");
    return;
  }
  const blob = new Blob(chunks, { type: "video/mp4" });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "");
  const filename = `video_${timestamp}.mp4`;
  const videoUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = videoUrl;
  link.download = filename;
  // link.click();
  document.querySelector(".preview").src = videoUrl
  document.querySelector(".preview-dual").src = "./assets/rect-dual.svg"
  chunks = [];
};

const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const pad = (num) => {
  return num.toString().padStart(2, "0");
};
