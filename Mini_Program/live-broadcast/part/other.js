'use strict';
import { api } from '../../config';
import request from '../../comp/request';

const app = getApp();

Page({
    data: {
        navHeight:'',
        navTop: '',
        windowHeight:'',

        showLiveInfo: false,

        topicInfo: null,
        userInfo: null,
        creatorId: null,
        showControl: true,
    },
    onLoad: function ready(options) {
        this.refreshNavTop();
        const topicId = options.topicId;

        app.login().then(() => {
            this.initTopicInfo(topicId);
        });
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

});
