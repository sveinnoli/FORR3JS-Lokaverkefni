"use strict";
import { data } from "../data/data.js" // replace with json request later

// Used to keep track of how the current images should be filtered/ordered
const gallery = document.querySelector(".gallery");
const sortConfig = {
    "sort" : {
        "orderBy" : descendingOrder,
        "sortBy" : "price",
    },
    
    "filter" : {
        // Here we keep the price range and such
    },

    "slider" : {
        "min" : 0,
        "max" : 0,
    }
}

// Slider 
const valueMin = document.querySelector(".value-min");
const valueMax = document.querySelector(".value-max");
const sliderMin = document.querySelector(".slider-min");
const sliderMax = document.querySelector(".slider-max");
const sliderTrack = document.querySelector(".range__slider-track");
const sliderBackgroundColor = window.getComputedStyle(document.documentElement).getPropertyValue('--purple-color-1');
let sliderStep;




function startup() {
    sort(data, sortConfig.sort.orderBy);
    createTemplate(data);
    setMinMax(data);
    setupSlider();
    fillSlider();
}

function setupSlider() {
    valueMin.textContent = sortConfig.slider.min;
    valueMax.textContent = sortConfig.slider.max;
    sliderMin.min = sortConfig.slider.min;
    sliderMin.max = sortConfig.slider.max;
    sliderMin.value = sortConfig.slider.min;
    
    
    sliderMax.min = sortConfig.slider.min;
    sliderMax.max = sortConfig.slider.max;
    sliderMax.value = sortConfig.slider.max;
    
    // Set step on min & max
    sliderStep = (parseInt(sliderMax.value) - parseInt(sliderMin.value))*0.025;
    sliderMin.step = sliderStep;
    sliderMax.step = sliderStep;
}


function setMinMax(data) {
    let min = data[0].image.price;
    let max = data[0].image.price;
    for (let i = 1; i < data.length; i++) {
        if (data[i].image.price < min) {
            min = data[i].image.price;
        }
        
        if (data[i].image.price > max) {
            max = data[i].image.price;
        }
    }
    sortConfig.slider.min = min;
    sortConfig.slider.max = max;
}

function fillSlider() {
    let from = ((sliderMin.value-sortConfig.slider.min)/(sortConfig.slider.max-sortConfig.slider.min))*100;
    let to = ((sliderMax.value-sortConfig.slider.min)/(sortConfig.slider.max-sortConfig.slider.min))*100;
    console.log(from)
    sliderTrack.style.background = `linear-gradient(to right, #ffffff ${from}% , ${sliderBackgroundColor} ${from}% , ${sliderBackgroundColor} ${to}%, #ffffff ${to}%)`;
}

function ascendingOrder(val1, val2) {
    return val1 < val2;
}

function descendingOrder(val1, val2) {
    return val1 > val2;
}

function sort(data, comparison) {
    // Best case O(n) worst case O(n^2)
    let sortBy = sortConfig.sort.sortBy;
    let temp;
    let swapped = false;
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data.length - i -1; j++) {
            if (comparison(data[j].image[sortBy], data[j+1].image[sortBy])) {
                temp = data[j+1];
                data[j+1] = data[j];
                data[j] = temp;
                swapped = true;
            }
        }
        if (!swapped) {
            return;
        } 
        swapped = false;
    }
}

function createTemplate(data) {
        let fragment = new DocumentFragment();
        fragment.innerHTML = "";
        data.map(item => {
            if (item.image.url) {
                fragment.innerHTML += ( // Replace with dom methods later
                `<div class="item">
                        <div class="item--title">${item.image.name}</div>
                        <div class="item--image-container"><img src="${item.image.url}" class="item--image"></div>
                        <div class="item--information">
                            <div class="item--information-data">
                                <p>Author</p>
                                <p>${item.image.author[0].toUpperCase()+item.image.author.slice(1)}</p>
                            </div>
                            <div class="item--information-data">
                                <p>Price</p>
                                <p>€${item.image.price}</p>
                            </div>
                        </div>
                    </div>`)
            }
        })
        gallery.innerHTML = fragment.innerHTML;
}

startup(); // Script is async will run once dom content is loaded

// Slider event handler
sliderMin.addEventListener("input", (e) => {
    if (sliderMax.value - sliderMin.value <= sliderStep) {
        sliderMin.value = parseInt(sliderMax.value) - sliderStep;
    } 
    fillSlider();
    valueMin.textContent = e.target.value;
    
})

sliderMax.addEventListener("input", (e) => {
    if (sliderMax.value - sliderMin.value <= sliderStep) {
        sliderMax.value = parseInt(sliderMin.value) + sliderStep;
    } 
    fillSlider();
    valueMax.textContent = e.target.value;
    
})