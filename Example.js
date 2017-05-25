const graphql = require("graphql")
const fs = require("fs")
const schema = graphql.buildSchema(fs.readFileSync("./schema.gql").toString())
const tools = require("graphql-tools")

//模拟业务逻辑
const sign = arg => {
    console.log(arg)
    return "sign  " + arg.name
}
//模拟业务逻辑
const findCouponByName = name => coupon => {
    return coupon
            .name
            .toString()
            .indexOf(name) > -1
}
//模拟业务逻辑
const getCoupon = arg => {
    return couponList.filter(findCouponByName(arg.name))
}
//模拟业务逻辑
const changeName = arg => {
    couponList = couponList.map(coupon=>coupon.name === arg.name ? coupon.name = arg.newName : coupon.name = coupon.name)
}
//模拟数据
let couponList = [
    {
        id: "asdfghfjtdfsfgh",
        name: "0000",
        coupon1Inf: "1Inf1",
        sign: sign
    }, {
        id: "asdfghfj23sfgh",
        name: "0001",
        coupon2Inf: "2Inf1",
        sign: sign
    }, {
        id: "asdfghfjtdfdsfsfgh",
        name: "0002",
        coupon2Inf: "2Inf2",
        sign: sign
    }, {
        id: "asdfghfjtsdcxdfsfgh",
        name: "0003",
        coupon1Inf: "1Inf2",
        sign: sign
    }
]


//root方法，与schema中注册的方法关联，其传入参数为包含所有参数的对象
const root = {
    *couponQuery(arg) {
        yield getCoupon(arg)
    },
    *couponUnionQuery(arg) {
        yield getCoupon(arg)
    },
    *changeCouponName(arg){
        yield changeName(arg)
    }
}
//返回interface与union时需要指定具体的实现类型
const resolver = {
    Coupon: {
        __resolveType(data, context, info) {
            if (data.coupon1Inf != null)
                return info.schema.getType('CouponType1')
            else
                return info
                    .schema
                    .getType('CouponType2')
        }
    },
    CouponUnion: {
        __resolveType(data, context, info) {
            if (data.coupon1Inf != null)
                return info.schema.getType('CouponType1')
            else
                return info
                    .schema
                    .getType('CouponType2')
        }
    }
}
tools.addResolveFunctionsToSchema(schema, resolver)

//字符串形式的查询语句
const queryString = `

query($arg1: String="argument1"){
  couponUnionQuery(name: "01", user: {userId: 111111, token: "%$#Q$%#"}) {
    ... on CouponType1 {
      coupon1Inf
      ...QueryInf
    }
    ... on CouponType2 {
      id
      coupon2Inf
      ...QueryInf
    }
  }
}
fragment QueryInf on Coupon {
  sign(name:$arg1)
}`

//字符串形式的修改语句，修改语句与查询语句的区别在于修改语句保证会一个接一个进行，查询语句不保证
const mutationString = `mutation{
  changeCouponName(name:"0000",newName:"zxcvdf")
}`

//通过graphql方法执行，依次为查询，修改，
graphql.graphql(schema, queryString, root).then(result=>console.log(JSON.stringify(result)))

graphql.graphql(schema, mutationString, root).then(console.log(couponList))

//创建一个服务器，监听8080端口
//监听8080端口
const express = require('express')
const graphqlHTTP = require('express-graphql')
const app = express()

app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
    pretty: true
}))
app.listen(8080)
