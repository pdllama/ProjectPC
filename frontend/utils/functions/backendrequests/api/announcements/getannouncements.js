import handleApiResponse from "../../handleapiresponse";
const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export default async function getAnnouncementsFromBackend(getLatest, skip) {
    return await fetch(`${backendurl}/api/admin/announcements?getLatest=${getLatest}&skip=${skip}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    }).then(async(data) => {return await handleApiResponse(data, true)})
    .catch(e => {return {
        ok: false,
        load: {
            name: 'Internal Server Error',
            message: "Our server has encountered an unexpected error!",
            status: 500
        }
    }})
}