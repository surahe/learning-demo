const SpliteMap = {
    'd': 86400,
    'h': 3600,
    'm': 60,
    's': 1
}

/**
 * 计时类
 * 可做秒表、倒计时等
 */
class TimerClock {
    constructor (opt = {}) {
        this.events = {};
        // 时间分割 天, 时, 分, 秒
        this.spliteArr = opt.spliteArr || ['d', 'h', 'm', 's'];
        this.interval = 1000;
    }

    getTimeSpliteArr (timeStamp, spliteArr) {
        const result = [];
    
        let remain = timeStamp;
    
        for (let idx = 0; idx < spliteArr.length; idx++) {
            let round = 0;
    
            if (remain > 0) {
                const beRound = SpliteMap[spliteArr[idx]] || 1;
        
                if (remain > beRound) {
                    round = Math.floor(remain / beRound);
                    remain = remain % beRound;
                } else if (remain === beRound) {
                    round = 1;
                    remain = 0;
                }
            }
    
            result.push(round);
        }
    
        return result;
    }

    emit (eventName, ...other) {
        const callbacks = this.events[eventName];

        if (callbacks && callbacks.length) {
            callbacks.forEach(callback => callback(...other));
        }
    }

    on (eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(callback);
    }

    off (eventName, callback) {
        if (!this.events[eventName]) {
            return;
        }

        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }

    /**
     * 计时开始
     * @param {*} type 类型 time -> 秒表 limit -> 倒计时
     * @param {*} limitTime 
     * @returns 
     */
    start (type, limitTime) {
        this.timerType = type || 'time';
        this.timerCount = limitTime || 0;

        if (this.timerType === 'limit' && this.timerCount <= 0) {
            return;
        }

        this.timerDefaultCount = this.timerCount;

        this.stop();

        this.resume();
    }

    /**
     * 停止后唤醒
     */
    resume () {
        if (this.timerCount > 0 || this.timerType === 'time') {
            this.emit('count-down', this.getTimeSpliteArr(this.timerCount, this.spliteArr));
            this.doTimer = setTimeout(() => {
                if (this.timerType === 'limit') {
                    this.timerCount--;
                } else {
                    this.timerCount++;
                }

                this.resume();
            }, this.interval);
        } else {
            this.emit('count-down', this.getTimeSpliteArr(this.timerCount, this.spliteArr));
            this.emit('finished');
        }
    }

    /**
     * 停止
     */
    stop () {
        if (this.doTimer) {
            clearTimeout(this.doTimer);
            this.doTimer = undefined;
        }
    }

    /**
     * 重置
     */
    restart () {
        this.stop();

        if (this.timerDefaultCount !== undefined) {
            this.timerCount = this.timerDefaultCount;
        }

        this.resume();
    }

    /**
     * 清除
     */
    clear () {
        this.stop();
        this.timerCount = undefined;
        this.timerType = undefined;
        this.timerDefaultCount = undefined;
        this.events = {};
    }
}

export default TimerClock;