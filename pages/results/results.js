import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        ifshowMask:0,
    },

    onLoad: function(options) {
        console.log(options);
        this.getuserScore();
        this.setData({
            // scrollHeight: (app.windowHeight + app.Bheight) * 750 / app.sysWidth - 804,
            // margintop: ((app.windowHeight) * 750 / app.sysWidth - 1126)/2,
            // margintop: ((app.windowHeight + app.Bheight) * 750 / app.sysWidth - 1126)/2,
            viewHeight: ((app.windowHeight + app.Bheight) * 750 / app.sysWidth - 144),
        });
        if (options && options.picUrl) {
            this.picUrl = options.picUrl;
            this.mubanId = options.mubanId;
            this.shareImg = options.imgurl;
            this.generatePoster();
        };

        this.videoAd = null

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
        }
    },

    onShow: function() {},


    onShareAppMessage: function() {
        return {
            title: '@你，大家一起来制图~',
            path: `/pages/index/index?mubanId=${this.mubanId}&imgurl=${this.shareImg}&uid=${wx.getStorageSync('u_id')}`,
            imageUrl: this.data.posterUrl
        }
    },

    formSubmit: function(e) {
        util.formSubmit(app, e);
    },

    //观看广告
    adShow: function () {
        let _this = this;
        if (this.videoAd) {
            this.videoAd.show().catch(() => {
                // 失败重试
                this.videoAd.load()
                    .then(() => this.videoAd.show())
                    .catch(err => {
                        console.log('激励视频 广告显示失败')
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
        }
    },

    // 加积分
    addScore: function () {
        let _this = this;
        let addScoreUrl = loginApi.domin + '/home/index/video_plus';
        loginApi.requestUrl(_this, addScoreUrl, "POST", {
            'uid': wx.getStorageSync('u_id'),
        }, function (res) {
            if (res.status == 1) {
                _this.setData({
                    userScore: res.integral,
                    ifshowMask:0,
                });
                util.toast('积分领取成功')
            }
        })
    },

    hidejsfenMask:function(){
        this.setData({
            ifshowMask:0,
        })
    },

    //生成海报
    generatePoster: function() {
        util.loding('全速生成中')
        let _this = this;
        let generatePosterUrl = loginApi.domin + '/home/index/huatu';
        loginApi.requestUrl(_this, generatePosterUrl, "POST", {
            "imgurl": this.picUrl,
            'id': this.mubanId,
            'uid':wx.getStorageSync('u_id'),
        }, function(res) {
            if (res.status == 1) {
                _this.setData({
                    posterUrl: res.path,
                    qcode: res.qcode,
                });
                _this.tongjihaibao(_this.mubanId);
                setTimeout(function(){
                    wx.hideLoading();
                },600)
            }
        })
    },

    // 获取用户会员信心
    getuserScore: function () {
        let _this = this;
        let getuserScoreUrl = loginApi.domin + '/home/index/getvip';
        loginApi.requestUrl(_this, getuserScoreUrl, "POST", {
            'uid': wx.getStorageSync('u_id'),
        }, function (res) {
            if (res.status == 1) {
                _this.setData({
                    ifVip: res.vip,
                    userScore:res.jifen,
                });
            }
        })
    },

    //减积分
    minusscore:function(){
        let _this = this;
        let addScoreUrl = loginApi.domin + '/home/index/reduce';
        loginApi.requestUrl(_this, addScoreUrl, "POST", {
            'uid': wx.getStorageSync('u_id'),
        }, function (res) {
            if (res.status == 1) {
                _this.setData({
                    userScore: res.integral
                });
                _this.uploadImage(2);
            };
            if (res.status == 2){
                util.toast('积分扣除失败/积分不足')
            }
        })
    },

    // 上传图片
    shangchuan: function() {
        let _this = this;
        util.upLoadImage("shangchuan", "image", 1, this, loginApi, function(data) {
            _this.picUrl = data.imgurl;
            _this.generatePoster();
        });
    },

    judgevip:function(){
        if (this.data.ifVip){
            this.uploadImage(1);
            return;
        };

        if (this.data.userScore>=50){
            this.minusscore();
        }else{
            this.setData({
                ifshowMask:1,
            })
        }

    },

    // 点击保存图片
    uploadImage: function(type) {
        let _this = this;
        let src = type == 1 ? this.data.posterUrl : this.data.qcode;
        wx.getSetting({
            success(res) {
                // 进行授权检测，未授权则进行弹层授权
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            _this.saveImage(src);
                        },
                        // 拒绝授权时
                        fail() {
                            _this.saveImage(src);
                        }
                    })
                } else {
                    // 已授权则直接进行保存图片
                    _this.saveImage(src);
                }
            },
            fail(res) {
                _this.saveImage(src);
            }
        })

    },

    // 保存图片
    saveImage: function(src) {
        let _this = this;

        wx.getImageInfo({
            src: src,
            success(res) {
                wx.saveImageToPhotosAlbum({
                    filePath: res.path,
                    success: function() {
                        wx.showModal({
                            title: '保存成功',
                            content: `记得分享哦~`,
                            showCancel: false,
                            success: function(data) {
                                wx.previewImage({
                                    urls: [res.path]
                                })
                            }
                        });
                    },
                    fail: function(data) {
                        wx.previewImage({
                            urls: [res.path]
                        })
                    }
                })
            }
        })

    },

    gotovip:function(){
        wx.navigateTo({
            url: `/pages/vipHome/vipHome`,
        });
        this.setData({
            ifshowMask: 0,
        })
    },

    //获取分类
    tongjihaibao: function (id) {
        let _this = this;
        let tongjihaibaoUrl = loginApi.domin + '/home/index/increasemuban';
        loginApi.requestUrl(_this, tongjihaibaoUrl, "POST", {
            'id':id,
        }, function (res) {
        })
    },
})