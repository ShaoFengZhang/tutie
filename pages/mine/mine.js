import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        serverArr: [{
                'icon': '/assets/app/jifeng.png',
                'title': '我的积分',
                'path': '',
            },
            {
                'icon': '/assets/app/shoucang.png',
                'title': '我的收藏',
                'path': '',
            },
            {
                'icon': '/assets/app/guanzhu.png',
                'title': '我的关注',
                'path': '',
            },
            {
                'icon': '/assets/app/bangzhu.png',
                'title': '帮助与反馈',
                'path': '',
            },
        ]
    },

    onLoad: function(options) {

    },

    onShow: function() {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        }
    },


    onShareAppMessage: function() {
        return util.shareObj
    },


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
            _this.getMyDate();
        });
    },


    pageNav: function(e) {
        let navPath = e.currentTarget.dataset.path;
        wx.navigateTo({
            url: `${navPath}`,
        })
    },


    formSubmit: function(e) {
        util.formSubmit(app, e);
    },
})