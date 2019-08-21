import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        srcDomin: loginApi.srcDomin,
        classArr: [],
        contentArr: [],
        nowClassIndex: 0,
        apiHaveLoad: 0,
    },

    onLoad: function(options) {
        let _this = this;
        this.page = 1;
        this.rows = 10;
        this.cangetData = true;
        this.getClass();
    },

    onShow: function(options) {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        }
    },

    // 分享
    onShareAppMessage: function(e) {
        return util.shareObj
    },



    catchtap: function() {},

    // 收集formid
    formSubmit: function(e) {
        util.formSubmit(app, e);
    },

    // 点击分类
    classClick: function(e) {
        let {
            id,
            index
        } = e.currentTarget.dataset;
        if (index == this.data.nowClassIndex) {
            return;
        };
        this.page = 1;
        this.cangetData = true;
        this.setData({
            nowClassIndex: index,
            contentArr: [],
            ifloadtxt: 0,
            classTypeid:id,
            apiHaveLoad: 0,
        });
        this.getContent(id);
    },

    //加载下一页
    bindscrolltolower: function () {
        if (this.cangetData) {
            this.page++;
            clearTimeout(this.bottomTime);
            this.bottomTime = setTimeout(() => {
                this.getContent(this.data.classTypeid);
            }, 1000)
        }
    },

    //跳转making
    gotomaking: function(e) {
        let index = e.currentTarget.dataset.index;
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

    // 获取模板数据
    getContent: function(typeid) {
        let _this = this;
        let getContentUrl = loginApi.domin + '/home/index/meituindexs';
        loginApi.requestUrl(_this, getContentUrl, "POST", {
            page: this.page,
            len: this.rows,
            typeid: typeid,
        }, function(res) {
            if (res.status == 1) {
                if (res.contents.length < _this.rows) {
                    _this.cangetData = false;
                    _this.setData({
                        ifloadtxt: 0,
                    });
                } else {
                    _this.setData({
                        ifloadtxt: 1,
                    });
                }

                if (res.contents.length == 0) {
                    _this.cangetData = false;
                    _this.page == 1 ? null : _this.page--;
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
        let getClassUrl = loginApi.domin + '/home/index/meitutype';
        loginApi.requestUrl(_this, getClassUrl, "POST", {}, function(res) {
            if (res.status == 1) {
                _this.setData({
                    classArr: res.type,
                });
                _this.getContent(res.type[0].id)
            }
        })
    },

})