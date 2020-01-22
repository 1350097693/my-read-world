import {CALL_API,Schemas} from '../middleware/api'

export const USER_REQUEST ='USER_REQUEST'
export const USER_SUCCESS ='USER_SUCCESS'
export const USER_FAILURE ='USER_FAILURE'

//从Github API获取单个用户。
//依赖于../middleware/api.js 中定义的自定义API中间件
const fetchUser = login =>({
    [CALL_API]:{
        types:[USER_REQUEST,USER_SUCCESS,USER_FAILURE],
        endpoint:`users/${login}`,
        schema:Schemas.USER
    }
})

//从github API获取单个用户，除非将其缓存
//依靠Redux Thunk中间件
export const loadUser = (login,requiredFields=[]) =>(dispatch,getState) =>{
   const user=getState().entities.users[login]
   if(user && requiredFields.every(key => user.hasOwnProperty(key))){
       console.log(user.hasOwnProperty('name'))
       return null
   } 
   return dispatch(fetchUser(login))
}

export const REPO_REQUEST ='REPO_REQUEST'
export const REPO_SUCCESS ='REPO_SUCCESS'
export const REPO_FAILURE ='REPO_FAILURE'

//从Github API获取单个存储库。
//依赖于../middleware/api.js中定义的自定义API中间件。
const fetchRepo = fullName =>({
    [CALL_API]:{
        types:[REPO_REQUEST,REPO_SUCCESS,REPO_FAILURE],
        endpoint:`repos/${fullName}`,
        schema:Schemas.REPO
    }
})

//除非已缓存，否则从Github API获取单个存储库。
//依靠Redux Thunk中间件。

export const loadRepo = (fullName,requiredFields=[]) =>(dispatch,getState) =>{
    const repo =getState().entities.repo[fullName]
    if(repo && requiredFields.every(key => repo.hasOwnProperty(key))){
        return null
    }
    return dispatch(fetchRepo(fullName))
}

export const STARRED_REQUEST ='STARRED_REQUEST'
export const STARRED_SUCCESS ='STARRED_SUCCESS'
export const STARRED_FAILURE ='STARRED_FAILURE'

//获取特定用户的加星标的回购页面
//依赖于../middleware/api.js中定义的自定义API中间件。
const fetchStarred = (login,nextPageUrl) => ({
    login,
    [CALL_API]:{
        types:[STARRED_REQUEST,STARRED_SUCCESS,STARRED_FAILURE],
        endpoint:nextPageUrl,
        schema:Schemas.REPO_ARRAY
    }
})

//获取特定用户的加星标的回购页面
//判断是否缓存了页面，并且用户没有明确请求下一页
//依靠Redux Thunk中间件。
export const loadStarred = (login,nextPage) =>(dispatch,getState)=>{
    const{
        nextPageUrl=`users/${login}/starred`,
        pageCount=0
    }=getState().pagination.starredByUser[login]||{}

    if(pageCount > 0 && !nextPage){
        return null
    }
    return dispatch(fetchStarred(login,nextPageUrl))
}

export const STARGAZERS_REQUEST = 'STARGAZERS_REQUEST'
export const STARGAZERS_SUCCESS = 'STARGAZERS_SUCCESS'
export const STARGAZERS_FAILURE = 'STARGAZERS_FAILURE'

//获取特定回购的观星页面。
//依赖于../middleware/api.js中定义的自定义API中间件。
const fetchStargazers = (fullName,nextPageUrl) =>({
    fullName,
    [CALL_API]:{
        types:[STARGAZERS_REQUEST,STARGAZERS_SUCCESS,STARGAZERS_FAILURE],
        endpoint:nextPageUrl,
        schema:Schemas.USER_ARRAY
    }
}) 

//获取特定回购的观星页面。
//判断是否缓存了页面，并且用户没有明确请求下一页。
//依靠Redux Thunk中间件。

export const loadStargazers = (fullName,nextPage) =>(dispatch,getState) => {
   const {
       nextPageUrl = `repos/${fullName}/stargazers`,
       pageCount=0  
   } = getState().pagination.stargazersByRepo[fullName] || {}

   if(pageCount > 0 && !nextPage){
     return null
   }

   return dispatch(fetchStargazers(fullName,nextPageUrl))
}
 
export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'

//重置当前可见的错误信息
export const  resetErrorMessage = () =>({
    type :RESET_ERROR_MESSAGE
})