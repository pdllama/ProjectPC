import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const opts = {timestamps: true}

const announcementSchema = new Schema ({
    title: {type: String, required: true},
    type: {type: String, required: true, enum: {values: ['system', 'site update']}},
    body: {type: String, required: true},
    noNotification: {type: Boolean}, //if i want to exclude this announcement from giving an notification.
}, opts)