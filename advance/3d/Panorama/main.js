const PIECES = 20
const PHOTO_WIDTH = 129

var container = document.getElementById('container')
var box = document.getElementById('box')
var arr = box.getElementsByTagName('div')
var radius = calculateRadius(PHOTO_WIDTH, PIECES)

class Panorama {
  constructor(pieces, photo_width) {
    this.pieces = pieces
    this.photo_width = photo_width
  }
  _touchStartHandler(event) {
    event.preventDefault()
    this.lastMouseX = A.pageX || A.touches[0].pageX
    this.lastMouseY = A.pageY || A.touches[0].pageY
    this.lastAngleX = this.aimAngleX
    this.lastAngleY = this.aimAngleY
    this.curMouseX = A.pageX || A.touches[0].pageX
    this.curMouseY = A.pageY || A.touches[0].pageY
    this.slastMouseX = A.pageX || A.touches[0].pageX
  }
  _touchMoveHandler (event) {
    this.curMouseX = event.pageX || event.touches[0].pageX
    this.curMouseY = event.pageY || event.touches[0].pageY
  }
}

var startX = 0,
	x = 0,
	endX = 0;
function init () {
  initElement()
  box.addEventListener('touchstart', function (event) {
    event.preventDefault()
    var touch = event.targetTouches[0];
    startX = touch.pageX - x;
  })
  box.addEventListener('touchmove', function(event) {
    event.preventDefault()
    var touch = event.targetTouches[0]
    endX = touch.pageX
    x = endX - startX
    
    box.style.transform = `rotateY(${x}deg)`;
  })
}

function calculateRadius(length, totalNum) {
  return Math.round(length / (2 * Math.tan(Math.PI / totalNum)))
}

function initElement() {
  var fragment = document.createDocumentFragment()
  for (let i = 0; i < PIECES; i++) {
    let div = document.createElement('div')
    div.style.background = `url(./images/${i+1}.png)`
    div.style.transform = `rotateY(${360 / PIECES * i}deg) translatez(${radius}px)`
    fragment.appendChild(div)
  }
  box.appendChild(fragment)
}

init()