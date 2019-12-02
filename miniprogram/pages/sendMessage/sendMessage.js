const app = getApp()

Page({

  data: {
    openid: '',
    productID: 0,

    title: "",

    categoryInd: 0,
    category: [{ name: "待选择", id: 0 }, { name: "旧书", id: 1 }, { name: "二手车", id: 2 }],

    info: "",
    
    detail: [], //详情图片
    checkUp: true, //判断从编辑页面进来是否需要上传图片

    isSupply: true,

    timeStamp: 0,
    tot: 0,
  },

  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid,
        productID: options.productID,
        timeStamp: new Date().getTime(),
      })
    }
  },

  //标题变化
  titleBlur(e) {
    this.setData({
      title: e.detail.value
    })
  },

  //分类变化
  category(e) {
    this.setData({
      categoryInd: e.detail.value
    })
  },

  //详细内容变化
  infoBlur(e) {
    this.setData({
      info: e.detail.value
    })
  },

  /**发布提交 */
  formSubmit(e) {
    let that = this
    if (e.detail.value.title === "") { wx.showToast({ title: '请输入标题', icon: "none", duration: 1000, mask: true, }) }
    else if (e.detail.value.title.length > 20) { wx.showToast({ title: '标题不得大于20字', icon: "none", duration: 1000, mask: true, }) }
    else if (that.data.categoryInd === 0) { wx.showToast({ title: '请选择商品类别', icon: "none", duration: 1000, mask: true, }) }
    else if (e.detail.value.info === "") {
      wx.showToast({ title: '请输入详细内容', icon: "none", duration: 1000, mask: true, })
    }
    else {
      wx.showModal({
        title: '提示', content: '确定发布商品', success(res) {
          if (res.confirm) {
            that.sureRelease(e); //发布
          }
        }
      })
    }
  },


  /**确认发布 */
  sureRelease(e) {
    let that = this

    const db = wx.cloud.database()
    db.collection('message').add({
      data: {
        isSupply: that.data.isSupply,
        isInProgress: true,
        isHidden: false,
        type: that.data.categoryInd,

        userInfo: {
          avatarUrl: '',
          nickName: ''
        },
        message: that.data.info,
        images: that.data.detail,
        commentsSection: []
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


  //选择上传图片
  chooseDetail: function () {
    var that = this; 
    if (that.data.detail.length < 3) {
      wx.chooseImage({
        count: 3 - that.data.detail.length , //count含义？
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function (photo) {          //detail中包含的可能还有编辑页面下回显的图片，detailNew中包含的只有所选择的图片  ？？？    

          // 加载黑框
          wx.showLoading({
            title: '上传中',
          })

          let detail = that.data.detail;
          var tot = that.data.tot;

          for (var i = 0; i < photo.tempFilePaths.length; i++){
            // 临时文件路径？
            const filePath = photo.tempFilePaths[i]
            // 上传图片 my-image.{文件扩展名}
            const cloudPath = that.data.openid + '/' + that.data.timeStamp + '/image' + tot + filePath.match(/\.[^.]+?$/)[0]
            ++tot
            detail.push(cloudPath)
            wx.cloud.uploadFile({
              cloudPath,
              filePath,
              success: res => {
                console.log('[上传文件] 成功：', res)
              },
              fail: e => {
                console.error('[上传文件] 失败：', e)
                wx.showToast({
                  icon: 'none',
                  title: '上传失败',
                })
              },
              complete: () => {
                wx.hideLoading()
              }
            })

          }

          that.setData({
            detail: detail,
            tot: tot,
          })
          
        }
      })
    }
    else wx.showToast({ title: '限制选择3个文件', icon: 'none', duration: 1000 })
  },

  // 删除图片detail   
  deleteImvDetail: function (e) {
    var that = this;
    var detail = that.data.detail;
    var itemIndex = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示', content: '确定放弃上传这张图片？',
      success(res) {
        if (res.confirm) {
          detail.splice(itemIndex, 1);
          that.setData({ 
            detail: detail 
          })
        }
      }
    })
  },


  /** 查看大图Detail */
  showImageDetail: function (e) {
    var detail = this.data.detail;
    var itemIndex = e.currentTarget.dataset.id;
    wx.previewImage({
      current: detail[itemIndex], // 当前显示图片的http链接      
      urls: detail // 需要预览的图片http链接列表   
    })
  },

  // 改变供需
  isSupplyChange: function (e) {
    this.setData({
      isSupply: e.detail.value == "supply"
    })
  },

})