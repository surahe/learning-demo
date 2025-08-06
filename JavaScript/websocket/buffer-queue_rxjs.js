const { Subject, interval } = rxjs;
const { bufferTime, takeUntil } = rxjs.operators;

const QueueType = {
    burst: 'burst', // 满足条件后一次性推出
    stack: 'stack' // 满足条件后一条一条推出
};

const DefaultConfig = {
    type: QueueType.burst,
    limit: 10, // 缓存数量 填0则没有上线
    threshold: 1000, // 缓冲时间(ms) 多久处理一次
};

class RxBufferQueue {
    constructor() {
        this.bufferMap = new Map(); // 存储队列
        this.stopSignal = new Subject(); // 停止信号
    }

    /**
     * 注册缓存队列
     * @param {*} key 缓存key
     * @param {*} config 缓存配置，不传则使用默认配置
     */
    register(key, config) {
        if (this.bufferMap.has(key)) {
            return;
        }

        console.log('register', key);

        const subject = new Subject(); // 数据流
        const { threshold = 1000, limit = 10, type = QueueType.burst, handle } = Object.assign({}, DefaultConfig, config);

        // 根据队列类型处理数据
        if (type === QueueType.burst) {
            subject.pipe(
                bufferTime(threshold), // 定时缓冲
                takeUntil(this.stopSignal) // 停止信号
            ).subscribe((items) => {
                if (limit > 0 && items.length > limit) {
                    items = items.slice(-limit); // 剔除较旧的数据
                }
                handle && handle(items); // 调用处理函数
            });
        } else if (type === QueueType.stack) {
            subject.pipe(
                bufferTime(threshold, 1), // 每次缓冲一个数据
                takeUntil(this.stopSignal) // 停止信号
            ).subscribe((items) => {
                handle && handle(items);
            });
        }

        this.bufferMap.set(key, subject);
    }

    /**
     * 删除缓存队列
     * @param {*} key 缓存key
     */
    unregister(key) {
        if (!this.bufferMap.has(key)) {
            return;
        }

        const subject = this.bufferMap.get(key);
        subject.complete(); // 完成数据流
        this.bufferMap.delete(key);
    }

    /**
     * 添加数据
     * @param {*} key 缓存key
     * @param {*} item 添加的内容
     */
    addItem(key, item) {
        const subject = this.bufferMap.get(key);
        if (!subject) {
            return;
        }

        subject.next(item); // 推送数据到队列
    }

    /**
     * 停止所有队列
     */
    stopAll() {
        this.stopSignal.next(); // 发送停止信号
        this.stopSignal.complete();
        console.log('所有队列已停止');
    }
}