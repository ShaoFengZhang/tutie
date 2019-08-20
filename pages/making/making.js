import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        srcDomin: loginApi.srcDomin,
    },

    onLoad: function (options) {
        if (options && options.mubanId){
            this.mubanId = options.mubanId;
            this.setData({
                imgUrl: loginApi.srcDomin + '/newadmin/Uploads/' + options.imgurl
            })
        }
    },

    onShow: function () {
    },


    onShareAppMessage: function () {
        return util.shareObj
    },

    formSubmit: function (e) {
        util.formSubmit(app, e);
    },

    // 上传图片
    shangchuan: function () {
        let _this = this;
        util.upLoadImage("shangchuan", "image", 1, this, loginApi, function (data) {
            wx.navigateTo({
                url: `/pages/results/results?picUrl=${data.imgurl}&mubanId=${_this.mubanId}&imgurl=${_this.data.imgUrl}`,
            })
        });
    },
})