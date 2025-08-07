import Trade from '../../models/trades.js'
import Collection from '../../models/collections.js'
import User from '../../models/users.js'
import { setOnHandReserved, removeOnHandReserved, getOnhandIdsToReserve, generateTradeCompleteBallInfo } from './collectioneditposttraderes.js'
import { setPendingTrade } from './colmanagementfuncs.js'
import { getCollectionProgressPercent, checkBadgeMilestone, checkTradeBadgeMilestone } from '../../models/postpremiddleware.js'

export async function respondToTrade(req, res) {
    const {response, otherUserId, offerColId, receivingColId, counterOfferData, username, offerSuperColId, receivingSuperColId} = req.body
    const {id} = req.params

    //superColIds only show for three responses:
    // 1. accept trade offer
    // 2. cancel trade
    // 3. mark trade as complete (final)
    //its the only cases its required, anyway, since its the only spots you change ownedPokemon

    const trade = await Trade.findById(id)
    if (trade === null) {
        const exception = new Error()
        exception.name = 'Not Found'
        exception.message = `Could not find a trade with this ID!`
        exception.status = 404
        return res.status(404).send(exception)
    }
    const latestOffer = trade.history[trade.history.length-1]
    const offerIsSubCol = offerSuperColId !== undefined
    const receivingIsSubCol = receivingSuperColId !== undefined

    if (response === 'accept') {
        trade.status = 'pending'
        trade.history[trade.history.length-1].status = 'accepted'
        trade.markedCompleteBy = ''
        trade.save()

        const offerCol = await Collection.findById(offerIsSubCol ? offerSuperColId : offerColId) //we just need the collection with ownedPokemon
        const receivingCol = await Collection.findById(receivingColId) //we need both here
        const receivingSuperCol = receivingIsSubCol ? await Collection.findById(receivingSuperColId) : undefined
        if (latestOffer.trade.offer.pokemon !== undefined) {
            const trueReceivingCol = receivingIsSubCol ? receivingSuperCol : receivingCol
            trueReceivingCol.ownedPokemon = trueReceivingCol.ownedPokemon.map(p => { //setting offered pokemon as pending
                if (!receivingIsSubCol && p.disabled) {return p}
                const pBeingReceivedData = latestOffer.trade.offer.pokemon.filter(tradeP => (tradeP.name === p.name || tradeP.for === p.name))[0]
                if (pBeingReceivedData === undefined) {return p} //no balls of that pokemon are being received.
                const newBallData = {}
                Object.keys(p.balls).forEach(ball => {
                    const ballData = p.balls[ball]
                    if (!receivingIsSubCol && ballData.disabled) {newBallData[ball] = ballData}
                    else {
                        const isBeingReceived = pBeingReceivedData.balls.filter(tradePBallData => tradePBallData.ball === ball).length !== 0
                        if (!isBeingReceived) {newBallData[ball] = ballData}
                        else {
                            const newSpecificBallData = ballData.isOwned ? ballData : {...ballData, pending: true}
                            if (newSpecificBallData.highlyWanted) {
                                delete newSpecificBallData.highlyWanted
                            }
                            newBallData[ball] = newSpecificBallData
                        }
                    }
                })
                return {...p, balls: newBallData}
            })
        }
        if (latestOffer.trade.receiving.pokemon !== undefined) {
            offerCol.ownedPokemon = offerCol.ownedPokemon.map(p => { //setting received pokemon as pending
                if (!offerIsSubCol && p.disabled) {return p}
                const pBeingReceivedData = latestOffer.trade.receiving.pokemon.filter(tradeP => (tradeP.name === p.name || tradeP.for === p.name))[0]
                if (pBeingReceivedData === undefined) {return p}
                const newBallData = {}
                Object.keys(p.balls).forEach(ball => {
                    const ballData = p.balls[ball]
                    if (!offerIsSubCol && ballData.disabled) {newBallData[ball] = ballData}
                    else {
                        const isBeingReceived = pBeingReceivedData.balls.filter(tradePBallData => tradePBallData.ball === ball).length !== 0
                        if (!isBeingReceived) {newBallData[ball] = ballData}
                        else {
                            const newSpecificBallData = ballData.isOwned ? ballData : {...ballData, pending: true}
                            if (newSpecificBallData.highlyWanted) {
                                delete newSpecificBallData.highlyWanted
                            }
                            newBallData[ball] = newSpecificBallData
                        }
                    }
                })
                return {...p, balls: newBallData}
            })
            //reserving onhand if offering an onhand. only doing it on receiving side since offering side would have had it reserved after creating the offer
            receivingCol.onHand = receivingCol.onHand.map(p => { 
                const offeringPokemon = latestOffer.trade.receiving.pokemon.filter(tradeP => tradeP.balls.filter(tradePBallData => tradePBallData.onhandId !== undefined && tradePBallData.onhandId.toString() === p._id.toString()).length !== 0).length !== 0
                if (offeringPokemon) {
                    if (p.reserved === undefined) {
                        p.reserved = 1
                    } else {
                        if (p.reserved < p.qty) {
                            p.reserved += 1
                        } 
                    }
                }
                return p
            }).filter(p => p !== undefined)
        
        }
        offerCol.save()
        receivingCol.save()
        if (receivingIsSubCol) {
            receivingSuperCol.save()
        }

        const otherUser = await User.findById(otherUserId)
        otherUser.notifications.push({type: 'trade-offer: accept', tradeData: {otherParticipant: username, tradeGen: trade.gen, tradeId: trade._id}, unread: true})
        if (otherUser.notifications.length > 40) {
            otherUser.notifications.shift()
        }
        otherUser.save()

    } else if (response === 'reject') {
        trade.status = 'rejected'
        latestOffer.status = 'rejected'
        trade.closeDate = Date.now()
        trade.save()

        const latestOfferCol = await Collection.findById(offerColId)
        const previouslyReservedOnHandIds = getOnhandIdsToReserve(latestOffer.trade.offer.pokemon)
        if (previouslyReservedOnHandIds.length !== 0) {
            latestOfferCol.onHand = removeOnHandReserved(latestOfferCol.onHand, previouslyReservedOnHandIds)
        }
        await latestOfferCol.save()

        const otherUser = await User.findById(otherUserId)
        otherUser.notifications.push({type: 'trade-offer: reject', tradeData: {otherParticipant: username, tradeGen: trade.gen, tradeId: trade._id}, unread: true})
        if (otherUser.notifications.length > 40) {
            otherUser.notifications.shift()
        }
        otherUser.save()
    } else if (response === 'counter') {
        trade.status = 'counteroffer'
        latestOffer.status = 'countered'
        trade.history.push({...counterOfferData})
        trade.save()

        const prevOffer = trade.history[trade.history.length-2]
        const offerCol = await Collection.findById(offerColId)
        const receivingCol = await Collection.findById(receivingColId)

        const previouslyReservedOnHandIds = getOnhandIdsToReserve(prevOffer.trade.offer.pokemon)
        if (previouslyReservedOnHandIds.length !== 0) {
            receivingCol.onHand = removeOnHandReserved(receivingCol.onHand, previouslyReservedOnHandIds)
        }
        if (counterOfferData.trade.offer.pokemon !== undefined) {
            const reservedOhIds = getOnhandIdsToReserve(counterOfferData.trade.offer.pokemon)
            offerCol.onHand = setOnHandReserved(offerCol.onHand, reservedOhIds)
        }
        await offerCol.save()
        await receivingCol.save()

        const otherUser = await User.findById(otherUserId)
        otherUser.notifications.push({type: 'trade-offer: counter', tradeData: {otherParticipant: username, tradeGen: trade.gen, tradeId: trade._id}, unread: true})
        if (otherUser.notifications.length > 40) {
            otherUser.notifications.shift()
        }
        otherUser.save()
    } else if (response === 'cancel') { 
        trade.status = 'cancelled'
        trade.closeDate = Date.now()
        trade.save()

        const latestOffer = trade.history[trade.history.length-1]
        const offerCol = await Collection.findById(offerColId)
        const receivingCol = await Collection.findById(receivingColId)
        
        if (latestOffer.status === 'accepted') {
            const {newOfferColOp, newReceivingColOp, newOfferColOnhand, newReceivingColOnhand} = setPendingTrade(offerCol, receivingCol, latestOffer, true, offerIsSubCol, receivingIsSubCol)
            offerCol.ownedPokemon = newOfferColOp
            offerCol.onHand = newOfferColOnhand
            receivingCol.ownedPokemon = newReceivingColOp
            receivingCol.onHand = newReceivingColOnhand
            await offerCol.save()
            await receivingCol.save()
        } else {
            const previouslyReservedOnHandIds = getOnhandIdsToReserve(latestOffer.trade.offer.pokemon)
            if (previouslyReservedOnHandIds.length !== 0) {
                offerCol.onHand = removeOnHandReserved(offerCol.onHand, previouslyReservedOnHandIds)
            }
            await offerCol.save()
        }

        const otherUser = await User.findById(otherUserId)
        otherUser.notifications.push({type: 'trade-offer: cancel', tradeData: {otherParticipant: username, tradeGen: trade.gen, tradeId: trade._id}, unread: true})
        if (otherUser.notifications.length > 40) {
            otherUser.notifications.shift()
        }
        otherUser.save()

    } else if (response === 'markAsComplete') {
        if (trade.markedCompleteBy === username) {
            trade.markedCompleteBy = ''
            trade.save()
        } else if (trade.markedCompleteBy === '') {
            trade.markedCompleteBy = username
            trade.save()
        } else {
            trade.markedCompleteBy = 'both',
            trade.status = 'completed'
            trade.closeDate = Date.now()
            trade.save()

            const offerCol = await Collection.findById(offerColId)
            const receivingCol = await Collection.findById(receivingColId)
            const offerColSuperCol = offerIsSubCol ? await Collection.findById(offerSuperColId) : undefined
            const receivingSuperCol = receivingIsSubCol ? await Collection.findById(receivingSuperColId) : undefined

            if (latestOffer.trade.receiving.pokemon !== undefined) {
                const listOfferCol = offerIsSubCol ? offerColSuperCol : offerCol
                listOfferCol.ownedPokemon = listOfferCol.ownedPokemon.map((poke) => {
                    if (!offerIsSubCol && poke.disabled) {return poke}
                    const pBeingReceivedData = latestOffer.trade.receiving.pokemon.filter(p => (p.for === poke.name || p.name === poke.name))[0]
                    if (pBeingReceivedData === undefined) {return poke}
                    const newBallData = {}
                    Object.keys(poke.balls).forEach(ball => {
                        const ballData = poke.balls[ball]
                        if (!offerIsSubCol && ballData.disabled) {newBallData[ball] = ballData}
                        else {
                            const ballComboTradeData = pBeingReceivedData.balls.filter(bD => bD.ball === ball)[0]
                            const ballComboBeingReceived = ballComboTradeData !== undefined 
                            // && ballData.isOwned === false
                            
                            if (ballComboBeingReceived) {
                                newBallData[ball] = generateTradeCompleteBallInfo(ballComboTradeData, ballData, offerCol.gen, receivingCol.gen, offerIsSubCol)
                                // const haData = ballTradeData.isHA !== undefined ? {isHA: ballTradeData.isHA} : {}
                                // const emData = ballTradeData.emCount !== undefined && !(offerCol.gen === 'home' || offerIsSubCol) ? {emCount: ballTradeData.emCount, EMs: ballTradeData.EMs} : {}
                                // const defaultData = ballData.default !== undefined ? {default: ballData.default} : {}

                                // newBallData[ball] = {
                                //     isOwned: true,
                                //     ...haData,
                                //     ...emData,
                                //     ...defaultData
                                // }
                            }
                            else {newBallData[ball] = ballData}
                        }
                    }) 
                    return {...poke, balls: newBallData}
                })
                if (latestOffer.trade.offer.pokemon !== undefined) {
                    offerCol.onHand = offerCol.onHand.map((poke) => {
                        const wasOffered = latestOffer.trade.offer.pokemon.filter(pData => pData.balls.filter(pBallData => pBallData.onhandId !== undefined && pBallData.onhandId.toString() === poke._id.toString()).length !== 0).length !== 0
                        if (wasOffered) {
                            if (poke.qty === 1) {
                                return undefined
                            }
                            else {
                                poke.qty -= 1
                                if (poke.reserved === 1) {
                                    poke.reserved = undefined
                                } else {
                                    poke.reserved -= 1
                                }
                            }
                        }
                        return poke
                    }).filter(p => p !== undefined)
                }
                
            }
            if (latestOffer.trade.offer.pokemon !== undefined) {
                const listReceivingCol = receivingIsSubCol ? receivingSuperCol : receivingCol
                listReceivingCol.ownedPokemon = listReceivingCol.ownedPokemon.map((poke) => {
                    if (!receivingIsSubCol && poke.disabled) {return poke}
                    const pBeingReceivedData = latestOffer.trade.offer.pokemon.filter(p => (p.for === poke.name || p.name === poke.name))[0]
                    if (pBeingReceivedData === undefined) {return poke}
                    const newBallData = {}
                    Object.keys(poke.balls).forEach(ball => {
                        const ballData = poke.balls[ball]
                        if (!receivingIsSubCol && ballData.disabled) {newBallData[ball] = ballData}
                        else {
                            const ballComboTradeData = pBeingReceivedData.balls.filter(bD => bD.ball === ball)[0]
                            const ballComboBeingReceived = ballComboTradeData !== undefined
                            // && ballData.isOwned === false
                            if (ballComboBeingReceived) {
                                // const ballTradeData = ballComboTradeData[0].balls.filter(bD => bD.ball === ball)[0]
                                newBallData[ball] = generateTradeCompleteBallInfo(ballComboTradeData, ballData, receivingCol.gen, offerCol.gen, receivingIsSubCol)
                                // const haData = ballTradeData.isHA !== undefined ? {isHA: ballTradeData.isHA} : {}
                                // const emData = ballTradeData.emCount !== undefined && !(receivingCol.gen === 'home') ? {emCount: ballTradeData.emCount, EMs: ballTradeData.EMs} : {}
                                // const defaultData = ballData.default !== undefined ? {default: ballData.default} : {}
                                // newBallData[ball] = {
                                //     isOwned: true,
                                //     ...haData,
                                //     ...emData,
                                //     ...defaultData
                                // }
                            }
                            else {newBallData[ball] = ballData}
                        }
                    }) 
                    return {...poke, balls: newBallData}
                })
                if (latestOffer.trade.receiving.pokemon !== undefined) {
                    receivingCol.onHand = receivingCol.onHand.map((poke) => {
                        const wasOffered = latestOffer.trade.receiving.pokemon.filter(pData => pData.balls.filter(pBallData => pBallData.onhandId !== undefined && pBallData.onhandId.toString() === poke._id.toString()).length !== 0).length !== 0
                        if (wasOffered) {
                            if (poke.qty === 1) {
                                return undefined
                            }
                            else {
                                poke.qty -= 1
                                if (poke.reserved === 1) {
                                    poke.reserved = undefined
                                } else {
                                    poke.reserved -= 1
                                }
                            }
                        }
                        return poke
                    }).filter(p => p !== undefined)
                }
            }
            if (latestOffer.trade.offer.items !== undefined) {
                latestOffer.trade.offer.items.forEach(itemD => {
                    const itemName = itemD.name
                    const hasFtItem = offerCol.options.tradePreferences.ftItems[itemName] !== undefined
                    if (hasFtItem) {
                        const setFtItemTo0 = itemD.qty >= offerCol.options.tradePreferences.ftItems[itemName]
                        if (setFtItemTo0) {
                            delete offerCol.options.tradePreferences.ftItems[itemName]
                        } else {
                            offerCol.options.tradePreferences.ftItems[itemName] = offerCol.options.tradePreferences.ftItems[itemName] - itemD.qty
                        }
                        
                    }
                })
            }
            if (latestOffer.trade.receiving.items !== undefined) {
                latestOffer.trade.receiving.items.forEach(itemD => {
                    const itemName = itemD.name
                    const hasFtItem = receivingCol.options.tradePreferences.ftItems[itemName] !== undefined
                    if (hasFtItem) {
                        const setFtItemTo0 = itemD.qty >= receivingCol.options.tradePreferences.ftItems[itemName]
                        if (setFtItemTo0) {
                            delete receivingCol.options.tradePreferences.ftItems[itemName]
                        } else {
                            receivingCol.options.tradePreferences.ftItems[itemName] = receivingCol.options.tradePreferences.ftItems[itemName] - itemD.qty
                        }
                        
                    }
                })
            }
            await offerCol.save()
            await receivingCol.save()
            if (offerIsSubCol) {
                await offerColSuperCol.save()
            }
            if (receivingIsSubCol) {
                await receivingSuperCol.save()
            }
            const newOfferProg = getCollectionProgressPercent(offerIsSubCol ? offerColSuperCol : offerCol)
            const newReceivingProg = getCollectionProgressPercent(receivingIsSubCol ? receivingSuperCol : receivingCol)

            const offerUser = await User.findById(offerCol.owner).populate({path: 'collections', select: 'ownedPokemon gen linkedTo'})
            const receivingUser = await User.findById(receivingCol.owner).populate({path: 'collections', select: 'ownedPokemon gen linkedTo'})
            const offerUserOtherColProgs = offerUser.collections.map(col => {return {_id: col._id, progress: getCollectionProgressPercent(col)}}).filter(col => col._id.toString() !== (offerIsSubCol ? offerColSuperCol._id.toString() : offerCol._id.toString())).map(col => col.progress)
            const receivingUserOtherColProgs = receivingUser.collections.map(col => {return {_id: col._id, progress: getCollectionProgressPercent(col)}}).filter(col => col._id.toString() !== (receivingIsSubCol ? receivingSuperCol._id.toString() : receivingCol._id.toString())).map(col => col.progress)
            
            const offerUserBadgeChange = checkBadgeMilestone(newOfferProg, offerUser.settings.profile.badges, offerUserOtherColProgs)
            const receivingUserBadgeChange = checkBadgeMilestone(newReceivingProg, receivingUser.settings.profile.badges, receivingUserOtherColProgs)
            if (offerUserBadgeChange !== 'no-change') {
                offerUser.settings.profile.badges = offerUserBadgeChange
                offerUser.save()
            }
            if (receivingUserBadgeChange !== 'no-change') {
                receivingUser.settings.profile.badges = receivingUserBadgeChange
                receivingUser.save()
            }

            const offerUserTrades = await Trade.find({status: 'completed', users: {$in: offerCol.owner}}).lean()
            const receivingUserTrades = await Trade.find({status: 'completed', users: {$in: receivingCol.owner}}).lean()

            const offerUserTradeBadges = checkTradeBadgeMilestone(offerUserTrades.length, offerUser.settings.profile.badges)
            const receivingUserTradeBadges = checkTradeBadgeMilestone(receivingUserTrades.length, receivingUser.settings.profile.badges)
            if (offerUserTradeBadges !== 'no-change') {
                offerUser.settings.profile.badges = offerUserTradeBadges
                offerUser.save()
            }
            if (receivingUserTradeBadges !== 'no-change') {
                receivingUser.settings.profile.badges = receivingUserTradeBadges
                receivingUser.save()
            }

        }
    }
    res.end()
}