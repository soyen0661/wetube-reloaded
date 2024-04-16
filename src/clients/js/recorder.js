import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const recordingContainer = document.getElementById("recording-container");
const iconContainer = recordingContainer.querySelector("#icon-container");
const recordBtn = iconContainer.querySelector("#recordBtn");
const recordBtnIcon = recordBtn.querySelector("i");
const preview = recordingContainer.querySelector("video");
const previewIcon = iconContainer.querySelector("#previewIcon i");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  recordBtn.removeEventListener("click", handleDownload);
  recordBtnIcon.className = "";
  const button = document.createElement("button");
  button.innerText = "Transcoding...";
  button.className = "record__trading";
  button.disabled = true;
  iconContainer.appendChild(button);

  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

  await ffmpeg.run("-i", files.input, "-r", "60", files.output);
  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  button.remove();
  recordBtnIcon.className = "fa-solid fa-record-vinyl";
  recordBtn.addEventListener("click", handleRecord);
  getStream();
};

const handleStop = () => {
  recordBtnIcon.className = "fa-solid fa-circle-down";
  previewIcon.classList.remove("blink");
  recordBtn.removeEventListener("click", handleStop);
  recordBtn.addEventListener("click", handleDownload);
  recorder.stop();
};
const handleRecord = () => {
  recordBtnIcon.className = "fa-solid fa-circle-stop";
  previewIcon.classList.add("blink");
  recordBtn.removeEventListener("click", handleRecord);
  recordBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    preview.srcObject = null;
    preview.src = videoFile;
    preview.loop = true;
    preview.play();
  };
  recorder.start();
};

const getStream = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  preview.srcObject = stream;
  preview.play();
};

getStream();
recordBtn.addEventListener("click", handleRecord);
