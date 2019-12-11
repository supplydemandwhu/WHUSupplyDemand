const app = getApp()

Page({

  data: {
    openid: '',
    productID: 0,

    title: "",

    categoryInd: 0,
    category: [{ name: "待选择", id: 0 }, { name: "旧书", id: 1 }, { name: "二手车", id: 2 }, { name: "工具", id: 3 },  { name: "宿舍用品", id: 4 }, { name: "零食", id: 5 }, { name: "生活用品", id: 6 }, { name: "拼车", id: 7 }, { name: "跑腿", id: 8 }, { name: "打印", id: 9 }, { name: "活动", id: 10 }, { name: "其他", id: 11 }],

    info: "",

    imagePaths: [], //本机图片地址
    cloudPaths: [], //云端图片地址
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
        userInfo: {
          avatarUrl: '',
          nickName: ''
        },

        title: that.data.title,
        typeId: that.data.categoryInd,
        message: that.data.info,
        images: that.data.cloudPaths,
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
    if (that.data.imagePaths.length < 3) {
      wx.chooseImage({
        count: 3 - that.data.imagePaths.length, //count含义 此次上传的最多图片数
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function (photo) {          //detail中包含的可能还有编辑页面下回显的图片，detailNew中包含的只有所选择的图片  ？？？    

          // 加载黑框
          wx.showLoading({
            title: '上传中',
          })

          let imagePaths = that.data.imagePaths;
          let cloudPaths = that.data.cloudPaths;
          var tot = that.data.tot;

          for (var i = 0; i < photo.tempFilePaths.length; i++) {
            // 临时文件路径？
            const filePath = photo.tempFilePaths[i]
            // 上传图片 my-image.{文件扩展名}
            const cloudPath = that.data.openid + '/' + that.data.timeStamp + '/image' + tot + filePath.match(/\.[^.]+?$/)[0]
            ++tot
            imagePaths.push(filePath)
            cloudPaths.push(cloudPath)
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
            imagePaths: imagePaths,
            cloudPaths: cloudPaths,
            tot: tot,
          })

        }
      })
    }
    else wx.showToast({ title: '限制选择3个文件', icon: 'none', duration: 1000 })
  },

  // 放弃上传图片   
  deleteImvDetail: function (e) {
    var that = this;
    var imagePaths = that.data.imagePaths;
    var cloudPaths = that.data.cloudPaths;
    var itemIndex = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示', content: '确定放弃上传这张图片？',
      success(res) {
        if (res.confirm) {
          imagePaths.splice(itemIndex, 1);
          cloudPaths.splice(itemIndex, 1);
          that.setData({
            imagePaths: imagePaths,
            cloudPaths: cloudPaths,
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