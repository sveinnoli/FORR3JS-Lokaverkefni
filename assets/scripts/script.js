"use strict";
import { data } from "../data/data.js" // replace with json request later

// Used to keep track of how the current images should be filtered/ordered
const sortConfig = {
    "sort" : {
        "orderBy" : descendingOrder,
        "sortBy" : "price",
    },
    
    "filter" : {
        // Here we keep the price range and such
    }
}

const gallery = document.querySelector(".gallery");

function startup() {
    sort(data, sortConfig.sort.orderBy);
    createTemplate(data);
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
    let tmp;
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data.length - i -1; j++) {
            if (comparison(data[j].image[sortBy], data[j+1].image[sortBy])) {
                tmp = data[j+1];
                data[j+1] = data[j];
                data[j] = tmp;
            }
        }
    }
}

function createTemplate(data) {
        let fragment = new DocumentFragment();
        fragment.innerHTML = "";
        data.map(item => {
            if (item.image.url) {
                fragment.innerHTML += (
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
                                <p>${item.image.price}</p>
                            </div>
                        </div>
                    </div>`)
            }
        })
        gallery.innerHTML = fragment.innerHTML;
}

startup(); // Script is async will run once dom content is loaded
