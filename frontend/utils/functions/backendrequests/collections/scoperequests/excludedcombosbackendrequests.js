import handleApiResponse from "../../handleapiresponse";
const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

//addedPokemon=[], removedPokemon=[], ballChangedPokemon=[]
export default async function excludedCombosBackendChange(collectionId, addedPokemon, removedPokemon, ballChangedPokemon) {
    const newList = await fetch(`${backendurl}/collections/${collectionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({editType: 'excludedCombos', addedPokemon, removedPokemon, ballChangedPokemon})
    }).then(async(data) => {return await handleApiResponse(data)})
    return newList
}