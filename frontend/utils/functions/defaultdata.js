import { convertEmField } from "../../src/app/slices/reducers/changesreducers"

export default function getDefaultData(globalDefault, ballDefault, pokemonBallData, maxEMs, possibleEMs, addedBall, isHomeCollection, backupGlobalDefault) {
    //maxEMs and possibleEMs are used for if the globaldefault is, say, 4EMCount, and the pokemon only has 3 ems, in order to correct it as well as
    //set the EM field if it's max.

    const addedBallData = pokemonBallData[addedBall]
    const ballDefaultData = pokemonBallData[ballDefault]
    const noBallDefault = ballDefault === 'none'
    const specificPokemonData = {}
    if (addedBallData.eggMoveData !== undefined) {
        specificPokemonData.eggMoveData = {}
        Object.keys(addedBallData.eggMoveData).forEach(gen => {
            specificPokemonData.eggMoveData[gen] = {EMs: [], emCount: 0}
        })
    }
    if (!noBallDefault) {
        if (addedBallData.isHA !== undefined) {
            if (ballDefaultData.isHA === undefined) {
                specificPokemonData.isHA = globalDefault.isHA
            } else {
                specificPokemonData.isHA = ballDefaultData.isHA
            } 
        }
        handleEggMoveDefaults(globalDefault, ballDefault, ballDefaultData, addedBallData, specificPokemonData, possibleEMs, maxEMs, isHomeCollection)
        return specificPokemonData
    } else if (noBallDefault) { //ball defaults (which are essentially pokemon specific defaults) override global defaults, which means this if happens AFTER
        if (((globalDefault !== undefined && globalDefault.isHA === true) || (backupGlobalDefault !== undefined && backupGlobalDefault.isHA === true))&& addedBallData.isHA !== undefined) {
            //there is a case where globalDefault is undefined. see bottom function.
            specificPokemonData.isHA = true
        }
        handleEggMoveDefaults(globalDefault, ballDefault, ballDefaultData, addedBallData, specificPokemonData, possibleEMs, maxEMs, isHomeCollection)
        return specificPokemonData
    } 
}

export const handleEggMoveDefaults = (globalDefault, ballDefault, ballDefaultData, addedBallData, specificPokemonData, possibleEMs, maxEMs, isHomeCollection, specificGenOverride=undefined) => {
    const noBallDefault = ballDefault === 'none'
    
    if (!noBallDefault) {
        if (isHomeCollection) {
            if (addedBallData.eggMoveData !== undefined) {
                if (specificGenOverride) {
                    if (ballDefaultData.eggMoveData === undefined || ballDefaultData.eggMoveData[specificGenOverride] === undefined) {
                        specificPokemonData.eggMoveData[gen].emCount = globalDefault.eggMoveData[gen]
                    }
                } 
                else {
                    Object.keys(addedBallData.eggMoveData).forEach(gen => {
                        if (ballDefaultData.eggMoveData === undefined || ballDefaultData.eggMoveData[gen] === undefined) {
                            specificPokemonData.eggMoveData[gen].emCount = globalDefault.eggMoveData[gen]
                        }
                        else {
                            specificPokemonData.eggMoveData[gen].emCount = ballDefaultData.eggMoveData[gen].emCount
                            specificPokemonData.eggMoveData[gen].EMs = ballDefaultData.eggMoveData[gen].EMs
                        }
                    })
                }
            }
        } else {
            if (addedBallData.emCount !== undefined) {
                if (ballDefaultData.emCount === undefined) {
                    specificPokemonData.emCount = globalDefault.emCount
                    specificPokemonData.EMs = []
                } else {
                    specificPokemonData.emCount = ballDefaultData.emCount
                    specificPokemonData.EMs = ballDefaultData.EMs
                }
            }
        }
    } else if (noBallDefault) {
        if (isHomeCollection) {
            if (addedBallData.eggMoveData !== undefined) {
                if (specificGenOverride) {
                    const numOfPossibleEMs = possibleEMs[specificGenOverride].length
                    if ((numOfPossibleEMs <= 4) && (globalDefault.emCount >= numOfPossibleEMs)) {
                        specificPokemonData.eggMoveData[specificGenOverride].emCount = numOfPossibleEMs
                        specificPokemonData.eggMoveData[specificGenOverride].EMs = possibleEMs[specificGenOverride]
                    } else {
                        specificPokemonData.eggMoveData[specificGenOverride].emCount = globalDefault.emCount
                    }
                } else {
                    //there is a case where globalDefault is undefined and its a home collection. see bottom function for details.
                    Object.keys(addedBallData.eggMoveData).forEach(gen => {
                        if (globalDefault === undefined) {
                            specificPokemonData.eggMoveData[gen].emCount = 0
                            specificPokemonData.eggMoveData[gen].EMs = []
                        } else if (globalDefault.eggMoveData[gen] !== 0) {
                            const numOfPossibleEMs = possibleEMs[gen].length
                            if ((numOfPossibleEMs <= 4) && (globalDefault.eggMoveData[gen] >= numOfPossibleEMs)) {
                                specificPokemonData.eggMoveData[gen].emCount = numOfPossibleEMs
                                specificPokemonData.eggMoveData[gen].EMs = possibleEMs[gen]
                            } else {
                                specificPokemonData.eggMoveData[gen].emCount = globalDefault.eggMoveData[gen]
                            }
                        }
                    })  
                }
            }
        } else {
            if (globalDefault.emCount !== 0 && addedBallData.emCount !== undefined) {
                const numOfPossibleEMs = possibleEMs.length
                if ((numOfPossibleEMs <= 4) && (globalDefault.emCount >= numOfPossibleEMs)) {
                    specificPokemonData.emCount = maxEMs
                    specificPokemonData.EMs = possibleEMs
                } else {
                    specificPokemonData.emCount = globalDefault.emCount
                }
            }
        }
        
    }
}

export const changeDefaultDataToChangeFormat = (defaultData, emGenGiven, isPrev=false) => {
    //change format dictates that eggMoveData (from HOME collections) is not the object itself, but EMs and emCount be preceded by the gen they're from.
    //ex svEMs, svEmCount, swshEMs, swshEmCount, bdspEMs, bdspEmCount.
    // it makes it easier to check equality and uniformizes the entire thing.
    // once it gets saved, the backend formats back to the eggMoveData object.
    const newFormat = {}
    Object.keys(defaultData).forEach(f => {
        if (f === 'eggMoveData') {
            Object.keys(defaultData[f]).forEach(emGen => {
                newFormat[convertEmField('emCount', emGen)] = defaultData[f][emGen].emCount
                newFormat[convertEmField('EMs', emGen)] = defaultData[f][emGen].EMs
            })
        } else if (f === 'isOwned' || f === 'pending' || f === 'highlyWanted') {
            null
        } else if (isPrev && f === 'isHA') {
            null
        } else {
            if (emGenGiven && (f === 'emCount' || f === 'EMs')) {
                newFormat[convertEmField(f, emGenGiven)] = defaultData[f]
            } else {
                newFormat[f] = defaultData[f]
            }
        }
    })
    return newFormat
}

export const handleMultipleDefaultData = (globalDefault, subGlobalDefaultGen, superGlobalDefault, addedBall, totalBallData, possibleEMs) => {
    //this function constructs a ballDefaultData by multiple defaults in linked collections (mostly for egg moves)
    //if the egg move format is non-home, it will convert it into home.

    //note: there is a case where superGlobalDefault can be undefined - when editing a sub-collection where its super col is a dummy collection.
    // in this case, we still need the default data to come out with "eggMoveData" field (like home collection)
    // trying to circumvent that caused issues with the changes reducers.
    const checkDefault = Object.keys(totalBallData).filter(b => b.default)[0]
    const ballDefault = checkDefault === undefined ? 'none' : checkDefault
    const newDefaultData = getDefaultData(superGlobalDefault, ballDefault, totalBallData, 0, possibleEMs, addedBall, true, globalDefault)
    if (!globalDefault.inherit || superGlobalDefault === undefined) {
        if (ballDefault === 'none' && newDefaultData.eggMoveData !== undefined) {
            handleEggMoveDefaults(globalDefault, 'none', undefined, totalBallData[addedBall], newDefaultData, possibleEMs, 0, true, subGlobalDefaultGen)
        }
    }
    return newDefaultData
}
