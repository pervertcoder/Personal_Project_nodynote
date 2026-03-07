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
    // console.log("登入成功");
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

let lines2 = [];
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
    lines2 = data.content;
    // const filterLines = lines2.filter((line2) => line2.trim() !== "");
    render(lines2);
    note.value = data.content.map((line) => line.text).join("\n");
    previousLines = note.value.split("\n");
    lineVersions = data.content.map((line) => line.version);
  } else if (data.type === "updated_line") {
    const { lineIndex, newText, version } = data.content;

    const block = document.querySelector(`.block[data-index='${lineIndex}']`);
    if (!block) return;
    const currentText = block.innerText;

    if (currentText !== newText) {
      block.innerText = newText;
    }
    block.dataset.version = version;

    // 只更新該行
    const lines = note.value.split("\n");
    lines[lineIndex] = newText;
    note.value = lines.join("\n");

    // 更新本地版本號，避免下一次發生衝突
    previousLines[lineIndex] = newText;
    lineVersions[lineIndex] = version;
    // console.log(lineVersions);
  } else if (data.type === "insert_line") {
    const { lineIndex, text, version } = data.content;

    const editor = document.getElementById("editor");

    const div = document.createElement("div");
    div.className = "block";
    div.contentEditable = true;
    div.innerText = text;
    div.dataset.index = lineIndex;
    div.dataset.version = version;

    const ref = editor.querySelector(`.block[data-index='${lineIndex}']`);

    if (ref) {
      editor.insertBefore(div, ref);
    } else {
      editor.appendChild(div);
    }

    const block = editor.querySelectorAll(".block");
    block.forEach((b, i) => (b.dataset.index = i));

    // newBlock.focus();
  } else if (data.type === "delete_line") {
    const { lineIndex } = data.content;

    const block = document.querySelector(`.block[data-index='${lineIndex}']`);
    if (block) block.remove();

    const editor = document.getElementById("editor");
    const blocks = editor.querySelectorAll(".block");
    blocks.forEach((b, i) => (b.dataset.index = i));
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

const render = function (lines) {
  let debouceTimer;
  const editor = document.getElementById("editor");
  editor.innerHTML = "";

  lines.forEach((line, index) => {
    const div = document.createElement("div");
    div.className = "block";
    div.contentEditable = true;
    div.innerText = line.text;
    div.dataset.index = index;
    div.dataset.version = line.version;

    editor.appendChild(div);
  });
};

editor.addEventListener("input", (e) => {
  const block = e.target;
  const index = parseInt(block.dataset.index);

  if (block.debouceTimer) clearTimeout(block.debouceTimer);

  block.debouceTimer = setTimeout(() => {
    const text = block.innerText;
    const version = parseInt(block.dataset.version);
    // console.log(version);
    ws.send(
      JSON.stringify({
        type: "updated_line",
        content: {
          lineIndex: index,
          newText: text,
          version: version,
        },
      }),
    );
  }, 300);
});

editor.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const block = e.target.closest(".block");
    if (!block) return;
    const index = parseInt(block.dataset.index);
    const text = block.innerText;

    const cursorPos = window.getSelection().getRangeAt(0).startOffset;
    const before = text.slice(0, cursorPos);
    const after = text.slice(cursorPos);
    const afterText = after.trim() === "" ? "" : after;

    block.innerText = before;

    const newBlock = document.createElement("div");
    newBlock.className = "block";
    newBlock.contentEditable = true;
    newBlock.innerText = after;
    newBlock.dataset.index = index + 1;
    newBlock.dataset.version = 0;

    block.after(newBlock);
    newBlock.focus();

    const blocks = editor.querySelectorAll(".block");
    blocks.forEach((b, i) => (b.dataset.index = i));

    ws.send(
      JSON.stringify({
        type: "updated_line",
        content: {
          lineIndex: index,
          newText: before,
          version: parseInt(block.dataset.version),
        },
      }),
    );

    ws.send(
      JSON.stringify({
        type: "insert_line",
        content: {
          lineIndex: index + 1,
          text: afterText,
        },
      }),
    );
  }
});

editor.addEventListener("keydown", (e) => {
  if (e.key === "Backspace") {
    const block = e.target.closest(".block");
    if (!block) return;
    const index = parseInt(block.dataset.index);
    const selection = window.getSelection();
    const cursorPos = selection.getRangeAt(0).startOffset;

    if (cursorPos === 0 && index > 0) {
      e.preventDefault();
      const prev = editor.querySelector(`.block[data-index='${index - 1}']`);
      const newText = prev.innerText + block.innerText;
      prev.innerText = newText;
      prev.focus();

      const range = document.createRange();
      range.selectNodeContents(prev);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);

      block.remove();

      const blocks = editor.querySelectorAll(".block");
      blocks.forEach((b, i) => (b.dataset.index = i));

      ws.send(
        JSON.stringify({
          type: "delete_line",
          content: {
            lineIndex: index,
          },
        }),
      );
    }
  }
});
