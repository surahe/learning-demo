const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const canvasWidth = 1100
const canvasHeight = 1100
const cap = 50 // 单元格宽高
const colNum = Math.ceil(canvasWidth / cap) - 1 // 行数
const rowNum = Math.ceil(canvasHeight / cap) - 1 // 列数
const initX = 60  // 初始横坐标
const initY = 1050 // 初始纵坐标
const lineWidth = 4 // 坐标线宽度

const replay = document.getElementById('replay')
const pointInputs = document.getElementsByName('point[]')
const pointsCollection = document.getElementById('pointsCollection')
const addPoint = document.getElementById('addPoint')

let Grids = []           // 初始化网格
let cache = null         // canvas缓存
let t = 0                // 贝塞尔曲线方程变量 t∈(0, 1)
let n = 1                // 阶级
let points = getPoints()  // 固定点坐标数组
let initPoint = points[0] // 起点
let isEnded = false       // 第一次动画是否执行完毕

// 建立网格
function initGrid(cap, width, height, lineWidth) {
  const colNum = Math.ceil(width / cap) - 1
  const rowNum = Math.ceil(height / cap) - 1
  // 纵坐标轴数据
  // 注意从 i = 1 开始画
  for (let i = 1; i <= colNum; i++) {
    Grids.push([
      /**
       * 纵轴线
       * 
       * X坐标  初始点横坐标 + 单位长度 * (i -1) - 线宽 / 4
       * Y坐标  0
       * 宽度   线宽 / 2
       * 高度   单位长度 * 列数
       */
      [initX + cap * (i - 1) - lineWidth / 4, 0, lineWidth / 2, cap * colNum],
      /**
       * 纵轴文字
       * 
       * 文字      当前纵坐标值
       * X坐标     单位长度 * i - 线宽 / 4（与纵轴线X坐标相同）
       * Y坐标     i * 单位长度 + 5
       * 文字对齐  'top'
       * 文字基线  'center'
       */
      [cap * (i - 1), cap * i - lineWidth / 4, colNum * cap + 5, 'top', 'center']
    ])
  }
  // 横坐标轴数据
  for (let i = 1; i <= rowNum; i++) {
    Grids.push([
      /**
       * 横轴线
       * 
       * X坐标  初始横坐标
       * Y坐标  单位长度 * i - 线宽 / 4
       * 宽度   行数 * 单位长度
       * 高度   线宽 / 2
       */
      [initX, cap * i - lineWidth / 4, rowNum * cap, lineWidth / 2],
      /**
       * 横轴文字
       * 
       * 文字      当前横坐标值
       * X坐标     初始横坐标 - 5
       * Y坐标     单位长度 * i - 线宽 / 4（与横轴线Y坐标相同）
       * 文字对齐  'middle'
       * 文字基线  'right'
       */
      [cap * (rowNum - i), initX - 5, cap * i - lineWidth / 4, "middle", "right"]
    ])
  }
}

// 绘制网格
function createGrid() {
  ctx.save()
  ctx.fillStyle = '#999'
  ctx.font = '24px Arial'
  Grids.forEach(grid => {
    ctx.textBaseline = grid[1][3]
    ctx.textAlign = grid[1][4]
    ctx.fillRect(grid[0][0], grid[0][1], grid[0][2], grid[0][3])
    ctx.fillText(grid[1][0], grid[1][1], grid[1][2])
  })
  ctx.restore()
}


/**
 * 将 input 框中的值转化为本坐标系的数组并存放到pointInputs
 */
function getPoints() {
  return Array.from(pointInputs).map((p) => {
    p = p.value.split(",")
    return [parseInt(p[0]) + initX, initY - parseInt(p[1])]
  })
}

/**
 * 画线
 * @param {*} x0 起点横坐标
 * @param {*} y0 起点纵坐标
 * @param {*} x1 终点横坐标
 * @param {*} y1 终点纵坐标
 */
function drawLine(x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke()
  ctx.closePath();
}

/**
* 遍历 points，画出对应的点并用线连起来
* @param {Array} points 
*/
function drawCubicBezierCurzeHelper(points) {
  ctx.save()
  // 遍历 points 的坐标，画线
  points.reduce((p, c) => {
    ctx.strokeStyle = "gray"
    drawLine(...p, ...c)
    return c
  })
  // 遍历 points 的坐标，画红点
  points.forEach((c) => {
    ctx.beginPath()
    ctx.fillStyle = 'red';
    ctx.arc(...c, 20, 0, 2 * Math.PI);
    ctx.fill()
  })
  ctx.restore()
}

/**
 * 一阶贝塞尔曲线，返回终点坐标关于t的表示的函数
 * @param {Number} a 
 * @param {Number} b 
 * @param {Number} c 
 * @param {Number} d 
 */
function linearBezierCurze(a, b, c, d) {//(a,b),(c,d)
  let s1 = c - a, s2 = d - b
  return function (t) {
    return [
      s1 * t + a,
      s2 * t + b
    ]
  }
}

/**
 * 返回当前t的贝塞尔曲线坐标
 * @param {Array} ps 定点坐标数组
 */
function drawPoints(ps) {
  let newPs = []
  // 使用 reduce 计算每两个点之间的新的点
  ps.reduce((p, c) => {
    // 用一阶贝塞尔曲线方程，算出新的点关于 t 的坐标，再将 t 代入算出其坐标
    newPs.push(linearBezierCurze(...p, ...c)(t))
    return c
  })
  // 如果点的数量为1，返回此点，否则将点数组传入并递归
  if (newPs.length === 1) {
    return newPs[0]
  } else {
    return drawPoints(newPs)
  }
}

/**
 * 逐个画出贝塞尔曲线上的点
 */
function animation2() {
  if (t >= 1) {
    // 初始点动画执行完毕标志
    isEnded = true;
    return
  }

  // 获取当前 t 的点坐标
  let initPoint2 = drawPoints(points)
  ctx.strokeStyle = "blue"
  // 以初始点和当前点画线
  drawLine(...initPoint, ...initPoint2)
  // 将当前点设置为初始点
  initPoint = initPoint2

  // 应该是使用缓存优化性能
  cache = canvas.toDataURL("image/jpeg", 1);
  let img = new Image();
  img.src = cache
  img.onload = function () {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    // 递归执行
    window.requestAnimationFrame(() => {
      t += 0.1
      animation2()
    })
  }
}

addPoint.addEventListener("click", (e) => {
  n++
  let span = document.createElement("span")
  span.innerHTML = "point" + n + ":"
  let input = document.createElement("input")
  input.name = "point[]"
  let br = document.createElement("br")
  pointsCollection.appendChild(span)
  pointsCollection.appendChild(input)
  pointsCollection.appendChild(br)
})

replay.addEventListener("click", () => {
  // 起点、终点动画执行完毕
  if (isEnded) {
    t = 0
    points = getPoints()
    console.log(points)
    initPoint = points[0]
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    drawCubicBezierCurzeHelper(points)
    createGrid()
    animation2()
  }
})

// 初始化canvas大小、线宽、背景色
canvas.width = canvasWidth
canvas.height = canvasHeight
ctx.lineWidth = 10
ctx.fillStyle = "white"
ctx.fillRect(0, 0, canvas.width, canvas.height)

// 画网格、坐标
initGrid(cap, canvasWidth, canvasHeight, lineWidth)
drawCubicBezierCurzeHelper(points)
createGrid()
animation2()