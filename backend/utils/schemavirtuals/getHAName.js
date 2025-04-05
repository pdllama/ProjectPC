import { pokemonNamesWithSpaces } from "../../common/infoconstants/pokemonconstants.mjs";
import { getAPIGenFormat } from "../CreateCollection/createutils.js";
import allPokemon from "../aprimonAPI/allpokemoninfo.js";
import { regionIdentifiers } from "../../common/infoconstants/miscconstants.mjs";
import { selectPokemonInfo } from "./infoandotherfuncs.js";

// const extractHA = (haObj, ) => {

// }

const handleForRegionalAndAlt = (pApiData, pName, altWithDifferentHAs, isRegional, haPath=undefined) => {
    //haPath only defined they have a differnet ha per gen. currently only applies to piplup. 
    
    if (altWithDifferentHAs) {
        const identifier = pName.slice(pName.indexOf('(')+1, pName.indexOf(')'))
        const aFormNum = Object.values(pApiData.info.alternateForm.name).indexOf(identifier)
        return haPath ? haPath[aFormNum+1] : pApiData.info.alternateForm.ha[aFormNum+1]
    }
    
    //regionals very often have different ha's.
    if (isRegional) {
        const regionIdentifier = pName.slice(0, pName.indexOf(' '))
        //current only applies to Meowth (jan 2025), but this might be a commonstay in the franchise.
        const multipleRegionals = pApiData.info.regionalForm.forms.length !== 1
        if (multipleRegionals) {
            const formNum = pApiData.info.regionalForm.forms.findIndex(f => f.name === regionIdentifier) + 1
            if (!pApiData.info.HA.name[`alt${formNum}`]) {
                return haPath ? haPath.reg : pApiData.info.HA.name.reg
            }
            const ha = haPath ? haPath[`alt${formNum}`] : pApiData.info.HA.name[`alt${formNum}`]
            return ha
        } else {
            const ha = haPath ? haPath.alt1 : pApiData.info.HA.name.alt1
            if (!ha) {
                return haPath ? haPath.reg :pApiData.info.HA.name.reg
            }
            return ha
        }
    }
    return haPath ? haPath.reg : pApiData.info.HA.name.reg
}

export default function getHAName(pokemon, collectionGen) {
    const pApiData = selectPokemonInfo(pokemon.name, pokemon.gen, pokemon.natDexNum)
    const altWithDifferentHAs = pApiData.info.alternateForm !== undefined && pApiData.info.alternateForm.ha !== undefined
    const isRegional = pApiData.info.regionalForm !== undefined && regionIdentifiers.filter(rP => pokemon.name.includes(rP)).length !== 0

    if (pApiData.info.HA.differentGenHA) { //currently only applies to piplup. can only reach this route if they have an ha
        const formattedGen = getAPIGenFormat(collectionGen)
        const basePath =  altWithDifferentHAs ? pApiData.info.alternateForm.ha : pApiData.info.HA.name
        if (formattedGen === 'home') {
            let HAs = ""
            Object.values(basePath).forEach((ha, i) => {
                //note this logic only handles different gen in home collections who DONT have regionals. if it ever happens that it changes, look here.
                if (typeof ha === 'object') {
                    HAs+=`${i===0 ? '' : '/'}${ha.reg}`
                } else {
                    HAs+=`${i === 0 ? '' : '/'}${ha}`
                }
            })
            return HAs
        }
        return handleForRegionalAndAlt(pApiData, pokemon.name, altWithDifferentHAs, isRegional, basePath[formattedGen])
    }

    //below currently only applies to squawkabilly as of Jan 2025. the ha is stored
    //in a different place than regular pokemon.
    if (!pApiData.info.HA.hasHA) {
        //below happens for only yamask (jan 2025) - reg ability is diff from galarian
        const multipleNonHAs = typeof pApiData.info.HA.regAbilityName === 'object'
        if (multipleNonHAs) {
            const isRegionalOrAlt = pokemon.name.includes(' ') && !pokemonNamesWithSpaces.includes(pokemon.name)
            if (isRegionalOrAlt) {return `${pApiData.info.HA.regAbilityName.alt1} - Non-HA`}
            else {return `${pApiData.info.HA.regAbilityName.reg} - Non-HA`}
        } else {return `${pApiData.info.HA.regAbilityName} - Non-HA`}
    }
    return handleForRegionalAndAlt(pApiData, pokemon.name, altWithDifferentHAs, isRegional)

    // const altWithDifferentHAs = pApiData.info.alternateForm !== undefined && pApiData.info.alternateForm.ha !== undefined
    // if (altWithDifferentHAs) {
    //     const identifier = pokemon.name.slice(pokemon.name.indexOf('(')+1, pokemon.name.indexOf(')'))
    //     const aFormNum = Object.values(pApiData.info.alternateForm.name).indexOf(identifier)
    //     return pApiData.info.alternateForm.ha[aFormNum+1]
    // }
    
    // //regionals very often have different ha's.
    // const isRegional = pokemon.name.includes(' ') && (!pokemon.name.includes('(') || pokemon.name.includes('Tauros')) 
    //     && !pokemonNamesWithSpaces.includes(pokemon.name)
    // if (isRegional) {
    //     const regionIdentifier = pokemon.name.slice(0, pokemon.name.indexOf(' '))
    //     //current only applies to Meowth (jan 2025), but this might be a commonstay in the franchise.
    //     const multipleRegionals = pApiData.info.regionalForm.forms.length !== 1
    //     if (multipleRegionals) {
    //         const formNum = pApiData.info.regionalForm.forms.findIndex(f => f.name === regionIdentifier) + 1
    //         if (!pApiData.info.HA.name[`alt${formNum}`]) {
    //             return pApiData.info.HA.name.reg
    //         }
    //         const ha = pApiData.info.HA.name[`alt${formNum}`]
    //         return ha
    //     } else {
    //         const ha = pApiData.info.HA.name.alt1
    //         if (!ha) {
    //             return pApiData.info.HA.name.reg
    //         }
    //         return ha
    //     }
    // }
    // return pApiData.info.HA.name.reg
}