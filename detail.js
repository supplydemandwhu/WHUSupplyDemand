
Page({

  data: {

    // 对象

    detail: {},

  },



  onLoad: function (options) {

    var that = this

    // 字符串转json

    var info = JSON.parse(options.Mesgs);

    console.log(info)



    that.setData({

      // 把从index页面获取到的属性值赋给详情页的detail，供详情页使用

      detail: info

    })



  }

})




