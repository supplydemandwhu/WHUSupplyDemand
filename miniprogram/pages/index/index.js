//index.js
const app = getApp()

Page({
  data: {
    userInfo: {
      avatarUrl: '/images/user-unlogin.png',
    },
    logged: false,
    openid: '',
    kind: -1,
    queryResult: '',
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 调用云函数 获取openId
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => { // 调用成功
        // 输出日志
        console.log('[云函数] [login] user openid: ', res.result.openid)
        // 全局数据 openid
        app.globalData.openid = res.result.openid
      },
      fail: err => { // 调用失败
        // 输出错误
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    }),
    
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

  goToIndex: function (param) {
    wx.navigateTo({ url: '../index/index', });
  },
  goToSendMessage: function (param) {
    wx.navigateTo({ url: '../sendMessage/sendMessage', });
  },
  goToMyMessage: function (param) {
    wx.navigateTo({ url: '../myMessage/myMessage', });
  },
  onGetUserInfo: function(e) {
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

  getSupply: function () {
    // 获取交易消息
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('message').get({
      success: res => {
        this.setData({
          queryResult: res.data,
        })
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })

    this.setData({
      kind: 0,
    })
  },

  getDemand: function () {
    // 获取交易消息
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('message').get({
      success: res => {
        this.setData({
          queryResult: res.data,
        })
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })

    this.setData({
      kind: 1,
    })
  },

})
