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
const colorPicker = document.getElementById("color__picker");
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

  colorPicker.addEventListener("change", (e) => {
    const color = e.target.value;
    const mail = response.member_data[0][2];
    updateColor(mail, color);
    userCircle.style.backgroundColor = `${color}`;
  });
};
checkState();

// 更改顏色

userCircle.addEventListener("click", () => {
  colorPicker.click();
});
const updateColor = async function (email, color) {
  const payload = {
    user_email: email,
    color: color,
  };
  const url = "/api/auth/color";
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
};

// 新建筆記
const newNote = document.getElementById("newNote");
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
  const submit = document.getElementById("submit");

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
const submit = document.getElementById("submit");
submit.addEventListener("click", async () => {
  const shareEmail = document.getElementById("shareEmail").value.trim();
  const role = document.querySelector('input[name="role"]:checked');
  const note_id = submit.dataset.submitid.slice(4);
  if (!shareEmail || role === null) {
    alert("請輸入信箱或選擇權限角色");
    return;
  } else {
    const payload = {
      email: shareEmail,
      role: role.value,
    };
    // console.log(payload);
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
    const blankSon = document.createElement("div");
    blankSon.classList.add("blank__son");
    const btnBox = document.createElement("div");
    btnBox.classList.add("btnBox");
    const permissionBtn = document.createElement("span");
    permissionBtn.classList.add("noteBtn");
    permissionBtn.classList.add("material-symbols-outlined");
    permissionBtn.setAttribute("data-permission", `permissionBtn${data[i][0]}`);
    permissionBtn.setAttribute("title", "分享");
    permissionBtn.textContent = "link";
    const deleteBtn = document.createElement("span");
    deleteBtn.classList.add("delete_btn");
    deleteBtn.classList.add("material-symbols-outlined");
    deleteBtn.setAttribute("title", "刪除");
    deleteBtn.setAttribute("data-delete", `deleteBtn${data[i][0]}`);
    deleteBtn.textContent = "delete";

    noteBar.appendChild(createNoteSon);
    createNoteSon.appendChild(noteTitle);
    createNoteSon.appendChild(blankSon);
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

    blankSon.addEventListener("click", () => {
      const id = noteTitle.dataset.id;
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
      window.location.href = `/note/${id.slice(4)}`;
    });
  }
};

const renderDomOnly = function (data) {
  for (let i = 0; i < data.length; i++) {
    const createNoteSon = document.createElement("div");
    createNoteSon.classList.add("noteSon");
    createNoteSon.setAttribute("data-noteid", `note${data[i][0]}`);
    const noteTitle = document.createElement("p");
    noteTitle.classList.add("noteTitle");
    noteTitle.setAttribute("data-id", `data${data[i][0]}`);
    const blankSon = document.createElement("div");
    blankSon.classList.add("blank__son");
    const btnBox = document.createElement("div");
    btnBox.classList.add("btnBox");
    const locker = document.createElement("div");
    locker.classList.add("locker");
    locker.classList.add("material-symbols-outlined");
    locker.innerText = "lock";
    const locker_text = document.createElement("p");
    locker_text.classList.add("locker_text");
    locker_text.innerText = "ReadOnly";

    noteBar.appendChild(createNoteSon);
    createNoteSon.appendChild(noteTitle);
    createNoteSon.appendChild(blankSon);
    createNoteSon.appendChild(btnBox);
    btnBox.appendChild(locker);
    btnBox.appendChild(locker_text);

    // 點擊進入note頁面
    noteTitle.textContent = data[i][1];
    noteTitle.addEventListener("click", () => {
      const id = noteTitle.dataset.id;
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

const getNoteDataShare = async function (role) {
  // const role = "editor";
  const url = `/api/note/note_data_render/${role}`;
  const request = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const response = await request.json();
  console.log(response);

  const noData = document.querySelector(".nodata");
  if (response.data && role === "editor") {
    renderDomShare(response.data);
  } else if (response.data && role === "viewer") {
    renderDomOnly(response.data);
  } else {
    noData.classList.remove("data__state--off");
  }
};

// 功能按鈕
const mynote = document.getElementById("mynote");
mynote.addEventListener("click", () => {
  const noData = document.querySelector(".nodata");
  const titleName = document.querySelector(".titleName");
  const note = document.querySelector(".note");
  const noteSons = document.querySelectorAll(".noteSon");
  for (let son of noteSons) {
    note.removeChild(son);
  }
  noData.classList.add("data__state--off");
  titleName.textContent = "My Notes";
  getNoteDataSelf();
  // window.location.reload();
});

const sharednote = document.getElementById("sharednote");
sharednote.addEventListener("click", async () => {
  const noData = document.querySelector(".nodata");
  const titleName = document.querySelector(".titleName");
  const note = document.querySelector(".note");
  const noteSons = document.querySelectorAll(".noteSon");
  for (let son of noteSons) {
    note.removeChild(son);
  }
  noData.classList.add("data__state--off");
  titleName.textContent = "Shared Notes";
  getNoteDataShare("editor");
});

const onlyReadNote = document.getElementById("onlyRnote");
onlyReadNote.addEventListener("click", async () => {
  const noData = document.querySelector(".nodata");
  const titleName = document.querySelector(".titleName");
  const note = document.querySelector(".note");
  const noteSons = document.querySelectorAll(".noteSon");
  for (let son of noteSons) {
    note.removeChild(son);
  }
  noData.classList.add("data__state--off");
  titleName.textContent = "Shared Notes";
  getNoteDataShare("viewer");
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
