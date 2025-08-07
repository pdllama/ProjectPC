import { changesReducers } from "./changesreducers"

const swColReducers = {
    setPosRenderSelectedData: (state, action) => {
        const {position, rendered, selectedBall} = action.payload
        state.swCollection.position = position
        state.swCollection.rendered = rendered
        state.selectedBall = selectedBall
        return state
    },
    setPosRenderOHBallData: (state, action) => {
        //this action triggers an extra action in collectionstate
        const {position, rendered, noOhUpdate, colId, onhandId, prevBall, newBall} = action.payload
        state.swCollection.position = position
        state.swCollection.rendered = rendered
        if (!noOhUpdate && prevBall !== newBall) {
            changesReducers.setOnhandChange(state, {type: 'editmode/setOnhandChange', payload: {colId, id: onhandId, field: 'ball', prevValue: prevBall, currValue: newBall}})
        }
    },
    setAllData: (state, action) => {
        const {position, rendered, noOhUpdate, onhandId, colId, prevBall, newBall} = action.payload
        state.swCollection.position = position
        state.swCollection.rendered = rendered
        state.selectedBall = newBall
        if (!noOhUpdate && prevBall !== newBall) {
            changesReducers.setOnhandChange(state, {type: 'editmode/setOnhandChange', payload: {colId, id: onhandId, field: 'ball', prevValue: prevBall, currValue: newBall}})
        }
    },
    setPos: (state, action) => {
        state.swCollection.position = action.payload
        return state
    },
    resetPosRenderData: (state) => {
        state.swCollection.position = 0
        state.swCollecton.rendered = []
    },
}

export default swColReducers