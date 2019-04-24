let request = require('request');

;(async function fn() {
    for (let i = 0; i < 10; i ++) {
        let newP = new Promise((resolve, reject) => {
            request({
                method: 'GET',
                uri: 'http://localhost:8887/a',
                time: true,
                forever: true
            }, (error, response, body) => {
                console.log('timingPhases', response.timingPhases);
                resolve();
            });
        });
        promiseArr.push(newP);
    }
    Promise.all(promiseArr)
})()