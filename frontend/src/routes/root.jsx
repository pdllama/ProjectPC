import {Outlet, useLocation, useRouteLoaderData} from 'react-router-dom';
import { useTheme, Box, Typography, Button } from '@mui/material';
import { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Features from '../components/titlecomponents/homepage/features';
import hexToRgba from 'hex-to-rgba';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

export default function Root() {
    const theme = useTheme()
    const navigate = useNavigate()
    const userData = useRouteLoaderData('root')
   
    return (
      <Box sx={{flex: 1}}>
        <Box sx={{minHeight: '340px', backgroundColor: theme.palette.color2.main, backgroundImage: `url(https://res.cloudinary.com/duaf1qylo/image/upload/w_0.4,c_scale,o_10/v1715457371/misc/ballswallpaper.png)`, ...theme.components.box.fullCenterCol, justifyContent: 'center'}}>
            <Typography variant='h1' sx={{mb: 2, color: theme.palette.color2.contrastText, fontSize: '4rem', mt: 3, textAlign: 'center'}}>Welcome to Pokellections!</Typography>
            <Typography variant='h2' sx={{color: theme.palette.color2.contrastText, fontSize: '32px'}}>Aprimon Collection Tracker</Typography>
            <Button onClick={() => navigate('/info/what-are-aprimon')}>What are Aprimon?</Button>
            <Typography sx={{fontWeight: 700, mt: 2, color: 'white'}}>This website is not built for mobile</Typography>
        </Box>
        <Box sx={{width: '100%', height: '50px', display: 'flex', mb: 5, backgroundColor: theme.palette.color2.main, borderBottomRightRadius: '100%', borderBottomLeftRadius: '100%'}}></Box>
        <Box sx={{...theme.components.box.fullCenterCol, width: '100%', mb: 2}}>
          <Box sx={{...theme.components.box.fullCenterCol, width: '90%', maxWidth: '800px', position: 'relative', border: `1px solid ${theme.palette.color1.dark}`, backgroundColor: hexToRgba(theme.palette.color1.main, 0.9), borderRadius: '10px'}}>
            <Box sx={{...theme.components.box.fullCenterCol, alignItems: 'start', height: '100%', justifyContent: 'start', width: '100%', ml: 4, mt: 3}}>
                <Typography sx={{fontSize: '36px', color: 'white', fontWeight: 700, '@media only screen and (max-width: 380px)': {fontSize: '28px'}}}>Bugfixes #1</Typography>
                <Typography sx={{fontSize: '15px', color: 'white', width: '95%'}}>
                    This is a small update regarding some bugs that were fixed. The first one may have affected some users' collections: 
                </Typography>
                <Box sx={{...theme.components.box.fullCenterCol, width: '90%', justifyContent: 'start', mt: 1}}>
                    <Box sx={{...theme.components.box.fullCenterCol, width: '100%', alignItems: 'start', gap: 1}}>
                    <Typography sx={{fontSize: '14px', color: 'white', textIndent: '30px', fontWeight: 700}}>1. Fixed a bug where users could make multiple of the same type of collection.</Typography>
                    <Typography sx={{fontSize: '13px', color: 'white', textIndent: '50px'}}> - This was disallowed in order to reduce space used. If you need to partition the same type of collection into different parts, please look forward to the upcoming May update which will allow you to have different sheets in the same collection.</Typography>
                        <Typography sx={{fontSize: '13px', color: 'white', textIndent: '50px'}}> - Some users' <b>empty collections have been deleted</b> as a result. If you were one of those affected, you will receive a notification. </Typography>
                        <Typography sx={{fontSize: '12px', color: 'white', textIndent: '50px'}}> - If you were one of the users affected, and want to regain access to the collection, please <a href="/info/contact-us">contact me</a> while logged in to either have the collection added as a sheet to your current one in the upcoming update, or have a link to the collection in a google sheet.</Typography>
                    <Typography sx={{fontSize: '14px', color: 'white', textIndent: '30px', fontWeight: 700}}>2. Fixed a bug which caused an error when seeing a HOME collection with evolved regional pokemon in it (due to an oversight in the previous update).</Typography>
                </Box>
                <Box sx={{...theme.components.box.fullCenterCol, width: '100%', justifyContent: 'start', alignItems: 'start', mt: 1, gap: 1}}>
                <Typography sx={{color: 'white', fontSize: '15px', width: '95%', textIndent: '30px', mt: 2, textAlign: 'left'}}>On top of this, the images column when exporting a collection will be updated to have more uniform images. This silent update will take place by the end of today.</Typography>
                </Box>
                <Typography sx={{color: 'white', fontSize: '14px', mt: 3}}>
                    Thanks again for using the site!
                </Typography>
                </Box>
                <Typography sx={{position: 'absolute', top: '3px', right: '5px', fontSize: '12px', color: 'white'}}>March 26, 2025</Typography>
                <Button sx={{position: 'absolute', bottom: '4px', right: '4px', color: theme.palette.color3.main}} onClick={() => navigate('/announcements')}>See all Announcements</Button>
            </Box>
        </Box>
      </Box>
      <Features />
      <Box sx={{...theme.components.box.fullCenterCol, mt: 1}}>
        {!userData.loggedIn && 
        <Box sx={{width: '50%', height: '100px', borderRadius: '10px', backgroundColor: theme.palette.color1.light, color: theme.palette.color1.contrastTextLight, ...theme.components.box.fullCenterCol}}>
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