// Node 串行请求（不使用keep-alive）

let request = require('request');

;(async function fn() {
    for (let i = 0; i < 10; i ++) {
        await new Promise((resolve, reject) => {
            request({
                method: 'GET',
                uri: 'http://localhost:8887/a',
                time: true, // 配置这个属性可以看到时间信息
                // forever: true
            }, (error, response, body) => {
                console.log('timingPhases', response.timingPhases);
                resolve();
            });
        });
    }
    return 'success';
})()