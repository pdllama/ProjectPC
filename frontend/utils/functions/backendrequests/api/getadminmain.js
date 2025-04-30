import handleApiResponse from "../handleapiresponse";

const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export default async function getAdminMain() {
    return await fetch(`${backendurl}/api/admin/get-admin-main`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    }).then(data => data.json())
    .catch(e => {return {status: 500, name: 'Internal Server Error', message: 'We cannot communicate with our servers at the moment. Please try again later.'}})
}