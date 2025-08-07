import User from '../../models/users.js'
import Trade from '../../models/trades.js'
import { transformToFullSheet } from '../collectioncontrollers/editcollectioncontrollers.js/functions/transformlists.js'

//was going to set something up here for linked collections, but i decided to just do it through a map operation.
// const userCollectionProgressAggregation = (id) => [
//     {$match: {_id: id}},
//     {$lookup: {
//         from: 'collections',
//         localField: '_id',
//         foreignField: 'owner',
//         as: 'collections'
//     }},
//     {$addFields: {
//         collections: {$map: {
//             input: '$collections',
//             as: 'c',
//             in: {

//             }
//         }}
//     }}
// ]
export async function getUser(req, res) {
    const userRegex = `^${req.params.username}$`
    const user = await User.findOne({username: {$regex: new RegExp(userRegex, 'i')}}).populate({path: 'collections'})
    if (user === null) {
        const exception = new Error()
        exception.name = 'Not Found'
        exception.message = "Could not find a user with this username!"
        exception.status = 404
        return res.status(404).send(exception)
    }
    user.collections = user.collections.map(c => {
        if (c.linkedTo) {
            c.ownedPokemon = transformToFullSheet(c.ownedPokemon, user.collections.filter(c2 => c2._id.toString() === c.linkedTo.super.toString())[0].ownedPokemon, c.gen)
        }
        return c
    }).filter(c => c.gen !== 'dummy')
    res.json(user)
}

export async function getUserTrades(req, res) {
    const userRegex = `^${req.params.username}$`
    const user = await User.findOne({username: {$regex: new RegExp(userRegex, 'i')}})
    const allTheirTrades = await Trade.find({'users': {$in: [user._id]}}).select('-history').populate({path: 'users', select: 'username'}).then(data => {
        return data.map((trade) => {
            if (trade.users.length === 1) { 
                //very bandaid solution to reacting to deleted users. populate doesnt return null for userIds they cant find, so im
                //just setting it myself.
                const userPos = trade.deletedCollection['1'] === true ? 0 : 1
                if (userPos === 0) {
                    const newTradeUsers = [trade.users[0], null]
                    return {...trade, users: newTradeUsers}
                } else {
                    const newTradeUsers = [null, trade.users[0]]
                    return {...trade, users: newTradeUsers}
                }
            }
            return trade
        })
    })

    const trueAllTrades = allTheirTrades.map((trade) => {
        //very strange thing happens when the data comes out of the query after the .then(). this just fixes it. dont ask me why it happens.
        return {...trade._doc, users: trade.users}
    }).filter(trade => {
        const userPos = trade.users.includes(null) ? 
            (trade.users.indexOf(null) === 0 ? 
            trade.users[1] === null ? 1 : trade.users[1].username !== user.username ? 0 : 1 : 
            trade.users[0] === null ? 0 : trade.users[0].username !== user.username ? 1 : 0) : 
            trade.users.map(userData => userData.username).indexOf(user.username)
        const userDeletedCol = !trade.deletedCollection === undefined && trade.deletedCollection[`${userPos}`] 
        return !userDeletedCol
    })

    res.json({user: user, trades: trueAllTrades})
}