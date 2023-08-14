
import fetch from 'isomorphic-fetch';
import BufferQueue from './buffer-queue';
import requestQueue from "../request-queue";

const BufferConfig = {
    'online-number': {
        type: 'burst',
        limit: 1,
        threshold: 10*1000, // ms
    },
    'topic-online-number': {
        type: 'burst',
        limit: 1,
        threshold: 15 * 1000, // ms
    },
    'topicOnlineUser': {
        limit: 0,
        threshold: 15 * 1000
    },
    'liveMicrophone' : {
        limit: 100,
        threshold: 5 * 1000,
    },
    'audienceMsg': {
        limit: 1,
        threshold: 3 * 1000,
    }
}

class QlSocketHandle {
    constructor () {
        this.pushType = 'WEISOCKET';
        this.reTry = 0;
        
        this.prevTime = 0;
        this.idx = 0;

        this.events = {};
        this.buffer = new BufferQueue();
        this.wsUrl = typeof window != 'undefined' && window.__WSURL__ || 'wss://ws-h5.qianliao.cn/websocket';
    }

    async open (sid, topicId) {
        this.sid = sid;
        this.topicId = topicId;

        try {
            if (typeof WebSocket == 'undefined') {
                this.initRequest();
            } else {
                await this.initWebSocket();
            }
        } catch (error) {
            this.initRequest();
        }

        this.buffer.doTimer();
    }

    initRequest () {
        this.pushType = 'HTTP';
        this.requestHttp();
    }

    requestHttp () {
        let baseUrl = '';
    
        if (window.location.origin.indexOf('m.qlchat.com') > -1) {
            baseUrl = 'https://rs.qlchat.com:8080';
        } else if (/(localhost)/gi.test(window.location.origin)) {
            baseUrl = 'http://m.dev1.qlchat.com';
        }
    
        Promise.race([
            new Promise((resolve, reject) => {
                setTimeout(reject, 3000);
            }),
    
            fetch(`${baseUrl}/push/receive.htm?sid=${this.sid}&id=${this.topicId}&prevTime=${this.prevTime ? this.prevTime : ''}&idx=${this.idx}&msgType=public&dir=LIVE`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                mode: 'cors',
                // credentials: 'include',
            })
        ])
        .then(async (res) => {
            let result = null;
            try {
                result = await res.text();
                result = result && JSON.parse(result);
            } catch (error) {
                console.error(error);
            }
    
            return result;
        })
        .then((json) => {
            if (json && json.status == 200) {
                this.prevTime = json.prevTime;
                this.idx = json.idx;
                this.messageHandle(json);
            }
            setTimeout(() => {
                this.requestHttp();
            }, 3000);
        })
        .catch(err => {
            console.log(err);
            setTimeout(() => {
                this.requestHttp();
            }, 3000);
        });
    }

    async initWebSocket () {
        let isTrue = false;

        while (!isTrue) {
            isTrue = await requestQueue.post({
                url: '/h5/topic/initWebsocket',
                body: {
                    topicId: this.topicId,
                    sessionId: this.sid
                }
            }, ['not-msg']).then(result => result.succeed);

            if (!isTrue) { // 5秒后再次尝试
                await new Promise(resolve => {
                    setTimeout(() => {
                        resolve(true);
                    }, 5000);
                })
            }
        }
        
        const socket = new WebSocket(this.wsUrl + '?_time=' + Date.now());

        socket.onerror = (event) => {
            console.log('socket onerror')
            console.error(event);
        };
    
        socket.onclose = (event) => {
            console.log('socket onclose')
            if (this.reTry > 3) {
                this.pushType = 'HTTP';
                this.initRequest();
                return;
            }
    
            if (this.pushType != 'HTTP') {
                setTimeout(() => {
                    this.reTry++;
                    this.initWebSocket();
                }, 1000);
            }
        };
    
        socket.onopen = (event) => {
            console.log('socket onopen')
            
            socket.send(JSON.stringify({sid: this.sid, topicId: this.topicId, prevTime: this.prevTime, idx: this.idx}));
        };
    
        socket.onmessage = (event) => {
            console.log('socket onmessage')
    
            const message = JSON.parse(event.data);
    
            if (message.status == 200) {
                this.reTry = 0;
                this.messageHandle(message);
            } else {
                console.log('ws message:', message);
            }
    
        };
    }

    bufferPush (key, data) {
        this.buffer.addItem(key, data);
    }

    messageHandle (message) {

        if (message.onLineNum != 0) {
            // 更新线上人数
            this.bufferPush('online-number', {
                browseNum: message.onLineNum || 0,
                topicOnlineNum: message.topicOnLineNum || 0
            });
        }

        if (message.topicOnLineNum != 0) {
            this.bufferPush('topic-online-number', {
                topicOnlineNum: message.topicOnLineNum || 0
            })
        }

        const items = message.list || [];
        if (items.length > 0) {
            items.forEach((item) => {
                const _item = typeof item === 'string' ? JSON.parse(item) : item;
                
                if (this.pushType !== 'HTTP') {
                    this.prevTime = _item.dateStr;
                }

                this.bufferPush(_item.pushExp, _item);
            });
        }
    }

    emit (eventName, ...other) {
        const callbacks = this.events[eventName];

        if (callbacks && callbacks.length) {
            callbacks.forEach(callback => callback(...other));
        }
    }

    on (eventName, callback) {
        if (!this.events[eventName]) {
            this.buffer.register(eventName, Object.assign({}, BufferConfig[eventName], {
                handle: (items) => {
                    this.emit(eventName, items);
                }
            }));
            this.events[eventName] = [];
        }

        this.events[eventName].push(callback);
    }

    off (eventName, callback) {
        if (!this.events[eventName]) {
            return;
        }
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);

        if (this.events[eventName].length === 0) {
            this.buffer.unregister(eventName);
        }
    }
}

export default QlSocketHandle;