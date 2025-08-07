import { sortOnHandList } from "../../../../common/sortingfunctions/onhandsorting.mjs"
import { sortList } from "../../../../common/sortingfunctions/customsorting.mjs"
import initializeLinkedCollectionDisplay from "../linkedcollectionsreducers/initializelistdisplay"
import { collectionsFiltersInit } from "./displayreducers"
import { comparePokemonNames } from "./scopereducers"
import { resetFilters } from "../linkedcollectionsreducers/initialize"
const optionsInitialState = {collectingBalls: [], globalDefaults: {}, sorting: {}, tradePreferences: {status: 'closed', size: 'any', onhandOnly: 'no', items: 'none', rates: {pokemonOffers: [], itemOffers: []}, lfItems: [], ftItems: {}}, collectionName: ''}

const optionsReducers = {
    setRate: (state, action) => {
        const {addingNew, removingRate, newRates, rateIdx, offerType, field, fieldIdx, value} = action.payload
        state.options.tradePreferences.rates = newRates
        const isLinkedCollection = state.linkedCollections !== undefined
        if (isLinkedCollection) {
            state.linkedCollections[state.linkedSelectedIdx].options.tradePreferences.rates = newRates
        }
        // if (addingNew) {
        //     const newRate = {items: ['', ''], rate: [1, 1]}
        //     state.tradePreferences.rates[offerType][state.tradePreferences.rates[offerType].length] = newRate
        //     return state
        // }
        // if (removingRate) {
        //     const newRateArr = state.tradePreferences.rates[offerType].filter((rate, idx) => idx !== rateIdx)
        //     state.tradePreferences.rates[offerType] = newRateArr
        //     return state
        // }
        // state.tradePreferences.rates[offerType][rateIdx][field][fieldIdx] = value
        return state
    },
    setBallScope: (state, action) => {
        const {newCollectingBalls, newListState, removedPokemon=[]} = action.payload
        state.options.collectingBalls = newCollectingBalls
        if (state.linkedCollections !== undefined) {
            state.linkedCollections[0].ownedPokemon = newListState
            if (state.linkedSelectedIdx !== 0 && removedPokemon.length !== 0) {
                state.linkedCollections[state.linkedSelectedIdx].ownedPokemon = state.linkedCollections[state.linkedSelectedIdx].ownedPokemon.filter(p => removedPokemon.filter(p2 => comparePokemonNames(p2.name, p.name)).length === 0)
            }
            state.linkedCollections[state.linkedSelectedIdx].options.collectingBalls = newCollectingBalls
        }
        if (newListState) {
            state.collection = newListState
            if (state.linkedCollections !== undefined && state.linkedSelectedIdx !== 0) {
                state.subList = initializeLinkedCollectionDisplay(state.linkedCollections[state.linkedSelectedIdx].ownedPokemon, state.collection, state.linkedCollections[state.linkedSelectedIdx].gen)
                state.listDisplay.collection = state.subList
            } else {
                state.listDisplay.collection = newListState.filter(p => !p.disabled)
            }
            state.listDisplay.collectionFilters = {sort: '', filters: collectionsFiltersInit}
            state.listDisplay.filterSearchTerm = ''
        }
        // const newState = {...state, collectingBalls: action.payload}
        return state
    },
    setSortingOptionsState: (state, action) => {
        const {listType, data} = action.payload
        state.options.sorting[listType] = data
        const isLinkedCollection = state.linkedCollections !== undefined
        if (isLinkedCollection) {
            state.linkedCollections[state.linkedSelectedIdx].options.sorting[listType] = data
        }
        if (!(data.reorder === false) && listType === 'onhand') {
            state.onhand = sortOnHandList(data.sortFirstBy, data.default, data.ballOrder, state.onhand)
            state.listDisplay.onhand = sortOnHandList(data.sortFirstBy, data.default, data.ballOrder, state.listDisplay.onhand)
        } else if (!(data.reorder === false) && listType === 'collection') {
            if (isLinkedCollection) {
                state.linkedCollections[state.linkedSelectedIdx].ownedPokemon = sortList(data.default, state.linkedCollections[state.linkedSelectedIdx].ownedPokemon)
            }
            const subListActive = isLinkedCollection && state.linkedSelectedIdx !== 0
            if (subListActive) {
                state.subList = sortList(data.default, state.subList)
            } else {
                state.collection = sortList(data.default, state.collection)
            }
            state.listDisplay.collection = sortList(data.default, state.listDisplay.collection)
        }
        return state
    },
    customSortList: (state, action) => {
        const {sortingOrder} = action.payload

        const isLinkedCollection = state.linkedCollections !== undefined
        const subListActive = isLinkedCollection && state.linkedSelectedIdx !== 0
        const listToSort = subListActive ? state.linkedCollections[state.linkedSelectedIdx].ownedPokemon : state.collection

        const newCollectionList = listToSort.sort((a, b) => {
            const aSortOrder = sortingOrder[a.name]
            const bSortOrder = sortingOrder[b.name]
            return aSortOrder > bSortOrder ? 1 : -1
        })

        if (subListActive) {
            state.linkedCollections[state.linkedSelectedIdx].ownedPokemon = newCollectionList
            state.subList = state.subList.sort((a, b) => {
                const aSortOrder = sortingOrder[a.name]
                const bSortOrder = sortingOrder[b.name]
                return aSortOrder > bSortOrder ? 1 : -1
            })
        } else {
            if (isLinkedCollection) {
                state.linkedCollections[0].ownedPokemon = newCollectionList
                state.collection = newCollectionList
            }
        }

        state.listDisplay.collection = subListActive ? state.subList : state.collection.filter(p => p.disabled === undefined)
        resetFilters(state, 'collection')

        return state
    },
    setTradePreferencesState: (state, action) => {
        const newTradePreferencesObj = action.payload
        state.options.tradePreferences = newTradePreferencesObj
        const isLinkedCollection = state.linkedCollections !== undefined
        if (isLinkedCollection) {
            state.linkedCollections[state.linkedSelectedIdx].options.tradePreferences = newTradePreferencesObj
        }
        return state
    },
    setItemState: (state, action) => {
        const {lfItems, ftItems} = action.payload
        state.options.tradePreferences = {...state.options.tradePreferences, lfItems, ftItems}
        const isLinkedCollection = state.linkedCollections !== undefined
        if (isLinkedCollection) {
            state.linkedCollections[state.linkedSelectedIdx].options.tradePreferences = {...state.linkedCollections[state.linkedSelectedIdx].options.tradePreferences, lfItems, ftItems}
        }
        return state
    },
    setNameState: (state, action) => {
        const {name, globalDefault} = action.payload
        const isLinkedCollection = state.linkedCollections !== undefined
        if (globalDefault !== undefined) {
            state.options.globalDefaults = globalDefault
            if (isLinkedCollection) {
                state.linkedCollections[state.linkedSelectedIdx].options.globalDefaults = globalDefault
            }
        }
        state.options.collectionName = name
        if (isLinkedCollection) {
            state.linkedCollections[state.linkedSelectedIdx].name = name
        }
        return state
    },
    setGlobalDefaultState: (state, action) => {
        const isLinkedCollection = state.linkedCollections !== undefined
        state.options.globalDefaults = action.payload
        if (isLinkedCollection) {
            state.linkedCollections[state.linkedSelectedIdx].options.globalDefaults = action.payload
        }
        return state
    }
}

export {optionsInitialState, optionsReducers}