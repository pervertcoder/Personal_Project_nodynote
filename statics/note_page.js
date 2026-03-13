"use strict";

// JWT驗證
const title = document.getElementById("title");
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
    title.innerText = response.note[0][0];
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
const nodynote = document.querySelector(".nodynote");
nodynote.addEventListener("click", () => {
  window.location.href = "/dashboard";
});

// 名稱
const titleInput = document.getElementById("title__input");
title.addEventListener("click", () => {
  titleInput.value = title.innerText;

  title.classList.add("title__state--off");
  titleInput.classList.remove("title__state--off");

  titleInput.focus();
  titleInput.select();
});
const saveTitle = function () {
  const nweTitle = titleInput.value.trim();

  if (nweTitle === "") {
    titleInput.value = title.innerText;
  }

  if (nweTitle !== "") {
    title.innerText = nweTitle;
  }

  title.classList.remove("title__state--off");
  titleInput.classList.add("title__state--off");
};

titleInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    titleInput.blur();
  }
});

titleInput.addEventListener("blur", saveTitle);
titleInput.addEventListener("click", saveTitle);

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
let myUserId = null;
const userLines = {};
let activeUsers = [];
// 行數設定
const refreshLineNumber = function () {
  const blocks = document.querySelectorAll(".block");
  const lineNumbers = document.getElementById("line__numbers");

  lineNumbers.innerHTML = "";

  blocks.forEach((block, i) => {
    block.dataset.index = i;

    const div = document.createElement("div");
    div.className = "line-number";
    div.classList.add("active");
    div.dataset.index = i;
    div.innerText = i + 1;
    lineNumbers.appendChild(div);
  });
};

// 鎖定游標位置
const sendCursor = function () {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  let node = selection.focusNode;
  if (!node) return;

  if (node.nodeType === node.TEXT_NODE) {
    node = node.parentElement;
  }
  const block = node.classList.contains("block")
    ? node
    : node.closest(".block");
  if (!block) return;

  if (!block.firstChild) {
    const textNode = document.createTextNode("");
    block.appendChild(textNode);
    node = textNode;
  }
  const lineIndex = parseInt(block.dataset.index);
  ws.send(
    JSON.stringify({
      type: "cursor_move",
      content: {
        lineIndex: lineIndex,
      },
    }),
  );
};

// 鎖定高亮hover
const highlightCurrentLine = function () {
  document.querySelectorAll(".line-number").forEach((el) => {
    el.classList.remove("active");
  });
  Object.values(userLines).forEach(({ lineIndex }) => {
    const number = document.querySelector(
      `.line-number[data-index='${lineIndex}']`,
    );
    if (number) number.classList.add("active");
  });
};

const updateUserStatus = function () {
  const panel = document.getElementById("user-status-panel");
  panel.innerHTML = "";

  Object.values(userLines).forEach(({ lineIndex, color, initial }) => {
    const ball = document.createElement("div");
    ball.className = "user-ball";
    ball.style.backgroundColor = color;
    ball.innerText = `${initial}`;

    const block = document.querySelector(`.block[data-index='${lineIndex}']`);
    if (block) {
      ball.style.position = "absolute";
      ball.style.top = block.offsetTop + "px";
      ball.style.right = "5px";
      panel.appendChild(ball);
    }
  });
};

// websocket連線
// let previousLines = [];
// let lineVersions = [];

let lines2 = [];
const websocketLink = window.location.hostname;
const ws = new WebSocket(`ws://${websocketLink}:8000/ws/note/${id}`);
ws.onopen = () => {
  console.log("websocket已連線");
};
const selfInsertIndex = new Set();
const selfDeleteIndex = new Set();
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // console.log(data);

  if (data.type === "name") {
    // note_name.value = data.name;
    title.innerText = data.content.newName;
  } else if (data.type === "content") {
    activeUsers = data.activeUsers;
    console.log(activeUsers);
    lines2 = data.content;
    render(lines2);
    refreshLineNumber();
  } else if (data.type === "user_join") {
    activeUsers.push(data.user_id);
    console.log("使用者加入:", data.user_id);
  } else if (data.type === "user_leave") {
    activeUsers = activeUsers.filter((id) => id !== data.user_id);
    delete userLines[data.user_id];
    console.log("使用者離開:", data.user_id);

    highlightCurrentLine();
    updateUserStatus();
  } else if (data.type === "cursor_move") {
    const user_id = data.content.user_id;
    const lineIndex = data.content.lineIndex;
    const color = data.content.color;
    const initial = data.content.init;

    userLines[user_id] = { lineIndex, color, initial };

    highlightCurrentLine();
    updateUserStatus();
  } else if (data.type === "ack") {
    const index = data.content.lineIndex;
    const version = data.content.version;

    const block = editor.querySelector(`.block[data-index='${index}']`);

    if (block) {
      block.dataset.version = version;
    }
  }
  // else if (data.type === "ack_paste") {
  //   const startIndex = data.content.startIndex;
  //   const lines = data.content.lines;

  //   let currentIndex = startIndex;

  //   lines.forEach((lineText) => {
  //     let block = editor.querySelector(`.block[data-index='${currentIndex}']`);
  //     if (!block) {
  //       block = document.createElement("div");
  //       block.className = "block";
  //       block.contentEditable = true;
  //       block.dataset.index = currentIndex;
  //       block.dataset.version = 0;
  //       block.innerText = lineText;

  //       const prevBlock = editor.querySelector(
  //         `.block[data-index='${currentIndex - 1}']`,
  //       );
  //       if (prevBlock) {
  //         prevBlock.after(block);
  //       } else {
  //         editor.prepend(block);
  //       }
  //     } else {
  //       block.innerText = lineText;
  //     }

  //     currentIndex += 1;
  //   });

  //   const blocks = editor.querySelectorAll(".block");
  //   blocks.forEach((b, i) => (b.dataset.index = i));
  //   refreshLineNumber();
  // }
  else if (data.type === "updated_line") {
    const { lineIndex, newText, version } = data.content;

    let block = document.querySelector(`.block[data-index='${lineIndex}']`);
    if (!block) {
      const editor = document.getElementById("editor");

      block = document.createElement("div");
      block.className = "block";
      block.contentEditable = true;
      block.dataset.index = lineIndex;
      block.dataset.version = version;

      editor.appendChild(block);
    }
    const currentText = block.innerText;

    if (currentText !== newText) {
      block.innerText = newText;
      // block.innerText = `${lineIndex + 1}. ${newText}`;
    }
    block.dataset.version = version;
  } else if (data.type === "insert_line") {
    const { lineIndex, text, version } = data.content;
    if (selfInsertIndex.has(lineIndex)) {
      selfInsertIndex.delete(lineIndex);
      return;
    }
    const editor = document.getElementById("editor");

    const div = document.createElement("div");
    div.className = "block";
    div.contentEditable = true;
    div.innerText = text;
    div.dataset.index = lineIndex;
    div.dataset.version = version;

    const blocks = editor.querySelectorAll(".block");

    if (lineIndex >= blocks.length) {
      editor.appendChild(div);
    } else {
      editor.insertBefore(div, blocks[lineIndex]);
    }

    const allBlocks = editor.querySelectorAll(".block");
    allBlocks.forEach((b, i) => (b.dataset.index = i));
    refreshLineNumber();
  } else if (data.type === "delete_line") {
    const { lineIndex } = data.content;
    const block = editor.querySelector(`.block[data-index='${lineIndex}']`);
    if (block) {
      block.remove();

      const blocks = editor.querySelectorAll(".block");
      blocks.forEach((b, i) => {
        b.dataset.index = i;
      });
      refreshLineNumber();
    } else {
      console.warn("刪除行找不到");
    }
  } else if (data.type === "paste_lines") {
    const startIndex = data.content.startIndex;
    const lines = data.content.lines;

    let currentIndex = startIndex;

    lines.forEach((lineText) => {
      if (selfInsertIndex.has(currentIndex)) {
        selfInsertIndex.delete(currentIndex);
        currentIndex += 1;
        return;
      }

      let block = editor.querySelector(`.block[data-index='${currentIndex}']`);

      if (!block) {
        // 如果該行不存在，新增一個 block
        block = document.createElement("div");
        block.className = "block";
        block.contentEditable = true;
        block.dataset.index = currentIndex;
        block.dataset.version = 0;
        block.innerText = lineText;

        // 插入到 editor 中
        const prevBlock = editor.querySelector(
          `.block[data-index='${currentIndex - 1}']`,
        );
        if (prevBlock) {
          prevBlock.after(block);
        } else {
          editor.prepend(block);
        }
      } else {
        block.innerText = lineText;
      }

      currentIndex += 1;
    });

    const blocks = editor.querySelectorAll(".block");
    blocks.forEach((b, i) => (b.dataset.index = i));

    refreshLineNumber();
  }

  if (data.type === "conflict") {
    // alert(`第${data.content.lineIndex + 1}行衝突`);
    const { lineIndex, serverText, serverVersion } = data.content;
    const block = document.querySelector(`.block[data-index='${lineIndex}']`);
    if (!block) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const cursorOffset = range.startOffset;

    block.innerText = serverText;
    block.dataset.version = serverVersion;

    const newRange = document.createRange();
    const node = block.firstChild || block;

    const pos = Math.min(cursorOffset, node.textContent.length);

    newRange.setStart(node, pos);
    newRange.collapse(true);

    selection.removeAllRanges();
    selection.addRange(newRange);
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

titleInput.addEventListener("input", () => {
  clearTimeout(nameTimeout);
  nameTimeout = setTimeout(() => {
    if (titleInput.value.trim() === "") {
      ws.send(
        JSON.stringify({
          type: "name",
          content: {
            newName: title.innerText,
          },
        }),
      );
    } else {
      ws.send(
        JSON.stringify({
          type: "name",
          content: {
            newName: titleInput.value,
          },
        }),
      );
    }
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
  const editor = document.getElementById("editor");
  editor.innerHTML = "";

  lines.forEach((line, index) => {
    const div = document.createElement("div");
    div.className = "block";
    div.contentEditable = true;
    div.innerText = line.text;
    // div.innerText = `${index + 1}. ${line.text}`;
    div.dataset.index = index;
    div.dataset.version = line.version;

    editor.appendChild(div);
  });
};

const refreshLineNum = function () {
  const blocks = document.querySelectorAll(".block");
  blocks.forEach((b, i) => {
    const text = b.innerText.replace(/^\d+\.\s/, "");
    b.innerText = `${i + 1}. ${text}`;
    b.dataset.index = i;
  });
};

const splitLine = function (block) {
  const index = parseInt(block.dataset.index);
  const text = block.innerText;

  const selection = window.getSelection();
  const cursorPos = selection.getRangeAt(0).startOffset;

  const before = text.slice(0, cursorPos);
  const after = text.slice(cursorPos);
  const afterText = after.trim() === "" ? "" : after;

  block.innerText = before;

  const newBlock = document.createElement("div");
  newBlock.className = "block";
  newBlock.contentEditable = true;
  newBlock.innerText = afterText || " ";
  newBlock.dataset.index = index + 1;
  newBlock.dataset.version = 0;

  block.after(newBlock);
  newBlock.focus();

  const range = document.createRange();
  range.setStart(newBlock.firstChild || newBlock, 0);
  range.collapse(true);

  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  const blocks = editor.querySelectorAll(".block");
  blocks.forEach((b, i) => (b.dataset.index = i));
  refreshLineNumber();

  return {
    before,
    afterText,
    index,
  };
};

const debouceTimers = {};
const MAX_CHARS_PER_LINE = 50;
editor.addEventListener("input", (e) => {
  const block = e.target.closest(".block");
  if (!block) return;
  // const index = parseInt(block.dataset.index);
  // const text = block.innerText;

  let currentBlock = block;
  while (currentBlock.innerText.length >= MAX_CHARS_PER_LINE) {
    const { before, afterText, index } = splitLine(currentBlock);
    currentBlock = currentBlock.nextElementSibling;

    ws.send(
      JSON.stringify({
        type: "updated_line",
        content: {
          lineIndex: parseInt(currentBlock.dataset.index),
          newText: before,
          version: parseInt(currentBlock.dataset.version),
        },
      }),
    );

    ws.send(
      JSON.stringify({
        type: "insert_line",
        content: {
          lineIndex: parseInt(currentBlock.dataset.index) + 1,
          text: afterText,
        },
      }),
    );
  }

  const index = parseInt(currentBlock.dataset.index);
  clearTimeout(debouceTimers[index]);

  debouceTimers[index] = setTimeout(() => {
    const text = block.innerText;
    const version = parseInt(block.dataset.version);
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

  sendCursor();
  highlightCurrentLine();
});

editor.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const block = e.target.closest(".block");
    if (!block) return;

    const { before, afterText, index } = splitLine(block);

    sendCursor();
    highlightCurrentLine();

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
    selfInsertIndex.add(index + 1);
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

      const next = editor.querySelector(`.block[data-index='${index + 1}']`);
      block.remove();

      const blocks = editor.querySelectorAll(".block");
      blocks.forEach((b, i) => (b.dataset.index = i));
      selfDeleteIndex.add(index);
      ws.send(
        JSON.stringify({
          type: "delete_line",
          content: {
            lineIndex: index,
          },
        }),
      );

      if (next) {
        next.focus();
        const range = document.createRange();
        range.setStart(next.firstChild || next, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else if (index > 0) {
        const prev = editor.querySelector(`.block[data-index='${index - 1}']`);
        prev.focus();
        const range = document.createRange();
        range.setStart(prev.firstChild || prev, prev.innerText.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      sendCursor();
      highlightCurrentLine();
      refreshLineNumber();
    }
  }
});

editor.addEventListener("keyup", sendCursor);
editor.addEventListener("click", sendCursor);

editor.addEventListener("paste", (e) => {
  e.preventDefault();

  const block = e.target.closest(".block");
  if (!block) return;

  const pasteText = e.clipboardData.getData("text");
  const index = parseInt(block.dataset.index);
  const selection = window.getSelection();
  const cursorPos = selection.getRangeAt(0).startOffset;

  // 將貼上的文字拆成多行
  let allLines = [];
  pasteText.split(/\r?\n/).forEach((line) => {
    while (line.length > MAX_CHARS_PER_LINE) {
      allLines.push(line.slice(0, MAX_CHARS_PER_LINE));
      line = line.slice(MAX_CHARS_PER_LINE);
    }
    allLines.push(line);
  });

  // 替換原本 block 文字，並依序生成後續 block
  let currentBlock = block;
  const firstLine = allLines.shift();
  const before = currentBlock.innerText.slice(0, cursorPos);
  const after = currentBlock.innerText.slice(cursorPos);
  currentBlock.innerText = before + firstLine;

  let newBlocks = [];
  allLines.forEach((lineText) => {
    const newBlock = document.createElement("div");
    newBlock.className = "block";
    newBlock.contentEditable = true;
    newBlock.innerText = lineText;
    newBlock.dataset.version = 0;

    newBlocks.push(newBlock);
    currentBlock.after(newBlock);
    currentBlock = newBlock;
  });

  // 更新所有行 index
  const blocks = editor.querySelectorAll(".block");
  blocks.forEach((b, i) => (b.dataset.index = i));
  refreshLineNumber();

  // 發送一次 websocket 批次更新
  const wsLines = [before + firstLine, ...allLines];
  // console.log(wsLines);
  ws.send(
    JSON.stringify({
      type: "paste_lines",
      content: {
        startIndex: index,
        lines: wsLines,
      },
    }),
  );

  for (let i = 0; i < wsLines.length; i++) {
    selfInsertIndex.add(index + 1);
  }
  // 調整光標到最後貼上的位置
  const range = document.createRange();
  range.setStart(
    currentBlock.firstChild || currentBlock,
    currentBlock.innerText.length,
  );
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);

  sendCursor();
  highlightCurrentLine();

  window.location.reload();
});
