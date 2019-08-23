import login from './login.js';

const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/')

};

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
};

const shareObj = {
    title: "@你，给你留了一段话，快来看看吧~",
    path: `/pages/index/index?uid=${wx.getStorageSync("u_id")}&type=2`,
    imageUrl: `/assets/shareimg/img.png`
}

const loding = function(args) {
    wx.showLoading({
        title: args ? `${args}` : "加载中",
        mask: true,
    })
}

const toast = function(ags, time) {
    wx.showToast({
        title: `${ags}`,
        icon: "none",
        duration: time ? time : 1600,
        mask: true,
    });
};

const check = function(value) {
    let strValue = value.replace(/\n/g, '');
    // console.log(strValue);
    // console.log(javaTrim(strValue)=="")
    if (javaTrim(strValue) == "") {
        return false;
    } else {
        return true;
    }
};

const javaTrim = function(str) {
    for (var i = 0;
        (str.charAt(i) == ' ') && i < str.length; i++);
    if (i == str.length) return ''; //whole string is space
    var newstr = str.substr(i);
    for (var i = newstr.length - 1; newstr.charAt(i) == ' ' && i >= 0; i--);
    newstr = newstr.substr(0, i + 1);
    return newstr;
}

const upLoadImage = function(urlName, name, count, that, loginApi, cb) {
    const _this = that;
    wx.chooseImage({
        count: count,
        sizeType: ['compressed'],
        sourceType: ['album'],
        success: function(res) {
            wx.showToast({
                title: '正在上传...',
                icon: 'loading',
                mask: true,
                duration: 10000
            });
            let tempFilePaths = res.tempFilePaths;
            let upImgCount = tempFilePaths.length;
            let hasCount = 0;
            for (let i = 0; i < upImgCount; i++) {
                console.log(tempFilePaths[i])
                wx.uploadFile({
                    url: loginApi.domin + '/home/index/' + urlName,
                    filePath: tempFilePaths[i],
                    name: name,
                    formData: {

                    },
                    header: {
                        "Content-Type": "multipart/form-data"
                    },
                    success: function(res) {
                        if (res.data) {
                            let data = JSON.parse(res.data);
                            if (data.status == 1) {
                                hasCount++;
                                cb(data);
                                if (hasCount == upImgCount) {
                                    wx.hideToast();
                                }
                            } else {
                                wx.hideToast();
                                wx.showModal({
                                    title: '错误提示',
                                    content: '上传图片失败',
                                    showCancel: false,
                                    success: function(res) {}
                                });
                                return;
                            }
                        } else {
                            wx.hideToast();
                            wx.showModal({
                                title: '错误提示',
                                content: '上传图片失败',
                                showCancel: false,
                                success: function(res) {}
                            });
                            return;
                        }


                    },
                    fail: function(res) {
                        wx.hideToast();
                        wx.showModal({
                            title: '错误提示',
                            content: '上传图片请求失败',
                            showCancel: false,
                            success: function(res) {}
                        })
                    }
                });
            }

        }
    });
};

// 距离现在最近的时间在前边
const dateArrStort = function(data, p) {
    // data 时间数组 p时间key值
    for (let i = 0; i < data.length - 1; i++) {
        for (j = 0; j < data.length - 1 - i; j++) {
            console.log(Date.parse(data[j][p]));
            if (data[j][p] < data[j + 1][p]) {
                let temp = data[j];
                data[j] = data[j + 1];
                data[j + 1] = temp;

            }

        }

    }
    return data;
};

const formSubmit = function(app, e) {
    console.log(1212121, e.detail.formId);
    let _this = this;
    let collectFormIdUrl = login.domin + '/home/index/formid';
    if (e.detail.formId == 'the formId is a mock one') {
        return;
    }
    let form_id = e.detail.formId;
    let data = {
        openid: wx.getStorageSync('user_openID'),
        formid: form_id,
        uid: wx.getStorageSync('u_id'),
    };

    login.requestUrl(app, collectFormIdUrl, "POST", data, function(res) {
        console.log("???????")
    })
};

//生成时间戳
const createTimeStamp = function() {
    return parseInt(new Date().getTime() / 1000) + ''
};

/* 随机字符串 */
const randomString = function(){
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; //默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
    var maxPos = chars.length;
    var pwd = '';
    for (var i = 0; i < 32; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

// 获取xml节点信息
const getXMLNodeValue=function (node_name, xml) {
    var tmp = xml.split("<" + node_name + ">")
    var _tmp = tmp[1].split("</" + node_name + ">")
    return _tmp[0]
}


module.exports = {
    formatTime: formatTime,
    formatNumber: formatNumber,
    loding: loding,
    toast: toast,
    upLoadImage: upLoadImage,
    dateArrStort: dateArrStort,
    check: check,
    shareObj: shareObj,
    formSubmit: formSubmit,
    javaTrim: javaTrim,
    createTimeStamp: createTimeStamp,
    randomString: randomString,
    getXMLNodeValue: getXMLNodeValue,
}