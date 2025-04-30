import handleApiResponse from "../../handleapiresponse";
const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export default async function createNewAnnouncement(type, title, body, seriesData, buttons, notificationData) {
    //seriesData: {isSeries, seriesName, makeNewSeries}
    //notificationData: {sendNotifications, notiTitle, notiBody}
    return await fetch(`${backendurl}/api/admin/announcements`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({type, title, body, seriesData, buttons, notificationData})
    }).then(async(data) => {return await handleApiResponse(data, false)})
    .catch(e => {return {ok: false, load: {status: 500, name: 'Internal Server Error', message: 'We cannot communicate with our servers at the moment. Please try again later.'}}})
}