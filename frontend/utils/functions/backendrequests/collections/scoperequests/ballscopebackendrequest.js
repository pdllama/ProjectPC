import handleApiResponse from "../../handleapiresponse";
const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

//newBallScope, addedBalls=[], removedBalls=[], removedPokemon, mainColId=undefined, isLinkedCollection, legalBallInfo, unsavedChanges=undefined
export default async function ballScopeBackendChange(collectionId, newBallScope, addedBalls=[], removedBalls=[], removedPokemon, mainColId, isLinkedCollection, legalBallInfo, unsavedChanges=undefined) {
    const newList = await fetch(`${backendurl}/collections/${collectionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({editType: 'ballScope', newBallScope, addedBalls, removedBalls, removedPokemon, mainColId, isLinkedCollection, legalBallInfo, unsavedChanges})
    }).then(async(data) => {return await handleApiResponse(data, true)})
    return newList
}