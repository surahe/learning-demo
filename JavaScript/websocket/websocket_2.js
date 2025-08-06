import {
    updateAnchorRecommend,
    updateOnSaleList,
    updateRecommendSwitch,
    updateNewProduct,
} from 'thousand_live_actions/thousand-live-av';
import {
    updatePublicityCardTips,
} from 'thousand_live_actions/thousand-live-common';

import fetch from 'isomorphic-fetch';
import bufferQueue from 'components/buffer-queue';

// websocket请求链接
let wsUrl = typeof window != 'undefined' && window.__WSURL__ || 'wss://ws-h5.qianliao.cn/websocket';

let socket = null;
// 连接类型
let pushType = 'WEISOCKET';
// websocket上次接受的时间
let prevTime = 0;
// websocket接收信息的id
let idx = 0;
// 重试次数
let errTime = 0;
// sessionId
let sid = '';
let topicId = undefined;
let userId = undefined;
let currentTimeMillis = 0;

let dispatch = null;
let getStore = null;

// websocket连接成功后的回调
let callback = null;
// 注册事件
let event = {};

/**
 * 通知
 * @param {*} e 事件名
 * @param {*} d 数据
 */
const emit = (e, d) => {
    event[e] && event[e](d)
}

export function startSocket (_sid, _topicId, _userId, _currentTimeMillis, _cb, option = {}) {

    return (_dispatch, _getStore) => {
        dispatch = _dispatch;
        getStore = _getStore;
        sid = _sid;
        topicId = _topicId;
        userId = _userId;
        currentTimeMillis = _currentTimeMillis;
        callback = _cb;
        event = option.event || {};
        openSocket();

        // 初始化前先注销已有缓存, 防止单页面切换会重复注册
        bufferQueue.unregisterBuffer('newProductList');

        let curTime2 = null;
        bufferQueue.registerBuffer({
            type: 'newProductList',
            limit: 20,
            method: 'DEQUEUE',
            handler:  (item) => {
                // 首次直接更新，后续都间隔8秒
                if (!curTime2) {
                    curTime2 = Date.now();
                    dispatch(updateNewProduct(item));
                    return;
                }

                // 过滤掉出列间隔小于8秒的数据
                if (Date.now() - curTime2 < 8000) return;
                curTime2 = Date.now();

                dispatch(updateNewProduct(item));
            }
        });

        bufferQueue.setGlobalTimer(1000);

        return socket;
    }
}


function openSocket () {
    if (typeof WebSocket == 'undefined') {
        requestHTTPPush();
        return;
    }

    socket = new WebSocket(wsUrl + '?_time=' + Date.now());
    socket.onerror = (event) => {
        console.error(event);
    };

    socket.onclose = (event) => {
        if (errTime > 3) {
            pushType = 'HTTP';
            requestHTTPPush()
            return;
        }

        if (pushType != 'HTTP') {
            setTimeout(() => {
                errTime++;
                openSocket();
            }, 1000);
        }
    };

    socket.onopen = (event) => {
        socket.send(JSON.stringify({sid: sid, topicId: topicId, prevTime: prevTime, idx: idx}));
        
        if (callback) {
            typeof callback === 'function' && callback();
            callback = null;
        }
    };

    socket.onmessage = (event) => {

        const result = JSON.parse(event.data);

        if (result.status == 200) {
            errTime = 0;
            resultHandler(result);
        } else {
            console.log('ws message:', result);
        }

    };
}

function requestHTTPPush () {
    let baseUrl = '';

    if (window.location.origin.indexOf('h5.qlchat.com') > -1) {
        baseUrl = 'https://rs.qlchat.com:8080';
    } else if (/(localhost)/gi.test(window.location.origin)) {
        baseUrl = 'http://m.dev1.qlchat.com';
    }

    Promise.race([
        new Promise((resolve, reject) => {
            setTimeout(reject, 3000);
        }),

        fetch(`${baseUrl}/push/receive.htm?sid=${sid}&id=${topicId}&prevTime=${prevTime ? prevTime : ''}&idx=${idx}&msgType=public&dir=LIVE`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            mode: 'cors',

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

        if (callback) {
            typeof callback === 'function' && callback();
            callback = null;
        }

        return result;
    })
    .then((json) => {
        if (json && json.status == 200) {
            prevTime = json.prevTime;
            idx = json.idx;
            resultHandler(json);
        }
        setTimeout(() => {
            requestHTTPPush();
        }, 3000);
    })
    .catch(err => {
        console.log(err);
        setTimeout(() => {
            requestHTTPPush();
        }, 3000);
    });

}

/**
 * socket接受信息的处理
 *
 * @param {any} result
 */
function resultHandler (result) {

    result.list.forEach((item) => {

        let __item = null;
        try {
            __item = typeof item === 'string' ? JSON.parse(item) : item;
        } catch (error) {
            console.error(error);
        }

        if (!__item) {
            return;
        }

        let createTime;
        if (typeof(__item.updateTime) == 'object' && __item.updateTime != null && typeof (__item.updateTime.time) != 'undefined') {
            createTime = __item.updateTime.time;
        } else if (typeof (__item.updateTime) == 'string' || typeof(__item.updateTime) == 'number' ) {
            createTime = __item.updateTime;
        } else if (typeof (__item.checkTime) == 'object' && __item.checkTime != null && typeof (__item.checkTime.time) != 'undefined') {
            // 此处兼容PPT推动对象
            createTime = __item.checkTime.time;
        } else if (typeof(__item.endTime) == 'object' &&  __item.endTime != null && typeof(__item.endTime.time) != 'undefined') {
            // 此处单课结束
            createTime = __item.endTime.time;
        } else if (typeof(__item.createTime) == 'object' &&  __item.createTime != null && typeof(__item.createTime.time) != 'undefined') {
            createTime = __item.createTime.time;
        } else if (typeof(__item.createTime) == 'string' || typeof(__item.createTime) == 'number' ) {
            createTime = __item.createTime;
        } else {
            createTime = false;
        }

        // 如果该推送是进入单课前的操作则不处理
        if (createTime && currentTimeMillis - createTime > 5000 && !/^(deleteComment|enterProduct)$/.test(__item.pushExp)) {
            return;
        }

        if (pushType != 'HTTP') {
            prevTime = __item.dateStr;
        }
        
        emit(__item.pushExp, __item)
        switch (__item.pushExp) {
            case 'putawayProduct':
                // 新上架商品
                if (__item.onSale === 'Y' && __item.top !== 'Y') {
                    // 排除取消置顶的数据
                    let anchorRecommendItem = getStore().thousandLive.anchorRecommendItem || {};
                    (anchorRecommendItem.businessId !== __item.businessId) && bufferQueue.enqueue('newProductList', __item);
                }

                // 更新主播推荐项
                __item.top === 'Y' && dispatch(updateAnchorRecommend(__item));

                // 取消置顶    
                if (__item.top === 'N' || __item.onSale === 'N') {
                    let anchorRecommendItem = getStore().thousandLive.anchorRecommendItem || {};
                    (anchorRecommendItem.businessId === __item.businessId) && dispatch(updateAnchorRecommend(null));
                }

                // 上下架时更新已上架列表
                dispatch(updateOnSaleList(__item));
                break;
            case 'productOnSale':
                dispatch(updateRecommendSwitch(__item.flag));
                break; 
            case 'putawayTipsCard':
                dispatch(updatePublicityCardTips(__item));
                break;
            default:
                break;
        }
    });
}