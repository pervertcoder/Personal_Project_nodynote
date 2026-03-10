"use strict";
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    location.reload();
  }
});

// JWT驗證
const token = localStorage.getItem("JWTtoken");
let userName = document.querySelector(".username");
const userCircle = document.querySelector(".userCircle");
// const userId = window.location.pathname.slice(11);
const checkState = async function () {
  const url = "/api/auth/login";
  const request = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const response = await request.json();
  console.log(response);

  if (response.ok) {
    userName.textContent = response.member_data[0][1];
    userCircle.textContent = response.member_data[0][1][0];
    userCircle.style.backgroundColor = `${response.member_data[0][4]}`;
    console.log("登入成功");
  } else {
    window.location.href = "/";
  }
};
checkState();

// 新建筆記
const newNote = document.getElementById("newnote");
newNote.addEventListener("click", async () => {
  const payload = {
    title: "note",
    content: "nodynote",
  };
  const url = "/api/note/note_add";
  const request = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const response = await request.json();
  console.log(response);

  window.location.href = `/note/${response.note_id}`;
});

const openShareModal = function (noteId) {
  const modal = document.querySelector(".coverlayer");
  const close = document.getElementById("close");
  const submit = document.getElementById("sumbit");

  modal.dataset.modalid = noteId;
  submit.dataset.submitid = noteId;

  modal.classList.add("state--on");
  close.addEventListener("click", () => {
    modal.classList.remove("state--on");
  });
};

document.addEventListener("DOMContentLoaded", function () {
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("noteBtn")) {
      const card = e.target.closest(".noteSon");
      if (!card) return;

      const noteId = card.dataset.noteid;
      openShareModal(noteId);
    }
  });
});

// 傳分享資料;
const submit = document.getElementById("sumbit");
submit.addEventListener("click", async () => {
  const shareEmail = document.getElementById("shareEmail").value.trim();
  const note_id = submit.dataset.submitid.slice(4);
  if (!shareEmail) {
    alert("請輸入信箱");
    return;
  } else {
    const payload = {
      email: shareEmail,
    };
    const url = `/api/note/share_note/${note_id}`;
    const request = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const response = await request.json();
    console.log(response);

    window.location.reload();
  }
});

// 拿筆記資料
const noteBar = document.querySelector(".note");
const renderDomSelf = function (data) {
  // const noteNumber = document.querySelector(".noteNumber");
  for (let i = 0; i < data.length; i++) {
    const createNoteSon = document.createElement("div");
    createNoteSon.classList.add("noteSon");
    createNoteSon.setAttribute("data-noteid", `note${data[i][0]}`);
    const noteTitle = document.createElement("p");
    noteTitle.classList.add("noteTitle");
    noteTitle.setAttribute("data-id", `data${data[i][0]}`);
    const btnBox = document.createElement("div");
    btnBox.classList.add("btnBox");
    const permissionBtn = document.createElement("button");
    permissionBtn.classList.add("noteBtn");
    permissionBtn.setAttribute("data-permission", `permissionBtn${data[i][0]}`);
    permissionBtn.textContent = "分享權限";
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete_btn");
    deleteBtn.setAttribute("data-delete", `deleteBtn${data[i][0]}`);
    deleteBtn.textContent = "刪除";

    noteBar.appendChild(createNoteSon);
    createNoteSon.appendChild(noteTitle);
    createNoteSon.appendChild(btnBox);
    btnBox.appendChild(permissionBtn);
    btnBox.appendChild(deleteBtn);

    // 點擊進入note頁面
    noteTitle.textContent = data[i][1];
    noteTitle.addEventListener("click", () => {
      const id = noteTitle.dataset.id;
      // console.log(id);
      window.location.href = `/note/${id.slice(4)}`;
    });

    // 刪除筆記資料
    deleteBtn.addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete_btn")) {
        e.stopPropagation();
      }
      const note_id = deleteBtn.dataset.delete.slice(9);
      const url = `/api/note/note_delete/${note_id}`;
      const request = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      const response = await request.json();
      console.log(response);

      if (response.note_id) {
        const removeTarget = document.querySelector(
          `[data-noteid="note${response.note_id}"]`,
        );
        removeTarget?.remove();
      }
      // window.location.reload();
    });
  }
};

const renderDomShare = function (data) {
  for (let i = 0; i < data.length; i++) {
    const createNoteSon = document.createElement("div");
    createNoteSon.classList.add("noteSon");
    createNoteSon.setAttribute("data-noteid", `note${data[i][0]}`);
    const noteTitle = document.createElement("p");
    noteTitle.classList.add("noteTitle");
    noteTitle.setAttribute("data-id", `data${data[i][0]}`);

    noteBar.appendChild(createNoteSon);
    createNoteSon.appendChild(noteTitle);

    // 點擊進入note頁面
    noteTitle.textContent = data[i][1];
    noteTitle.addEventListener("click", () => {
      const id = noteTitle.dataset.id;
      // console.log(id);
      window.location.href = `/note/${id.slice(4)}`;
    });
  }
};

const getNoteDataSelf = async function () {
  const role = "owner";
  const url = `/api/note/note_data_render/${role}`;
  const request = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const response = await request.json();
  console.log(response);

  const noData = document.querySelector(".nodata");
  if (response.data) {
    renderDomSelf(response.data);
  } else {
    noData.classList.remove("data__state--off");
  }
};
getNoteDataSelf();

const getNoteDataShare = async function () {
  const role = "editor";
  const url = `/api/note/note_data_render/${role}`;
  const request = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const response = await request.json();
  console.log(response);

  const noData = document.querySelector(".nodata");
  if (response.data) {
    renderDomShare(response.data);
  } else {
    noData.classList.remove("data__state--off");
  }
};

// 功能按鈕
const mynote = document.getElementById("mynote");
mynote.addEventListener("click", () => {
  const note = document.querySelector(".note");
  const noteSons = document.querySelectorAll(".noteSon");
  for (let son of noteSons) {
    note.removeChild(son);
  }
  window.location.reload();
});

const sharednote = document.getElementById("sharednote");
sharednote.addEventListener("click", async () => {
  const note = document.querySelector(".note");
  const noteSons = document.querySelectorAll(".noteSon");
  for (let son of noteSons) {
    note.removeChild(son);
  }
  getNoteDataShare();
});

// 登出
const logout = document.getElementById("logout");
logout.addEventListener("click", async (e) => {
  e.stopPropagation();
  window.location.href = "/";
  const url = "/api/auth/logout";
  const request = await fetch(url, {
    method: "POST",
    credentials: "include",
  });

  const response = await request.json();

  // if (response.ok) {
  // }
});

// 待優化：共享的筆記要顯示共享狀態
