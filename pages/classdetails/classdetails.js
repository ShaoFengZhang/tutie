import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {

    },

    onLoad: function (options) {

    },

    onShow: function () {
    },


    onShareAppMessage: function () {
        return util.shareObj
    },

    pageNav: function (e) {
        let navPath = e.currentTarget.dataset.path;
        wx.navigateTo({
            url: `${navPath}`,
        })
    },


    formSubmit: function (e) {
        util.formSubmit(app, e);
    },
})