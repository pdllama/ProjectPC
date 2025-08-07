import Collection from '../../../../models/collections.js'
import User from '../../../../models/users.js'
import mongoose from 'mongoose'
import { listChangesController } from '../singleValueUpdate.js'
import { apriballLiterals } from '../../../../common/infoconstants/miscconstants.mjs'
import applyVirtuals from '../../utils/applyvirtuals.js'
import { getPokemonGroups } from '../../../../utils/pokemongroups/getpokemongroups.js'
import { getCollectionProgressPercent, checkBadgeMilestone } from '../../../../models/postpremiddleware.js'
import { compareMonNames } from './pokemonscopechange.js'

const oneArrMonTotalLegality = []
const homeGroups = getPokemonGroups('home')

Object.values(homeGroups).forEach(g => {
    if (!Array.isArray(g)) {
        Object.values(g).forEach(sg => {
            sg.forEach(p => {
                oneArrMonTotalLegality.push(p)
            })
        })
    } else {
        g.forEach(p => {
            oneArrMonTotalLegality.push(p)
        })
    }
})

export default async function ballScopeChanges(req, res) {
    const {id} = req.params
    const {newBallScope, addedBalls=[], removedBalls=[], removedPokemon, mainColId=undefined, isLinkedCollection, legalBallInfo, unsavedChanges=undefined} = req.body

    const mainCollection = await Collection.findById(mainColId !== undefined ? mainColId : id)
    const dummyMain = mainCollection.gen === 'dummy'

    if (unsavedChanges) {
        listChangesController(mainCollection, unsavedChanges)
        //badge milestone
        const user = await User.findById(mainCollection.owner).populate({path: 'collections', select: 'ownedPokemon linkedTo'})
        const colProg = getCollectionProgressPercent(user.collections.filter(c => c._id.toString() ===  mainCollection._id.toString())[0]) 
        const otherColProgs = user.collections.map(col => {return {_id: col._id, progress: getCollectionProgressPercent(col)}}).filter(col => col._id.toString() !== mainCollection._id.toString()).map(col => col.progress)
        const badgeChange = checkBadgeMilestone(colProg, user.settings.profile.badges, otherColProgs)
        if (badgeChange !== 'no-change') {
            user.settings.profile.badges = badgeChange
            user.save()
        }
        mainCollection.markModified('ownedPokemon')
    }
    if (isLinkedCollection) {
        const isMainCollection = mainColId === id
        const linkedCollections = await Collection.find({'linkedTo.super': new mongoose.Types.ObjectId(mainColId)})
        const linkedActualCollection = !isMainCollection && linkedCollections.filter(c => c._id.toString() === id)[0] 

        const linkedBallScope = isMainCollection ? linkedCollections.map(c => c.options.collectingBalls) : linkedCollections.map(c => c._id.toString() === id ? newBallScope : c.options.collectingBalls)
        
        //note: this ballscope is just used to check if we are allowed to remove the pokemon data. empty scope as a placeholder is fine and shouldnt have any impact.
        const mainBallScope = isMainCollection ? newBallScope : dummyMain ? [] : mainCollection.options.collectingBalls


        // const newTotalBallScope = mainBallScope.concat(linkedBallScope.flat())

        //we need to check if we need to remove from the main collection, because if we did,
        //we need to remove it from the sub collection
        const collectionRemovedPokemon = [] 

        //below is an array of arrays of the names of the pokemon in the collection. needed if we're removing balls to determine if we can remove the ball data of the pokemon.
        //ball scope in cols is organized accordingly
        const pokemonNamesInCols = []
        const ballScopeInCols = []
        if (removedBalls.length !== 0) {
            pokemonNamesInCols.push(mainCollection.ownedPokemon.map(p => (p.disabled ? undefined : p.name)).filter(p => p !== undefined))
            ballScopeInCols.push(mainBallScope)
            linkedCollections.forEach((lC, idx) => {
                pokemonNamesInCols.push(lC.ownedPokemon.map(p => p.name))
                ballScopeInCols.push(linkedBallScope[idx])
            })       
        }

        const newOwnedPokemon = mainCollection.ownedPokemon.map(p => {
            const isRemovedP = removedPokemon !== undefined && isMainCollection && removedPokemon.filter(rPoke => compareMonNames(p.name, rPoke.name)).length !== 0
            if (isMainCollection) {
                if (p.disabled) {return p}
                if (isRemovedP) {
                    p.disabled = true
                    return p
                }
            }
            const newBData = JSON.parse(JSON.stringify(p.balls))
            if (removedBalls.length !== 0) {
                removedBalls.forEach(removedB => {
                    const pHasRemovedBallCombo = p.balls[removedB] !== undefined
                    if (pHasRemovedBallCombo) {
                        let actuallyRemoveBallCombo = true
                        pokemonNamesInCols.forEach((colPArr, idx) => {
                            if (!actuallyRemoveBallCombo) {
                                null
                            } else {
                                const correspondingBallScope = ballScopeInCols[idx]
                                // console.log('REMOVED BALL')
                                // console.log(p.name)
                                if (colPArr.includes(p.name)) {
                                    if (correspondingBallScope.includes(removedB)) {
                                        actuallyRemoveBallCombo = false
                                    }
                                }
                            }
                        })
                        if (actuallyRemoveBallCombo) {
                            //if this block happens, then every collection is either not collecting that pokemon, or not collecting this ball combination, or both.
                            delete newBData[removedB]
                        }
                    }
                })
            }
            if (addedBalls.length !== 0) {
                //legalBallInfo names for interchangeable any's is just the species of pokemon
                const pokemonLegalityInfo = oneArrMonTotalLegality.filter(mon => compareMonNames(p.name, mon.name))[0].legalBalls
                addedBalls.forEach(ball => {
                    if (newBData[ball] !== undefined) { //this can happen if a restrictive ball scope gets linked to a bigger ball scope, and then the user broadens it after.
                        null
                    } else {
                        const addedBallLegality = apriballLiterals.includes(ball) ? 'apriball' : ball
                        if (pokemonLegalityInfo.includes(addedBallLegality)) {
                            newBData[ball] = generateNewBallData(p)
                        }
                    }
                })
            } //note: added below with the understanding that if this ever happens, then NO linked collections are collecting ANY ball combos.
            if (Object.keys(newBData).length === 0) {
                if (!isMainCollection) {collectionRemovedPokemon.push(p)}
                return undefined
            }
            p.balls = newBData
            return p
        }).filter(p => p !== undefined)

        if (!isMainCollection) {
            const newLinkedOwnedPokemon = linkedActualCollection.ownedPokemon.map(p => {
                const isRemovedP = removedPokemon !== undefined && (removedPokemon.filter(rPoke => compareMonNames(p.name, rPoke.name)).length !== 0 || collectionRemovedPokemon.filter(rPoke => rPoke.name === p.name ).length !== 0) //no need to do compareMonNames for collectionRemovedPokemon
                if (isRemovedP) {
                    return undefined
                } else {return p}
            }).filter(p => p !== undefined)
            linkedActualCollection.ownedPokemon = newLinkedOwnedPokemon
            linkedActualCollection.options.collectingBalls = newBallScope

            mainCollection.ownedPokemon = newOwnedPokemon

            mainCollection.markModified('ownedPokemon')
            linkedActualCollection.markModified('ownedPokemon')
            linkedActualCollection.markModified('options')
            await linkedActualCollection.save()
            await mainCollection.save()
            res.json(applyVirtuals(mainCollection.ownedPokemon, mainCollection.gen, 'collection'))
        } else {
            mainCollection.ownedPokemon = newOwnedPokemon
            if (!dummyMain) {
                mainCollection.options.collectingBalls = newBallScope
                mainCollection.markModified('options')
            }
            mainCollection.markModified('ownedPokemon')
            await mainCollection.save()
            res.json(applyVirtuals(mainCollection.ownedPokemon, mainCollection.gen, 'collection'))
        }
    } else {
        const newOwnedPokemon = mainCollection.ownedPokemon.map(p => {
            const isRemovedP = removedPokemon !== undefined && removedPokemon.filter(rPoke => compareMonNames(p.name, rPoke.name)).length !== 0
            if (p.disabled) {return p}
            if (isRemovedP) {
                p.disabled = true
                return p
            }
            const newBData = JSON.parse(JSON.stringify(p.balls))
            if (removedBalls.length !== 0) {
                removedBalls.forEach(removedB => {
                    const pHasRemovedBallCombo = p.balls[removedB] !== undefined
                    //note: no need to check if we removed the last ball combo. it will never happen, since those cases are handled in the removedPokemon array.
                    if (pHasRemovedBallCombo) {
                        delete newBData[removedB]
                    }
                })
            }
            if (addedBalls.length !== 0) {
                const pokemonLegalityInfo = oneArrMonTotalLegality.filter(mon => compareMonNames(p.name, mon.name))[0].legalBalls
                addedBalls.forEach(ball => {
                    if (newBData[ball] !== undefined) { //this can happen if a restrictive ball scope gets linked to a bigger ball scope, and then the user broadens it after.
                        null
                    } else {
                        const addedBallLegality = apriballLiterals.includes(ball) ? 'apriball' : ball
                        if (pokemonLegalityInfo.includes(addedBallLegality)) {
                            newBData[ball] = generateNewBallData(p)
                        }
                    }
                })
            }
            p.balls = newBData
            return p
        })

        mainCollection.ownedPokemon = newOwnedPokemon
        mainCollection.options.collectingBalls = newBallScope

        mainCollection.markModified('ownedPokemon')
        mainCollection.markModified('options')
        await mainCollection.save()
        res.json(applyVirtuals(mainCollection.ownedPokemon, mainCollection.gen, 'collection'))
    }
}

const generateNewBallData = (p) => {
    const newBallObjRef = JSON.parse(JSON.stringify(p.balls[Object.keys(p.balls)[0]]))
    Object.keys(newBallObjRef).forEach((key) => {
        if (key === 'eggMoveData') {
            const newEggMoveDataObj = {}
            Object.keys(newBallObjRef.eggMoveData).forEach(emGen => {
                newEggMoveDataObj[emGen] = {emCount: 0, EMs: []}
            })
            newBallObjRef.eggMoveData = newEggMoveDataObj
        } else if (key === 'pending' || key === 'highlyWanted') {
            delete newBallObjRef[key]
        } else {
            const accompanyingValue = key === 'isOwned' || key === 'isHA' ? false : key === 'emCount' ? 0 : key === 'EMs' && []
            newBallObjRef[key] = accompanyingValue
        }
        
    })
    return newBallObjRef
}