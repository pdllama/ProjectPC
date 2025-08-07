import handleApiResponse from "../../handleapiresponse";
const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export default async function customSortChange(collectionId, sortOrder) {
    return await fetch(`${backendurl}/collections/${collectionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({editType: 'customSort', sortingOrder: sortOrder})
    }).then(async(data) => {return await handleApiResponse(data, false)})
}