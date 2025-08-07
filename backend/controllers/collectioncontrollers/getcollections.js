import Collection from "../../models/collections.js";
import mongoose from "mongoose";
import { getPokemonGroups } from "../../utils/pokemongroups/getpokemongroups.js";
import { collectionSubTypes } from "../../common/infoconstants/miscconstants.mjs";
import { getAvailableHomeGames } from "../../utils/schemavirtuals/collectionvirtuals.js";
import { linkedAsSingleTotalAggregate } from "../aggregations/linkedcollectionsaggs.js";
import { transformToFullSheet } from "./editcollectioncontrollers.js/functions/transformlists.js";
import applyVirtuals from "./utils/applyvirtuals.js";
import applyTopLevelVirtuals from "./utils/applytoplevelvirtuals.js";

export async function getCollectionController(req, res) {
    if (req.query.getLinkedAsSingle || req.query.isTradePage) {
        if (req.query.isTradePage) { //if its the page where you offer a trade for the first time. frontend: /collections/{colId}/trade
            //unfortunately theres no way to check if its a central collection or not from here
            const collection = await Collection.findById(req.params.id).populate('owner')
            if (collection.linkedTo) {
                const mainCollection = await Collection.findById(collection.linkedTo.super.toString())
                collection.ownedPokemon = transformToFullSheet(collection.ownedPokemon, mainCollection.ownedPokemon, collection.gen)
                res.json(collection)
            } else {
                res.json(collection)
            }
        } else if (req.query.isCentral === 'true') {
            const collection = await Collection.findById(req.params.id).populate('owner')
            res.json(collection)
        } else {
            const collection = await Collection.aggregate([...linkedAsSingleTotalAggregate(new mongoose.Types.ObjectId(req.params.id))])
            collection[0].ownedPokemon = applyVirtuals(collection[0].ownedPokemon, collection[0].gen, 'collection')
            collection[0].onHand = applyVirtuals(collection[0].onHand, collection[0].gen, 'onhand')
            // let topLevelVPath = collection[0].gen === 'home' ? collection[0].availableGamesInfo : collection[0].eggMoveInfo
            // topLevelVPath = applyTopLevelVirtuals(collection[0])
            if (collection[0].gen === 'home') {
                collection[0].availableGamesInfo = applyTopLevelVirtuals(collection[0])
            } else {
                collection[0].eggMoveInfo = applyTopLevelVirtuals(collection[0])
            }
            res.json(collection[0])
        }
    } else {
        const collection = await Collection.find({$or: [{'linkedTo.super': new mongoose.Types.ObjectId(req.params.id)}, {_id: req.params.id}]}).populate({path: 'owner'})
        if (collection.length === 0) {
            const exception = new Error()
            exception.name = 'Not Found'
            exception.message = `Could not find a collection with this ID!`
            exception.status = 404
            return res.status(404).send(exception)
        } else if (collection.length === 1) {
            if (collection[0].linkedTo) {
                const exception = new Error()
                exception.name = 'Bad Request'
                exception.message = `Could not access the collection`
                exception.status = 400
                return res.status(400).send(exception)
            } else {
                res.json(collection[0])
            }
        } else {
            const central = collection.filter(c => c._id.toString() === req.params.id.toString())[0]
            const {col} = req.query
            if (central.isDummyCollection && !col) {
                const exception = new Error()
                exception.name = 'Not Found'
                exception.message = `Could not find a collection with this ID!`
                exception.status = 404
                return res.status(404).send(exception)
            } else if (col && !collection.some(c => c._id.toString() === col)) {
                const exception = new Error()
                exception.name = 'Not Found'
                exception.message = `Could not find a collection with this ID!`
                exception.status = 404
                return res.status(404).send(exception)
            } else {
                const newObj = {...central, linkedCollections: collection.filter(c => c._id.toString() !== req.params.id.toString())}
                res.json({...newObj._doc, availableGamesInfo: getAvailableHomeGames(central.ownedPokemon), linkedCollections: newObj.linkedCollections})
            }
        }
    }
    
}

export async function retrievePokemonGroups(req, res) {
    const {gen} = req.query
    if (!collectionSubTypes.aprimon.value.includes(isNaN(parseInt(gen)) ? gen : parseInt(gen))) {
        const exception = new Error()
        exception.name = 'Bad Request'
        exception.message = `Invalid aprimon collection gen!`
        exception.status = 400
        return res.status(400).send(exception)
    }
    const pokemonGroups = getPokemonGroups(gen)
    res.json(pokemonGroups)
}