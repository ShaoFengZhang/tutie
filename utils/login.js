const domin = "https://duanju.58100.com"; //线上域名
const srcDomin = domin; //资源域名
const checkUserUrl = `${domin}/home/index/getuserinfo`;
// const checkUserUrl = `${domin}/home/index/newinfo`;

let loginNum = 0;
let checkuserNum = 0;

// 登录promise
const wxlogin = function(app) {

    const promise = new Promise(function(resolve, reject) {
        wx.login({
            success: res => {
                wx.request({
                    url: `${domin}/home/index/dologin`,
                    method: "POST",
                    header: {
                        'content-type': 'application/x-www-form-urlencoded',
                        'Accept': '+json',
                    },
                    data: {
                        code: res.code
                    },
                    success: function(value) {
                        if (value.data.status == 1) {
                            app.globalData.session_key = value.data.session_key;
                            wx.setStorageSync('user_openID', value.data.openid);
                            wx.setStorageSync('u_id', value.data.uid);
                            wx.setStorageSync('ifnewUser', value.data.newuser);
                            getSettingfnc(app);
                            console.log(value, "login");
                            resolve(value);
                        } else {
                            loginNum++;
                            if (loginNum >= 3) {
                                loginNum = 0;
                                return
                            }
                            wxlogin(app);
                        }
                    }
                });
            }
        });
    });
    return promise;
}

// 登录服务器
const loginServer = function(resolve, res, app) {
    wx.request({
        url: `${domin}/home/index/dologin`,
        method: "POST",
        header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept': '+json',
        },
        data: {
            code: res.code
        },
        success: function(value) {
            if (value.data.status == 1) {
                app.globalData.session_key = value.data.session_key;
                wx.setStorageSync('user_openID', value.data.openid);
                wx.setStorageSync('u_id', value.data.uid);
                console.log(value, "login");
                resolve(value);
            } else {
                loginNum++;
                if (loginNum >= 3) {
                    loginNum = 0;
                    return
                }
                wxlogin(app);
            }
        }
    });
}

// 获取用户信息
const getSettingfnc = (app) => {
    wx.getSetting({
        success: res => {
            if (res.authSetting['scope.userInfo']) {
                wx.getUserInfo({
                    lang: "zh_CN",
                    success: res => {
                        let iv = res.iv;
                        let encryptedData = res.encryptedData;
                        let session_key = app.globalData.session_key;
                        app.globalData.userInfo = res.userInfo;
                        checkUserInfo(app, res, iv, encryptedData, session_key);
                        if (app.userInfoReadyCallback) {
                            app.userInfoReadyCallback(res);
                        }
                    }
                })
            }
        }
    })
};

// 存储用户信息
const checkUserInfo = (app, res, iv, encryptedData, session_key,cb) => {
    if (wx.getStorageSync('rawData') != res.rawData) {
        wx.setStorage({
            key: "rawData",
            data: res.rawData
        })
        requestUrl(app, checkUserUrl, "POST", {
            // rowData: res.rawData,
            // openid: wx.getStorageSync('user_openID'),
            iv: iv,
            encryptedData: encryptedData,
            seesion_key: session_key,
            uid: wx.getStorageSync('u_id'),
        }, function(data) {
            console.log('checkUser', data);
            if(cb){
                cb();
            }
            //失败重新登录
            if (data.status != 1) {
                checkuserNum++;
                if (checkuserNum >= 3) {
                    checkuserNum = 0;
                    return;
                }
                wxlogin(app);
            }
        });
    }
};

// requestURL封装
const requestUrl = (app, url, method, data, cb) => {
    // wx.showLoading({
    //     title: 'Loading',
    //     mask: true,
    // });
    wx.request({
        url: url,
        header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept': '+json',
        },
        data: data,
        method: method,
        success: function(resdata) {
            wx.hideLoading();
            // console.log(url, resdata);
            app.netBlock = 0;
            cb(resdata.data);
        },
        fali: function(res) {
            wx.hideLoading();
            console.log("requestFali", res)
            wx.showModal({
                title: '提示',
                content: '请求失败,请稍后再试',
                showCancel: false,
                success: function(res) {
                    wx.switchTab({
                        url: '/pages/index/index'
                    })
                }
            })
        },
        complete: function(res) {
            if (!res.statusCode) {
                app.netBlock++;
                wx.hideLoading();
                console.log("app.netBlock", app.netBlock)
                if (app.netBlock < 3) {
                    requestUrl(app, url, method, data, cb)
                } else {
                    app.netBlock = 0;
                    wx.showModal({
                        title: '提示',
                        content: '网络异常,请稍后再试',
                        showCancel: false,
                        success: function(res) {
                            wx.switchTab({
                                url: '/pages/index/index'
                            })
                        }
                    })
                }

            };
            if (res.statusCode == 500) {
                wx.showModal({
                    title: '提示',
                    content: '服务器抛锚了,请稍后再试',
                    showCancel: false,
                    success: function(res) {
                        wx.switchTab({
                            url: '/pages/index/index'
                        })
                    }
                })
            }
        }
    })
};

module.exports = {
    domin: domin,
    wxlogin: wxlogin,
    getSettingfnc: getSettingfnc,
    requestUrl: requestUrl,
    checkUserInfo: checkUserInfo,
    srcDomin: srcDomin,
};