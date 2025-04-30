import e from "express";
const router = e.Router()
import catchAsync from "../utils/catchAsync.js";
import { isSiteOwner } from "../middleware.js";
import { getSession, checkUsernameEmailAvailability, generateForgotPwTokenAndSendEmail, passJWTTokenToResetPassword, resetPasswordWithJwt, sendEmailToLlama } from "../controllers/apicontrollers/apicontrollers.js";
import sendNotifications from "../controllers/apicontrollers/admin/sendnotifications.js";
import changeTableData from "../controllers/apicontrollers/admin/changetabledata.js";
import getAdminMain from "../controllers/apicontrollers/admin/announcements/getadminmain.js";
import makeNewAnnouncement from "../controllers/apicontrollers/admin/announcements/newannouncement.js";
import getAnnouncements from "../controllers/apicontrollers/admin/announcements/getannouncements.js";

router.get('/session', catchAsync(getSession))
router.get('/username-availability', catchAsync(checkUsernameEmailAvailability))
router.post('/send-user-message', catchAsync(sendEmailToLlama))
router.route('/forgot-password').post(catchAsync(generateForgotPwTokenAndSendEmail))
router.route('/reset-password')
    .get(catchAsync(passJWTTokenToResetPassword))
    .put(catchAsync(resetPasswordWithJwt))

router.post('/admin/send-notifications', isSiteOwner, catchAsync(sendNotifications))
router.route('/admin/announcements')
    .get(catchAsync(getAnnouncements))
    .post(isSiteOwner, catchAsync(makeNewAnnouncement))

router.put('/admin/change-table-data', isSiteOwner, catchAsync(changeTableData))
router.get('/admin/get-admin-main', catchAsync(getAdminMain))

export {router}