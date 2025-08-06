'use strict';
import { api } from '../../config';
import request from '../../comp/request';
import TRTC from './components/trtc-wx';
import { digitFormat } from '../../comp/filter';
import { getLoginSessionId } from '../../comp/util';
import bufferQueue from '../../comp/buffer-queue';


const app = getApp();

Page({
    websocketCloseReConnect: true,
    cacheUserMap: {},

    data: {
        navHeight:'',
        navTop: '',
        windowHeight:'',

        showLiveInfo: false,
        pusher: null,
        cameraPlayerList: [],
        screenPlayerList: [],
        playerList: [],
        userMap: {},
        horizontal: false,
        openCamera: true,
        openMic: true,
        frontCamera: 'front',
        topicInfo: null,
        onlineNum: 0,
        userInfo: null,
        creatorId: null,
        showControl: true,

        /*websocket数据*/
        socketData: {
            prevTime: "",
            idx: 0,
        },
    },
    onLoad: function ready(options) {
        this.refreshNavTop();
        const topicId = options.topicId;

        app.login().then(() => {
            this.checkDeviceAuthorize().then(async () => {
                const userId = (wx.getStorageSync('userId')).value;
                const userInfo = (wx.getStorageSync('userInfo')).value;

                const roomInfo = await request({
                    method: 'POST',
                    url: api.getRoomInfo,
                    data: { roomId: topicId }
                }).then(res => res && res.data && res.data.data);

                if (!roomInfo) {
                    return;
                }

                const creatorId = roomInfo.creator;

                this.setData({ userId, userInfo, creatorId });

                this.initTopicInfo(topicId);
                this.initWebSocket(topicId, userId);
                this.initTrtc(topicId, userId);

            })
        });
    },

    onShow: function () {
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

    // 刷新高度
    refreshNavTop() {
        let menuButtonObject = wx.getMenuButtonBoundingClientRect();
        wx.getSystemInfo({
            success: res => {
                let statusBarHeight = res.statusBarHeight,
                navTop = menuButtonObject.top,//胶囊按钮与顶部的距离
                navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight)*2;//导航高度
                this.setData({
                    navHeight,
                    navTop,
                    showLiveInfo: true,
                    windowHeight: res.windowHeight
                })
            },
            fail(err) {
                console.log(err);
            }
        }) 
    },

    showControl() {
        if (this.controlTimer) {
            clearTimeout(this.controlTimer);
            this.controlTimer = null;
        }

        this.setData({ showControl: true });

        this.controlTimer = setTimeout(() => {
            this.setData({ showControl: false });
        }, 3000);
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

    initTopicInfo: function (topicId) {
        request({ 
            url: api.getTopicInfo,
            data: {
                topicId: topicId,
                source: 'weapp',
            }
        }).then(res => {
            console.log(res.data.data);
            this.setData({
                topicInfo: res.data.data.topicPo
            })
        })
    },

    initTrtc: function (topicId, userId) {
        wx.setKeepScreenOn({
            keepScreenOn: true,
        })
        wx.setPageOrientation({ orientation: this.data.horizontal ? 'landscape' : 'portrait' });
        
        this.TRTC = new TRTC(this);
        this.initPusher();
        this.bindTRTCRoomEvent();
        this.enterRoom(topicId, userId);
    },
    
    async checkDeviceAuthorize () {
        if (!wx.getSetting || !wx.getSetting()) {
            // 微信测试版 获取授权API异常，目前只能即使没授权也可以通过
            return true;
        }

        const result = await wx.getSetting();

        console.log('getSetting', result)
        let authorizeMic = result.authSetting['scope.record']
        let authorizeCamera = result.authSetting['scope.camera']

        if (authorizeMic && authorizeCamera) {
            // 授权成功
            return true; 
        }

        await wx.authorize({
            scope: 'scope.record',
        }).then((res) => {
            console.log('authorize mic', res)
            authorizeMic = true;
        })
        .catch((error) => {
            console.log('authorize mic error', error)
            authorizeMic = false;
        })

        await wx.authorize({
            scope: 'scope.camera',
        }).then((res) => {
            console.log('authorize camera', res)
            authorizeCamera = true;
        })
        .catch((error) => {
            console.log('authorize camera error', error)
            authorizeCamera = false;
        })

        if (authorizeMic && authorizeCamera) {
            // 授权成功
            return true; 
        }

        this.openConfirm();
    },

    openConfirm() {
        return wx.showModal({
            content: '您没有打开麦克风和摄像头的权限，是否去设置打开？',
            confirmText: '确认',
            cancelText: '取消',
            success: (res) => {
                console.log(res)
                // 点击“确认”时打开设置页面
                if (res.confirm) {
                    console.log('用户点击确认')
                    wx.openSetting({
                        success: (res) => { },
                    })
                } else {
                    console.log('用户点击取消')
                }
            },
        })
    },

    // 初始化推流
    initPusher: function () {
        console.log('初始化用户本地流');
        const pusherConfig = {
            // SD（标清）、 HD（高清）、FHD（超清）、RTC（实时通话）
            mode: "RTC", 
            // 是否开启摄像头
            enableCamera: this.data.openCamera,
            // 是否开启麦克风
            enableMic: this.data.openMic,
            // 是否开启音频自动增益，该特性可以补偿部分手机麦克风音量太小的问题，但也会放大噪音，建议配合 ANS 同时开启
            enableAgc: false,
            // 是否开启音频噪声抑制，该特性会自动检测背景噪音并进行过滤，但也会误伤周围的音乐，只有会议、教学等场景才适合开启
            enableAns: false,
            // 最小码率，不建议设置太低
            minBitrate: 1200,
            // 最大码率，需要跟分辨率相匹配
            maxBitrate: 1200,
            // 前置或后置摄像头，可选值：front，back
            frontCamera: this.data.frontCamera,
            // 上推的视频流的分辨率宽度
            videoWidth: 1280,
            // 上推的视频流的分辨率高度
            videoHeight: 720,
            // 美颜。取值范围 0-9 ，0 表示关闭
            beautyLevel: 9,
            // 美白。取值范围 0-9 ，0 表示关闭
            whitenessLevel: 0,
            // 推流方向。vertical：垂直方向，horizontal：水平方向
            videoOrientation: "vertical",
            // 设置主播本地摄像头预览画面的镜像效果，支持如下取值：
            // auto：前置摄像头镜像，后置摄像头不镜像（系统相机的表现 ）
            // enable：前置摄像头和后置摄像头都镜像 
            // disable：前置摄像头和后置摄像头都不镜像
            localMirror: "auto",
            // 高音质（48KHz）或低音质（16KHz），可选值：high、low
            audioQuality: "high",
            // 声音类型。可选值： media：媒体音量，voicecall：通话音量
            audioVolumeType: "voicecall",
            // 音频混响类型。0：关闭，1：KTV，2：小房间，3：大会堂，4：低沉，5：洪亮，6：金属声，7：磁性
            audioReverbType: 0,
            // 美颜类型。取值有：smooth：光滑，nature：自然
            beautyStyle: "smooth",
        }
        this.setData({
            pusher: this.TRTC.createPusher(pusherConfig)
        })
    },

    enterRoom: async function (topicId, userId) {
        const trtcUserId = `${userId}_camera_Student`;
        
        const { sdkAppid, userSig } = await request({
            method: 'POST',
            url: api.getTrtcUserSig,
            data: {
                'userSessionId': trtcUserId
            }
        }).then(res => {
            console.log(res);
            return res.data && res.data.data || {};
        }).catch(err => {
            console.log('err', err)
            return {};
        });

        this.setData({
            pusher: this.TRTC.enterRoom({
                strRoomID: topicId,
                sdkAppID: sdkAppid,
                userID: trtcUserId,
                userSig: userSig,
            }),
        }, () => {
            this.TRTC.getPusherInstance().start() // 开始推流并进入trtc房间
        })
    },

    async addUserInfo (userId) {
        if (this.cacheUserMap[userId]) {
            return ;
        }

        const userInfo = await request({ 
            method: 'POST',
            url: api.getUserInfo,
            data: {
                otherUserId: userId
            }
        }).then(res => res.data && res.data.data.user);

        if (userInfo) {
            this.cacheUserMap[userId] = userInfo;
            this.setData({
                userMap: this.cacheUserMap
            })
        }
    },

    updatePlayerList (playerList) {
        const cameraPlayerList = [];
        const screenPlayerList = [];

        console.log('playerList', playerList)

        for (let idx = 0; idx < playerList.length; idx++) {
            const item = playerList[idx];
            const [userId, streamType] = playerList[idx].userID.split('_');

            item.qlStreamRole = userId === this.data.creatorId ? 'Anchor' : 'Guest';
            item.qlUserId = userId;

            if (streamType === "camera") {
                cameraPlayerList.push(item);
            } else {
                screenPlayerList.push(item);
            }
        }

        this.setData({
            cameraPlayerList,
            screenPlayerList
        })
    },

    // 设置某个 player 属性
    async setPlayerAttributesHandler(player, options) {
        console.log('setPlayerAttributesHandler', player, options)
        const playerList = this.TRTC.setPlayerAttributes(player.streamID, options);
        this.updatePlayerList(playerList);
    },

    delayTimer: null,

    toggleDirection: function () {
        wx.setPageOrientation({ orientation: !this.data.horizontal ? 'landscape' : 'portrait' });
        this.setData({
            horizontal: !this.data.horizontal,
            showLiveInfo: false
        }, () => {
            if (this.delayTimer) {
                clearTimeout(this.delayTimer);
                this.delayTimer = null;
            }
            this.delayTimer = setTimeout(() => {
                this.refreshNavTop();
            }, 1000);
        })
    },

    toggleCamera: function () {
        const openCamera = !this.data.openCamera;
        this.setData({
            pusher: this.TRTC.setPusherAttributes({
                enableCamera: openCamera,
            }),
            openCamera
        })
    },

    toggleMic: function () {
        const openMic = !this.data.openMic;
        
        this.setData({
            pusher: this.TRTC.setPusherAttributes({
                enableMic: openMic,
            }),
            openMic
        })
    },

    toggleFrontCamera: function () {
        if (!this.data.openCamera) {
            return; 
        }
        const frontCamera = this.data.frontCamera === 'front' ? 'back' : 'front'; // front，back
        this.setData({
            pusher: this.TRTC.getPusherInstance().switchCamera(frontCamera),
            frontCamera
        })
    },

    handleExit: function () {
        wx.showModal({
            title: '确认结束连麦',
            content: '结束后自动返回上课页',
            confirmText: '结束',
            success: (res) => {
                if (res.confirm) {
                    request({
                        method: 'POST',
                        url: api.updateMicrophoneStatus,
                        data: {
                            topicId: this.data.topicInfo.id,
                            audienceUserId: this.data.creatorId,
                            status: 'finish',
                            roomRole: 'Student'
                        }
                    }).then(res => {
                        this.exitRoom();
                    })
                }
            }
        })
    },

    exitRoom: function () {
        wx.redirectTo({
            url: `/pages/web-page/web-page?url=${encodeURIComponent(`/topic/details?topicId=${this.data.topicInfo.id}`)}`
        })
    },
    
    // 事件监听
    bindTRTCRoomEvent() {
        const TRTC_EVENT = this.TRTC.EVENT
        // 初始化事件订阅
        this.TRTC.on(TRTC_EVENT.LOCAL_JOIN, (event) => {
            console.log('* room LOCAL_JOIN', event)
        })
        this.TRTC.on(TRTC_EVENT.LOCAL_LEAVE, (event) => {
            console.log('* room LOCAL_LEAVE', event)
        })
        this.TRTC.on(TRTC_EVENT.ERROR, (event) => {
            console.log('* room ERROR', event)
        })
        // 远端用户加入
        this.TRTC.on(TRTC_EVENT.REMOTE_USER_JOIN, (event) => {
            console.log('* room REMOTE_USER_JOIN', event)

            const { userID, playerList } = event.data
            const [userId, streamType] = userID.split('_');

            this.addUserInfo(userId);
        })
        // 远端用户退出
        this.TRTC.on(TRTC_EVENT.REMOTE_USER_LEAVE, (event) => {
            console.log('* room REMOTE_USER_LEAVE', event)
            
            const { userID, playerList } = event.data
            this.updatePlayerList(playerList);
        })
        // 远端用户推送视频
        this.TRTC.on(TRTC_EVENT.REMOTE_VIDEO_ADD, (event) => {
            console.log('* room REMOTE_VIDEO_ADD',  event)
            
            const { player } = event.data
            // 开始播放远端的视频流，默认是不播放的
            this.setPlayerAttributesHandler(player, { muteVideo: false })
        })
        // 远端用户取消推送视频
        this.TRTC.on(TRTC_EVENT.REMOTE_VIDEO_REMOVE, (event) => {
            console.log('* room REMOTE_VIDEO_REMOVE', event)
            
            const { player } = event.data
            this.setPlayerAttributesHandler(player, { muteVideo: true })
        })
        // 远端用户推送音频
        this.TRTC.on(TRTC_EVENT.REMOTE_AUDIO_ADD, (event) => {
            console.log('* room REMOTE_AUDIO_ADD', event)

            const { player } = event.data
            this.setPlayerAttributesHandler(player, { muteAudio: false })
        })
        // 远端用户取消推送音频
        this.TRTC.on(TRTC_EVENT.REMOTE_AUDIO_REMOVE, (event) => {
            console.log('* room REMOTE_AUDIO_REMOVE', event)

            const { player } = event.data
            this.setPlayerAttributesHandler(player, { muteAudio: true })
        })
        // 远端用户音量更新
        this.TRTC.on(TRTC_EVENT.REMOTE_AUDIO_VOLUME_UPDATE, (event) => {
            console.log('* room REMOTE_AUDIO_VOLUME_UPDATE', event)
        })
        // 本地用户音量更新
        this.TRTC.on(TRTC_EVENT.LOCAL_AUDIO_VOLUME_UPDATE, (event) => {
            // console.log('* room LOCAL_AUDIO_VOLUME_UPDATE', event)
        })
    },
        
    // 请保持跟 wxml 中绑定的事件名称一致
    _pusherStateChangeHandler(event) {
        this.TRTC.pusherEventHandler(event)
    },
    _pusherNetStatusHandler(event) {
        this.TRTC.pusherNetStatusHandler(event)
    },
    _pusherErrorHandler(event) {
        this.TRTC.pusherErrorHandler(event)
    },
    _pusherBGMStartHandler(event) {
        this.TRTC.pusherBGMStartHandler(event)
    },
    _pusherBGMProgressHandler(event) {
        this.TRTC.pusherBGMProgressHandler(event)
    },
    _pusherBGMCompleteHandler(event) {
        this.TRTC.pusherBGMCompleteHandler(event)
    },
    _pusherAudioVolumeNotify(event) {
        this.TRTC.pusherAudioVolumeNotify(event)
    },
    _playerStateChange(event) {
        this.TRTC.playerEventHandler(event)
    },
    _playerFullscreenChange(event) {
        this.TRTC.playerFullscreenChange(event)
    },
    _playerNetStatus(event) {
        this.TRTC.playerNetStatus(event)
    },
    _playerAudioVolumeNotify(event) {
        this.TRTC.playerAudioVolumeNotify(event)
    }
});
