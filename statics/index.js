"use strict";

const token = localStorage.getItem("JWTtoken");
const checkState = async function () {
  const url = "/api/auth/login";
  const request = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const response = await request.json();
  console.log(response);
};

checkState();
