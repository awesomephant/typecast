let copy = '';
let copyEl;
var loadedFonts = [];

const gri = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
const loadJSON = function (callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', './googleFonts.json', true); // Replace 'my_data' with the path to your file
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

const isLoaded = function (family) {
    for (let i = 0; i < loadedFonts.length; i++) {
        if (family === loadedFonts[i].family) {
            return true;
        }
    }
    return false;
}

const addFontFace = function (font) {
    let family = font.family.replace(' ', '+')
    let url = `https://fonts.googleapis.com/css?family=${family}`;

    let linkEl = document.createElement('link')
    linkEl.setAttribute('href', url);
    linkEl.setAttribute('rel', 'stylesheet');

    document.head.appendChild(linkEl)
}

const pickFont = function () {
    let font = allFonts.items[gri(0, allFonts.items.length - 1)];
    return font;
}

let count = 0;

const addCopy = function (letter) {
    let copyEl = document.querySelector('.copy')
    let spanEl = document.createElement('span')
    count++;
    spanEl.innerHTML = letter;
    if (letter != ' ') {

        let font = pickFont();
        if (!isLoaded(font.family)) {
            // if we need to load the typeface
            addFontFace(font)
            loadedFonts.push(font.family)
        }
        spanEl.style.fontFamily = font.family;
        
        if (enableOffset){
            let offsetX = count * 4;
            let offsetY = count * 3;
            copyEl.style.transform = `translateY(${-offsetY}px) translateX(${-offsetX}px)`;
            spanEl.style.transform = `translateY(${offsetY}px) translateX(${offsetX}px)`;
        }
    }
    copyEl.appendChild(spanEl);
}

const isWordOnList = function (word) {
    for (let i = 0; i < wordList.length; i++) {
        if (word === wordList[i]) {
            return true
        }
    }
    return false;
}

window.addEventListener('keyup', function (e) {
    console.log(e.key)
    if (e.key === 'Backspace') {
    } else if (e.key === ' ') {
        addCopy(' ')
    } else if (e.key.length === 1) {
        addCopy(e.key);
    }
})

var allFonts;

window.addEventListener('DOMContentLoaded', function () {
    init()
    loadJSON(function (response) {
        // Parse JSON string into object
        allFonts = JSON.parse(response);
        console.log(allFonts)
    });
})