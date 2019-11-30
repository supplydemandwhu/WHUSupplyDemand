const app = getApp()

Page({

  data: {
    title: "",
    info: "",
    openid: '',
    productID:0,
    //message: '',
    isSupply: true,
    categoryInd: 0,
    detail: [], //详情图片
    detailNew: [],
    category: [{ name: "旧书", id: 0 }, { name: "快递", id: 1 }], 
    detailAll: [],
    checkUp: true, //判断从编辑页面进来是否需要上传图片
    chooseViewShowDetail: true,
    params: {
      productID: 0,
      contentFile: "",
      check: false,
    },
    dis: false,
  },

  onLoad: function (options) {
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid,
        productID:options.productID,
      })
    }
  },

  titleBlur(e) {
    this.setData({
      title: e.detail.value
    })
  },

  infoBlur(e) {
    this.setData({
      info: e.detail.value
    })
  },

  category(e) {
    this.setData({
      categoryInd: e.detail.value
    })
  },

  getProductDetail() {
    let params = { openid: app.globalData.openid, productID: this.data.productID }    
    app.getReleaseProductDetail(params).then(res => {
      let product = res.data.productDetail[0]      

      if (product.detailImages.length >= 3)
      { this.setData({ chooseViewShowDetail: false }) } 
      else { this.setData({ chooseViewShowDetail: true }) } 
      this.setData({
        title: product.title, info: product.info,detail: product.detailImages, categoryInd: categoryInd })
    })
  },

/**发布提交 */  
formSubmit(e) {
    let that = this    
    if (e.detail.value.title === "") 
    { wx.showToast({ title: '请输入标题', icon: "none", duration: 1000, mask: true, }) } 
    else if (e.detail.value.title.length > 20) 
    { wx.showToast({ title: '标题不得大于20字', icon: "none", duration: 1000, mask: true, }) } 
    else if (that.data.categoryInd === -1) 
    { wx.showToast({ title: '请选择商品类别', icon: "none", duration: 1000, mask: true, }) } 
    else if (e.detail.value.info === "") {
      wx.showToast({ title: '请输入详细内容', icon: "none", duration: 1000, mask: true, })}
     else if (that.data.detail.length === 0) 
     { wx.showToast({ title: '请选择详情图片', icon: "none", duration: 1000, mask: true, }) } 
     else {
      let params = { 
        openid: app.globalData.openid, 
        productID: that.data.productID,
         title: e.detail.value.title,
        info: e.detail.value.info,
         productCategory: that.data.category[that.data.categoryInd].id, }      
  wx.showModal({
        title: '提示', content: '确定发布商品', success(res) {
          if (res.confirm) {
            if (that.data.productID != 0) {
              that.sureEdit(params); //编辑            
              } else {              that.sureRelease(params); //发布            
              }            
              that.setData({              dis: true,            })          }        }      })    }  },


  /**确认发布 */
  sureRelease(params) {
    let that = this
    app.addProduct(params).then(res => {
      that.data.params.productID = res.data.productID;
      that.data.params.contentFile = res.data.contentFile;
          for (var j = 0; j < that.data.detail.length; j++) {
            if (that.data.detail.length === j + 1) {
              that.data.params.check = true
            }
            wx.uploadFile({
              url: app.globalData.baseUrl + '/wechat/release/addProductPhoto',
              filePath: that.data.detail[j],
              name: 'detail',
              formData: {
                'parameters': JSON.stringify(that.data.params)
              },
              success: function (res) {
                if (JSON.parse(res.data).state === 1) {
                  wx.showToast({
                    title: '消息发布成功',
                    icon: "none",
                    duration: 2000,
                    mask: true,
                    success() {
                      setTimeout(function () {
                        wx.navigateBack({
                          delta: 0,
                        })
                      }, 1000);
                    }
                  })
                  }
                else {
                  wx.showToast({
                    title: '商品发布失败，请稍后再试',
                    icon: "none",
                    duration: 2000,
                    mask: true,
                    success() {
                      setTimeout(function () {
                        wx.navigateBack({
                          delta: 0,
                        })
                      }, 1000);
                    }
                  })
                }},

              fail: function (res) {
                if (JSON.parse(res.errMsg) === "request:fail socket time out timeout:6000") {
                  wx.showToast({
                    title: '请求超时，请稍后再试！',
                    icon: "none",
                    duration: 2000,
                    mask: true,
                    success() {
                      setTimeout(function () {
                        wx.navigateBack({
                          delta: 0,
                        })
                      }, 1000);
                    }
                  })
                }
              }
            })
          }
        })
      },

  /**确认编辑 */  
  sureEdit(params) {
    let that = this    
    app.addProduct(params).then(res => {
      that.data.params.productID = res.data.productID;      //判断编辑页面下是否只改变了文字数据，选择图片后checkUp为false      
      if (that.data.checkUp ) {        
        wx.showToast({          
          title: '消息修改成功',          
          icon: "none",          
          duration: 2000,          
          mask: true,          
          success() {            
            setTimeout(function() {              
              wx.navigateBack({                
                delta: 0,              })            }, 1000);          }        })      }      
                //判断编辑页面下是否改变了图片 改变了则uploadFile      
                else {           that.checkDetail();        //如果没有添加直接删除图片的话        
                if ( that.data.detailAll.length === 0) {          
                  wx.showToast({            title: '消息修改成功',            icon: "none",            duration: 2000,            mask: true,            
                  success() {              setTimeout(function() {                wx.navigateBack({                  delta: 0,                })              }, 1000);            }          })        }
        //只改变detailAll，不改变bannerAll的情况下，直接将detailAll写入数据库        
        else         
          for (var j = 0; j < that.data.detailAll.length; j++) {            
            if (that.data.detailAll.length === j + 1) {             
               that.data.params.check = true            }            
               wx.uploadFile({              
                 url: app.globalData.baseUrl + '/wechat/release/addProductPhoto',              
                 filePath: that.data.detailAll[j],              
                 name: 'detail',              
                 formData: {                
                   'parameters': JSON.stringify(that.data.params)              },              
                   success: function(res) {                
                     if (JSON.parse(res.data).state === 1) {                  
                       wx.showToast({                    
                         title: '消息修改成功',                    
                         icon: "none",                    
                         duration: 2000,                    
                         mask: true,                    
                         success() {                     
                            setTimeout(function() {                       
                               wx.navigateBack({                          
                                 delta: 0,                        })                      }, 1000);                    }                  })                } else {                  
                                   wx.showToast({                   
                                      title: '消息修改失败',                   
                                       icon: "none",                    
                                       duration: 2000,                    
                                       mask: true,                    
                                       success() {                      
                                         setTimeout(function() {                        
                                           wx.navigateBack({                          
                                             delta: 0,                        })                      }, 1000);                    }                  })                }              },              
                                             fail: function(res) {                
                                               if (JSON.parse(res.errMsg) === "request:fail socket time out timeout:6000") {                  wx.showToast({                    
                                                 title: '请求超时，请稍后再试！',                    
                                                 icon: "none",                    
                                                 duration: 2000,                    
                                                 mask: true,                    
                                                 success() {                      
                                                   setTimeout(function() {                        
                                                     wx.navigateBack({                          delta: 0,                        })                      }, 1000);                    
                  }
                })
                }
              }
            })
          }
        }
      }
          
)  },


  checkDetail(){ 
    let detail = this.data.detail    
    let detailNew = this.data.detailNew    
    let detailAll = this.data.detailAll    
    for (var i = 0; i < detail.length; i++) { 
      for (var j = 0; j < detailNew.length; j++) 
      { if (detail[i] === detailNew[j]) 
       { detailAll = detailAll.concat(detail[i])          
       this.setData({ detailAll: detailAll }) } 
       else { console.log("detail无相同") } } } },
     

chooseDetail: function () {
    var that = this; if (that.data.detail.length < 3) {
      wx.chooseImage({
        count: 3, sizeType: ['compressed'], sourceType: ['album', 'camera'], success: function (photo) {          //detail中包含的可能还有编辑页面下回显的图片，detailNew中包含的只有所选择的图片          
        let detail = that.data.detail;         
         detail = detail.concat(photo.tempFilePaths);          
         let detailNew = that.data.detailNew          
         detailNew = detailNew.concat(photo.tempFilePaths)          
         that.setData({            
           detail: detail,            
           detailNew: detailNew,            
           checkUp: false          })               
          that.chooseViewShowDetail(); 
          if (that.data.productID != 0) {
            let params = { productID: that.data.productID, index: -1, }
            app.deleteProductImage(params).then(res => {
            if (res.data.fileContent !== "") { that.data.params.contentFile = res.data.fileContent }
          })
        }
      }
    })
  }             
           else wx.showToast({        title: '限制选择3个文件',        icon: 'none',        duration: 1000      })    }  ,

// 删除图片detail   
deleteImvDetail: function(e) { 
  var that = this; 
  var detail = that.data.detail; 
  var itemIndex = e.currentTarget.dataset.id; 
  if (that.data.productID != 0) { 
    wx.showModal({ title: '提示', content: '删除不可恢复，请谨慎操作', 
    success(res) { if (res.confirm) { detail.splice(itemIndex, 1); 
    that.setData({ detail: detail, checkUp: false })           
     that.chooseViewShowDetail(); 
     let params = { productID: that.data.productID,  index: itemIndex, }            
     app.deleteProductImage(params).then(res => { 
       if (res.data.fileContent !== "" ) { that.data.params.contentFile = res.data.fileContent                
       } }) } } }) } else { detail.splice(itemIndex, 1); that.setData({ detail: detail, checkUp: false })      
       that.chooseViewShowDetail(); } },

/** 是否隐藏图片选择detail */  
chooseViewShowDetail: function() { 
  if (this.data.detail.length >= 3) { 
    his.setData({ chooseViewShowDetail: false }) } 
    else { this.setData({ chooseViewShowDetail: true }) } },
     
 /** 查看大图Detail */  
 showImageDetail: function(e) {
        var detail = this.data.detail; 
        var itemIndex = e.currentTarget.dataset.id; 
        wx.previewImage({
          current: detail[itemIndex], // 当前显示图片的http链接      
          urls: detail // 需要预览的图片http链接列表   
           })  },


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

onAdd:function(e){
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
      }})}
    })