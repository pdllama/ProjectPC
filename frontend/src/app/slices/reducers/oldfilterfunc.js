const setFilters = (state, action) => {
    const {filterKey, listType, listState, totalList, reFilterList, noFilters, prevActiveFilters, specificCategoryFilters, currentSortKey, changingTagBallFilters, switchingTags, numberButIsGameFilter=false, switchingBetweenNoGameAndGame=false, availableGamesInfo} = action.payload
    const filterCategory = numberButIsGameFilter ? 'otherFilters' : typeof filterKey === 'number' ? 'genFilters' : 
                            apriballs.includes(filterKey) ? 'ballFilters' : 'otherFilters'
    const otherTag = (filterCategory === 'otherFilters' && filterKey === 'highlyWanted') ? 'pending' : (filterCategory === 'otherFilters' && filterKey === 'pending') ? 'highlyWanted' : 'none'
    const newActiveFilterList = specificCategoryFilters.includes(filterKey) ? 
                                    specificCategoryFilters.filter((key) => key !== filterKey) :
                                    switchingTags ? [...specificCategoryFilters.filter(f => filterKey === 'highlyWanted' ? f !== 'pending' : f !== 'highlyWanted'), filterKey] : 
                                    switchingBetweenNoGameAndGame ? [...specificCategoryFilters.filter(f => filterKey === 'no-game' ? !homeDisplayGames.includes(f) : f !== 'no-game'), filterKey] :
                                    [...specificCategoryFilters, filterKey]
    // const newTotalActiveFilterList = prevActiveFilters.includes(filterKey) ? prevActiveFilters.filter((key) => key !== filterKey) :
    //                                 switchingTags ? prevActiveFilters.filter((key) => key !== otherTag).concat([filterKey]) : 
    //                                 (changingTagBallFilters && filterCategory === 'ballFilters') ? [...prevActiveFilters.filter((key) => (key !== 'highlyWanted') || (key !== 'pending')), filterKey] : 
    //                                 (changingTagBallFilters && filterCategory === 'otherFilters') ? [...prevActiveFilters.filter((key) => !apriballs.includes(key)), filterKey] : 
    //                                 [...prevActiveFilters, filterKey]
    const listSpecificFilters = state.listDisplay[`${listType}Filters`].filters
    if (changingTagBallFilters && filterCategory === 'ballFilters') {state.listDisplay[`${listType}Filters`].filters.otherFilters = [...state.listDisplay[`${listType}Filters`].filters.otherFilters.filter(k => k !== 'highlyWanted' && k !== 'pending')]}
    if (changingTagBallFilters && filterCategory === 'otherFilters') {state.listDisplay[`${listType}Filters`].filters.ballFilters = []}
    const specificCatCurrFilters = listSpecificFilters[filterCategory]
    const newCatActiveFilterList = {
        [filterCategory]: specificCatCurrFilters.includes(filterKey) ? specificCatCurrFilters.filter(k => k !== filterKey) : 
            switchingTags ? specificCatCurrFilters.filter(k => k !== otherTag).concat([filterKey]) : 
            // changingTagBallFilters && filterCategory === 'ballFilters' ? [...specificCatCurrFilters.filter(k => k !== 'highlyWanted' && k !== 'pending'), filterKey] : 
            // changingTagBallFilters && filterCategory === 'otherFilters' ? [...specificCatCurrFilters.filter(k => !apriballs.includes(k)), filterKey] : 
            switchingBetweenNoGameAndGame ? [...specificCatCurrFilters.filter(f => filterKey === 'no-game' ? !homeDisplayGames.includes(f) : f !== 'no-game'), filterKey] :
            [...specificCatCurrFilters, filterKey] 
    }
    const newTotalActiveFilterList = {
        genFilters: listSpecificFilters.genFilters,
        ballFilters: listSpecificFilters.ballFilters,
        otherFilters: listSpecificFilters.otherFilters,
        ...newCatActiveFilterList
    }
    const removingGenFilter = typeof filterKey === 'number' && specificCategoryFilters.includes(filterKey) && !numberButIsGameFilter                               
    if (reFilterList) {
        const filteredList = filterList([], filterKey, filterCategory, listType, totalList, reFilterList, newTotalActiveFilterList, currentSortKey, availableGamesInfo, state.listDisplay.showFullSets, state.listDisplay.showEmptySets)
        state.listDisplay[listType] = filteredList
        state.listDisplay[`${listType}Filters`].filters[filterCategory] = newActiveFilterList
        
        // const newState = (changingTagBallFilters && filterCategory === 'ballFilters') ? 
        //     {...state, [listType]: filteredList, [`${listType}Filters`]: {...state[`${listType}Filters`], filters: {...state[`${listType}Filters`].filters, [filterCategory]: newActiveFilterList, otherFilters: []}}} :
        //     (changingTagBallFilters && filterCategory === 'otherFilters') ?
        //     {...state, [listType]: filteredList, [`${listType}Filters`]: {...state[`${listType}Filters`], filters: {...state[`${listType}Filters`].filters, [filterCategory]: newActiveFilterList, ballFilters: []}}} : 
        //     {...state, [listType]: filteredList, [`${listType}Filters`]: {...state[`${listType}Filters`], filters: {...state[`${listType}Filters`].filters, [filterCategory]: newActiveFilterList}}}
        return state
    }
    if (noFilters) {
        const totalListStep1 = listType === 'collection' && !state.listDisplay.showFullSets ? hideFullSets(totalList) : totalList
        const totalListStep2 = listType === 'collection' && !state.listDisplay.showEmptySets ? hideEmptySets(totalListStep1) : totalListStep1
        const correctlySortedTotalList = currentSortKey === '' ? totalListStep2 : sortList(currentSortKey, totalListStep2)
        state.listDisplay[listType] = correctlySortedTotalList
        state.listDisplay[`${listType}Filters`].filters = {ballFilters: [], genFilters: [], otherFilters: []}
        // const newState = {...state, [`${listType}Filters`]: {...state[`${listType}Filters`], filters: {ballFilters: [], genFilters: [], otherFilters: []}}, [listType]: correctlySortedTotalList}
        return state
    }
    if (removingGenFilter) {
        const filteredList = listState.filter((pokemon) => pokemon.gen !== filterKey)
        state.listDisplay[listType] = filteredList
        state.listDisplay[`${listType}Filters`].filters[filterCategory] = newActiveFilterList
        // const newState = {...state, [listType]: filteredList, [`${listType}Filters`]: {...state[`${listType}Filters`], filters: {...state[`${listType}Filters`].filters, [filterCategory]: newActiveFilterList}}}
        return state
    }
    const filteredList = filterList(listState, filterKey, filterCategory, listType, [], false, newActiveFilterList, '', availableGamesInfo)
    state.listDisplay[listType] = filteredList
    state.listDisplay[`${listType}Filters`].filters[filterCategory] = newActiveFilterList
    // const newState = {...state, [listType]: filteredList, [`${listType}Filters`]: {...state[`${listType}Filters`], filters: {...state[`${listType}Filters`].filters, [filterCategory]: newActiveFilterList}}}
    return state
}