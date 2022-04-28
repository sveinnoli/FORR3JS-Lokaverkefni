"use strict";
const endpoint = "https://api.github.com/gists/ef06e5e0bb9efb83cb388d7260f840fb"
let data;

fetch(endpoint).then(results => {
    return results.json();
}).then(response => {
    data = response;
    console.log(data);
    console.log(JSON.parse(response))
}).catch(err => {
    console.log(err);
})



const slider = document.getElementById("someslider");


// document.appendChild(document.createTextNode(data))
slider.addEventListener("change", () => {
    console.log(slider.value);
})