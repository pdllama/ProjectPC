import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import { collectionReducers, onhandReducers } from "./reducers/listreducers";
import { listDisplayInitialState, displayReducers } from "./reducers/displayreducers";
import { optionsInitialState, optionsReducers } from "./reducers/optionsreducers";
import { commonReducers } from "./commonreducers/sharedReducers";
import displayOnHandByPokemon from "../../../utils/functions/display/displayonhandbypokemon";
import { filterList } from "../../../utils/functions/sortfilterfunctions/filterfunctions";
import { changeList, setAllData, setPosRenderOHBallData } from "./editmode";
import { hideFullSets } from "../../../utils/functions/display/fullsetview";
import { hideEmptySets } from "../../../utils/functions/display/emptysetview";
import { initializeLinkedEditPage, initializeSwitchedCollections } from "./linkedcollectionsreducers/initialize";
import { selectCorrectOpList } from "../selectors/linkedcolsselectors";
import { collectionsFiltersInit, onhandFiltersInit } from "./reducers/displayreducers";
import { resetChangesAndUninitialize } from "./editmode";
import { replace } from "react-router-redux";
import { updateExcludedBallCombos, updatePokemonScope } from "./reducers/scopereducers";

const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export const fetchCollectionData = createAsyncThunk('collection/fetchCollectionStatus', async(details) => {
    const response = await fetch(`${backendurl}/collections/${details.colId}${details.sub ? `?col=${details.sub}` : ''}`).then(res => res.json()).catch(e => {return {status: 500, name: 'Internal Server Error', message: 'We cannot communicate with our servers at the moment. Please try again later.'}})
    if (response.status) {
        return {...response, error: true}
    }
    return {...response, sub: details.sub}
})

const collectionState = createSlice({
    name: 'collectionState',
    initialState: {
        linkedCollections: undefined,
        linkedSelectedIdx: 0,
        collection: [],
        subList: [],
        onhand: [],
        eggMoveInfo: {},
        availableGamesInfo: {},
        listDisplay: listDisplayInitialState,
        options: optionsInitialState,
        demoData: {gen: ''},
        //next two are just for the initialize state wrapper in the app, so it doesnt subscribe to something it doesnt need to
        initialized: false,
        collectionID: ''
    },
    reducers: {
        initializeTotalState: commonReducers.initializeTotalState,
        setListDisplayInitialState: commonReducers.setListDisplayInitialState,
        setIsHA: commonReducers.setIsHA,
        setEmCount: commonReducers.setEmCount,
        setEms: commonReducers.setEms,
        deleteEms: commonReducers.deleteEms,

        setIsOwned: collectionReducers.setIsOwned,
        setTags: collectionReducers.setTags,
        setDefault: collectionReducers.setDefault,
        setMultipleIsOwned: collectionReducers.setMultipleIsOwned,
        setPokemonScope: updatePokemonScope, 
        setExcludedCombos: updateExcludedBallCombos,

        setBall: onhandReducers.setBall,
        setGender: onhandReducers.setGender,
        setPokemonSpecies: onhandReducers.setPokemonSpecies,
        setQty: onhandReducers.setQty,
        setEmGen: onhandReducers.setEmGen,
        setQtyByPokemon: onhandReducers.setQtyByPokemon,

        setListState: displayReducers.setListState,
        addOnHandPokemonToList: displayReducers.addOnHandPokemonToList,
        addOnHandPokemonToListByPokemon: displayReducers.addOnHandPokemonToListByPokemon,
        removeOnHandPokemonFromList: displayReducers.removeOnHandPokemonFromList,
        setSortKey: displayReducers.setSortKey,
        setFilters: displayReducers.setFilters,
        filterSearch: displayReducers.filterSearch,
        setScrollPosition: (state, action) => {
            return action.payload.onhandScrollRef ? 
            {...state, lastOnhandScrollPosition: action.payload.scrollPos, prevColId: action.payload.latestColId, } : 
            {...state, lastScrollPosition: action.payload.scrollPos, prevColId: action.payload.latestColId}
        },
        setOnHandView: displayReducers.setOnHandView,
        toggleFullSetView: displayReducers.toggleFullSetView,
        toggleEmptySetView: displayReducers.toggleEmptySetView,
        toggleAbilitiesView: (state) => {
            state.listDisplay.showHAView = !state.listDisplay.showHAView
            return state
        },
        toggleHomeEMView: displayReducers.toggleHomeEMView,
        resetFilters: (state, action) => {
            const {listType} = action.payload
            state.listDisplay[`${listType}Filters`].sort = ''
            state.listDisplay[`${listType}Filters`].filters = listType === 'collection' ? collectionsFiltersInit : onhandFiltersInit
            state.listDisplay.filterSearchTerm = ''
            if (listType === 'collection') {
                state.listDisplay.showFullSets = true
                state.listDisplay.showEmptySets = true
                state.listDisplay.collection = selectCorrectOpList(state) 
            } else {
                state.listDisplay.onhand = state.listDisplay.onhandView === 'byIndividual' ? state.onhand : displayOnHandByPokemon(state.onhand, state.collection)
            }
        },

        setRate: optionsReducers.setRate,
        setBallScope: optionsReducers.setBallScope,
        setSortingOptionsState: optionsReducers.setSortingOptionsState,
        customSortList: optionsReducers.customSortList,
        setTradePreferencesState: optionsReducers.setTradePreferencesState,
        setItemState: optionsReducers.setItemState,
        setNameState: optionsReducers.setNameState,
        setGlobalDefaultState: optionsReducers.setGlobalDefaultState,
        resetInitialized: (state, action) => {
            state.initialized = false;
            return state
        },
        resetCollectionID: (state, action) => {
            state.collectionID = ''
            return state
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCollectionData.fulfilled, (state, action) => {
                if (action.payload.status) {
                    return state
                }
                state.initialized = true
                state.collectionID = action.payload._id
                const initializeSubCollection = action.payload.sub
                if (initializeSubCollection) {
                    return initializeLinkedEditPage(state, action)
                }
                if (action.payload.linkedCollections) {
                    state.linkedCollections = [{
                        _id: action.payload._id, 
                        gen: action.payload.gen,
                        name: action.payload.name,
                        type: action.payload.type,
                        main: true,
                        onHand: action.payload.onHand,
                        options: action.payload.options
                    }, ...action.payload.linkedCollections]
                } else {
                    if (state.linkedCollections) {
                        state.linkedCollections = undefined,
                        state.linkedSelectedIdx = 0,
                        state.subList = []
                    }
                }
                state.collection = action.payload.ownedPokemon
                
                if (state.listDisplay.collection.length === 0) {state.listDisplay.collection = action.payload.ownedPokemon.filter(p => !p.disabled)}
                state.onhand = action.payload.onHand
                if (state.listDisplay.onhand.length === 0){
                    // state.listDisplay.onhand = action.payload.onHand
                    if (state.listDisplay.onhandView === 'byPokemon') {state.listDisplay.onhand = displayOnHandByPokemon(state.onhand, action.payload.ownedPokemon)}
                    else { state.listDisplay.onhand = state.onhand }
                }
                if (action.payload.eggMoveInfo) {state.eggMoveInfo = action.payload.eggMoveInfo} else {state.eggMoveInfo = {}}
                if (action.payload.availableGamesInfo) {state.availableGamesInfo = action.payload.availableGamesInfo} else {state.availableGamesInfo = {}}
                state.options = {...action.payload.options, collectionName: action.payload.name}
                return state
            })
            .addCase(changeList, (state, action) => {
                const {idx} = action.payload
                state.lastScrollPosition = undefined,
                state.lastOnhandScrollPosition = undefined
                state.listDisplay.filterSearchTerm = ''
                if (idx !== undefined) {
                    const reInitialize = idx !== state.linkedSelectedIdx
                    state.linkedSelectedIdx = idx
                    if (reInitialize) {
                        initializeSwitchedCollections(state)
                    }
                }
                return state
            })
            .addCase(setPosRenderOHBallData, (state, action) => {
                const {onhandId, noOhUpdate, newBall} = action.payload
                if (!noOhUpdate) {
                    state.onhand = state.onhand.map((p) => {
                        if (p._id === onhandId) {
                            p.ball = newBall
                        }
                        return p
                    })
                }
                return state
            })
            .addCase(setAllData, (state, action) => { //used in sw editors, which is why we use the pokemonIdx instead
                const {noOhUpdate, newBall, pokemonIdx} = action.payload
                if (!noOhUpdate) {
                    // state.onhand[pokemonIdx].ball = newBall
                    return {...state, onhand: state.onhand.map((p, idx) => idx === pokemonIdx ? {...p, ball: newBall} : p)}
                }
                return state
            })
            .addCase(resetChangesAndUninitialize, (state, action) => { 
                state.initialized = false
                return state
            })
    }
})

export const {
    initializeTotalState, setListDisplayInitialState, setIsHA, setEmCount, setEms, deleteEms,
    setIsOwned, setTags, setDefault, setMultipleIsOwned, setPokemonScope, setExcludedCombos,
    setBall, setGender, setPokemonSpecies, setQty, setEmGen, setQtyByPokemon,
    setListState, addOnHandPokemonToList, addOnHandPokemonToListByPokemon, removeOnHandPokemonFromList, setSortKey, setFilters, filterSearch, 
    setScrollPosition, setOnHandView, toggleFullSetView, toggleEmptySetView, toggleAbilitiesView, toggleHomeEMView, resetFilters,
    setRate, setBallScope, setSortingOptionsState, customSortList, setTradePreferencesState, setItemState, setNameState, setGlobalDefaultState, resetInitialized, resetCollectionID
} = collectionState.actions

export default collectionState