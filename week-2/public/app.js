console.log('hi')

var copy = '';

const appendImage = function (data) {
    let imageEl = document.querySelector('.images')
    let li = document.createElement('li')
    li.innerHTML = `<img src='${data.thumbnailUrl}' />`;
  //  li.innerHTML = `<img src='${data.contentUrl}' />`;

    imageEl.appendChild(li);
}

const updateCopy = function (copy) {
    let copyEl = document.querySelector('.copy')
    copyEl.innerHTML = copy;
}

const init = function () {
    window.addEventListener('keyup', function (e) {
        console.log(e.key)
        if (e.key === 'Backspace') {
            copy = copy.slice(0, -1)
        } else if (e.key === ' ') {
            socket.emit('word', copy, (data) => { })
            copy = ''
        } else if (e.key.length === 1) {
            copy += e.key;
        }
        updateCopy(copy)
    })
}

socket.on('image', function(data){
    console.log(data)
    appendImage(data)
})

window.addEventListener('DOMContentLoaded', function () {
    init()
})