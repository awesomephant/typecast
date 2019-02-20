let copy = '';
let copyEl;

const gri = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
const loadJSON = function (callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', './wordlist.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}


const isUpperCase = function (s) {
    if (s.toUpperCase() === s) {
        return true;
    } else {
        return false
    }
}
const init = function () {
    console.log('init')
    copyEl = document.querySelector('.copy')
}

const updateCopy = function (copy) {
    let copyEl = document.querySelector('.copy')
    copyEl.innerHTML = copy;
}

const isWordOnList = function (word) {
    for (let i = 0; i < wordList.length; i++) {
        if (word === wordList[i]) {
            return true
        }
    }
    return false;
}

const appendImage = function (word) {
    let imageEl = document.querySelector('.images')
    let li = document.createElement('li')
    // if the word is on the list, add an image
    // else, just add the word as plain text
    if (isWordOnList(word)) {
        let filename = './word-images/' + word + '.png'
        li.innerHTML = `<img src='${filename}' />`;
        li.classList.add('is-image')
    } else {
        li.classList.add('is-text')
        li.innerHTML = word
    }
    imageEl.appendChild(li);
}


window.addEventListener('keyup', function (e) {
    console.log(e.key)
    if (e.key === 'Backspace') {
        copy = copy.slice(0, -1)
    } else if (e.key === ' ') {
        appendImage(copy)
        copy = ''
    } else if (e.key.length === 1) {
        copy += e.key;
    }
    updateCopy(copy)
})

var wordList;

window.addEventListener('DOMContentLoaded', function () {
    init()
    loadJSON(function (response) {
        // Parse JSON string into object
        wordList = JSON.parse(response);
        console.log(wordList)
    });
})