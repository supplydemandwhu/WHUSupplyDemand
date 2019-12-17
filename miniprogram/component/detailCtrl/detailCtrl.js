// component/detailCtrl/detailCtrl.js
let userInfo={}
const db=wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,

  },

  /**
   * 组件的初始数据
   */
  data: {
    //评论弹出层是否显示
    modalShow:false,
    //评论内容
    content:'',

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){
      // 获取用户信息
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            console.log("已授权")
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                userInfo= res.userInfo
                //显示评论弹出层
                this.setData({
                  modalShow:true,
                })
              }
            })
          } else {
            wx.showModal({
              title: '授权用户才能评论',
              content: '请回到首页进行授权',
            })
            }
        }
      })
    },
    onInput(event){
      this.setData({
        content: event.detail.value,
      })
    },
    onSend(){
      //评论插入数据库
      let content=this.data.content
      if (content.trim() == ''){
        wx.showModal({
          title: '评论内容不能为空',
          content: '',
        })
        return
      }
      wx.showLoading({
        title: '评价中',
        mask: true,   //不能进行其他操作
      })
      db.collection('comment').add({
        data:{
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
        }
      }).then((res)=>{
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modalShow: false,
          content: '',
        })

        //父元素刷新详情页面
        this.triggerEvent('refreshDetail')
      })
    },

  }
})
