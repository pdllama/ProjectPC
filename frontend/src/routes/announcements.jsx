import {Box, Typography, Button, useTheme, LinearProgress} from '@mui/material'
import InfoWrapper from './infopages/infowrapper'
import { useLoaderData, useNavigate } from 'react-router'
import { ErrorContext } from '../app/contexts/errorcontext'
import { useState, useContext, useEffect } from 'react'
import hexToRgba from 'hex-to-rgba'
import AnnouncementBlock from '../components/functionalcomponents/admin/announcements/announcementblock'
import getAnnouncementsFromBackend from '../../utils/functions/backendrequests/api/announcements/getannouncements'
import DotWaitingText from '../components/functionalcomponents/dotwaitingtext'

const maxDocs = 10

export default function Announcements({}) {
    const theme = useTheme()
    const navigate = useNavigate()
    const {handleError} = useContext(ErrorContext)
    const [aStates, setAStates] = useState({announcements: [], gettingAnnouncements: true, allAnnouncementsReached: false, error: false, errorData: {}})

    useEffect(() => {
        const backendFunc = async() => {return getAnnouncementsFromBackend(false, 0)}
        const successFunc = (announcements) => {
            setAStates({
                announcements: [...aStates.announcements, ...announcements],
                gettingAnnouncements: false,
                allAnnouncementsReached: announcements.length < maxDocs,
                error: false, errorData: {}
            })
        }
        const errorFunc = (errorData) => {setAStates({...aStates, gettingAnnouncements: false, error: true, errorData})}
        handleError(backendFunc, false, successFunc, errorFunc)
        
    }, [])

    const getMoreAnnouncements = () => {
        const backendFunc = async() => {return getAnnouncementsFromBackend(false, aStates.announcements.length)}
        const successFunc = (announcements) => {
            setAStates({
                announcements: [...aStates.announcements, ...announcements],
                gettingAnnouncements: false,
                allAnnouncementsReached: announcements.length < maxDocs,
                error: false, errorData: {}
            })
        }
        const errorFunc = (errorData) => {setAStates({...aStates, gettingAnnouncements: false, error: true, errorData})}
        handleError(backendFunc, false, successFunc, errorFunc)
    }



    return (
        <InfoWrapper title='Announcements' wrapperSx={{...theme.components.box.fullCenterCol, justifyContent: 'start', mx: 0}} titleTextSx={{'@media only screen and (max-width: 380px)': {fontSize: '2.5em'}}}>
            {aStates.announcements.map((announcement) => {
                return (
                    <AnnouncementBlock 
                        key={announcement._id}
                        title={announcement.title}
                        body={announcement.body}
                        buttons={announcement.buttons}
                        timestamp={announcement.createdAt}
                    />
                )
            })}
            {aStates.gettingAnnouncements ? 
                <Box sx={{...theme.components.box.fullCenterCol, width: '100%', mb: 2}}>
                    <Box sx={{...theme.components.box.fullCenterCol, width: '100%', height: '100%', padding: 2, maxWidth: '800px', minHeight: '300px', position: 'relative', borderRadius: '10px'}}>
                        <Box sx={{...theme.components.box.fullCenterCol, height: '100%', width: '100%', gap: 2}}>
                            <Typography sx={{fontSize: '24px'}}><b><i>Getting announcements</i></b><DotWaitingText/></Typography>
                            <LinearProgress/>
                        </Box>
                    </Box>
                </Box> : 
            aStates.error ? 
                <Box sx={{...theme.components.box.fullCenterCol, width: '100%', mb: 2}}>
                    <Box sx={{...theme.components.box.fullCenterCol, width: '100%', height: '100%', padding: 2, maxWidth: '800px', minHeight: '300px', position: 'relative', border: `1px solid ${theme.palette.color2.dark}`, backgroundColor: hexToRgba(theme.palette.color2.main, 0.9), borderRadius: '10px'}}>
                        <Box sx={{...theme.components.box.fullCenterCol, height: '100%', width: '100%', gap: 8}}>
                            <Typography sx={{color: theme.palette.color2.contrastText, fontSize: '32px'}}><b><i>Failed to retrieve announcement data</i></b></Typography>
                            <Button variant='contained' size='large' sx={{fontSize: '24px'}} onClick={() => getMoreAnnouncements()}>Reload</Button>
                        </Box>
                    </Box>
                </Box> :
            aStates.allAnnouncementsReached ? <Typography sx={{color: 'grey', fontSize: '24px', mt: 20}}><i>No other announcements</i></Typography> : 
            <Button variant='contained' size='large' onClick={() => getMoreAnnouncements()} sx={{fontSize: '24px', mt: 20}}>Get More Announcements</Button>
            }
        </InfoWrapper>
    )
}