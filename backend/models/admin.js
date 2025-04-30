import mongoose from 'mongoose';
const Schema = mongoose.Schema;

//adminType is used to differentiate the document from other types of admin documents. 

const opts = {timestamps: true}

const announcementSchema = new Schema ({
    title: {type: String, required: true},
    adminType: {type: String, default: 'announcement', enum: {values: ['announcement']}},
    type: {type: String, required: true, enum: {values: ['system', 'site update']}},
    body: {type: String, required: true},
    buttons: [{
        _id: false,
        position: {type: String, enum: {values: ['bottom-left', 'bottom-mid', 'bottom-right']}},
        label: {type: String},
        link: {type: String}
    }]
}, opts)

//theres only ever one of below
const mainSchema = new Schema ({
    adminType: {type: String, default: 'main', enum: {values: ['main']}},
    updateSeries: [{_id: false, name: {type: String}, num: {type: Number}}] //list of update serieses and the number of updates made in the series
}, {toJSON: {virtuals: true}})

const Announcement = mongoose.model('Announcement', announcementSchema, 'admin')
const AdminMain = mongoose.model('AdminMain', mainSchema, 'admin')

export {Announcement, AdminMain}
