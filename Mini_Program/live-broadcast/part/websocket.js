'use strict';
import { api } from '../../config';
import request from '../../comp/request';
import { digitFormat } from '../../comp/filter';
import { getLoginSessionId } from '../../comp/util';
import bufferQueue from '../../comp/buffer-queue';
const app = getApp();

Page({
    websocketCloseReConnect: true,
    cacheUserMap: {},

    data: {
        onlineNum: 0,
        /*websocket数据*/
        socketData: {
            prevTime: "",
            idx: 0,
        },
    },

    onLoad: function ready(options) {
        const topicId = options.topicId;
        const userId = (wx.getStorageSync('userId')).value;
        this.initWebSocket(topicId, userId);
    },

    onUnload() {
        // 关闭websocket
        this.websocketCloseReConnect = false;
        wx.closeSocket({
            code: 1000,
            reason: 'user close page'
        });

        if (this.websocketTimeout) {
            clearTimeout(this.websocketTimeout);
        }

        bufferQueue.clearGlobalFlushTimer();
        bufferQueue.unregisterBuffer('liveMicrophone');
    },

    initWebSocket: async function (topicId, userId) {
        const sid = getLoginSessionId();
        let isTrue = false;
        
        while (!isTrue) {
            isTrue = await request({
                method: 'POST',
                url: api.initWebsocket,
                data: {
                    topicId: topicId,
                    sessionId: sid
                }
            }).then(res => res && res.data && res.data.state.code === 0);

            if (!isTrue) { // 5秒后再次尝试
                await new Promise(resolve => {
                    setTimeout(() => {
                        resolve(true);
                    }, 5000);
                })
            }
        }

        let socketOpen = false;
        let socketMsgQueue = [{
            sid: sid,
            topicId: topicId,
            prevTime: this.data.socketData.prevTime,
            idx: this.data.socketData.idx
        }];
        
        function sendSocketMessage(msg) {
            let ms = JSON.stringify(msg);
            if (socketOpen) {
                wx.sendSocketMessage({
                    data: ms
                })
            } else {
                socketMsgQueue.push(msg)
            }
        }

        wx.connectSocket({
            url: '__WSS_URL'
        })

        wx.onSocketOpen((res) => {
            console.log('WebSocket连接已打开！')
            socketOpen = true
            for (var i = 0; i < socketMsgQueue.length; i++) {
                sendSocketMessage(socketMsgQueue[i])
            }
        });
        
        wx.onSocketMessage((res) => {
            var data = JSON.parse(res.data);

            // 更新在线人数
            if (data.onLineNum != 0) {
                this.setData({
                    onlineNum: digitFormat(data.onLineNum, 10000),
                });
            }

            if (data.status == "200") {
                for (var i = 0; i < data.list.length; i++) {
                    var dataObj = JSON.parse(data.list[i]);
                    if (dataObj.dateStr != this.data.socketData.prevTime) {
                        this.setData({
                            'socketData.prevTime': dataObj.dateStr,
                        })
                    } else {
                        this.setData({
                            'socketData.idx': this.data.socketData.idx + 1
                        })
                    }
                    this.socketCallback(dataObj);
                }
            }

        })

        wx.onSocketError((res) => {
            console.log(res);
            console.log('WebSocket连接打开失败，请检查！');
        })
        wx.onSocketClose((res) => {
            console.log(res)
            console.log('WebSocket 已关闭！');
            if (this.websocketCloseReConnect) {
                this.websocketTimeout = setTimeout(function () {
                    wx.connectSocket({
                        url: '__WSS_URL'
                    })
                }, 5000)
            }
        })
                
        bufferQueue.unregisterBuffer('liveMicrophone');
        bufferQueue.registerBuffer({
            type: 'liveMicrophone',
            limit: 5,
            method: 'FLUSH',
            handler: (items) => {
                const finds = items.filter((item) => item.userId === userId && item.roomRole === 'Student');
                const item = finds[finds.length - 1];

                console.log('liveMicrophone FLUSH', items, finds, item);

                if (item && item.status === 'finish') {
                    this.exitRoom();
                }
            }
        });

        // 设置缓冲最长时间（ms)
        bufferQueue.setGlobalTimer(1200);
    },
    
    /**
     * ws回调数据处理
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    socketCallback(data) {
        let dataArr = [];
        switch (data.pushExp) {
            case "liveMicrophone":
                bufferQueue.enqueue('liveMicrophone', data);
                break;
            case "liveEnd":
                this.exitRoom();
                break;
        }
    },

    exitRoom: function () {
        wx.redirectTo({
            url: `/pages/web-page/web-page?url=${encodeURIComponent(`/topic/details?topicId=${this.data.topicInfo.id}`)}`
        })
    },
});
