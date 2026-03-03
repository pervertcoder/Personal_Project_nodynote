"use strict";

// JWT驗證
let note_name = document.getElementById("note_name");
let note = document.getElementById("note");
const token = localStorage.getItem("JWTtoken");
const id = window.location.pathname.slice(6);
const checkState = async function () {
  const url = `/api/note/note_content_render/${id}`;
  const request = await fetch(url, {
    method: "GET",
    credentials: "include",
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
const saveFile = async function () {
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });

  const response = await request.json();
  console.log(response);
};

// save.addEventListener("click", saveFile);

// websocket連線

const ws = new WebSocket(`ws://52.72.19.213:8000/ws/note/${id}`);
ws.onopen = () => {
  console.log("websocket已連線");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "init") {
    note_name.value = data.name;
    note.value = data.content;
  } else if (data.type === "name") {
    note_name.value = data.value;
  } else if (data.type === "content") {
    note.value = data.value;
  }
};

ws.onclose = (event) => {
  console.log("close code:", event.code);
};

let nameTimeout;
note_name.addEventListener("input", () => {
  clearTimeout(nameTimeout);
  nameTimeout = setTimeout(() => {
    ws.send(
      JSON.stringify({
        type: "name",
        value: note_name.value,
      }),
    );
  }, 200);
});

let contentTimeout;
note.addEventListener("input", () => {
  clearTimeout(contentTimeout);
  contentTimeout = setTimeout(() => {
    ws.send(
      JSON.stringify({
        type: "content",
        value: note.value,
      }),
    );
  }, 200);
});
