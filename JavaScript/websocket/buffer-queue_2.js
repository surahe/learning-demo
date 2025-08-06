const QueueType = {
    burst: 'burst', // 满足条件后一次性推出
    stack: 'stack' // 满足条件后一条一条推出
};

const DefaultConfig = {
    type: QueueType.burst,
    limit: 10, // 缓存数量 填0则没有上线
    threshold: 1000, // 缓冲时间(ms) 多久处理一次
};

/**
 * 缓存队列
 * 执行机制：
 * 所有数据传入按序进入缓存中，从首次触发出栈后，在一定的缓冲时间的不会再次出栈，会将数据存起来；
 * 当缓冲时间内传入的数据大于限制后，会把传入时间较早的数据抛弃掉，缓存的数据不会大于限制值，除非限制值为0；
 */
class BufferQueue {
    constructor (opt) {
        this.bufferMap = new Map();
        this.interval = 300; // 设置定时器处理间隔
        this.updateTime = 0;
    }

    /**
     * 获取缓存队列
     * @param {*} key 缓存key
     * @returns 
     */
    getBuffer (key) {
        if (!this.bufferMap.has(key)) {
            return undefined;
        }

        return this.bufferMap.get(key);
    }

    // 缓存队列处理主方法
    doMain () {
        for (let [key, buffer] of this.bufferMap) {
            if (!buffer.bufferItems.length || !buffer.handle) { // 有内容 or 有处理函数 才执行
                continue;
            }

            const diff = this.nowTime - (buffer.preTime || 0);
            if (diff < buffer.threshold) { // 缓冲期内不执行
                continue;
            }

            buffer.preTime = this.nowTime; // 存储上一次处理时间

            switch (buffer.type) {
                case QueueType.stack:
                    buffer.handle([buffer.bufferItems.shift()]);
                    break;
                case QueueType.burst:
                    buffer.handle([].concat(buffer.bufferItems));
                    buffer.bufferItems = [];
                    break;
            }
        }
    }

    // 开启缓存队列定时器
    doTimer () {
        this.nowTime = Date.now();

        if (this.nowTime - this.updateTime >= this.interval) {
            this.updateTime = this.nowTime;
            this.doMain();
        }

        this.timer = requestAnimationFrame(this.doTimer.bind(this)); // 不使用timeout定时器 降低执行层级
    }

    /**
     * 注册缓存队列
     * @param {*} key 缓存key
     * @param {*} config 缓存配置，不传则使用默认配置
     * @returns 
     */
    register (key, config) {
        if (this.getBuffer(key)) {
            return;
        }

        console.log('register', key)

        this.bufferMap.set(key, Object.assign({bufferItems: []}, DefaultConfig, config));
    }

    /**
     * 删除缓存队列
     * @param {*} key key 缓存key
     * @returns 
     */
    unregister (key) {
        if (!this.getBuffer(key)) {
            return;
        }

        this.bufferMap.delete(key);
    }

    /**
     * 添加数据
     * @param {*} key 缓存key
     * @param {*} item 添加的内容
     * @returns 
     */
    addItem (key, item) {
        const buffer = this.getBuffer(key);
        
        if (!buffer) {
            return;
        }

        if (buffer.limit > 0 && buffer.bufferItems.length >= buffer.limit) { // 超过限制则剔除较旧的数据
            buffer.bufferItems.shift();
        }

        buffer.bufferItems.push(item);
    }
}

export default BufferQueue;