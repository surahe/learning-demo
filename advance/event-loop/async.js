

  /**
   * Node 8.12.0、Chrome 72 中async1函数被解析为以下代码
   */
  // return new Promise(resolve => {
  //   Promise.resolve().then(() => {
  //     async2().then(resolve)
  //   })
  // }).then(() => {
  //   console.log('async1 then1 end')
  //   console.log('async1 then2 end')
  // })

  // 结果
  // async2 function
  // async1 then1 end
  // async1 then2 end
  // promise2
  // promise3
  // promise4
  // promise5


  /**
   * Node 10.11.0、Chrome 70 中async1函数被解析为以下代码
   */
  // return new Promise(resolve => {
  //   Promise.resolve().then(() => {
  //     async2().then(resolve)
  //   })
  // }).then(() => {
  //   console.log('async1 then1 end')
  //   console.log('async1 then2 end')
  // })
  // 
  // 结果
  // async2 function
  // promise2
  // promise3
  // async1 then1 end
  // async1 then2 end
  // promise4
  // promise5

// async function async1 () {
//   await async2()
//   console.log('async1 then1 end')
//   console.log('async1 then2 end')
// }

async function async2 () {console.log('async2 function')}

async1()

Promise.resolve()
  .then(function () {
    console.log('promise2')
  })
  .then(function () {
    console.log('promise3')
  })
  .then(function () {
    console.log('promise4')
  })
  .then(function () {
    console.log('promise5')
  })