"use strict";

const slider = document.getElementById("someslider");

slider.addEventListener("change", () => {
    console.log(slider.value);
})