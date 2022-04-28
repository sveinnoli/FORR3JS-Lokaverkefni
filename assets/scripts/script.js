"use strict";
import { data } from "../data/data.js" // replace with json request later


let testList = [1,5,2,3,10,550,9,1,2,5,1,2,91];
for (let i = 0; i < testList.length; i++) {
    for (let j = 0; j < testList.length - i; j++) {
        if (testList[j] > testList[j+1]) {
            testList[j] += testList[j+1];
            testList[j+1] = testList[j] - testList[j+1];
            testList[j]  -= testList[j+1];
        }
    }
}
console.log(testList);

const sortConfig = {
    "sort" : "descending",
    "sortBy" : "price",

}

const gallery = document.querySelector(".gallery");

function startup() {
    createTemplate(data);
}

function sort(data) {
    // Best case O(n) worst case O(n^2)
    let tmp;
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data.length - i -1; j++) {
            if (data[j].image.price > data[j+1].image.price) {
                tmp = data[j+1];
                data[j+1] = data[j];
                data[j] = tmp;
            }
        }
    }
}
console.log(sort(data));
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
