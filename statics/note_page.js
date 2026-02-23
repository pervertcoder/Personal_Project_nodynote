"use strict";

// JWT驗證
const token = localStorage.getItem("JWTtoken");
const userId = window.location.pathname.slice(6);
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
    console.log("登入成功");
  } else {
    window.location.href = "/";
  }
};
checkState();
