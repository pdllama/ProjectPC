import handleApiResponse from "../../handleapiresponse";
const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export default async function pokemonScopeBackendChange(collectionId, addedPokemon, removedPokemon, newPokemon) {
    const newUpdates = await fetch(`${backendurl}/collections/${collectionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({editType: 'pokemonScope', addedPokemon, removedPokemon, newPokemon})
    }).then(async(data) => {return await handleApiResponse(data, true)})
    return newUpdates
}