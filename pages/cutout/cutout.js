import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();


let index = 0,
    items = [],
    flag = true;

Page({

    data: {
        ifshowMask: 0,
        itemList: [],
    },

    onLoad: function(options) {
        let _this = this;
        this.getuserScore();
        if (options && options.peopleUrl) {
            this.mubanId = options.mubanId;
            this.setData({
                peopleUrl: options.peopleUrl,
                dituimg: options.dituimg,
            });
            items = this.data.itemList;
            this.setDropItem({
                url: options.peopleUrl
            });
        };

        this.videoAd = null;

        if (wx.createRewardedVideoAd) {
            this.videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-2e26b10a522cfcef'
            })
            this.videoAd.onLoad(() => {})
            this.videoAd.onError((err) => {
                _this.setData({
                    videoAdShow: 0,
                })
            });
        };

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
    adShow: function() {
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
    addScore: function() {
        let _this = this;
        let addScoreUrl = loginApi.domin + '/home/index/video_plus';
        loginApi.requestUrl(_this, addScoreUrl, "POST", {
            'uid': wx.getStorageSync('u_id'),
        }, function(res) {
            if (res.status == 1) {
                _this.setData({
                    userScore: res.integral,
                    ifshowMask: 0,
                });
                util.toast('积分领取成功')
            }
        })
    },

    hidejsfenMask: function() {
        this.setData({
            ifshowMask: 0,
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
            'uid': wx.getStorageSync('u_id'),
        }, function(res) {
            if (res.status == 1) {
                _this.setData({
                    posterUrl: res.path,
                    qcode: res.qcode,
                });
                _this.tongjihaibao(_this.mubanId);
                setTimeout(function() {
                    wx.hideLoading();
                }, 600)
            }
        })
    },

    // 获取用户会员信息
    getuserScore: function() {
        let _this = this;
        let getuserScoreUrl = loginApi.domin + '/home/index/getvip';
        loginApi.requestUrl(_this, getuserScoreUrl, "POST", {
            'uid': wx.getStorageSync('u_id'),
        }, function(res) {
            if (res.status == 1) {
                _this.setData({
                    ifVip: res.vip,
                    userScore: res.jifen,
                });
            }
        })
    },

    //减积分
    minusscore: function() {
        let _this = this;
        let addScoreUrl = loginApi.domin + '/home/index/reduce';
        loginApi.requestUrl(_this, addScoreUrl, "POST", {
            'uid': wx.getStorageSync('u_id'),
        }, function(res) {
            if (res.status == 1) {
                _this.setData({
                    userScore: res.integral
                });
                _this.uploadImage(2);
            };
            if (res.status == 2) {
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

    // 判断VIP
    judgevip: function() {
        if (this.data.ifVip) {
            this.uploadImage(1);
            return;
        };

        if (this.data.userScore >= 50) {
            this.minusscore();
        } else {
            this.setData({
                ifshowMask: 1,
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

    gotovip: function() {
        wx.navigateTo({
            url: `/pages/vipHome/vipHome`,
        });
        this.setData({
            ifshowMask: 0,
        })
    },

    //统计海报
    tongjihaibao: function(id) {
        let _this = this;
        let tongjihaibaoUrl = loginApi.domin + '/home/index/increasemuban';
        loginApi.requestUrl(_this, tongjihaibaoUrl, "POST", {
            'id': id,
        }, function(res) {})
    },

    // 初始化图片
    setDropItem(imgData) {
        let data = {},
            _this = this;
        wx.getImageInfo({
            src: imgData.url,
            success: res => {
                // 初始化数据
                data.width = res.width; //宽度
                data.height = res.height; //高度
                data.image = imgData.url; //地址
                data.top = 0; //top定位
                data.left = 0; //left定位
                //圆心坐标
                data.x = data.left + data.width / 2;
                data.y = data.top + data.height / 2;
                data.scale = 1; //scale缩放
                data.oScale = 1; //方向缩放
                data.rotate = 1; //旋转角度
                data.active = true; //选中状态
                console.log(data)
                items[items.length] = data;
                _this.setData({
                    itemList: items
                })
            }
        })
    },

    WraptouchStart: function(e) {

        items[index].lx = e.touches[0].clientX;
        items[index].ly = e.touches[0].clientY;

        console.log(items[index])
    },
    WraptouchMove: function(e) {
        if (flag) {
            flag = false;
            setTimeout(() => {
                flag = true;
            }, 100)
        }
        // console.log('WraptouchMove', e)
        items[index]._lx = e.touches[0].clientX;
        items[index]._ly = e.touches[0].clientY;

        items[index].left += items[index]._lx - items[index].lx;
        items[index].top += items[index]._ly - items[index].ly;
        items[index].x += items[index]._lx - items[index].lx;
        items[index].y += items[index]._ly - items[index].ly;

        items[index].lx = e.touches[0].clientX;
        items[index].ly = e.touches[0].clientY;
        console.log(items)
        this.setData({
            itemList: items
        })
    },
    oTouchStart: function(e) {
        //获取作为移动前角度的坐标
        items[index].tx = e.touches[0].clientX;
        items[index].ty = e.touches[0].clientY;
        //移动前的角度
        items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)
        //获取图片半径
        items[index].r = this.getDistancs(items[index].x, items[index].y, items[index].left, items[index].top);
        console.log(items[index])
    },
    oTouchMove: function(e) {
        if (flag) {
            flag = false;
            setTimeout(() => {
                flag = true;
            }, 100)
        }

        //记录移动后的位置
        items[index]._tx = e.touches[0].clientX;
        items[index]._ty = e.touches[0].clientY;
        //移动的点到圆心的距离
        items[index].disPtoO = this.getDistancs(items[index].x, items[index].y, items[index]._tx, items[index]._ty - 10)

        items[index].scale = items[index].disPtoO / items[index].r;
        items[index].oScale = 1 / items[index].scale;

        //移动后位置的角度
        items[index].angleNext = this.countDeg(items[index].x, items[index].y, items[index]._tx, items[index]._ty)
        //角度差
        items[index].new_rotate = items[index].angleNext - items[index].anglePre;

        //叠加的角度差
        items[index].rotate += items[index].new_rotate;
        items[index].angle = items[index].rotate; //赋值

        //用过移动后的坐标赋值为移动前坐标
        items[index].tx = e.touches[0].clientX;
        items[index].ty = e.touches[0].clientY;
        items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)

        //赋值setData渲染
        this.setData({
            itemList: items
        })
        console.log(items)
    },
    getDistancs(cx, cy, pointer_x, pointer_y) {
        var ox = pointer_x - cx;
        var oy = pointer_y - cy;
        return Math.sqrt(
            ox * ox + oy * oy
        );
    },
    /*
     *参数1和2为图片圆心坐标
     *参数3和4为手点击的坐标
     *返回值为手点击的坐标到圆心的角度
     */
    countDeg: function(cx, cy, pointer_x, pointer_y) {
        var ox = pointer_x - cx;
        var oy = pointer_y - cy;
        var to = Math.abs(ox / oy);
        var angle = Math.atan(to) / (2 * Math.PI) * 360;
        // console.log("ox.oy:", ox, oy)
        if (ox < 0 && oy < 0) //相对在左上角，第四象限，js中坐标系是从左上角开始的，这里的象限是正常坐标系  
        {
            angle = -angle;
        } else if (ox <= 0 && oy >= 0) //左下角,3象限  
        {
            angle = -(180 - angle)
        } else if (ox > 0 && oy < 0) //右上角，1象限  
        {
            angle = angle;
        } else if (ox > 0 && oy > 0) //右下角，2象限  
        {
            angle = 180 - angle;
        }
        return angle;
    },

})