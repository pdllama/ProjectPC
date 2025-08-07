import Collection from '../../../models/collections.js'
import User from '../../../models/users.js'
import { homeGenNumConversion } from '../../../common/infoconstants/miscconstants.mjs'
import { onhandSingleValueUpdates } from './functions/changessetconstructor.js'
import { getCollectionProgressPercent } from '../../../models/postpremiddleware.js'
import { checkBadgeMilestone } from '../../../models/postpremiddleware.js'
import { sortOnHandList } from '../../../../frontend/common/sortingfunctions/onhandsorting.mjs'
import { getImgLink } from '../../../utils/schemavirtuals/collectionvirtuals.js'

export default async function updateCollectionSingleValue(req, res) { 
    const {id} = req.params
    const {collectionChanges={}, onhandChanges={}, onhandColIDs} = req.body
    
    const collection = await Collection.findById(id)

    if (Object.keys(collectionChanges).length !== 0) {
        listChangesController(collection, collectionChanges)
        //badge milestone
        const user = await User.findById(collection.owner).populate({path: 'collections', select: 'ownedPokemon linkedTo'})
        const colProg = getCollectionProgressPercent(user.collections.filter(c => c._id.toString() === collection._id.toString())[0]) 
        const otherColProgs = user.collections.map(col => {return {_id: col._id, progress: getCollectionProgressPercent(col)}}).filter(col => col._id.toString() !== collection._id.toString()).map(col => col.progress)
        const badgeChange = checkBadgeMilestone(colProg, user.settings.profile.badges, otherColProgs)
        if (badgeChange !== 'no-change') {
            user.settings.profile.badges = badgeChange
            user.save()
        }
        collection.markModified('ownedPokemon')
        await collection.save()
    } 
    if (Object.keys(onhandChanges).length !== 0) {
        const mainOnhandEdit = onhandColIDs.includes(id)
        const otherOnhandsToEdit = !(mainOnhandEdit && onhandColIDs.length === 1) //in linked collections
        if (mainOnhandEdit) {
            collection.onHand = onhandSingleValueUpdates(onhandChanges[collection._id], collection.onHand)
            if (collection.options.sorting.onhand.reorder) {
                collection.onHand = sortOnHandList(collection.options.sorting.onhand.sortFirstBy, collection.options.sorting.onhand.default, collection.options.sorting.onhand.ballOrder, collection.onHand)
            }
            collection.markModified('onHand')
            await collection.save()
        } 
        if (otherOnhandsToEdit) {
            const otherOnhandCols = Object.keys(onhandChanges).filter(id => id !== collection._id)
            const collections = await Collection.find({_id: {$in: otherOnhandCols}})
            collections.forEach(c => {
                c.onHand = onhandSingleValueUpdates(onhandChanges[c._id], c.onHand)
                if (c.options.sorting.onhand.reorder) {
                    c.onHand = sortOnHandList(c.options.sorting.onhand.sortFirstBy, c.options.sorting.onhand.default, c.options.sorting.onhand.ballOrder, c.onHand)
                }
                c.markModified('onHand')
                c.save()
            })
        }
    }

    // if (linkedID) {
    //     const onhandSetModifier = {$set: {onHand: newOnhand}} //if there is a linkedID it means the onhand is being changed.
    //     const editOwnedPokemonToo = newOwnedPokemonArr !== undefined
    //     await Collection.findOneAndUpdate({
    //         _id: linkedID
    //         }, onhandSetModifier
    //     )
    //     if (editOwnedPokemonToo) {
    //         await Collection.findOneAndUpdate({
    //             _id: id
    //             }, {$set: {ownedPokemon: newOwnedPokemonArr}}
    //         )
    //     }
    // } else {
    //     const setModifier = newOnhand === undefined ? {$set: {ownedPokemon: newOwnedPokemonArr}} : 
    //         newOwnedPokemonArr === undefined ? {$set: {onHand: newOnhand}} : {$set: {ownedPokemon: newOwnedPokemonArr, onHand: newOnhand}}
        
    //     await Collection.findOneAndUpdate({
    //         _id: id
    //         }, setModifier
    //     )
    // }
    res.end()
}

export const listChangesController = async(collection, collectionChanges) => {
    collection.ownedPokemon = collection.ownedPokemon.map(p => {
        const imgLink = getImgLink(p)
        const hasChanges = collectionChanges[imgLink] !== undefined
        if (hasChanges) {
            Object.keys(collectionChanges[imgLink]).forEach(updatedBall => {
                if (updatedBall !== 'default') {
                    Object.keys(collectionChanges[imgLink][updatedBall]).forEach(updatedField => {
                        const updatedFieldData = collectionChanges[imgLink][updatedBall][updatedField]
                        if (typeof updatedFieldData === 'object') {
                            //indicates its {orig: *value*, prev: *value*, curr: *value*}
                            const specialFields = (updatedField.includes('EMs') && !(updatedField === 'EMs')) ||  (updatedField.includes('EmCount') && !(updatedField === 'emCount'))
                            const tagField = updatedField === 'tag'
                            //^^^^ indicates its an EM field for home collections (bdspEMs, svEMs, swshEMs, bdspEmCount, swshEmCount, etc...)
                            if (specialFields) {
                                const isEmCount = updatedField.includes('EmCount')
                                const trueField = isEmCount ? 'emCount' : 'EMs'
                                const emGen = homeGenNumConversion[updatedField.slice(0, updatedField.indexOf(isEmCount ? 'EmCount' : 'EMs'))]
                                p.balls[updatedBall].eggMoveData[emGen][trueField] = updatedFieldData.curr
                            } else if (tagField) {
                                if (updatedFieldData.orig !== 'none') {
                                    p.balls[updatedBall][updatedFieldData.orig] = undefined
                                } 
                                if (updatedFieldData.curr !== 'none') {
                                    p.balls[updatedBall][updatedFieldData.curr] = true
                                }
                            } else {
                                p.balls[updatedBall][updatedField] = updatedFieldData.curr
                            }
                        } else {
                            p.balls[updatedBall][updatedField] = updatedFieldData
                        }
                    }) 
                } else {
                    if (collectionChanges[imgLink].default.curr === 'none') {
                        delete p.balls[collectionChanges[imgLink].default.orig].default
                    } else {
                        if (collectionChanges[imgLink].default.orig !== 'none') {
                            delete p.balls[collectionChanges[imgLink].default.orig].default
                        }
                        p.balls[collectionChanges[imgLink].default.curr].default = true
                    }
                }
            }) 
        }
        return p
    })
}

//old ver which updated collection on EVERY value change
// export default async function updateCollectionSingleValue(req, res) {
//     const changedField = Object.keys(req.body)[2]
//     const newValueOfChangedField = Object.values(req.body)[2]
//     const {pokename, ballname, idOfPokemon, onhandPokemon, otherFieldsData} = req.body //idofpokemon is only for onhand pokemon
//     const {id} = req.params

//     if (onhandPokemon === true) {
//         const setModifier = { $set: {
//             [`onHand.$.${changedField}`]: newValueOfChangedField
//         }}
//         await Collection.updateOne({
//             _id: id,
//             'onHand._id': idOfPokemon
//             }, setModifier
//         )
//     } else {
//         if (changedField === 'isOwned' && newValueOfChangedField === true) {
//             const setDefaults = otherFieldsData !== undefined
//             const otherSetModifiers = {}
//             if (setDefaults) {
//                 const fieldsChanged = Object.keys(otherFieldsData)
//                 for (let field of fieldsChanged) {
//                     otherSetModifiers[`ownedPokemon.$.balls.${ballname}.${field}`] = otherFieldsData[field]
//                 }
//             }
//             const setModifier = { $set: {
//                 [`ownedPokemon.$.balls.${ballname}.${changedField}`]: newValueOfChangedField,
//                 ...otherSetModifiers
//             }, $unset: {
//                 [`ownedPokemon.$.balls.${ballname}.highlyWanted`]: "",
//                 [`ownedPokemon.$.balls.${ballname}.pending`]: ""
//             }}

//             await Collection.findOneAndUpdate({
//                 _id: id, 
//                 "ownedPokemon.name": pokename
//                 }, setModifier, 
//             )
//         } else {
//             const setOtherEmField = otherFieldsData !== undefined && (changedField === 'emCount' || changedField === 'EMs')
//             const otherSetModifier = {}
//             if (setOtherEmField) {
//                 const otherField = changedField === 'emCount' ? 'EMs' : 'emCount'
//                 otherSetModifier[`ownedPokemon.$.balls.${ballname}.${otherField}`] = otherFieldsData[otherField]
//             }
//             const setModifier = { $set: {
//                 [`ownedPokemon.$.balls.${ballname}.${changedField}`]: newValueOfChangedField,
//                 ...otherSetModifier
//             }}

//             await Collection.updateOne({
//                 _id: id, 
//                 "ownedPokemon.name": pokename
//                 }, setModifier
//             )
//         }
//     }
//     res.end()
// }