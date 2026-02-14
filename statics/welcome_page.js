"use strict";

const loginBtn = document.getElementById("loginBtn");
const registBtn = document.getElementById("registBtn");

registBtn.addEventListener("click", async () => {
  const username = document.getElementById("name_regist").value;
  const email = document.getElementById("email_regist").value;
  const password = document.getElementById("password_regist").value;

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
});
