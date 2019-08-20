import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {},

    onLoad: function(options) {
        console.log(options);
        if (options && options.picUrl) {
            this.picUrl = options.picUrl;
            this.mubanId = options.mubanId;
            this.shareImg = options.imgurl;
            this.generatePoster();
        };
    },

    onShow: function() {},


    onShareAppMessage: function() {
        return {
            title: '@你，大家一起来制图~',
            path: `/pages/index/index?mubanId=${this.mubanId}&imgurl=${this.shareImg}`,
            imageUrl: this.data.posterUrl
        }
    },

    formSubmit: function(e) {
        util.formSubmit(app, e);
    },

    //生成海报
    generatePoster: function() {
        util.loding('全速生成中')
        let _this = this;
        let generatePosterUrl = loginApi.domin + '/home/index/shengchengtutie';
        loginApi.requestUrl(_this, generatePosterUrl, "POST", {
            "imgurl": this.picUrl,
            'id': this.mubanId,
        }, function(res) {
            if (res.status == 1) {
                _this.setData({
                    posterUrl: res.path,
                });
                wx.hideLoading();
            }
        })
    },

    bindload: function() {

    },

    // 上传图片
    shangchuan: function() {
        let _this = this;
        util.upLoadImage("shangchuan", "image", 1, this, loginApi, function(data) {
            _this.picUrl = data.imgurl;
            _this.generatePoster();
        });
    },

    // 点击保存图片
    uploadImage: function() {
        let _this = this;
        let src = this.data.posterUrl;
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
})