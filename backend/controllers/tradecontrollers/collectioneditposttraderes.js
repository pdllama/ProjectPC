const setOnHandReserved = (onHand, onhandIdsToReserve) => {
    return onHand.map(onhandP => {
        const isReserved = onhandIdsToReserve.includes(onhandP._id.toString())
        if (isReserved && onhandP.reserved !== onhandP.qty) {
            if (onhandP.reserved === undefined) {
                onhandP.reserved = 1
            } else {
                onhandP.reserved += 1
            }
        }
        return onhandP
    })
}

const removeOnHandReserved = (onHand, previouslyReservedOnHandIds) => {
    return onHand.map(onhandP => { 
        const removeReserved = previouslyReservedOnHandIds.includes(onhandP._id.toString()) 
        if (removeReserved && onhandP.reserved !== undefined) {
            if (onhandP.reserved === 1) {
                onhandP.reserved = undefined //deletes property when saved by mongoose
            }
            else {
                onhandP.reserved -= 1
            }
        }
        return onhandP
    })
}

const getOnhandIdsToReserve = (pokemonListTradeFormat) => {
    return pokemonListTradeFormat === undefined ? [] : pokemonListTradeFormat.map(p => {
        return p.balls.map(pBallData => {
            const isOnHand = pBallData.onhandId !== undefined 
            return isOnHand ? pBallData.onhandId : undefined
        }).filter(ohId => ohId !== undefined)
    }).flat()
}

const generateTradeCompleteBallInfo = (ballTradeData, ballData, offerColGen, receivingColGen, offerIsSubCol) => {
    //this function completely reconstructs the collection's ballData for a particular ball data after a trade is complete.

    //ballTradeData ==> the ballData in the trade document
    //ballData ==> the ballData already present in the collection

    const haData = ballTradeData.isHA !== undefined ? {isHA: ballTradeData.isHA} : {}
    const emData = ballTradeData.emCount !== undefined && !(offerColGen === 'home' || offerIsSubCol) ? {emCount: ballTradeData.emCount, EMs: ballTradeData.EMs} : {}
    const defaultData = ballData.default !== undefined ? {default: ballData.default} : {}
    
    if ((offerColGen === 'home' || offerIsSubCol) && (ballData.eggMoveData !== undefined)) {
        if (receivingColGen === 'home' && !offerIsSubCol) {
            //this means emData in the trade data comes out as an eggMoveData object (ofc if applicable)
            //both offer and receiving gens are HOME
            if (ballTradeData.eggMoveData !== undefined) {emData.eggMoveData = ballTradeData.eggMoveData}
        } else {
            emData.eggMoveData = ballData.eggMoveData
            const emGen = (offerIsSubCol && receivingColGen === 'home') ? offerColGen : receivingColGen 
            if (emData.eggMoveData[emGen] !== undefined) {
                //note: tradeData ALWAYS has egg move keys (emCount, EMs/ eggMoveData) if the pokemon has egg moves available. no need for conditionals
                emData.eggMoveData[emGen] = {emCount: ballTradeData.emCount, EMs: ballTradeData.EMs}
            }
        }
    }

    return {
        isOwned: true,
        ...haData,
        ...emData,
        ...defaultData
    }
}

export {setOnHandReserved, removeOnHandReserved, getOnhandIdsToReserve, generateTradeCompleteBallInfo}