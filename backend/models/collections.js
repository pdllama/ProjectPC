import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import {getImgLink, getPossibleEggMoves, getPossibleGender, getCollectionProgress, getAvailableHomeGames, getHomeGamesPossibleEggMoves} from './../utils/schemavirtuals/collectionvirtuals.js'
import Trade from './trades.js'
import User from './users.js'
import { setPendingTrade } from '../controllers/tradecontrollers/colmanagementfuncs.js';
import { getCollectionProgressPercent, checkBadgeMilestone, handleLinkedCollectionDelete } from './postpremiddleware.js';
import { postDeleteColEditTradeCol } from './postpremiddleware.js';
import getHAName from '../utils/schemavirtuals/getHAName.js';
import { transformToFullSheet } from '../controllers/collectioncontrollers/editcollectioncontrollers.js/functions/transformlists.js';

import optionsSchema from './collectionsubschemas/optionsschema.js';
import ballDataSchema from './collectionsubschemas/balldataschema.js';

const opts = {toJSON: {virtuals: true}, minimize: false}

const collectionSchema = new Schema ({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {type: String, enum: {values: ['aprimon']}},
    name: {
        type: String,
        required: true
    },
    gen: {
        type: String,
        required: true
    }, 
    isDummyCollection: {type: Boolean},
    options: optionsSchema,
    linkedTo: {
        _id: false,
        type: Object,
        default: undefined,
        super: {
            type: Schema.Types.ObjectId,
            ref: "Collection"
        },
        dummyCollection: {type: Boolean}
    },
    ownedPokemon: [{
        _id: false,
        name: String,
        displayName: String,
        natDexNum: Number,
        gen: Number,
        disabled: Boolean,
        disabledBalls: {type: Array, default: undefined}, //used if its a sub-linked list.
        balls: {
            _id: false,
            type: Object,
            fast: ballDataSchema,
            friend: ballDataSchema,
            heavy: ballDataSchema,
            level: ballDataSchema,
            love: ballDataSchema,
            lure: ballDataSchema,
            moon: ballDataSchema,
            beast: ballDataSchema,
            dream: ballDataSchema,
            safari: ballDataSchema,
            sport: ballDataSchema
        }
    }],
    onHand: [{
        name: String,
        natDexNum: Number,
        ball: String,
        gender: String,
        isHA: Boolean,
        emCount: Number,
        emGen: String,
        EMs: {type: Array, default: undefined},
        reserved: Number,
        qty: Number
    }]
}, opts)

collectionSchema.path('ownedPokemon').schema.virtual('imgLink').get(function() {
    return getImgLink(this)
})

collectionSchema.path('ownedPokemon').schema.virtual('haName').get(function() {
    return getHAName(this, this.parent().gen)
})

collectionSchema.path('ownedPokemon').schema.virtual('possibleGender').get(function() {
    return getPossibleGender(this)
})

collectionSchema.path('onHand').schema.virtual('imgLink').get(function() {
    return getImgLink(this)
})

collectionSchema.path('onHand').schema.virtual('haName').get(function() {
    return getHAName(this, this.parent().gen)
})

collectionSchema.virtual('availableGamesInfo').get(function() {
    if (this.gen === 'home' || this.gen === 'dummy') {
        return getAvailableHomeGames(this.ownedPokemon)
    } else {
        null
    }
})

collectionSchema.virtual('progress').get(function() {
    return getCollectionProgressPercent(this)
})

collectionSchema.virtual('eggMoveInfo').get(function() {
    if (this.gen === 'home') {
        null
    } else {
        return getPossibleEggMoves(this.ownedPokemon, this.gen)
    }
})

collectionSchema.path('ownedPokemon').schema.virtual('possibleEggMoves').get(function() {
    if (this.parent().gen === 'home' || this.parent().gen === 'dummy') {
        return getHomeGamesPossibleEggMoves(this)
    } else {
        null
    }
})

collectionSchema.post('findOneAndUpdate', async function(doc) {
    //logic for badges here. doc is the collection.
    if (doc) {
        const user = await User.findById(doc.owner).populate({path: 'collections', select: 'ownedPokemon linkedTo'})
        const colProg = getCollectionProgressPercent(user.collections.filter(c => c._id.toString() === doc._id.toString())[0]) 
        const otherColProgs = user.collections.map(col => {return {_id: col._id, progress: getCollectionProgressPercent(col)}}).filter(col => col._id.toString() !== doc._id.toString()).map(col => col.progress)
        const badgeChange = checkBadgeMilestone(colProg, user.settings.profile.badges, otherColProgs)
        if (badgeChange === 'no-change') {return}
        else {
            user.settings.profile.badges = badgeChange
            user.save()
        }
    }
})

collectionSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        const tradesThisUserMade = await Trade.find({users: {$in: doc.owner}})
        const userInfo = await User.findById(doc.owner.toString())
        const tradesWithThisCollection = tradesThisUserMade.filter(async trade => {
            const userPos = trade.users.map(user => user.toString()).indexOf(doc.owner.toString())
            const gen = trade.gen.includes('-') ? (userPos === 0 ? trade.gen.slice(0, trade.gen.indexOf('-')) : trade.gen.slice(trade.gen.indexOf('-')+1, trade.gen.length)) : trade.gen
            const editThisDoc = doc.gen === gen && !trade.deletedCollection[userPos]
            if (editThisDoc) {
                const editTradeStatus = (trade.status !== 'rejected' && trade.status !== 'completed')
                if (editTradeStatus) {
                    const latestOffer = trade.history[trade.history.length-1]
                    const editOtherCollection = trade.status === 'pending' || 
                        ((trade.status === 'initialoffer' || trade.status === 'counteroffer') && 
                            latestOffer.offerer !== userInfo.username && 
                            latestOffer.trade.offer.pokemon.map(p => p.balls.filter(ballData => ballData.onhandId !== undefined).includes(true)).includes(true)
                        )
                    if (editOtherCollection) {
                        postDeleteColEditTradeCol(trade, userPos)
                    }
                    trade.status = 'cancelled'
                    trade.closeDate = Date.now()
                }
                trade.deletedCollection = {...trade.deletedCollection, [userPos]: true}
            }
            return editThisDoc
        })
        tradesWithThisCollection.forEach(trade => {
            trade.save()
        })

        await handleLinkedCollectionDelete(doc)
    }
})

collectionSchema.set('toJSON', {virtuals: true})

export default mongoose.model('Collection', collectionSchema)