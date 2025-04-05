const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
import { defer } from "react-router"

export default async function tradeLoader({params}, getFullCollectionData=false) {
    const tradeData = fetch(`${backendurl}/trades/${params.id}?getFullCollectionData=${getFullCollectionData}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    }).then(res => res.json())
    .catch(e => {return {status: 500, name: 'Internal Server Error', message: 'We cannot communicate with our servers at the moment. Please try again later.'}})
    // .then(async(res) => {
    //     const data = await res.json()
    //     if (res.ok) {return data}
    //     else {throw data}
    // })

    
    // .then(data => { //bandaid solution to what should be solved through database querying tools
    //     const tradeData = data.tradeData
    //     const crossGenTrade = tradeData.gen.includes('-')
    //     const newUsersArr = tradeData.users.map((userData, userIdx) => {
    //         const genRef = crossGenTrade ? (
    //             userIdx === 0 ? tradeData.gen.slice(0, tradeData.gen.indexOf('-')) : tradeData.gen.slice(tradeData.gen.indexOf('-')+1)
    //         ) : tradeData.gen
    //         const tradeCollectionData = userData.collections.filter(col => col.gen === genRef)[0]
    //         return {...userData, tradeCollection: tradeCollectionData}
    //     })
    //     return {...data, tradeData: {...tradeData, users: newUsersArr}}
    // })
    return defer({resolvedData: tradeData})
}