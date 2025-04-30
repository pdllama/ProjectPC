import { AdminMain, Announcement } from "../../../../models/admin.js";

export default async function getAdminMain(req, res) {
    const mainObj = await AdminMain.findOne({adminType: 'main'})
    res.json(mainObj)
}