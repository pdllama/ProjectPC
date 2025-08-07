import { getIndividualPokemonInfo } from '../../../utils/createCollection.js'
import { getImgLink, getPossibleGender, getPossibleEggMoves, getAvailableHomeGames, getHomeGamesPossibleEggMoves,  } from '../../../utils/schemavirtuals/collectionvirtuals.js'
import getHAName from '../../../utils/schemavirtuals/getHAName.js'

export default async function getIndividualPokemonObject(req, res) {
    const {newPokemon, gen, ballScope, newOwnedCollectionList, newCollectingBalls, demoCollectionData} = req.body
    const newPokemonArr = getIndividualPokemonInfo(demoCollectionData.gen, newPokemon, ballScope)
    const newAddedPokemonState = newPokemonArr.map(mon => {
        const possibleEMs = demoCollectionData.gen === 'home' ? {possibleEggMoves: getHomeGamesPossibleEggMoves(mon)} : {}
        return {...mon, imgLink: getImgLink(mon), possibleGender: getPossibleGender(mon), ...possibleEMs, haName: getHAName(mon, demoCollectionData.gen)}
    })
    const updatedEggMoves = (demoCollectionData.gen !== 'home') ? getPossibleEggMoves([...newAddedPokemonState], demoCollectionData.gen) : {}
    const updatedHomeGames = (demoCollectionData.gen === 'home') ? getAvailableHomeGames([...newAddedPokemonState]) : {}
    res.json({newPokemon: newAddedPokemonState, updatedEggMoves, updatedHomeGames})
    
}