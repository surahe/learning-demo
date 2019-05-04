
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

ctx.lineWidth = 2;
ctx.strokeStyle = '#000';

var percent = 0;

/**
 * 绘制一条曲线路径
 * @param  {Object} ctx canvas渲染上下文
 * @param  {Array<number>} start 起点
 * @param  {Array<number>} end 终点
 * @param  {number} curveness 曲度(0-1)
 * @param  {number} percent 绘制百分比(0-100)
 */
function drawCurvePath1(ctx, start, end, curveness, percent) {
  // 计算中间控制点
  var cp = [
    (start[0] + end[0]) / 2 - (start[1] - end[1]) * curveness,
    (start[1] + end[1]) / 2 - (end[0] - start[0]) * curveness
  ];

  ctx.moveTo(start[0], start[1]);
  // 
  for (var t = 0; t <= percent / 100; t += 0.01) {
    var x = quadraticBezier(start[0], cp[0], end[0], t); // 获取横坐标
    var y = quadraticBezier(start[1], cp[1], end[1], t); // 获取纵坐标
    ctx.lineTo(x, y);
  }
}

/**
 * 绘制一条曲线路径
 * @param  {Object} ctx canvas渲染上下文
 * @param  {Array<number>} start 起点
 * @param  {Array<number>} end 终点
 * @param  {number} curveness 曲度(0-1)
 * @param  {number} percent 绘制百分比(0-100)
 */
function drawCurvePath(ctx, start, end, curveness, percent) {

  var cp = [
    (start[0] + end[0]) / 2 - (start[1] - end[1]) * curveness,
    (start[1] + end[1]) / 2 - (end[0] - start[0]) * curveness
  ];

  var t = percent / 100;

  var p0 = start;
  var p1 = cp;
  var p2 = end;

  var v01 = [p1[0] - p0[0], p1[1] - p0[1]];     // 向量<p0, p1>
  var v12 = [p2[0] - p1[0], p2[1] - p1[1]];     // 向量<p1, p2>

  var q0 = [p0[0] + v01[0] * t, p0[1] + v01[1] * t];
  var q1 = [p1[0] + v12[0] * t, p1[1] + v12[1] * t];

  var v = [q1[0] - q0[0], q1[1] - q0[1]];       // 向量<q0, q1>

  var b = [q0[0] + v[0] * t, q0[1] + v[1] * t];

  ctx.moveTo(p0[0], p0[1]);

  ctx.quadraticCurveTo(
    q0[0], q0[1],
    b[0], b[1]
  );

}

/**
 * 二次贝赛尔曲线方程
 * @param {*} p0 
 * @param {*} p1 
 * @param {*} p2 
 * @param {*} t 
 */
function quadraticBezier(p0, p1, p2, t) {
  var k = 1 - t;
  return k * k * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
}

function animate() {
  ctx.clearRect(0, 0, 800, 800);
  ctx.beginPath();

  drawCurvePath(
    ctx,
    [100, 100],
    [200, 300],
    0.9,
    percent
  );

  ctx.stroke();

  percent = (percent + 1) % 100;

  requestAnimationFrame(animate);
}

animate();