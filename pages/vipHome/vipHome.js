import loginApi from '../../utils/login.js'
import util from '../../utils/util.js'
import MD5 from '../../utils/md5.js'
const app = getApp();

Page({

    data: {
        vipPriceArr:[

            {
                title: "半年会员",
                nowprice: 9.9,
                // nowprice: 0.01,
                oriprice: 49,
                type: 188,
            },

            {
                title: "月会员",
                nowprice: 2.9,
                // nowprice: 0.01,
                oriprice: 9.9,
                type: 30,
            },

            {
                title: "年会员",
                nowprice: 19.9,
                // nowprice: 0.01,
                oriprice: 109,
                type:365,
            },
        ],
        nowIndex:0,    
    },

    onLoad: function (options) {
    },

    onShow: function () {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        }
    },


    onShareAppMessage: function () {
        return util.shareObj
    },

    formSubmit: function (e) {
        util.formSubmit(app, e);
    },

    changeCard:function(e){
        let {index}=e.currentTarget.dataset;
        if (index == this.data.nowIndex){
            return;
        };
        this.setData({
            nowIndex: index,
        })
    },

    openVIP:function(){
        let index = this.data.nowIndex;
        let bodyname = this.data.vipPriceArr[index].title;
        let price = this.data.vipPriceArr[index].nowprice;
        this.unitedPayRequest(bodyname, price);
    },

    /*统一支付接口*/
    unitedPayRequest: function (bodyname,price) {
        var _this = this;
        //统一支付签名
        var openid = wx.getStorageSync("user_openID");
        var appid = 'wx0b214ca08babc1a3';//appid必填
        var body = bodyname;//商品名必填
        var mch_id = '1542149431';//商户号必填
        var nonce_str = util.randomString();//随机字符串，不长于32位。  
        var notify_url = 'https://duanju.58100.com/home/index/yibu';//通知地址必填
        var total_fee = parseInt(price*100); //价格，这是一分钱
        var trade_type = "JSAPI";
        var key = '45b3OoEhyk4vxqbPGxGJHjbYNOozXH6N'; //商户key必填，在商户后台获得
        var out_trade_no = wx.getStorageSync("u_id") + util.createTimeStamp(); //自定义订单号必填

        var unifiedPayment = 'appid=' + appid + '&body=' + body + '&mch_id=' + mch_id + '&nonce_str=' + nonce_str + '&notify_url=' + notify_url + '&openid=' + openid + '&out_trade_no=' + out_trade_no + '&total_fee=' + total_fee + '&trade_type=' + trade_type + '&key=' + key;
        console.log("unifiedPayment", unifiedPayment);
        var sign = MD5.md5(unifiedPayment).toUpperCase();
        console.log("签名md5", sign);

        //封装统一支付xml参数
        var formData = "<xml>";
        formData += "<appid>" + appid + "</appid>";
        formData += "<body>" + body + "</body>";
        formData += "<mch_id>" + mch_id + "</mch_id>";
        formData += "<nonce_str>" + nonce_str + "</nonce_str>";
        formData += "<notify_url>" + notify_url + "</notify_url>";
        formData += "<openid>" + openid + "</openid>";
        formData += "<out_trade_no>" + out_trade_no + "</out_trade_no>";
        formData += "<total_fee>" + total_fee + "</total_fee>";
        formData += "<trade_type>" + trade_type + "</trade_type>";
        formData += "<sign>" + sign + "</sign>";
        formData += "</xml>";
        console.log("formData", formData);
        //统一支付
        wx.request({
            url: 'https://api.mch.weixin.qq.com/pay/unifiedorder', //别忘了把api.mch.weixin.qq.com域名加入小程序request白名单，这个目前可以加
            method: 'POST',
            head: 'application/x-www-form-urlencoded',
            data: formData, //设置请求的 header
            success: function (res) {
                console.log("返回商户", res.data);
                var result_code = util.getXMLNodeValue('result_code', res.data.toString("utf-8"));
                var resultCode = result_code.split('[')[2].split(']')[0];
                if (resultCode == 'FAIL') {
                    var err_code_des = util.getXMLNodeValue('err_code_des', res.data.toString("utf-8"));
                    var errDes = err_code_des.split('[')[2].split(']')[0];
                    wx.showToast({
                        title: errDes,
                        icon: 'none',
                        duration: 3000
                    })
                } else {
                    //发起支付
                    var prepay_id = util.getXMLNodeValue('prepay_id', res.data.toString("utf-8"));
                    var tmp = prepay_id.split('[');
                    var tmp1 = tmp[2].split(']');
                    //签名  
                    var key = '45b3OoEhyk4vxqbPGxGJHjbYNOozXH6N';//商户key必填，在商户后台获得
                    var appId = 'wx0b214ca08babc1a3';//appid必填
                    var timeStamp = util.createTimeStamp();
                    var nonceStr = util.randomString();
                    var stringSignTemp = "appId=" + appId + "&nonceStr=" + nonceStr + "&package=prepay_id=" + tmp1[0] + "&signType=MD5&timeStamp=" + timeStamp + "&key=" + key;
                    console.log("签名字符串", stringSignTemp);
                    var sign = MD5.md5(stringSignTemp).toUpperCase();
                    console.log("签名", sign);
                    var param = { "timeStamp": timeStamp, "package": 'prepay_id=' + tmp1[0], "paySign": sign, "signType": "MD5", "nonceStr": nonceStr }
                    console.log("param小程序支付接口参数", param);
                    _this.processPay(param,out_trade_no);
                }

            },
        })

    },

    /* 小程序支付 */
    processPay: function (param, out_trade_no) {
        let _this=this;
        wx.requestPayment({
            timeStamp: param.timeStamp,
            nonceStr: param.nonceStr,
            package: param.package,
            signType: param.signType,
            paySign: param.paySign,
            success: function (res) {
                // success
                console.log("wx.requestPayment返回信息", res);
                wx.showModal({
                    title: '支付成功',
                    content: '您将在“微信支付”官方号中收到支付凭证',
                    showCancel: false,
                    success: function (res) {
                        let index = _this.data.nowIndex;
                        if (res.confirm) {
                            _this.uploadPayInfo(_this.data.vipPriceArr[index].type, _this.data.vipPriceArr[index].nowprice, out_trade_no);
                        }
                    }
                })
            },
            fail: function (res) {
                console.log("支付失败",res);
                util.toast('支付失败')
            },
            complete: function (res) {
                console.log("支付完成(成功或失败都为完成)",res);
            }
        })
    },

    // 支付成功
    uploadPayInfo:function(type,price,orderNum){
        let _this = this;
        let uploadPayInfoUrl = loginApi.domin + '/home/index/chongzhi';
        loginApi.requestUrl(_this, uploadPayInfoUrl, "POST", {
            "type":type,
            "price":price,
            "ordersn": orderNum,
            "uid":wx.getStorageSync("u_id"),
        }, function (res) {
            if (res.status == 1) {
                wx.switchTab({
                    url: '/pages/mine/mine'
                })
            }else{
                wx.showModal({
                    title: '温馨提示',
                    content: '请联系客服电话 17130049211 或者加客服微信 bxz201809',
                    showCancel: false,
                    success: function (res) {
                        wx.switchTab({
                            url: '/pages/mine/mine'
                        })
                    }
                })
            }
        })
    }
})