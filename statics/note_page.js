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
    const contentArray = JSON.parse(response.note[0][1]);
    const lines = contentArray.map((line) => line.text);
    note.value = lines.join("\n");
    console.log("登入成功");
  } else {
    window.location.href = "/dashboard";
  }
};
checkState();

// 到dashboard
const nody = document.querySelector(".nody");
nody.addEventListener("click", () => {
  // setTimeout(() => {
  //   window.location.href = "/dashboard";
  // }, 500);
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

let previousLines = [];
let lineVersions = [];
// websocket連線
const websocketLink = window.location.hostname;
const ws = new WebSocket(`ws://${websocketLink}:8000/ws/note/${id}`);
ws.onopen = () => {
  console.log("websocket已連線");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // console.log(data);

  if (data.type === "name") {
    note_name.value = data.name;
  } else if (data.type === "content") {
    note.value = data.content.map((line) => line.text).join("\n");
    previousLines = note.value.split("\n");
    lineVersions = data.content.map((line) => line.version);
  } else if (data.type === "updated_line") {
    const { lineIndex, newText, version } = data.content;

    // 只更新該行
    const lines = note.value.split("\n");
    lines[lineIndex] = newText;
    note.value = lines.join("\n");

    // 更新本地版本號，避免下一次發生衝突
    previousLines[lineIndex] = newText;
    lineVersions[lineIndex] = version;
    console.log(lineVersions);
  }

  if (data.type === "conflict") {
    alert(`第${data.content.lineIndex + 1}行衝突，請手動合併`);
    return;
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
        content: {
          newName: note_name.value,
        },
      }),
    );
  }, 200);
});

const diffLogic = function () {
  const currentLines = note.value.split("\n");
  while (lineVersions.length < currentLines.length) {
    lineVersions.push(0);
    previousLines.push("");
  }

  currentLines.forEach((line, index) => {
    if (line !== previousLines[index]) {
      ws.send(
        JSON.stringify({
          type: "updated_line",
          content: {
            lineIndex: index,
            newText: line,
            version: lineVersions[index],
          },
        }),
      );
    }
    previousLines[index] = line;
  });
};

let contentTimeout;
note.addEventListener("input", () => {
  clearTimeout(contentTimeout);
  contentTimeout = setTimeout(diffLogic, 200);
});
