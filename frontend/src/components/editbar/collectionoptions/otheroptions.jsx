import {Modal, Fade, Backdrop, Box, Typography, Button, ToggleButton, ToggleButtonGroup} from '@mui/material'
import ArrowForward from '@mui/icons-material/ArrowForward'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useRouteLoaderData } from 'react-router'
import { useState, useEffect, useContext, useRef } from 'react'
import { AlertsContext } from '../../../alerts/alerts-context'
import { ErrorContext } from '../../../app/contexts/errorcontext'
import { changeModalState } from '../../../app/slices/editmode'
import { setNameState, setGlobalDefaultState, resetInitialized } from '../../../app/slices/collectionstate'
import { apriballs } from '../../../../common/infoconstants/miscconstants.mjs'
import { backendChangeOptions } from '../../../../utils/functions/backendrequests/collectionoptionsedit'
import deleteCollectionRequest from '../../../../utils/functions/backendrequests/deletecollection'
import ControlledTextInput from '../../functionalcomponents/controlledtextinput'
import SaveChangesConfirmModal from './savechangesconfirmmodal'
import ConfirmDecisionModal from '../../functionalcomponents/confirmdecisionmodal'
import ExportCollectionModal from './otheroptionscomponents/exportcollectionmodal'
import { homeDisplayGames } from '../../../../common/infoconstants/miscconstants.mjs'
import GameIndicatorBox from '../../collectiontable/tabledata/gameindicatorbox'

export default function OtherOptions({elementBg, collectionId, collectionGen, collectionType, owner, demo, sw}) {
    const dispatch = useDispatch()
    const {handleError} = useContext(ErrorContext)
    
    const collectionNameState = useSelector((state) => state.collectionState.options.collectionName)
    const globalDefaultInit = useSelector((state) => state.collectionState.options.globalDefaults)
    const collectionNameRef = useRef(collectionNameState)
    const navigate = useNavigate()

    const [otherOptions, setOtherOptions] = useState({globalDefaults: globalDefaultInit, deleteCollectionModal: false, saveChangesConfirmOpen: false, homeEMCount: homeDisplayGames[homeDisplayGames.length-1]})
    const [deleteError, setDeleteError] = useState({error: false})
    const [exportCol, setExportCol] = useState(false)

    //stuff needed for exports
    const userData = useRouteLoaderData("root").user
    const ballOrderScope = useSelector((state) => state.collectionState.options.collectingBalls)
    const userBallOrder = demo ? apriballs.filter(b => ballOrderScope.includes(b)) : userData.settings.display.ballOrder.filter(b => ballOrderScope.includes(b)) //note that this ball order should only contain the balls in the ball scope
    const availableHomeGames = useSelector((state) => state.collectionState.availableGamesInfo)
    const nameDisplaySettings = demo ? undefined : userData.settings.display.pokemonNames
    const useOhByPViewInit = demo ? false : userData.settings.display.defaultOnhandView === 'byPokemon'

    //convertOptions: {
//  HAExport: Boolean, determines if that information should be exported when exporting isOwned
//  EMExport: Boolean, same thing as above. exports as a column of checkboxes which is checked if ANY ball combos have it.
//  addHANames: Boolean, adds a cell that tells you of the pokemon's HA
//  imgOwned: Boolean, adds image if ball combo is owned
//  getGameSprite: Boolean (only for home collections), selects whether 
//                  to get the sprite from their most recent home game,
//                  rather than their home sprite. 
//  ballOrder: array, the ball order of the user from their settings.
//  useByPView: boolean, used for onhand exports if they want to export the byPview
//  gen: num/string, the gen of the collection
//}

    const buttonStyles = {
        '&.MuiToggleButton-root': {
            borderColor: 'rgba(230,230,230, 0.5)',
            color: 'white',
            '&:hover': {
                backgroundColor: 'rgba(64, 224, 208, 0.2)'
            }
        },
        '&.Mui-selected': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }
    }

    //alerts
    const [alertIds, setAlertIds] = useState([])
    const {addAlert, dismissAlert} = useContext(AlertsContext)

    const clearAlerts = () => {
        alertIds.forEach((id) => {
            dismissAlert(id);
        });
        setAlertIds([]);
    }

    useEffect(() => {
        return () => {
            clearAlerts();
        };
    }, []);

    const changeGlobalDefault = (field, newVal) => {
        if (isHomeCollection && field === 'emCount') {
            setOtherOptions({...otherOptions, globalDefaults: {...otherOptions.globalDefaults, eggMoveData: {...otherOptions.globalDefaults.eggMoveData, [otherOptions.homeEMCount]: newVal}}}) 
        } else {
            setOtherOptions({...otherOptions, globalDefaults: {...otherOptions.globalDefaults, [field]: newVal}}) 
        }
    }

    const closeSaveChangesConfirm = () => {
        setOtherOptions({...otherOptions, saveChangesConfirmOpen: false})
    }

    const toggleDeleteCollectionModal = () => {
        setOtherOptions({...otherOptions, deleteCollectionModal: !otherOptions.deleteCollectionModal})
    }

    const switchHomeCountGen = () => {
        setOtherOptions({...otherOptions, homeEMCount: otherOptions.homeEMCount === homeDisplayGames[homeDisplayGames.length-1] ? homeDisplayGames[0] : homeDisplayGames[homeDisplayGames.indexOf(otherOptions.homeEMCount)+1]})
    }

    const changeOptions = (saveButtonSelected, nextScreen) => {
        const noNameChanges = collectionNameRef.current.value === collectionNameState
        const noEmCountDefaultChanges = isHomeCollection ? 
            !(homeDisplayGames.map(hDG => globalDefaultInit.eggMoveData[hDG] === otherOptions.globalDefaults.eggMoveData[hDG]).includes(false)) : 
            globalDefaultInit.emCount === otherOptions.globalDefaults.emCount
        const noGlobalDefaultChanges = (globalDefaultInit.isHA === otherOptions.globalDefaults.isHA) && noEmCountDefaultChanges
        const noChangesMade = noNameChanges && noGlobalDefaultChanges
        if (saveButtonSelected && noChangesMade) {
            setOtherOptions({...otherOptions, saveErrorNoticeShow: true})
            setTimeout(() => {
                setOtherOptions((curr) => {return {...curr, saveErrorNoticeShow: false}})
            }, 3000)
        } else if (!noChangesMade) {
            setOtherOptions({...otherOptions, saveChangesConfirmOpen: true, saveButtonSelected, nextScreen})
        } else {
            if (nextScreen === 'exit') {
                dispatch(changeModalState({open: false}))
            } else {
                dispatch(changeModalState({open: true, screen: nextScreen}))
            }
        }
    }

    const deleteCollection = () => {
        const backendFunc = async() => deleteCollectionRequest(collectionId)
        const successFunc = () => {
            navigate(`/users/${owner}`)
            dispatch(resetInitialized())
            addAlert({severity: 'error', timeout: 5, message: `Deleted your ${collectionType}!`})
        }
        const errorFunc = (errorDetails) => {
            setDeleteError({error: true, ...errorDetails})
        }
        handleError(backendFunc, false, successFunc, errorFunc)
    }

    const finalizeChanges = (saveChanges, nextScreen) => {
        if (saveChanges) {
            const newName = collectionNameRef.current.value
            const noNameChanges = collectionNameRef === collectionNameState
            const noEmCountDefaultChanges = isHomeCollection ? 
                !(homeDisplayGames.map(hDG => globalDefaultInit.eggMoveData[hDG] === otherOptions.globalDefaults.eggMoveData[hDG]).includes(false)) : 
                globalDefaultInit.emCount === otherOptions.globalDefaults.emCount
            const noGlobalDefaultChanges = (globalDefaultInit.isHA === otherOptions.globalDefaults.isHA) && noEmCountDefaultChanges
            setOtherOptions({...otherOptions, saving: true})
            setTimeout(() => {
                if (demo) {
                    if (!noNameChanges && !noGlobalDefaultChanges) {
                        // backendChangeOptions('name', {name: newName, globalDefault: otherOptions.globalDefaults}, collectionId)
                        dispatch(setNameState({name: newName, globalDefault: otherOptions.globalDefaults}))
                    } else if (!noNameChanges) {
                        // backendChangeOptions('name', {name: newName}, collectionId)
                        dispatch(setNameState({name: newName}))
                    } else if (!noGlobalDefaultChanges) {
                        // backendChangeOptions('globalDefault', {globalDefault: otherOptions.globalDefaults}, collectionId)
                        dispatch(setGlobalDefaultState(otherOptions.globalDefaults))
                    }

                    //spawning alert
                    const alertMessage = `Set Other Options!`
                    const alertInfo = {severity: 'success', message: alertMessage, timeout: 3}
                    const id = addAlert(alertInfo);
                    setAlertIds((prev) => [...prev, id]);
                    dispatch(changeModalState({open: false}))
                } else {
                    const backendType = noNameChanges && !noGlobalDefaultChanges ? 'globalDefault' : 'name'
                    const info = noNameChanges && !noGlobalDefaultChanges ? {globalDefault: otherOptions.globalDefaults} : !noNameChanges && noGlobalDefaultChanges ? {name: newName} : {name: newName, globalDefault: otherOptions.globalDefaults}
                    const backendFunc = async() => await backendChangeOptions(backendType, info, collectionId)
                    
                    const successFunc = () => {
                        if (!noNameChanges && !noGlobalDefaultChanges) {
                            // backendChangeOptions('name', {name: newName, globalDefault: otherOptions.globalDefaults}, collectionId)
                            dispatch(setNameState({name: newName, globalDefault: otherOptions.globalDefaults}))
                        } else if (!noNameChanges) {
                            // backendChangeOptions('name', {name: newName}, collectionId)
                            dispatch(setNameState({name: newName}))
                        } else if (!noGlobalDefaultChanges) {
                            // backendChangeOptions('globalDefault', {globalDefault: otherOptions.globalDefaults}, collectionId)
                            dispatch(setGlobalDefaultState(otherOptions.globalDefaults))
                        }

                        //spawning alert
                        const alertMessage = `Set Other Options!`
                        const alertInfo = {severity: 'success', message: alertMessage, timeout: 3}
                        const id = addAlert(alertInfo);
                        setAlertIds((prev) => [...prev, id]);
                        dispatch(changeModalState({open: false}))
                    }

                    handleError(backendFunc, false, successFunc, () => {dispatch(changeModalState({open: false}))})
                }
                
            }, 1000)
        } else if (nextScreen === 'goBack') {
            setOtherOptions({...otherOptions, saveChangesConfirmOpen: false})
        } else if (nextScreen === 'exit') {
            dispatch(changeModalState({open: false}))
        } else if (saveChanges === false) {
            dispatch(changeModalState({screen: nextScreen}))
        }
    }

    useEffect(() => {
        if (otherOptions.deleteCollectionModal === false && deleteError.error) {
            setDeleteError({error: false})
        }
    }, [otherOptions.deleteCollectionModal])


    const isHomeCollection = collectionGen === 'home'
    const disabledEMSelection = isHomeCollection ? {filter: 'blur(10px)', pointerEvents: 'none'} : {}

    return (
        <>
        <Box sx={{...elementBg, width: '95%', height: sw ? '80px' : '35px', display: 'flex', alignItems: 'center', mb: 1}}>
            <Button sx={{color: 'rgb(38, 188, 201)', fontWeight: 700, textTransform: 'none', fontSize: '1rem'}} onClick={() => changeOptions(false, 'main')}>Collection Options</Button>
            <ArrowForward sx={{color: 'rgb(38, 188, 201)'}}/>
            <Typography sx={{color: 'white', fontWeight: 700, mx: 1, textAlign: 'center'}}>Other Options</Typography>
        </Box>
        <Box sx={{...elementBg, width: '95%', height: '95%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative'}}>
            <Box sx={{width: '90%', height: '30%', display: 'flex', flexDirection: sw ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', mt: -1}}>
                <Typography sx={{fontSize: '14px', fontWeight: 700, marginRight: 1}}>Collection Name:</Typography>
                <ControlledTextInput
                    textFieldProps={{
                        size: 'small',
                        FormHelperTextProps: {
                            sx: {fontSize: '10px', height: 2, color: 'white'}
                        },
                        helperText: `If empty: '${demo ? 'My' : owner}${!demo ? "'s" : ''} ${collectionType}'`,
                        inputRef:  collectionNameRef
                    }}
                    textFieldStyles={{
                        width: sw ? '100%' : '70%',
                        '& .MuiInputBase-input': {
                            color: 'white',
                            py: 0.5
                        }
                    }}
                    useExpandedRegex={true}
                    defaultValue={collectionNameState}
                    charLimit={60}
                />
            </Box>
            <Box sx={{width: '90%', height: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: -1, gap: sw ? 1 : 0}}>
                <Typography sx={{fontSize: '14px', fontWeight: 700, marginRight: 1}}>Global Defaults:</Typography>
                <Box sx={{display: 'flex', flexDirection: sw ? 'column' : 'row', alignItems: 'center', width: '100%', height: '90%', gap: sw ? 0.5 : 0}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: sw ? 'start' : 'center', alignItems: 'center', width: '50%', height: '100%'}}>
                        <Typography sx={{fontSize: '14px', mb: 1, fontWeight: 700}}>Hidden Ability</Typography>
                        <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                            <ToggleButtonGroup exclusive value={otherOptions.globalDefaults.isHA} onChange={(e, newVal) => changeGlobalDefault('isHA', newVal)}>
                            <ToggleButton sx={{fontSize: '12px', ...buttonStyles}} value={true}>
                                HA
                            </ToggleButton>
                            <ToggleButton sx={{fontSize: '12px', ...buttonStyles}} value={false}>
                                Non-HA
                            </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '50%', height: '100%', position: 'relative'}}>
                        <Typography sx={{fontSize: '14px', mb: 1, fontWeight: 700}}>Egg Move Count</Typography>
                        <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                            {Array.from(Array(5).keys()).map((emCount, idx) => {
                                return (
                                    <ToggleButton 
                                        sx={{fontSize: '12px', mx: 0.5, ...buttonStyles}} 
                                        value={emCount} 
                                        selected={isHomeCollection ? otherOptions.globalDefaults.eggMoveData[otherOptions.homeEMCount] === emCount : otherOptions.globalDefaults.emCount === emCount} 
                                        onChange={(e, newVal) => changeGlobalDefault('emCount', newVal)} 
                                        key={`global-default-emCount-${emCount}`}
                                    >
                                        {emCount}
                                    </ToggleButton>
                                )
                            })}
                        </Box>
                        {isHomeCollection && 
                            <Box sx={{position: 'absolute', top: sw? '90%' : '80%', display: 'flex', gap: 2, alignItems: 'center'}}>
                                <Button onClick={switchHomeCountGen}>Switch Gen</Button>
                                <GameIndicatorBox game={otherOptions.homeEMCount} sx={{height: '24px'}} textSx={{fontSize: '18px'}}/>
                            </Box>
                        }
                    </Box>
                </Box>
            </Box>
            <Box sx={{width: '90%', height: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: -1, gap: sw ? 1 : 0}}>
                <Button size='large' onClick={() => setExportCol(!exportCol)}>Export Collection to CSV</Button>
            </Box>
            
            <Box sx={{width: '90%', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: demo ? 0.5 : 1, position: 'absolute', bottom: '5%'}}>
                <Button sx={{backgroundColor: '#ED4337', color: 'white', '&.Mui-disabled': {color: 'white'}}} onClick={toggleDeleteCollectionModal} disabled={demo}>Delete Collection</Button>
            </Box>
        </Box>
        <Box sx={{mt: 1, height: sw ? '45px' : '35px', width: '100%', display: 'flex'}}>
            <Box sx={{...elementBg, width: '20%', height: '100%', mr: sw ? '5%' : '20%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Button size='small' variant='contained' sx={{py: 0}} onClick={() => changeOptions(false, 'exit')}>Exit</Button>
            </Box>
            <Box sx={{...elementBg, width: sw ? '35%' : '20%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Button size={sw ? 'large' : 'small'} variant='contained' sx={{py: 0, fontSize: sw ? '20px' : '15px'}} onClick={() => changeOptions(true, 'main')}>Save</Button>
            </Box>
            {otherOptions.saveErrorNoticeShow && 
            <Box sx={{...elementBg, width: '25%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', ml: sw ? 1 : 5}}>
                <Typography sx={{fontSize: '12px', color: 'white', fontWeight: 700, textAlign: 'center'}}>
                    No changes were made!
                </Typography>
            </Box>
            }
        </Box>
        {/* <Modal                               come back to this modal once you setup users and trades, so you can setup deleting the collection references in both of them
            aria-labelledby={`confirm delete collection`}
            aria-describedby={`confirm the decision to delete your collection`}
            open={otherOptions.deleteCollectionModal}
            onClose={toggleDeleteCollectionModal}
            closeAfterTransition
            slots={{backdrop: Backdrop}}
            slotProps={{
                backdrop: {
                    timeout: 500
                }
            }} 
        >

        </Modal> */}
        <ConfirmDecisionModal 
            text='Are you sure you want to delete this collection?'
            subText='Every ongoing trade with this collection will be cancelled. Also, the collection will be lost forever!'
            open={otherOptions.deleteCollectionModal}
            toggleModal={toggleDeleteCollectionModal}
            noPendingPage={true}
            confirmDecisionFunc={deleteCollection}
            state2={deleteError.error ? 
                () => {
                    return (
                        <>
                        <Typography sx={{fontSize: '24px', textAlign: 'center'}}>ERROR {deleteError.status}: {deleteError.name}</Typography>
                        <Typography sx={{mt: 1, textAlign: 'center'}}>
                            {deleteError.message}
                        </Typography>
                        <Typography sx={{mt: 1, textAlign: 'center'}}>
                            Try again later!
                        </Typography>
                        </>
                    )
                } : 
                undefined
            }
        />
        <ExportCollectionModal 
            sw={sw}
            open={exportCol}
            toggleModal={() => setExportCol(!exportCol)}
            collectionGen={collectionGen}
            userBallOrder={userBallOrder}
            nameDisplaySettings={nameDisplaySettings}
            availableHomeGames={availableHomeGames}
            useOhByPInit={useOhByPViewInit}
            collectionName={collectionNameState}
        />
        <SaveChangesConfirmModal 
            open={otherOptions.saveChangesConfirmOpen}
            modalScreen='other'
            saveButtonSelected={otherOptions.saveButtonSelected}
            nextScreen={otherOptions.nextScreen}
            handleChange={finalizeChanges}
            closeModal={closeSaveChangesConfirm}
            saving={otherOptions.saving}
            sw={sw}
        />
        </>
    )
}