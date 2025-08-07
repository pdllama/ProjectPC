import handleApiResponse from "../handleapiresponse";
const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export default async function linkAndUnlinkCollections(collectionId, linkColData, unlink) {
    const collectionIds = await fetch(`${backendurl}/collections/${collectionId}/link`, {
        method: 'PUT',
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({linkColData, unlink})
    }).then(async(data) => {return await handleApiResponse(data, true)})
    if (!collectionIds.ok) {return collectionIds}
    return {ok: true, load: `/collections/${collectionIds.load.central}/edit${collectionIds.load.current ? `?col=${collectionIds.load.current}` : ''}`}
}