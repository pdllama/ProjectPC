

import handleApiResponse from "../handleapiresponse";

const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export default async function updateHomeCollectionsBackendRequest() {
    return await fetch(`${backendurl}/api/admin/update-home-collections`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({wa: 'wa'}),
    }).then(async(data) => {return await handleApiResponse(data, false)})
}