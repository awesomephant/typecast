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
    fontFamily: 'Arial'
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
        brush.angle += 1;
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