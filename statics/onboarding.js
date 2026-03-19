"use strict";

const loginBtn = document.getElementById("submit_btn");
// const registBtn = document.getElementById("registBtn");

// registBtn.addEventListener("click", async () => {
//   const username = document.getElementById("name_regist").value.trim();
//   const email = document.getElementById("email_regist").value.trim();
//   const password = document.getElementById("password_regist").value.trim();

//   if (!username || !email || !password) {
//     alert("請輸入姓名、信箱、密碼");
//     return;
//   }

//   const payload = {
//     user_name: username,
//     email: email,
//     password: password,
//   };

//   const url = "/api/auth/regist";
//   const request = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(payload),
//   });

//   const response = await request.json();
//   console.log(response);
// });

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
