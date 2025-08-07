import {Box, Typography, useTheme, Button} from '@mui/material'
import InfoWrapper from '../infowrapper'
import hexToRgba from 'hex-to-rgba'
import HelpPath from './helppath'
import PrettyBoxWrapper from '../../../components/partials/wrappers/prettyboxwrapper'
import { Outlet, useNavigate } from 'react-router'

// const topLevelHelpLinks = [
//     {display: 'Collection Functions', link: '/help/collections'}
// ]

export function HelpPageWrapper({}) {
    const theme = useTheme()
    return (
        <InfoWrapper title='Help Page' wrapperSx={{...theme.components.box.fullCenterCol, justifyContent: 'start', my: 3}}>
            <Outlet/>
        </InfoWrapper>
    )
}

export default function HelpMain({}) {
    const theme = useTheme()
    const navigate = useNavigate()

    //, '@media only screen and (max-width: 400px)': {width: '85%'}
    return (
        <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', width: '100%', height: '100%', maxWidth: '1000px', gap: 1}}>
            <HelpPath path={[{display: 'Help'}]}/>
            <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', py: 2, px: 3, backgroundColor: hexToRgba(theme.palette.color1.main, 0.9), borderRadius: '10px', border: `2px solid ${theme.palette.color1.dark}`, color: theme.palette.color1.contrastText, width: '100%', height: '100%', gap: 3}}>
                <Typography sx={{fontSize: '20px', fontWeight: 700}}>Here you can find more information on various aspects of the application:</Typography>
                <Box sx={{...theme.components.box.fullCenterCol, width: '100%'}}>
                    <PrettyBoxWrapper 
                        width='100%' height='24px' 
                        sx={{alignItems: 'start', py: 1, borderBottomLeftRadius: '0px', borderBottomRightRadius: '0px', ':hover': {cursor: 'pointer', opacity: 0.75}}}
                        props={{onClick: () => navigate('/help/collections')}}
                    >
                        <Typography sx={{fontWeight: 700, fontSize: '18px', ml: 2}}>Collection Functions</Typography>
                    </PrettyBoxWrapper>
                    <PrettyBoxWrapper 
                        width='100%' height='24px' 
                        color={theme.palette.color2.main}
                        borderColor={theme.palette.color2.dark}
                        sx={{alignItems: 'start', py: 1, borderRadius: 0, ':hover': {cursor: 'pointer', opacity: 0.5}}}
                        props={{onClick: () => navigate('/help/importing')}}
                    >
                        <Typography sx={{fontWeight: 700, fontSize: '18px', ml: 2}}>Importing Collections</Typography>
                    </PrettyBoxWrapper>
                    <PrettyBoxWrapper 
                        width='100%' height='24px' 
                        sx={{alignItems: 'start', py: 1, borderRadius: 0, ':hover': {cursor: 'pointer', opacity: 0.5}}}
                        props={{onClick: () => navigate('/help/comparing')}}
                    >
                        <Typography sx={{fontWeight: 700, fontSize: '18px', ml: 2}}>Comparing Collections</Typography>
                    </PrettyBoxWrapper>
                    <PrettyBoxWrapper 
                        width='100%' height='24px' 
                        color={theme.palette.color2.main}
                        borderColor={theme.palette.color2.dark}
                        sx={{alignItems: 'start', py: 1, borderTopLeftRadius: '0px', borderTopRightRadius: '0px', ':hover': {cursor: 'pointer', opacity: 0.75}}}
                        props={{onClick: () => navigate('/help/trading')}}
                    >
                        <Typography sx={{fontWeight: 700, fontSize: '18px', ml: 2}}>Trading</Typography>
                    </PrettyBoxWrapper>
                </Box>
                <Box sx={{...theme.components.box.fullCenterRow, width: '100%', justifyContent: 'start', gap: 2, '@media only screen and (max-width: 850px)': {flexDirection: 'column', gap: 1}}}>
                    <Typography sx={{fontSize: '14px', fontWeight: 700}}>If these pages don't answer your question, you can contact us here for help:</Typography>
                    <Button 
                        sx={{color: theme.palette.color3.main, backgroundColor: hexToRgba(theme.palette.color2.main, 0.3), border: `1px solid ${theme.palette.color2.dark}`}}
                        onClick={() => navigate('/info/contact-us')}
                    >
                        Contact Us
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}