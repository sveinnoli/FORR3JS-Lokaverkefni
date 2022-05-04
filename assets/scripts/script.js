"use strict";

// Config file for sorting the images
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
    },

    "paginator" : {
        "itemsPerPage" : 6,
        "currentPage" : 1,
    }
}

// Local request to json file
let data;
await fetch("./assets/data/data.json").then(result => {
    return result.json()
}).then(result => {
    data = result;
}).catch(err => {
    console.log("Image assets not found: ", err)
})

function startup() {
    data = sort(data, sortConfig.sort.orderBy);
    activeData = [...data];
    setMinMax(activeData);
    setupSlider();
    fillSlider();
    setupCalendar(data);
    createTemplate(activeData);
    paginatorTemplate();
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
    let min = minDate.toISOString().split("T")[0];
    let max = maxDate.toISOString().split("T")[0];
    sortConfig.calendar.dateMin = min;
    sortConfig.calendar.dateMax = max;

    calendarStart.min = min;
    calendarStart.max = max;
    calendarEnd.min = min;
    calendarEnd.max = max;
}

function updatePaginator(pageNr) {
    let images = document.querySelectorAll(".item");
    if (paginatorButtons.length > 0) {
        paginatorButtons[sortConfig.paginator.currentPage-1].classList.remove("paginator__active-item")
        paginatorButtons[pageNr-1].classList.add("paginator__active-item")
    }

    // Show new images
    let startShow = (pageNr-1)*sortConfig.paginator.itemsPerPage;
    let endShow = startShow + sortConfig.paginator.itemsPerPage;
    if (endShow > images.length) {
        endShow = images.length;
    }

    for (let i = startShow; i < endShow; i++) {
        images[i].hidden = false;
    }

    // Hide previous images
    if (pageNr !== sortConfig.paginator.currentPage) {
        let startHide = (sortConfig.paginator.currentPage-1)*sortConfig.paginator.itemsPerPage;
        let endHide = startHide + sortConfig.paginator.itemsPerPage;
        if (endHide > images.length) {
            endHide = images.length;
        }
        
        for (let i = startHide; i < endHide; i++) {
            images[i].hidden = true;
        }
    }
    sortConfig.paginator.currentPage = pageNr; 
}

function paginatorTemplate() {
    let numPages = Math.ceil(activeData.length/sortConfig.paginator.itemsPerPage);
    let fragment = new DocumentFragment();
    fragment.innerHTML = "";
    if (activeData.length > sortConfig.paginator.itemsPerPage) {
        for (let i = 0; i < numPages; i++) {
            fragment.innerHTML += `
                <div class="paginator__item">
                    <button class="paginator__item-button">${i+1}</button>
                </div>
            `;
        }
    }
    paginator.innerHTML = fragment.innerHTML;
    paginatorButtons = document.querySelectorAll(".paginator__item");
    updatePaginator(sortConfig.paginator.currentPage);
}



function updateData() {
    // Temp solution to only update when list size changes, could cause issues
    let len = activeData.length;
    activeData = filter(data);
    if (len !== activeData.length && activeData) {
        createTemplate(activeData);
        paginatorTemplate();
    }
    // Check if length is 0 if so return error msg
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

    // Filter by calendar dates
    if (sortConfig.calendar.crMin && sortConfig.calendar.crMax) {
        let dateMin = new Date(sortConfig.calendar.crMin);
        let dateMax = new Date(sortConfig.calendar.crMax);
        for (let i = 0; i < temp.length; i++) {
            temp = temp.filter(item => {                
                let date = new Date(item.image.date);
                return (dateMin.getTime() <= date.getTime() && date.getTime() <= dateMax.getTime());
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
                `<div class="item" hidden>
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
        updatePaginator(1);
}


// Used to keep track of how the current images should be filtered/ordered
let activeData = [...data]; // This is the modified data (filters, sorting, etc)

// Images
const gallery = document.querySelector(".gallery");

// Paginator
const paginator = document.querySelector(".paginator");
let paginatorButtons = document.querySelectorAll(".paginator__item");

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
        sortConfig.calendar.crMin = date.toISOString().split("T")[0];
    } else {
        sortConfig.calendar.crMin = "";
    }
    updateData();
})

calendarEnd.addEventListener("change", (e) => {
    if (e.target.value) {
        let date = new Date(e.target.value)
        sortConfig.calendar.crMax = date.toISOString().split("T")[0];
    } else {
        sortConfig.calendar.crMax = "";
    }
    updateData();
})

// Paginator
paginator.addEventListener("click", (e) => {
    if (e.target.classList.contains("paginator__item-button")) {
        // Button clicked
        updatePaginator(parseInt(e.target.textContent));
        window.scrollTo(0, 0)
    }
})


startup(); // Script is async will run once dom content is loaded