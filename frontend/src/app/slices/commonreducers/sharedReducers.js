import displayOnHandByPokemon from "../../../../utils/functions/display/displayonhandbypokemon"
import { hideFullSets } from "../../../../utils/functions/display/fullsetview"
import collection from "../collection"
import initializeLinkedCollectionDisplay from "../linkedcollectionsreducers/initializelistdisplay"
import { collectionsFiltersInit, onhandFiltersInit } from "../reducers/displayreducers"

export const setInitialState = (state, action) => {
    const extractedState = action.payload
    return state = extractedState
}

export const setIsHA = (state, action) => {
    const {idx, ball, listType, subListIdx} = action.payload
    const valuePath = listType === 'collection' ? 
        state.collection[idx].balls[ball].isHA :
        state.onhand[idx].isHA
    if (listType === 'collection') {
        state.collection[idx].balls[ball].isHA = !valuePath
        if (subListIdx) {state.subList[subListIdx].balls[ball].isHA = !valuePath}
    } else if (listType === 'onhand') {
        state.onhand[idx].isHA = !valuePath
    }
    return state
}

export const setEmCount = (state, action) => {
    const {idx, ball, listType, numEMs, subListIdx, emGen, currColGen} = action.payload
    if (listType === 'collection') {
        if (currColGen === 'home' || (subListIdx !== undefined)) {
            if (subListIdx !== undefined) {
                state.collection[idx].balls[ball].eggMoveData[currColGen].emCount = numEMs 
                state.subList[subListIdx].balls[ball].emCount = numEMs
            } else if (currColGen === 'home') {
                state.collection[idx].balls[ball].eggMoveData[emGen].emCount = numEMs 
            }
        } else {
            state.collection[idx].balls[ball].emCount = numEMs
        }
    } else if (listType === 'onhand') {
        state.onhand[idx].emCount = numEMs
    }
    return state
}

export const setEms = (state, action) => {
    const {idx, ball, listType, emName, subListIdx, emGen, currColGen} = action.payload 
    if (listType === 'collection') {
        if (currColGen === 'home' || (subListIdx !== undefined)) {
            if (subListIdx !== undefined) {
                const newEMList = state.collection[idx].balls[ball].eggMoveData[currColGen].EMs.includes(emName) ? state.collection[idx].balls[ball].eggMoveData[currColGen].EMs.filter(em => em !== emName) : [...state.collection[idx].balls[ball].eggMoveData[currColGen].EMs, emName] 
                state.collection[idx].balls[ball].eggMoveData[currColGen].EMs = newEMList
                state.subList[subListIdx].balls[ball].EMs = newEMList
                return state
            } else if (currColGen === 'home') {
                const newEMList = state.collection[idx].balls[ball].eggMoveData[emGen].EMs.includes(emName) ? state.collection[idx].balls[ball].eggMoveData[emGen].EMs.filter(em => em !== emName) : [...state.collection[idx].balls[ball].eggMoveData[emGen].EMs, emName] 
                state.collection[idx].balls[ball].eggMoveData[emGen].EMs = newEMList
                return state
            }
        } else {
             if (state.collection[idx].balls[ball].EMs.includes(emName)) {
                const newEMList = state.collection[idx].balls[ball].EMs.filter(em => em !== emName)
                state.collection[idx].balls[ball].EMs = newEMList
                return state
            } else {
                state.collection[idx].balls[ball].EMs.push(emName)
                return state
            }
        }
       
    } else if (listType === 'onhand') {
        if (state.onhand[idx].EMs.includes(emName)) {
            const newEMList = state.onhand[idx].EMs.filter(em => em !== emName)
            state.onhand[idx].EMs = newEMList
            return state
        } else {
            state.onhand[idx].EMs.push(emName)
            return state
        }
    }
}

export const deleteEms = (state, action) => {
    const {idx, ball, listType, subListIdx, emGen, currColGen} = action.payload
    if (listType === 'collection') {
        if (currColGen === 'home' || subListIdx !== undefined) {
            if (subListIdx !== undefined) {
                state.collection[idx].balls[ball].eggMoveData[currColGen].EMs = []
                state.subList[subListIdx].balls[ball].EMs = []
            } else if (currColGen === 'home') {
                state.collection[idx].balls[ball].eggMoveData[emGen].EMs = []
            }
        } else {
            state.collection[idx].balls[ball].EMs = []
        }
    } else if (listType === 'onhand') {
        state.onhand[idx].EMs = []
    }
    return state
}

export const commonReducers = {
    initializeTotalState: (state, action) => {
        state.collection = action.payload.ownedPokemon
        state.listDisplay.collection = action.payload.ownedPokemon.filter(p => !(p.disabled))

        state.onhand = action.payload.onHand
        state.listDisplay.onhand = action.payload.onHand

        state.listDisplay.collectionFilters = {sort: '', filters: collectionsFiltersInit}
        state.listDisplay.onhandFilters = {sort: '', filters: onhandFiltersInit}
        if (action.payload.eggMoveInfo) {state.eggMoveInfo = action.payload.eggMoveInfo} else {state.eggMoveInfo = {}}
        if (action.payload.availableGamesInfo) {state.availableGamesInfo = action.payload.availableGamesInfo} else {state.availableGamesInfo = {}}
        state.options = {...action.payload.options, collectionName: state.options.collectionName === '' ? action.payload.name : state.options.collectionName}
        state.demoData.gen = action.payload.gen
        return state
    },
    setListDisplayInitialState: (state, action) => {
        const {col, initOnHandView, currColUrl, subListInit} = action.payload
        const subListData = subListInit ? col.linkedCollections.filter(c => c._id === subListInit)[0] : undefined
        state.initialized = true
        state.collectionID = col._id
        state.collection = col.ownedPokemon
        state.subList = subListInit ? initializeLinkedCollectionDisplay(subListData.ownedPokemon, col.ownedPokemon, subListData.gen) : []
        state.onhand = subListInit ? subListData.onHand : col.onHand
        state.options = subListInit ? {...subListData.options, collectionName: subListData.name} : 
            {...col.options, collectionName: col.name}
        state.linkedSelectedIdx = subListInit ? col.linkedCollections.findIndex(c => c._id === subListInit)+1 : 0
        state.linkedCollections = col.linkedCollections ? [{
            _id: col._id, 
            gen: col.gen,
            name: col.name,
            type: col.type,
            main: true,
            onHand: col.onHand,
            options: col.options
        }, ...col.linkedCollections] : undefined
        if (currColUrl !== undefined && !currColUrl.includes(state.latestColId)) {
            state.listDisplay.showFullSets = true
            state.listDisplay.collection = subListInit ? state.subList : col.ownedPokemon.filter(p => !(p.disabled))
        } else {
            state.listDisplay.collection = state.listDisplay.showFullSets ? 
                subListInit ? state.subList : col.ownedPokemon.filter(p => !(p.disabled)) : 
                subListInit ? hideFullSets(state.subList) : hideFullSets(col.ownedPokemon.filter(p => !(p.disabled)))
        }

        if (initOnHandView && !(currColUrl.includes(state.latestColId))) {
            state.listDisplay.onhandView = initOnHandView
        }

        if (state.listDisplay.onhandView === 'byPokemon') {state.listDisplay.onhand = displayOnHandByPokemon(state.onhand, col.ownedPokemon)}
        else { state.listDisplay.onhand = state.onhand }
        // state.listDisplay.onhand = action.payload.onHand

        state.listDisplay.collectionFilters = {sort: '', filters: collectionsFiltersInit}
        state.listDisplay.onhandFilters = {sort: '', filters: onhandFiltersInit}
        state.latestColId = col._id
        if (subListInit) {
            if (subListData.eggMoveInfo) {state.eggMoveInfo = subListData.eggMoveInfo} else {state.eggMoveInfo = {}}
        } else {if (col.eggMoveInfo) {state.eggMoveInfo = col.eggMoveInfo} else {state.eggMoveInfo = {}}}
        if (col.availableGamesInfo) {state.availableGamesInfo = col.availableGamesInfo} else {state.availableGamesInfo = {}}
    },
    setIsHA,
    setEmCount,
    setEms,
    deleteEms
}