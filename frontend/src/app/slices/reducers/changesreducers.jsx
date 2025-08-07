import { current } from "@reduxjs/toolkit"

const removeRequiredFields = (state, id, ball) => {
    if (state.changes.unsavedChanges[id][ball] !== undefined && Object.keys(state.changes.unsavedChanges[id][ball]).length === 0) {
        delete state.changes.unsavedChanges[id][ball]
    }
    if (Object.keys(state.changes.unsavedChanges[id]).length === 0) {
        delete state.changes.unsavedChanges[id]
    }
}

const removeOnhandRequiredFields = (state, colId, id) => {
    if (Object.keys(state.changes.unsavedOnhandChanges[colId][id]).length === 0) {
        delete state.changes.unsavedOnhandChanges[colId][id]
    }
    if (Object.keys(state.changes.unsavedOnhandChanges[colId]).length === 0) {
        delete state.changes.unsavedOnhandChanges[colId]
    }
}

const compareEquality = (field, prev, curr) => {
    if (field.includes('EMs')) {
        const equal = prev.length === curr.length && !prev.map(em => curr.includes(em)).includes(false) && !curr.map(em => prev.includes(em)).includes(false)
        return equal
    } else {
        return prev === curr
    }
}

export const convertEmField = (field, emGen) => {
    const formattedEmGen = (emGen === '9' || emGen === 9) ? 'sv' : emGen
    return `${formattedEmGen}${field === 'emCount' ? 'EmCount' : 'EMs'}`
}

const collectionChangeFunc = (state, id, ball, field, prevValue, currValue, currDefault, tag, addDefaultMarker=false) => {
    if (prevValue !== undefined && compareEquality(field, prevValue, currValue)) {
        //this never usually happens, but it does when doing defaults, and it happens to EMs usually.
        return
    }
    const monHasUnsCh = state.changes.unsavedChanges[id] !== undefined
    const defaultChange = field === 'default' && monHasUnsCh && state.changes.unsavedChanges[id].default !== undefined
    const comboHasUnsCh = monHasUnsCh && state.changes.unsavedChanges[id][ball] !== undefined
    const comboAndFieldHaveUnsCh = comboHasUnsCh && state.changes.unsavedChanges[id][ball][field] !== undefined
    if ((comboAndFieldHaveUnsCh || defaultChange) && 
        ((
            field !== 'default' && typeof state.changes.unsavedChanges[id][ball][field] === 'boolean') || 
            compareEquality(
                field, 
                field === 'default' ? state.changes.unsavedChanges[id][field].orig : state.changes.unsavedChanges[id][ball][field].orig, 
                currValue
            ))
        ) {
        // if (field === 'isOwned' && state.changes.unsavedChanges[id][ball][field] === true) {
        //     delete state.changes.unsavedChanges[id][ball].pending
        //     delete state.changes.unsavedChanges[id][ball].highlyWanted
        // }
        // if (field === 'pending' && state.changes.unsavedChanges[id][ball][field] === true) {
        //     delete state.changes.unsavedChanges[id][ball].highlyWanted
        // }
        // if (field === 'highlyWanted' && state.changes.unsavedChanges[id][ball][field] === true) {
        //     delete state.changes.unsavedChanges[id][ball].pending
        // }
        if (field === 'isOwned' && state.changes.unsavedChanges[id][ball][field] === true) {
            const fields = Object.keys(state.changes.unsavedChanges[id][ball])
            for (let f of fields) {
                if (f !== 'tag') {
                    delete state.changes.unsavedChanges[id][ball][f]
                }
            }
        } else {
           if (field === 'default') {
                delete state.changes.unsavedChanges[id].default
            } else {
                delete state.changes.unsavedChanges[id][ball][field]
            } 
        }
        removeRequiredFields(state, id, ball)
    } else {
        if (!monHasUnsCh) {
            state.changes.unsavedChanges[id] = {}
        }
        if (!comboHasUnsCh && field !== 'default') {
            state.changes.unsavedChanges[id][ball] = {}
        }

        if (prevValue !== undefined) {
            if (state.changes.unsavedChanges[id][ball][field] === undefined) {
                state.changes.unsavedChanges[id][ball][field] = {orig: prevValue, prev: prevValue, curr: currValue}
            } else {
                state.changes.unsavedChanges[id][ball][field].prev = prevValue 
                state.changes.unsavedChanges[id][ball][field].curr = currValue
            }
        } else if (field === 'default') {
            if (state.changes.unsavedChanges[id][field] === undefined) {
                state.changes.unsavedChanges[id][field] = {orig: currDefault, curr: currValue}
            } else {
                state.changes.unsavedChanges[id][field].curr = currValue
            }
        } else if (field === 'tag') {
            if (state.changes.unsavedChanges[id][ball].tag === undefined) {
                state.changes.unsavedChanges[id][ball].tag = {orig: tag, curr: currValue}
            } else {
                state.changes.unsavedChanges[id][ball].tag.curr = currValue
            }
            
        } else {
            state.changes.unsavedChanges[id][ball][field] = currValue
            if (field === 'isOwned' && currValue === true && tag !== undefined) {
                // state.changes.unsavedChanges[id][ball][tag] = undefined
                if (state.changes.unsavedChanges[id][ball].tag !== undefined && state.changes.unsavedChanges[id][ball].tag.orig === 'none') {
                    delete state.changes.unsavedChanges[id][ball].tag
                } else {
                    if (state.changes.unsavedChanges[id][ball].tag === undefined) {
                        state.changes.unsavedChanges[id][ball].tag = {orig: tag, curr: 'none'}
                    } else {
                        state.changes.unsavedChanges[id][ball].tag.curr = 'none'
                    }
                }
            }
            // if (field === 'pending' && currValue === true && tag !== undefined) {
            //     // state.changes.unsavedChanges[id][ball].highlyWanted = undefined
            //     state.changes.unsavedChanges[id][ball].highlyWanted = false
            // }
            // if (field === 'highlyWanted' && currValue === true && tag !== undefined) {
            //     // state.changes.unsavedChanges[id][ball].pending = undefined
            //     state.changes.unsavedChanges[id][ball].pending = false
            // }
            // if (field === 'default' && currValue === true && currDefault !== undefined && currDefault !== 'none') {
            //     if (state.changes.unsavedChanges[id][currDefault] === undefined) {
            //         state.changes.unsavedChanges[id][currDefault] = {}
            //     }
            //     state.changes.unsavedChanges[id][currDefault].default = false
            // }
        } 
    }
}

const changesInitState = {
    unsavedChanges: {
        //format: [imgLink]: {[ball]: {[field]: {prev: <prevUnsavedValue>, curr: <currValue>}}}
        //exception: if field is a boolean (isOwned and isHA), then theres no prev value. the value of field is just the current value.
    },
    unsavedOnhandChanges: {
        //format: [colId]: {[onhandId]: {[field]: {prev: <prevUnsavedValue>, curr: <currValue>}}}
        //exception: if field is a boolean (isHA), then theres no prev value. the value of field is just the current value.
        //need to add colId for linked collections, to differentiate which onhand list has unsaved changes.
    }
}

const changesReducers = {
    setCollectionChange: (state, action) => {
        const {id, ball, field, prevValue, currValue, tag, currDefault, defaultData, prevDefaultData} = action.payload
        //note: home egg moves are handled by labelling the gen in the field itself. so for swsh ems, the field becomes "swshEMs" or "swshEmCount". 
        collectionChangeFunc(state, id, ball, field, prevValue, currValue, currDefault, tag)
        if (defaultData) {
            Object.keys(defaultData).forEach(f => {
                collectionChangeFunc(state, id, ball, f, prevDefaultData[f], defaultData[f], undefined, undefined, true)
            })
        } 
        state.saveChangesConfirmModal = false
        return state
    },

    setOnhandChange: (state, action) => {
        const {colId, id, field, prevValue, currValue, newOnhands} = action.payload

        if (prevValue !== undefined && compareEquality(field, prevValue, currValue)) {
            return state
        }

        if (newOnhands) {
            if (state.changes.unsavedOnhandChanges[colId] === undefined) {
                state.changes.unsavedOnhandChanges[colId] = {}
            }
            newOnhands.forEach(nOH => {
                state.changes.unsavedOnhandChanges[colId][nOH._id] = {new: true}
                const fields = Object.keys(nOH)
                fields.forEach((f) => {
                    if (f === 'emCount' || f === 'EMs' || f === 'emGen' || f === 'ball' || f === 'gender' || f === 'qty') {
                        //these are all the fields that we want to track prev changes
                        state.changes.unsavedOnhandChanges[colId][nOH._id][f] = {orig: undefined, prev: nOH[f], curr: nOH[f]}
                    } else {
                        state.changes.unsavedOnhandChanges[colId][nOH._id][f] = nOH[f]
                    }
                })
            })
            return state
        }

        const onhandColHasUnsCh = state.changes.unsavedOnhandChanges[colId] !== undefined
        const onhandHasUnsCh = onhandColHasUnsCh && state.changes.unsavedOnhandChanges[colId][id] !== undefined
        const fieldHasUnsCh = onhandHasUnsCh && state.changes.unsavedOnhandChanges[colId][id][field] !== undefined



        if (fieldHasUnsCh && !state.changes.unsavedOnhandChanges[colId][id].new && (typeof state.changes.unsavedOnhandChanges[colId][id][field] === 'boolean' || compareEquality(field, state.changes.unsavedOnhandChanges[colId][id][field].orig, currValue))) {
            delete state.changes.unsavedOnhandChanges[colId][id][field]
            removeOnhandRequiredFields(state, colId, id) 
            return state
        }

        if (!onhandColHasUnsCh) {
            state.changes.unsavedOnhandChanges[colId] = {}
        }
        if (!onhandHasUnsCh) {
            state.changes.unsavedOnhandChanges[colId][id] = {}
        }

        if (prevValue !== undefined) {
            if (state.changes.unsavedOnhandChanges[colId][id][field] === undefined) {
                if (field === 'qty' && currValue === 0) {
                    state.changes.unsavedOnhandChanges[colId][id] = {remove: true} 
                } else {
                    state.changes.unsavedOnhandChanges[colId][id][field] = {orig: prevValue, prev: prevValue, curr: currValue}
                }
            } else {
                state.changes.unsavedOnhandChanges[colId][id][field].prev = prevValue 
                state.changes.unsavedOnhandChanges[colId][id][field].curr = currValue
                if (field === 'qty' && currValue === 0) {
                    if (state.changes.unsavedOnhandChanges[colId][id].new = true) {
                        delete state.changes.unsavedOnhandChanges[colId][id]
                        if (Object.keys(state.changes.unsavedOnhandChanges[colId]).length === 0) {
                            delete state.changes.unsavedOnhandChanges[colId]
                        }
                    } else {
                       state.changes.unsavedOnhandChanges[colId][id] = {remove: true} 
                    }
                }
            }
        } else {
            state.changes.unsavedOnhandChanges[colId][id][field] = currValue
        }
        state.saveChangesConfirmModal = false

        return state
    },

    resetChanges: (state, action) => {
        state.changes = changesInitState
        state.saveChangesConfirmModal = false
        return state
    },

    resetChangesAndUnitialize: (state, action) => {
        state.changes = changesInitState
        state.selected = '',
        state.selectedBall = '',
        state.saveChangesConfirmModal = false
        return state
    }
}

export {changesReducers, changesInitState}