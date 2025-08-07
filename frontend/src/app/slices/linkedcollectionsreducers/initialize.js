import initializeLinkedCollectionDisplay from "./initializelistdisplay"
import displayOnHandByPokemon from "../../../../utils/functions/display/displayonhandbypokemon"
import { collectionsFiltersInit, onhandFiltersInit } from "../reducers/displayreducers"

export const initializeLinkedEditPage = (state, action) => {
    const id = action.payload.sub ? action.payload.sub : action.payload._id
    state.linkedSelectedIdx = action.payload.linkedCollections.findIndex(c => c._id === id)+1
    state.linkedCollections = [{
        _id: action.payload._id, 
        gen: action.payload.gen,
        name: action.payload.name,
        type: action.payload.type,
        main: true,
        onHand: action.payload.onHand,
        options: action.payload.options
    }, ...action.payload.linkedCollections]

    const mainList = state.linkedSelectedIdx === 0

    state.collection = action.payload.ownedPokemon
    state.subList = mainList ? [] : initializeLinkedCollectionDisplay(state.linkedCollections[state.linkedSelectedIdx].ownedPokemon, action.payload.ownedPokemon, state.linkedCollections[state.linkedSelectedIdx].gen)
    if (state.listDisplay.collection.length === 0) {
        if (mainList) {
            state.listDisplay.collection = action.payload.ownedPokemon.filter(p => !p.disabled)
        } else {
            state.listDisplay.collection = state.subList
        }
    }
    state.onhand = mainList ? action.payload.onHand : state.linkedCollections[state.linkedSelectedIdx].onHand
    if (state.listDisplay.onhand.length === 0) {
        // state.listDisplay.onhand = action.payload.onHand
        if (state.listDisplay.onhandView === 'byPokemon') {state.listDisplay.onhand = displayOnHandByPokemon(state.onhand, action.payload.ownedPokemon)}
        else { state.listDisplay.onhand = state.onhand }
    }


    state.options = {...state.linkedCollections[state.linkedSelectedIdx].options, collectionName: state.linkedCollections[state.linkedSelectedIdx].name}
    state.availableGamesInfo = action.payload.availableGamesInfo
    if (!mainList) {state.eggMoveInfo = state.linkedCollections[state.linkedSelectedIdx].eggMoveInfo}
    return state
}

export const initializeSwitchedCollections = (state) => {
    const newList = state.linkedCollections[state.linkedSelectedIdx]
    if (newList.main) {
        state.listDisplay.collection = state.collection.filter(p => p.disabled === undefined)
        state.onhand = newList.onHand
        state.listDisplay.onhand = state.listDisplay.onhandView = 'byIndividual' ? state.onhand : displayOnHandByPokemon(state.onhand, state.collection)
        state.options = {...newList.options, collectionName: newList.name}
    } else {
        state.subList = initializeLinkedCollectionDisplay(newList.ownedPokemon, state.collection, newList.gen)
        state.listDisplay.collection = state.subList
        state.onhand = newList.onHand
        state.listDisplay.onhand = state.listDisplay.onhandView = 'byIndividual' ? state.onhand : displayOnHandByPokemon(state.onhand, state.collection)
        if (newList.eggMoveInfo) {
            state.eggMoveInfo = newList.eggMoveInfo
        }
        state.options = {...newList.options, collectionName: newList.name} 
    }
    resetFilters(state)
}

export const resetFilters = (state, specificList) => {
    state.listDisplay.showFullSets = true
    state.listDisplay.showEmptySets = true
    state.listDisplay.filterSearchTerm = ''
    if (specificList) {
        if (specificList === 'collection') {
            state.listDisplay.collectionFilters = {sort: '', filters: collectionsFiltersInit}
        } else {
            state.listDisplay.onhandFilters = {sort: '', filters: onhandFiltersInit}
        }
    } else {
        state.listDisplay.collectionFilters = {sort: '', filters: collectionsFiltersInit}
        state.listDisplay.onhandFilters = {sort: '', filters: onhandFiltersInit}
    }
}