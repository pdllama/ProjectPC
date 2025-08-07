import {createSlice} from '@reduxjs/toolkit'
import { changeList } from './editmode'
import { setListDisplayInitialState } from './collectionstate'
import { fetchCollectionData } from './collectionstate'

const searchParams = createSlice({
    name: 'searchParams',
    initialState: {},
    reducers: {
        addParams: (state, action) => {
            const {key, value} = action.payload
            state[key] = value
            return state
        },
        removeParam: (state, action) => {
            delete state[action.payload]
            return state
        }
    },
    extraReducers: (builder) => {
        builder
            // .addCase(changeList, (state, action) => {
            //     const {param, paramValue, removeParam, removeAllParams} = action.payload
            //     if (removeAllParams) {
            //         return {}
            //     } else {
            //         if (removeParam) {
            //             delete state[param]
            //             return state
            //         } else {
            //             state[param] = paramValue
            //             return state
            //         }
            //     }
            // })
            .addCase(setListDisplayInitialState, (state, action) => {
                const {subListInit} = action.payload
                if (subListInit) {
                    return {col: subListInit}
                } else {return {}}
            })
            .addCase(fetchCollectionData.fulfilled, (state, action) => {
                const {sub} = action.payload
                if (sub) {
                    return {col: sub}
                } else {return {}}
            })
    }
})

export const {addParams, removeParam} = searchParams.actions

export default searchParams