import {Box, Typography, useTheme, Button, Checkbox, TextField, ToggleButton, ToggleButtonGroup, Select, MenuItem, Modal, Fade} from '@mui/material'
import BodyWrapper from '../../components/partials/routepartials/bodywrapper'
import { useState, useRef, useContext } from 'react'
import { AlertsContext } from '../../alerts/alerts-context'
import { ErrorContext } from '../../app/contexts/errorcontext'
import {Editor} from 'primereact/editor'
import Quill from 'quill'
import hexToRgba from 'hex-to-rgba'
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouteLoaderData } from 'react-router'
import AnnouncementBlock from '../../components/functionalcomponents/admin/announcements/announcementblock'
import RichTextEditor from '../../components/functionalcomponents/textinput/richtexteditor'
import { useSelector } from 'react-redux'
import { selectScreenBreakpoint } from '../../app/selectors/windowsizeselectors'
import NotificationBlock from '../../components/functionalcomponents/admin/notifications/notificationblock'
import createNewAnnouncement from '../../../utils/functions/backendrequests/api/announcements/createnewannouncement'
import DotWaitingText from '../../components/functionalcomponents/dotwaitingtext'
import TimeoutButton from '../../components/functionalcomponents/timeoutbutton'
import ConfirmDecisionModal from '../../components/functionalcomponents/confirmdecisionmodal'

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function MakeAnnouncements({}) {
    const theme = useTheme()
    const updates = useRouteLoaderData('makeAnnouncement').updateSeries
    const updateSerieses = updates.map(up => up.name)
    const {handleError} = useContext(ErrorContext)
    const {addAlert} = useContext(AlertsContext)
    const sizeBkpt = useSelector((state) => selectScreenBreakpoint(state, 'announcementEditor'))
    
    const tBStyles = {...theme.components.toggleButton.dark.buttons, '&.MuiButtonBase-root': {fontSize: '12px'}}
    const tBGroupStyles = {...theme.components.toggleButton.dark.group}

    const [stateData, setStateData] = useState({
        title: '', 
        updateType: 'new',
        updateTitleSeries: '', 
        setCurrentTitleAsNewUpdateSeries: false,
        body: '', 
        buttons: [], 
        type: 'site update', 
        noNotification: false,
        preview: false,
        editNotification: false,
        notificationBody: '',
        currentlyCreating: false,
        confirmationModal: false
    })

    const systemUpdate = stateData.type === 'system'
    const isUpdateSeries = stateData.type === 'site update' && stateData.updateType === 'series'

    const updateNum = isUpdateSeries && stateData.updateTitleSeries !== '' ? updates.filter(up => up.name === stateData.updateTitleSeries)[0].num+1 : 0

    const addButton = (pos) => {
        const newButton = {
            position: pos,
            label: '',
            link: ''
        }
        setStateData({...stateData, buttons: [...stateData.buttons, newButton]})
    }

    const finalizeAnnouncement = () => {
        if (stateData.body === '' || (!isUpdateSeries && stateData.title === '') || (isUpdateSeries && stateData.updateTitleSeries === '')) {
            addAlert({message: 'You need to have a title/choose a series/have a body!', severity: 'error', timeout: 3})
            setStateData({...stateData, confirmationModal: false})
        } else if (!stateData.noNotification && stateData.notificationBody === '') {
            addAlert({message: 'You need to have a body for the notification!', severity: 'error', timeout: 3})
            setStateData({...stateData, confirmationModal: false})
        } else {
            const finalTitle = isUpdateSeries ? `${stateData.updateTitleSeries} #${updateNum}` : stateData.setCurrentTitleAsNewUpdateSeries ? `${stateData.title} #1` : stateData.title
            const seriesData = {
                isSeries: isUpdateSeries,
                seriesName: isUpdateSeries ? stateData.updateTitleSeries : stateData.setCurrentTitleAsNewUpdateSeries && stateData.title,
                makeNewSeries: stateData.setCurrentTitleAsNewUpdateSeries
            }
            const notiData = {
                sendNotifications: !stateData.noNotification,
                notiTitle: finalTitle,
                notiBody: stateData.notificationBody
            }

            const successFunc = () => {
                addAlert({message: 'Successfully made a new announcement!', severity: 'success', timeout: 3})
                setStateData({
                    title: '', 
                    updateType: 'new',
                    updateTitleSeries: '', 
                    setCurrentTitleAsNewUpdateSeries: false,
                    body: '', 
                    buttons: [], 
                    type: 'site update', 
                    noNotification: false,
                    preview: false,
                    editNotification: false,
                    notificationBody: '',
                    currentlyCreating: false,
                    confirmationModal: false
                })
            }
            const errorFunc = () => {
                setStateData({...stateData, confirmationModal: false})
            }
            const backendFunc = async() => {return createNewAnnouncement(stateData.type, finalTitle, stateData.body, seriesData, stateData.buttons, notiData)}
            setStateData({...stateData, currentlyCreating: true})
            handleError(backendFunc, false, successFunc, errorFunc)
        }   
    }

    const bottomLeftButtonData = stateData.buttons.filter(b => b.position === 'bottom-left')[0]
    const bottomMidButtonData = stateData.buttons.filter(b => b.position === 'bottom-mid')[0]
    const bottomRightButtonData = stateData.buttons.filter(b => b.position === 'bottom-right')[0]

    const minWidthProp = sizeBkpt === 'sm' ? {} : {minWidth: '800px'}
    const currDate = new Date(Date.now())

    return (
        <BodyWrapper sx={{...theme.components.box.fullCenterCol, gap: 1, justifyContent: 'start'}}>
            <Box sx={{...theme.components.box.fullCenterCol, position: 'relative'}}>
            <Typography sx={{fontSize: '36px', fontWeight: 700, mb: 2}}>Make Announcement</Typography>
            <Typography sx={{my: 2}}>Make an announcement</Typography>
            <ToggleButtonGroup 
                sx={tBGroupStyles} 
                value={stateData.type} 
                onChange={(e, newVal) => setStateData({...stateData, type: newVal})} 
                exclusive
                size='small'
            >
                <ToggleButton sx={tBStyles} value='site update'>Update</ToggleButton>
                <ToggleButton sx={tBStyles} value='system'>System</ToggleButton>
            </ToggleButtonGroup>
            </Box>
            <Box sx={{...theme.components.box.fullCenterRow}}>
                <Box sx={{...theme.components.box.fullCenterCol}}>
                    <Box sx={{position: 'relative', ...theme.components.box.fullCenterRow, gap: 3, pointerEvents: isUpdateSeries ? 'none' : 'auto', opacity: isUpdateSeries ? 0.5 : 1}}>
                        <Typography>Title: </Typography>
                        <TextField 
                            onChange={(e) => setStateData({...stateData, title: e.target.value})} 
                            value={stateData.title}
                            sx={{'& .MuiInputBase-root': {height: '40px'}}}
                        /> 
                    </Box>
                    <Box sx={{...theme.components.box.fullCenterCol, gap: 1, pointerEvents: systemUpdate ? 'none' : 'auto', opacity: systemUpdate ? 0.5 : 1}}>
                        <ToggleButtonGroup sx={{...tBGroupStyles, mt: 1}} value={stateData.updateType} onChange={(e, newVal) => setStateData({...stateData, updateType: newVal})} exclusive>
                            <ToggleButton sx={tBStyles} value='new'>New Update</ToggleButton>
                            <ToggleButton sx={tBStyles} value='series'>Update Series</ToggleButton>
                        </ToggleButtonGroup>
                        {stateData.updateType === 'new' ? 
                        <>
                            <Box sx={{...theme.components.box.fullCenterRow, gap: 1}}>
                                <Typography>Set this update as a new series:</Typography>
                                <Checkbox value={stateData.setCurrentTitleAsNewUpdateSeries} onChange={() => setStateData({...stateData, setCurrentTitleAsNewUpdateSeries: !stateData.setCurrentTitleAsNewUpdateSeries})}/>
                            </Box>
                            <Typography sx={{fontSize: '11px'}}>This will set the current title as a new series</Typography>
                        </> : 
                            <Box sx={{...theme.components.box.fullCenterRow, gap: 1}}>
                                <Typography>Select an Update Series:</Typography>
                                <Select 
                                    value={stateData.updateTitleSeries} 
                                    onChange={(e, comp) => setStateData({...stateData, updateTitleSeries: comp.props.value})}
                                    sx={{'&.MuiInputBase-root': {height: '40px', minWidth: '150px'}, '& .MuiInputBase-input': {paddingY: 0}}}
                                >
                                    {updateSerieses.map(uS => {
                                        return (
                                            <MenuItem key={`update-series-${uS}-option`} value={uS}>{uS}</MenuItem>
                                        )
                                    })}
                                </Select>
                            </Box>
                        }
                    </Box>
                </Box>
            </Box>
            <Box sx={{height: '20px', ...theme.components.box.fullCenterCol, position: 'relative', width: '80%', my: 1}}>
                <Box sx={{width: '100%', ...theme.components.box.fullCenterRow}}>
                    <Button onClick={() => setStateData({...stateData, preview: !stateData.preview})}>See {stateData.preview ? 'Editor' : 'Preview'}</Button>
                    <Button onClick={() => setStateData({...stateData, editNotification: !stateData.editNotification})}>Edit {stateData.editNotification ? 'Announcement' : 'Notification'}</Button>
                </Box>
                <Box sx={{width: '100%', ...theme.components.box.fullCenterRow}}>
                    <Typography sx={{fontSize: '10px'}}>{stateData.preview ? 'Previewing ' : 'Editing '}{stateData.editNotification ? 'Notification' : 'Announcement'}</Typography>
                </Box>
                
            </Box>
            {stateData.preview ? 
            stateData.editNotification ? 
            <NotificationBlock 
                notification={{
                    message: stateData.notificationBody, 
                    title: isUpdateSeries ? `${stateData.updateTitleSeries} #${updateNum}` : stateData.title, 
                    type: 'site update'
                }}
            /> : 
            <AnnouncementBlock 
                title={isUpdateSeries ? `${stateData.updateTitleSeries} #${updateNum}` : stateData.title}
                body={stateData.body}
                buttons={stateData.buttons}
                timestamp={`${months[currDate.getMonth()]} ${currDate.getDate()}, ${currDate.getFullYear()}`}
                isPreview={true}
            /> : 
            <Box sx={{width: '100%', ...theme.components.box.fullCenterRow, position: 'relative'}}>
                
                <RichTextEditor 
                    value={stateData.editNotification ? stateData.notificationBody : stateData.body}
                    isAdminEditor={true}
                    sx={{backgroundColor: hexToRgba(theme.palette.color1.main, 0.9), color: 'white', ...minWidthProp}}
                    onChange={(e) => {
                        if (stateData.editNotification) {
                            setStateData({...stateData, notificationBody: e.htmlValue})
                        }
                        else {setStateData({...stateData, body: e.htmlValue})}
                    }}
                    
                />
            </Box>
            }
            <Box sx={{...theme.components.box.fullCenterRow, width: '80%', minWidth: '650px', opacity: stateData.editNotification ? 0.5 : 1, pointerEvents: stateData.editNotification ? 'none' : 'auto'}}>
                <Box sx={{...theme.components.box.fullCenterCol, width: '33%', height: '100%'}}>
                    <Typography sx={{fontWeight: 700}}>Bottom Left Buttons:</Typography>
                    {bottomLeftButtonData === undefined ? 
                    <Button sx={{width: '90%', height: '60px', borderStyle: 'dashed'}} variant='outlined' onClick={() => addButton('bottom-left')}><ControlPointIcon/></Button> : 
                    <Box sx={{width: '90%', height: '60px', ...theme.components.box.fullCenterCol, position: 'relative', borderRadius: '10px', border: `1px solid ${theme.palette.color1.main}`, backgroundColor: hexToRgba(theme.palette.color3.main, 0.75)}}>
                        <Box sx={{...theme.components.box.fullCenterRow, height: '50%', gap: 1}}>
                            <Typography sx={{fontSize: '11px'}}>Label:</Typography>
                            <TextField 
                                onChange={(e) => setStateData({...stateData, buttons: stateData.buttons.map(b => b.position === 'bottom-left' ? {...b, label: e.target.value} : b)})} 
                                value={bottomLeftButtonData.label}
                                sx={{'& .MuiInputBase-root': {height: '20px'}}}
                            />
                        </Box>
                        <Box sx={{...theme.components.box.fullCenterRow, height: '50%', gap: 1}}>
                            <Typography sx={{fontSize: '11px'}}>Links to:</Typography>
                            <TextField 
                                onChange={(e) => setStateData({...stateData, buttons: stateData.buttons.map(b => b.position === 'bottom-left' ? {...b, link: e.target.value} : b)})} 
                                value={bottomLeftButtonData.link}
                                sx={{'& .MuiInputBase-root': {height: '20px'}}}
                            />
                        </Box>
                        <Button sx={{position: 'absolute', right: '0px', top: '0px', fontSize: '14px', padding: 0}} onClick={() => setStateData({...stateData, buttons: stateData.buttons.filter(b => b.position !== 'bottom-left')})}>
                            <DeleteIcon/>
                        </Button>
                    </Box>
                    }
                </Box>
                <Box sx={{...theme.components.box.fullCenterCol, width: '33%', height: '100%'}}>
                    <Typography sx={{fontWeight: 700}}>Bottom Mid Buttons:</Typography>
                    {bottomMidButtonData === undefined ? 
                    <Button sx={{width: '90%', height: '60px', borderStyle: 'dashed'}} variant='outlined' onClick={() => addButton('bottom-mid')}><ControlPointIcon/></Button> : 
                    <Box sx={{width: '90%', height: '60px', ...theme.components.box.fullCenterCol, position: 'relative', borderRadius: '10px', border: `1px solid ${theme.palette.color1.main}`, backgroundColor: hexToRgba(theme.palette.color3.main, 0.75)}}>
                        <Box sx={{...theme.components.box.fullCenterRow, height: '50%', gap: 1}}>
                            <Typography sx={{fontSize: '11px'}}>Label:</Typography>
                            <TextField 
                                onChange={(e) => setStateData({...stateData, buttons: stateData.buttons.map(b => b.position === 'bottom-mid' ? {...b, label: e.target.value} : b)})} 
                                value={bottomMidButtonData.label}
                                sx={{'& .MuiInputBase-root': {height: '20px'}}}
                            />
                        </Box>
                        <Box sx={{...theme.components.box.fullCenterRow, height: '50%', gap: 1}}>
                            <Typography sx={{fontSize: '11px'}}>Links to:</Typography>
                            <TextField 
                                onChange={(e) => setStateData({...stateData, buttons: stateData.buttons.map(b => b.position === 'bottom-mid' ? {...b, link: e.target.value} : b)})} 
                                value={bottomMidButtonData.link}
                                sx={{'& .MuiInputBase-root': {height: '20px'}}}
                            />
                        </Box>
                        <Button sx={{position: 'absolute', right: '0px', top: '0px', fontSize: '14px', padding: 0}} onClick={() => setStateData({...stateData, buttons: stateData.buttons.filter(b => b.position !== 'bottom-mid')})}>
                            <DeleteIcon/>
                        </Button>
                    </Box>
                    }
                </Box>
                <Box sx={{...theme.components.box.fullCenterCol, width: '33%', height: '100%'}}>
                    <Typography sx={{fontWeight: 700}}>Bottom Right Buttons:</Typography>
                    {bottomRightButtonData === undefined ? 
                    <Button sx={{width: '90%', height: '60px', borderStyle: 'dashed'}} variant='outlined' onClick={() => addButton('bottom-right')}><ControlPointIcon/></Button> : 
                    <Box sx={{width: '90%', height: '60px', ...theme.components.box.fullCenterCol, position: 'relative', borderRadius: '10px', border: `1px solid ${theme.palette.color1.main}`, backgroundColor: hexToRgba(theme.palette.color3.main, 0.75)}}>
                        <Box sx={{...theme.components.box.fullCenterRow, height: '50%', gap: 1}}>
                            <Typography sx={{fontSize: '11px'}}>Label:</Typography>
                            <TextField 
                                onChange={(e) => setStateData({...stateData, buttons: stateData.buttons.map(b => b.position === 'bottom-right' ? {...b, label: e.target.value} : b)})} 
                                value={bottomRightButtonData.label}
                                sx={{'& .MuiInputBase-root': {height: '20px'}}}
                            />
                        </Box>
                        <Box sx={{...theme.components.box.fullCenterRow, height: '50%', gap: 1}}>
                            <Typography sx={{fontSize: '11px'}}>Links to:</Typography>
                            <TextField 
                                onChange={(e) => setStateData({...stateData, buttons: stateData.buttons.map(b => b.position === 'bottom-right' ? {...b, link: e.target.value} : b)})} 
                                value={bottomRightButtonData.link}
                                sx={{'& .MuiInputBase-root': {height: '20px'}}}
                            />
                        </Box>
                        <Button sx={{position: 'absolute', right: '0px', top: '0px', fontSize: '14px', padding: 0}} onClick={() => setStateData({...stateData, buttons: stateData.buttons.filter(b => b.position !== 'bottom-right')})}>
                            <DeleteIcon/>
                        </Button>
                    </Box>
                    }
                </Box>
                
            </Box>
            <Box sx={{...theme.components.box.fullCenterRow, gap: 1}}>
                <Typography>Disable Notifications For This Update:</Typography>
                <Checkbox value={stateData.noNotification} onChange={() => setStateData({...stateData, noNotification: !stateData.noNotification})}/>
            </Box>
            <Button variant='contained' onClick={() => setStateData({...stateData, confirmationModal: !stateData.confirmationModal})}>Send Announcement</Button>
            <ConfirmDecisionModal 
                text='Are you sure you want to send this announcement?'
                confirmDecisionFunc={() => finalizeAnnouncement()}
                toggleModal={() => setStateData({...stateData, confirmationModal: !stateData.confirmationModal})}
                open={stateData.confirmationModal}
                startingSecond={3}
                pendingText='Sending Announcement...'
            />
        </BodyWrapper>
    )
}