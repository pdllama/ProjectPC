const sumOwnedBalls = {
    $cond: {
        if: {$isNumber: '$$enabledPokemon.owned'},
        then: '$$enabledPokemon.owned',
        else: {$sum: {$map: {
            input: {$filter: {input: {$objectToArray: '$$enabledPokemon.balls'}, as: 'ballValues', cond: {$not: '$$ballValues.v.disabled'}}},
            as: 'ballObj',
            in: {$cond: {if: {$and: ['$$ballObj.v.isOwned', {$in: ['$$ballObj.k', '$options.collectingBalls']}]}, then: 1, else: 0}}
        }}}
    }
}

const sumTotalBalls = {
    $cond: {
        if: {$isNumber: '$$enabledPokemon.total'},
        then: '$$enabledPokemon.total',
        else: {$sum: {$map: {
            input: {$filter: {input: {$objectToArray: '$$enabledPokemon.balls'}, as: 'ballValues', cond: {$not: '$$ballValues.v.disabled'}}},
            as: 'ballObj',
            in: {$cond: {if: {$and: ['$$ballObj.v', {$in: ['$$ballObj.k', '$options.collectingBalls']}]}, then: 1, else: 0}}
        }}}
    }
}

const getEnabledPokemon = {
    $cond: {
        if: '$hasSuperCollection',
        then: '$ownedPokemon',
        else: {$filter: {
            input: "$ownedPokemon",
            as: 'pokemon',
            cond: {$not: '$$pokemon.disabled'}
        }}
    }
}

const collectionProgressAggField = {
     $addFields: {
        progress: {
            $concat: [
                {$toString: {$sum: {$map: {
                    input: getEnabledPokemon,
                    as: 'enabledPokemon',
                    in: sumOwnedBalls
                }}}},
                '/',
                {$toString: {$sum: {$map: {
                    input: getEnabledPokemon,
                    as: 'enabledPokemon',
                    in: sumTotalBalls
                }}}}
            ]
        }
    }
}

export default collectionProgressAggField