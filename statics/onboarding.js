"use strict";

const loginBtn = document.getElementById("submit_btn");
const registBtn = document.getElementById("regist_btn");
const errorLogin = document.querySelector(".error-login");
const errorMessageLogin = document.querySelector(".error-message-login");
const errorRegist = document.querySelector(".error-regist");
const errorMessageRegist = document.querySelector(".error-message-regist");

registBtn.addEventListener("click", async () => {
  const username = document.getElementById("name_regist").value.trim();
  const email = document.getElementById("email_regist").value.trim();
  const password = document.getElementById("password_regist").value.trim();

  if (!username || !email || !password) {
    alert("請輸入姓名、信箱、密碼");
    return;
  }

  const payload = {
    user_name: username,
    email: email,
    password: password,
  };

  const url = "/api/auth/regist";
  const request = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const response = await request.json();
  console.log(response);

  if (response.error) {
    errorRegist.classList.remove("error--off");
    errorMessageRegist.textContent = "X:" + response.message;
    errorMessageRegist.style.color = "red";
  }

  if (response.ok) {
    errorRegist.classList.remove("error--off");
    errorMessageRegist.textContent = "O:Registed Done";
    errorMessageRegist.style.color = "green";
  }
});

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email_login").value.trim();
  const password = document.getElementById("password_login").value.trim();
  if (!email || !password) {
    alert("請輸入信箱、密碼");
    return;
  }
  const payload = {
    email: email,
    password: password,
  };

  const url = "/api/auth/authen";
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

  if (response.ok) {
    // localStorage.setItem("JWTtoken", response.token);
    window.location.href = "/overview";
  } else {
    errorLogin.classList.remove("error--off");
    errorMessageLogin.textContent = "X:帳號密碼錯誤";
    console.log("帳號密碼錯誤");
  }
});

const testSuffix = "@test.com";
const accounts = {
  tester1: { email: `test1${testSuffix}`, password: "123" },
  tester2: { email: `test2${testSuffix}`, password: "456" },
  ply: { email: "ply@ply.com", password: "ply" },
};

const select = document.getElementById("role");
select.addEventListener("change", () => {
  const role = select.value;

  if (role === "choose") {
    document.getElementById("email_login").value = "";
    document.getElementById("password_login").value = "";
  } else if (accounts[role]) {
    document.getElementById("email_login").value = accounts[role].email;
    document.getElementById("password_login").value = accounts[role].password;
  }
});

const body = document.querySelector("body");
const toRegist = document.querySelector(".toRegistWord");
const toLogin = document.querySelector(".toLoginWord");
const loginContent = document.querySelector(".content__login");
const registContent = document.querySelector(".content__regist");
const left = document.querySelector(".left");
const right = document.querySelector(".right");
const switchBtn = document.querySelector(".switch");
toRegist.addEventListener("click", () => {
  loginContent.classList.add("content__login--off");
  registContent.classList.remove("content__regist--off");
});
toLogin.addEventListener("click", () => {
  registContent.classList.add("content__regist--off");
  loginContent.classList.remove("content__login--off");
});

let aColor = "#f6c49f";
let bColor = "#00c8b3";

const changeColorByClass = function () {
  if (registContent.classList.contains("content__regist--off")) {
    console.log("test1");
    body.style.backgroundColor = aColor;
    left.style.backgroundColor = bColor;
    loginContent.classList.add("content__login--off");
    registContent.classList.remove("content__regist--off");
  } else {
    console.log("test2");
    body.style.backgroundColor = bColor;
    right.style.backgroundColor = aColor;
    registContent.classList.add("content__regist--off");
    loginContent.classList.remove("content__login--off");
  }
};

// switchBtn.addEventListener("click", () => {
//   registContent.classList.toggle("content__regist--off");
//   changeColorByClass();
// });

// const registBtn = document.getElementById("regist_btn");
