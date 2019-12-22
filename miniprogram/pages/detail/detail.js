import formatTime from '../../utils/formatTime.js'

const app = getApp()

Page({
  data: {

    message: {},
    filePaths: [], /* 下载到本地的图片地址 */
    myComment: '',
    commentId: -1,
    messageCloud: {},
    comments: {},
    commentLen: -1,
  },

  onLoad: function (options) {
    console.log(options)
    var message = JSON.parse(options.Message);
    console.log(message)

    this.setData({
      message: message
    })
    console.log(message)
    this._loadMessage()
  },

  _loadMessage(){
    wx.showLoading({
      title: '拼命加载中',
      mask:true,
    })
    wx.cloud.callFunction({
      name:'detail',
      data:{
        $url:'detail',
        id:this.data.message._id,
      }
    }).then((res)=>{
      let comments = res.result.commentList.data
      let len = comments.length
      for (let i=0; i<len; i++){
        comments[i].createTime = formatTime(new Date(comments[i].createTime))
      }
      this.setData({
        messageCloud : res.result.detail[0],
        comments: comments,
        commentLen: len,
      })
      console.log(this.data.commentLen)
    })
    wx.hideLoading()
  }
})