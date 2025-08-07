import { filterList } from "../../../../utils/functions/sortfilterfunctions/filterfunctions"
import { current } from "@reduxjs/toolkit"
import { sortList } from "../../../../common/sortingfunctions/customsorting.mjs"
import { sortOnHandList } from "../../../../common/sortingfunctions/onhandsorting.mjs"
import { apriballs, homeDisplayGames } from "../../../../common/infoconstants/miscconstants.mjs"
import getNameDisplay from "../../../../utils/functions/display/getnamedisplay"
import { hideFullSets } from "../../../../utils/functions/display/fullsetview"
import {updateListWithNewOnHands} from "../../../../utils/functions/display/displayonhandbypokemon"
import { removeByPokemonOhandsFromList } from "../../../components/collectiontable/onhandlist/onhandbypokemonupdates/ohbypokemonstateupdate"
import { hideEmptySets } from "../../../../utils/functions/display/emptysetview"
import checkIfNeedToRefilterList from "../../../../utils/functions/sortfilterfunctions/checkifneedtorefilter"
import filterStateUpdate from "../../../../utils/functions/sortfilterfunctions/filterstateupdate"
import displayOnHandByPokemon from "../../../../utils/functions/display/displayonhandbypokemon"
import { filterListCompletely } from "../../../../utils/functions/sortfilterfunctions/filterfunctions"
import { selectCorrectOpList } from "../../selectors/linkedcolsselectors"

//operations related to editing the display state of the lists, to edit what is shown, how much is shown, etc.
//used to give how much data is given to the table renderer (for filtering lists, for example)

export const collectionsFiltersInit = {
    ballFilters: [], 
    genFilters: [], 
    gameFilters: [],
    tagFilter: '',
    otherFilters: []
}

export const onhandFiltersInit = {
    ballFilters: [], 
    genFilters: [], 
    gameFilters: [],
    otherFilters: []
}

const listDisplayInitialState = {
    collection: [], 
    onhand: [], 
    collectionFilters: {
        sort: '', 
        filters: {
            ballFilters: [], 
            genFilters: [], 
            gameFilters: [],
            tagFilter: '',
            otherFilters: []
        }
    }, 
    onhandFilters: {
        sort: '', 
        filters: {
            ballFilters: [], 
            genFilters: [], 
            gameFilters: [],
            otherFilters: []
        }
    }, 
    filterSearchTerm: '',
    onhandView: 'byIndividual', 
    showFullSets: true,
    showEmptySets: true,
    showHAView: false,
    homeEMView: 'hidden',
    forceRefilter: false //this will force a refilter the first time table data is edited
}

const displayReducers = {
    setListState: (state, action) => {
        const {collection, onhand, resetCollectionFilters, resetOnHandFilters, updatedEggMoveInfo, updatedHomeGames, onlyUpdateCollection, onlyUpdateOnHand, demo} = action.payload
        if (onlyUpdateOnHand === undefined) {
            state.listDisplay.collection = collection.filter(pokemon => pokemon.disabled === undefined)
            state.collection = collection
        }
        if (!onlyUpdateCollection) {
            state.listDisplay.onhand = onhand
            state.onhand = onhand
        }
        if (resetCollectionFilters) {
            state.listDisplay.filterSearchTerm = ''
            state.listDisplay.collectionFilters = {sort: '', filters: collectionsFiltersInit}
        }
        if (resetOnHandFilters) {
            state.listDisplay.filterSearchTerm = ''
            state.listDisplay.onhandFilters = {sort: '', filters: onhandFiltersInit}
        }
        if (updatedEggMoveInfo !== undefined) {
            state.eggMoveInfo = demo ? {...state.eggMoveInfo, ...updatedEggMoveInfo} : updatedEggMoveInfo
            if (state.linkedCollections !== undefined && state.linkedSelectedIdx !== 0) {
                state.linkedCollections[state.linkedSelectedIdx].eggMoveInfo = updatedEggMoveInfo
            }
        }
        if (updatedHomeGames !== undefined) {
            state.availableGamesInfo = demo ? {...state.availableGamesInfo, ...updatedHomeGames} : updatedHomeGames
            if (state.linkedCollections !== undefined && state.linkedSelectedIdx === 0) {
                state.linkedCollections[state.linkedSelectedIdx].availableGamesInfo = updatedHomeGames
            }
        }
        return state
    },
    addOnHandPokemonToList: (state, action) => {
        const {newOnhand, sortingOptions} = action.payload
        const hasLinkedCollections = state.linkedCollections !== undefined
        if (Array.isArray(newOnhand)) {
            state.onhand = [...state.onhand, ...newOnhand]
            if (state.listDisplay.onhandView === 'byPokemon') {
                state.listDisplay.onhand = updateListWithNewOnHands(newOnhand, state.listDisplay.onhand, state.collection)
            } else {
                state.listDisplay.onhand = [...state.listDisplay.onhand, ...newOnhand]
            }
        } else {
            state.onhand[state.onhand.length] = newOnhand
            if (state.listDisplay.onhandView === 'byPokemon') {
                state.listDisplay.onhand = updateListWithNewOnHands([newOnhand], state.listDisplay.onhand, state.collection)
            } else {
                state.listDisplay.onhand[state.listDisplay.onhand.length] = newOnhand
            }
        }
        const trueSortingOptions = sortingOptions === undefined ? state.options.sorting.onhand : sortingOptions
        if (trueSortingOptions.reorder) {
            state.onhand = sortOnHandList(trueSortingOptions.sortFirstBy, trueSortingOptions.default, trueSortingOptions.ballOrder, state.onhand)
            state.listDisplay.onhand = sortOnHandList(trueSortingOptions.sortFirstBy, trueSortingOptions.default, trueSortingOptions.ballOrder, state.listDisplay.onhand)
        }
        if (hasLinkedCollections) {
            state.linkedCollections[state.linkedSelectedIdx].onHand = state.onhand
        }
        return state
    },
    addOnHandPokemonToListByPokemon: (state, action) => { 
        //via by pokemon detailed edit => +1. primarily used since we dont need to update the listDisplay 
        //(because if we are adding to the list this way, they are already in the listdisplay, and the row will update via mapstatetoprops selectors). 
        //always updates a single
        const newOnhand = action.payload
        const hasLinkedCollections = state.linkedCollections !== undefined
        state.onhand[state.onhand.length] = newOnhand
        if (state.options.sorting.onhand.reorder) {
            state.onhand = sortOnHandList(state.options.sorting.onhand.sortFirstBy, state.options.sorting.onhand.default, state.options.sorting.onhand.ballOrder, state.onhand)
        }
        if (hasLinkedCollections) {
            state.linkedCollections[state.linkedSelectedIdx].onHand = state.onhand
        }
        return state
    },
    removeOnHandPokemonFromList: (state, action) => {
        const {pokemonid, byPAddon} = action.payload
        const hasLinkedCollections = state.linkedCollections !== undefined
        const byP = state.listDisplay.onhandView === 'byPokemon'
        const multipleRemoves = Array.isArray(pokemonid)
        if (multipleRemoves) {
            state.onhand = state.onhand.filter(p => !pokemonid.includes(p._id))
            if (hasLinkedCollections) {
                state.linkedCollections[state.linkedSelectedIdx].onHand = state.onhand
            }
            state.listDisplay.onhand = byP ? removeByPokemonOhandsFromList(state.listDisplay.onhand, pokemonid) : state.listDisplay.onhand.filter(p => !pokemonid.includes(p._id))
            return state
        }
        if (byP) {
            state.onhand = state.onhand.filter(p => pokemonid !== p._id)
            if (hasLinkedCollections) {
                state.linkedCollections[state.linkedSelectedIdx].onHand = state.onhand
            }

            const needToUpdateListDisplay = state.onhand.filter(p => p.imgLink === byPAddon.slice(0, byPAddon.indexOf(' '))).length === 0 
            //indicates no more onhands of mon exists. the quantity in the list display will update regardless since the selectors
            //in swbypokemonrow use state.onhand to calculate the qty. changing the list display is only needed if there is no longer any onhands of the pokemon.
            if (needToUpdateListDisplay) {
                state.listDisplay.onhand = state.listDisplay.onhand.map((p) => {
                    const monImgL = byPAddon.slice(0, byPAddon.indexOf(' '))
                    if (p.imgLink === monImgL) {
                            return undefined
                    }
                    return p
                }).filter(p => p !== undefined)
            }
            
            return state
        }
        state.onhand = state.onhand.filter(p => pokemonid !== p._id)
        state.listDisplay.onhand = state.listDisplay.onhand.filter(p => pokemonid !== p._id)
        if (hasLinkedCollections) {
            state.linkedCollections[state.linkedSelectedIdx].onHand = state.onhand
        }
        return state
    },
    setSortKey: (state, action) => {
        const {sortKey, listType} = action.payload
        state.listDisplay[listType] = sortList(sortKey, state.listDisplay[listType])
        state.listDisplay[`${listType}Filters`].sort = sortKey
        return state
    },
    setFilters: (state, action) => {
        const {filterKey, filterCategory, listType, userNameDisplaySettings} = action.payload
        const filtersObj = state.listDisplay[`${listType}Filters`].filters
        const {list, newFiltersObj} = filterStateUpdate(
            filterKey, filterCategory, filtersObj, listType, 
            (state.linkedSelectedIdx !== 0 && listType === 'collection') ? state.subList : state[listType], 
            state.listDisplay[listType], state.listDisplay[`${listType}Filters`].sort, state.availableGamesInfo,
            state.listDisplay.showFullSets, state.listDisplay.showEmptySets, state.listDisplay.onhandView, 
            state.listDisplay.filterSearchTerm, userNameDisplaySettings, state.listDisplay.forceRefilter
        )
        state.listDisplay[listType] = list
        state.listDisplay[`${listType}Filters`].filters = newFiltersObj
        return state
    },
    filterSearch: (state, action) => {
        const {searchQuery, listType, reFilterList, nameDisplaySettings} = action.payload
        const totalList = state.linkedSelectedIdx !== 0 ? (listType === 'collection' ? state.subList : state.onhand) : state[listType]
        const listState = state.listDisplay[listType]
        const listToUse = reFilterList ? totalList : listState
        const newListState = state.listDisplay[`${listType}Filters`].sort ? sortList(currentSortKey, listToUse.filter((pokemon) => getNameDisplay(nameDisplaySettings, pokemon.name, pokemon.natDexNum).toLowerCase().includes(searchQuery.toLowerCase()))) : listToUse.filter((pokemon) => getNameDisplay(nameDisplaySettings, pokemon.name, pokemon.natDexNum).toLowerCase().includes(searchQuery.toLowerCase()))
        state.listDisplay[listType] = newListState
        state.listDisplay.filterSearchTerm = searchQuery
        // const newState = {...state, [listType]: newListStateSorted}
        return state
    },
    setOnHandView: (state, action) => {
        const {nameDisplaySettings} = action.payload
        if (state.listDisplay.onhandView === 'byIndividual') {
            state.listDisplay.onhand = displayOnHandByPokemon(state.listDisplay.onhand, state.collection)
            state.listDisplay.onhandView = 'byPokemon'
        }
        else {
            const filtersData = state.listDisplay.onhandFilters.filters
            state.listDisplay.onhand = filterListCompletely(state.onhand, filtersData, state.listDisplay.onhandFilters.sort, state.listDisplay.filterSearchTerm, state.availableGamesInfo, 'onhand', undefined, undefined, nameDisplaySettings)
            // state.listDisplay.onhand = filterList(state.onhand, '', '', 'onhand', useState ? state.onhand : action.payload.onhand, true, filtersData, state.listDisplay.onhandFilters.sort, state.availableGamesInfo)
            state.listDisplay.onhandView = 'byIndividual'
        }
        return state
    },
    toggleFullSetView: (state, action) => {
        const {nameDisplaySettings} = action.payload
        state.listDisplay.showFullSets = !state.listDisplay.showFullSets
        if (state.listDisplay.showFullSets) {
            const filtersData = state.listDisplay.collectionFilters.filters
            const colDataToUse = selectCorrectOpList(state)
            // state.listDisplay.collection = filterList(colDataToUse, '', '', 'collection', colDataToUse, true, filtersData, state.listDisplay.collectionFilters.sort, state.availableGamesInfo, state.listDisplay.showFullSets, state.listDisplay.showEmptySets)
            state.listDisplay.collection = filterListCompletely(colDataToUse, filtersData, state.listDisplay.collectionFilters.sort, state.listDisplay.filterSearchTerm, state.availableGamesInfo, 'collection', state.listDisplay.showFullSets, state.listDisplay.showEmptySets, nameDisplaySettings)
        } else {
            state.listDisplay.collection = hideFullSets(state.listDisplay.collection)
        }
        return state
    },
     toggleEmptySetView: (state, action) => {
        const {nameDisplaySettings} = action.payload
        state.listDisplay.showEmptySets = !state.listDisplay.showEmptySets
        if (state.listDisplay.showEmptySets) {
            const filtersData = state.listDisplay.collectionFilters.filters
            const colDataToUse = selectCorrectOpList(state)
            // state.listDisplay.collection = filterList(colDataToUse, '', '', 'collection', colDataToUse, true, filtersData, state.listDisplay.collectionFilters.sort, state.availableGamesInfo, state.listDisplay.showFullSets, state.listDisplay.showEmptySets)
            state.listDisplay.collection = filterListCompletely(colDataToUse, filtersData, state.listDisplay.collectionFilters.sort, state.listDisplay.filterSearchTerm, state.availableGamesInfo, 'collection', state.listDisplay.showFullSets, state.listDisplay.showEmptySets, nameDisplaySettings)
        } else {
            state.listDisplay.collection = hideEmptySets(state.listDisplay.collection)
        }
        return state
    },
    toggleHomeEMView: (state, action) => {
        state.listDisplay.homeEMView = action.payload
        return state
    }
}

export {listDisplayInitialState, displayReducers}