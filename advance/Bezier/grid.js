const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const canvasWidth = 1050
const canvasHeight = 1050
const cap = 50 // 单元格宽高
const colNum = Math.ceil(canvasWidth / cap) - 1 // 行数
const rowNum = Math.ceil(canvasHeight / cap) - 1 // 列数
const initX = 50  // 初始横坐标
const initY = 1050 // 初始纵坐标
const lineWidth = 4 // 坐标线宽度

let Grids = []

canvas.width = canvasWidth
canvas.height = canvasHeight
ctx.lineWidth = 4
ctx.fillStyle = "white"
ctx.fillRect(0, 0, canvas.width, canvas.height)

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
       * X坐标  单位长度 * i - 线宽 / 4
       * Y坐标  0
       * 宽度   线宽 / 2
       * 高度   单位长度 * 列数
       */
      [cap * i - lineWidth / 4, 0, lineWidth / 2, cap * colNum],
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

initGrid(cap, canvasWidth, canvasHeight, lineWidth)
createGrid()