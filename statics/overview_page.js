"use strict";
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    location.reload();
  }
});

// 定時檢查token是否過期
let tokenCheckInterval = null;
let countdownTimer = null;

const checkToken = async function () {
  const url = "/api/sessions/validate";
  try {
    const request = await fetch(url);
    const response = await request.json();
    if (!response?.exp_time) return;

    const expireTime = response.exp_time * 1000;
    const now = Date.now();
    const remaining = expireTime - now;

    if (remaining < 60 * 60 * 1000 && !countdownTimer) {
      startCountdown(remaining);
    }
  } catch (err) {
    console.warn("token檢查失敗", err);
  }
};

const startCountdown = async function (ms) {
  let remaining = ms;

  countdownTimer = setInterval(async () => {
    remaining -= 1000 * 60;
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    console.log(`Token 剩餘時間 ${minutes}分${seconds}秒`);

    if (remaining <= 10 * 60 * 1000) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      alert("你的憑證快到期，請重新登入");

      // 呼叫登出 API
      try {
        await fetch("/api/sessions/", {
          method: "DELETE",
          credentials: "include",
        });
      } catch (err) {
        console.error("登出失敗", err);
      }

      window.location.href = "/";
    }

    if (remaining <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }, 1000 * 60);
};

// JWT驗證
const sharednotedata = document.getElementById("sharednote");
const token = localStorage.getItem("JWTtoken");
let userName = document.querySelector(".username");
const userCircle = document.querySelector(".userCircle");
const colorPicker = document.getElementById("color__picker");
// const userId = window.location.pathname.slice(11);
const checkState = async function () {
  const url = "/api/users/me";
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
    sharednotedata.dataset.userId = response.member_data[0][0];
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

checkToken();
tokenCheckInterval = setInterval(checkToken, 60 * 60 * 1000);

// 更改顏色

userCircle.addEventListener("click", () => {
  colorPicker.click();
});
const updateColor = async function (email, color) {
  const payload = {
    user_email: email,
    color: color,
  };
  const url = "/api/users/me";
  const request = await fetch(url, {
    method: "PATCH",
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
const coverlayer = document.querySelector(".coverlayer");
submit.addEventListener("click", async () => {
  const shareEmail = document.getElementById("shareEmail").value.trim();
  const role = document.querySelector('input[name="role"]:checked');
  const note_id = coverlayer.dataset.modalid;
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
    if (response.message === "資料重複") {
      alert("權限重複寫入");
      return;
    }

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
    const blankSon = document.createElement("div");
    blankSon.classList.add("blank__son");
    const btnBox = document.createElement("div");
    btnBox.classList.add("btnBox");
    const pen = document.createElement("div");
    pen.classList.add("pen");
    pen.classList.add("material-symbols-outlined");
    pen.innerText = "edit_note";
    const pen_text = document.createElement("p");
    pen_text.classList.add("pen_text");
    pen_text.innerText = "Editable";

    noteBar.appendChild(createNoteSon);
    createNoteSon.appendChild(noteTitle);
    createNoteSon.appendChild(blankSon);
    createNoteSon.appendChild(btnBox);
    btnBox.appendChild(pen);
    btnBox.appendChild(pen_text);

    // 點擊進入note頁面
    noteTitle.textContent = data[i][1];
    noteTitle.addEventListener("click", () => {
      const id = noteTitle.dataset.id;
      window.location.href = `/note/${id.slice(4)}`;
    });

    blankSon.addEventListener("click", () => {
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

    blankSon.addEventListener("click", () => {
      const id = noteTitle.dataset.id;
      window.location.href = `/note/${id.slice(4)}`;
    });
  }
};

const renderNotes = function ({ owner = [], editor = [], viewer = [] }, title) {
  const mainContent = document.querySelector(".mainContent");

  mainContent.innerHTML = "";

  const titleDiv = document.createElement("div");
  titleDiv.classList.add("title-name");
  titleDiv.textContent = title;
  // titleDiv.textContent = owner.length > 0 ? "My Notes" : "Shared Notes";
  mainContent.appendChild(titleDiv);

  if (owner.length > 0) {
    const noteBar = document.createElement("div");
    noteBar.classList.add("note");
    owner.forEach((n) => {
      noteBar.appendChild(createNote(n, "owner"));
    });
    mainContent.appendChild(noteBar);
  }

  if (editor.length > 0) {
    const sectionTitle = document.createElement("div");
    sectionTitle.classList.add("section_title-outside");
    const sectionTitleText = document.createElement("p");
    sectionTitleText.classList.add("section_title");
    sectionTitleText.textContent = "Editable Notes";
    mainContent.appendChild(sectionTitle);
    sectionTitle.appendChild(sectionTitleText);

    const noteBar = document.createElement("div");
    noteBar.classList.add("note");

    editor.forEach((n) => {
      noteBar.appendChild(createNote(n, "editor"));
    });
    mainContent.appendChild(noteBar);
  }

  if (viewer.length > 0) {
    const sectionTitle = document.createElement("div");
    sectionTitle.classList.add("section_title-outside");
    const sectionTitleText = document.createElement("p");
    sectionTitleText.classList.add("section_title");
    sectionTitleText.textContent = "ReadOnly Notes";
    mainContent.appendChild(sectionTitle);
    sectionTitle.appendChild(sectionTitleText);

    const noteBar = document.createElement("div");
    noteBar.classList.add("note");
    viewer.forEach((n) => {
      noteBar.appendChild(createNote(n, "viewer"));
    });
    mainContent.appendChild(noteBar);
  }
};

const showNoData = function (title) {
  const mainContent = document.querySelector(".mainContent");
  mainContent.innerHTML = "";

  const titleDiv = document.createElement("div");
  titleDiv.classList.add("title-name");
  titleDiv.textContent = title;
  mainContent.appendChild(titleDiv);

  const nodata = document.createElement("div");
  nodata.classList.add("nodata");
  nodata.innerText = "查無資料";
  mainContent.appendChild(nodata);
  return nodata;
};

const createSection = function (titleText) {
  const section = document.createElement("div");
  section.classList.add("section");

  const title = document.createElement("div");
  title.classList.add("section-title");
  title.textContent = titleText;

  section.appendChild(title);

  return section;
};

const createNote = function (data, role) {
  const div = document.createElement("div");
  div.classList.add("noteSon");

  div.dataset.noteId = data[0];
  div.dataset.role = role;

  const title = document.createElement("p");
  title.textContent = data[1];
  title.classList.add("noteTitle");

  const blankSon = document.createElement("div");
  blankSon.classList.add("blank__son");

  const btnBox = document.createElement("div");
  btnBox.classList.add("btnBox");

  if (role === "owner") {
    const shareBtn = document.createElement("span");
    shareBtn.classList.add("material-symbols-outlined");
    shareBtn.classList.add("noteBtn");
    shareBtn.textContent = "link";
    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openShareModal(data[0]);
    });

    const deleteBtn = document.createElement("span");
    deleteBtn.classList.add("material-symbols-outlined");
    deleteBtn.classList.add("delete_btn");
    deleteBtn.textContent = "delete";
    deleteBtn.addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete_btn")) {
        e.stopPropagation();
      }
      const note_id = data[0];
      const url = `/api/note/note_delete/${note_id}`;
      const request = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      const response = await request.json();
      console.log(response);

      if (response.note_id) {
        const removeTarget = document.querySelector(
          `[data-note-id="${response.note_id}"]`,
        );
        removeTarget?.remove();
      }
    });
    btnBox.appendChild(shareBtn);
    btnBox.appendChild(deleteBtn);
  } else if (role === "editor") {
    const edit_note = document.createElement("span");
    edit_note.classList.add("material-symbols-outlined");
    edit_note.textContent = "edit_note";
    const editable = document.createElement("span");
    editable.classList.add("pen_text");
    editable.textContent = "Editable";

    const owner = data[3];

    const showOwner = document.createElement("div");
    showOwner.classList.add("showOwner");
    const showOwnerContent = document.createElement("p");
    showOwnerContent.classList.add("showOwnerContent");
    showOwnerContent.textContent = `Owner: ${owner}`;
    blankSon.appendChild(showOwner);
    showOwner.appendChild(showOwnerContent);

    btnBox.appendChild(edit_note);
    btnBox.appendChild(editable);
  } else {
    const owner = data[3];
    const lock = document.createElement("span");
    lock.classList.add("material-symbols-outlined");
    lock.textContent = "lock";
    const readOnly = document.createElement("span");
    readOnly.classList.add("locker_text");
    readOnly.textContent = "ReadOnly";
    const showOwner = document.createElement("div");
    showOwner.classList.add("showOwner");
    const showOwnerContent = document.createElement("p");
    showOwnerContent.classList.add("showOwnerContent");
    showOwnerContent.textContent = `Owner: ${owner}`;
    blankSon.appendChild(showOwner);
    showOwner.appendChild(showOwnerContent);
    btnBox.appendChild(lock);
    btnBox.appendChild(readOnly);
  }

  div.appendChild(title);
  div.appendChild(blankSon);
  div.appendChild(btnBox);

  title.addEventListener("click", () => {
    window.location.href = `/note/${data[0]}`;
  });

  blankSon.addEventListener("click", () => {
    window.location.href = `/note/${data[0]}`;
  });

  return div;
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

  return response.data || [];
};

const firstRender = async function () {
  const role = "owner";
  const url = `/api/note/note_data_render/${role}`;
  const request = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const response = await request.json();
  console.log(response);
  if (response.data) {
    renderNotes({ owner: response.data }, "My Notes");
  } else {
    showNoData("My Notes");
    console.log("no data");
    return null;
  }
};
firstRender();

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
    console.log("no data");
  }
};

const getNoteShareAll = async function (user_id) {
  let editorNoteArr = [];
  let viewerNoteArr = [];
  const url = `/api/note/share_note_render/${user_id}`;
  const request = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const response = await request.json();
  console.log(response);

  if (response.data) {
    for (let i = 0; i < response.data.length; i++) {
      if (response.data[i][2] === "editor") {
        editorNoteArr.push(response.data[i]);
      } else {
        viewerNoteArr.push(response.data[i]);
      }
    }
    // console.log(editorNoteArr, viewerNoteArr);
    return { editor: editorNoteArr, viewer: viewerNoteArr };
  } else {
    console.log("no data");
    editorNoteArr.push(0);
    viewerNoteArr.push(0);
    return { editor: editorNoteArr, viewer: viewerNoteArr };
  }
};

// 功能按鈕
const mynote = document.getElementById("mynote");
mynote.addEventListener("click", async () => {
  const data = await getNoteDataSelf();
  if (data.length > 0) {
    renderNotes({ owner: data }, "My Notes");
  } else {
    showNoData("My Notes");
    console.log("no data");
  }
});

const sharednote = document.getElementById("sharednote");
sharednote.addEventListener("click", async () => {
  const user_id = sharednote.dataset.userId;

  const { editor, viewer } = await getNoteShareAll(user_id);

  if (editor[0] !== 0) {
    renderNotes({ editor }, "Shared Notes");
  }
  if (viewer[0] !== 0) {
    renderNotes({ viewer }, "Shared Notes");
  }
  if (editor[0] !== 0 && viewer[0] !== 0) {
    renderNotes({ editor, viewer }, "Shared Notes");
  }

  if (editor[0] === 0 && viewer[0] === 0) {
    showNoData("Shared Notes");
    console.log("no data");
  }
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
  titleName.textContent = "Read Only Notes";
  getNoteDataShare("viewer");
});

// 登出
const logout = document.getElementById("logout");
logout.addEventListener("click", async (e) => {
  e.stopPropagation();
  const url = "/api/sessions/";
  const request = await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });

  const response = await request.json();

  window.location.href = "/login&regist";
});

const getLastReadTime = function () {
  return localStorage.getItem("lastReadTime");
};

const markAsRead = function () {
  localStorage.setItem("lastReadTime", new Date().toISOString());
};

const fetchNotification = async function () {
  const url = "/api/note/get_notification";
  const request = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const response = await request.json();
  // console.log(response);
  return response.data || [];
};

const formateTime = function (timeStr) {
  const now = new Date();
  const time = new Date(timeStr);
  time.setHours(time.getHours() + 8);
  const diff = Math.floor((now - time) / 1000);

  if (diff < 60) return "剛剛";
  if (diff < 3600) return Math.floor(diff / 60) + " 分鐘前";
  if (diff < 86400) return Math.floor(diff / 3600) + " 小時前";

  return time.toLocaleDateString();
};

const renderNotification = function (data) {
  const container = document.getElementById("noti-list");
  const count = document.getElementById("noti-count");

  container.innerHTML = "";
  const unreadCount = data.filter((n) => {
    const lastRead = getLastReadTime();
    const notifTime = new Date(n.created_at);
    notifTime.setHours(notifTime.getHours() + 8);
    return !lastRead || notifTime > new Date(lastRead);
  }).length;
  if (unreadCount > 0) {
    count.classList.remove("hidden"); // 顯示紅點
    count.textContent = unreadCount; // 顯示數字
  } else {
    count.textContent = "";
    count.classList.add("hidden"); // 隱藏紅點
  }

  data.forEach((n, index) => {
    const item = document.createElement("div");
    item.classList.add("notification-item");

    if (index < 2) {
      item.classList.add("new");
    }

    item.innerHTML = `
      <div class="message">${n.message}</div>
      <div class="time">${formateTime(n.created_at)}</div>
    `;

    item.addEventListener("click", () => {
      markAsRead();
      initNotifications();
      window.location.href = `/note/${n.note_id}`;
    });

    container.appendChild(item);
  });
};

const initNotifications = async function () {
  const data = await fetchNotification();

  renderNotification(data);
};

initNotifications();

setInterval(() => {
  initNotifications();
}, 5000);
