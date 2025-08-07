import { homeDisplayGames } from "../../../../common/infoconstants/miscconstants.mjs"
import { sortList } from "../../../../common/sortingfunctions/customsorting.mjs"
import { hasEggMovesInGen } from "../../../apicontrollers/admin/updatehomecols.js"

const updateBallDataToHomeEMFormat = (b, colGen, pName) => {
    const emData = {}
    if (hasEggMovesInGen[pName] !== undefined) {
        homeDisplayGames.forEach(hDG => {
            if (hasEggMovesInGen[pName].includes(hDG.toString())) {
                const dataObj = {EMs: hDG.toString() === colGen ? b.EMs : [], emCount: hDG.toString() === colGen ? b.emCount : 0}
                emData[hDG] = dataObj
            }
        })
    }
    
    
    const newBData = JSON.parse(JSON.stringify(b))
    delete newBData.emCount
    delete newBData.EMs
    if (Object.keys(emData).length !== 0) {
        newBData.eggMoveData = emData
    }
    return newBData
}

export const updateCollectionToHomeEMFormat = (list, colGen) => {
    return list.map((p) => {
        const newBallData = {}
        Object.keys(p.balls).forEach(b => {
            newBallData[b] = updateBallDataToHomeEMFormat(p.balls[b], colGen, p.name)
        })
        return {...p, balls: newBallData}
    })
}

export function poolCollectionProgressSingle(centralCollection, otherCollection, colGen, sortKey=undefined) {
    //colGen is the gen of the otherCollection
    const newCentral = JSON.parse(JSON.stringify(centralCollection))
    const poolingDataIsHomeOrDummy = colGen === 'home' || colGen === 'dummy'

    otherCollection.forEach(p => {
        const pokemonInCentral = newCentral.find(p2 => p.name === p2.name)
        const centralHasPokemon = pokemonInCentral !== undefined
        if (centralHasPokemon) {
            const centralMonBalls = Object.keys(pokemonInCentral.balls)
            let currentDefault = centralMonBalls.filter(cB => pokemonInCentral.balls[cB].default)[0]
            centralMonBalls.forEach(ball => {
                const ballData = pokemonInCentral.balls[ball]
                const poolingBallData = p.balls[ball]
                if (!ballData.isOwned && poolingBallData !== undefined) {
                    //this route is when its not owned in the central, but the data for that combo is defined in the merging one.
                    if (poolingBallData.isOwned) {
                        ballData.isOwned = true;
                        ballData.isHA = poolingBallData.isHA
                        if (poolingDataIsHomeOrDummy) {
                            if (poolingBallData.eggMoveData !== undefined) {
                                const keys = Object.keys(ballData.eggMoveData)
                                keys.forEach(k => {
                                    if (poolingBallData.eggMoveData[k] !== undefined) { //realistically this should always be true, but i messed up and needed this for testing purposes
                                        if (ballData.eggMoveData[k].emCount < poolingBallData.eggMoveData[k].emCount) {
                                            ballData.eggMoveData[k].emCount = poolingBallData.eggMoveData[k].emCount
                                            ballData.eggMoveData[k].EMs = poolingBallData.eggMoveData[k].EMs
                                        } 
                                    }
                                    
                                })
                            }
                        } else {
                            if (ballData.eggMoveData !== undefined && ballData.eggMoveData[colGen] !== undefined) {
                                ballData.eggMoveData[colGen].EMs = poolingBallData.EMs
                                ballData.eggMoveData[colGen].emCount = poolingBallData.emCount
                            }
                        }
                        if (currentDefault == undefined && poolingBallData.isOwned) {
                            ballData.default = true;
                            currentDefault = ball
                        }
                        if (ballData.pending) {
                            delete ballData.pending
                        }
                        if (ballData.highlyWanted) {
                            delete ballData.highlyWanted
                        }
                    } else if (!ballData.pending && poolingBallData.pending) { //since this and the next are else if, if its pending in the pooling, it will finalize as pending 
                        ballData.pending = true
                    } else if (!ballData.highlyWanted && !ballData.pending && poolingBallData.highlyWanted) {
                        ballData.highlyWanted = true
                    }
                } else {
                    const poolingOwned = poolingBallData !== undefined && poolingBallData.isOwned
                    if (poolingOwned) {
                        //this route is when its owned in both lists. used to compare and update peripheral values
                        if (!ballData.isHA && poolingBallData.isHA) {
                            ballData.isHA = true
                        }
                        if (poolingDataIsHomeOrDummy) {
                            if (ballData.eggMoveData !== undefined) {
                                const keys = Object.keys(ballData.eggMoveData)
                                keys.forEach(k => {
                                    if (poolingBallData.eggMoveData[k] !== undefined) { //realistically this should always be true, but i messed up and needed this for testing purposes
                                        if (ballData.eggMoveData[k].emCount < poolingBallData.eggMoveData[k].emCount) {
                                            ballData.eggMoveData[k].emCount = poolingBallData.eggMoveData[k].emCount
                                            ballData.eggMoveData[k].EMs = poolingBallData.eggMoveData[k].EMs
                                        } 
                                    }
                                    
                                })
                            }
                        } else {
                            if (ballData.eggMoveData !== undefined && ballData.eggMoveData[colGen] !== undefined) {
                                if (ballData.eggMoveData[colGen].emCount < poolingBallData.emCount) {
                                    ballData.eggMoveData[colGen].emCount = poolingBallData.emCount
                                    ballData.eggMoveData[colGen].EMs = poolingBallData.EMs
                                }
                            }
                            
                        }
                        if (currentDefault == undefined && poolingBallData.default) {
                            ballData.default = true;
                            currentDefault = ball
                        }
                    }

                }
            })
            const subColBallsNotInCentral = Object.keys(p.balls).filter(ball => !centralMonBalls.includes(ball))
            const hasBallsNotInCentral = subColBallsNotInCentral.length !== 0
            if (hasBallsNotInCentral) {
                subColBallsNotInCentral.forEach(b => {
                    pokemonInCentral.balls[b] = poolingDataIsHomeOrDummy ? p.balls[b] : updateBallDataToHomeEMFormat(p.balls[b], colGen, p.name)
                    if (currentDefault == undefined && (p.balls[b].isOwned && p.balls[b].default)) {
                        pokemonInCentral.balls[b].default = true;
                        currentDefault = ball
                    }
                })
            }
        } else {
            const newBallData = {}
            Object.keys(p.balls).forEach(b => {
                newBallData[b] = poolingDataIsHomeOrDummy ? p.balls[b] : updateBallDataToHomeEMFormat(p.balls[b], colGen, p.name)
            })
            newCentral.push({name: p.name, gen: p.gen, natDexNum: p.natDexNum, disabled: true, balls: newBallData})
        }
    })
    
    return sortList(sortKey ? sortKey : 'NatDexNumL2H', newCentral)
}

export function poolCollectionProgressMultiple(centralCollection, otherCollections, otherCollectionsGens, sortKey=undefined) {
    const dummyCollection = centralCollection.length === 0

    //non-dummy collection: add missing pokemon from other collections into the main, and disable them via p.disabled.
    //dummy collection: add all pokemon from other collections into the dummy, and disable them via p.disabled (all will be disabled)
    const newCentral = dummyCollection ? otherCollections[0].map(p => {
        const newBallData = {}
        Object.keys(p.balls).forEach(b => {
            newBallData[b] = updateBallDataToHomeEMFormat(p.balls[b], otherCollectionsGens[0])
        })
        return {...p, balls: newBallData} //all this logic is purely to ensure the egg move data is put in the HOME collection format correctly
    }) : centralCollection
    const iterateFrom = dummyCollection ? otherCollections.slice(1, otherCollections.length) : otherCollections
    const otherCollectionGensAbridged = dummyCollection ? otherCollectionsGens.slice(1, otherCollectionsGens.length) : otherCollectionsGens
    iterateFrom.forEach((col, idx) => {
        const colGen = otherCollectionGensAbridged[idx]
        col.forEach(p => {
            const pokemonInCentral = newCentral.find(p2 => p.name === p2.name)
            const centralHasPokemon = pokemonInCentral !== undefined
            if (centralHasPokemon) {
                const centralMonBalls = Object.keys(pokemonInCentral.balls)
                let currentDefault = centralMonBalls.filter(cB => pokemonInCentral.balls[cB].default)[0]
                centralMonBalls.forEach(ball => {
                    const ballData = pokemonInCentral.balls[ball]
                    const poolingBallData = p.balls[ball]
                    if (!ballData.isOwned) {
                        if (poolingBallData.isOwned) {
                            ballData.isOwned = true;
                            ballData.isHA = poolingBallData.isHA
                            ballData.eggMoveData[colGen].EMs = poolingBallData.EMs
                            ballData.eggMoveData[colGen].emCount = poolingBallData.emCount
                            if (currentDefault == undefined && poolingBallData.isOwned) {
                                ballData.default = true;
                                currentDefault = ball
                            }
                        } else if (!ballData.pending && poolingBallData.pending) {
                            ballData.pending = true
                        } else if (!ballData.highlyWanted && poolingBallData.highlyWanted) {
                            ballData.highlyWanted = true
                        }
                    } else {
                        const poolingOwned = poolingBallData.isOwned
                        if (poolingOwned) {
                            if (!ballData.isHA && poolingBallData.isHA) {
                                ballData.isHA = true
                            }
                            if (ballData.eggMoveData[colGen].emCount !== undefined && (ballData.eggMoveData[colGen].emCount < poolingBallData.emCount)) {
                                ballData.eggMoveData[colGen].emCount = poolingBallData.emCount
                            }
                            if (ballData.eggMoveData[colGen].EMs !== undefined && (ballData.eggMoveData[colGen].EMs.length < poolingBallData.EMs.length)) {
                                ballData.eggMoveData[colGen].EMs = poolingBallData.EMs
                            }
                            if (currentDefault == undefined && poolingBallData.default) {
                                ballData.default = true;
                                currentDefault = ball
                            }
                        }

                    }
                })
                const subColBallsNotInCentral = Object.keys(p.balls).filter(ball => !centralMonBalls.includes(ball))
                const hasBallsNotInCentral = subColBallsNotInCentral.length !== 0
                if (hasBallsNotInCentral) {
                    subColBallsNotInCentral.forEach(b => {
                        centralMonBalls[b] = updateBallDataToHomeEMFormat(p.balls[b], colGen)
                        if (currentDefault == undefined && (p.balls[b].isOwned && p.balls[b].default)) {
                            centralMonBalls[b] = true;
                            currentDefault = ball
                        }
                    })
                }
            } else {
                const newBallData = {}
                Object.keys(p.balls).forEach(b => {
                    newBallData[b] = updateBallDataToHomeEMFormat(p.balls[b], colGen)
                })
                newCentral.push({...p, balls: newBallData})
            }
        })
    })
    return sortList(sortKey ? sortKey : 'NatDexNumL2H', newCentral)
}