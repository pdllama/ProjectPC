import Collection from '../../../models/collections.js'
import { poolCollectionProgressSingle, updateCollectionToHomeEMFormat } from './functions/poolcollectionprogress.js'
import { transformToFullSheet, transformToSubSheet } from './functions/transformlists.js'

export default async function linkAndUnlinkCollections(req, res) {
    const {id} = req.params
    const {linkColData, unlink} = req.body
    //linkColData will always be the central HOME collection if possible. 
    const collection = await Collection.findById(id)
    const collection2 = await Collection.findById(linkColData)
    const centralCollection = (collection.gen === 'home' ? collection : collection2.gen === 'home' && collection2)
    const nonCentralCollection =  (collection.gen === 'home' ? collection2 : collection2.gen === 'home' && collection)

    if (!unlink) {
        const needDummyCollection = !centralCollection
        if (needDummyCollection) {
            const dummyCollection = new Collection({
                owner: collection.owner,
                type: 'aprimon',
                name: 'Dummy Collection',
                gen: 'dummy',
                isDummyCollection: true,
                ownedPokemon: updateCollectionToHomeEMFormat(collection.ownedPokemon, collection.gen)
            })
            const defaultSortKey = collection.options.sorting.collection.reorder && collection.options.sorting.collection.default 
            // const otherCollection = await Collection.findById(linkColData._id)
            const otherCollection = collection2
            const oPList = poolCollectionProgressSingle(dummyCollection.ownedPokemon, otherCollection.ownedPokemon, otherCollection.gen, defaultSortKey)

            dummyCollection.ownedPokemon = oPList
            await dummyCollection.save()

            collection.ownedPokemon = transformToSubSheet(collection.ownedPokemon)
            otherCollection.ownedPokemon = transformToSubSheet(otherCollection.ownedPokemon)
            collection.linkedTo = {super: dummyCollection._id, dummyCollection: true}
            otherCollection.linkedTo = {super: dummyCollection._id, dummyCollection: true}
            await collection.save()
            await dummyCollection.save()
            await otherCollection.save()

            res.json({central: dummyCollection._id, current: id})
        } else {
            //below is to check if a home collection is newly being linked to non-home collection that is already connected to other non-home collection
            const nonHomeConnectedToNonHome = nonCentralCollection.linkedTo !== undefined && nonCentralCollection.linkedTo.dummyCollection
            if (nonHomeConnectedToNonHome) {
                const thirdCollection = await Collection.findOne({'linkedTo.super': nonCentralCollection.linkedTo.super, gen: {$not: {$eq: nonCentralCollection.gen}}})
                const dummyCollection = await Collection.findById(nonCentralCollection.linkedTo.super)
                
                centralCollection.ownedPokemon = poolCollectionProgressSingle(centralCollection.ownedPokemon, dummyCollection.ownedPokemon, dummyCollection.gen, nonCentralCollection.options.sorting.collection.reorder ? nonCentralCollection.options.sorting.collection.default : undefined)
                await centralCollection.save()

                nonCentralCollection.linkedTo = {super: centralCollection._id, dummyCollection: false}
                thirdCollection.linkedTo = {super: centralCollection._id, dummyCollection: false}
                await nonCentralCollection.save()
                await thirdCollection.save()
                await Collection.deleteOne(dummyCollection._id)
                res.json({central: centralCollection._id, current: id === centralCollection._id.toString() ? undefined : id})
            } else {
                centralCollection.ownedPokemon = poolCollectionProgressSingle(centralCollection.ownedPokemon, nonCentralCollection.ownedPokemon, nonCentralCollection.gen, nonCentralCollection.options.sorting.collection.reorder ? nonCentralCollection.options.sorting.collection.default : undefined)
                await centralCollection.save()
                nonCentralCollection.ownedPokemon = transformToSubSheet(nonCentralCollection.ownedPokemon)
                nonCentralCollection.linkedTo = {super: centralCollection._id, dummyCollection: false}
                await nonCentralCollection.save()
                res.json({central: centralCollection._id, current: centralCollection._id.toString() !== id ? id : undefined})
            }
        }
    } else {
        const unlinkingDummyCollection = !centralCollection
        if (unlinkingDummyCollection) {
            const dummyCollection = await Collection.findById(collection.linkedTo.super)
            collection.ownedPokemon = transformToFullSheet(collection.ownedPokemon, dummyCollection.ownedPokemon, collection.gen)
            collection2.ownedPokemon = transformToFullSheet(collection2.ownedPokemon, dummyCollection.ownedPokemon, collection2.gen)
            collection.linkedTo = undefined
            collection2.linkedTo = undefined
            await collection.save()
            await collection2.save()
            await Collection.deleteOne(dummyCollection._id)
            res.json({central: id})
        } else {
            // console.log(nonCentralCollection)
            nonCentralCollection.ownedPokemon = transformToFullSheet(nonCentralCollection.ownedPokemon, centralCollection.ownedPokemon, nonCentralCollection.gen)
            nonCentralCollection.linkedTo = undefined
            await nonCentralCollection.save()
            res.json({central: id})
        }
    }
}