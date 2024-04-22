const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const videoComments = document.querySelector(".video__comments ul");

const addComment = (text, id) => {
  const newComment = document.createElement("li");
  const icon = document.createElement("i");
  const icon2 = document.createElement("i");
  const span = document.createElement("span");
  const span2 = document.createElement("span");
  const mixin = document.createElement("div");
  newComment.className = "video__comment";
  newComment.dataset.id = id;
  mixin.className = "comment-mixin";
  mixin.style.cssText =
    "display: flex; justify-content: space-between; align-items: center;";
  icon.className = "fas fa-comment";
  icon.style.cssText = "margin-right: 5px;";
  icon2.className = "fas fa-trash";
  icon2.dataset.id = id;
  span.innerText = ` ${text} `;
  span.style.cssText = "text-align: left; flex-grow:1;";
  span2.className = "comment-delete";
  span2.style.cssText =
    "right: 5px;cursor:pointer; transition: transform 0.2s ease; &:hover { transform: scale(0.95); } &:active { transform: scale(0.9); }";
  span2.appendChild(icon2);
  mixin.appendChild(icon);
  mixin.appendChild(span);
  mixin.appendChild(span2);
  newComment.appendChild(mixin);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  const textarea = form.querySelector("textarea");

  event.preventDefault();
  const text = textarea.value;
  const videoID = videoContainer.dataset.id;

  const response = await fetch(`/api/videos/${videoID}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  textarea.value = "";
  const { newCommentId } = await response.json();
  if (response.status === 201) {
    addComment(text, newCommentId);
  }
};

const handleDelete = async (event) => {
  const commentId = event.target.dataset.id;
  const commentElement = document.querySelector(
    `.video__comment[data-id="${commentId}"]`
  );
  const response = await fetch(`/api/videos/${commentId}/comment`, {
    method: "DELETE",
  });
  if (response.status === 200) {
    if (commentElement) {
      commentElement.remove();
    }
  } else {
    return;
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

videoComments.addEventListener("click", handleDelete);
