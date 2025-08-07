//this function applies all the needed pokemon-level virtuals of a list so it can be used in the frontend.
//  NOTE: not everywhere that applies virtuals post-hoc uses this! probably should fix that.
//
// here are all the pokemon-level virtuals that need to be applied:
//  1. imgLink (col and onhand)
//  2. possibleGender (col)
//  3. haName (col and onhand)
//  4. possibleEggMoves (col - home collections)
//
// and the top level virtuals (just listing them here - they are not given in the function):
//  1. eggMoveInfo (non-home collections)
//  2. availableHomeGames (home collections)

import { getHomeGamesPossibleEggMoves, getImgLink, getPossibleGender } from "../../../utils/schemavirtuals/collectionvirtuals.js"
import getHAName from "../../../utils/schemavirtuals/getHAName.js"

export default function applyVirtuals(list, gen, listType='collection') {
    return list.map(p => {
        const imgLink = getImgLink(p)
        const haName = getHAName(p, gen)
        const possibleEggMoves = (gen === 'home' && listType === 'collection') ? {possibleEggMoves: getHomeGamesPossibleEggMoves(p)} : {}
        const possibleGender = listType === 'collection' ? {possibleGender: getPossibleGender(p)} : {}
        return {...JSON.parse(JSON.stringify(p)), imgLink, haName, ...possibleEggMoves, ...possibleGender}
    })
}