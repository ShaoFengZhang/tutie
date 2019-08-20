import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        srcDomin: loginApi.srcDomin,
        classArr:[
            {
                title:'节日祝福',
                icon:'/assets/app/jiericlass.png',
                id:1,
                color:'(255,0,104,0.3)'
            },
            {
                title: '日签制作',
                icon: '/assets/app/riqianclass.png',
                id: 1,
                color: '(19,197,81,0.3)'
            },
            {
                title: '励志海报',
                icon: '/assets/app/lizhiclass.png',
                id: 1,
                color: '(0,156,255,0.3)'
            },
        ],
        apiHaveLoad: 1,
        contentArr:[],
    },

    onLoad: function(options) {
        let _this = this;
        this.page = 1;
        this.rows = 9;
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

        loginApi.wxlogin(app).then(function (value) {
        })

        this.getContent();

        if (options && options.mubanId){
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

    // 点击分类
    categoryClick: function(e) {
        let {
            id,
            index
        } = e.currentTarget.dataset;
        console.log(id)
        if (index == this.data.nowCategoryIndex) {
            return;
        };
        this.page = 1;
        this.rows = 4;
        this.cangetData = true;
        this.setData({
            nowCategoryIndex: index,
            classType: id,
            contentArr: [],
            ifloadtxt: 0,
        });
        this.getContent(this.data.classType);
    },

    // 加载上一页
    onPullDownRefresh: function() {
        console.log("onPullDownRefresh")
        let _this = this;
        this.page = 1;
        this.setData({
            contentArr: [],
        })
        this.getContent(this.data.classType);
        wx.stopPullDownRefresh();
    },

    // 加载下一页
    onReachBottom: function() {
        if (this.cangetData) {
            this.page++;
            clearTimeout(this.bottomTime);
            this.bottomTime = setTimeout(() => {
                this.getContent(this.data.classType);
            }, 1000)
        }
    },

    catchtap: function() {},

    // 收集formid
    formSubmit: function(e) {
        util.formSubmit(app, e);
    },

    // 上传图片
    shangchuan:function(){
        let _this = this;
        util.upLoadImage("shangchuan", "image", 1, this, loginApi, function (data) {
            wx.navigateTo({
                url: `/pages/results/results?picUrl=${data.imgurl}&mubanId=${_this.data.contentArr[0].id}&imgurl=${_this.data.contentArr[0].xiaotu_url}`,
            })
        });
    },

    //跳转making
    gotomaking:function(e){
        let index=e.currentTarget.dataset.index;
        wx.navigateTo({
            url: `/pages/making/making?mubanId=${this.data.contentArr[index].id}&imgurl=${this.data.contentArr[index].xiaotu_url}`,
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
        let getContentUrl = loginApi.domin + '/home/index/meituindex';
        loginApi.requestUrl(_this, getContentUrl, "POST", {
            page: this.page,
            len: this.rows,
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
                // for (let i = 0; i < res.contents.length; i++) {
                //     if (i < res.collection.length) {
                //         if (res.collection[i].contentid == res.contents[i].id) {
                //             res.contents[i].havcollection = true;
                //         }
                //     }

                // }
                // res.type.type = "class";
                // res.contents.splice(5, 0, res.type)
                _this.setData({
                    contentArr: _this.data.contentArr.concat(res.contents),
                    apiHaveLoad: 1,
                });
                if (_this.navdetail) {
                    _this.navdetail = false;
                    wx.navigateTo({
                        url: `/pages/details/details?contentid=${_this.contentId}&typeid=${_this.contypeid}`,
                    })
                }

            }
        })
    },

    //获取分类
    getClass: function() {
        this.setData({
            classArr: [{
                id: "",
                title: '推荐',
            }]
        })
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

})