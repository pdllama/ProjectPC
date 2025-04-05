const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
import { defer } from "react-router"

export default async function userLoader({params}) {
    const user = fetch(`${backendurl}/users/${params.username}`).then(res => res.json()).catch(e => {return {status: 500, name: 'Internal Server Error', message: 'We cannot communicate with our servers at the moment. Please try again later.'}})
                            // .then(async(res) => {
                            //     const data = await res.json()
                            //     if (res.ok) {return data}
                            //     else {throw data}
                            // })
    return defer({
        resolvedData: user
    })
}