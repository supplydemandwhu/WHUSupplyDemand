//index.js
const app = getApp()
Page({
  data: {
    typeName: ["全部", "旧书", "二手车", "工具", "宿舍用品", "零食", "生活用品", "拼车", "跑腿", "打印", "活动", "其它"],
    userInfo: {
      avatarUrl: '/images/user-unlogin.png',
    },
    logged: false,
    openid: '',
    isIndex: true,
    isSupply: -1,
    typeId: 0,
    queryResult: '',




    imgUrls: [
      '/images/1.jpg',
      '/images/2.jpg',
      '/images/5.jpg',
      '/images/3.jpg',
      '/images/4.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 500,
    circular: true,




  },

  onLoad: function () {
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
                /*this.onLoginSuccess({
                  detail:res.userInfo
                })*/
                app.globalData.userInfo = res.userInfo
              }
            })
          }
        }
      })

  },
  /*尝试传参，失败了
  onLoginSuccess(event){
    console.log(event)
    const detail=event.detail
    wx.navigateTo({
      url: `../sendMessage/sendMessage?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
      })
  },*/
  onGetUserInfo: function (e) { /*弹窗获取用户信息*/
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

  getSupply: function () {/*获得供给*/
    // 获取交易消息
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('message').where({
      isSupply: true,
    }).orderBy('createTime', 'desc').get({
      success: res => {
        this.setData({
          queryResult: res.data,
          isIndex: true,
          isSupply: true,
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

  },

  getDemand: function () { /*获得需求*/
    // 获取交易消息
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('message').where({
      isSupply: false,
    }).orderBy('createTime', 'desc').get({
      success: res => {
        this.setData({
          queryResult: res.data,
          isIndex: true,
          isSupply: false,
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

  },

  chooseType: function (e) {
    console.log(this.data)
    console.log('选择类型: ', e.currentTarget.dataset.typeid)
    // var newTypeId = e.currentTarget.id
    this.setData({
      typeId: e.currentTarget.dataset.typeid
    })
  },

  goToDetail: function (e) {
    console.log('../detail/detail?Message=' + JSON.stringify(e.currentTarget.dataset.message))
    wx.navigateTo({
      url: '../detail/detail?Message=' + JSON.stringify(e.currentTarget.dataset.message)
    })
  },

/*
  onQuery: function () { /*获得我的消息
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('message').where({
      _openid: app.globalData.openid
    }).get({
      success: res => {
        this.setData({
          queryResult: res.data
        })
        console.log('[数据库] [查询记录] 成功: ', app.globalData.openid)
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
*/

  goToIndex: function (param) { /*回到首页*/
    // 获取交易消息
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('message').where({
      isSupply: this.data.isSupply,
    }).get({
      success: res => {
        this.setData({
          queryResult: res.data,
          isIndex: true,
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

  },

  goToSendMessage: function (param) {
    wx.navigateTo({ url: '../sendMessage/sendMessage', });
  },
  goToMyMessage: function () { /**到我的消息页 */

    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('message').where({
      _openid: app.globalData.openid,
    }).get({
      success: res => {
        this.setData({
          queryResult: res.data,
          isIndex: false,
        })
        console.log('[数据库] [查询记录] 成功: ', app.globalData.openid)
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



  //删除

  todelete: function (e) {

    const index = e.currentTarget.dataset.index;
    var queryresult = this.data.queryresult;
    list.splice(index, 1); // 删除购物车列表里这个商品
    this.setData({
      queryresult: res.data
    });
    if (!queryresult.length) { // 如果购物车为空
      this.setData({
        hasList: false // 修改标识为false，显示购物车为空页面
      })
    }
    }







})