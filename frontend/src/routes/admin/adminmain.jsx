import {Box, Typography, useTheme, Button} from '@mui/material'
import { useContext } from 'react'
import BodyWrapper from '../../components/partials/routepartials/bodywrapper'
import ConfirmDecisionModal from '../../components/functionalcomponents/confirmdecisionmodal'
import { AlertsContext } from '../../alerts/alerts-context'
import { ErrorContext } from '../../app/contexts/errorcontext'
import { useNavigate } from 'react-router'
import updateHomeCollectionsBackendRequest from '../../../utils/functions/backendrequests/api/updateHomeCollections'
import { useState } from 'react'

export default function AdminMain({}) {
    const theme = useTheme()
    const navigate = useNavigate()
    const [modal, setModal] = useState(false)
    const [doingRequest, setDoingRequest] = useState(false)
    const {addAlert} = useContext(AlertsContext)
    const {handleError} = useContext(ErrorContext)

    const toggleModal = () => setModal(!modal)

    const updateHomeCollections = () => {
        setDoingRequest(true)
        const backendRequest = async() => await updateHomeCollectionsBackendRequest()
        const successFunc = () => {
            setDoingRequest(false)
            const alertsInfo = {message: 'Updated all Home Collections!' , severity: 'success', timeout: 5}
            addAlert(alertsInfo)
        }
        handleError(backendRequest, false, successFunc, () => {setDoingRequest(false)}) 
    }

    return (
        <BodyWrapper sx={{...theme.components.box.fullCenterCol, justifyContent: 'start'}}>
            <Typography sx={{fontSize: '32px', mb: 4}}>Admin Functions</Typography>
            <Box sx={{...theme.components.box.fullCenterCol, gap: 1}}>
                <Button size='large' variant='contained' onClick={() => navigate('/admin/table-data')}>Change Collection Table Data</Button>
                <Button size='large' variant='contained' onClick={() => navigate('/admin/send-notifications')}>Send Notifications</Button>
                <Button size='large' variant='contained' onClick={() => navigate('/admin/make-announcements')}>Make Announcement</Button>
                <Button size='large' variant='contained' onClick={toggleModal}>Update Home Collections</Button>
            </Box>
            <ConfirmDecisionModal text={'Are you sure you want to update home collections?'} open={modal} toggleModal={toggleModal} confirmDecisionFunc={updateHomeCollections}/>
        </BodyWrapper>
    )
}