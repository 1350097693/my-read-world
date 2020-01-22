import * as ActionTypes from '../actions'
import merge from 'lodash/merge'
import paginate from './paginate'
import {combineReducers} from 'redux'

//更新实体缓存，以响应具有response.entities的任何操作。
const entities = (state={users:{},repos:{}},action) =>{
    if(action.response && action.response.entities){
        return merge({},state,action.response.entities)
    }
    return state
}

//更新错误消息以通知有关失败的提取
const errorMessage = (state = null,action) => {
    const{type,error}=action

    if(type === ActionTypes.RESET_ERROR_MESSAGE){
        return null
    }else if(error){
        return error
    }

    return state
}

//更新不同动作的分页数据
const pagination =combineReducers({
    starredByUser:paginate({
        mapActionToKey:action => action.login,
        types:[
            ActionTypes.STARRED_REQUEST,
            ActionTypes.STARRED_SUCCESS,
            ActionTypes.STARRED_FAILURE
        ]
    }),
    stargazersByRepo:paginate({
        mapActionToKey:action => action.fullName,
        types:[
            ActionTypes.STARGAZERS_REQUEST,
            ActionTypes.STARGAZERS_SUCCESS,
            ActionTypes.STARGAZERS_FAILURE
        ]
    })
})

const rootReducer = combineReducers({
    entities,
    pagination,
    errorMessage,
})

export default rootReducer