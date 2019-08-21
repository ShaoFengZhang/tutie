import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        srcDomin: loginApi.srcDomin,
        contentArr:[],
    },

    onLoad: function (options) {
        let _this = this;
        this.page = 1;
        this.rows = 10;
        this.cangetData = true;


        if (options && options.typeid){
            this.typeid = options.typeid;
            this.getContent();
        }
    },

    onShow: function () {
    },

    //分享
    onShareAppMessage: function () {
        return util.shareObj
    },

    // 加载上一页
    onPullDownRefresh: function () {
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
    onReachBottom: function () {
        if (this.cangetData) {
            this.page++;
            clearTimeout(this.bottomTime);
            this.bottomTime = setTimeout(() => {
                this.getContent();
            }, 1000)
        }
    },

    // 得到数据
    getContent: function (type) {
        let _this = this;
        let getContentUrl = loginApi.domin + '/home/index/meituindexs';
        loginApi.requestUrl(_this, getContentUrl, "POST", {
            page: this.page,
            len: this.rows,
            typeid: this.typeid,
        }, function (res) {
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

    //跳转making
    gotomaking: function (e) {
        let index = e.currentTarget.dataset.index;
        wx.navigateTo({
            url: `/pages/making/making?mubanId=${this.data.contentArr[index].id}&imgurl=${this.data.contentArr[index].xiaotu_url}`,
        })
    },




    // 收集formid
    formSubmit: function (e) {
        util.formSubmit(app, e);
    },
})