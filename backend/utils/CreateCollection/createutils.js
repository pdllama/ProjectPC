import { genGames } from "../../common/infoconstants/miscconstants.mjs"

function getAPIGenFormat(collectionGen) {
    const gameOrHomeGen = isNaN(parseInt(collectionGen))
    if (gameOrHomeGen) {
        if (collectionGen === 'home') {return 'home'}
        const genNum = genGames.filter(gG => gG.games.includes(collectionGen))[0].gen
        return `gen${genNum}`
    }
    return `gen${collectionGen}`
}

export {getAPIGenFormat}