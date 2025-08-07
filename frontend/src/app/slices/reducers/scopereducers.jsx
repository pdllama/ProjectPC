import { sortList } from "../../../../common/sortingfunctions/customsorting.mjs"
import {convertPToSubListFormat} from "../linkedcollectionsreducers/initializelistdisplay"
import { apriballLiterals } from "../../../../common/infoconstants/miscconstants.mjs"
import { resetFilters } from "../linkedcollectionsreducers/initialize"
import { excludedCombosSingularChange } from "../../../../utils/functions/scope/savescopechanges"
import { interchangeableAltFormMons } from "../../../../common/infoconstants/pokemonconstants.mjs"

//see backend pokemonscopechange controller for why we need this
export const comparePokemonNames = (name1, name2) => {
    const trueName1 = interchangeableAltFormMons.includes(name1) ? `${name1} (Any)` : name1
    const trueName2 = interchangeableAltFormMons.includes(name2) ? `${name2} (Any)` : name2
    return trueName1 === trueName2
}

const generateNewBallData = (p) => {
    const newBallObjRef = JSON.parse(JSON.stringify(p.balls[Object.keys(p.balls)[0]]))
    Object.keys(newBallObjRef).forEach((key) => {
        if (key === 'eggMoveData') {
            const newEggMoveDataObj = {}
            Object.keys(newBallObjRef.eggMoveData).forEach(emGen => {
                newEggMoveDataObj[emGen] = {emCount: 0, EMs: []}
            })
            newBallObjRef.eggMoveData = newEggMoveDataObj
        } else {
            const accompanyingValue = key === 'isOwned' || key === 'isHA' ? false : key === 'emCount' ? 0 : key === 'EMs' && []
            newBallObjRef[key] = accompanyingValue
        }
        
    })
    return newBallObjRef
}

const updateNewPokemonForBallScope = (p, ballLegalityInfo, ballScope) => {
    ballScope.forEach(ball => {
        const legalityBall = apriballLiterals.includes(ball) ? 'apriball' : ball
        const pokemonLegalBalls = ballLegalityInfo.filter(mon => mon.imgLink === p.imgLink)[0].legalBalls
        if (pokemonLegalBalls.includes(legalityBall) && p.balls[ball] === undefined) {
            p.balls[ball] = generateNewBallData(p)
        }
    })
}

const updatePokemonScopeFunction = (state, addedPokemon, removedPokemon, subListActive, ballLegalityInfo) => {
    
    if (removedPokemon !== undefined && removedPokemon.length > 0) {
        if (subListActive) {
            state.linkedCollections[state.linkedSelectedIdx].ownedPokemon = state.linkedCollections[state.linkedSelectedIdx].ownedPokemon.filter(p => removedPokemon.filter(p2 => comparePokemonNames(p.name, p2.name)).length === 0) 
            state.subList = state.subList.filter(p => removedPokemon.filter(p2 => comparePokemonNames(p.name, p2.name)).length === 0)
        } else {
            state.collection = state.collection.map(p => {
                const removedP = removedPokemon.filter(p2 => comparePokemonNames(p.name, p2.name)).length !== 0
                if (removedP) {
                    return {...p, disabled: true}
                } else {
                    return p
                }
            })
        }
    }
    if (addedPokemon !== undefined && addedPokemon.length > 0) {
        if (subListActive) {
            state.linkedCollections[state.linkedSelectedIdx].ownedPokemon = [...state.linkedCollections[state.linkedSelectedIdx].ownedPokemon, ...addedPokemon.map(p => {return {name: p.name, natDexNum: p.natDexNum, disabledBalls: []}})]
            const addedCollectionPokemon = state.collection.filter(p => addedPokemon.filter(p2 => comparePokemonNames(p.name, p2.name)).length !== 0)
            state.subList = [...state.subList, ...addedCollectionPokemon.map(p => convertPToSubListFormat(p, [], state.linkedCollections[state.linkedSelectedIdx].gen))]
        } else {
            const ballScope = state.options.collectingBalls
            state.collection = state.collection.map(p => {
                const newlyEnabled = addedPokemon.filter(p2 => comparePokemonNames(p.name, p2.name)).length !== 0
                if (newlyEnabled) {
                    delete p.disabled
                    updateNewPokemonForBallScope(p, ballLegalityInfo, ballScope)
                    const possibleBalls = Object.keys(p.balls)
                    possibleBalls.forEach(b => {
                        const disableBall = !ballScope.includes(b)
                        const reenableBall = p.balls[b].disabled && ballScope.includes(b)
                        if (disableBall) {p.balls[b].disabled = true}
                        if (reenableBall) {delete p.balls[b].disabled}
                    })
                }
                return p
            })
        }
        // state.linkedCollections[state.linkedSelectedIdx].ownedPokemon = [...state.linkedCollections[state.linkedSelectedIdx].ownedPokemon, ...addedPokemon.map(p => {return {name: p.name, natDexNum: p.natDexNum, disabledBalls: []}})]
        // if (state.linkedCollections[state.linkedSelectedIdx].options.sorting.collection.reorder) {
        //     state.linkedCollections[state.linkedSelectedIdx].ownedPokemon = sortList(state.linkedCollections[state.linkedSelectedIdx].options.sorting.collection.default, state.linkedCollections[state.linkedSelectedIdx].ownedPokemon)
        // }
    }
    
}

const updatePokemonScope = (state, action) => {
    const {addedPokemon, removedPokemon, newPokemonToList, ballLegalityInfo, updatedHomeGames, updatedEggMoves} = action.payload
    const hasLinkedCollections = state.linkedCollections !== undefined
    const subListActive = hasLinkedCollections && state.linkedSelectedIdx !== 0

    if (newPokemonToList) {
        newPokemonToList.forEach(p => {
            state.collection.push(p)
            //note: newPokemonToList comes from the backend. they will send the pokemon as disabled/enabled depending on if its a sublist addition, so theres no need to add it here.
            if (subListActive) {
                state.linkedCollections[state.linkedSelectedIdx].ownedPokemon.push({name: p.name, natDexNum: p.natDexNum, disabledBalls: []})
                state.subList.push(convertPToSubListFormat(p, [], state.linkedCollections[state.linkedSelectedIdx].gen))
            }
        })
        //dont need to do below since they will come out disabled if sub list is active
        // if (subListActive) {
        //     const mainListSortingOption = state.linkedCollections[0].options.sorting.collection
        //     if (mainListSortingOption.reorder) {
        //         state.collection = sortList(mainListSortingOption.default, state.collection)
        //     }  
        // }
    }
    updatePokemonScopeFunction(state, addedPokemon, removedPokemon, subListActive, ballLegalityInfo)

    if (updatedHomeGames) {
        //removed if since demo has a different handler now
        // if (demo) {
        //     //the reason why im simply adding onto the object instead of replacing it is because the demo controller only sends the em/home game data for the new
        //     //pokemon. the reason why it does it differently is because id have to send the entire collectionstate from frontend to backend to do so, and
        //     //im trying to avoid sending full collection objects from front to back.
        //     Object.keys(updatedHomeGames).forEach(pName => { 
        //         state.availableGamesInfo[pName] = updatedHomeGames[pName]
        //     })
        // } else {
            state.availableGamesInfo = updatedHomeGames
            if (state.linkedCollections !== undefined) {
                state.linkedCollections[0].availableGamesInfo = updatedHomeGames
            }
        // }
        
    }
    if (updatedEggMoves) {
        // if (demo) {
        //     Object.keys(updatedHomeGames).forEach(pName => {
        //         state.eggMoveInfo[pName] = updatedEggMoves[pName]
        //     })
        // } else {
            state.eggMoveInfo = updatedEggMoves
            if (subListActive) {
                state.linkedCollections[state.linkedSelectedIdx].eggMoveInfo = updatedEggMoves
            }
        // }
        
    }

    if (state.options.sorting.collection.reorder) {
        if (subListActive) {
            state.subList = sortList(state.options.sorting.collection.default, state.subList)
            state.linkedCollections[state.linkedSelectedIdx].ownedPokemon = sortList(state.options.sorting.collection.default, state.linkedCollections[state.linkedSelectedIdx].ownedPokemon)
            
        } else {
            state.collection = sortList(state.options.sorting.collection.default, state.collection)
        }
    }

    state.listDisplay.collection = subListActive ? state.subList : state.collection.filter(p => !p.disabled) 
    resetFilters(state, 'collection')
    return state
}

const updateBallScope = (state, action) => {
    const {newBallScope, addedBalls, legalBallInfo, removedPokemon} = action.payload
    const hasLinkedCollections = state.linkedCollections !== undefined
    const subListActive = hasLinkedCollections && state.linkedSelectedIdx !== 0
    state.options.collectingBalls = newBallScope
    if (hasLinkedCollections) {
        state.linkedCollections[state.linkedSelectedIdx].options.collectingBalls = newBallScope
    }
    if (addedBalls || removedPokemon) {
       if (!subListActive) {
            state.collection = state.collection.map(p => {
                const isRemovedP = removedPokemon !== undefined && removedPokemon.filter(rPoke => rPoke.imgLink === p.imgLink).length !== 0
                if (p.disabled) {return p}
                if (isRemovedP) {return {...p, disabled: true}}
                if (addedBalls) {
                    const newBallData = JSON.parse(JSON.stringify(p.balls))
                    const pokemonLegalityInfo = legalBallInfo.filter(mon => mon.imgLink === p.imgLink)[0].legalBalls
                    addedBalls.forEach(ball => {
                        if (newBallData[ball] !== undefined) { //this can happen if a restrictive ball scope gets linked to a bigger ball scope, and then the user broadens it after.
                            null
                        } else {
                            const addedBallLegality = apriballLiterals.includes(ball) ? 'apriball' : ball
                            if (pokemonLegalityInfo.includes(addedBallLegality)) {
                                newBallData[ball] = generateNewBallData(p)
                            }
                        }
                    })
                    return {...p, balls: newBallData}
                }
            })
        } else {
            state.linkedCollections[state.linkedSelectedIdx].ownedPokemon = state.linkedCollections[state.linkedSelectedIdx].ownedPokemon.filter(p => removedPokemon.filter(rPoke => rPoke.imgLink === p.imgLink).length === 0)
            state.subList = state.subList.map(p => {
                const isRemovedP = removedPokemon !== undefined && removedPokemon.filter(rPoke => rPoke.imgLink === p.imgLink).length !== 0
                if (isRemovedP) {return undefined}
                if (addedBalls) {
                    const newBallData = JSON.parse(JSON.stringify(p.balls))
                    const pokemonLegalityInfo = legalBallInfo.filter(mon => mon.imgLink === p.imgLink)[0].legalBalls
                    addedBalls.forEach(ball => {
                        if (newBallData[ball] !== undefined) { //this can happen if a restrictive ball scope gets linked to a bigger ball scope, and then the user broadens it after.
                            null
                        } else {
                            const addedBallLegality = apriballLiterals.includes(ball) ? 'apriball' : ball
                            if (pokemonLegalityInfo.includes(addedBallLegality)) {
                                newBallData[ball] = generateNewBallData(p)
                            }
                        }
                    })
                    return {...p, balls: newBallData}
                }
            }).filter(p => p !== undefined)
        }
        resetFilters(state)
    }
    return state
}

const updateExcludedBallCombos = (state, action) => {
    const {addedPokemon, removedPokemon, ballChangedPokemon} = action.payload
    const hasLinkedCollections = state.linkedCollections !== undefined
    const subListActive = hasLinkedCollections && state.linkedSelectedIdx !== 0

    if (subListActive) {
        state.subList = state.subList.map(p => excludedCombosSingularChange(p, addedPokemon, removedPokemon, ballChangedPokemon, false))
        state.linkedCollections[state.linkedSelectedIdx].ownedPokemon = state.linkedCollections[state.linkedSelectedIdx].ownedPokemon.map(p => excludedCombosSingularChange(p, addedPokemon, removedPokemon, ballChangedPokemon, true))
    } else {
        state.collection = state.collection.map(p => excludedCombosSingularChange(p, addedPokemon, removedPokemon, ballChangedPokemon, false))
    }

    // resetFilters(state)
    return state
}

export {updatePokemonScope, updateExcludedBallCombos}