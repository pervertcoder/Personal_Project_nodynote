"use strict";

// JWT驗證
const token = localStorage.getItem("JWTtoken");
let userName = document.querySelector(".username");
// const userId = window.location.pathname.slice(11);
const checkState = async function () {
  const url = "/api/auth/login";
  const request = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const response = await request.json();
  console.log(response);

  if (response.ok) {
    userName.textContent = response.member_data[0][1];
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
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const response = await request.json();
  console.log(response);

  window.location.href = `/note/${response.note_id}`;
});

// 拿筆記資料
const render = async function () {};

// 登出
const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
  localStorage.removeItem("JWTtoken");
  window.location.reload();
});
