import Collection from '../models/collections.js'
import User from '../models/users.js'
import { linkedAsSingleSearchAggregate } from './aggregations/linkedcollectionsaggs.js'
import collectionProgressAggField from './aggregations/collectionprogressagg.js'

export default async function searchDatabases(req, res) {
    const {searchType} = req.params
    const {query, skip} = req.query
    const emptyQuery = query === ''
    const maxDocs = searchType === 'all' ? 5 : 10
    const searchCollections = searchType === 'all' || searchType === 'collections'
    const searchUsers = searchType === 'all' || searchType === 'users'
    const regex = new RegExp(query, 'i')
    const searchQueries = {
        collections: emptyQuery ? {} : {$or: [{name: regex}, {'owner.username': regex}, {type: regex}, {gen: regex}], gen: {$not: {$eq: 'dummy'}}},
        users: emptyQuery ? {} : {username: regex}
    }

    const queryCollectionAggregate = [
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner'
            }
        },
        {$match: searchQueries.collections}
    ]

    const collectionCountAggregate = [
        ...queryCollectionAggregate,
        {$count: "totalCollections"}
    ]

    const collectionAggregate = [
        ...queryCollectionAggregate,
        {$skip: skip === undefined ? 0 : parseInt(skip)},
        {$limit: maxDocs},
        ...linkedAsSingleSearchAggregate(),
        collectionProgressAggField,
        {$project: {_id: true, name: true, 'owner.username': true, type: true, gen: true, progress: true, linkedTo: true, isLinked: true}}
    ]
    // const searchOperations = {
    //     collections: searchCollections ? Collection.aggregate(collectionAggregate).exec : [],
    //     users: searchUsers ? User.find(searchQueries.users, '_id username').lean().populate({path: 'collections'}).exec : []
    // }

    const collectionCountStep1 = searchCollections ? await Collection.aggregate(collectionCountAggregate, {maxTimeMS: 750}) : 0
    try {
        const searchResult = {
            collections: searchCollections ? await Collection.aggregate(collectionAggregate).exec() : [],
            users: searchUsers ? await User.find(searchQueries.users, '_id username settings.profile.badges accountType').skip(skip === undefined ? 0 : skip).limit(maxDocs).lean().populate({path: 'collections', select: 'type -_id -owner'}).exec() : [],
            collectionCount: (collectionCountStep1[0] === undefined || collectionCountStep1 === 0) ? 0 : collectionCountStep1[0].totalCollections,
            userCount: searchUsers ? await User.countDocuments(searchQueries.users, {maxTimeMS: 750}) : 0,
        }

        res.json(searchResult) 
    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
    
}