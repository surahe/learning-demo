
import requestQueue from "../request-queue";
import { extname } from 'path';

/**
 * 华为云上传封装
 * 文档：https://support.huaweicloud.com/uploadsdk-vod/vod_06_0269.html
 */
class HuaWeiUpload {
    constructor (opt = {}) {

        const {
            onUploadstarted,
            onUploadSucceed,
            onUploadFailed,

            ...otherOpt
        } = opt;

        this.eventMap = {};
        this.UploadTypeMap = ['MP4', 'TS', 'MOV', 'MXF', 'MPG', 'FLV', 'WMV', 'AVI', 'M4V', 'F4V', 'MPEG', '3GP', 'ASF', 'MKV', 'HLS', 'WEBM'];

        this.UploadAudioTypeMap = ['MP3'];

        this.vodClient = null;
        this.initializing = null;

        this.config = Object.assign({
            // 临时凭证ak
            access: '',
            // 临时凭证sk
            secret: '',
            // 临时凭证security_token
            securityToken: '',
            // 项目ID
            projectId: '',
            // 终端节点Endpoint
            vodServer: '',
            // 终端节点Endpoint端口号，默认值为空
            vodPort: '',
            
            // 开始上传
            onUploadstarted: (assetInfo) => {
                this.log('upload_start', {
                    assetInfo
                });

                const events = this.eventMap[assetInfo.assetId];
                console.log('events', events, this.eventMap, assetInfo)
                events.onUploadstarted && events.onUploadstarted(assetInfo);
            },
            // 合并段成功
            onUploadSucceed: (assetInfo) => {
                this.log('upload_succeed', {
                    assetInfo
                });

                const events = this.eventMap[assetInfo.assetId];
                events.onUploadSucceed && events.onUploadSucceed(assetInfo);
                delete this.eventMap[assetInfo.assetId];
            },
            // 上传失败
            onUploadFailed: (assetInfo, errorData) => {
                this.log('upload_error', {
                    assetInfo,
                    errorData
                });

                const events = this.eventMap[assetInfo.assetId];
                events.onUploadFailed && events.onUploadFailed(assetInfo);
                delete this.eventMap[assetInfo.assetId];
            },
            // 上传进度
            onUploadProgress: (assetInfo) => {
                const events = this.eventMap[assetInfo.assetId];
                events.onUploadProgress && events.onUploadProgress(assetInfo);
            },
            // 凭证超时过期
            onUploadTokenExpired: () => this.refreshAuth(),
        }, otherOpt);
    }

    log (eventType, eventData) {
        console.log(`huawei_upload_event ${eventType} :`, eventData);

        if (typeof _qla === 'undefined') { 
            return false;
        }

        let dataStr = eventData;

        if (eventData instanceof Object) {
            dataStr = JSON.stringify(eventData);
        }

        _qla('event', {
            category: 'huawei_upload_event',
            eventType,
            data: dataStr
        });
    }

    // 初始化
    async init () {
        if (typeof VodClient === 'undefined') {
            // await Promise.all([
            //     requestQueue.script('https://static.qianliaowang.com/components/jquery/jquery-3.3.1.min.js'),
            //     requestQueue.script('https://static.qianliaowang.com/components/huawei-upload/moment.min.js'), // 一定要先于 moment-timezone-with-data 不然会报错
            // ]);
            // await Promise.all([
            //     requestQueue.script('https://static.qianliaowang.com/components/huawei-upload/moment-timezone-with-data.min.js'),
            //     requestQueue.script('https://static.qianliaowang.com/components/huawei-upload/hmac-sha256.js'),
            // ]);
            // await Promise.all([
            //     requestQueue.script('https://static.qianliaowang.com/components/huawei-upload/signer.js'),
            //     requestQueue.script('https://static.qianliaowang.com/components/huawei-upload/js-vod-sdk.min.js')
            // ]);

            await Promise.all([
                requestQueue.script('https://static.qianliaowang.com/components/huawei-upload/2024-08-16/jquery-3.7.1.min.js'),
                requestQueue.script('https://static.qianliaowang.com/components/huawei-upload/2024-08-16/hmac-sha256.js'),
                requestQueue.script('https://static.qianliaowang.com/components/huawei-upload/2024-08-16/signer.js'),
                requestQueue.script('https://static.qianliaowang.com/components/huawei-upload/2024-08-16/js-vod-sdk.min.js'),
            ]).catch(err => {
                throw new Error('VodClient init fail');
            });
        }

        console.log('VodClient', VodClient);

        await this.getUploadAuth().then(data => data && Object.assign(this.config, {
            access: data.ak,
            secret: data.sk,
            securityToken: data.token
        }));

        //构建vodClient实例 
        this.vodClient = new VodClient(this.config);
    }

    getUploadAuth () {
        return requestQueue.post({
            url: "/h5/common/hwVideoAuth"
        }, ['data']);
    }

    // 更新上传凭证
    refreshAuth () {
        this.getUploadAuth().then(data => data && this.vodClient.resumeUploadWithAuth(data.ak, data.sk, data.token));
    }

    // 获取上传地址
    getUploadAddress (file, liveId, type) {
        const fileType = extname(file.name).toLocaleUpperCase().replace('.', '');

        console.log('fileType', fileType, this.UploadTypeMap.includes(fileType))
        if (type === 'video') {
            if (!this.UploadTypeMap.includes(fileType)) {
                throw('该视频格式不支持上传');
            }
        }
        if (type === 'audio') {
            if (!this.UploadAudioTypeMap.includes(fileType)) {
                throw('该音频格式不支持上传');
            }
        }

        return requestQueue.post({
            url: "/h5/common/createHwVodAsset",
            body: { liveId, fileName: file.name, fileType }
        }, ['data']).then(data => {
            const {
                videoId,
                projectId,
                endPoint,
                vod_port,
                bucket,
                location,
                object
            } = data || {};

            // 获取到项目Id 或 有新的项目Id 则更新配置
            if (projectId && this.config.projectId !== projectId) {
                Object.assign(this.config, {
                    projectId: projectId,
                    vodServer: endPoint,
                    vodPort: vod_port
                });
            }

            return {
                videoFile: file,
                bucket,
                location,
                object,
                assetId: videoId,
                partSize: 10
            }
        });
    }

    // 上传音频
    async uploadAudio (file, liveId, events) {
        try {
            const uploadAdd = await this.getUploadAddress(file, liveId, 'audio');
            
            this.log('upload_ready', { assetId: uploadAdd.assetId });
            
            this.eventMap[uploadAdd.assetId] = events;

            if (!this.vodClient) {
                if (!this.initializing) {
                    this.initializing = this.init();
                }

                await this.initializing;
            }

            console.log('listAssets', this.vodClient.listAssets())

            this.vodClient.addAsset(uploadAdd);
            this.vodClient.startUpload();

            return uploadAdd.assetId;
        } catch (err) {
            console.error(err);
            message.error(err.message);
            this.log('catch_error', err && err.message || err);
        }
    }

    // 上传视频
    async uploadVideo (file, liveId, events) {
        try {
            const uploadAdd = await this.getUploadAddress(file, liveId, 'video');
            
            this.log('upload_ready', { assetId: uploadAdd.assetId });
            
            this.eventMap[uploadAdd.assetId] = events;

            if (!this.vodClient) {
                if (!this.initializing) {
                    this.initializing = this.init();
                }

                await this.initializing;
            }

            console.log('listAssets', this.vodClient.listAssets())

            this.vodClient.addAsset(uploadAdd);
            this.vodClient.startUpload();

            return uploadAdd.assetId;
        } catch (err) {
            console.error(err);
            message.error(err.message);
            this.log('catch_error', err && err.message || err);
        }
    }

    // 暂停上传
    pauseUpload (assetId) {
        const idx = this.getAssetIndex(assetId);

        console.log('暂停上传', assetId, idx, this.vodClient.listAssets())

        if (idx === -1) {
            return false;
        }

        this.log('upload_pause', { assetId });

        this.vodClient.cancelUpload(idx);
    }
    // 恢复上传
    restartUpload (assetId) {
        const idx = this.getAssetIndex(assetId);

        if (idx === -1) {
            return false;
        }

        this.log('upload_restart', { assetId });

        this.vodClient.restartUpload(idx);
    }
    // 停止上传
    stopUpload (assetId) {
        const idx = this.getAssetIndex(assetId);

        if (idx === -1) {
            return false;
        }

        this.log('upload_stop', { assetId });

        this.vodClient.cancelUpload(idx);
        this.vodClient.delListsAsset(idx);
    }

    getAssetIndex (assetId) {
        if (!assetId) {
            return -1;
        }

        const assetInfo = this.vodClient.listAssets().find(assetInfo => assetInfo.assetId === assetId);

        return assetInfo ? assetInfo.index : -1;
    }
}

const upload = new HuaWeiUpload();

class ClientUpload {
    constructor (opt = {}) {
        this.events = {
            onUploadstarted: opt.onUploadstarted,
            onUploadSucceed: opt.onUploadSucceed,
            onUploadFailed: opt.onUploadFailed,
            onUploadProgress: opt.onUploadProgress
        }

        this.assetId = undefined;
    }

    // 上传视频
    async uploadVideo (file, liveId) {
        this.assetId = await upload.uploadVideo(file, liveId, this.events);
    }
    // 上传音频
    async uploadAudio (file, liveId) {
        this.assetId = await upload.uploadAudio(file, liveId, this.events);
    }

    // 暂停上传
    pauseUpload () { this.assetId && upload.pauseUpload(this.assetId); }
    // 恢复上传
    restartUpload () { this.assetId && upload.restartUpload(this.assetId); }
    // 停止上传
    stopUpload () { this.assetId && upload.stopUpload(this.assetId); }
}

export default ClientUpload;