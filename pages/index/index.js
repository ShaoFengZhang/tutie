import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        srcDomin: loginApi.srcDomin,
        contentArr: [],
        ifshowrulesView: 0,
        ifshowShouCang: 1,
        nowCategoryIndex: 0,
        apiHaveLoad: 1,
        ifloadtxt: 0,
        classArr: [{
            id: "",
            title: '推荐',
        }],
        ifShowHomeView: 0,
        ifshowzhitu: 0,
    },

    onLoad: function(options) {
        this.shenghe();
        let _this = this;
        this.page = 1;
        this.rows = 4;
        this.cangetData = true;

        this.getDaySign();

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

        // 带参数二维码
        if (options && options.scene) {
            console.log('SCENE', options);
            let scene = decodeURIComponent(options.scene);
            options.conId = scene.split('&')[0];
            this.shareUid = scene.split('&')[1];
            this.checkNewFans(this.shareUid, 1)
        };

        //卡片分享
        if (options && options.cid) {
            this.contentId = options.cid;
            this.contypeid = options.contypeid
            this.navdetail = true;
        }

        loginApi.wxlogin(app).then(function(value) {
            console.log(options);
            clearTimeout(_this.timeOut);
            _this.getContent();
        }, function(error) {
            console.log("error", error);
            clearTimeout(_this.timeOut);
            if (wx.getStorageSync("u_id")) {
                _this.getContent()
            }
        })

        this.timeOut = setTimeout(() => {
            if (wx.getStorageSync("u_id") && this.data.contentArr.length == 0) {
                console.log("this.timeOut");
                _this.getContent();
            }
        }, 2200);

    },

    onShow: function(options) {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        }

        // 获取分类
        this.getClass();

        // 切换分类
        if (wx.getStorageSync('classType')) {
            this.page = 1;
            this.rows = 4;
            this.cangetData = true;
            this.setData({
                classType: wx.getStorageSync('classType'),
                nowCategoryIndex: null,
                contentArr: [],
            });
            wx.removeStorageSync('classType');
            this.getContent(this.data.classType);
        }
    },


    // 分享
    onShareAppMessage: function(e) {
        if (e.from == "menu") {
            return util.shareObj
        } else {
            let index = e.target.dataset.index;
            this.shareNum(this.data.contentArr[index].id, index)
            return {
                title: this.data.contentArr[index].title,
                path: `/pages/index/index?cid=${this.data.contentArr[index].id}&contypeid=${this.data.contentArr[index].typeid}`,
                imageUrl: this.data.contentArr[index].imgurl
            }
        }
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

    // 检查是否是新用户
    checkNewFans: function(fatherId, type) {
        if (fatherId == wx.getStorageSync("u_id") || !wx.getStorageSync("ifnewUser")) {
            return;
        }
        let _this = this;
        let checkNewFansUrl = loginApi.domin + '/home/index/newfan';
        loginApi.requestUrl(_this, checkNewFansUrl, "POST", {
            "openid": wx.getStorageSync("user_openID"),
            "uid": wx.getStorageSync("u_id"),
            "fuid": fatherId,
            "type": type ? type : "1",
            "newuser": wx.getStorageSync("ifnewUser"),
        }, function(res) {})
    },

    // 新手任务
    showbeansMask: function() {
        this.setData({
            ifshowrulesView: !this.data.ifshowrulesView
        });
    },

    formSubmit: function(e) {
        util.formSubmit(app, e);
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

    // 隐藏添加小程序
    hideShoucang: function() {
        this.setData({
            ifshowShouCang: 0,
        })
    },

    // 获取首页数据
    getContent: function(type) {
        let _this = this;
        let getContentUrl = loginApi.domin + '/home/index/newindex';
        loginApi.requestUrl(_this, getContentUrl, "POST", {
            page: this.page,
            len: this.rows,
            uid: wx.getStorageSync('u_id'),
            typeid: type ? type : '',
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
                for (let i = 0; i < res.contents.length; i++) {
                    if (i < res.collection.length) {
                        if (res.collection[i].contentid == res.contents[i].id) {
                            res.contents[i].havcollection = true;
                        }
                    }

                }
                res.type.type = "class";
                res.contents.splice(5, 0, res.type)
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

    // 收藏
    collectionFun: function(e) {
        let {
            id,
            index
        } = e.currentTarget.dataset;
        let _this = this;
        let collectionFunUrl = loginApi.domin + '/home/index/newcollection';
        loginApi.requestUrl(_this, collectionFunUrl, "POST", {
            uid: wx.getStorageSync('u_id'),
            contentid: id
        }, function(res) {
            if (res.status == 1) {
                console.log(res);
                _this.data.contentArr[index].collection++;
                _this.data.contentArr[index].havcollection = true;
                _this.setData({
                    contentArr: _this.data.contentArr
                })
            }
        })
    },

    // 取消收藏
    delcollectionFun: function(e) {
        let {
            id,
            index
        } = e.currentTarget.dataset;
        let _this = this;
        let collectionFunUrl = loginApi.domin + '/home/index/newdelcollection';
        loginApi.requestUrl(_this, collectionFunUrl, "POST", {
            uid: wx.getStorageSync('u_id'),
            contentid: id
        }, function(res) {
            if (res.status == 1) {
                console.log(res);
                _this.data.contentArr[index].collection--;
                _this.data.contentArr[index].havcollection = false;
                _this.setData({
                    contentArr: _this.data.contentArr
                })
            }
        })
    },

    // 分享次数
    shareNum: function(contentid, index) {
        let _this = this;
        let shareNumUrl = loginApi.domin + '/home/index/share';
        loginApi.requestUrl(_this, shareNumUrl, "POST", {
            contentid: contentid,
        }, function(res) {
            if (res.status == 1) {
                _this.data.contentArr[index].share++
                    _this.setData({
                        contentArr: _this.data.contentArr,
                    });
            }
        })
    },

    // 下载次数
    downloadNum: function(contentid, index) {
        let _this = this;
        let downloadNumUrl = loginApi.domin + '/home/index/download';
        loginApi.requestUrl(_this, downloadNumUrl, "POST", {
            contentid: contentid,
        }, function(res) {
            if (res.status == 1) {
                _this.data.contentArr[index].download++
                    _this.setData({
                        contentArr: _this.data.contentArr,
                    });
            }
        })
    },

    // 跳转详情页
    goToDetails: function(e) {
        let {
            id,
            typeid
        } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages/details/details?contentid=${id}&typeid=${typeid}`,
        })
    },

    // 跳转发现页
    goToFounPage: function() {
        wx.switchTab({
            url: '/pages/found/found'
        })
        this.showbeansMask();
    },

    // 跳转选择分类
    goToChangeCategory: function() {
        wx.navigateTo({
            url: '/pages/changeClass/changeClass',
        })
    },

    // 跳转个人主页
    goToUserHome: function(e) {
        let uid = e.currentTarget.dataset.uid
        wx.navigateTo({
            url: `/pages/userCenter/userCenter?uid=${uid}`,
        })
    },

    // 跳转制图
    goToZhiTu: function() {
        wx.navigateTo({
            url: '/pages/releaseHome/releaseHome',
        })
    },

    // 跳转合集
    goToCollection: function(e) {
        let id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/classDetails/classDetails?contentid=${id}`,
        })
    },

    //点击下载图片
    downloadPicture: function(e) {
        util.loding("全速下载中~")
        let _this = this;
        let {
            index
        } = e.currentTarget.dataset;
        let contentid = this.data.contentArr[index].id;
        let uid = wx.getStorageSync("u_id");

        let downloadPictureUrl = loginApi.domin + '/home/index/downloads';
        loginApi.requestUrl(_this, downloadPictureUrl, "POST", {
            contentid: contentid,
            uid: uid,
            type: 1,
        }, function(res) {
            if (res.status == 1) {
                wx.getImageInfo({
                    src: _this.data.srcDomin + res.path,
                    success(res) {
                        _this.uploadImage(res.path, index)
                    }
                });
            }
        })

    },

    // 点击下载图片
    uploadImage: function(src, index) {
        let _this = this;
        wx.hideLoading();
        wx.getSetting({
            success(res) {
                // 进行授权检测，未授权则进行弹层授权
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            _this.saveImage(src, index);
                        },
                        // 拒绝授权时
                        fail() {
                            _this.saveImage(src, index);
                        }
                    })
                } else {
                    // 已授权则直接进行保存图片
                    _this.saveImage(src, index);
                }
            },
            fail(res) {
                _this.saveImage(src, index);
            }
        })

    },

    // 保存图片
    saveImage: function(src, index) {
        let _this = this;
        wx.hideLoading();
        wx.saveImageToPhotosAlbum({
            filePath: src,
            success: function() {
                index != 'sign' ? _this.downloadNum(_this.data.contentArr[index].id, index) : null
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
                index != 'sign' ? _this.downloadNum(_this.data.contentArr[index].id, index) : null
                wx.previewImage({
                    urls: [src]
                })
            }
        })
    },

    // 点击下载图片
    drawcanvs: function(e) {
        let {
            src,
            index
        } = e.currentTarget.dataset;
        util.loding('正在下载');
        let _this = this;
        let ctx = wx.createCanvasContext('canvas');
        let canvasImg = 'https://duanju.58100.com/upload/new/3.png';
        let qrcodeimg = `https://duanju.58100.com/upload/img/mala.jpg`;
        let canTxt = '扫码生成专属图片';
        ctx.setTextBaseline('top');
        ctx.setTextAlign('left');
        ctx.setFillStyle("#999999")
        ctx.setFontSize(40);

        wx.getImageInfo({
            src: canvasImg,
            success: function(res) {
                _this.setData({
                    bgimgH: res.height,
                    bgimgW: res.width,
                });
                ctx.drawImage(res.path, 0, 0, res.width, res.height);
                wx.getImageInfo({
                    src: qrcodeimg,
                    success: function(res1) {
                        ctx.fillText(canTxt, 192, 848);
                        ctx.setFillStyle("#282828");
                        ctx.fillText(app.globalData.userInfo.nickName, 192, 792);
                        ctx.drawImage(res1.path, 582, 786, 128, 128);
                        wx.getImageInfo({
                            src: app.globalData.userInfo.avatarUrl,
                            success: function(res2) {
                                // 绘制圆形头像
                                ctx.save();
                                ctx.beginPath();
                                ctx.arc(104, 850, 64, 0, 2 * Math.PI);
                                ctx.closePath();
                                ctx.clip();
                                ctx.drawImage(res2.path, 40, 786, 128, 128);
                                ctx.restore();
                                ctx.beginPath();
                                ctx.stroke();
                                wx.getImageInfo({
                                    src: src,
                                    success(res3) {
                                        ctx.drawImage('../../assets/new/mask.png', 30, 776, 150, 150);
                                        ctx.drawImage(res3.path, 0, 0, 750, 750);
                                        ctx.draw();
                                        setTimeout(function() {
                                            _this.showOffRecord(index)
                                        }, 1200)
                                    }
                                })

                            }
                        })
                    }
                })
            }
        });
    },

    // 生成临时图片
    showOffRecord: function(index) {
        let _this = this;
        wx.canvasToTempFilePath({
            destWidth: this.data.bgimgW,
            destHeight: this.data.bgimgH,
            canvasId: 'canvas',
            success: function(res) {
                console.log(res.tempFilePath);
                _this.uploadImage(res.tempFilePath, index);
            }
        })
    },

    // 请求日签
    getDaySign: function() {
        let _this = this;
        let getDaySignUrl = loginApi.domin + '/home/index/daily';
        loginApi.requestUrl(_this, getDaySignUrl, "POST", {}, function(res) {
            if (res.status == 1) {
                if (wx.getStorageSync("sign") == res.weekimg.id) {
                    return;
                } else {
                    wx.setStorageSync("sign", res.weekimg.id)
                }
                _this.setData({
                    daySignImg: res.weekimg.pic,
                    daytime: res.date,
                    mothImg: res.monthimg.pic,
                    signid: res.weekimg.id,
                    ifShowHomeView: 1,
                });
                wx.hideTabBar();
            }
        })
    },

    // 保存日签
    saveDaySign: function() {
        let _this = this;
        util.loding("全速保存中~")
        wx.getImageInfo({
            src: this.data.daySignImg,
            success(res) {
                let src = res.path;
                _this.setData({
                    ifShowHomeView: 0,
                });
                wx.showTabBar();
                wx.getSetting({
                    success(res) {
                        // 进行授权检测，未授权则进行弹层授权
                        if (!res.authSetting['scope.writePhotosAlbum']) {
                            wx.authorize({
                                scope: 'scope.writePhotosAlbum',
                                success() {
                                    _this.saveImage(src, 'sign');
                                },
                                // 拒绝授权时
                                fail() {
                                    _this.saveImage(src, 'sign');
                                }
                            })
                        } else {
                            // 已授权则直接进行保存图片
                            _this.saveImage(src, 'sign');
                        }
                    },
                    fail(res) {
                        _this.saveImage(src, 'sign');
                    }
                })
            }
        });
    },

    saveDaySign: function() {
        util.loding("加速保存中~")
        let _this = this;
        let contentid = this.data.signid;
        let uid = wx.getStorageSync("u_id");
        let downloadPictureUrl = loginApi.domin + '/home/index/riqiandownload';
        loginApi.requestUrl(_this, downloadPictureUrl, "POST", {
            contentid: this.data.signid,
            uid: uid,
            type: 1,
        }, function(res) {
            if (res.status == 1) {
                wx.getImageInfo({
                    src: _this.data.srcDomin + res.path,
                    success(res) {
                        _this.uploadImage(res.path, 'sign');
                        _this.setData({
                            ifShowHomeView: 0,
                        });
                        wx.showTabBar();
                    }
                });
            }
        })
    },

    hideHomeView: function() {
        this.setData({
            ifShowHomeView: 0,
        });
        wx.showTabBar();
    },

    // 下载视频授权检测
    downloadVideo: function(e) {
        let {
            src,
            index
        } = e.currentTarget.dataset;
        let _this = this;
        wx.getSetting({
            success(res) {
                // 进行授权检测，未授权则进行弹层授权
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            _this.saveVideo(src, index)
                        },
                        // 拒绝授权时
                        fail() {
                            util.toast("未授权")
                        }
                    })
                } else {
                    // 已授权则直接进行保存图片
                    _this.saveVideo(src, index)
                }
            },
            fail(res) {

            }
        })

    },

    // 保存视频
    saveVideo: function(url, index) {
        let _this = this;
        wx.downloadFile({
            url: url,
            success(res) {
                if (res.statusCode === 200) {
                    console.log(res);
                    _this.downloadNum(_this.data.contentArr[index].id, index);
                    wx.showLoading({
                        title: '加速保存中',
                    })
                    wx.saveVideoToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success(res) {
                            wx.hideLoading();
                            wx.showModal({
                                title: '提示',
                                content: '视频已存入手机相册，赶快分享给好友吧',
                                showCancel: false,
                            })
                        }
                    })
                }
            }
        })
    },

    shenghe: function() {
        let _this = this;
        let shengheUrl = loginApi.domin + '/home/index/shenhe1';
        loginApi.requestUrl(_this, shengheUrl, "POST", {}, function(res) {
            if (res.status == 1) {
                if (res.type) {
                    _this.setData({
                        ifshowzhitu: 1,
                    });
                }

            }
        })
    },
})