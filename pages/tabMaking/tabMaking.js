import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
const app = getApp();

Page({

    data: {
        srcDomin: loginApi.srcDomin,
    },

    onLoad: function (options) {
        // if (options && options.mubanId) {
        //     this.mubanId = options.mubanId;
        //     this.imgurl = options.imgurl;
        //     this.imgtype = options.type;
        //     this.setData({
        //         imgUrl: loginApi.srcDomin + '/newadmin/Uploads/' + options.imgurl,
        //         viewHeight: ((app.windowHeight + app.Bheight) * 750 / app.sysWidth - 144),
        //         imgtype: options.type,
        //     });
        // }
    },

    onTabItemTap:function(){
        this.getContent();
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
                url: `/pages/results/results?picUrl=${data.imgurl}&mubanId=${_this.mubanId}&imgurl=${_this.imgurl}`,
            })
        });
    },

    // 抠图上传图片
    cutOutshangchuan: function () {
        let _this = this;
        util.upLoadImage("uploadrenxiang", "image", 1, this, loginApi, function (data) {
            _this.cutoutimg(data.imgurl);
        });
    },

    //抠图接口
    cutoutimg: function (url) {
        util.loding('加载中')
        let _this = this;
        let cutoutimgUrl = loginApi.domin + '/home/index/koutu';
        loginApi.requestUrl(_this, cutoutimgUrl, "POST", {
            'imgurl': url,
        }, function (res) {
            if (res.status == 1) {
                wx.navigateTo({
                    url: `/pages/cutout/cutout?peopleUrl=${res.imgurl}&mubanId=${_this.mubanId}&dituimg=${_this.data.imgUrl}`,
                });
                wx.hideLoading();
            }
        })
    },

    // 获取首页数据
    getContent: function (type) {
        let _this = this;
        let getContentUrl = loginApi.domin + '/home/index/meituindexs';
        loginApi.requestUrl(_this, getContentUrl, "POST", {
            page: 1,
            len: 3,
            typeid: '',
        }, function (res) {
            if (res.status == 1) {

                let index = Math.floor(Math.random() * res.contents.length);
                let bindex = Math.floor(Math.random() * res.contents[index].content.length);

                _this.mubanId = res.contents[index].content[bindex].id;
                _this.imgurl = res.contents[index].content[bindex].xiaotu_url;
                _this.imgtype = res.contents[index].content[bindex].type;
                _this.setData({
                    imgUrl: loginApi.srcDomin + '/newadmin/Uploads/' + _this.imgurl,
                    viewHeight: ((app.windowHeight) * 750 / app.sysWidth - 144),
                    imgtype: _this.imgtype
                });


            }
        })
    },
})