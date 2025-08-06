// websocket请求链接
let wsUrl = 'ws://dev.ws.qlchat.com/websocket';

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

let dispatch = null;
let getStore = null;


export function startSocket (_sid, _topicId) {

    return async (_dispatch, _getStore) => {
        dispatch = _dispatch;
        getStore = _getStore;
        sid = _sid;
        topicId = _topicId;

        openSocket();
    }
}

function openSocket (_errTime = 0) {
    socket = new WebSocket(wsUrl + '?_time=' + Date.now());

    socket.onerror = (event) => {
        console.error(event);
    };

    socket.onclose = () => {
        console.log('closed');
    };

    socket.onclose = (event) => {
        if (_errTime > 3) {
            pushType = 'HTTP';
            requestHTTPPush({sid, topicId, prevTime, idx})
            return;
        }

        if (pushType != 'HTTP') {
            setTimeout(() => {
                openSocket(_errTime + 1);
            }, 1000);
        }
    };

    socket.onopen = (event) => {
        errTime = 0;
        socket.send(JSON.stringify({sid: sid, topicId: topicId, prevTime: prevTime, idx: idx}));
    };

    socket.onmessage = (event) => {
        const result = JSON.parse(event.data);

        if (result.status == 200) {
            resultHandler(result);
        } else {
            pushType = 'HTTP';
            requestHTTPPush();
        }

    };
}

function requestHTTPPush () {
    fetch(`/push/receive?sid=${sid}&id=${topicId}&prevTime=${prevTime}&idx=${idx}&msgType=public&dir=LIVE`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        },
        mode: 'no-cors',
        credentials: 'include',
    })
    .then((res) => res.json())
    .then((json) => {
        if (json.status == 200) {
            resultHandler(json);
        }
    });
}

/**
 * socket接受信息的处理
 * 
 * @param {any} result 
 */
function resultHandler (result) {
    idx++;

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
        
        prevTime = __item.dateStr

        switch (__item.pushExp) {

            default:
                break;
        }
    });
}
