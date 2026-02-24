"use strict";

// JWT驗證
let note_name = document.getElementById("note_name");
let note = document.getElementById("note");
const token = localStorage.getItem("JWTtoken");
const id = window.location.pathname.slice(6);
const checkState = async function () {
  const url = `/api/note/note_render/${id}`;
  const request = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const response = await request.json();
  console.log(response);

  if (response.note) {
    note_name.value = response.note[0][0];
    note.value = response.note[0][1];
    console.log("登入成功");
  } else {
    window.location.href = "/dashboard";
  }
};
checkState();

// 到dashboard
const nody = document.querySelector(".nody");
nody.addEventListener("click", () => {
  window.location.href = "/dashboard";
});

// 儲存
const save = document.getElementById("save");

save.addEventListener("click", async () => {
  let note_name = document.getElementById("note_name").value.trim();
  let note_content = document.getElementById("note").value.trim();
  const payload = {
    name: note_name,
    content: note_content,
  };
  const url = `/api/note/note_update/${id}`;
  const request = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const response = await request.json();
  console.log(response);
});
