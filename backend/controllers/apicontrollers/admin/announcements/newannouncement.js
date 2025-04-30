import { Announcement, AdminMain } from "../../../../models/admin.js";
import User from "../../../../models/users.js"

export default async function makeNewAnnouncement(req, res) {
    const {title, body, type, buttons, seriesData, notificationData} = req.body
    //seriesData: {isSeries, seriesName, makeNewSeries}
    //notificationData: {sendNotifications, notiTitle, notiBody}
    const {isSeries, seriesName, makeNewSeries} = seriesData
    const {sendNotifications, notiTitle, notiBody} = notificationData

    if (isSeries || makeNewSeries) {
        const adminData = await AdminMain.findOne({adminType: 'main'})
        if (isSeries) {
            adminData.updateSeries = adminData.updateSeries.map(uS => {
                if (uS.name === seriesName) {
                    return {...uS, num: uS.num+1}
                } else {return uS}
            })
            await adminData.save()
        } else {
            adminData.updateSeries.push({
                name: seriesName, 
                num: 1
            })
            await adminData.save()
        }
        
    } 

    const announcement = new Announcement({
        title,
        adminType: 'announcement',
        body,
        type, 
        buttons,
    })
    await announcement.save()

    if (sendNotifications) {
        const allUsers = await User.find({})
        allUsers.forEach((user) => {
            user.notifications.push({type, title: notiTitle, message: notiBody, unread: true})
            if (user.notifications.length > 40) {
                user.notifications.shift()
            }
            user.save()
        })
    }

    res.end()

        // const useTitle = makeNewSeries ? `${title} #1` : title
        // if (makeNewSeries) {
        //     const adminObj = await AdminMain.findOne({adminType: 'main'})
        //     adminObj.updateSeries = [...adminObj.updateSeries, title]
        //     await adminObj.save()
        // }
        // const announcement = new Announcement({
        //     title: useTitle,
        //     adminType: 'announcement',
        //     body,
        //     type,
        //     buttons
        // })
        // await announcement.save()
        // res.end()

}