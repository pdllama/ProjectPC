import {Box, Typography, useTheme, Button, TextField} from '@mui/material'
import { useEffect, useContext, useState } from 'react'
import { Router } from './App'
import { ErrorContext } from './app/contexts/errorcontext'
import getSession from '../utils/functions/backendrequests/users/getsession'
import hexToRgba from 'hex-to-rgba'
import userLoginRequest from '../utils/functions/backendrequests/users/login'

//const handleError = async(backendFunc, errorRedirect=false, successFunc, errorFunc, checkingAvailability=false, nothingHappenIfError=false) => { 

const backendReqFunc = async(setStateFunc) => {
    const data = await getSession()
    if (data.loggedIn && data.user.accountType === 'owner') {
        //eventually, if we have site contributors, we can check if the account type is "admin"
        //and mark admin accounts accordingly
        setStateFunc(true)
    }
}

function MaintenanceLoginComponent({}) {
    const theme = useTheme()
    const {handleError} = useContext(ErrorContext)
    const [loginData, setLoginData] = useState({username: '', password: '', usernameError: false, loginError: false})

    const loginReq = () => {
        const backendFunc = async() => userLoginRequest({username: loginData.username, password: loginData.password})
        const successFunc = (loginStatus) => {
            if (loginStatus.successful) {
                window.location.reload()
            }
        }
        handleError(backendFunc, false, successFunc, () => {}, false, true)
    }

    return (
        <>
            <Box sx={{
                backgroundColor: hexToRgba(theme.palette.color1.main, 0.3), 
                display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'center', gap: 2,
                border: `1px solid ${theme.palette.color1.main}`, color: 'black', borderRadius: '5px', 
                position: 'absolute', bottom: '50px', right: '0px',
                width: '317px', height: '200px'
            }}
            >
                <Box sx={{display: 'flex', width: '100%', alignItems: 'start', justifyContent: 'center', mt: -3}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', width: '30%', gap: 4, mt: 2}}>
                        <Typography sx={{height: '40px', display: 'flex', alignItems: 'center'}}>Username:</Typography>
                        <Typography sx={{height: '40px', display: 'flex', alignItems: 'center'}}>Password:</Typography>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', width: '60%', gap: 4, mt: 2}}>
                        <TextField
                            inputProps={{sx: {height: '8px', py: '16px'}}}
                            onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                            value={loginData.username}
                        />
                        <TextField
                            inputProps={{sx: {height: '8px', py: '16px'}}}
                            value={loginData.password}
                            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                            type='password'
                        />
                    </Box>
                </Box>
                <Box sx={{display: 'flex', justifyContent: 'start', alignItems: 'center', width: '100%', position: 'relative', mt: 1}}>
                    <Button sx={{ml: '20px'}} size='large' onClick={loginReq}>Log In</Button>
                    {/* {false && 
                    <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', width: '175px', height: '60px', 
                    backgroundColor: 'rgba(200, 30, 60, 0.4)', borderRadius: '5px', border: '1px solid red', position: 'absolute', right: '30px', 
                    }}>
                    
                    </Box>
                } */}
                </Box>
                
            </Box>
            
        </>
    )
}

export default function MaintenancePage({}) {
    const [admin, setAdmin] = useState(false)
    const [loginPage, setLoginPage] = useState(false)

    useEffect(() => {
        backendReqFunc(setAdmin)
    }, [])

    return (
        <>
        {admin ? <Router/> : 
        <Box sx={{
            height: '100vh', width: '100vw', 
            backgroundImage: `url(https://res.cloudinary.com/duaf1qylo/image/upload/s--BndO4tEA--/o_31/v1715457371/misc/ballswallpaper.png)`,
            }}
        >
            <Box sx={{display: 'flex', flexDirection: 'column', padding: 5, gap: 2, alignItems: 'center', height: '50vh', position: 'relative'}}>
                <Typography sx={{fontSize: '20px', fontWeight: 700, textAlign: 'center', opacity: 1}}>
                    The site is currently undergoing scheduled maintenance
                </Typography>
                <Typography sx={{fontSize: '16px', textAlign: 'center', opacity: 1}}>
                    Please come back later!
                </Typography>
                {/* <Box sx={{width: '100%'}}>
                <img style={{position: 'absolute', height: '50vh', width: '50vw', top: '0px'}} 
                src='https://res.cloudinary.com/duaf1qylo/image/upload/v1709852343/cards/aprimon_card.png'/>
                </Box> */}
                
            </Box>
            {loginPage && 
                <MaintenanceLoginComponent/>
            }
            <Button sx={{position: 'absolute', bottom: '0px', right: '0px'}} onClick={() => setLoginPage(!loginPage)}>
                Administrator Log-In
            </Button>
        </Box>
        }
        </>
    )
}