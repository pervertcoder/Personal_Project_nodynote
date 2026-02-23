"use strict";

// JWT驗證
const token = localStorage.getItem("JWTtoken");
let userName = document.querySelector(".username");
const userId = window.location.pathname.slice(11);
const checkState = async function () {
  const url = `/api/auth/login/${userId}`;
  const request = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const response = await request.json();
  console.log(response);

  if (response.ok) {
    userName.textContent = response.user_name;
    console.log("登入成功");
  } else {
    window.location.href = "/";
  }
};
checkState();

// 新建筆記
const newNote = document.getElementById("newnote");
newNote.addEventListener("click", () => {
  window.location.href = `/note/${userId}`;
});

// 登出
const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
  localStorage.removeItem("JWTtoken");
  window.location.reload();
});
