const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
import { defer } from "react-router"

export default async function collectionLoader({params}, sub, isTradePage) {
    const collectionPromise = fetch(`${backendurl}/collections/${params.id}${sub ? `?col=${sub}` : ''}${isTradePage ? `?isTradePage=true` : ''}`)
        .then(res => res.json()).catch(e => {return {status: 500, name: 'Internal Server Error', message: 'We cannot communicate with our servers at the moment. Please try again later.'}})
                            // .then(async(res) => {
                            //     const data = await res.json()
                            //     if (res.ok) {return data} 
                            //     else {throw data}
                            // })
    // if (initializeState) {
    //     if (editPage) {
    //         dispatch(initCol(collection.ownedPokemon))
    //         dispatch(initOnhand(collection.onHand))
    //         dispatch(initOptions({...collection.options, collectionName: collection.name}))
    //     }
    //     dispatch(initList({collection: collection.ownedPokemon, onhand: collection.onHand, updatedEggMoveInfo: collection.eggMoveInfo, updatedHomeGames: collection.availableGamesInfo, resetCollectionFilters: true, resetOnHandFilters: true}))
    // }
    return defer({
        resolvedData: collectionPromise
    })
}

export const initializeCollectionPageState = (collection, tools) => {
    const {dispatch, initList, subListInit, initCol, initOnhand, initOptions, editPage} = tools
    // if (editPage) {
    //     dispatch(initCol(collection.ownedPokemon))
    //     dispatch(initOnhand(collection.onHand))
    //     dispatch(initOptions({...collection.options, collectionName: collection.name}))
    // }
    dispatch(initList(collection, subListInit))
}

export async function collectionLoaderEditPage(dispatch, initCol) {
    // const collection = await fetch(`${backendurl}/collections/${params.id}`)
    //                         .then(async(res) => {
    //                             const data = await res.json()
    //                             if (res.ok) {return data} 
    //                             else {throw data}
    //                         }) 

    // dispatch(initCol(collection.ownedPokemon))
    // dispatch(initOnhand(collection.onHand))
    // dispatch(initOptions({...collection.options, collectionName: collection.name}))
    dispatch(initCol(collection))
        
    return collection
}

export async function collectionLoaderNoDefer({params}) {
    const collection = await fetch(`${backendurl}/collections/${params.id}`)
                            .then(async(res) => {
                                const data = await res.json()
                                if (res.ok) {return data} 
                                else {throw data}
                            }) 
    return collection
}