import {createSlice} from '@reduxjs/toolkit'
import swColReducers from './reducers/swreducers'
import { renderBallListDragVer, getCenterOffset } from '../../../utils/functions/renderballselection'
import { setBall, setQtyByPokemon, setOnHandView, removeOnHandPokemonFromList, setListState, setBallScope } from './collectionstate'
import { changesInitState, changesReducers } from './reducers/changesreducers'

const editmode = createSlice({
    name: 'editmode',
    initialState: {
        selected: '', 
        listType: 'collection', 
        showEditScreen: false, 
        ohByPSWShowEditScreen: false, //this one is used for onhand - by pokemon view - small width show edit screen
        selectedBall: '', 
        changes: changesInitState,
        unsavedChanges: false, 
        unsavedOnhandChanges: false, 
        deleteOnHandMode: false, 
        deletedOnHandIds: [], 
        collectionOptionsModal: {open: false,  screen: 'main'}, 
        saveChangesConfirmModal: false,
        pokemonScopeTotal: {},
        pokemonScopeGen: undefined,
        swCollection: { //These control SW ball selection
            position: 0,
            rendered: [] //list of ints corresponding to the idx of the ball in allowedBalls
        },
        homeEmBuffer: '' 
        //when changing em-count from the table in home collections, the selections change.
        //i needed a way to reset the homeemgen to that gen, rather than the highest one, when the selection changes
    },
    reducers: {
        setSelected: (state, action) => {
            if (typeof action.payload === 'object') { //pre much small width set selected
                if (action.payload.regSetSelected) {
                    const newState = {...state, selected: action.payload.selected, ohByPSWShowEditScreen: false, homeEmBuffer: ''}
                    return newState
                }
                const {selected, selectedBall, dontShowEditScreen, sw, allowedBalls} = action.payload
                //dontshoweditscreen should more accurately be called dontchangeeditscreen
                const newShowEditScreen = dontShowEditScreen ? {} : {showEditScreen: true}
                const newSwCollection = sw ? {
                    position: allowedBalls.length <= 8 ? getCenterOffset(40, 16, allowedBalls, selectedBall) : 0,
                    rendered: allowedBalls.length <= 8 ? allowedBalls.map((b, idx) => idx) : renderBallListDragVer(allowedBalls, selectedBall)
                } : {position: 0, rendered: []}
                const newState = {...state, selected, ...newShowEditScreen, ohByPSWShowEditScreen: false, selectedBall, swCollection: newSwCollection}
                return newState
            }
            const newState = {...state, selected: action.payload, showEditScreen: false, selectedBall: '', homeEmBuffer: ''}
            return newState
        },
        setSelectedAfterChangingOwned: (state, action) => {
            const newShowEditScreen = action.payload.smScreen ? state.showEditScreen : true
            const newState = {...state, selected: action.payload.idx, showEditScreen: newShowEditScreen, selectedBall: action.payload.ball}
            return newState
        },
        deselect: (state) => {
            const newState = {...state, selected: '', showEditScreen: false, selectedBall: '', homeEmBuffer: ''}
            return newState
        },
        changeList: (state, action) => {
            const {list} = action.payload
            if (list) {
                const newState = {...state, 
                    listType: list, 
                    selected: '',
                    deleteOnHandMode: false, 
                    deletedOnHandIds: [], 
                    setFullSetMode: false
                }
                return newState
            }
            return state
        },
        toggleEditScreenState: (state, action) => {
            if (action.payload) {//means im editing ohByPSWShowEditScreen
                const newState = {...state, ohByPSWShowEditScreen: !state.ohByPSWShowEditScreen}
                return newState
            }
            const newState = {...state, showEditScreen: !state.showEditScreen}
            return newState
        }, 
        setSelectedBall: (state, action) => {
            const newState = {...state, selectedBall: action.payload, homeEmBuffer: ''}
            return newState
        },
        changeModalState: (state, action) => {
            const {open, screen, initializeScopeTotal, scopeTotal, scopeGen, resetSelected} = action.payload
            if (initializeScopeTotal) {
                const newState = {...state, collectionOptionsModal: {open: true, screen}, pokemonScopeTotal: scopeTotal, pokemonScopeGen: scopeGen}
                return newState
            }
            const newState = {...state, collectionOptionsModal: {open: open === undefined ? state.collectionOptionsModal.open : open, screen: screen === undefined ? state.collectionOptionsModal.screen : screen}}
            if (resetSelected) {
                newState.selected = ''
                newState.selectedBall = ''
            }
            return newState
        },
        setUnsavedChanges: (state, action) => {
            const type = action.payload
            const unsavedChangesPath = type === 'onhand' ? state.unsavedOnhandChanges : state.unsavedChanges
            if (typeof action.payload === 'object') { //when resetting + uninitializing/leaving edit mode (see collectionstate)
                return {...state, selected: '', selectedBall: '', unsavedOnhandChanges: false, unsavedChanges: false, saveChangesConfirmModal: false}
            }
            if (type === 'reset') {
                return {...state, unsavedOnhandChanges: false, unsavedChanges: false, saveChangesConfirmModal: false}
            }
            if (unsavedChangesPath) {
                return state
            } 
            
            const newPath = type === 'onhand' ? {...state, unsavedOnhandChanges: true, saveChangesConfirmModal: false} : {...state, unsavedChanges: true, saveChangesConfirmModal: false}
            return newPath
        },
        setCollectionChange: changesReducers.setCollectionChange,
        setOnhandChange: changesReducers.setOnhandChange,
        resetChanges: changesReducers.resetChanges,
        resetChangesAndUninitialize: changesReducers.resetChangesAndUnitialize,
        setDeleteOnHandMode: (state, action) => {
            const removedOnHandIds = action.payload === false ? {deletedOnHandIds: []} : {}
            return {...state, deleteOnHandMode: action.payload, ...removedOnHandIds}
        },
        toggleOnHandIdToDelete: (state, action) => {
            const onhandId = action.payload
            const newOnHandIdsToDelete = state.deletedOnHandIds.includes(onhandId) ? state.deletedOnHandIds.filter(ohId => ohId !== onhandId) : [...state.deletedOnHandIds, onhandId]
            return {...state, deletedOnHandIds: newOnHandIdsToDelete}
        },
        // setCompleteSetMode: (state, action) => {
        //     state.setFullSetMode = !state.setFullSetMode
        //     return state
        // }
        setPosRenderSelectedData: swColReducers.setPosRenderSelectedData,
        setPosRenderOHBallData: swColReducers.setPosRenderOHBallData,
        setAllData: swColReducers.setAllData,
        setPos: swColReducers.setPos,
        resetPosRenderData: swColReducers.resetPosRenderData,

        toggleSaveChangesConfirmModal: (state, action) => {
            if (action.payload) {
                state.saveChangesConfirmModal = action.payload
            } else if (typeof state.saveChangesConfirmModal === 'string') {
                state.saveChangesConfirmModal = false
            } else {
                state.saveChangesConfirmModal = !state.saveChangesConfirmModal
            }
            return state
        },
        setHomeEmBuffer: (state, action) => {
            state.homeEmBuffer = action.payload
            return state
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(setBall, (state, action) => {
                const {ball, setSelectedBall} = action.payload
                if (setSelectedBall) {
                    state.selectedBall = ball
                }
                return state
            })
            .addCase(setQtyByPokemon, (state, action) => {
                const {ball, pokeId, addingNew, removeMonFromDisplay, smScreen, allowedBalls} = action.payload
                const {changeDataArr, prevQtys, newQtys, pData, multipleOHs, currColId} = action.payload //this is used for unsaved changes
                if (addingNew) { //adding new from the list, not from the edit bar
                    state.selected = pokeId
                    state.selectedBall = ball
                    if (!smScreen) {
                        state.showEditScreen = false  
                    } else {
                        //number values in function call below refer to img width and gap width. ive been setting it dynamically,
                        //but decided not to here since this is called by swbypokemondisplay (table data) and i dont have
                        //the widths there (only in editor), meaning id have to save that information to the redux store which i dont want to do.
                        state.swCollection.position = allowedBalls.length <= 8 ? getCenterOffset(40, 16, allowedBalls, ball) : 0
                        state.swCollection.rendered = allowedBalls.length <= 8 ? allowedBalls.map((b, idx) => idx) : renderBallListDragVer(allowedBalls, ball)
                        state.ohByPSWShowEditScreen = false
                    }
                }
                if (removeMonFromDisplay) {
                    if (state.selected === pokeId) {
                        state.selected = ''
                        state.showEditScreen = false
                        state.selectedBall = ''
                        state.ohByPSWShowEditScreen = false
                    }
                }
                if (changeDataArr || pData || multipleOHs) {
                    if (changeDataArr) {
                        changeDataArr.forEach((onhandId, idx) => {
                            changesReducers.setOnhandChange(state, {type: '/editmode/setOnhandChange', payload: {colId: currColId, id: onhandId, field: 'qty', prevValue: prevQtys[idx], currValue: newQtys[idx]}})
                        })
                        if (pData || multipleOHs) {
                            changesReducers.setOnhandChange(state, {type: '/editmode/setOnhandChange', payload: {colId: currColId, newOnhands: pData && multipleOHs ? [pData, ...multipleOHs] : pData ? [pData] : multipleOHs}})
                        }
                    } else {
                        changesReducers.setOnhandChange(state, {type: '/editmode/setOnhandChange', payload: {colId: currColId, newOnhands: pData && multipleOHs ? [pData, ...multipleOHs] : pData ? [pData] : multipleOHs}})
                    }
                    
                }
                return state
            })
            .addCase(setOnHandView, (state) => {
                state.deleteOnHandMode = false, 
                state.deletedOnHandIds = []
                return state
            })
            .addCase(removeOnHandPokemonFromList, (state, action) => {
                const {pokemonid, currColId} = action.payload
                if (!action.payload.noEditModeUpdates) {
                    state.selected = ''
                    state.showEditScreen = false
                    state.selectedBall = ''
                    state.ohByPSWShowEditScreen = false
                    state.deleteOnHandMode = false
                    state.deletedOnHandIds = []
                }
                if (state.changes.unsavedOnhandChanges[currColId] !== undefined) {
                    const isArray = Array.isArray(pokemonid)
                    if (!isArray) {
                        if (state.changes.unsavedOnhandChanges[currColId][pokemonid] !== undefined) {
                            delete state.changes.unsavedOnhandChanges[currColId][pokemonid]
                        }
                    } else {
                        pokemonid.forEach(id => {
                            if (state.changes.unsavedOnhandChanges[currColId][id] !== undefined) {
                                delete state.changes.unsavedOnhandChanges[currColId][id]
                            }
                        })
                    }
                    if (Object.keys(state.changes.unsavedOnhandChanges[currColId]).length === 0) {
                        delete state.changes.unsavedOnhandChanges[currColId]
                    }
                    
                }
                return state
            })
            .addCase(setBallScope, (state, action) => {
                const {demo} = action.payload
                if (!demo) {
                   state.changes = changesInitState 
                } 
                state.selected = ''
                state.selectedBall = ''
                state.showEditScreen = false
                state.ohByPSWShowEditScreen = false
                return state
            })
    }
})

export const {
    setSelected, 
    deselect, 
    changeList, 
    toggleEditScreenState, 
    setSelectedBall, 
    setSelectedAfterChangingOwned,
    changeModalState,
    setUnsavedChanges,
    setCollectionChange,
    setOnhandChange,
    resetChanges,
    resetChangesAndUninitialize,
    setDeleteOnHandMode,
    toggleOnHandIdToDelete,
    setPosRenderSelectedData,
    setPosRenderOHBallData,
    setAllData,
    setPos,
    resetPosRenderData,
    toggleSaveChangesConfirmModal,
    setHomeEmBuffer
} = editmode.actions

export default editmode