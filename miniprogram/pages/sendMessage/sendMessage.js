// pages/sendMessage/sendMessage.js

const app = getApp()

Page({

  data: {
    openid: '',
    message: '',
    isSupply: true,
  },

  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }
  },

  onAdd: function (e) {
    const db = wx.cloud.database()
    const newMessage = e.detail.value.textarea //this.data.message
    const newIsSupply = this.data.isSupply
    db.collection('message').add({
      data: {
        message: newMessage,
        isSupply: newIsSupply
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        /*this.setData({
          counterId: res._id,
          count: 1
        })*/
        wx.showToast({
          title: '消息发布成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '消息发布失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

  isSupplyChange: function (e) {
    this.setData({
      isSupply: e.detail.value == "supply"
    })
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    console.log(this.data.isSupply)
  },

  goToSendMessage: function (param) {
    wx.navigateTo({ url: '../sendMessage/sendMessage', });
  },
  goToMyMessage: function (param) {
    wx.navigateTo({ url: '../myMessage/myMessage', });
  },
  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
})