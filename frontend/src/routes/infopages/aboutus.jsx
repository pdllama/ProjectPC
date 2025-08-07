import {Box, Typography, useTheme} from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import InfoWrapper from './infowrapper'
import hexToRgba from 'hex-to-rgba'

export default function AboutUs({}) {
    const theme = useTheme()
    const navigate = useNavigate()
    const Highlighted = ({children}) => {
        return (
            <span style={{color: theme.palette.color3.light}}>{children}</span>
        )
    }
    
    const indentQuery = {'@media only screen and (min-width: 500px)': {textIndent: '30px'}, '@media only screen and (max-width: 499px)': {textAlign: 'center'}}

    return (
        <InfoWrapper title='About Us' wrapperSx={{...theme.components.box.fullCenterCol, justifyContent: 'start', mx: 2}}>
            <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', py: 2, px: 3, backgroundColor: hexToRgba(theme.palette.color1.main, 0.9), borderRadius: '10px', border: `2px solid ${theme.palette.color1.dark}`, color: theme.palette.color1.contrastText, maxWidth: '750px', width: '90%', position: 'relative'}}>
                <Typography sx={{fontSize: '16px', width: '100%', textAlign: 'start', ...indentQuery}}>
                    Pokellections started as a personal project in order to fill the need for <Link to={'/info/what-are-aprimon'}>aprimon</Link> collection tracking tools.
                    There's no shortage of tools to track general pokemon collections, but the primary tool for this niche type of collection are Google Sheets. These work
                    well overall, but it can be annoying and/or frustrating to constantly update collections, especially when said collections has thousands of different pokemon/apriball combos
                    to track.
                </Typography>
                <Typography sx={{fontSize: '16px', width: '100%', textAlign: 'start', ...indentQuery, mt: 4}}>
                    I hope to provide another option for aprimon collectors and offer features that make their lives as easy as possible. Coming from an aprimon collecting
                    background myself, I've made every part of the site with the collector in mind. The programming experience I earned from making this app was invaluable,
                    and I have many more ideas for this site that I would love to explore! 
                </Typography>
                <Typography sx={{fontSize: '16px', width: '100%', textAlign: 'start', ...indentQuery, mt: 4}}>
                    Thank you for checking the site out! Happy collecting!
                </Typography>
                
                <Box sx={{height: '10px', mt: 5}}></Box>
                <Box sx={{position: 'absolute', width: '100%', ...theme.components.box.fullCenterCol, alignItems: 'start', bottom: '5px'}}>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...indentQuery}}>
                        - Llama
                    </Typography>
                    <Typography sx={{fontSize: '12px', textAlign: 'start', ...indentQuery}}>
                        Pokellections Founder
                    </Typography>
                </Box>
            </Box>

        </InfoWrapper>
    )
}