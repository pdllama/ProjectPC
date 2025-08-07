//this function applies all the needed top-level virtuals of a list so it can be used in the frontend.
//  NOTE: not everywhere that applies virtuals post-hoc uses this! probably should fix that.
//
// the top level virtuals:
//  1. eggMoveInfo (non-home collections)
//  2. availableHomeGames (home collections)

import { getPossibleEggMoves } from "../../../utils/schemavirtuals/collectionvirtuals.js";
import { getAvailableHomeGames } from "../../../utils/schemavirtuals/collectionvirtuals.js";

export default function applyTopLevelVirtuals(col) {
    return col.gen === 'home' ? getAvailableHomeGames(col.ownedPokemon) : getPossibleEggMoves(col.ownedPokemon, col.gen)
}