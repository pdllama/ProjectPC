import {createSelector, createDraftSafeSelector} from '@reduxjs/toolkit'

const selectCollectionList = (state) => {
    return state.collectionState.collection
}

const selectSelectedCol = (state) => {
    return state
}

export const selectLinkedColIdx = (state) => {
    return state.collectionState.linkedSelectedIdx
}

const selectId = (state, id) => {
    return id
}

const selectGen = (state, gen) => {
    return gen
}

const selectType = (state, type) => {
    return type
}

const selectLoaderData = (state, loaderData) => {
    return loaderData
}

const selectLinkedCols = (state) => {
    return state.collectionState.linkedCollections
}

const selectBasicOrFullInfo = (state, infoLevel) => {
    //basic or full
    //basic tells you _id, gen, type, and main
    return infoLevel ? infoLevel : 'full'
}

export const selectCorrectOpList = (state) => {
    const path = state.collectionState ? state.collectionState : state
    if (path.linkedSelectedIdx === 0) {
        return path.collection
    } else {
        return path.subList
    }
}

export const selectLinkedOnhandList = (state) => {
    if (state.collectionState.linkedSelectedIdx === 0) {
        return state.collectionState.onhand
    } else {
        return state.collectionState.linkedCollections[state.collectionState.linkedSelectedIdx].onHand
    }
}

export const selectNestedKeyInLcArray = (state, path) => {
    return state.collectionState.linkedCollections[state.collectionState.linkedSelectedIdx][path]
}

// export const selectSpecificLinkedCol = createSelector(selectLinkedCols, selectLinkedColIdx, selectBasicOrFullInfo, selectId, selectGen, selectType, (cols, idx, infoLevel, id, gen, type) => {
//     return infoLevel === 'basic' ? cols === undefined ? {_id: id, gen, type} : cols.map(c => {return {_id: c._id, gen: c.gen, type: c.type, main: c.main}})[idx] : cols[idx]
// })

export const selectBasicColData = createSelector(selectLinkedCols, selectLinkedColIdx, selectLoaderData, (cols, idx, lD) => {
    return cols === undefined ? {_id: lD._id, gen: lD.gen, type: lD.type, main: idx === 0} : {_id: cols[idx]._id, gen: cols[idx].gen, type: cols[idx].type, main: idx === 0}
})

export const selectAllLinkedCols = createSelector(selectLinkedCols, selectBasicOrFullInfo, (cols, infoLevel) => {
    return infoLevel === 'basic' ? cols === undefined ? cols : cols.map(c => {return {_id: c._id, gen: c.gen, type: c.type, main: c.main}}) : cols
})

// export const selectShowCollectionData = createSelector(selectLinkedCols, selectLinkedColIdx, selectId, selectGen, selectType, (cols, idx, id, gen, type) => {
//     return {
//         linkedSelectedIdx: idx,
//         linkedCollections: cols === undefined ? cols : cols.map(c => {return {_id: c._id, gen: c.gen, type: c.type, main: c.main}}),
//         currentCollectionInfo: cols === undefined ? {_id: id, gen, type, main: idx === 0} : cols.map(c => {return {_id: c._id, gen: c.gen, type: c.type, main: c.main}})[idx]
//     }
// })

export const selectLinkedColId = createSelector(selectLinkedCols, selectLinkedColIdx, selectId, (cols, idx, fallbackId) => {
    return cols === undefined ? fallbackId : cols[idx]._id
})

export const selectLinkedColGen = createSelector(selectLinkedCols, selectLinkedColIdx, selectGen, (cols, idx, fallbackGen) => {
    return cols === undefined ? fallbackGen : cols[idx].gen
})

export const selectLinkedColType = createSelector(selectLinkedCols, selectLinkedColIdx, selectType, (cols, idx, fallbackType) => {
    return cols === undefined ? fallbackType :cols[idx].type
})

export const selectActiveLists = createSelector(selectCorrectOpList, selectLinkedOnhandList, (list, onhand) => {
    return {ownedPokemon: list, onHand: onhand}
})

export const selectIfHasLinkedCols = (state) => {
    return state.collectionState.linkedCollections.length !== 0
}



// export const select