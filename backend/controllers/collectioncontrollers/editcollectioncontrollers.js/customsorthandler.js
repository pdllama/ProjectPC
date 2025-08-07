import Collection from '../../../models/collections.js'

export default async function customSortHandler(req, res) {
    const {id} = req.params
    const {sortingOrder} = req.body
    //sortingOrder comes out as an object with [pokemonName]: [newIdx]. ex {'Charmander': 1, 'Burmy (Any)': 212}
    const collection = await Collection.findById(id)
    const newCollectionList = collection.ownedPokemon.sort((a, b) => {
        const aSortOrder = sortingOrder[a.name]
        const bSortOrder = sortingOrder[b.name]
        return aSortOrder > bSortOrder ? 1 : -1
    })
    collection.ownedPokemon = newCollectionList

    collection.markModified('ownedPokemon')
    await collection.save()
    
    res.end()
}