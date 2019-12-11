const app = getApp()

Page({
  data: {

    message: {},
    filePaths: [], /* 下载到本地的图片地址 */
    myComment: '',
    commentId: -1,
  },

  onLoad: function (options) {
    var message = JSON.parse(options.Message);
    console.log(message)

    this.setData({
      message: message
    })
    console.log(message)

    /**下载消息附图 */
    var filePaths = [];
    for(var i=0; i<message.images.length; i++){
      console.log(message.images[i])
      wx.cloud.downloadFile({
        fileID: 'cloud://develop-nh3tw.6465-develop-nh3tw-1300589715/' + message.images[i], // 文件 ID
        success: res => {
          // 返回临时文件路径
          // console.log('cloud://develop-nh3tw.6465-develop-nh3tw-1300589715/')
          console.log('tmp ' + res.tempFilePath)
          filePaths.push(res.tempFilePath)
          this.setData({
            filePaths: filePaths,
          })
        },
        fail: console.error
      })
    }
    console.log(this.data.filePaths)

  },

  //标题变化
  titleBlur(e) {
    this.setData({
      myComment: e.detail.value,
      commentId: e.currentTarget.dataset.id,
    })
  },

  sendComment(e) {
    const myComment = this.data.myComment
    if (myComment=="") return
    const db = wx.cloud.database()
    var commentsSection = this.data.message.commentsSection
    const commentId = this.data.commentId

    if(commentId==-1){
      commentsSection.push({
        comments: [{
          message: myComment,
        }],
      })
    } else {
      commentsSection[commentId].comments.push({
        message: myComment,
      })
    }

    console.log(commentsSection)

    db.collection('message').doc(this.data.message._id).update({
      data: {
        commentsSection: commentsSection
      },
      success: res => {
        let message = this.data.message;
        message.commentsSection = commentsSection
        this.setData({
          message: message
        })
      },
      fail: err => {
        icon: 'none',
        console.error('[数据库] [更新记录] 失败：', err)
      }
    })
  }
})