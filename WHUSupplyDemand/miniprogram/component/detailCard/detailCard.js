// component/detailCard/detailCard.js
import formatTime from '../../utils/formatTime.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog:Object,
    createTime:String,
  },

  observers: {
    'createTime'(val){
      if (val) {
        console.log( "这是detail里的数据：" + val)
        this.setData({
          _createTime: formatTime(new Date(val))
        })
      }
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    _createTime:'',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPreviewImage(event){
      const ds = event.target.dataset
      wx.previewImage({
        urls: ds.imgs,
        current: ds.imgsrc,
      })
    }

  }
})
