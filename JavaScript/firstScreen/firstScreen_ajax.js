import html2canvas from 'html2canvas'

function firstScreen() {
  var winWidth = document.documentElement.clientWidth,
    winHeight = document.documentElement.clientHeight,
    nineDots = findScreenDot(),
    preData = 0,
    funStartTime, timer, runTime;
  printScreen();

  //找首屏上的九个点
  function findScreenDot() {
    var sw = Math.ceil(winWidth / 6),
      sh = Math.ceil(winHeight / 6),
      dotArry = [];
    for (var i = 0; i < 3; ++i) {
      for (var j = 0; j < 3; ++j) {
        dotArry.push([sw * (i * 2 + 1), sh * (j * 2 + 1)])
      }
    }
    return dotArry;
  }

  funStarTime = +new Date();
  printScreen();

  //计算时间
  function calculateTime(time) {
    var startTime = window.performance.timing.navigationStart || window.performance.timing.startTime; //页面首页时间
    console.log(time - startTime - runTime);
  }

  // 递归截图并计算9个点的颜色红色通道像素值
  // 前后数据相同,可以上报时间
  function printScreen() {
    funStartTime = +new Date();
    html2canvas(document.body).then(function (canvas) {
      var context = canvas.getContext('2d');
      var imageData = context.getImageData(0, 0, winWidth, winHeight);
      //截图初始化费时
      if (preData == 0) {
        runTime = +new Date() - funStartTime;
      }
      var colorTotal = 0;
      //对9个点的颜色红色通道像素值求值
      for (var i = 0, length = nineDots.length; i < length; ++i) {
        colorTotal += imageData.data[((nineDots[i][0] * (imageData.width * 4)) + (nineDots[i][1] * 4))]
      }
      //前后数据相同,可以上报时间
      if (preData == colorTotal && preData != 0) {
        calculateTime(+new Date())
        clearTimeout(timer);
      } else {
        preData = colorTotal;
        timer = setTimeout(function () {
          printScreen();
        }, 100)
      }
    });
  }

}
firstScreen();