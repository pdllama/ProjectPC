import mongoose from 'mongoose';
const Schema = mongoose.Schema;

export const homeEggMoves = new Schema({
    _id: false,
    swsh: {type: Object, _id: false, EMs: {type: Array, default: undefined}, emCount: Number, default: undefined},
    bdsp: {type: Object, _id: false, EMs: {type: Array, default: undefined}, emCount: Number, default: undefined},
    9: {type: Object, _id: false, EMs: {type: Array, default: undefined}, emCount: Number, default: undefined}
})

export default new Schema({
    _id: false,
    disabled: Boolean,
    isOwned: Boolean,
    isHA: Boolean,
    EMs: {type: Array, default: undefined},
    eggMoveData: homeEggMoves, //this one is used for home collections 
    emCount: Number,
    default: Boolean,
    highlyWanted: Boolean,
    pending: Boolean
})

