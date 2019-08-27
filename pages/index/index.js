import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
import MD5 from '../../utils/md5.js'
const app = getApp();

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        srcDomin: loginApi.srcDomin,
        classArr: [{
                title: '节日祝福',
                icon: '/assets/app/jiericlass.png',
                id: '12',
            },
            {
                title: '日签制作',
                icon: '/assets/app/riqianclass.png',
                id: 13,
            },
            {
                title: '励志海报',
                icon: '/assets/app/lizhiclass.png',
                id: 14,
            },
        ],
        apiHaveLoad: 1,
        contentArr: [],
    },

    onLoad: function(options) {
        let _this = this;
        this.page = 1;
        this.rows = 3;
        this.cangetData = true;


        if (app.globalData.userInfo) {
            console.log('if');
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        } else if (this.data.canIUse) {
            console.log('elseif');
            app.userInfoReadyCallback = res => {
                console.log('index');
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                });
                app.globalData.userInfo = res.userInfo;
                let iv = res.iv;
                let encryptedData = res.encryptedData;
                let session_key = app.globalData.session_key;
                loginApi.checkUserInfo(app, res, iv, encryptedData, session_key);
            }
        } else {
            console.log('else');
            wx.getUserInfo({
                success: res => {
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    });
                    let iv = res.iv;
                    let encryptedData = res.encryptedData;
                    let session_key = app.globalData.session_key;
                    loginApi.checkUserInfo(app, res, iv, encryptedData, session_key);
                }
            })
        };

        loginApi.wxlogin(app).then(function(value) {
            if (options && options.uid) {
                _this.fenxiangAddScore(options.uid);
            }
        })

        this.getContent();

        if (options && options.mubanId) {
            wx.navigateTo({
                url: `/pages/making/making?mubanId=${options.mubanId}&imgurl=${options.imgurl}`,
            })
        }
    },

    onShow: function(options) {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        }
    },

    //处理授权信息


    // 分享
    onShareAppMessage: function(e) {
        return util.shareObj
    },

    // 加载上一页
    onPullDownRefresh: function() {
        console.log("onPullDownRefresh")
        let _this = this;
        this.page = 1;
        this.setData({
            contentArr: [],
        });
        this.cangetData = true;
        this.getContent();
        wx.stopPullDownRefresh();
    },

    // 加载下一页
    onReachBottom: function() {
        // if (this.cangetData) {
        //     this.page++;
        //     clearTimeout(this.bottomTime);
        //     this.bottomTime = setTimeout(() => {
        //         this.getContent();
        //     }, 1000)
        // }
    },

    catchtap: function() {},

    // 收集formid
    formSubmit: function(e) {
        util.formSubmit(app, e);
    },

    // 上传图片
    shangchuan: function() {
        let _this = this;
        let index = Math.floor(Math.random()*8);
        let bindex = Math.floor(Math.random()*3);
        util.upLoadImage("shangchuan", "image", 1, this, loginApi, function(data) {
            wx.navigateTo({
                url: `/pages/results/results?picUrl=${data.imgurl}&mubanId=${_this.data.contentArr[index].content[bindex].id}&imgurl=${_this.data.contentArr[index].content[bindex].xiaotu_url}`,
            })
        });
    },

    //跳转making
    gotomaking: function(e) {
        let {
            index,
            bindex
        } = e.currentTarget.dataset;
        wx.navigateTo({
            url: `/pages/making/making?mubanId=${this.data.contentArr[bindex].content[index].id}&imgurl=${this.data.contentArr[bindex].content[index].xiaotu_url}&type=${this.data.contentArr[bindex].content[index].type}`,
        })
    },

    //跳转固定分类
    checkClass: function(e) {
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/classdetails/classdetails?typeid=${id}`,
        })
    },

    //跳转全部分类页面
    gotoClassify: function() {
        wx.switchTab({
            url: `/pages/classify/classify`
        })
    },

    // 获取授权信息
    getUserInfo: function(e) {
        console.log(e);
        if (!e.detail.userInfo) {
            util.toast("我们需要您的授权哦亲~", 1200)
            return
        }
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        });
        let iv = e.detail.iv;
        let encryptedData = e.detail.encryptedData;
        let session_key = app.globalData.session_key;
        loginApi.checkUserInfo(app, e.detail, iv, encryptedData, session_key)
    },

    // 获取首页数据
    getContent: function(type) {
        let _this = this;
        let getContentUrl = loginApi.domin + '/home/index/meituindexs';
        loginApi.requestUrl(_this, getContentUrl, "POST", {
            page: this.page,
            len: this.rows,
            typeid: '',
        }, function(res) {
            if (res.status == 1) {
                if (res.contents.length < _this.rows) {
                    _this.cangetData = false;
                    _this.setData({
                        ifloadtxt: 0,
                        apiHaveLoad: 1,
                    });
                } else {
                    _this.setData({
                        ifloadtxt: 1,
                        apiHaveLoad: 1,
                    });
                }

                if (res.contents.length == 0) {
                    _this.cangetData = false;
                    _this.page == 1 ? null : _this.page--;
                    util.toast("暂无更多更新");
                    return;
                };
                _this.setData({
                    contentArr: _this.data.contentArr.concat(res.contents),
                    apiHaveLoad: 1,
                });

            }
        })
    },

    //获取分类
    getClass: function() {
        let _this = this;
        let getClassUrl = loginApi.domin + '/home/index/newtype';
        loginApi.requestUrl(_this, getClassUrl, "POST", {}, function(res) {
            if (res.status == 1) {
                _this.setData({
                    classArr: _this.data.classArr.concat(res.type.slice(0, 3)),
                });
            }
        })
    },

    // 点击下载图片
    uploadImage: function(src) {
        let _this = this;
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
        wx.saveImageToPhotosAlbum({
            filePath: src,
            success: function() {
                wx.showModal({
                    title: '保存成功',
                    content: `记得分享哦~`,
                    showCancel: false,
                    success: function(data) {
                        wx.previewImage({
                            urls: [src]
                        })
                    }
                });
            },
            fail: function(data) {
                wx.previewImage({
                    urls: [src]
                })
            }
        })
    },

    // 判断分享加积分
    fenxiangAddScore: function(fuid) {
        let _this = this;
        let fenxiangAddScoreUrl = loginApi.domin + '/home/index/newtype';
        loginApi.requestUrl(_this, fenxiangAddScoreUrl, "POST", {
            'uid': wx.getStorageSync('u_id'),
            'openid': wx.getStorageSync('user_openID'),
            'fuid': fuid,
            'newuser': wx.getStorageSync('ifnewUser')
        }, function(res) {
            if (res.status == 1) {
                _this.setData({
                    classArr: _this.data.classArr.concat(res.type.slice(0, 3)),
                });
            }
        })
    }

})