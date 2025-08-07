import mongoose from "mongoose"

const superCollectionFilterQuery = {
    $filter: {
        input: '$superCollection.ownedPokemon',
        as: 'p',
        cond: {
            $gt: [
                {$size: 
                    {$filter: {
                        input: '$ownedPokemon', 
                        as: 'p2', 
                        cond: {$eq: ['$$p2.name', '$$p.name']}
                    }}
                }, 0
            ]
        }
    }
}

const lookup = {
    $lookup: {
        from: 'collections',
        localField: 'linkedTo.super',
        foreignField: '_id',
        as: 'superCollection'     
    }
}

//here lies unused logic to query how many collections are linked to that one.
//i was close to completing it, but unfortunately this query says all unlinked collections are linked to every other non-linked collections, and i dont know why.
//it was meant to just be for the search page, to give more detailed numbers on the links, but ultimately just opted to see if its a linked collection at all.
const allLinkedLookup = [
    {
        $lookup: {
            from: 'collections',
            // localField: {$cond: [{$eq: ['$linkedTo.super', null]}, '_id', 'linkedTo.super']},
            // foreignField: 'linkedTo.super',
            as: 'linkedCount',
            let: {superCollectionId: '$linkedTo.super', colId: '$_id', gen: '$gen'},
            pipeline: [
                {$match: {
                    $expr: {
                        $or: [
                            {$cond: {if: {$eq: ['$linkedTo', null]}, then: false, else: {$cond: {if: {$eq: ['$$gen', 'home']}, then: {$eq: ['$linkedTo.super', '$$colId']}, else: {$and: [{$eq: ['$linkedTo.super', '$$superCollectionId']}, {$not: {$eq: ['$_id', '$$colId']}}]}}}}},
                            {$cond: {if: {$eq: ['$$superCollectionId', null]}, then: false, else: {$eq: ['$_id', '$$superCollectionId']}}}
                        ]
                    }
                }},
                {$count: 'num'},
                {$project: {num: true}}
            ]
        }
    },
    {
        $addFields: {
            linkedCount: {$getField: {field: 'num', input: {$arrayElemAt: ['$linkedCount', 0]}}}
        }
    }
]

const checkIfLinkedLookup = [
    {
        $lookup: {
            from: 'collections',
            localField: '_id',
            foreignField: 'linkedTo.super',
            as: 'subCollections'
        }
    },
    {
        $addFields: {
            isLinked: {$or: [{$gt: [{$size: '$subCollections'}, 0]}, '$hasSuperCollection']}
        }
    }
]

export const linkedAsSingleTotalAggregate = (id, customLookup) => [
    {$match: {_id: id}},
    lookup,
    {$addFields: {
        hasSuperCollection: {$cond: [{$gt: [{$size: '$superCollection'}, 0]}, true, false]},
        superCollection: {$arrayElemAt: ['$superCollection', 0]},
    }},
    {$addFields: {
        ownedPokemon: {
            $cond: {
                if: {$not: ['$hasSuperCollection']},
                then: '$ownedPokemon',
                else: {
                    $map: {
                        input: superCollectionFilterQuery,
                        as: 'pokemon',
                        in: {
                            $mergeObjects: [
                                {name: '$$pokemon.name', natDexNum: '$$pokemon.natDexNum', gen: '$$pokemon.gen'},
                                {balls: {$arrayToObject: 
                                    {
                                        $map: {
                                            input: {$filter: {
                                                input: {$objectToArray: '$$pokemon.balls'},
                                                as: 'bData',
                                                cond: {$in: ['$$bData.k', '$options.collectingBalls']}
                                            }},
                                            as: 'ballData',
                                            in: {
                                                $mergeObjects: [
                                                    '$$ballData',
                                                    {v: {$mergeObjects: [
                                                        // '$$ballData.v',
                                                        {isOwned: {$getField: {field: 'isOwned', input: '$$ballData.v'}}},
                                                        {isHA: {$getField: {field: 'isHA', input: '$$ballData.v'}}},
                                                        // {disabled: {$cond: {if: {$in: ['$$ballData.k', {$getField: {field: 'disabledBalls', input: {$arrayElemAt: [{$filter: {input: '$ownedPokemon', as: 'poke', cond: {$eq: ['$$poke.name', '$$pokemon.name']}}}, 0]}}}]}, then: true, else: '$$REMOVE'}}},
                                                        {$cond: {if: {$in: ['$$ballData.k', {$getField: {field: 'disabledBalls', input: {$arrayElemAt: [{$filter: {input: '$ownedPokemon', as: 'poke', cond: {$eq: ['$$poke.name', '$$pokemon.name']}}}, 0]}}}]}, then: {disabled: true}, else: {}}},
                                                        {emCount: {$getField: {field: 'emCount', input: {$getField: {field: '$gen', input:'$$ballData.v.eggMoveData'}}}}},
                                                        {EMs: {$getField: {field: 'EMs', input: {$getField: {field: '$gen', input:'$$ballData.v.eggMoveData'}}}}},
                                                        {default: {$getField: {field: 'default', input: '$$ballData.v'}}},
                                                        {highlyWanted: {$getField: {field: 'highlyWanted', input: '$$ballData.v'}}},
                                                        {pending: {$getField: {field: 'pending', input: '$$ballData.v'}}}  
                                                    ]}}
                                                ]
                                            }
                                        }
                                    }
                                }}
                            ]
                        }
                    }
                }
            }
        }
    }},
    {$project: {
        hasSuperCollection: 0,
        superCollection: 0
    }}
]

export const linkedAsSingleSearchAggregate = (oP='$ownedPokemon') => ([
    lookup,
    {$addFields: {
        hasSuperCollection: {$cond: [{$gt: [{$size: '$superCollection'}, 0]}, true, false]},
        superCollection: {$arrayElemAt: ['$superCollection', 0]},
    }},
    ...checkIfLinkedLookup,
    {$addFields: {
        ownedPokemon: {
            $cond: {
                if: {$not: ['$hasSuperCollection']},
                then: oP,
                else: {
                    $map: {
                        input: superCollectionFilterQuery,
                        as: 'pokemon',
                        in: {
                            $mergeObjects: [
                                '$$pokemon',
                                {disabled: '$$REMOVE'},
                                {$cond: {
                                        if: {
                                            //$or: [ 
                                            //if the pokemon has disabled balls        
                                            $gt: [{$size: {$getField: {field: 'disabledBalls', input: {$arrayElemAt: [{$filter: {input: '$ownedPokemon', as: 'poke', cond: {$eq: ['$$poke.name', '$$pokemon.name']}}}, 0]}}}}, 0]
                                            //if the collectingBalls array is different between collections
                                            // {$or: [{$gt: [{$setDifference: ['$options.collectingBalls', '$superCollection.options.collectingBalls']}, 0]}, {$gt: [{$setDifference: ['$superCollection.options.collectingBalls', '$options.collectingBalls']}, 0]}]}
                                        //]
                                        },
                                        then: {
                                            owned: {$sum: {$map: {
                                                input: {$objectToArray: '$$pokemon.balls'},
                                                as: 'ballData',
                                                in: {$cond: {if: {$and: [
                                                    '$$ballData.v.isOwned', 
                                                    {$not: {$in: ['$$ballData.k', {$getField: {field: 'disabledBalls', input: {$arrayElemAt: [{$filter: {input: '$ownedPokemon', as: 'poke', cond: {$eq: ['$$poke.name', '$$pokemon.name']}}}, 0]}}}]}},
                                                    {$in: ['$$ballData.k', '$options.collectingBalls']}
                                                    ]
                                                }, then: 1, else: 0
                                                }}
                                            }}},
                                            total: {$sum: {$map: {
                                                input: {$objectToArray: '$$pokemon.balls'},
                                                as: 'ballData',
                                                in: {$cond: {if: {$and: [
                                                    {$not: {$in: ['$$ballData.k', {$getField: {field: 'disabledBalls', input: {$arrayElemAt: [{$filter: {input: '$ownedPokemon', as: 'poke', cond: {$eq: ['$$poke.name', '$$pokemon.name']}}}, 0]}}}]}},
                                                    {$in: ['$$ballData.k', '$options.collectingBalls']}
                                                    ]
                                                }, then: 1, else: 0
                                                }}
                                            }}}
                                        }, else: {}
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    }}
])