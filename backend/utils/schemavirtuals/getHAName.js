import { pokemonNamesWithSpaces } from "../../common/infoconstants/pokemonconstants.mjs";
import allPokemon from "../aprimonAPI/allpokemoninfo.js";
import { selectPokemonInfo } from "./infoandotherfuncs.js";

// const extractHA = (haObj, ) => {

// }

export default function getHAName(pokemon) {
    const pApiData = selectPokemonInfo(pokemon.name, pokemon.gen, pokemon.natDexNum)
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
    const altWithDifferentHAs = pApiData.info.alternateForm !== undefined && pApiData.info.alternateForm.ha !== undefined
    if (altWithDifferentHAs) {
        const identifier = pokemon.name.slice(pokemon.name.indexOf('(')+1, pokemon.name.indexOf(')'))
        const aFormNum = Object.values(pApiData.info.alternateForm.name).indexOf(identifier)
        return pApiData.info.alternateForm.ha[aFormNum+1]
    }
    
    //regionals very often have different ha's.
    const isRegional = pokemon.name.includes(' ') && (!pokemon.name.includes('(') || pokemon.name.includes('Tauros')) 
        && !pokemonNamesWithSpaces.includes(pokemon.name)
    if (isRegional) {
        const regionIdentifier = pokemon.name.slice(0, pokemon.name.indexOf(' '))
        //current only applies to Meowth (jan 2025), but this might be a commonstay in the franchise.
        const multipleRegionals = pApiData.info.regionalForm.forms.length !== 1
        if (multipleRegionals) {
            const formNum = pApiData.info.regionalForm.forms.findIndex(f => f.name === regionIdentifier) + 1
            const ha = pApiData.info.HA.name[`alt${formNum}`]
            return ha
        } else {
            const ha = pApiData.info.HA.name.alt1
            return ha
        }
    }
    return pApiData.info.HA.name.reg
}