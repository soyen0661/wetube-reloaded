const videoContainer = document.getElementById("videoContainer");
const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (event) => {
  if (video.paused) {
    video.play();
    playBtnIcon.className = "fas fa-pause";
  } else {
    video.pause();
    playBtnIcon.className = "fas fa-play";
  }
};
const handleEnded = () => {
  playBtnIcon.className = "fas fa-play";
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, { method: "POST" });
};
const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  volumeValue = value;
  video.volume = volumeValue;
  video.muted = volumeValue === "0" ? true : false;
  muteBtnIcon.className =
    volumeValue === "0" ? "fas fa-volume-mute" : "fas fa-volume-up";
};
const handleMuteClick = (event) => {
  if (video.muted) {
    video.muted = false;
    volumeValue = volumeValue === "0" ? 1 : volumeValue;
    video.volume = volumeValue;
    volumeRange.value = volumeValue;
  } else {
    video.muted = true;
    volumeRange.value = 0;
  }
  muteBtnIcon.className = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
};
const formatTime = (time) =>
  new Date(time * 1000).toISOString().substring(14, 19);
const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(video.duration);
  timeline.max = Math.floor(video.duration);
};
const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(video.currentTime);
  timeline.value = video.currentTime;
};
const handleTimelineChange = () => (video.currentTime = timeline.value);
const handleFullScreenChange = () => {
  fullScreenBtnIcon.className =
    document.fullscreenElement === null ? "fas fa-expand" : "fas fa-compress";
};
const handleFullScreenClick = () => {
  if (document.fullscreenElement === null) {
    videoContainer.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

const hideControls = () => videoControls.classList.remove("showing");
const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};
const handleMouseLeave = () =>
  (controlsTimeout = setTimeout(hideControls, 3000));

playBtn.addEventListener("click", handlePlayClick);
video.addEventListener("click", handlePlayClick);
document.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    handlePlayClick();
  }
});
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreenClick);
document.addEventListener("fullscreenchange", handleFullScreenChange);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
