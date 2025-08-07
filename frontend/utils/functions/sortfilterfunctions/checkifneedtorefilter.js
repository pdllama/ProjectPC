import { homeDisplayGames } from "../../../common/infoconstants/miscconstants.mjs"

export default function checkIfNeedToRefilterList(filterKey, filterCategory, filterObj, numOfActiveFilters, listType, removingFilter, switchBetweenTagAndBall=undefined) {
    const g = filterCategory === 'genFilters'
    const b = filterCategory === 'ballFilters'
    const ga = filterCategory === 'gameFilters'
    const t = filterCategory === 'tagFilter'
    // const o = filterCategory === 'otherFilters'

    const removingBallFilter = b && removingFilter
    const addingGenFilter = g && !removingFilter
    const removingLastGenFilter = g && numOfActiveFilters > 1 && filterObj[filterCategory].length === 1 && removingFilter
    //^^ when other filters are active
    const ballFilterOnHand = b && listType === 'onhand' 
    const switchingBetweenTagAndBallFilters = switchBetweenTagAndBall ? switchBetweenTagAndBall : (b && filterObj.tagFilter || t && filterObj.ballFilters.length !== 0)
    const switchingOrRemovingTags = t && filterObj.tagFilter
    const switchingBetweenNoGameOrGame = ga && ((filterKey === 'no-game' && filterObj.gameFilters.length !== 0) || (filterKey !== 'no-game' && filterObj.gameFilters[0] === 'no-game'))
    const removingGameFilter = ga && filterKey !== 'no-game' && removingFilter

    return removingBallFilter || addingGenFilter || removingLastGenFilter || ballFilterOnHand || 
        switchingBetweenTagAndBallFilters || switchingOrRemovingTags || switchingBetweenNoGameOrGame || removingGameFilter
}
