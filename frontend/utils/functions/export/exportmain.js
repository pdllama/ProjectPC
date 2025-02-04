import { pokemonNamesWithSpaces, genderAltFormMons, interchangeableAltFormMons } from "../../../common/infoconstants/pokemonconstants.mjs";
import { exportGameSpriteLink, interchangeableAnyBaseCases } from "../../../common/infoconstants/importconstants.mjs";
import getNameDisplay from "../display/getnamedisplay";
import { capitalizeFirstLetter } from "../misc";
//convertOptions: {
//  HAExport: Boolean, determines if that information should be exported when exporting isOwned. exports as a column of checkboxes which is checked if ANY ball combos have it.
//  EMExport: Boolean, same thing as above. 
//  addHANameColumn: Boolean, adds a cell that tells you of the pokemon's HA
//  imgOwned: Boolean, adds image if ball combo is owned
//  getGameSprite: Boolean (only for home collections), selects whether 
//                  to get the sprite from their most recent home game,
//                  rather than their home sprite. 
//  ballOrder: array, the ball order of the user from their settings.
//  useByPView: boolean, used for onhand exports if they want to export the byPview
//  ohRawBallData: boolean, used if they just want the ball name for the ball column
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
    const genderedAlt = genderAltFormMons.map(gAF => name.includes(gAF)).includes(true)
    const nameContainsSpecialCharacters = name.includes(' ') || name.includes("'") || name.includes(".")
    if (genderedAlt) {
        nameLinkKey = `${genderAltFormMons.filter(gAF => name.includes(gAF))[0].toLowerCase()}-${(name.includes('♀') || name.includes('Female')) ? 
            name.includes('Indeedee') ? 'female' : 'f' : name.includes('Indeedee') ? 'male' : 'm'}`
            //pokemon sprites db inconsistently applies f/female and m/male to nidoran/indeedee. pay attention to that for future gendered alts.
    } else if (isAltOrRegional) {
        if (name.includes('Alcremie')) {
            const creamNameStep1 = name.slice(name.indexOf('(')+1, name.indexOf(')'))
            const creamName = creamNameStep1.slice(creamNameStep1.indexOf(' ')+1).replace(' ', '-').toLowerCase()
            nameLinkKey = `alcremie-${creamName}`
        } else {
            const isAlt = name.includes('(')
            const isPTauros = name.includes('Tauros')
            //dev note: im frankly very amused at how every time i need 
            //to extract and divide names that PTauros always has to be singled out due to
            //how unique his circumstance is. Just built different I suppose.
            //also, I REALLY need to abstract this identifier extraction logic out
            const identifier = isAlt ? name.slice(name.indexOf('(')+1, name.indexOf(')')).toLowerCase() : name.slice(0, name.indexOf(' ')).toLowerCase().replace("'", '').replace(' ', '-')
            const species = name.slice(isAlt ? 0 : name.indexOf(' ')+1, isAlt ? name.indexOf(' ') : name.length).toLowerCase()
            nameLinkKey = isPTauros ? `tauros-paldean-${!name.includes('(') ? 'combat' : identifier}` : 
                name.includes('Rockruff') ? species : 
                name.includes('Pumpkaboo') && (gameLinkKey === 'sword-shield') ? species :
                (name.includes('Sinistea') || name.includes('Poltchageist')) ? species : 
                name.includes('Minior') ? `minior-${identifier}-core` :
                name.includes('Any') ? `${species}-${interchangeableAnyBaseCases[species]}` : 
                name.includes('Flabébé') ? `flabebe-${identifier}` : 
                //above are some exceptions to the naming convention of pokemondbsprites with alternates.
                `${(species.includes('.') || species.includes(' ') || species.includes("'")) ? species.replace('.', '').replace(' ', '-').replace("'", '') : species}-${identifier}`
        }
    } else {
        nameLinkKey = nameContainsSpecialCharacters ? name.toLowerCase().replace('.', '').replace(' ', '-').replace("'", '') : name.toLowerCase() 
    }
    return `https://img.pokemondb.net/sprites/${gameLinkKey}/normal/${nameLinkKey}.png`
}

function convertBasicInfoLine(p, convertOptions, genOverride, nameDisplaySettings) {
    return  `${p.natDexNum},IMAGE("${getPokemonDBSpriteLink(p.name, convertOptions.gen, genOverride)}"),${getNameDisplay(nameDisplaySettings, p.name, p.natDexNum)},`
}

function convertIsOwnedData(bData, imgBallData, ball) {
    return bData === undefined ? ',' : 
        !imgBallData ? `${bData.isOwned ? 'TRUE' : 'FALSE'},` : 
        bData.isOwned ? `IMAGE("${`https://res.cloudinary.com/duaf1qylo/image/upload/balls/${ball}.png`}"),` : ','
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
    uniqueEms.forEach((em, i) => {
        const fifthOrMoreEm = i >= 4
        if (fifthOrMoreEm) {
            fullLine+= `${i === 4 ? ',"' : ', '}${em}${i === uniqueEms.length-1 ? '"' : ''}`
        } else {
            // fullLine+=`${(uniqueEms.indexOf(em) === 0 && !isOwnedTotalExport) ? '' : ','}${em}`
            fullLine+=`${!isOwnedTotalExport ? ',' : i === 0 ? '' : ','}${em}`
        }
    })
    if (!isOwnedTotalExport || (fullLine !== '' && fullLine.match(/,/g).length < 4)) {
        if (!fullLine.includes(",")) {
            fullLine += ','
        }
        while (fullLine.match(/,/g).length < 4) {
            fullLine+=','
        }
    }
    return fullLine
}

//type: refers to if a user wants to export table of different data. isOwned, ha, or em
// currently unused, actually.
function convertCollectionToCSV(collectionList, convertOptions, nameDisplaySettings, availableHomeGames, type='isOwned') {
    let fullStr = ''
    collectionList.forEach(p => { 
        const genOverride = convertOptions.getGameSprite ? availableHomeGames[p.name][availableHomeGames[p.name].length-1] : undefined
        let line = convertBasicInfoLine(p, convertOptions, genOverride, nameDisplaySettings)
        if (convertOptions.addHANameColumn) {
            const notHA = p.haName.includes('Non-HA')
            const haName = notHA ? p.haName.slice(0,p.haName.indexOf(' - ')) : p.haName
            const haLineAddition = notHA ? `${haName} (Non-HA),` : `${haName},`
            line += haLineAddition
        }
        if (type !== 'EMs') {
            if (convertOptions.HAExport && type === 'isOwned') {
                const hasHAAvailable = Object.values(p.balls).map(bD => bD.isHA !== undefined && bD.isHA).includes(true)
                line+=`${hasHAAvailable ? 'TRUE' : 'FALSE'},`
            }
            convertOptions.ballOrder.forEach(b => {
                const bData = p.balls[b]
                if (type === 'isOwned') {
                    line+=convertIsOwnedData(bData, convertOptions.imgOwned, b)
                } else if (type === 'isHA') {
                    line+= convertIsHAData(bData)
                } 
            }) 
            if (convertOptions.EMExport && type === 'isOwned') {
                line+=convertEmData(Object.values(p.balls)[0], p.balls, true)
            }
        } else {
            line+= convertEmData(bData, p.balls)
        }
        fullStr+=`${line}\n`
    })
    return fullStr
}

const getOHIndCols = (gen) => {
    return gen === 'home' ? ['ball', 'isHA', 'gender', 'qty'] : ['ball', 'isHA', 'gender', 'EMs', 'qty']
}

function convertOnHandToCSV(onhandList, convertOptions, nameDisplaySettings, availableHomeGames) {
    let fullStr = ''
    onhandList.forEach(p => {
        //p at this point can be in either onhand format
        const genOverride = convertOptions.getGameSprite ? availableHomeGames[p.name][availableHomeGames[p.name].length-1] : undefined
        let line = convertBasicInfoLine(p, convertOptions, genOverride, nameDisplaySettings)
        if (convertOptions.addHANameColumn) {
            const notHA = p.haName.includes('Non-HA')
            const haName = notHA ? p.haName.slice(0,p.haName.indexOf(' - ')) : p.haName
            const haLineAddition = notHA ? `${haName} (Non-HA)` : `${haName}`
            line += haLineAddition
        }
        if (convertOptions.useByPView) {
            convertOptions.ballOrder.forEach(b => {
                const bData = p.balls[b]
                line+=`,${(bData === undefined || bData.numTotal === 0) ? '' : bData.numTotal}`
            })
        } else {
            const cols = getOHIndCols(convertOptions.gen)
            cols.forEach(col => {
                const isImgCol = col === 'gender' || col === 'ball'
                const finalLabel = col === 'gender' ? 
                    ((p.gender === 'unknown') ? ',Unknown' : 
                    p.gender === 'genderless' ? ',N/A' : undefined) : 
                    (col === 'isHA' && p.isHA === undefined) ? ',N/A' : 
                    ((col === 'emCount' || col === 'EMs') && p.emCount === undefined) ? ',N/A'  : undefined
                if (finalLabel) {
                    line+=finalLabel
                } else {
                    // if (isImgCol) {
                    //     if (col === 'gender' && (p.gender === 'unknown' || p.gender === 'genderless')) {
                    //         if (p.gender === 'unknown') {line+=',<i>Unknown</i>'} 
                    //         else {line+=',<i>N/A</i>'}
                    //     } else {
                    if (isImgCol) {
                        if (convertOptions.ohRawBallData) {
                            line+=`,${capitalizeFirstLetter(col === 'gender' ? p.gender : p.ball)}`
                        } else {
                            line+=`,IMAGE("https://res.cloudinary.com/duaf1qylo/image/upload/${col === 'gender' ? 'icons' : 'balls'}/${col === 'gender' ? p.gender : p.ball}.png")` 
                        }
                    } else if (col === 'isHA') {
                        line+=`,${p.isHA ? 'TRUE' : 'FALSE'}`
                    } else if (col === 'EMs') {
                        line+=convertEmData(p, {}, false)
                    } else {
                        line+=`,${p[col]}`
                    }
                }
            })
        }
        fullStr+=`${line}\n`
    })
    return fullStr
}

export {convertCollectionToCSV, convertOnHandToCSV}