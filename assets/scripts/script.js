"use strict";
import { data } from "../data/data.js" // replace with json request later

function startup() {
    activeData = sort(data, sortConfig.sort.orderBy);
    createTemplate(activeData);
    setMinMax(activeData);
    setupSlider();
    fillSlider();
    setupCalendar(data);
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
    // Curr values used to filter
    sortConfig.slider.crMin = sliderMin.value;
    sortConfig.slider.crMax = sliderMax.value;
}

function setupCalendar(data) {
    let minDate = new Date(data[0].image.date);
    let maxDate = new Date(data[0].image.date);
    for (let i = 1; i < data.length; i++) {
        let currDate = new Date(data[i].image.date);
        if (currDate.getTime() < minDate.getTime()) {
            minDate = currDate;
        } else if (currDate.getTime() > maxDate.getTime()) {
            maxDate = currDate;
        }
    }

    let min = minDate.toLocaleDateString().replace(/\//g, "-").split("-").reverse().join("-");
    let max = maxDate.toLocaleDateString().replace(/\//g, "-").split("-").reverse().join("-");
    sortConfig.calendar.dateMin = min;
    sortConfig.calendar.dateMax = max;

    calendarStart.min = min;
    calendarStart.max = max;
    calendarEnd.min = min;
    calendarEnd.max = max;
}

// Filters the data 
function filter(data) {
    let temp = [];

    // Use for loop to optimise performance
    for (let i = 0; i < data.length; i++) {
        if (data[i].image.price >= sortConfig.slider.crMin && data[i].image.price <= sortConfig.slider.crMax) {
            temp.push(data[i]);
        }
    }

    if (sortConfig.filter.query.length > 0) {
        let regex = new RegExp(sortConfig.filter.query, 'gi'); // Global && case insensitive flag
        temp = temp.filter(item => {
            return item.image[sortConfig.filter.searchBy].match(regex);
        })
    }

    if (sortConfig.calendar.crMin && sortConfig.calendar.crMax) {
        let dateMin = new Date(sortConfig.calendar.crMin);
        let dateMax = new Date(sortConfig.calendar.crMax);
        for (let i = 0; i < temp.length; i++) {
            temp = temp.filter(item => {
                let date = new Date(item.image.date);
                return (dateMin.getTime() < date.getTime() && date.getTime() < dateMax.getTime());
            })
        }
    }

    return temp;
}

// Sets min-max for slider
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
    sliderTrack.style.background = `linear-gradient(to right, #ffffff ${from}% , ${sliderBackgroundColor} ${from}% , ${sliderBackgroundColor} ${to}%, #ffffff ${to}%)`;
}

function ascendingOrder(val1, val2) {
    return val1 < val2;
}

function descendingOrder(val1, val2) {
    return val1 > val2;
}

function updateData() {
    // Temp solution to only update when list size changes, could cause issues
    let len = activeData.length;
    activeData = filter(data);
    if (len !== activeData.length && activeData) {
        createTemplate(activeData);
    }
    // Check if length is 0 if so return error msg
}

function sort(data, comparison) {
    // Best case O(n) worst case O(n^2)
    let newData = [...data];
    let sortBy = sortConfig.sort.sortBy;
    let temp;
    let swapped = false;
    for (let i = 0; i < newData.length; i++) {
        for (let j = 0; j < newData.length - i -1; j++) {
            if (comparison(newData[j].image[sortBy], newData[j+1].image[sortBy])) {
                temp = newData[j+1];
                newData[j+1] = newData[j];
                newData[j] = temp;
                swapped = true;
            }
        }
        if (!swapped) {
            return newData;
        } 
        swapped = false;
    }
    return newData;
}


function createTemplate(data) {
        let fragment = new DocumentFragment();
        fragment.innerHTML = "";
        data.map(item => {
            if (item.image.url) {
                let date = new Date(item.image.date);
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
                            <div class="item--information-data">
                                <p>Created</p>
                                <p>${date.toDateString()}</p>
                            </div>
                        </div>
                    </div>`)
            }
        })
        gallery.innerHTML = fragment.innerHTML;
}


// Used to keep track of how the current images should be filtered/ordered
let activeData = [...data]; // This is the modified data (filters, sorting, etc)

const gallery = document.querySelector(".gallery");
const sortConfig = {
    "sort" : {
        "orderBy" : descendingOrder,
        "sortBy" : "price",
    },
    
    "filter" : {
        "requires" : [],
        "query" : "",
        "searchBy" : "author"
    },

    "slider" : {
        "min" : 0,
        "max" : 0,
        "crMin" : 0,
        "crMax" : 0,
    },

    "calendar" : {
        "dateMin" : "",
        "dateMax" : "",
        "crMin" : "",
        "crMax" : "",
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

// Searchbar
const searchBar = document.querySelector(".search");

// Calendar
const calendarStart = document.querySelector(".panel__calendar-start");
const calendarEnd = document.querySelector(".panel__calendar-end");

// Slider event handler
sliderMin.addEventListener("input", (e) => {
    if (sliderMax.value - sliderMin.value <= sliderStep) {
        sliderMin.value = parseInt(sliderMax.value) - sliderStep;
    } 
    fillSlider();
    valueMin.textContent = e.target.value;
    
})

sliderMin.addEventListener("change", () => {
    sortConfig.slider.crMin = sliderMin.value;
    updateData();
})

sliderMax.addEventListener("input", (e) => {
    if (sliderMax.value - sliderMin.value <= sliderStep) {
        sliderMax.value = parseInt(sliderMin.value) + sliderStep;
    } 
    fillSlider();
    valueMax.textContent = e.target.value; 
})

sliderMax.addEventListener("change", () => {
    sortConfig.slider.crMax = sliderMax.value;
    updateData();
})


// Searchbar 
searchBar.addEventListener("input", (e) => {
    sortConfig.filter.query = e.target.value;
    updateData();
})


// Calendar
calendarStart.addEventListener("change", (e) => {
    if (e.target.value) {
        let date = new Date(e.target.value)
        sortConfig.calendar.crMin = date.toLocaleDateString().replace(/\//g, "-").split("-").reverse().join("-");
    } else {
        sortConfig.calendar.crMin = e.target.value;
    }
    updateData();
})

calendarEnd.addEventListener("change", (e) => {
    if (e.target.value) {
        let date = new Date(e.target.value)
        sortConfig.calendar.crMax = date.toLocaleDateString().replace(/\//g, "-").split("-").reverse().join("-");
    } else {
        sortConfig.calendar.crMax = e.target.value;
    }
    updateData();
})

startup(); // Script is async will run once dom content is loaded