import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export default new Schema({
    _id: false,
    type: Object,
    collectingBalls: {type: Array},
    globalDefaults: {
        isHA: {type: Boolean},
        emCount: {type: Number},
        eggMoveData: {
            _id: false,
            type: Object,
            swsh: {type: Number},
            bdsp: {type: Number},
            9: {type: Number},
            default: undefined
        }
    },
    sorting: {
        _id: false,
        type: Object,
        collection: {_id: false, type: Object, default: {type: String}, reorder: {type: Boolean}},
        onhand: {_id: false, type: Object, default: {type: String}, reorder: {type: Boolean}, ballOrder: {type: Array}, sortFirstBy: {type: String, enum: {values: ['pokemon', 'ball']}}}
    },
    tradePreferences: {
        _id: false,
        type: Object,
        status: {
            type: String,
            enum: {
                values: ['open', 'closed']
            }
        },
        rates: {
            _id: false,
            type: Object,
            pokemonOffers: {
                type: [{
                    _id: false,
                    type: Object,
                    items: { //always ordered as user's item at index 0 and offer's item at index 1
                        type: [{
                            type: String
                        }],
                        validate: v => v.length === 2
                    },
                    rate: {//always ordered as user's item : offer item (index0 : index1)
                        type: [{
                            type: String
                        }],
                        validate: v => v.length === 2
                    }
                }],
                validate: v => v.length <= 8 //putting an arbitrary limit of 8 on allowed rate definitions of a particular type
            },
            itemOffers: {
                type: [{
                    _id: false,
                    type: Object,
                    items: { 
                        type: [{
                            type: String
                        }],
                        validate: v => v.length === 2
                    },
                    rate: {
                        type: [{
                            type: String
                        }],
                        validate: v => v.length === 2
                    }
                }],
                validate: v => v.length <= 8
            } 
        },
        size: {
            type: String,
            enum: {
                values: ['any', 'small preferred', 'small only', 'large preferred', 'large only']
            }
        },
        onhandOnly: {
            type: String,
            enum: {
                values: ['yes', 'no', 'preferred']
            }
        },
        items: {
            type: String,
            enum: {
                values: ['none', 'lf', 'ft', 'lf/ft']
            }
        },
        lfItems: {type: Array}, //arr of items they're looking for if they are looking for any
        ftItems: {_id: false, type: Object, minimize: false} 
        //obj of items they're offering with keys being item names. validated thru frontend. could be validated here
        //for more security but more work than is needed as of april 17 2024
    }
}, {minimize: false})