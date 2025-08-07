import { findGenByDexNum } from "../../../common/infoconstants/miscconstants.mjs";

export function filterSingleMonByGen(p, genFilters) {
    let passed = true
    for (let key of genFilters) {
        if (key === p.gen || key === findGenByDexNum(p.natDexNum)) {
            break
        }
        if (genFilters[genFilters.length-1] === key) {
            passed = false
        }
    }
    return passed
}

//exclusive/inclusive depending on listType
export function filterSingleMonByBall(p, ballFilters, data) {
    const {listType} = data
    if (listType === 'collection') {
        const booleanList = ballFilters.map((key) => p.balls[key] !== undefined && p.balls[key].isOwned === true)
        const hasAllFilteredBalls = !booleanList.includes(false)
        return hasAllFilteredBalls
    } else {
        const booleanList = p.balls !== undefined ? //p.balls indicates onhand is organized by pokemon
            ballFilters.map(key => p.balls[key] !== undefined && p.balls[key].numTotal !== 0) : 
            ballFilters.map((key) => p.ball === key)
        const hasAnyFilteredBalls = booleanList.includes(true)
        return hasAnyFilteredBalls
    }
}

export function filterSingleMonByAvailableGame(p, gameFilters, data) {
    const {availableGames} = data
    const gameInfo = availableGames[p.name]
    const noGame = gameFilters[0] === 'no-game'
    if (noGame) {
        const noGames = gameInfo === undefined || gameInfo.length === 0
        return noGames
    }
    const isAvailableInAllGames = gameInfo !== undefined && !gameFilters.map(gF => gameInfo.includes(gF)).includes(false)
    return isAvailableInAllGames
}

export function filterSingleMonByTag(p, tagFilters) {
    const booleanList = Object.values(p.balls).map((ball) => ball[tagFilters[0]] !== undefined)
    const hasTagKey = booleanList.includes(true)
    return hasTagKey
}