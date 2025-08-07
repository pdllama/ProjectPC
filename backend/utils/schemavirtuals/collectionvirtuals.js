import {handleGen8EMs, handleDifferentFormEMs, selectPokemonInfo} from './infoandotherfuncs.js'
import { incenseBabiesWithExclusiveEMs, incenseAdultsWithExclusiveEMs, altFormMonsWithExclusiveEMs, pokemonNamesWithSpaces, regionalFormRegions, interchangeableAltFormMons } from '../../common/infoconstants/pokemonconstants.mjs'
import { genGames, noRegionalFormGens, homeDisplayGames, getGenNum } from '../../common/infoconstants/miscconstants.mjs'
import allPokemon from '../aprimonAPI/allpokemoninfo.js'

function getImgLink(p) {
    if (p.name) {
        if (p.name.includes(' ') && !pokemonNamesWithSpaces.includes(p.name)) {
            if (regionalFormRegions.map((region) => p.name.includes(region)).includes(true)) {
                if (p.name.includes('Tauros')) {
                    if (p.name.includes('(')) {
                        return `128-p-${p.name.charAt(16).toLowerCase()}`
                    }
                    return '128-p'
                }
                const modifier = p.natDexNum < 100 ? '0' : ''
                const modifiedDexNum = modifier + p.natDexNum
                return modifiedDexNum + `-${p.name.charAt(0).toLowerCase()}`
            } else if (p.name.includes('(')) {
                const startIndex = p.name.indexOf('(') + 1
                if (p.name.includes('Pumpkaboo') || p.name.includes('Rockruff')) {
                    if (p.name.includes('Small')) {
                        return p.natDexNum + `-sm`
                    }
                    if (p.name.includes('Average')) {
                        return `${p.natDexNum}`
                    }
                    return p.natDexNum + `-${p.name.charAt(startIndex).toLowerCase()}`
                } 
                if (p.name.includes('Deerling')) {
                    return p.natDexNum + `-${p.name.charAt(startIndex).toLowerCase() + p.name.slice(startIndex + 1, startIndex + 3)}`
                } else if (p.name.includes('Oricorio')) {
                    if (p.name.includes("Pa'u")) {
                        return p.natDexNum + '-pau'
                    }
                    else {
                        return p.natDexNum + `-${p.name.charAt(startIndex).toLowerCase()}`
                    }
                } else if (p.name.includes('Alcremie')) {
                    //Alcremie (Strawberry Matcha Cream)
                    //         ^          ^      ^
                    //      startindex   2ndspac 3rdspace
                    //result: 869-(sweetName)(creamName)(c for cream or s for swirl of cream)
                    // ex: 869-berryrubys (Alcremie - Berry Sweet, Ruby Swirl)
                    const indexOfSecondSpace = p.name.indexOf(' ', startIndex)
                    
                    const indexOfThirdSpace = p.name.indexOf(' ', indexOfSecondSpace+1)
                    const sweetName = p.name.slice(startIndex, indexOfSecondSpace).toLowerCase()
                    const creamName = p.name.slice(indexOfSecondSpace+1, indexOfThirdSpace).toLowerCase()
                    const creamSwirlId = p.name.slice(indexOfThirdSpace+1, indexOfThirdSpace+2).toLowerCase()

                    return `869-${sweetName}${creamName}${creamSwirlId}`
                } else if (p.name.includes('Vivillon')) {
                    return `666-${p.name.slice(startIndex, p.name.length-1).toLowerCase().replace(' ', '-')}`
                } else {
                    return p.natDexNum + `-${p.name.charAt(startIndex).toLowerCase()}`
                }
            }
        } else {
            const modifier = p.natDexNum < 100 && p.natDexNum >= 10 ? '0' : p.natDexNum < 10 ? '00' : ''
            const modifiedDexNum = modifier + p.natDexNum
            return modifiedDexNum
        }
    } else {
        return
    }
}

function getHomeGamesPossibleEggMoves(p) {
    const possibleEggMoves = {}

    homeDisplayGames.forEach(hDG => {
        if (Object.keys(p.balls).length === 0) {
            //this if statement was for debugging purposes only. realistically, this case should NEVER happen, since it means
            //the pokemon has NO active ball combos (and should just be removed from the list)
            possibleEggMoves[hDG] = []
        } else {
            const firstBallData = Object.values(p.balls)[0]
            if (firstBallData.eggMoveData === undefined || Object.keys(firstBallData.eggMoveData).length === 0 || firstBallData.eggMoveData[hDG] === undefined) {
                possibleEggMoves[hDG] = []
            } else {
                const genNum = getGenNum(hDG)
                possibleEggMoves[hDG] = getSingleMonPossibleEggMoves(p, genNum, hDG)
            }
        }
    })
    return possibleEggMoves
}

function getPossibleEggMoves(ownedPokemon, gen) {
    const collectionGen = (gen === 'swsh' || gen === 'bdsp') ? 8 : parseInt(gen)
    const eggMoveInfo = {}
    ownedPokemon.map(p => {
        eggMoveInfo[p.name] = getSingleMonPossibleEggMoves(p, collectionGen, gen)
    })
    return eggMoveInfo
}

function getSingleMonPossibleEggMoves(p, numberGen, gen) {
    const pokemonInfo = selectPokemonInfo(p.name, p.gen, p.natDexNum)
    const isRegionalVariant = p.name.includes('Paldean') || p.name.includes('Hisuian') || p.name.includes('Galarian') || p.name.includes('Alolan')
    const incenseMonExclusiveEMs = incenseBabiesWithExclusiveEMs.includes(p.name) || incenseAdultsWithExclusiveEMs.includes(p.name)
    const hasRegionalVariant = pokemonInfo.info.regionalForm !== undefined && numberGen >= pokemonInfo.info.regionalForm.forms[0].gen
    const altFormWithExclusiveEMs = altFormMonsWithExclusiveEMs.includes(p.name)
    if (pokemonInfo.specificGenInfo[`gen${numberGen}`] === undefined) {
        return []
    }
    const eggMovePath = pokemonInfo.specificGenInfo[`gen${numberGen}`].eggmoves
    if (eggMovePath === undefined) {
        return []
    } else {
        const normEMs = numberGen === 7 && eggMovePath.usumOnly !== undefined ? 
            [...eggMovePath.moves, ...eggMovePath.usumOnly] : eggMovePath.moves !== undefined ? 
            eggMovePath.moves : []
        if (isRegionalVariant || incenseMonExclusiveEMs || hasRegionalVariant || altFormWithExclusiveEMs) {
            return handleDifferentFormEMs(isRegionalVariant, hasRegionalVariant, incenseMonExclusiveEMs, altFormWithExclusiveEMs, numberGen, gen, p, eggMovePath, normEMs)
        } else if (numberGen === 8) {
            return handleGen8EMs(eggMovePath, normEMs, gen)
        } else {
            return normEMs
        }
    }
}

function getPossibleGender(p) {
    const maleOnlyPokemon = ['Nidoran♂', 'Tauros', 'Paldean Tauros', 'Paldean Tauros (Aqua)', 'Paldean Tauros (Blaze)', 'Tyrogue', 'Volbeat', 'Throh', 'Sawk', 'Rufflet', 'Impidimp', 'Indeedee (Male)']
    const femaleOnlyPokemon = ['Nidoran♀', 'Chansey', 'Kangaskhan', 'Jynx', 'Smoochum', 'Miltank', 'Illumise', 'Happiny', 'Petilil', 'Vullaby', 'Flabébé (Orange)', 'Flabébé (Red)', 'Flabébé (Yellow)', 'Flabébé (White)', 'Flabébé (Blue)', 'Bounsweet', 'Hatenna', 'Milcery', 'Indeedee (Female)', 'Tinkatink']
    const genderlessPokemon = ['Magnemite', 'Voltorb', 'Hisuian Voltorb', 'Staryu', 'Porygon', 'Lunatone', 'Solrock', 'Baltoy', 'Beldum', 'Bronzor', 'Rotom', 'Klink', 'Cryogonal', 'Golett', 'Carbink', 'Minior', 'Dhelmise', 'Sinistea', 'Falinks', 'Tandemaus', 'Poltchageist']
    if (maleOnlyPokemon.includes(p.name)) {
        return 'male'
    } else if (femaleOnlyPokemon.includes(p.name) || p.name.includes('Alcremie')) {
        return 'female'
    } else if (genderlessPokemon.includes(p.name)) {
        return 'none'
    } else {
        return 'both'
    }
}

function getCollectionProgress(ownedPokemonList) {
    // console.log(ownedPokemonList)
    let totalToCollect = 0
    let totalCollected = 0
    ownedPokemonList.forEach(p => {
        const ballsToCollect = Object.keys(p.balls).filter(ball => p.balls[ball].disabled !== true)
        for (let ball of ballsToCollect) {
            totalToCollect +=1
            if (p.balls[ball].isOwned === true) {
                totalCollected+=1
            }
        }
    })
    const ballProgress = {display: `${totalCollected}/${totalToCollect}`, percent: (totalCollected/totalToCollect)*100}
    // console.log(ballProgress)
    return ballProgress
}

function getAvailableHomeGames(ownedPokemonList) {
    const availableGamesData = {}
    ownedPokemonList.forEach((pokemon) => {
        availableGamesData[pokemon.name] = getSingleMonAvailableHomeGames(pokemon)
    })
    return availableGamesData
}

const getSingleMonAvailableHomeGames = (pokemon, pApiData=undefined) => {
    const availableGames = []
    const pokemonAPIData = pApiData ? pApiData : allPokemon.filter(pInfo => {
        const nameMatches = pokemon.natDexNum === pInfo.info.natDexNum || (pInfo.info.special !== undefined && pokemon.natDexNum === pInfo.info.special.child.natDexNum)
        return nameMatches
    })[0]
    Object.keys(pokemonAPIData.specificGenInfo).forEach((genInfo) => {
        const isHomeGame = genInfo !== 'gen6' && genInfo !== 'gen7'
        const isRegionalFormPokemon = regionalFormRegions.map((region) => pokemon.name.toLowerCase().includes(region.toLowerCase())).includes(true) && pokemonAPIData.info.regionalForm !== undefined
        const regionalFormIntro = isRegionalFormPokemon && pokemonAPIData.info.regionalForm.forms.filter(rForm => pokemon.name.includes(rForm.name))[0].gen
        const extraConsideration = pokemon.name.includes('White-Striped') //white-striped basculin is the only alt form pokemon who was introduced in a later gen (was introduced in legends arceus and made available in apriballs in sv)
        if (isHomeGame) {
            const genNum = parseInt(genInfo.slice(3))
            const genGameData = genGames.filter(gGInfo => gGInfo.gen === genNum)[0]
            const hasMultipleGames = genGameData !== undefined
            if (hasMultipleGames) {
                const games = Object.keys(pokemonAPIData.specificGenInfo[genInfo].balls)
                const availableGamesInGen = genGameData.games.filter(game => games.includes(game))
                if (isRegionalFormPokemon && (regionalFormIntro > genNum)) {
                    return
                } else {
                    availableGamesInGen.forEach(game => {
                        if ((isRegionalFormPokemon && noRegionalFormGens.includes(game)) || extraConsideration) {
                            return
                        } else {
                            availableGames.push(game)
                        }
                    })
                }
                
            } else {
                if (isRegionalFormPokemon && noRegionalFormGens.includes(genNum)) {
                    return
                } else {
                    availableGames.push(genNum)
                }
            }
        }
    })
    return availableGames
}

export {getImgLink, getPossibleEggMoves, getPossibleGender, getCollectionProgress, getAvailableHomeGames, getSingleMonAvailableHomeGames, getHomeGamesPossibleEggMoves}