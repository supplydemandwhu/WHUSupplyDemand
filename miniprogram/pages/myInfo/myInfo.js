//index.js
const app = getApp()
Page({
  data: {
    typeName: ["全部", "旧书", "二手车", "工具", "宿舍用品", "零食", "生活用品", "拼车", "跑腿", "打印", "活动", "其它"],
    userInfo: {
      avatarUrl: '/images/user-unlogin.png',
    },
    logged: false,
    openid: '',
    isIndex: true,
    isSupply: -1,
    typeId: 0,
    queryResult: '',

  },

  onLoad: function () {
    this.onQuery()
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

      // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                console.log("已授权 直接获取用户信息")
                this.setData({
                  userInfo: res.userInfo
                })
                app.globalData.userInfo = res.userInfo
              }
            })
          }
        }
      })

  },

  onGetUserInfo: function (e) { /*弹窗获取用户信息*/
    console.log("弹窗获取信息")
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        userInfo: e.detail.userInfo,
      })
      // 传递用户信息
      app.globalData.userInfo = e.detail.userInfo
    }
  },

  chooseType: function (e) {
    console.log(this.data)
    console.log('选择类型: ', e.currentTarget.dataset.typeid)
    // var newTypeId = e.currentTarget.id
    this.setData({
      typeId: e.currentTarget.dataset.typeid
    })
  },

  goToDetail: function (e) {
    console.log('../detail/detail?Message=' + JSON.stringify(e.currentTarget.dataset.message))
    wx.navigateTo({
      url: '../detail/detail?Message=' + JSON.stringify(e.currentTarget.dataset.message)
    })
  },

  onQuery: function () { /*获得我的消息*/
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('message').where({
      _openid: app.globalData.openid
    }).orderBy('createTime', 'desc').get({
      success: res => {
        console.log(res)
        this.setData({
          queryResult: res.data
        })
        console.log('[数据库] [查询记录] 成功: ', app.globalData.openid)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  goToSendMessage: function (param) {
    wx.navigateTo({ url: '../sendMessage/sendMessage', });
  },


  //删除

  onDelete: function (e) {
    // 删除购物车列表里这个商品
    const index = e.currentTarget.dataset.index;
    var queryResult = this.data.queryResult;
    queryResult.splice(index, 1); 
    this.setData({
      queryResult: queryResult
    });
    if (!queryResult.length) { // 如果购物车为空
      this.setData({
        hasList: false // 修改标识为false，显示购物车为空页面
      })
    }

    // 删除云端数据库里这个商品
    const id = e.currentTarget.dataset.id;
    const db = wx.cloud.database()
    db.collection('message').doc(id)
    .update({
      data: {
        isHidden: true
      },
      success: function (res) {
        console.log(res.data)
      }
    })
  }


})