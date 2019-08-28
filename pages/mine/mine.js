import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        serverArr: [{
                'icon': '/assets/app/score.png',
                'title': '我的积分',
                'path': '',
            },
            // {
            //     'icon': '/assets/app/shoucang.png',
            //     'title': '我的收藏',
            //     'path': '',
            // },
            // {
            //     'icon': '/assets/app/guanzhu.png',
            //     'title': '我的关注',
            //     'path': '',
            // },
            // {
            //     'icon': '/assets/app/bangzhu.png',
            //     'title': '帮助与反馈',
            //     'path': '',
            // },
        ]
    },

    onLoad: function(options) {
        let _this=this;
        wx.getSystemInfo({
            success(res) {
                console.log(res);
                if (res.system.slice(0, 3) =='iOS'){
                    _this.setData({
                        huiyuanhide:1,
                    })
                }
            }
        });
    },

    onTabItemTap: function() {
        // this.getuserScore();
    },

    onShow: function() {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        }
        this.getuserScore();
    },


    onShareAppMessage: function() {
        return util.shareObj
    },

    // 获取用户授权信息
    getUserInfo: function(e) {
        console.log(e);
        let _this = this;
        if (!e.detail.userInfo) {
            util.toast("微信授权没有风险哦亲~", 1200)
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
        loginApi.checkUserInfo(app, e.detail, iv, encryptedData, session_key, function() {
           
        });
    },

    // 获取用户会员信心
    getuserScore: function() {
        let _this = this;
        let getuserScoreUrl = loginApi.domin + '/home/index/getvip';
        loginApi.requestUrl(_this, getuserScoreUrl, "POST", {
            'uid': wx.getStorageSync('u_id'),
        }, function(res) {
            if (res.status == 1) {
                _this.setData({
                    isVip: res.vip,
                    endtime: res.end.slice(0,10),
                    zhongshen: res.zhongshen,
                });
            }
        })
    },

    gotpScore: function(e) {
        wx.navigateTo({
            url: `/pages/jifen/jifen`,
        })
    },

    gotoVip: function() {
        if (this.data.huiyuanhide){
            return;
        }
        wx.navigateTo({
            url: `/pages/vipHome/vipHome`,
        })
    },


    formSubmit: function(e) {
        util.formSubmit(app, e);
    },
})