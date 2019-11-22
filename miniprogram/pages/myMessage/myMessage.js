// pages/myMessage/myMessage.js

const app = getApp()

Page({

  data: {
    userInfo: {
      avatarUrl: '/images/user-unlogin.png',
    },
    logged: false,
    openid: '',
    queryResult: '',
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh: function () {


  // },

  // loadMyMessage: function () {

  // },


  onLoad: function (options) {

    if (app.globalData.openid) {

      this.setData({
        openid: app.globalData.openid,
        userInfo: app.globalData.userInfo,
      })

    }
  },

  onQuery: function () {
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('message').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        this.setData({
          queryResult: res.data
        })
        console.log('[数据库] [查询记录] 成功: ', res, this.data.openid)
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
  /*bindFormSubmit: function (e) {
    console.log(e.detail.value.textarea)
  }*/

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        // avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
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
})
