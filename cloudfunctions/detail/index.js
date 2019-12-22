// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')

const db = cloud.database()

const detailCollection = db.collection('message')
const commentCollection = db.collection('comment')

//每次最多查询100条
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('list', async (ctx, next) =>{
    let detail = await detailCollection.where({
      _id: event.id,
    }).get().then((res)=>{
      return res.data
    })
    ctx.body=detail
  })
 
  app.router('detail',async (ctx, next) => {
    let blogId = event.id
    // 详情查询
    let detail = await detailCollection.where({
      _id: blogId
    }).get().then((res) => {
      return res.data
    })
    // 评论查询
    const countResult = await detailCollection.count()
    const total = countResult.total
    let commentList = {
      data:[]
    }
    if (total > 0){
      //需要查询几次
      const batchTimes = Math.ceil(total / MAX_LIMIT)  
      const tasks = []  
    
      for(let i=0;i < batchTimes;i++){
        let promise = commentCollection.skip(i * MAX_LIMIT)
          .limit(MAX_LIMIT).where({
            blogId
          }).orderBy('createTime', 'desc').get()
        tasks.push(promise)
      }
      if (tasks.length > 0) {
        commentList = (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data)
          }
        })
      }

    }

    ctx.body = {
      commentList,
      detail,
    }

  })

  return app.serve()
}


//.limit(event.count).orderBy('createTime', 'desc').