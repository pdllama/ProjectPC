import { sortList } from '../../../common/sortingfunctions/customsorting.mjs'
import { sortOnHandList } from '../../../common/sortingfunctions/onhandsorting.mjs'
import Collection from '../../../models/collections.js'

export default async function optionsEdit(req, res) {
    //update this route so it sorts the list on its own
    const {id} = req.params
    const {optionType, listType, data, newRates, newPreferences, lfItems, ftItems, name, globalDefault, ballScope} = req.body
    if (optionType === 'sort') {
        const collection = await Collection.findById(id)
        collection.options.sorting[listType] = data
        if (data.reorder) {
            if (listType === 'collection') {
                collection.ownedPokemon = sortList(data.default, collection.ownedPokemon)
                collection.markModified('ownedPokemon')
            } else {
                collection.onHand = sortOnHandList(data.sortFirstBy, data.default, data.ballOrder, collection.onHand)
                collection.markModified('onHand')
            }
        }
        collection.markModified('options')
        await collection.save()
        res.end()
    } else if (optionType === 'rates') {
        await Collection.updateOne({_id: id}, { $set: {'options.tradePreferences.rates': newRates} })
        res.end()
    } else if (optionType === 'preferences') {
        await Collection.updateOne({_id: id}, { $set: {'options.tradePreferences': newPreferences} })
        res.end()
    } else if (optionType === 'items') {
        await Collection.updateOne({_id: id}, { $set: {'options.tradePreferences.lfItems': lfItems, 'options.tradePreferences.ftItems': ftItems} })
        res.end()
    } else if (optionType === 'name') {
        const otherSetModifier = globalDefault !== undefined ? { $set: {'options.globalDefaults': globalDefault} } : {}
        await Collection.updateOne({_id: id}, { $set: {'name': name}, ...otherSetModifier })
        res.end()
    } else if (optionType === 'globalDefault') {
        await Collection.updateOne({_id: id}, { $set: {'options.globalDefaults': globalDefault} })
    }
    else if (optionType === 'collectingBalls') {
        await Collection.updateOne({_id: id}, { $set: {'options.collectingBalls': ballScope} })
    }
}