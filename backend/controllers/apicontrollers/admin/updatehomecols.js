import Collection from "../../../models/collections.js";
import { setOwnedPokemonList } from "../../../utils/createCollection.js";
import { getAvailableHomeGames } from "../../../utils/schemavirtuals/collectionvirtuals.js";

const fullList = setOwnedPokemonList('home', undefined, undefined, undefined, true, false).flat().filter(e => e !== undefined)
const hasEggMovesInGen = {}

fullList.forEach(p => {
    const eggMoveData = p.balls[Object.keys(p.balls)[0]].eggMoveData
    if (eggMoveData !== undefined) {
        hasEggMovesInGen[p.name] = Object.keys(eggMoveData)
    }
})

export default async function updateHomeCollections(req, res) {
    //this controller was used to update home collections to the correct format
    const allCollections = await Collection.find({gen: 'home'})
    allCollections.forEach(col => {
        let madeOpEdits = false
        const newOp = col.ownedPokemon.map(p => {
            if (hasEggMovesInGen[p.name]) {
                const newEggMoveData = {}
                hasEggMovesInGen[p.name].forEach(emGen => {
                    if (!isNaN(parseInt(emGen))) {
                        newEggMoveData[parseInt(emGen)] = {emCount: 0, EMs: []}
                    } else {
                        newEggMoveData[emGen] = {emCount: 0, EMs: []}
                    }
                }) 
                Object.keys(p.balls).forEach(b => {
                    if (p.balls[b].eggMoveData === undefined) {
                        p.balls[b].eggMoveData = newEggMoveData
                        madeOpEdits = true
                    }
                })
            }
            return p
        })
        let madeOhEdits = false
        const newOh = col.onHand.map(p => {
            if (hasEggMovesInGen[p.name] && p.emCount === undefined) {
                p.emCount = 0
                p.EMs = []
                p.emGen = hasEggMovesInGen[p.name][0]
                madeOhEdits = true
            }
            return p
        })
        if (madeOpEdits) {
            col.ownedPokemon = newOp
            col.markModified('ownedPokemon')
        }
        if (madeOhEdits) {
            col.onHand = newOh
            col.markModified('onHand')
        }

        col.options.globalDefaults.eggMoveData = {'swsh': 0, 'bdsp': 0, 9: 0}
        col.markModified('options')
        
        col.save()
    })

    res.end()
}

export {hasEggMovesInGen}