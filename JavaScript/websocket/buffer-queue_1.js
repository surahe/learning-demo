import EventEmitter from 'events';
import { autobind } from 'core-decorators';

/**
 * 缓存队列
 * 
 * @class BufferQueue
 */
@autobind
class BufferQueue {
    constructor() {
        this.__BufferMap = new Map();
        this.__globalTimer = null;
        this.__event = new EventEmitter();
        this.__event.on('GLOBAL_TIMEUP', this.disposeAll);
        this.__event.on('FLUSH', this.flush);
        this.__event.on('DEQUEUE', this.dequeue);
    }

    /**
     * 注册缓存
     * @param {*} type 注册缓存的类型
     * @param {number} limit 缓存的数量限制
     * @param {func} handler 缓存处理函数，在缓存数量超过限制以及时间到期时被调用
     * @param {string} method 'FLUSH' / 'DEQUEUE' / 'AUTO_DEQUEUE'，
     */
    registerBuffer({type, limit = 5, method = 'FLUSH', handler}) {

        if (!type || typeof(handler) !== 'function') {
            throw '参数输入错误，type 必须存在且 handler 必须为函数';
        }
        if (this.__BufferMap.has(type)) {
            throw '该类型已注册';
        }
        // console.log(limit);
        this.__BufferMap.set(type, {
            buffers: [],
            timer: null,
            autoDequeueTimeLimit: null,
            handler,
            limit,
            method,
        });
        if (method === 'AUTO_DEQUEUE') {
            this.setAutoDequeueTimer(type);
        }

    
    }
    
    /**
     * 注销缓存
     * 
     * @param {any} type 
     * @memberof BufferQueue
     */
    unregisterBuffer(type) {
        if (!type) {
            throw '请传入 type 类型';
        }
        this.__BufferMap.delete(type);
    }

    /**
     * 设置自动出队时间函数 
     * 
     * @param {any} type 
     * @memberof BufferQueue
     */
    setAutoDequeueTimer(type) {
        this.setAutoDequeueTimeLimit(type);

        this.__BufferMap.get(type).timer = () => {
            setTimeout(() => {
                this.setAutoDequeueTimeLimit(type);
                this.__event.emit('DEQUEUE', type);
                this.__BufferMap.get(type).timer();
            }, this.__BufferMap.get(type).autoDequeueTimeLimit);
        }
        this.__BufferMap.get(type).timer();
    }

    
    /**
     * 设置自动出队时间函数间隔
     * 
     * @param {any} type 
     * @memberof BufferQueue
     */
    setAutoDequeueTimeLimit(type) {
        try {
            if (this.__BufferMap.get(type).buffers && this.__BufferMap.get(type).buffers.length <= 3) { 
                this.__BufferMap.get(type).autoDequeueTimeLimit = 1000;
            } else if (this.__BufferMap.get(type).buffers && this.__BufferMap.get(type).buffers.length <= 6) {
                this.__BufferMap.get(type).autoDequeueTimeLimit = 500;
            } else if (this.__BufferMap.get(type).buffers && this.__BufferMap.get(type).buffers.length <= 12) {
                this.__BufferMap.get(type).autoDequeueTimeLimit = 333;
            } else if (this.__BufferMap.get(type).buffers && this.__BufferMap.get(type).buffers.length <= 20) {
                this.__BufferMap.get(type).autoDequeueTimeLimit = 200;
            } else {
                this.__BufferMap.get(type).autoDequeueTimeLimit = 100;
            }
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * 设置全局时间函数
     * 
     * @param {any} time 
     * @memberof BufferQueue
     */
    setGlobalTimer(time) {
        if (typeof(time) !== 'number' || time < 100) {
            throw '参数输入错误，time 必须为数字且大于等于100';
        }

        this.__globalTimer = setInterval(() => {
            this.__event.emit('GLOBAL_TIMEUP');
        }, time);
    }

    /**
     * 清除全局时间函数
     * 
     * @memberof BufferQueue
     */
    clearGlobalFlushTimer() {
        clearInterval(this.__globalTimer);
        this.__globalTimer = null;
    }

    /**
     * 处理所有已注册缓存
     * 
     * @memberof BufferQueue
     */
    disposeAll() {
        for (let [type, val] of this.__BufferMap.entries()) {
            if (!val.timer) {
                switch(val.method) {
                    case 'FLUSH':
                        this.__event.emit('FLUSH', type);
                        break;
                    case 'DEQUEUE':
                        this.__event.emit('DEQUEUE', type);
                        break;
                    default:
                        break;
                }      
            }
        }
    }

    /**
     * 将item 加入为类别为 type 的缓存
     * 
     * @param {any} type 
     * @param {any} item 
     * @memberof BufferQueue
     */
    enqueue(type, item) {
        if (!type) {
            throw '请传入 type 类型';
        }
        if (!item) {
            throw '请传入 item';
        }
        if (!this.__BufferMap.has(type)) {
            throw '类型未注册';
        }
        
        this.__BufferMap.get(type).buffers.push(item);
        const buffers = this.__BufferMap.get(type).buffers;
    
        if (buffers && buffers.length > this.__BufferMap.get(type).limit) {
            switch(this.__BufferMap.get(type).method) {
                case 'FLUSH':
                    this.__event.emit('FLUSH', type);
                    break;
                case 'DEQUEUE': 
                    this.__event.emit('DEQUEUE', type);
                    break;
                case 'AUTO_DEQUEUE' :
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * 出队单个缓存 item 并交给 handler 处理
     * 
     * @param {any} type 
     * @memberof BufferQueue
     */
    dequeue(type) {
        if (!type) {
            throw '请传入 type 类型';
        }

        if (!this.__BufferMap.has(type)) {
            throw '类型未注册';
        }

        const bufferObj = this.__BufferMap.get(type);

        if (bufferObj.buffers && bufferObj.buffers.length !== 0) {
            bufferObj.handler(bufferObj.buffers.shift());
        } 
    }

    /**
     * 从type类型缓存中移除特定id的item
     * 
     * @param {any} type 
     * @param {any} id 
     * @memberof BufferQueue
     */
    remove(type, id) {
        if (!type) {
            throw '请传入 type 类型';
        }
        this.__BufferMap.get(type).buffers = this.__BufferMap.get(type).buffers.filter((item) => {
            return item.id !== id;
        });
    }

    /**
     * 一次性清空缓存队列，并将缓存队列交给 handler 处理
     * 
     * @param {any} type 
     * @memberof BufferQueue
     */
    flush(type) {
        if (!type) {
            throw '请传入 type 类型';
        }

        if (!this.__BufferMap.has(type)) {
            throw '类型未注册';
        }

        const bufferObj = this.__BufferMap.get(type);

        if (bufferObj.buffers && bufferObj.buffers.length !== 0) {
            bufferObj.handler(bufferObj.buffers);
            bufferObj.buffers = [];
        }
    }
}

const bufferQueue = new BufferQueue();

export default bufferQueue;