import { pokemonNamesWithSpaces } from "../../../common/infoconstants/pokemonconstants.mjs";
import { exportGameSpriteLink } from "../../../../backend/common/infoconstants/importconstants.mjs";
import getNameDisplay from "../display/getnamedisplay";
//convertOptions: {
//  HAExport: Boolean, determines if that information should be exported when exporting isOwned
//  EMExport: Boolean, same thing as above. exports as a column of checkboxes which is checked if ANY ball combos have it.
//  addHANames: Boolean, adds a cell that tells you of the pokemon's HA
//  imgOwned: Boolean, adds image if ball combo is owned
//  getGameSprite: Boolean (only for home collections), selects whether 
//                  to get the sprite from their most recent home game,
//                  rather than their home sprite. 
//  ballOrder: array, the ball order of the user from their settings.
//  useByPView: boolean, used for onhand exports if they want to export the byPview
//  gen: num/string, the gen of the collection
//}


//pokemonDB sprite links tend to follow this format.
//"https://img.pokemondb.net/sprites/{name-of-game}/normal/{name-of-mon}.png"
// games: scarlet-violet, brilliant-diamond-shining-pearl, sun-moon, sword-shield
// normal: just normal mon name
// regionals: monName-regional(ian)
// alts: monName-formidentifier
function getPokemonDBSpriteLink(name, spriteSrcGame, gameSpriteOverride=undefined) {
    const gameLinkKey = exportGameSpriteLink[gameSpriteOverride ? gameSpriteOverride : spriteSrcGame]
    let nameLinkKey = ''
    const isAltOrRegional = name.includes(' ') && !pokemonNamesWithSpaces.includes(name)
    if (isAltOrRegional) {
        const isAlt = name.includes('(')
        const isPTauros = name.includes('Tauros')
        //dev note: im frankly very amused at how every time i need 
        //to extract and divide names that PTauros always has to be singled out due to
        //how unique his circumstance is. Just built different I suppose.
        //also, I REALLY need to abstract this identifier extraction logic out
        const identifier = isAlt ? name.slice(name.indexOf('(')+1, name.indexOf(')')).toLowerCase() : name.slice(0, name.indexOf(' ')).toLowerCase()
        nameLinkKey = isPTauros ? `paldean-${!name.includes('(') ? 'combat' : identifier}` : identifier
    } else {
        nameLinkKey = name.toLowerCase()
    }
    return `https://img.pokemondb.net/sprites/${gameLinkKey}/normal/${nameLinkKey}.png`
}

function convertBasicInfoLine(p, convertOptions, genOverride, nameDisplaySettings) {
    return  `${p.natDexNum},=IMG(${getPokemonDBSpriteLink(p.name, convertOptions.gen, genOverride)}),${getNameDisplay(nameDisplaySettings, p.name, p.natDexNum)}`
}

function convertIsOwnedData(bData, imgBallData, ball) {
    return bData === undefined ? ',' : 
        !imgBallData ? `${bData.isOwned ? 'TRUE,' : 'FALSE,'},` : 
        bData.isOwned ? `=IMG('${`https://res.cloudinary.com/duaf1qylo/image/upload/balls/${ball}.png`}'),` : ','
}

function convertIsHAData(bData) {
    const noHA = bData !== undefined && bData.isHA === undefined
    return noHA ? 'N/A,' : bData === undefined ? ',' : bData.isHA ? 'TRUE,' : 'FALSE,'
}

function getUniqueEMs(allBData) {
    const allBDataArr = Object.values(allBData)
    const allEMs = allBDataArr.map(bD => bD.EMs).flat()
    const allUniqueEMs = allEMs.filter((em, idx) => allEMs.indexOf(em) === idx)
    return allUniqueEMs
}

function convertEmData(bData, allBData, isOwnedTotalExport=false) {
    const noEMs = bData !== undefined && bData.EMs === undefined 
    const noAdditionalEMs = !isOwnedTotalExport
    const uniqueEms = noEMs ? [] : noAdditionalEMs ? bData.EMs : getUniqueEMs(allBData)
    let fullLine = ''
    for (let em in uniqueEms) {
        const fifthOrMoreEm = uniqueEms.indexOf(em) >= 4
        if (fifthOrMoreEm) {
            fullLine+= `"${uniqueEms.indexOf(em) === 4 ? "" : ","}${em}"`
        } else {
            // fullLine+=`${(uniqueEms.indexOf(em) === 0 && !isOwnedTotalExport) ? '' : ','}${em}`
            fullLine+=`,${em}`
        }
    }
    if (fullLine.count(',') < 4) {
        while (fullLine.count(',') < 4) {
            fullLine+=','
        }
    }
    return fullLine
}

//type: refers to if a user wants to export table of different data. isOwned, ha, or em
function convertCollectionToCSV(collectionList, convertOptions, nameDisplaySettings, type='isOwned', availableHomeGames) {
    let fullStr = ''

    for (let p in collectionList) {
        const genOverride = convertOptions.getGameSprite ? availableHomeGames[p.name][availableHomeGames[p.name].length-1] : undefined
        let line = convertBasicInfoLine(p, convertOptions, genOverride, nameDisplaySettings)
        if (convertOptions.addHANames) {
            const notHA = p.haName.includes('Non-HA')
            const haName = notHA ? p.haName.slice(0,p.haName.indexOf(' - ')) : p.haName
            const haLineAddition = notHA ? `,<i>${haName}</i>` : `,<b>${haName}</b>`
            line += haLineAddition
        }
        if (type !== 'EMs') {
            if (convertOptions.HAExport && type === 'isOwned') {
                const hasHAAvailable = Object.values(p.balls).map(bD => bD.isHA !== undefined && bD.isHA).includes(true)
                line+=`${hasHAAvailable ? 'TRUE' : 'FALSE'}`
            }
            for (let b in convertOptions.ballOrder) {
                const bData = p.balls[b]
                if (type === 'isOwned') {
                    line+=convertIsOwnedData(bData, convertOptions.imgOwned, b)
                } else if (type === 'isHA') {
                    line+= convertIsHAData(bData)
                } 
            }
            if (convertOptions.EMExport && type === 'isOwned') {
                line+=convertEmData(Object.values(p.balls)[0], p.balls, true)
            }
        } else {
            line+= convertEmData(bData, p.balls)
        }
        fullStr+=`${line}\n`
    }
    return fullStr
}

const getOHIndCols = (gen) => {
    return gen === 'home' ? ['ball', 'isHA', 'gender', 'emCount', 'EMs', 'qty'] : ['ball', 'isHA', 'gender', 'qty']
}

function convertOnHandToCSV(onhandList, convertOptions, nameDisplaySettings, availableHomeGames) {
    let fullStr = ''
    for (let p in onhandList) {
        //p at this point can be in either onhand format
        const genOverride = convertOptions.getGameSprite ? availableHomeGames[p.name][availableHomeGames[p.name].length-1] : undefined
        let line = convertBasicInfoLine(p, convertOptions, genOverride, nameDisplaySettings)
        if (convertOptions.addHANames) {
            const notHA = p.haName.includes('Non-HA')
            const haName = notHA ? p.haName.slice(0,p.haName.indexOf(' - ')) : p.haName
            const haLineAddition = notHA ? `,<i>${haName}</i>` : `,<b>${haName}</b>`
            line += haLineAddition
        }
        if (convertOptions.useByPView) {
            for (let b in convertOptions.ballOrder) {
                const bData = p.balls[b]
                line+=`,${(bData === undefined || bData.numTotal === 0) ? '' : bData.numTotal}`
            }
        } else {
            const cols = getOHIndCols(convertOptions.gen)
            for (let col in cols) {
                const isImgCol = col === 'gender' || col === 'ball'
                const finalLabel = col === 'gender' ? 
                    ((p.gender === 'unknown') ? ',<i>Unknown</i>' : 
                    p.gender === 'genderless' ? ',<i>N/A</i>' : undefined) : 
                    (col === 'isHA' && p.isHA === undefined) ? ',<i>N/A</i>' : 
                    ((col === 'emCount' || col === 'EMs') && p.emCount === undefined) ? ',<i>N/A</i>'  : undefined
                if (finalLabel) {
                    line+=finalLabel
                } else {
                    // if (isImgCol) {
                    //     if (col === 'gender' && (p.gender === 'unknown' || p.gender === 'genderless')) {
                    //         if (p.gender === 'unknown') {line+=',<i>Unknown</i>'} 
                    //         else {line+=',<i>N/A</i>'}
                    //     } else {
                    if (isImgCol) {
                       line+=`,=IMG('https://res.cloudinary.com/duaf1qylo/image/upload/${col === 'gender' ? 'icons' : 'balls'}/${col === 'gender' ? p.gender : p.ball}.png')` 
                    } else if (col === 'isHA') {
                        line+=`,${p.isHA ? 'TRUE' : 'FALSE'}`
                    } else if (col === 'EMs') {
                        line+=convertEmData(p, {}, false)
                    } else {
                        line+=`,${p[col]}`
                    }
                }
            }
        }
        fullStr+=line
    }
    return fullStr
}