import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {

        videoAdShow: 1,

    },

    onLoad: function(options) {
        let _this = this;
        this.getuserScoreInfo();
        wx.getSystemInfo({
            success(res) {
                console.log(res);
                if (res.system.slice(0, 3) == 'iOS') {
                    _this.setData({
                        huiyuanhide: 1,
                    })
                }
            }
        });

        // 激励广告
        this.videoAd = null;
        if (wx.createRewardedVideoAd) {
            this.videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-2e26b10a522cfcef'
            })
            this.videoAd.onLoad(() => { })
            this.videoAd.onError((err) => {
                _this.setData({
                    videoAdShow: 0,
                })
            });
            this.videoAd.onClose(res => {
                // 用户点击了【关闭广告】按钮
                if (res && res.isEnded) {
                    //完整观看
                    _this.addScore()
                } else {
                    util.toast('需要完整观看视频哦~')
                }
            })
        };
        
    },

    onShow: function() {},


    onShareAppMessage: function() {
        return util.shareObj
    },

    //观看广告
    adShow: function() {
        let _this = this;
        util.loding()
        if (this.videoAd) {
            this.videoAd.show().then(() => wx.hideLoading()).catch(() => {
                // 失败重试
                this.videoAd.load()
                    .then(() => this.videoAd.show())
                    .catch(err => {
                        util.toast('今天观看广告次数已耗尽~')
                        console.log('激励视频 广告显示失败')
                    })
            });
            
        }
    },

    //得到积分
    getuserScoreInfo: function() {
        let _this = this;
        let getuserScoreUrl = loginApi.domin + '/home/index/getuserinfos';
        loginApi.requestUrl(_this, getuserScoreUrl, "POST", {
            'uid': wx.getStorageSync('u_id'),
            'openid': wx.getStorageSync('user_openID'),
        }, function(res) {
            if (res.status == 1) {
                _this.setData({
                    userScore: res.userinfo.integral
                });
            }
        })
    },

    gotoVip: function() {
        wx.navigateTo({
            url: `/pages/vipHome/vipHome`,
        })
    },

    addScore: function() {
        util.loding('正在领取积分')
        let _this = this;
        let addScoreUrl = loginApi.domin + '/home/index/video_plus';
        loginApi.requestUrl(_this, addScoreUrl, "POST", {
            'uid': wx.getStorageSync('u_id'),
        }, function(res) {
            if (res.status == 1) {
                _this.setData({
                    userScore: res.integral
                });
                util.toast('积分领取成功')
            }
        })
    },

    formSubmit: function(e) {
        util.formSubmit(app, e);
    },
})