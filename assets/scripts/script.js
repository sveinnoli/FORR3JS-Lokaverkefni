"use strict";
const slider = document.getElementById("someslider");
const output = document.querySelector("output");

slider.addEventListener("input", (e) => {
    output.innerText = e.target.value;
})