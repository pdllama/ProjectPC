import { compareCollections } from "./comparison";
import getUserCollectionData from "../backendrequests/getusercollectiondata";

const startComparison = (fullUserCollectionData, ownerCollectionData, opts, advOpts, userColData=undefined) => {
    // const fullUserCollectionData = userColData === undefined ? await getUserCollectionData(selectedColId) : userColData
    const userEMInfo = fullUserCollectionData.eggMoveInfo === undefined ? {} : fullUserCollectionData.eggMoveInfo
    const ownerEMInfo = ownerCollectionData.eggMoveInfo === undefined ? {} : ownerCollectionData.eggMoveInfo
    // const ignoreEMs = fullUserCollectionData.gen === 'home' || ownerCollectionData.gen === 'home'
    const ignoreEMs = false
    if (fullUserCollectionData.gen === 'home') {
        fullUserCollectionData.ownedPokemon.forEach(p => {
            userEMInfo[p.name] = p.possibleEggMoves
        })
    }
    if (ownerCollectionData.gen === 'home') {
        ownerCollectionData.ownedPokemon.forEach(p => {
            ownerEMInfo[p.name] = p.possibleEggMoves
        })
    }
    const comparisonResult = compareCollections(fullUserCollectionData, ownerCollectionData, opts, advOpts, userEMInfo, ownerEMInfo, ignoreEMs)
    return comparisonResult
}

export default startComparison