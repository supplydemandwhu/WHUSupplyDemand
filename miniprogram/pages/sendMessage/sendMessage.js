// pages/sendMessage/sendMessage.js

const app = getApp()

Page({

  data: {
    openid: '',
    message: ''
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
    db.collection('message').add({
      data: {
        message: newMessage
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

  /*bindFormSubmit: function (e) {
    console.log(e.detail.value.textarea)
  }*/
})