import {Outlet, useLoaderData, useLocation, useRouteLoaderData} from 'react-router-dom';
import { useTheme, Box, Typography, Button } from '@mui/material';
import { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Features from '../components/titlecomponents/homepage/features';
import hexToRgba from 'hex-to-rgba';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import AnnouncementBlock from '../components/functionalcomponents/admin/announcements/announcementblock';
import { useSelector } from 'react-redux';
import { selectScreenBreakpoint } from '../app/selectors/windowsizeselectors';

export default function Root() {
    const theme = useTheme()
    const navigate = useNavigate()
    const userData = useRouteLoaderData('root')
    const latestAnnouncement = useLoaderData()
    const cannotGetAnnouncement = !latestAnnouncement.ok
    const annData = !cannotGetAnnouncement && latestAnnouncement.load
    const screenWidth = useSelector((state) => selectScreenBreakpoint(state, 'root'))
    const smScreen = screenWidth === 'sm'
    return (
      <Box sx={{flex: 1}}>
        <Box sx={{minHeight: '340px', backgroundColor: theme.palette.color2.main, backgroundImage: `url(https://res.cloudinary.com/duaf1qylo/image/upload/w_0.4,c_scale,o_10/v1715457371/misc/ballswallpaper.png)`, ...theme.components.box.fullCenterCol, justifyContent: 'center'}}>
            <Typography variant='h1' sx={{mb: 2, color: theme.palette.color2.contrastText, fontSize: smScreen ? '3.25em' : '4rem', mt: smScreen ? 1 : 3, textAlign: 'center'}}>{smScreen ? 'Pokellections' : 'Welcome to Pokellections!'}</Typography>
            <Typography variant='h2' sx={{color: theme.palette.color2.contrastText, fontSize: smScreen ? '24px' : '32px', textAlign: 'center'}}>Aprimon Collection Tracker</Typography>
            <Button onClick={() => navigate('/info/what-are-aprimon')}>What are Aprimon?</Button>
            <Typography sx={{fontWeight: 700, mt: 2, color: 'white', textAlign: 'center'}}>Some pages are not yet built for mobile.</Typography>
        </Box>
        <Box sx={{width: '100%', height: '50px', display: 'flex', mb: 5, backgroundColor: theme.palette.color2.main, borderBottomRightRadius: '100%', borderBottomLeftRadius: '100%'}}></Box>
        {cannotGetAnnouncement ? 
          <AnnouncementBlock errorAnnouncement={true}/> : 
          <AnnouncementBlock 
            title={annData.title}
            body={annData.body}
            buttons={annData.buttons}
            timestamp={annData.createdAt}
            isFrontPage={true}
          />
        }
      <Features smScreen={smScreen}/>
      <Box sx={{...theme.components.box.fullCenterCol, mt: 1}}>
        {!userData.loggedIn && 
        <Box sx={{width: smScreen ? '90%' : '50%', '@media only screen and (max-width: 520px)': {width: !smScreen ? '70%' : '90%'}, height: '100px', borderRadius: '10px', backgroundColor: theme.palette.color1.light, color: theme.palette.color1.contrastTextLight, ...theme.components.box.fullCenterCol}}>
          <Typography sx={{fontSize: '24px', fontWeight: 700}}>Try it out!</Typography>
          <Box sx={{...theme.components.box.fullCenterRow, gap: 3}}>
            <Button size='large' onClick={() => navigate('/demo-collection/new')} sx={{'&.MuiButtonBase-root': {color: theme.palette.color1.contrastText, backgroundColor: theme.palette.color2.main}}}>Try a demo</Button>
            <Button size='large' onClick={() => navigate('/register')} sx={{'&.MuiButtonBase-root': {color: theme.palette.color1.contrastText, backgroundColor: theme.palette.color2.main}}}>Register</Button>
          </Box>
        </Box>}
      </Box>
    </Box>
    );
  }