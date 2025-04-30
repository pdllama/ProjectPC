import {Box, Typography, useTheme, Button} from '@mui/material'
import { useNavigate } from 'react-router'
import hexToRgba from 'hex-to-rgba'
import 'quill/dist/quill.snow.css';
import { useSelector } from 'react-redux';
import { selectScreenBreakpoint } from '../../../../app/selectors/windowsizeselectors';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const monthPicker = (date) => {
    const monthNum = parseInt(date.slice(date.indexOf('-')+1, date.indexOf('-', 5)))
    return months[monthNum-1]
}
const dateFormatter = (date) => {
    const year = date.slice(0, date.indexOf('-'))
    const month = monthPicker(date)
    const dateNum = date.slice(date.indexOf('-', 5)+1, date.indexOf('-', 5)+3)
    return `${month} ${dateNum}, ${year}`
}

export default function AnnouncementBlock({title, body, buttons=[], timestamp, isFrontPage=false, isPreview=false, errorAnnouncement=false}) {
    const theme = useTheme()
    const navigate = useNavigate()
    const scrnBrkpt = useSelector((state) => selectScreenBreakpoint(state, 'compareDisplayMod')) //this comp uses the same breakpoint (380px)
    const smScreen = scrnBrkpt === 'sm'

    if (errorAnnouncement) {
        return (
        <Box sx={{...theme.components.box.fullCenterCol, width: '100%', mb: 2}}>
            <Box sx={{...theme.components.box.fullCenterCol, width: '90%', '@media only screen and (max-width: 380px)': {width: '85%'}, height: '100%', padding: 2, maxWidth: '800px', minHeight: '300px', position: 'relative', border: `1px solid ${theme.palette.color1.dark}`, backgroundColor: hexToRgba(theme.palette.color1.main, 0.9), borderRadius: '10px'}}>
              <Box sx={{...theme.components.box.fullCenterCol, height: '100%', width: '100%'}}>
                  <Typography sx={{color: 'grey', fontSize: '24px', textAlign: 'center'}}><i>Failed to gather announcement data.</i></Typography>
              </Box>
          </Box>
        </Box>
        )
    }

    const filteredScripts = body.replace("<script>", '').replace("</script>", '') 
    // ^^ basic security precaution 

    const finalBody = smScreen ? filteredScripts.replaceAll('text-indent: 30px;', '').replaceAll('<ol>', "<ol style='padding-left: 0px;'>") : filteredScripts

    const bottomLeftButton = buttons.filter(b => b.position === 'bottom-left')[0]
    const bottomMidButton = buttons.filter(b => b.position === 'bottom-mid')[0]
    const bottomRightButton = buttons.filter(b => b.position === 'bottom-right')[0]

    const previewTimestamp = isPreview && new Date(timestamp)
    const previewTimestampProcessed = previewTimestamp && `${months[previewTimestamp.getMonth()]} ${previewTimestamp.getDate()}, ${previewTimestamp.getFullYear()}`

    return (
        <Box sx={{...theme.components.box.fullCenterCol, width: '100%', mb: 2}}>
          <Box sx={{...theme.components.box.fullCenterCol, alignItems: 'start', justifyContent: 'start', width: '90%', '@media only screen and (max-width: 380px)': {width: '85%'}, height: '100%', padding: 2, maxWidth: '800px', minHeight: '300px', position: 'relative', border: `1px solid ${theme.palette.color1.dark}`, backgroundColor: hexToRgba(theme.palette.color1.main, 0.9), borderRadius: '10px'}}>
            <Box sx={{...theme.components.box.fullCenterCol, alignItems: 'start', height: '100%', justifyContent: 'start', width: '100%'}}>
                <Typography sx={{fontSize: '36px', color: 'white', fontWeight: 700, '@media only screen and (max-width: 380px)': {fontSize: '28px'}}}>{title}</Typography>
                <Box sx={{
                    width: '100%', 
                    color: theme.palette.color1.contrastText,
                    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
                    fontWeight: 400,
                    fontSize: "1rem",
                    height: buttons.length !== 0 ? 'calc(100%-40px)' : '100%'
                }}>
                    <div 
                        className='ql-editor'
                        style={{
                            height: '100%', 
                            width: '100%', display: 'flex', justifyContent: 'start', textAlign: 'start', flexDirection: 'column', 
                            margin: 0, paddingTop: 0, paddingBottom: 0, paddingLeft: 5, paddingRight: 5, 
                            lineHeight: '150%'
                        }} 
                        dangerouslySetInnerHTML={{'__html': finalBody}}
                    />
                   
                </Box>
                {(buttons.length !== 0) && <Box sx={{height: '40px'}}></Box>}
                {isFrontPage && <Box sx={{height: '40px'}}></Box>}
                {buttons.length !== 0 && 
                    <>
                    <Box sx={{width: '95%', height: '40px', ...theme.components.box.fullCenterRow, position: 'absolute', bottom: isFrontPage ? '44px' : '4px'}}>
                    <Box sx={{width: '33%', height: '100%', ...theme.components.box.fullCenterRow}}>
                        {bottomLeftButton !== undefined && 
                            <Button 
                                sx={{color: theme.palette.color3.main}}
                                onClick={isPreview ? null : () => navigate(bottomLeftButton.link)}
                            >
                                {bottomLeftButton.label}
                            </Button>
                        }
                    </Box>
                    <Box sx={{width: '33%', height: '100%', ...theme.components.box.fullCenterRow, mx: '0.5%'}}>
                        {bottomMidButton !== undefined && 
                            <Button 
                                sx={{color: theme.palette.color3.main}}
                                onClick={isPreview ? null : () => navigate(bottomMidButton.link)}
                            >
                                {bottomMidButton.label}
                            </Button>
                        }
                    </Box>
                    <Box sx={{width: '33%', height: '100%', ...theme.components.box.fullCenterRow}}>
                        {bottomRightButton !== undefined && 
                            <Button 
                                sx={{color: theme.palette.color3.main}}
                                onClick={isPreview ? null : () => navigate(bottomRightButton.link)}
                            >
                                {bottomRightButton.label}
                            </Button>
                        }
                    </Box>
                    </Box>
                    </>
                }
                    {/* {buttons.map((b) => {
                        // const positionStyles = b.position === 'bottom-left' ? {left: '4px'} : b.position === 'bottom-right' ? {right: '4px'} : b.position === 'bottom-mid' && {left: '50%'}
                        const fullStyles = {position: 'absolute', color: theme.palette.color3.main, ...positionStyles}
                        return (
                            <Box sx={{width: '33%', height: '100%', ...theme.components.box.fullCenterRow}}>
                                <Button 
                                    sx={fullStyles}
                                    onClick={() => navigate(b.link)}
                                >
                                    {b.label}
                                </Button>
                            </Box>
                        )
                    })} */}
                <Typography sx={{position: 'absolute', top: '3px', right: '5px', fontSize: '12px', color: 'white'}}>
                    {isPreview ? previewTimestampProcessed : dateFormatter(timestamp)}
                </Typography>
                {isFrontPage && <Button sx={{position: 'absolute', bottom: '4px', right: '4px', color: theme.palette.color3.main}} onClick={() => navigate('/announcements')}>See all Announcements</Button>}
            </Box>
        </Box>
      </Box>
    )
}