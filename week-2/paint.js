let ticking = false;
let mouseDown = false;
let c;

let brush = {
    size: 100,
    lineWidth: 1.5,
    color: 'rgb(250, 252, 251)',
    stroke: 'rgb(5, 2, 1)',
    angle: -45,
    text: 'Good Times',
    fontFamily: 'Arial',
    rotate: false
}

function updateBrush() {
    c.fillStyle = brush.color;
    c.strokeStyle = brush.stroke;
    c.lineWidth = brush.lineWidth
    c.font = `${brush.size}px ${brush.fontFamily}`
}

function rad(deg) {
    return (Math.PI / 180) * deg;
}

function init() {
    c = document.querySelector('#world').getContext('2d')
    c.canvas.width = window.innerWidth;
    c.canvas.height = window.innerHeight;
}

function handleMouseMove(pos) {
    if (mouseDown) {
        c.save()
        updateBrush();
        if (brush.rotate === 'true') {
            brush.angle += 1;
        }
        let x = pos.x - (brush.size / 10);
        let y = pos.y - (brush.size / 2);
        c.translate(x, y)
        c.rotate(rad(brush.angle))
        c.strokeText(brush.text, 0, 0)
        c.fillText(brush.text, 0, 0)
        c.restore()
    }
}

function bindEvents() {
    let textEl = document.querySelector('#brush-text')
    let fillEl = document.querySelector('#brush-fill')
    let strokeEl = document.querySelector('#brush-stroke')
    let sizeEl = document.querySelector('#brush-size')
    let angleEl = document.querySelector('#brush-angle')
    let rotateEl = document.querySelectorAll('#brush-rotate input')
    let dropDownEl = document.querySelectorAll('#brush-rotate input')

    textEl.addEventListener('change', function (e) {
        brush.text = e.srcElement.value;
    })
    fillEl.addEventListener('change', function (e) {
        brush.color = e.srcElement.value;
    })
    strokeEl.addEventListener('change', function (e) {
        brush.stroke = e.srcElement.value;
    })
    sizeEl.addEventListener('change', function (e) {
        brush.size = e.srcElement.value;
    })
    angleEl.addEventListener('change', function (e) {
        brush.angle = e.srcElement.value;
    })
    if (dropDownEl) {
        let summaryEl = document.querySelector('#pickTypeface summary')
        let detailsEl = document.querySelector('#pickTypeface details')
        dropDownItems = document.querySelectorAll('#pickTypeface .dropdown-item')

        for (let i = 0; i < dropDownItems.length; i++) {
            let li = dropDownItems[i];
            li.addEventListener('click', function (e) {
                for (let i = 0; i < dropDownItems.length; i++) {
                    dropDownItems[i].classList.remove('active')
                }
                summaryEl.innerHTML = e.srcElement.innerText;
                brush.fontFamily = e.srcElement.innerText;
                detailsEl.removeAttribute('open')
            })
        }
    }
    console.log(rotateEl)
    for (let i = 0; i < rotateEl.length; i++) {
        console.log(rotateEl)
        rotateEl[i].addEventListener('click', function (e) {
            brush.rotate = e.srcElement.value;
        })

    }
    c.canvas.addEventListener('mousedown', function (e) {
        mouseDown = true;
    });
    c.canvas.addEventListener('mouseup', function (e) {
        mouseDown = false;
    });
    window.addEventListener('mousemove', function (e) {
        last_known_mouse_position = { x: e.clientX, y: e.clientY };

        if (!ticking) {
            window.requestAnimationFrame(function () {
                handleMouseMove(last_known_mouse_position);
                ticking = false;
            });
            ticking = true;
        }
    });

    var draggableElems = document.querySelectorAll('.window');
    // array of Draggabillies
    var draggies = []
    // init Draggabillies
    for (var i = 0; i < draggableElems.length; i++) {
        var draggableElem = draggableElems[i];
        var draggie = new Draggabilly(draggableElem, {
            handle: '.window-header'
        });
        draggies.push(draggie);
    }

}
window.addEventListener('DOMContentLoaded', function () {
    init();
    document.body.style.background = brush.color;
    updateBrush();
    bindEvents();
})