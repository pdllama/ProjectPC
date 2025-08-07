import { sortOnHandList } from "../../../../common/sortingfunctions/onhandsorting.mjs"
import getDefaultData, { handleEggMoveDefaults, handleMultipleDefaultData } from "../../../../utils/functions/defaultdata"
import newObjectId from "../../../../utils/functions/newobjectid"
import { interchangeableAltFormIds } from "../../../../common/infoconstants/pokemonconstants.mjs"
import { filterList } from "../../../../utils/functions/sortfilterfunctions/filterfunctions"
import { OHByPokemonStateUpdate } from "../../../components/collectiontable/onhandlist/onhandbypokemonupdates/ohbypokemonstateupdate"
import { randomGender } from "../../../../utils/functions/misc"
import { selectPokeIdMatches } from "../../selectors/selectpokeidmatches"
import { getHighestEmGen } from "../../../components/collectiontable/tabledata/emindicator"

//operations related to changing the values on a single pokemon in a collection, which is used to edit the row data.

const collectionReducers = {
    setIsOwned: (state, action) => {
        const {idx, ball, ballDefault, subListIdx, currColGen} = action.payload
        const isOwned = state.collection[idx].balls[ball].isOwned
        // const activeTag = state.collection[idx].balls[ball].highlyWanted !== undefined ? 'highlyWanted' : state.collection[idx].balls[ball].pending !== undefined ? 'pending' : 'none'
        const editSubListToo = subListIdx !== undefined
        if (isOwned === false) {
            const changedFields = Object.keys(ballDefault)
            // const superColDefaultData = needEMsSuperListFormat && currDefault !== 'none' && state.collection[idx].balls[Object.keys(state.collection[idx].balls).filter(b => b === currDefault)[0]]
            for (let field of changedFields) {
                if ((field === 'eggMoveData') && editSubListToo) {
                    //have to pass the information differently to the main list. also, have to add the other default data.
                    //note: even in sublists, ballDefault comes out with home-format egg moves. see setIsOwned users for information. it needs to be outside so the unsavedchanges reducer can work.
                    state.collection[idx].balls[ball].eggMoveData = ballDefault.eggMoveData
                    state.collection[idx].balls[ball].eggMoveData = ballDefault.eggMoveData
                    state.subList[subListIdx].balls[ball].EMs = ballDefault.eggMoveData[currColGen].EMs
                    state.subList[subListIdx].balls[ball].emCount = ballDefault.eggMoveData[currColGen].emCount
                } else {
                    state.collection[idx].balls[ball][field] = ballDefault[field]
                    if (editSubListToo) {state.subList[subListIdx].balls[ball][field] = ballDefault[field]}
                }
            }
            if (state.collection[idx].balls[ball].pending || state.collection[idx].balls[ball].highlyWanted) {
                delete state.collection[idx].balls[ball].pending
                delete state.collection[idx].balls[ball].highlyWanted
            }
        }
        // if (isOwned === false && activeTag !== 'none') {
        //     delete state.collection[idx].balls[ball][activeTag]
        //     if (editSubListToo) {delete state.subList[subListIdx].balls[ball][activeTag]}
        // }
        if ((isOwned === false && state.collection[idx].balls[ball].isHA !== undefined) && ballDefault === 'none') {
            state.collection[idx].balls[ball].isHA = true
            if (editSubListToo) {state.subList[subListIdx].balls[ball].isHA = true}
        }
        state.collection[idx].balls[ball].isOwned = !isOwned
        if (editSubListToo) {state.subList[subListIdx].balls[ball].isOwned = !isOwned}

        state.listDisplay.forceRefilter = true

        return state 
    },
    setTags: (state, action) => {
        const {tagType, idx, ball, subListIdx} = action.payload
        const otherTag = tagType === 'highlyWanted' ? 'pending' : 'highlyWanted'
        const editSubListToo = subListIdx !== undefined
        if (state.collection[idx].balls[ball][tagType] !== undefined) {
            delete state.collection[idx].balls[ball][tagType]
            if (editSubListToo) {delete state.subList[subListIdx].balls[ball][tagType]}
            return state
        }
        if (state.collection[idx].balls[ball][otherTag] !== undefined) {
            delete state.collection[idx].balls[ball][otherTag]
            if (editSubListToo) {delete state.subList[subListIdx].balls[ball][otherTag]}
        }
        state.collection[idx].balls[ball][tagType] = true
        if (editSubListToo) {state.subList[subListIdx].balls[ball][tagType] = true}
        

        state.listDisplay.forceRefilter = true

        return state
    },
    setDefault: (state, action) => {
        const {idx, ball, prevDefault, subListIdx} = action.payload
        const editSubListToo = subListIdx !== undefined
        if (prevDefault !== 'none') {
            delete state.collection[idx].balls[prevDefault].default
            if (editSubListToo) {delete state.subList[subListIdx].balls[prevDefault].default}
        }
        if (prevDefault === ball) {
            delete state.collection[idx].balls[ball].default
            if (editSubListToo) {delete state.subList[subListIdx].balls[ball].default}
        } else {
            state.collection[idx].balls[ball].default = true
            if (editSubListToo) {state.subList[subListIdx].balls[ball].default = true}
        }
        return state
    },
    setMultipleIsOwned: (state, action) => {
        const {idx, newBallData, subListIdx, currColGen} = action.payload
        const editSubListToo = subListIdx !== undefined
        state.collection[idx].balls = newBallData
        if (editSubListToo) {
            //note: newBallData egg move peripherals comes out in home format even when sublist is active, so we need to reformat it below.
            const newBallDataSubListFormat = {}
            Object.keys(newBallData).forEach(b => {
                newBallDataSubListFormat[b] = {...newBallData[b], EMs: newBallData[b].eggMoveData[currColGen].EMs, emCount: newBallData[b].eggMoveData[currColGen].emCount, eggMoveData: undefined}
            })
            state.subList[subListIdx].balls = newBallDataSubListFormat
        }

        state.listDisplay.forceRefilter = true

        return state
    }
}

const onhandReducers = {
    setBall: (state, action) => {
        const {idx, ball} = action.payload
        const hasLinkedCollections = state.linkedCollections !== undefined
        if (hasLinkedCollections) {
            state.linkedCollections[state.linkedSelectedIdx].onHand[idx].ball = ball
        }
        state.onhand[idx].ball = ball
        state.listDisplay.forceRefilter = true
        return state
    },
    setGender: (state, action) => {
        const {idx, gender} = action.payload
        const hasLinkedCollections = state.linkedCollections !== undefined
        if (hasLinkedCollections) {
            state.linkedCollections[state.linkedSelectedIdx].onHand[idx].gender = gender
        }
        state.onhand[idx].gender = gender
        state.listDisplay.forceRefilter = true
        return state
    },
    setEmGen: (state, action) => {
        const {idx, newEmGen, newEmCount, newEMs} = action.payload
        const hasLinkedCollections = state.linkedCollections !== undefined
        if (hasLinkedCollections) {
            state.linkedCollections[state.linkedSelectedIdx].onHand[idx].emGen = newEmGen
            if (newEMs) {state.linkedCollections[state.linkedSelectedIdx].onHand[idx].EMs = newEMs}
            if (newEmCount) {state.linkedCollections[state.linkedSelectedIdx].onHand[idx].emCount = newEmCount}
        }
        state.onhand[idx].emGen = newEmGen
        if (newEMs) {state.onhand[idx].EMs = newEMs}
        if (newEmCount) {state.onhand[idx].emCount = newEmCount}

        state.listDisplay.forceRefilter = true
        return state
    },
    setPokemonSpecies: (state, action) => {
        const {id, imgLink, haName, pokemonData, sortingOptions} = action.payload
        const hasLinkedCollections = state.linkedCollections !== undefined
        const idxInTotalList = state.onhand.findIndex((p) => p._id === id)
        const idxInDisplay = state.listDisplay.onhand.findIndex((p) => p._id === id)
        const newOnhand = {_id: state.onhand[idxInTotalList]._id, imgLink, haName,  ...pokemonData}
        state.onhand[idxInTotalList] = newOnhand
        state.listDisplay.onhand[idxInDisplay] = newOnhand
        if (sortingOptions.reorder) {
            state.onhand = sortOnHandList(sortingOptions.sortFirstBy, sortingOptions.default, sortingOptions.ballOrder, state.onhand)
            state.listDisplay.onhand = sortOnHandList(sortingOptions.sortFirstBy, sortingOptions.default, sortingOptions.ballOrder, state.listDisplay.onhand)
        } 
        if (hasLinkedCollections) {
            state.linkedCollections[state.linkedSelectedIdx].onHand = state.onhand
        }

        state.listDisplay.forceRefilter = true
        return state
    },
    setQty: (state, action) => {
        const {idx, qty} = action.payload
        const hasLinkedCollections = state.linkedCollections !== undefined
        if (hasLinkedCollections) {
            state.linkedCollections[state.linkedSelectedIdx].onHand[idx].qty = qty
        }
        state.onhand[idx].qty = qty
        
        return state
    },
    setQtyByPokemon: (state, action) => {
        const {pokeId, changeDataArr, newQtys, multipleOHs, pData, removeMonFromDisplay} = action.payload
        const hasLinkedCollections = state.linkedCollections !== undefined
        if (changeDataArr) {
            changeDataArr.forEach((id, idx) => {
                state.onhand = state.onhand.map((p)=> {
                    const changed = id === p._id
                    if (changed) {
                        if (newQtys[idx] === 0) {
                            return undefined
                        }
                        p.qty = newQtys[idx]
                    }
                    return p
                }).filter(p => p !== undefined)
            })
        }
        if (multipleOHs) {
            state.onhand = [...state.onhand, ...multipleOHs]
        } else if (pData) {
            state.onhand[state.onhand.length] = pData
        }

        if (removeMonFromDisplay) {
            state.listDisplay.onhand = state.listDisplay.onhand.filter(p => p.imgLink !== pokeId)
        }
        if (state.options.sorting.onhand.reorder) {
            state.onhand = sortOnHandList(state.options.sorting.onhand.sortFirstBy, state.options.sorting.onhand.default, state.options.sorting.onhand.ballOrder, state.onhand)
        }

        if (hasLinkedCollections) {
            state.linkedCollections[state.linkedSelectedIdx].onHand = state.onhand
        }

        return state
    }
}

export {collectionReducers, onhandReducers}