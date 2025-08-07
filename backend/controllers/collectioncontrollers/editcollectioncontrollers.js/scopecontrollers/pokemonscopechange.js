import { apriballs, findGenByDexNum, getGenNum } from '../../../../common/infoconstants/miscconstants.mjs'
import Collection from '../../../../models/collections.js'
import { getBallPath, setOwnedBallList } from '../../../../utils/CreateCollection/functions.js'
import { selectPokemonInfo } from '../../../../utils/schemavirtuals/infoandotherfuncs.js'
import { apriballLiterals } from '../../../../common/infoconstants/miscconstants.mjs'
import { getIndividualPokemonInfo } from '../../../../utils/createCollection.js'
import { sortList } from '../../../../common/sortingfunctions/customsorting.mjs'
import { getAvailableHomeGames, getPossibleEggMoves, getHomeGamesPossibleEggMoves, getImgLink, getPossibleGender } from '../../../../utils/schemavirtuals/collectionvirtuals.js'
import getHAName from '../../../../utils/schemavirtuals/getHAName.js'
import { interchangeableAltFormMons } from '../../../../common/infoconstants/pokemonconstants.mjs'

export default async function pokemonScopeChange(req, res) {
    const {id} = req.params
    const {addedPokemon=[], removedPokemon=[], newPokemon=[], ballLegalityInfo} = req.body

    const collection = await Collection.findById(id)
    const ballScope = collection.options.collectingBalls
    const isLinkedCollection = collection.linkedTo !== undefined
    const frontendData = {} //need this so i can pass it to frontend

    if (addedPokemon.length !== 0 || removedPokemon.length !== 0 || (newPokemon.length !== 0 && isLinkedCollection)) {
        //note: addedPokemon are pokemon which are ALREADY in the collection list, just disabled. (not in the sub list though). newPokemon are the ones we need to construct.
        if (!isLinkedCollection) {
            collection.ownedPokemon = collection.ownedPokemon.map(p => {
                const isNewlyEnabled = addedPokemon.filter(p2 => compareMonNames(p.name, p2.name)).length !== 0
                const isNewlyDisabled = removedPokemon.filter(p2 => compareMonNames(p.name, p2.name)).length !== 0
                if (isNewlyEnabled) {
                    generateUpdatedPData(p, collection.gen, ballScope, false)
                    p.disabled = undefined
                    return p
                } else if (isNewlyDisabled) {
                    p.disabled = true
                    return p
                } else {
                    return p
                }
            })
        } else {
            const mainCollection = await Collection.findById(collection.linkedTo.super)
            let madeOpEdits = newPokemon.length !== 0 ? true : false
            if (addedPokemon.length !== 0) {
                mainCollection.ownedPokemon = mainCollection.ownedPokemon.map(p => {
                    const isNewlyEnabled = addedPokemon.filter(p2 => compareMonNames(p.name, p2.name)).length !== 0
                    if (isNewlyEnabled) {
                        const newPData = generateUpdatedPData(p, collection.gen, ballScope, true)
                        if (!(newPData === undefined)) {
                            madeOpEdits = true
                            return newPData
                        }
                    }
                    return p
                })
            }
            if (newPokemon.length !== 0) {
                const newPokemonComplete = getIndividualPokemonInfo('home', newPokemon, ballScope).map(p => {return {...p, disabled: true}})
                frontendData.pokemon = newPokemonComplete
                mainCollection.ownedPokemon = [...mainCollection.ownedPokemon, ...newPokemonComplete]
                collection.ownedPokemon = [...collection.ownedPokemon, ...newPokemonComplete.map(p => {return {name: p.name, natDexNum: p.natDexNum, disabledBalls: []}})]
            }
            if (madeOpEdits) {
                mainCollection.markModified('ownedPokemon')
                await mainCollection.save()
            }
            for (let aPoke of addedPokemon) {
                collection.ownedPokemon.push({name: interchangeableAltFormMons.includes(aPoke.name) ? `${aPoke.name} (Any)` : aPoke.name, natDexNum: aPoke.natDexNum, disabledBalls: []})
            }
            if (removedPokemon.length !== 0) {
                collection.ownedPokemon = collection.ownedPokemon.filter(p => removedPokemon.filter(p2 => compareMonNames(p.name, p2.name)).length === 0)
            }
        }
    }
    if (newPokemon.length !== 0 && !isLinkedCollection) {
        const newPokemonComplete = getIndividualPokemonInfo(collection.gen, newPokemon, ballScope)
        frontendData.pokemon = newPokemonComplete
        collection.ownedPokemon = [...collection.ownedPokemon, ...newPokemonComplete]
    }

    if (collection.options.sorting.collection.reorder) {
        collection.ownedPokemon = sortList(collection.options.sorting.collection.default, collection.ownedPokemon)
    }

    collection.markModified('ownedPokemon')
    await collection.save()

    if (frontendData.pokemon) {
        const virtualData = frontendData.pokemon.map(p => {
            const possibleEggMoves = (collection.gen === 'home' || isLinkedCollection) ? {possibleEggMoves: getHomeGamesPossibleEggMoves(p)} : {}
            return {...p, imgLink: getImgLink(p), possibleGender: getPossibleGender(p), haName: getHAName(p, isLinkedCollection ? 'home' : collection.gen), ...possibleEggMoves}
        })
        frontendData.pokemon = virtualData
        if (isLinkedCollection) {
            frontendData.subList = virtualData.map(p => {
                const newData = {name: p.name, natDexNum: p.natDexNum, disabledBalls: [], haName: getHAName(p, collection.gen), imgLink: p.imgLink, possibleGender: p.possibleGender}
                return newData
            })
            //note: the ONLY reason we do above is because pokemon MAY have different hidden abilities between generations, so its required to recalc it. also, it makes it easier on the frontend, since they have thed constructed sublist data already.
            // however, as of june 2025, the only pokemon i can think of that has different ha across gens (and is a first stage evo) is Piplup. So it may be overkill to do this. 
            // i will keep it like this for now, but this is subject to change since its just extra computation. 
        }
    }
    if (addedPokemon.length !== 0 || newPokemon.length !== 0) {
        const updatedHomeGames = collection.gen === 'home' ? getAvailableHomeGames(collection.ownedPokemon) : undefined
        const updatedEggMoveInfo = collection.gen !== 'home' ? getPossibleEggMoves(collection.ownedPokemon, collection.gen) : undefined
        if (updatedHomeGames) {frontendData.updatedHomeGames = frontendData.updatedHomeGames}
        if (updatedEggMoveInfo) {frontendData.updatedEggMoveInfo = updatedEggMoveInfo}
    }

    res.json(frontendData) //{pokemon, subList, updatedHomeGames, updatedEggMoveInfo}
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
        } else {
            const accompanyingValue = key === 'isOwned' || key === 'isHA' ? false : key === 'emCount' ? 0 : key === 'EMs' && []
            newBallObjRef[key] = accompanyingValue
        }
        
    })
    return newBallObjRef
}

export const getLegalBalls = (p, collectionGen) => {
    //p must include: name, natDexNum
    const apiData = selectPokemonInfo(p.name, p.gen === undefined ? findGenByDexNum(p.natDexNum) : p.gen, p.natDexNum)
    return setOwnedBallList(undefined, getBallPath(apiData, collectionGen, `gen${getGenNum(collectionGen)}`, isNaN(parseInt(collectionGen)) ? collectionGen : '', false, false), undefined, true, collectionGen === 'home')
}

const generateUpdatedPData = (p, collectionGen, ballScope, isSubList=false) => {
    if (!isSubList) {
        delete p.disabled
    }
    const apiData = selectPokemonInfo(p.name, p.gen, p.natDexNum)
    const legalBalls = setOwnedBallList(undefined, getBallPath(apiData, collectionGen, `gen${getGenNum(collectionGen)}`, isNaN(parseInt(collectionGen)) ? collectionGen : '', false, false), undefined, true, collectionGen === 'home')
    const missingBallData = ballScope.filter(b => !Object.keys(p.balls).includes(b))
    const editMissingBallData = missingBallData.length !== 0 && missingBallData.map(mB => apriballLiterals.includes(mB) ? legalBalls.includes('apriball') : legalBalls.includes(mB)).includes(true)
    if (!isSubList) {
        if (editMissingBallData) {
            missingBallData.forEach(b => {
                const legalityBall = apriballLiterals.includes(b) ? 'apriball' : b
                if (legalBalls.includes(legalityBall) && p.balls[b] === undefined) {
                    p.balls[b] = generateNewBallData(p)
                }
            })
        }
    } else if (isSubList) {
        //atp we didnt actually change p in any meaninful way, so we can just return undefined to signal that there were no changes.
        //only happens if sublist of course, since these operations are happening on a main list, and if it is the main list then we enable it. 
        return undefined
    }
    return p
}

//this function compares two pokemon names to see if they equal
//this is needed for interchangeable alt form mons since the legality array excludes Any, while the frontend (and the actual collection document) has it, 
// and sometimes there needs to be comparisons made between the two. 
export const compareMonNames = (name1, name2) => {
    const trueName1 = interchangeableAltFormMons.includes(name1) ? `${name1} (Any)` : name1
    const trueName2 = interchangeableAltFormMons.includes(name2) ? `${name2} (Any)` : name2
    return trueName1 === trueName2
}
