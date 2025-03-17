const sendBtn = document.getElementById("sendBtn");
let msgInput = document.getElementById("msgInput");
let commentSpace = document.getElementById("commentSpace");
let commentContainer = document.getElementById("commentContainer");
commentContainer.style.display = "none";
let userName = document.getElementById("username");
let loginBox = document.getElementById("loginContainer");
let loginBtn = document.getElementById("loginBtn");
let userNameValue = "";

loginBtn.addEventListener("click", () => {
  if (userName.value.length != 0) {
    userNameValue = userName.value;
    loginBox.style.display = "none";
    fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: userName.value }),
    })
      .then((response) => response.json())
      .then(() => {
        commentContainer.style.display = "inline";
        loadComments();
      });
  }
});

sendBtn.addEventListener("click", () => {
  if (msgInput.textContent.length != 0) {
    fetch("/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment: msgInput.textContent,
        userName: userNameValue,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        msgInput.textContent = "";
        loadComments();
      });
  }
});

function createCommentElement(comment) {
  const commentBox = document.createElement("div");
  commentBox.classList.add("comment");
  commentBox.setAttribute("data-comment-id", comment.id);

  const mainComment = document.createElement("div");
  mainComment.classList.add("mainComment");

  const likeBtn = document.createElement("div");
  likeBtn.classList.add("likeBtn");

  const plusImg = document.createElement("img");
  plusImg.src = "assets/icon-plus.svg";
  plusImg.onclick = () => handleLike(comment.id, 1);

  const likeCount = document.createElement("p");
  likeCount.textContent = comment.likes || 0;

  const minusImg = document.createElement("img");
  minusImg.src = "assets/icon-minus.svg";
  minusImg.onclick = () => handleLike(comment.id, -1);

  likeBtn.append(plusImg, likeCount, minusImg);

  const msgDetails = document.createElement("div");
  msgDetails.classList.add("msgDetails");

  const nameDate = document.createElement("div");
  nameDate.classList.add("nameDate");

  const name = document.createElement("div");
  name.classList.add("name");

  const profileImg = document.createElement("img");
  profileImg.src = "assets/image-ramsesmiron.png";

  const userName = document.createElement("h4");
  userName.textContent = comment.username;

  const postedTime = document.createElement("p");
  postedTime.textContent = "1 month ago";

  name.append(profileImg, userName, postedTime);

  const reply = document.createElement("div");
  reply.classList.add("reply");

  const replyP = document.createElement("p");
  const replyImg = document.createElement("img");
  replyImg.src = "assets/icon-reply.svg";
  replyP.appendChild(replyImg);
  replyP.append(" Reply");
  reply.appendChild(replyP);

  nameDate.append(name, reply);

  const givenMsg = document.createElement("div");
  givenMsg.classList.add("givenMsg");

  const msgPara = document.createElement("p");
  msgPara.textContent = comment.content;

  givenMsg.appendChild(msgPara);

  msgDetails.append(nameDate, givenMsg);
  mainComment.append(likeBtn, msgDetails);
  commentBox.appendChild(mainComment);

  reply.addEventListener("click", () => {
    const replyForm = createReplyForm(comment.id);
    commentBox.appendChild(replyForm);
  });

  return commentBox;
}

function createReplyForm(parentId) {
  const replyComment = document.createElement("div");
  replyComment.classList.add("replyComment");

  const replyProfileImg = document.createElement("img");
  replyProfileImg.src = "assets/image-ramsesmiron.png";

  const replyMsgInput = document.createElement("div");
  replyMsgInput.setAttribute("contenteditable", "true");
  replyMsgInput.classList.add("replyMsgInput");

  const replyButton = document.createElement("div");
  replyButton.classList.add("replyButton");

  const replyBtn = document.createElement("button");
  replyBtn.textContent = "REPLY";

  replyButton.appendChild(replyBtn);
  replyComment.append(replyProfileImg, replyMsgInput, replyButton);

  replyBtn.addEventListener("click", () => {
    if (replyMsgInput.textContent.length != 0) {
      fetch("/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: replyMsgInput.textContent,
          parentId: parentId,
          userName: userNameValue,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          replyComment.remove();
          loadComments();
        });
    }
  });

  return replyComment;
}

function handleLike(commentId, value) {
  fetch("/like", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentId, value }),
  }).then(() => loadComments());
}

function loadComments() {
  fetch("/comments")
    .then((response) => response.json())
    .then((data) => {
      commentSpace.innerHTML = "";
      data.forEach((comment) => {
        if (!comment.parent_id) {
          const commentElement = createCommentElement(comment);
          const replies = data.filter(
            (reply) => reply.parent_id === comment.id
          );
          replies.forEach((reply) => {
            const replyElement = createCommentElement(reply);
            replyElement.classList.add("threadComment");
            commentElement.appendChild(replyElement);
          });
          commentSpace.appendChild(commentElement);
        }
      });
    });
}

msgInput.focus();
