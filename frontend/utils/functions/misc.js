import { interchangeableAltFormMons, interchangeableAltFormForms } from "../../common/infoconstants/pokemonconstants.mjs"
import { getHighestEmGen } from "../../src/components/collectiontable/tabledata/emindicator"

function capitalizeFirstLetter(word) {
    return `${word.charAt(0).toUpperCase()}${word.slice(1)}`
}

function setMaxEmArr(maxEms) {
    if (maxEms === 0) {
        return [0]
    } else if (maxEms === 1) {
        return [0, 1]
    } else if (maxEms === 2) {
        return [0, 2, 1]
    } else if (maxEms === 3) {
        return [0, 3, 1, 2]
    } else {
        return [0, 4, 1, 2, 3]
    }
}

function selectNextEmCount(emCountArr, currEmCount) {
    const idxOfCurrEmCount = emCountArr.indexOf(currEmCount)
    if (idxOfCurrEmCount === (emCountArr.length - 1)) {
        return 0
    } else {
        return emCountArr[idxOfCurrEmCount + 1]
    }
}
//below is a generalized function of the specific above. too lazy to unify them.
function selectAdjArrItem(arr, currItem, next) {
    const idxOfCurrItem = arr.indexOf(currItem)
    if (idxOfCurrItem === (arr.length - 1) && next) {
        return arr[0]
    } else if (idxOfCurrItem === 0 && !next){
        return arr[arr.length - 1]
    } else {
        return arr[(next ? (idxOfCurrItem + 1) : (idxOfCurrItem - 1))]
    }
}

function getOwnedBalls(ballsObj) {
    const temp = Object.entries(ballsObj)
    const ownedBalls = temp.filter(p => p[1].isOwned === true).map(p => p[0])
    return ownedBalls
}

function getPokemonWithOwnedBalls(collection) {
    const listOfPokemon = collection.map(pokemon => {
        if (pokemon.disabled) {return undefined}
        const hasOwnedBalls = Object.values(pokemon.balls).map(ballInfo => ballInfo.isOwned).includes(true)
        const isAnyIntFormMon = interchangeableAltFormMons.map(mon => pokemon.name.includes(mon)).includes(true) && pokemon.name.includes('Any')
        if (hasOwnedBalls && isAnyIntFormMon) {
            const species = pokemon.name.slice(0, pokemon.name.indexOf(' '))
            const forms = interchangeableAltFormForms[species]
            const newImgLinkId = forms.map(f => species === 'Deerling' ? f.slice(0, 3).toLowerCase() : f === "Pa'u" ? 'pau' : f[0].toLowerCase())
            return forms.map((f, idx) => {
                return {
                    ...pokemon,
                    name: `${species} (${f})`,
                    imgLink: `${pokemon.natDexNum}-${newImgLinkId[idx]}`
                }
            })
        }
        return hasOwnedBalls ? pokemon : undefined
    }).flat().filter(pokemon => pokemon !== undefined)
    return listOfPokemon
}

function randomGender() {
    const genders = ['male', 'female']
    const idx = Math.round(Math.random())
    return genders[idx]
}

function setNewOnHandPokemonState(ballInfo, newSelection) {
    if (ballInfo.isHA === undefined && ballInfo.EMs === undefined && ballInfo.eggMoveData === undefined) {
        const newOnHandData = {
            gender: newSelection.possibleGender === 'both' ? 'unknown' : newSelection.possibleGender, 
            qty: 1
        }
        return newOnHandData
    } else if (ballInfo.isHA === undefined) {
        const isHomeCollection = ballInfo.eggMoveData !== undefined
        const highestEmGen = isHomeCollection ? getHighestEmGen(ballInfo.eggMoveData) : undefined
        const emGenProp = isHomeCollection ? {emGen: highestEmGen} : {}
        const newOnHandData = {
            gender: newSelection.possibleGender === 'both' ? 'unknown' : newSelection.possibleGender, 
            emCount: isHomeCollection ? ballInfo.eggMoveData[highestEmGen].emCount : ballInfo.emCount,
            EMs: isHomeCollection ? ballInfo.eggMoveData[highestEmGen].EMs : ballInfo.EMs,
            ...emGenProp,
            qty: 1
        }
        return newOnHandData
    } else if (ballInfo.EMs === undefined && ballInfo.eggMoveData === undefined) {
        const newOnHandData = {
            gender: newSelection.possibleGender === 'both' ? 'unknown' : newSelection.possibleGender, 
            isHA: ballInfo.isHA,
            qty: 1
        }
        return newOnHandData
    } else {
        const isHomeCollection = ballInfo.eggMoveData !== undefined
        const highestEmGen = isHomeCollection ? getHighestEmGen(ballInfo.eggMoveData) : undefined
        const emGenProp = isHomeCollection ? {emGen: highestEmGen} : {}
        const newOnHandData = {
            gender: newSelection.possibleGender === 'both' ? 'unknown' : newSelection.possibleGender, 
            isHA: ballInfo.isHA, 
            emCount: isHomeCollection ? ballInfo.eggMoveData[highestEmGen].emCount : ballInfo.emCount,
            EMs: isHomeCollection ? ballInfo.eggMoveData[highestEmGen].EMs : ballInfo.EMs,
            ...emGenProp,
            qty: 1
        }
        return newOnHandData
    }
}

function selectivelyReturnIsHAAndEMs(key, value) {
    if (value === undefined) {
        return {}
    } else {
        return {[key]: value}
    }
}

function handleEMsState(newEM, currEMArr) {
    if (currEMArr.includes(newEM)) {
        const newEMList = currEMArr.filter(em => em !== newEM)
        return newEMList
    } else {
        const newEMList = currEMArr.concat(newEM)
        return newEMList
    }
}

const interchangeableAltFormNames = []

Object.keys(interchangeableAltFormForms).forEach(name => {
    interchangeableAltFormForms[name].forEach(form => {
        interchangeableAltFormNames.push(`${name} (${form})`)
    })
})

//when a collection is collecting interchangeable (Any) forms, they can only have on-hands of the actual forms and not (Any).
//that raises problems when the program looks for available games of that pokemon but because we're collecting (any), their exact form name
//doesnt show up.
//this function equalizes that.
//only applies to on-hand filtering and games display (in the table).
function availableGamesInterchangeableEquivalencies(availableGamesInfo, pName) {
    const isInterchangeableMon = interchangeableAltFormNames.includes(pName) 
    if (isInterchangeableMon && (availableGamesInfo[pName] === undefined)) {
        return availableGamesInfo[`${pName.slice(0, pName.indexOf(' '))} (Any)`]
    } 
    return availableGamesInfo[pName]
}

export {
    capitalizeFirstLetter, 
    setMaxEmArr, 
    selectNextEmCount, 
    selectAdjArrItem, 
    getOwnedBalls, 
    getPokemonWithOwnedBalls, 
    randomGender, 
    setNewOnHandPokemonState, 
    selectivelyReturnIsHAAndEMs, 
    handleEMsState,
    availableGamesInterchangeableEquivalencies
}