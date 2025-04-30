import { Announcement } from "../../../../models/admin.js";

export default async function getAnnouncements(req, res) {
    const {skip, getLatest} = req.query
    const maxDocs = 10
    const result = getLatest === 'true' ? await Announcement.findOne({adminType: 'announcement'}, {}, {sort: {createdAt: -1}}) : 
        await Announcement.find({adminType: 'announcement'}, {}, {sort: {createdAt: -1}}).skip(skip).limit(maxDocs).exec()

    res.json(result)
}