import checkIfNeedToRefilterList from "./checkifneedtorefilter";
import { filterListCompletely, filterListSingle } from "./filterfunctions";
import { findGenByDexNum } from "../../../common/infoconstants/miscconstants.mjs";
import displayOnHandByPokemon from "../display/displayonhandbypokemon";

export default function filterStateUpdate(filterKey, filterCategory, filtersObj, listType, totalList, currentList, sortKey, availableGamesInfo, showFullSets, showEmptySets, onhandViewType, searchTerm, userNameDisplaySettings, forceRefilter) {
    const numOfActiveFilters = Object.values(filtersObj).reduce((acc, currVal) => Array.isArray(currVal) ? acc+currVal.length : currVal==='' ? acc : acc+1, 0)
    const activeCatFilters = filtersObj[filterCategory]
    const removingFilter = Array.isArray(activeCatFilters) ? activeCatFilters.includes(filterKey) : activeCatFilters === filterKey

    const switchingBetweenTagAndBall = (filterCategory === 'ballFilters' && filtersObj.tagFilter || filterCategory === 'tagFilter' && filtersObj.ballFilters.length !== 0)
    const needToRefilter = forceRefilter ? true : checkIfNeedToRefilterList(filterKey, filterCategory, filtersObj, numOfActiveFilters, listType, removingFilter, switchingBetweenTagAndBall ? true : undefined)
    const newCatFilterList = !Array.isArray(activeCatFilters) ? 
        removingFilter ? {[filterCategory]: ''} : {[filterCategory]: filterKey} : 
        (filterCategory === 'gameFilters') ? (
            filterKey === 'no-game' ? {gameFilters: removingFilter ? [] : ['no-game']} : {gameFilters: removingFilter ? activeCatFilters.filter(f => f !== filterKey ) : [...activeCatFilters.filter(f => f !== 'no-game'), filterKey]} 
        ) : 
        removingFilter ? {[filterCategory]: activeCatFilters.filter(f => f !== filterKey)} : {[filterCategory]: [...activeCatFilters, filterKey]}
    
    const otherCatFilterList = switchingBetweenTagAndBall ? filterCategory === 'ballFilters' ? {tagFilter: ''} : {ballFilters: []} : {}
    const totalNewFiltersObj = {...filtersObj, ...newCatFilterList, ...otherCatFilterList}

    const removingGenFilter = filterCategory === 'genFilters' && removingFilter
    //above is a strange case where the current filtering function doesn't cover it and yet the list doesnt need to be refiltered (unless its the last gen filter)
    //it was singled out but its possible to just add it to a refiltering case.

    if (forceRefilter) {
        forceRefilter = false
    }

    if (needToRefilter) {
        const filteredList = filterListCompletely(
            (listType === 'onhand' && onhandViewType === 'byPokemon') ? displayOnHandByPokemon(totalList) : totalList, 
            totalNewFiltersObj, sortKey, searchTerm, availableGamesInfo, listType, showFullSets, showEmptySets, userNameDisplaySettings
        )
        return {list: filteredList, newFiltersObj: totalNewFiltersObj}
    } else if (numOfActiveFilters === 1 && removingFilter) {
        const filteredList = (!showFullSets || !showEmptySets || searchTerm !== '' || sortKey !== '') ? 
        filterListCompletely(totalList, {}, sortKey, searchTerm, {}, listType, showFullSets, showEmptySets, userNameDisplaySettings) : totalList
        return {list: filteredList, newFiltersObj: totalNewFiltersObj}
    } else if (removingGenFilter) {
        const filteredList = currentList.filter(p => (p.gen ? p.gen : findGenByDexNum(p.natDexNum)) !== filterKey)
        return {list: filteredList, newFiltersObj: totalNewFiltersObj}
    } else {
        const filteredList = filterListSingle(currentList, filterKey, filterCategory, totalNewFiltersObj[filterCategory], listType, availableGamesInfo)
        return {list: filteredList, newFiltersObj: totalNewFiltersObj}
    }
}