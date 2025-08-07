import {Box, Typography, Button, CircularProgress, Modal, Fade, Backdrop, useTheme} from '@mui/material'
import modalStyles from '../../../../utils/styles/componentstyles/modalstyles'
import { useState, useContext } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { resetChanges } from '../../../app/slices/editmode'
import { ErrorContext } from '../../../app/contexts/errorcontext'
import { AlertsContext } from '../../../alerts/alerts-context'
import { changeList, toggleSaveChangesConfirmModal } from '../../../app/slices/editmode'
import { usePutRequest } from '../../../../utils/functions/backendrequests/editcollection'
import SmallWidthModalWrapper from '../../partials/wrappers/smallwidthmodalwrapper'
import store from '../../../app/store'
import { switchLinkedCollections } from '../linkedcollectionselection'
import { useNavigate } from 'react-router'
import { selectAnyUnsavedOnhandChanges, selectUnsavedChanges } from '../../../app/selectors/selectors'

export default function TitleSaveChangesController({leaveEditMode, mainID, collectionID, anyUnsavedChanges, smallScreen, startTransition, link}) {
    const theme = useTheme()
    const {handleError} = useContext(ErrorContext)
    const {addAlert} = useContext(AlertsContext)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [unsavedChangesNoti, setUnsavedChangesNoti] = useState({saving: false})
    const unsavedChangesFull = useSelector((state) => state.editmode.changes)
    const unsavedChanges = useSelector((state) => selectUnsavedChanges(state))
    const unsavedOnhandChanges = useSelector((state) => selectAnyUnsavedOnhandChanges(state))
    const doOnhandNotice = typeof unsavedOnhandChanges === 'string' && unsavedOnhandChanges.slice(0, unsavedChanges.indexOf('-')) === 'linkedOnhandNotice'
    const onhandNoticeIdx = typeof unsavedOnhandChanges === 'string' && parseInt(unsavedOnhandChanges.slice(unsavedChanges.indexOf('-')+1))
    const saveChangesConfirmModal = useSelector((state) => state.editmode.saveChangesConfirmModal)
    

    const saveCollectionEdits = (exitAfter=false) => {
        //do not compare collection laoder data and collection state, since scope/ball scope/excluded combos update does NOT revalidate to update the loader data.
        //if you do compare, and the user changes the scope before changing, those scope changes wont be reflected in the laoder data.
        // const currCollectionState = store.getState().collectionState
        // const linkedSelectedIdx = currCollectionState.linkedSelectedIdx
        // const subListId = linkedSelectedIdx !== 0 ? currCollectionState.linkedCollections[linkedSelectedIdx]._id : undefined
        // const collectionState = currCollectionState.collection
        // const onhandState = currCollectionState.onhand
        // const newOwnedPokemonArr = unsavedChanges ? JSON.parse(JSON.stringify(collectionState)).map(p => {
        //     delete p.imgLink
        //     delete p.possibleGender
        //     return p
        // }) : undefined
        // const newOnhandList = unsavedOnhandChanges ? JSON.parse(JSON.stringify(onhandState)).map(p => {
        //     delete p.imgLink
        //     return p
        // }) : undefined
        setUnsavedChangesNoti({saving: true})
        const backendFunc = async() => await usePutRequest(unsavedChangesFull.unsavedChanges, unsavedChangesFull.unsavedOnhandChanges, mainID, Object.keys(unsavedChangesFull.unsavedOnhandChanges))
        const successFunc = () => {
            addAlert({severity: 'success', timeout: 5, message: 'Successfully saved the changes to your collection!'})
            setUnsavedChangesNoti({saving: false})
            if (exitAfter) {
                if (doOnhandNotice) {switchLinkedCollections(navigate, dispatch, startTransition, collectionID, onhandNoticeIdx, undefined, link, false, changeList, toggleSaveChangesConfirmModal)}
                else {leaveEditMode()}
            }
            else {dispatch(resetChanges())}
        }
        const errorFunc = () => {
            if (exitAfter) {
                dispatch(toggleSaveChangesConfirmModal())
            }
            setUnsavedChangesNoti({saving: false})
        }
        handleError(backendFunc, false, successFunc, errorFunc)
    }

    return (
        anyUnsavedChanges ? smallScreen ?
        <SmallWidthModalWrapper 
            ariaLabel='unsaved changes confirm'
            ariaDescribe='confirm whether to leave edit mode when you have unsaved changes'
            open={saveChangesConfirmModal}
            handleClose={() => dispatch(toggleSaveChangesConfirmModal())}
            sx={{height: '50%', width: '100%'}}
            buttonSx={{zIndex: 1}}
        >
            <Box sx={{...theme.components.box.fullCenterCol, backgroundColor: theme.palette.color1.dark, borderRadius: '10px', width: '95%', height: '95%', position: 'relative', justifyContent: 'start', color: 'white'}}>
                <Typography sx={{fontSize: '24px', fontWeight: 700, mt: 10, textAlign: 'center'}}>Wait! You have unsaved {doOnhandNotice ? 'on-hand' : ''} changes!</Typography>
                <Typography sx={{fontSize: '16px', mt: 5, textAlign: 'center'}}>Are you sure you want to {doOnhandNotice ? 'switch collections' : 'exit edit mode'}?</Typography>
                <Box sx={{...theme.components.box.fullCenterRow, width: '90%', height: '50px', position: 'absolute', bottom: '30px', gap: 4}}>
                    <Button 
                        variant='contained' 
                        size='small' 
                        sx={{fontSize: '9px', padding: 0.5}} 
                        disabled={unsavedChangesNoti.saving} 
                        onClick={doOnhandNotice ? 
                            switchLinkedCollections(navigate, dispatch, startTransition, collectionID, onhandNoticeIdx, undefined, link, false, changeList, toggleSaveChangesConfirmModal) : 
                            leaveEditMode
                        }
                    >
                        {doOnhandNotice ? 'Switch' : 'Exit'} without saving
                    </Button>
                    <Button variant='contained' size='large' sx={{fontSize: '14px'}} disabled={unsavedChangesNoti.saving} onClick={() => saveCollectionEdits(true)}>
                        {unsavedChangesNoti.saving ? 
                            <CircularProgress
                                size='26.25px'
                                sx={{color: 'white'}}
                            />  :
                            `Save and ${doOnhandNotice ? 'Switch' : 'Exit'}`
                        }
                    </Button>
                    <Button variant='contained' size='medium' sx={{}} disabled={unsavedChangesNoti.saving} onClick={() => dispatch(toggleSaveChangesConfirmModal())}>Cancel</Button>
                </Box>
                
            </Box>
        </SmallWidthModalWrapper> : 
        <Modal
            aria-labelledby='save-confirm'
            aria-describedby="confirm the changes to your collection"
            open={saveChangesConfirmModal}
            onClose={() => dispatch(toggleSaveChangesConfirmModal())}
            closeAfterTransition
            slots={{backdrop: Backdrop}}
            slotProps={{
                backdrop: {
                    timeout: 500
                }
            }}
        >
            <Fade in={saveChangesConfirmModal}>
                <Box sx={{...modalStyles.onhand.modalContainer, height: '400px', width: '70%', maxWidth: '800px', display: 'flex', alignItems: 'center'}}>
                    <Box sx={{...modalStyles.onhand.modalElementBg, height: '95%', width: '95%', ...theme.components.box.fullCenterCol}}>
                        <Typography sx={{fontSize: '24px', textAlign: 'center'}}>Wait! You have unsaved {doOnhandNotice ? 'on-hand' : ''} changes!</Typography>
                        <Typography sx={{mt: 1, textAlign: 'center'}}>
                            Are you sure you want to {doOnhandNotice ? 'switch collections' : 'exit'}?
                        </Typography>
                        <Box sx={{...theme.components.box.fullCenterRow, gap: 5, mt: 5}}>
                            <Button 
                                variant='contained' 
                                size='large' 
                                onClick={doOnhandNotice ? 
                                    switchLinkedCollections(navigate, dispatch, startTransition, collectionID, onhandNoticeIdx, undefined, link, false, changeList, toggleSaveChangesConfirmModal) : 
                                    leaveEditMode
                                } 
                                sx={{'&.Mui-disabled': {color: 'rgba(255, 255, 255, 0.5)'}}} 
                                disabled={unsavedChangesNoti.saving}
                            >
                                {doOnhandNotice ? 'Switch' : 'Exit'} without saving
                            </Button>
                            <Button 
                                variant='contained' 
                                size='large' 
                                onClick={() => saveCollectionEdits(true)} 
                                sx={{'&.Mui-disabled': {color: 'rgba(255, 255, 255, 0.5)'}}} 
                                disabled={unsavedChangesNoti.saving}
                            >
                                {unsavedChangesNoti.saving ? 
                                    <CircularProgress
                                        size='26.25px'
                                        sx={{color: 'white'}}
                                    />  :
                                    `Save and ${doOnhandNotice ? 'Switch' : 'Exit'}`
                                }
                            </Button>
                            <Button variant='contained' size='large' onClick={() => dispatch(toggleSaveChangesConfirmModal())} sx={{'&.Mui-disabled': {color: 'rgba(255, 255, 255, 0.5)'}}} disabled={unsavedChangesNoti.saving}>Cancel</Button>
                        </Box>
                    </Box>
                </Box>
            </Fade>
        </Modal> : 
        <></>
    )
}