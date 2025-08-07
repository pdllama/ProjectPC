import { OHByPokemonStateUpdate } from "../../../../components/collectiontable/onhandlist/onhandbypokemonupdates/ohbypokemonstateupdate"
import { selectPokeIdMatches } from "../../../selectors/selectpokeidmatches"
import { getHighestEmGen } from "../../../../components/collectiontable/tabledata/emindicator"
import newObjectId from "../../../../../utils/functions/newobjectid"

export const getByQtyChanges = (collection, onhand, pokeId, ball, increment, customQty, isHomeCollection) => {
    //returns any of the following:
    // changeDataArr++prevQtys+newQtys ------ 
    //          changeDataArr is an arr of onhand ids, while newQtys are the qtys they should be (idx matches). newQty may be 0, in which case you know to remove.
    //          prevQtys are an arr of prevQtys for unsaved changes update (again, indexes match). 
    // multipleOHs --------- array of new onhands to add. 
    // pData ---------- single onhand to add.

    const pokeBInColData = collection.filter(p => selectPokeIdMatches(p.imgLink, pokeId, p.disabled))[0]
    const onhandMons = onhand.map((p, idx) => {return {...p, idx}}).filter(p => (p.imgLink === pokeId && p.ball === ball))
    const addingNew = onhandMons.length === 0 && !(customQty === 0) && (customQty !== undefined || increment)
    const isAnIFormEquivalency = pokeBInColData.imgLink !== pokeId //this means that there is ALWAYS at least one onhand in the list that matches this mon
    if (addingNew) {
        //if the pokemon/ball doesnt already have a single onhand with it. 
        //handles custom qty and incrementing
        const homeEmGenInit = pokeBInColData.balls[ball].eggMoveData ? getHighestEmGen(pokeBInColData.balls[ball].eggMoveData) : undefined
        const peripherals = {...pokeBInColData.balls[ball], isOwned: undefined, default: undefined, eggMoveData: undefined, EMs: pokeBInColData.balls[ball].eggMoveData ? pokeBInColData.balls[ball].eggMoveData[homeEmGenInit].EMs : pokeBInColData.balls[ball].EMs, emCount: pokeBInColData.balls[ball].eggMoveData ? pokeBInColData.balls[ball].eggMoveData[homeEmGenInit].emCount : pokeBInColData.balls[ball].emCount, emGen: homeEmGenInit}
        const basicMonInfo = isAnIFormEquivalency ? onhand.filter(p => p.imgLink === pokeId)[0] : pokeBInColData
        const pData = {
            _id: newObjectId(),
            name: basicMonInfo.name,
            natDexNum: basicMonInfo.natDexNum,
            imgLink: pokeId,
            haName: basicMonInfo.haName,
            ball,
            gender: pokeBInColData.possibleGender === 'both' ? 'unknown' : pokeBInColData.possibleGender,
            ...peripherals,
            qty: (customQty) ? ((customQty <= 99) ? customQty : 99) : 1
        }
        if (customQty && customQty > 99) {
            let remainingQty = customQty-99
            const multipleOHs = [{...pData, qty: 99}]
            while (remainingQty > 0) {
                multipleOHs.push({...pData, _id: newObjectId(), qty: remainingQty > 99 ? 99 : remainingQty})
                remainingQty = remainingQty > 99 ? remainingQty - 99 : 0
            }
            // state.onhand = [...state.onhand, ...multipleOHs]
            return {multipleOHs}
        } else {
            // state.onhand[state.onhand.length] = pData
            return {pData}
        }
    } else if (customQty !== undefined) { //lowering the quantity via customQty
        if (customQty === 0) {
            // state.onhand = state.onhand.filter(p => !(p.imgLink === pokeId && p.ball === ball))
            const unsavedChangesRecord = {changesDataArr: [], prevQtys: [], newQtys: []}
            onhand.forEach(p => {
                const match = p.imgLink === pokeId && p.ball === ball
                if (match) {
                    changesDataArr.push(p._id)
                    prevQtys.push(p.qty)
                    newQtys.push(0)
                }
            })
            return unsavedChangesRecord
        } else if (!increment) {
            const changeDataArr = OHByPokemonStateUpdate(onhandMons, false, pokeBInColData.balls[ball], customQty, true, isHomeCollection)
            let remainingQtyToRemove = onhandMons.map(ohP => ohP.qty).reduce((acc, cV) => acc+cV, 0) - customQty
            const prevQtys = []
            const newQtys = changeDataArr.map(ohId => {
                const ohData = onhand.filter(p => p._id === ohId)[0]
                prevQtys.push(ohData.qty)
                if (remainingQtyToRemove === 0) {return ohData.qty}
                if (ohData.qty < remainingQtyToRemove) {
                    remainingQtyToRemove -= ohData.qty
                    return 0
                } else if (ohData.qty >= remainingQtyToRemove) {
                    const qtyDifference = ohData.qty - remainingQtyToRemove
                    remainingQtyToRemove = 0
                    return qtyDifference
                }
            })
            // state.onhand = state.onhand.map(p => {
            //     const idx = changeDataArr.indexOf(p._id)
            //     const changedQty = idx !== -1
            //     if (changedQty) {
            //         p.qty = newQtys[idx]
            //         if (p.qty === 0) {
            //             return undefined
            //         }
            //     }
            //     return p
            // }).filter(p => p !== undefined) 
            return {changeDataArr, prevQtys, newQtys}
        } else {
            const changeData = OHByPokemonStateUpdate(onhandMons, increment, pokeBInColData.balls[ball], customQty, false, isHomeCollection) //onhand id of the pokemon to increment first.
            let remainingQtyToAdd = customQty - onhandMons.map(ohP => ohP.qty).reduce((a, c) => a+c, 0) //should always be greater than 0
            // let remainingQtyToAdd = customQty //should always be greater than 0
            const unsavedChangesRecord = {}
            if (onhandMons.filter(p => p._id === changeData.id).length !== 0 && onhandMons.filter(p => p._id === changeData.id)[0].qty < 99) {
                const onhandData = onhand.filter((p) => changeData.id === p._id)[0]
                //     const changedQty = changeData.id === p._id
                //     if (changedQty) {
                //         if (p.qty+remainingQtyToAdd <= 99) {
                //             p.qty += remainingQtyToAdd
                //             remainingQtyToAdd = 0
                //         } else {
                //             remainingQtyToAdd -= (99-p.qty)
                //             p.qty = 99
                //         }
                //     }
                //     return p
                // })
                let newQtyOfId = onhandData.qty
                if (onhandData.qty+remainingQtyToAdd <= 99) {
                    newQtyOfId += remainingQtyToAdd
                    remainingQtyToAdd = 0
                } else {
                    remainingQtyToAdd -= (99-onhandData.qty)
                    newQtyOfId = 99
                }
                unsavedChangesRecord.changeDataArr = [changeData.id]
                unsavedChangesRecord.prevQtys = [onhandData.qty]
                unsavedChangesRecord.newQtys = [newQtyOfId]
            }
            if (remainingQtyToAdd > 0) {
                const homeEmGenInit = pokeBInColData.balls[ball].eggMoveData ? getHighestEmGen(pokeBInColData.balls[ball].eggMoveData) : undefined
                const peripherals = {...pokeBInColData.balls[ball], isOwned: undefined, default: undefined, eggMoveData: undefined, EMs: pokeBInColData.balls[ball].eggMoveData ? pokeBInColData.balls[ball].eggMoveData[homeEmGenInit].EMs : pokeBInColData.balls[ball].EMs, emCount: pokeBInColData.balls[ball].eggMoveData ? pokeBInColData.balls[ball].eggMoveData[homeEmGenInit].emCount : pokeBInColData.balls[ball].emCount, emGen: homeEmGenInit}
                const pData = {
                    _id: newObjectId(),
                    name: pokeBInColData.name,
                    natDexNum: pokeBInColData.natDexNum,
                    imgLink: pokeId,
                    haName: pokeBInColData.haName,
                    ball,
                    gender: pokeBInColData.possibleGender === 'both' ? 'unknown' : pokeBInColData.possibleGender,
                    ...peripherals,
                }
                const multipleOHs = [{...pData, qty: remainingQtyToAdd > 99 ? 99 : remainingQtyToAdd}]
                remainingQtyToAdd = remainingQtyToAdd > 99 ? remainingQtyToAdd-99 : 0
                while (remainingQtyToAdd > 0) {
                    multipleOHs.push({...pData, _id: newObjectId(), qty: remainingQtyToAdd > 99 ? 99 : remainingQtyToAdd})
                    remainingQtyToAdd = remainingQtyToAdd > 99 ? remainingQtyToAdd - 99 : 0
                }
                // state.onhand = [...state.onhand, ...multipleOHs]
                unsavedChangesRecord.multipleOHs = multipleOHs
            }
            return unsavedChangesRecord
        }
        
    } else {
        const changeData = OHByPokemonStateUpdate(onhandMons, increment, pokeBInColData.balls[ball], customQty, false, isHomeCollection)
        let addNewOnHand = false
        const changeIdx = onhandMons.filter(p => p._id === changeData.id)[0].idx
        const unsavedChangesRecord = {}
        if (changeData.remove) {
            unsavedChangesRecord.changeDataArr = [onhand[changeIdx]._id]
            unsavedChangesRecord.prevQtys = [onhand[changeIdx].qty]
            unsavedChangesRecord.newQtys = [0]
            // state.onhand.splice(changeIdx, 1)
        } else if (increment && onhand[changeIdx].qty === 99) {
            addNewOnHand = true
        } else {
            unsavedChangesRecord.changeDataArr = [onhand[changeIdx]._id]
            unsavedChangesRecord.prevQtys = [onhand[changeIdx].qty]
            unsavedChangesRecord.newQtys = [increment ? onhand[changeIdx].qty+1 : onhand[changeIdx].qty-1]
            // state.onhand[changeIdx].qty = increment ? state.onhand[changeIdx].qty+1 : state.onhand[changeIdx].qty-1
        }

        if (addNewOnHand) {
            const homeEmGenInit = pokeBInColData.balls[ball].eggMoveData ? getHighestEmGen(pokeBInColData.balls[ball].eggMoveData) : undefined
            const peripherals = {...pokeBInColData.balls[ball], isOwned: undefined, default: undefined, eggMoveData: undefined, EMs: pokeBInColData.balls[ball].eggMoveData ? pokeBInColData.balls[ball].eggMoveData[homeEmGenInit].EMs : pokeBInColData.balls[ball].EMs, emCount: pokeBInColData.balls[ball].eggMoveData ? pokeBInColData.balls[ball].eggMoveData[homeEmGenInit].emCount : pokeBInColData.balls[ball].emCount, emGen: homeEmGenInit}
            const basicMonInfo = isAnIFormEquivalency ? onhand.filter(p => p.imgLink === pokeId)[0] : pokeBInColData
            const pData = {
                _id: newObjectId(),
                name: basicMonInfo.name,
                natDexNum: basicMonInfo.natDexNum,
                imgLink: pokeId,
                haName: basicMonInfo.haName,
                ball,
                gender: pokeBInColData.possibleGender === 'both' ? 'unknown' : pokeBInColData.possibleGender,
                ...peripherals,
                qty: 1
            }
            // state.onhand[state.onhand.length] = pData
            return {pData}
        }
        return unsavedChangesRecord
    }
}

//this is the prev setQtyByPokemon, where it was implicated directly into the reducer.
//
// setQtyByPokemon: (state, action) => {
//         const {pokeId, ball, increment, customQty, removeMonFromDisplay, isHomeCollection} = action.payload
//         const hasLinkedCollections = state.linkedCollections !== undefined
//         const pokeBInColData = state.collection.filter(p => selectPokeIdMatches(p.imgLink, pokeId, p.disabled))[0]
//         const onhandMons = state.onhand.map((p, idx) => {return {...p, idx}}).filter(p => (p.imgLink === pokeId && p.ball === ball))
//         const addingNew = onhandMons.length === 0 && !(customQty === 0) && (customQty !== undefined || increment)
//         const isAnIFormEquivalency = pokeBInColData.imgLink !== pokeId //this means that there is ALWAYS at least one onhand in the list that matches this mon
//         if (addingNew) {
//             //if the pokemon/ball doesnt already have a single onhand with it. 
//             //handles custom qty and incrementing
//             const homeEmGenInit = pokeBInColData.balls[ball].eggMoveData ? getHighestEmGen(pokeBInColData.balls[ball].eggMoveData) : undefined
//             const peripherals = {...pokeBInColData.balls[ball], isOwned: undefined, default: undefined, eggMoveData: undefined, EMs: pokeBInColData.balls[ball].eggMoveData ? pokeBInColData.balls[ball].eggMoveData[homeEmGenInit].EMs : pokeBInColData.balls[ball].EMs, emCount: pokeBInColData.balls[ball].eggMoveData ? pokeBInColData.balls[ball].eggMoveData[homeEmGenInit].emCount : pokeBInColData.balls[ball].emCount, emGen: homeEmGenInit}
//             const basicMonInfo = isAnIFormEquivalency ? state.onhand.filter(p => p.imgLink === pokeId)[0] : pokeBInColData
//             const pData = {
//                 _id: newObjectId(),
//                 name: basicMonInfo.name,
//                 natDexNum: basicMonInfo.natDexNum,
//                 imgLink: pokeId,
//                 haName: basicMonInfo.haName,
//                 ball,
//                 gender: pokeBInColData.possibleGender === 'both' ? 'unknown' : pokeBInColData.possibleGender,
//                 ...peripherals,
//                 qty: (customQty) ? ((customQty <= 99) ? customQty : 99) : 1
//             }
//             if (customQty && customQty > 99) {
//                 let remainingQty = customQty-99
//                 const multipleOHs = [{...pData, qty: 99}]
//                 while (remainingQty > 0) {
//                     multipleOHs.push({...pData, _id: newObjectId(), qty: remainingQty > 99 ? 99 : remainingQty})
//                     remainingQty = remainingQty > 99 ? remainingQty - 99 : 0
//                 }
//                 state.onhand = [...state.onhand, ...multipleOHs]
//             } else {
//                 state.onhand[state.onhand.length] = pData
//             }
//         } else if (customQty !== undefined) { //lowering the quantity via customQty
//             if (customQty === 0) {
//                 state.onhand = state.onhand.filter(p => !(p.imgLink === pokeId && p.ball === ball))
//             } else if (!increment) {
//                 const changeDataArr = OHByPokemonStateUpdate(onhandMons, false, pokeBInColData.balls[ball], customQty, true, isHomeCollection)
//                 let remainingQtyToRemove = onhandMons.map(ohP => ohP.qty).reduce((acc, cV) => acc+cV, 0) - customQty
//                 const newQtys = changeDataArr.map(ohId => {
//                     const ohData = state.onhand.filter(p => p._id === ohId)[0]
//                     if (remainingQtyToRemove === 0) {return ohData.qty}
//                     if (ohData.qty < remainingQtyToRemove) {
//                         remainingQtyToRemove -= ohData.qty
//                         return 0
//                     } else if (ohData.qty >= remainingQtyToRemove) {
//                         const qtyDifference = ohData.qty - remainingQtyToRemove
//                         remainingQtyToRemove = 0
//                         return qtyDifference
//                     }
//                 })
//                 state.onhand = state.onhand.map(p => {
//                     const idx = changeDataArr.indexOf(p._id)
//                     const changedQty = idx !== -1
//                     if (changedQty) {
//                         p.qty = newQtys[idx]
//                         if (p.qty === 0) {
//                             return undefined
//                         }
//                     }
//                     return p
//                 }).filter(p => p !== undefined) 
//             } else {
//                 const changeData = OHByPokemonStateUpdate(onhandMons, increment, pokeBInColData.balls[ball], customQty, false, isHomeCollection) //onhand id of the pokemon to increment first.
//                 let remainingQtyToAdd = customQty - onhandMons.map(ohP => ohP.qty).reduce((a, c) => a+c, 0) //should always be greater than 0
//                 // let remainingQtyToAdd = customQty //should always be greater than 0
//                 if (onhandMons.filter(p => p._id === changeData.id).length !== 0 && onhandMons.filter(p => p._id === changeData.id)[0].qty < 99) {
//                     state.onhand = state.onhand.map((p) => {
//                         const changedQty = changeData.id === p._id
//                         if (changedQty) {
//                             if (p.qty+remainingQtyToAdd <= 99) {
//                                 p.qty += remainingQtyToAdd
//                                 remainingQtyToAdd = 0
//                             } else {
//                                 remainingQtyToAdd -= (99-p.qty)
//                                 p.qty = 99
//                             }
//                         }
//                         return p
//                     })
//                 }
//                 if (remainingQtyToAdd > 0) {
//                     const homeEmGenInit = pokeBInColData.balls[ball].eggMoveData ? getHighestEmGen(pokeBInColData.balls[ball].eggMoveData) : undefined
//                     const peripherals = {...pokeBInColData.balls[ball], isOwned: undefined, default: undefined, eggMoveData: undefined, EMs: pokeBInColData.balls[ball].eggMoveData ? pokeBInColData.balls[ball].eggMoveData[homeEmGenInit].EMs : pokeBInColData.balls[ball].EMs, emCount: pokeBInColData.balls[ball].eggMoveData ? pokeBInColData.balls[ball].eggMoveData[homeEmGenInit].emCount : pokeBInColData.balls[ball].emCount, emGen: homeEmGenInit}
//                     const pData = {
//                         _id: newObjectId(),
//                         name: pokeBInColData.name,
//                         natDexNum: pokeBInColData.natDexNum,
//                         imgLink: pokeId,
//                         haName: pokeBInColData.haName,
//                         ball,
//                         gender: pokeBInColData.possibleGender === 'both' ? 'unknown' : pokeBInColData.possibleGender,
//                         ...peripherals,
//                     }
//                     const multipleOHs = [{...pData, qty: remainingQtyToAdd > 99 ? 99 : remainingQtyToAdd}]
//                     remainingQtyToAdd = remainingQtyToAdd > 99 ? remainingQtyToAdd-99 : 0
//                     while (remainingQtyToAdd > 0) {
//                         multipleOHs.push({...pData, _id: newObjectId(), qty: remainingQtyToAdd > 99 ? 99 : remainingQtyToAdd})
//                         remainingQtyToAdd = remainingQtyToAdd > 99 ? remainingQtyToAdd - 99 : 0
//                     }
//                     state.onhand = [...state.onhand, ...multipleOHs]
//                 }    
//             }
            
//         } else {
//             const changeData = OHByPokemonStateUpdate(onhandMons, increment, pokeBInColData.balls[ball], customQty, false, isHomeCollection)
//             let addNewOnHand = false
//             const changeIdx = onhandMons.filter(p => p._id === changeData.id)[0].idx
//             if (changeData.remove) {
//                 state.onhand.splice(changeIdx, 1)
//             } else if (increment && state.onhand[changeIdx].qty === 99) {
//                 addNewOnHand = true
//             } else {
//                 state.onhand[changeIdx].qty = increment ? state.onhand[changeIdx].qty+1 : state.onhand[changeIdx].qty-1
//             }

//             if (addNewOnHand) {
//                 const homeEmGenInit = pokeBInColData.balls[ball].eggMoveData ? getHighestEmGen(pokeBInColData.balls[ball].eggMoveData) : undefined
//                 const peripherals = {...pokeBInColData.balls[ball], isOwned: undefined, default: undefined, eggMoveData: undefined, EMs: pokeBInColData.balls[ball].eggMoveData ? pokeBInColData.balls[ball].eggMoveData[homeEmGenInit].EMs : pokeBInColData.balls[ball].EMs, emCount: pokeBInColData.balls[ball].eggMoveData ? pokeBInColData.balls[ball].eggMoveData[homeEmGenInit].emCount : pokeBInColData.balls[ball].emCount, emGen: homeEmGenInit}
//                 const basicMonInfo = isAnIFormEquivalency ? state.onhand.filter(p => p.imgLink === pokeId)[0] : pokeBInColData
//                 const pData = {
//                     _id: newObjectId(),
//                     name: basicMonInfo.name,
//                     natDexNum: basicMonInfo.natDexNum,
//                     imgLink: pokeId,
//                     haName: basicMonInfo.haName,
//                     ball,
//                     gender: pokeBInColData.possibleGender === 'both' ? 'unknown' : pokeBInColData.possibleGender,
//                     ...peripherals,
//                     qty: 1
//                 }
//                 state.onhand[state.onhand.length] = pData
//             }
//         }
//         if (removeMonFromDisplay) {
//             state.listDisplay.onhand = state.listDisplay.onhand.filter(p => p.imgLink !== pokeId)
//         }
//         if (state.options.sorting.onhand.reorder) {
//             state.onhand = sortOnHandList(state.options.sorting.onhand.sortFirstBy, state.options.sorting.onhand.default, state.options.sorting.onhand.ballOrder, state.onhand)
//         }

//         if (hasLinkedCollections) {
//             state.linkedCollections[state.linkedSelectedIdx].onHand = state.onhand
//         }

//         return state
//     }

// export const enactByQtyChanges = ()