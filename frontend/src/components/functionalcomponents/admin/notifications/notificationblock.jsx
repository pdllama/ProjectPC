import {Box, Typography, useTheme} from '@mui/material'
import hexToRgba from 'hex-to-rgba'
import 'quill/dist/quill.snow.css';
import { useSelector } from 'react-redux';
import { selectScreenBreakpoint } from '../../../../app/selectors/windowsizeselectors';

export default function NotificationBlock({notification, height='auto', width='100%'}) {
    //notification: {title, message, type}
    const theme = useTheme()
    const tinyScreen = useSelector((state) => selectScreenBreakpoint(state, 'compareDisplayMod')) === 'sm' //< 380px
    const filteredScripts = notification !== undefined && (notification.message && notification.message.replace("<script>", '').replace("</script>", '')) //basic security precaution
    const finalBody = notification !== undefined && (tinyScreen ? filteredScripts.replaceAll('text-indent: 30px;', '').replaceAll('<ol>', "<ol style='padding-left: 0px;'>") : filteredScripts)

    return (
        <>
        <Box sx={{...theme.components.box.fullCenterCol, height, width, maxWidth: '900px', minHeight: '400px', justifyContent: 'start', padding: 1, paddingX: 2, backgroundColor: notification === undefined ? 'rgba(220, 53, 69, 0.9)' : hexToRgba(theme.palette.color1.main, 0.9), color: 'white', borderRadius: '15px', border: notification === undefined ? '1px solid rgb(126, 33, 43)' : `2px solid ${theme.palette.color1.main}`}}>
            {notification === undefined ? 
            <>
            <Typography sx={{fontSize: '20px', fontWeight: 700, my: 2}}>ERROR: Not Found</Typography>
            <Typography sx={{fontSize: '18px', my: 1}}>Could not find a notification with the specified id.</Typography>
            </> : 
            <>
            <Box sx={{...theme.components.box.fullCenterCol, alignItems: 'start', width: '100%', position: 'relative', borderBottom: `4px solid ${theme.palette.color1.main}`}}>
                <Box sx={{height: '25px', width: '100%'}}></Box>
                {/* <Typography sx={{fontWeight: 700, fontSize: '24px'}}>{notification.type === 'site update' ? `[ANNOUNCEMENT] ${notification.title}` : notification.title}</Typography> */}
                <Typography sx={{fontWeight: 700, fontSize: '24px'}}>{notification.title}</Typography>
                <Typography sx={{fontSize: '14px', position: 'absolute', right: '0px', top: '0px'}}>{notification.type === 'system' ? '[SYSTEM]' : '[UPDATE]'}</Typography>
            </Box>
            <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', width: '100%', position: 'relative', mt: 1}}>

                <Box sx={{
                    width: '100%', 
                    color: theme.palette.color1.contrastText,
                    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                    fontWeight: 400,
                    fontSize: "1rem",
                }}>
                    {/* <Typography sx={{width: '95%', height: buttons.length !== 0 ? 'calc(100%-40px)' : '100%'}}> */}
                    <div 
                        className='ql-editor'
                        style={{width: '100%', display: 'flex', justifyContent: 'start', textAlign: 'start', flexDirection: 'column', margin: 0, paddingTop: 0, paddingBottom: 0, paddingLeft: 5, paddingRight: 5, lineHeight: '150%'}} 
                        dangerouslySetInnerHTML={{'__html': finalBody}}
                    />
                    {/* </Typography> */}
                   
                </Box>
                
            </Box></>}
        </Box>
        
        </>
    )
}