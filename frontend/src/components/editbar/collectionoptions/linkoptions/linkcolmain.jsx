import {Box, Button, Tab, Tabs, Typography, useTheme, Select, MenuItem, Modal, Fade, LinearProgress, CircularProgress, Backdrop} from '@mui/material'
import OptionsNav from '../components/optionsnav'
import { useDispatch, useSelector } from 'react-redux'
import { ErrorContext } from '../../../../app/contexts/errorcontext'
import { changeModalState } from '../../../../app/slices/editmode'
import hexToRgba from 'hex-to-rgba'
import { useEffect } from 'react'
import { capitalizeFirstLetter } from '../../../../../utils/functions/misc'
import LinkedColDisplay from './linkedcoldisplay/linkedcoldisplay'
import { useState, useContext } from 'react'
import { useRouteLoaderData, useNavigate, useRevalidator, useLocation } from 'react-router'
import SearchCollectionItem from '../../../functionalcomponents/search/searchcollectionitem'
import SimpleBar from 'simplebar-react'
import { Virtuoso } from 'react-virtuoso'
import SaveChangesConfirmModal from '../savechangesconfirmmodal'
import linkAndUnlinkCollections from '../../../../../utils/functions/backendrequests/collections/linkcollections'
import modalStyles from '../../../../../utils/styles/componentstyles/modalstyles'
import DotWaitingText from '../../../functionalcomponents/dotwaitingtext'
import { Link } from 'react-router-dom'
import { resetCollectionID } from '../../../../app/slices/collectionstate'
import { AlertsContext } from '../../../../alerts/alerts-context'

const scrollerStyles = {
    '&::-webkit-scrollbar': {
        width: '6px'
    },
    '&::-webkit-scrollbar-track': {
        boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'black',
        borderRadius: '5px'
    },
}



export default function LinkColMain({elementBg, collectionType='aprimon', collectionGen, collectionId, demo, sw}) {
    const theme = useTheme()
    const dispatch = useDispatch()
    const {handleError} = useContext(ErrorContext)
    const {addAlert} = useContext(AlertsContext)
    const userData = useRouteLoaderData('root').user
    const navigate = useNavigate()
    const location = useLocation()
    const currColName = useSelector((state) => state.collectionState.options.collectionName)
    const allOtherLinkableCollections = userData.collections.filter(col => (col.type !== collectionType || col.gen !== collectionGen) && (col.gen !== '6' && col.gen !== '7' && col.gen !== 'dummy'))

    const menuStyles = {backgroundColor: hexToRgba(theme.palette.color1.darker, 0.99), color: theme.palette.color3.main, '&.Mui-selected': {backgroundColor: hexToRgba(theme.palette.color3.main, 0.5), ':hover': {backgroundColor: hexToRgba(theme.palette.color3.main, 0.25)}}, ':hover': {backgroundColor: hexToRgba(theme.palette.color1.main, 0.75)}} 

    const linkedCollections = useSelector((state) => state.collectionState.linkedCollections)
    const linkedColsAdjusted = linkedCollections ? linkedCollections.map((lC) => {return lC.gen === 'dummy' ? undefined : {_id: lC._id, type: lC.type, name: lC.name, gen: lC.gen, linkedTo: lC.linkedTo}}).filter(c => c !== undefined) : []
    const [tentativeLinks, setTentativeLinks] = useState({col: '', unlink: false})
    const [otherStateData, setOtherStateData] = useState({saveChangesOpen: false, saveErrorNotice: false, saving: false, error: false, errorData: {}, redirectLink: '', countdown: 5})

    const currentTentativeLinkColData = tentativeLinks.col !== '' ? allOtherLinkableCollections.filter(c => c._id === tentativeLinks.col)[0] : {}
    const allTentativeConnections = tentativeLinks.col === '' ? linkedColsAdjusted : tentativeLinks.unlink ? 
        (collectionGen !== 'home' || linkedColsAdjusted.length === 2) ? [] : linkedColsAdjusted.filter(c => c._id !== tentativeLinks.col) : 
        linkedColsAdjusted.length === 0 ? 
        //current collection, or filtered linkable collections based on 3 scenarios:
        // 1. 
        [{_id: collectionId, type: collectionType, gen: collectionGen, name: currColName}, ...allOtherLinkableCollections.filter(c => ((c._id === tentativeLinks.col) || (currentTentativeLinkColData.linkedTo && (c._id === currentTentativeLinkColData.linkedTo.super || c.linkedTo && c.linkedTo.super === currentTentativeLinkColData.linkedTo.super))) || (c.linkedTo && c.linkedTo.super === tentativeLinks.col))] : 
        [...linkedColsAdjusted, ...allOtherLinkableCollections.filter(c => (c._id === tentativeLinks.col) || (currentTentativeLinkColData.linkedTo && c._id === currentTentativeLinkColData.linkedTo.super) || (c.linkedTo && c.linkedTo.super === tentativeLinks.col))]

    // const linkedColsProp = [{_id: collectionId, type: collectionType, name: currColName, gen: collectionGen}, ...allTentativeConnections]
    const linkedCollectionsTest = [
        {_id: 'wfenuwfne', name: "Llama's Total Sheet", gen: 'home', type: 'aprimon'}, 
        {_id: 'ghuweuwefowef', name: "LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL", gen: '9', type: 'aprimon'},
        {_id: 'ghdsasdw', name: "SWSH Sheet", gen: 'swsh', type: 'aprimon'},
        {_id: 'ghuwdfsdwefasa d', name: "My BDSP Sheet", gen: 'bdsp', type: 'aprimon'},
        {_id: 'ghuwdfsdwefasa ddwqda dawedaw', name: "My New Sheet", gen: 'bdswdasda', type: 'aprimon'}
    ]


    const setConnections = (selectedColId, unlink) => {
        if (selectedColId === 'clear') {
            setTentativeLinks({col: '', unlink})
            return
        }
        const isLinkedCollection = allOtherLinkableCollections.filter(col => col._id === selectedColId)[0].linkedTo //if the collection is linked to other collections
        // if (isLinkedCollection && isLinkedCollection.super !== collectionId) {
        //     const colData = allOtherLinkableCollections.filter(col => col._id === isLinkedCollection.super)[0]._id
        //     setTentativeLinks({col: colData, unlink})
        // } else {
            const colData = allOtherLinkableCollections.filter(col => col._id === selectedColId)[0]._id
            setTentativeLinks({col: colData, unlink})
        // }
    }

    const linkableCollections = allOtherLinkableCollections.filter(c => !linkedColsAdjusted.some(c2 => c2._id === c._id))
    const collectionsYouCanUnlink = linkedColsAdjusted.filter(c => c._id !== collectionId)
   //collections they can unlink from (that they are already linked to) is linkedColsAdjusted

    // const newLinks = tentativeLinks.filter(col => linkedColsAdjusted.filter(col2 => col2._id === col._id).length === 0)
    // const newUnlinks = linkedColsAdjusted.filter(col => tentativeLinks.filter(col2 => col2._id === col._id).length === 0)

    const saveChanges = () => {
        const changesMade = tentativeLinks.col !== ''
        if (!changesMade) {
            setOtherStateData({...otherStateData, saveErrorNotice: true})
            setTimeout(() => {
                setOtherStateData({...otherStateData, saveErrorNotice: false})
            }, 3000)
        } else {
            setOtherStateData({...otherStateData, saveChangesOpen: true})
        }
    }

    const totalNewLinkChanges = currentTentativeLinkColData.gen === 'home' ? allOtherLinkableCollections.filter(c => c._id === tentativeLinks.col || (c.linkedTo && c.linkedTo.super === tentativeLinks.col)) : 
        currentTentativeLinkColData.linkedTo ? allOtherLinkableCollections.filter(c => c._id === tentativeLinks.col || c.linkedTo && currentTentativeLinkColData.linkedTo.super === c.linkedTo.super || c._id === currentTentativeLinkColData.linkedTo.super) : 
        currentTentativeLinkColData

    const finalizeChanges = () => {
        setOtherStateData({...otherStateData, saving: true})
        //below always needs to be the central collection (HOME only - dummy collection centrals are handled separately) preferably. so if totalNewLinkChanges contains a 
        //HOME collection (unlinking or linking), then we want to use that one instead of the tentativeLinks.col
        const trueLinkColData = currentTentativeLinkColData.linkedTo && totalNewLinkChanges.filter(c => c.gen === 'home').length !== 0 ? totalNewLinkChanges.filter(c => c.gen === 'home')[0]._id : tentativeLinks.col
        const backendRequest = async() => await linkAndUnlinkCollections(collectionId, trueLinkColData, tentativeLinks.unlink)
        const errorFunc = (errorData) => {
            setOtherStateData({...otherStateData, error: true, errorData, saving: false})
        }
        const successFunc = (redirectLink) => {
            dispatch(resetCollectionID())
            
            
            
            setOtherStateData({...otherStateData, redirectLink, saving: false})
        }

        handleError(backendRequest, false, successFunc, errorFunc)
    }

    const changeScreen = () => {dispatch(changeModalState({screen: 'main'}))}

    const manuallyRedirect = () => {
        setOtherStateData({...otherStateData, countdown: 0})
    }
    
    useEffect(() => {
        if (otherStateData.redirectLink) {
            if (otherStateData.countdown === 0) {  
                dispatch(changeModalState({open: false, screen: 'main', resetSelected: true}))
                addAlert({severity: 'success', message: `Successfully ${tentativeLinks.unlink ? 'un' : ''}linked collections!`, timeout: 5})
                const currLink = `${location.pathname}${location.search ? location.search : ''}`
                navigate(currLink === otherStateData.redirectLink ? 0 : otherStateData.redirectLink)
            } else {
                setTimeout(() => {
                    setOtherStateData({...otherStateData, countdown: otherStateData.countdown-1})
                }, 1000)
            }
        }
    }, [otherStateData.redirectLink, otherStateData.countdown])

    

    return (
        <>
        <OptionsNav elementBg={elementBg} sw={sw} stage={2} optionFuncs={{option1: {label: 'Collection Options', onClick: changeScreen}, option2: {label: 'Collection Linking'}}}/>
        <Box sx={{...elementBg, width: '95%', height: sw ? '85%' : '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', py: 2}}>
            <LinkedColDisplay collectionGen={collectionGen} collectionType={collectionType} linkedCollections={allTentativeConnections} sw={sw} wrapperSx={{minHeight: '300px'}}/>
            <Box sx={{height: '50%', width: '95%', ...theme.components.box.fullCenterCol, justifyContent: 'start', mt: 1}}>
                <Box sx={{...theme.components.box.fullCenterCol, height: '60%', width: '100%'}}>
                    
                    <>
                    <Typography sx={{fontSize: sw ? '24px' : '20px', fontWeight: 700, mt: sw ? 0 : 1}}>
                        Link your Collections
                    </Typography>
                    <Typography sx={{fontSize: '12px', my: sw ? 0 : -0.5}}>
                        Select a collection to link or unlink it.
                    </Typography>
                    <Typography sx={{fontSize: '12px', textAlign: 'center'}}>
                        You can either link or unlink collections at a time, but not both.
                    </Typography>
                    <Box sx={{...theme.components.box.fullCenterRow, width: '90%', gap: 1, pointerEvents: (tentativeLinks.col && tentativeLinks.unlink) ? 'none' : 'auto', opacity: (tentativeLinks.col && tentativeLinks.unlink) ? 0.5 : 1}}>
                        <Typography sx={{width: '30%', textAlign: 'center'}}>Link Collection:</Typography>
                        <Select 
                            value={(tentativeLinks.col === '' || (tentativeLinks.col && tentativeLinks.unlink)) ? '' : tentativeLinks.col} 
                            onChange={(e, menuItem) => setConnections(menuItem.props.value, false)}
                            sx={{width: '70%', height: '80%', '&.MuiInputBase-root': {border: '1px solid white', color: 'white'}}} 
                            MenuProps={{MenuListProps: {sx: {maxHeight: '200px', overflowY: 'scroll', py: 0, ...scrollerStyles, backgroundColor: theme.palette.color1.dark}}}}
                        >
                            {linkableCollections.map((lC) => {
                                const colDisplay = !isNaN(parseInt(lC.gen)) ? `Gen ${lC.gen} ${capitalizeFirstLetter(lC.type)} Collection` : `${lC.gen.toUpperCase()} ${capitalizeFirstLetter(lC.type)} Collection`
                                const linkedColsNums = lC.gen === 'home' ? allOtherLinkableCollections.filter(c => !c.linkedTo ? false : c.linkedTo.super === lC._id).length : lC.linkedTo ? allOtherLinkableCollections.filter(c => ((c.linkedTo && c._id !== lC._id) && c.linkedTo.super === lC.linkedTo.super) || (!lC.linkedTo.dummyCollection && c._id === lC.linkedTo.super)).length : 0
                                return (
                                    <MenuItem
                                        key={`${lC._id}-linkable-button`}
                                        value={lC._id}
                                        sx={{...menuStyles, fontSize: '12px', ...theme.components.box.fullCenterRow, justifyContent: 'start'}}
                                    >
                                        <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', gap: -0.5, height: '55px', border: '1px solid white', borderRadius: '5px', padding: '5px', backgroundColor: theme.palette.color1.main, overflowX: 'hidden'}}>
                                            <Typography sx={{width: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whitespace: 'nowrap', '@media only screen and (min-width: 500px)': {width: '450px'}}}>
                                                {lC.name}
                                                </Typography>
                                            <Typography sx={{fontSize: '12px'}}>{colDisplay}</Typography>
                                            {linkedColsNums > 0 && <Typography sx={{fontSize: '10px'}}>Linked to {linkedColsNums} other collection{linkedColsNums === 1 ? '' : 's'}</Typography>}
                                        </Box>
                                    </MenuItem>
                                )
                            })}
                            <MenuItem value='clear' sx={{...menuStyles, fontSize: '12px', ...theme.components.box.fullCenterRow, justifyContent: 'start', color: 'grey'}}><i>Clear Selection</i></MenuItem>
                        </Select>
                    </Box>
                    <Box sx={{...theme.components.box.fullCenterRow, width: '90%', gap: 1, pointerEvents: (tentativeLinks.col && !tentativeLinks.unlink) ? 'none' : 'auto', opacity: (tentativeLinks.col && !tentativeLinks.unlink) ? 0.5 : 1}}>
                        <Typography sx={{width: '30%', textAlign: 'center'}}>Unlink Collection:</Typography>
                        <Select 
                            defaultValue=''
                            value={(tentativeLinks.col === '' || (tentativeLinks.col && !tentativeLinks.unlink)) ? '' : tentativeLinks.col} 
                            onChange={(e, menuItem) => setConnections(menuItem.props.value, true)}
                            sx={{width: '70%', height: '80%', '&.MuiInputBase-root': {border: '1px solid white', color: 'white'}}} 
                            MenuProps={{MenuListProps: {sx: {maxHeight: '200px', overflowY: 'scroll', py: 0, ...scrollerStyles, backgroundColor: theme.palette.color1.dark}}}}
                        >
                            {collectionsYouCanUnlink.map((lC) => {
                                const colDisplay = !isNaN(parseInt(lC.gen)) ? `Gen ${lC.gen} ${capitalizeFirstLetter(lC.type)} Collection` : `${lC.gen.toUpperCase()} ${capitalizeFirstLetter(lC.type)} Collection`
                                const linkedColsNums = lC.gen === 'home' ? allOtherLinkableCollections.filter(c => c.linkedTo && c.linkedTo.super === lC._id).length : lC.linkedTo ? allOtherLinkableCollections.filter(c => c._id !== lC._id && (c.linkedTo && c.linkedTo.super === lC.linkedTo.super || (!lC.linkedTo.dummyCollection && c._id === lC.linkedTo.super))).length : 0
                                return (
                                    <MenuItem
                                        key={`${lC._id}-linkable-button`}
                                        value={lC._id}
                                        sx={{...menuStyles, fontSize: '12px', ...theme.components.box.fullCenterRow, justifyContent: 'start'}}
                                    >
                                        <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', gap: -0.5, height: '55px', border: '1px solid white', borderRadius: '5px', padding: '5px', backgroundColor: theme.palette.color1.main, overflowX: 'hidden'}}>
                                            <Typography sx={{width: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whitespace: 'nowrap', '@media only screen and (min-width: 500px)': {width: '450px'}}}>
                                                {lC.name}
                                                </Typography>
                                            <Typography sx={{fontSize: '12px'}}>{colDisplay}</Typography>
                                            {linkedColsNums > 0 && <Typography sx={{fontSize: '10px'}}>Linked to {linkedColsNums} other collection{linkedColsNums === 1 ? '' : 's'}</Typography>}
                                        </Box>
                                    </MenuItem>
                                )
                            })}
                            <MenuItem value='clear' sx={{...menuStyles, fontSize: '12px', ...theme.components.box.fullCenterRow, justifyContent: 'start', color: 'grey'}}><i>Clear Selection</i></MenuItem>
                        </Select>
                    </Box>
                    </> 
                </Box>
                <Typography sx={{fontSize: '12px', textAlign: 'center', mt: sw ? 0.5 : 2.5}}>
                    HOME collections can connect to any number of HOME-compatible gen collections (ex Sword/Shield collections), which also links those collections among each other.
                    Non-HOME collections can only connect to one other non-HOME collection if they are not connected to a HOME collection.
                </Typography>
                <Box sx={{height: '30%', width: '100%', position: 'relative'}}>
                    <Box sx={{...elementBg, width: '20%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', left: '5px'}}>
                        <Button size='large' variant='contained' sx={{padding: sw ? 1 : 0.5, px: sw ? 4 : 5, fontSize: sw ? '15px' : '20px'}} onClick={changeScreen}>Exit</Button>
                    </Box>
                    <Box sx={{...elementBg, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', right: sw ? 'calc(50% - 52px)' : 'calc(50% - 67px)'}}>
                        <Button size={sw ? 'large' : 'small'} variant='contained' sx={{padding: sw ? 1 : 0.5, px: sw ? 4 : 5, fontSize: sw ? '15px' : '20px'}} onClick={saveChanges}>Save</Button>
                    </Box>
                    {otherStateData.saveErrorNotice && 
                    <Box sx={{...elementBg, width: '25%', height: '100%', display: 'flex', justifyContent: 'center', position: 'absolute', right: '5px', alignItems: 'center', ml: sw ? 1 : 5}}>
                        <Typography sx={{fontSize: '12px', color: 'white', fontWeight: 700, textAlign: 'center'}}>
                            No changes were made!
                        </Typography>
                    </Box>
                    }
                </Box>
            </Box>
        </Box>
        <SaveChangesConfirmModal 
            open={otherStateData.saveChangesOpen}
            modalScreen='linking'
            handleChange={finalizeChanges}
            saveButtonSelected={true}
            closeModal={() => {setOtherStateData({...otherStateData, saveChangesOpen: false})}}
            saving={otherStateData.saving}
            linkingProps={{
                newLink: !tentativeLinks.unlink ? totalNewLinkChanges : undefined,
                newUnlink: tentativeLinks.unlink ? totalNewLinkChanges : undefined,
                currColData: {_id: collectionId, type: collectionType, name: currColName, gen: collectionGen}
            }}
            sw={sw}
            customGoBackFunc={() => {setOtherStateData({...otherStateData, saveChangesOpen: false})}}
            customExitWoSavingFunc={changeScreen}
        />
        <Modal 
            aria-labelledby='link-collection-finalization'
            aria-describedby="information about the finalization of your collection link or unlink"
            open={otherStateData.saving || otherStateData.redirectLink !== '' || otherStateData.error}
            closeAfterTransition
            slots={{backdrop: Backdrop}}
            slotProps={{
                backdrop: {
                    timeout: 500
                }
            }} 
        >
            <Fade in={otherStateData.saving || otherStateData.redirectLink !== '' || otherStateData.error}>
                <Box sx={{...modalStyles.onhand.modalContainer, height: '400px', width: '70%', maxWidth: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Box sx={{...modalStyles.onhand.modalElementBg, width: '95%', height: '95%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                    {otherStateData.saving ? 
                        <>
                        <Typography sx={{fontSize: '24px', textAlign: 'center', mb: 5}}>{tentativeLinks.unlink ? 'Unl' : 'L'}inking collections<DotWaitingText/></Typography>
                        <CircularProgress sx={{color: theme.palette.color3.main}}/>
                        </> : 
                    otherStateData.redirectLink !== '' ? 
                        <>
                            <Typography sx={{fontSize: '24px', textAlign: 'center'}}>Successfully {tentativeLinks.unlink ? 'unl' : 'l'}inked collections!</Typography>
                            <Typography sx={{textAlign: 'center', fontSize: '18px', mt: 2}}>
                                The changes will be enacted in {otherStateData.countdown} second{otherStateData.countdown === 1 ? '' : 's'}.
                            </Typography>
                            <Typography sx={{mt: 1, textAlign: 'center', fontSize: '12px', mb: 2}}>
                                This may result in the page refreshing.
                            </Typography>
                            <Typography sx={{textAlign: 'center', fontSize: '14px'}}>
                                {/* Alternatively, you can click <span onClick={manuallyRedirect} style={{color: 'rgb(58, 58, 221)', lineDecoration: 'underline', ':hover': {cursor: 'pointer'}}}>here</span> to manually refresh the page. */}
                                Alternatively, you can click below to reflect the changes immediately
                            </Typography>
                            <Button onClick={manuallyRedirect} variant='contained' size='large' sx={{mt: 4}}>Close</Button>
                        </> :
                    otherStateData.error && 
                    <>
                        <Typography sx={{fontSize: '24px', textAlign: 'center', color: 'red'}}>ERROR {otherStateData.errorData.status}: {otherStateData.errorData.name}</Typography>
                        <Typography sx={{mt: 1, textAlign: 'center', fontSize: '18px', color: 'red'}}>
                            {otherStateData.errorData.message}
                        </Typography>
                        {/* {otherStateData.errorData.status === 500 && <Typography>Please try again later!</Typography>} */}
                        <Button sx={{mt: 5}} variant='contained' size='large' onClick={() => setOtherStateData({...otherStateData, error: false, errorData: {}})}>Close</Button>
                    </>
                    }
                    </Box>
                </Box>
            </Fade>
        </Modal>
        </>
    )
}