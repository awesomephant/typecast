let copy = '';
let copyEl;
const source = 'gutenberg'

class Source {
    constructor(id, bookTitle, year, author) {
        this.id = id
        this.bookTitle = bookTitle
        this.year = year
        this.author = author
        this.wordList = null
    }
}

const sources = []
let activeSource = 1;

const gri = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
const loadJSON = function (source, callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', './wordlist-' + source.id + '.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText, source);
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

const hasDescender = function (word) {
    if (word.match(/[Qqypgj]/g) != null) {
        return true
    }
    return false
}
const hasAscender = function (word) {
    if (word.match(/[dfhklbABCDEFGHIJKLMNOPQRSTUVXYZ]/g) != null) {
        return true
    }
    return false
}
const hasSmallAscender = function (word) {
    if (word.match(/[it]/g) != null) {
        return true
    }
    return false
}

const init = function () {
    console.log('init')
    copyEl = document.querySelector('.copy')
}

const updateCopy = function (copy) {
    let copyEl = document.querySelector('.copy')
    copyEl.innerHTML = copy;
}

const isWordOnList = function (word, ignoreCase) {
    let wordList = sources[activeSource].wordList;
    for (let i = 0; i < wordList.length; i++) {
        if (ignoreCase === true) {
            if (word.toLowerCase() === wordList[i].text.toString().toLowerCase()) {
                return wordList[i]
            }
        } else {
            if (word === wordList[i].text) {
                return wordList[i]
            }
        }
    }
    return false;
}

const findClosestWord = function (word) {
    let wordList = sources[activeSource].wordList;
    let dmin = 99999;
    let closest;
    for (let i = 0; i < wordList.length; i++) {
        let l = new Levenshtein(word, wordList[i].text.toString())
        if (l.distance < dmin) {
            dmin = l.distance
            closest = wordList[i]
        }
    }
    return closest
}


const appendImage = function (word) {
    let imageEl = document.querySelector('.images')
    let copyEl = document.querySelector('.copy')
    let li = document.createElement('li')
    // if the word is on the list, add an image
    // else, just add the word as plain text
    console.log(sources)
    console.log(activeSource)
    let source = sources[activeSource].id;
    if (isWordOnList(word, false)) {
        let w = isWordOnList(word, false)
        let instance = gri(0, w.count - 1)
        let filename = './word-images/' + source + '/' + w.text + '-' + instance + '.png'
        li.innerHTML = `<img src='${filename}' />`;
        li.classList.add('is-image')
        li.setAttribute('data-word', word)
    } else if (isWordOnList(word, true)) {
        console.log("Couldn't find exact match, ignoring case.")
        let w = isWordOnList(word, true)
        let instance = gri(0, w.count - 1)
        let filename = './word-images/' + source + '/' + w.text + '-' + instance + '.png'
        li.innerHTML = `<img src='${filename}' />`;
        li.classList.add('is-image')
        li.setAttribute('data-word', word)

    } else { // find the closest word
        console.log("Couldn't find case-insensitive match, finding closest word.")
        let closeWord = findClosestWord(word);
        let instance = gri(0, closeWord.count - 1)
        let filename = './word-images/' + source + '/' + closeWord.text + '-' + instance + '.png'
        li.innerHTML = `<img src='${filename}' />`;
        li.classList.add('is-image')
        li.setAttribute('data-word', closeWord.text)

        //li.classList.add('is-text')
        //li.innerHTML = word
    }
    let finalWord = li.getAttribute('data-word')
    if (hasDescender(finalWord)) {
        li.classList.add('has-descender')
    }
    if (hasAscender(finalWord)) {
        li.classList.add('has-ascender')
    }
    if (hasSmallAscender(finalWord)) {
        li.classList.add('has-smallAscender')
    }
    copyEl.insertAdjacentElement('beforebegin', li);
}


window.addEventListener('keyup', function (e) {
    //console.log(e.key)
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

    sources.push(new Source('gutenberg', 'The 36-Line Bible', 1495, 'Johannes Gutenberg'))
    sources.push(new Source('gutenberg-2', 'The 36-Line Bible', 1495, 'Johannes Gutenberg'))
    sources.push(new Source('benjamin', 'The work of art in the age of mechanical reproduction', 1935, 'Walter Benjamin'))
    sources.push(new Source('darwin', 'On the Origin of Species', 1859, 'Charles Darwin'))

    let dropDownEl = document.querySelector('.dropdown')
    let dropDownItems;


    for (let i = 0; i < sources.length; i++) {
        let s = sources[i];
        s.index = i;
        loadJSON(s, function (response, s) {
            // Parse JSON string into object
            s.wordList = JSON.parse(response);
            //console.log(wordList)
        });
        if (dropDownEl) {

            let li = document.createElement('li')
            li.classList.add('dropdown-item')
            li.setAttribute('data-index', i)
            li.innerHTML = `<em>${s.bookTitle}</em> (${s.year}) by ${s.author}`
            li.addEventListener('click', function () {
                for (let i = 0; i < dropDownItems.length; i++) {
                    dropDownItems[i].classList.remove('active')
                }

                activeSource = parseInt(this.getAttribute('data-index'))
                this.classList.add('active')
                console.log('Active Source: ' + activeSource)
            })
            dropDownEl.appendChild(li)
            dropDownItems = document.querySelectorAll('.dropdown-item')
        }
    }
})