import handleApiResponse from "./handleapiresponse"
const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export default async function getUserCollectionData(collectionId, isCentral, linked=true) {
    return await fetch(`${backendurl}/collections/${collectionId}${linked ? '?getLinkedAsSingle=true' : ''}${isCentral ? `${linked ? '&' : '?'}isCentral=true` : ''}`)
        .then(async(data) => {return await handleApiResponse(data, true)})
}