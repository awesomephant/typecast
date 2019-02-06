let copy = '';
let copyEl;

const counts = {
    image: 3,
    a: 1,
    b: 1,
    c: 1,
    d: 1,
    e: 1,
    f: 1,
    g: 1,
    h: 1,
    i: 1,
    j: 1,
    l: 1,
    m: 1,
    n: 1,
    o: 1,
    p: 1,
    q: 1,
    r: 1,
    s: 1,
    t: 1,
    u: 1,
    v: 1,
    w: 1,
    x: 1,
    y: 1,
    z: 1,
    _a: 1,
    _b: 1,
    _c: 1,
    _d: 1,
    _e: 1,
    _f: 1,
    _g: 1,
    _h: 1,
    _i: 1,
    _j: 1,
    _l: 1,
    _m: 1,
    _n: 1,
    _o: 1,
    _p: 1,
    _q: 1,
    _r: 1,
    _s: 1,
    _t: 1,
    _u: 1,
    _v: 1,
    _w: 1,
    _x: 1,
    _y: 1,
    _z: 1,
}

const gri = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const init = function () {
    console.log('init')
    copyEl = document.querySelector('.copy')
}

const isUpperCase = function(s){
    if (s.toUpperCase() === s){
        return true;
    } else {
        return false
    }
}

const updateCopy = function (copy) {
    let html = '';
    let letters = copy.split('');

    for (let i = 0; i < letters.length; i++) {
        let letter = letters[i];
        let el;
        if (letter != ' ' && letter != '.' && letter != ':' && letter != '-' && letter != ',') {
            let filename = ''
            if (isUpperCase(letter)){
                filename = '/assets/edit/_' + letter + '-0.png'
            } else {
                filename = '/assets/edit/' + letter + '-0.png'
            }
            el = `<span class='letter'><img class='letter-image' src='${filename}'/></span>`
        } else if (letter === '.' || letter === ',' || letter === ':' || letter === ';' || letter === '-' || letter === ',') {
            let index = gri(0, counts.image)
            let filename = '/assets/' + 'image' + '-' + index + '.png'
            el = `<span class='letter'><img class='dot-image' src='${filename}'/></span>`
        } else {
            el = `<span class='letter space'></span>`

        }
        html += el
    }
    copyEl.innerHTML = html;
}

window.addEventListener('keyup', function (e) {
    console.log(e.key)
    if (e.key === 'Backspace') {
        copy = copy.slice(0, -1)
    } else if (e.key.length === 1) {
        copy += e.key;
    }
    updateCopy(copy)
})

window.addEventListener('DOMContentLoaded', function () {
    init()
})