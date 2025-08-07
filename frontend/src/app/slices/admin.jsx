import {createSlice} from '@reduxjs/toolkit'

const admin = createSlice({
    name: 'admin',
    initialState: {isAdmin: false}
})