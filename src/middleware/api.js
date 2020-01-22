import { normalize,schema} from 'normalizr'
import {camelizeKeys} from 'humps'


//从Github API响应中提取下一页url。
const getNextPageUrl = response => {
    const link =response.headers.get('link')
    if(!link){
        return null
    }

    const nextLink = link.split(',').find(s => s.indexof('rel="next"') > -1)
    if(!nextLink){
        return null
    }
    return nextLink.trim().split(';')[0].slice(1,-1)
}

const API_ROOT = 'https://api.github.com/'

//提取API响应，并根据架构规范化结果JSON
//这使每个API响应都具有相同的形状，而不管嵌套如何
const callApi = (endpoint,schema) =>{
    const fullUrl =(endpoint.indexOf(API_ROOT)===-1)? API_ROOT+endpoint : endpoint

    return fetch(fullUrl)
        .then(response => response.json().then(json =>{
            if(!response.ok){
                return Promise.reject(json)
            }
            //转成驼峰命名
            const camelizedJson=camelizeKeys(json)
            const nextPageUrl = getNextPageUrl(response)

            return Object.assign({},
                normalize(camelizedJson,schema),
                {nextPageUrl}
                )
        }))
}

//我们使用此Normalizr模式从嵌套形式转换API响应
//转换为平面形式，将回购和用户放置在“实体”中，并进行嵌套
// JSON对象将替换为其ID。这很方便
//归约化器的消耗，因为我们可以轻松构建归一化树
//并在获取更多数据时保持更新。

// GitHub的API可能在查询时返回大写字母的结果
//不包含任何内容。例如，“ someuser”可能会导致“ SomeUser”
//导致冻结的UI，因为在实体中找不到“ someuser”。
//这就是为什么我们在此强制使用小写字母。
const userSchema =new schema.Entity('users',{},{
    idAttribute:user => user.login.toLowerCase()
})

const repoSchema = new schema.Entity('repos',{
    owner:userSchema
},{
    idAttribute:repo => repo.fullName.toLowerCase()
})

//Github API 响应的架构
export const Schemas = {
    USER:userSchema,
    USER_ARRAY:[userSchema],
    REPO:repoSchema,
    REPO_ARRAY:[repoSchema]
}

//带有此Redux中间件解释的API调用信息的操作键
export const CALL_API='Call API'

//一个Redux中间件，它使用指定的CALL_API信息来解释操作。
//执行呼叫并在分派此类操作时作出承诺。
export default store => next => action => {
    const callAPI=action[CALL_API]
    if(typeof callAPI ==='undefined'){
        return next(action)
    }

    let {endpoint} = callAPI
    const {schema,types} =callAPI
    
    if(typeof endpoint === 'function'){
        endpoint = endpoint(store.getState())
    }

    if(typeof endpoint !=='string'){
        throw new Error('Specify a string endpoint URL')
    }
    if(!schema){
        throw new Error('Specify one of the exported Schemas')
    }
    if(!Array.isArray(types) || types.length !==3){
        throw new Error('Expected an array of three action types')
    }
    if(!types.every(type => typeof type ==='string')){
        throw new Error('Expected action types to be strings')
    }

    const actionWith = data => {
        const finalAction =Object.assign({},action,data)
        delete finalAction[CALL_API]
        return finalAction
    }

   const [ requestType, successType, failureType ] = types
   next(actionWith({type:requestType}))

   return callApi(endpoint,schema).then(
       response => next(actionWith({
         response,
         type:successType
       })
   ),
   error => next(actionWith({
        type:failureType,
        error:error.message || 'Something bad happened'
   }))
   )
}