import {Box, AppBar, Button, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useTheme, CircularProgress} from '@mui/material'
import { useState, useEffect, useContext } from 'react'
import { useLoaderData, useLocation, useNavigate, useRevalidator } from 'react-router-dom'
import { AlertsContext } from '../../alerts/alerts-context'
import { ErrorContext } from '../../app/contexts/errorcontext'
import { Link } from 'react-router-dom'
import Header from './subcomponents/header'
import TextSpaceDouble from './subcomponents/textspacedouble'
import TextSpaceSingle from './subcomponents/textspacesingle'
import CollectionProgress from './collectionprogress'
import RateDisplay from './ratedisplay'
import ItemDisplay from './itemdisplay'
import ComparisonMain from '../functionalcomponents/comparecollections/comparisonmain'
import { tradePreferenceDisplay } from '../../../common/infoconstants/miscconstants'
import { useDispatch, useSelector } from 'react-redux'
import { changeModalState, resetChangesAndUninitialize, toggleSaveChangesConfirmModal } from '../../app/slices/editmode'
import store from '../../app/store'
import { homeCompatibleGames } from '../../../common/infoconstants/miscconstants.mjs'
import { checkIfCanTrade } from '../../../utils/functions/comparecollections/checkifcantrade'
import { setCollectionInitialState } from '../../app/slices/collection'
import { setOnHandInitialState } from '../../app/slices/onhand'
import { setOptionsInitialState } from '../../app/slices/options'
import SmallWidthModalWrapper from '../partials/wrappers/smallwidthmodalwrapper'
import SWDisplays from './subcomponents/swdisplays'
import { usePutRequest } from '../../../utils/functions/backendrequests/editcollection'
import { selectBasicColData, selectCorrectOpList, selectLinkedColType } from '../../app/selectors/linkedcolsselectors'
import RegWidthDisplays from './subcomponents/regwidthdisplays'
import TitleSaveChangesController from './subcomponents/titlesavechangescontroller'
import { selectAnyUnsavedOnhandChanges, selectUnsavedChanges } from '../../app/selectors/selectors'

export const passDemoCollectionForward = (betweenPages, gen) => {
    const collectionDataInState = store.getState().collectionState
    const topLevelVirtuals = betweenPages ? {
        eggMoveInfo: collectionDataInState.eggMoveInfo,
        availableGamesInfo: collectionDataInState.availableGamesInfo
    } : {}
    const collectionDatabaseFormat = {
        type: 'aprimon',
        name: collectionDataInState.options.collectionName,
        gen,
        options: {...collectionDataInState.options},
        ownedPokemon: betweenPages ? collectionDataInState.collection : collectionDataInState.collection.map(p => {return {...p, imgLink: undefined, possibleGender: undefined, haName: undefined}}),
        onHand: betweenPages ? collectionDataInState.onhand : collectionDataInState.onhand.map(p => {return {...p, imgLink: undefined, haName: undefined}}),
        ...topLevelVirtuals
    }
    return collectionDatabaseFormat
}



export default function ShowCollectionTitle({collectionInfo, ownerData, collectionID, isEditMode, isOwner, userIsLoggedIn, userData, demo, smallScreen, ballScopeInit, link, queries, startTransition}) {
    const theme = useTheme()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const revalidator = useRevalidator()
    const linkBack = link.slice(0, -5)
    const demoGen = demo && useSelector((state) => state.collectionState.demoData.gen)
    const [displayScreen, setDisplayScreen] = useState('ballProgress')
    const [comparisonModal, setComparisonModal] = useState(false)
    const anyUnsavedChanges = useSelector((state) => selectUnsavedChanges(state) || selectAnyUnsavedOnhandChanges(state))
    const basicColData = useSelector((state) => selectBasicColData(state, collectionInfo))
    const gen8Collection = isNaN(parseInt(basicColData.gen))
    const tradePreferences = useSelector((state) => state.collectionState.options.tradePreferences)
    const collectingBalls = useSelector((state) => state.collectionState.options.collectingBalls)
    
    // const tradePreferences = (isEditMode || demo) ? tradePreferencesState : options.tradePreferences
    const ownerTradesDisabled = !demo && ownerData.settings.privacy.disabledTrades
    const collectionTradesDisabled = tradePreferences.status === 'closed'
    const itemsState = tradePreferences.items
    const collectionType = gen8Collection ? `${basicColData.gen.toUpperCase()} Aprimon Collection` : `Gen ${basicColData.gen} Aprimon Collection`
    const formattedTradePreferences = [tradePreferenceDisplay.onhandOnly[tradePreferences.onhandOnly], tradePreferenceDisplay.size[tradePreferences.size], tradePreferenceDisplay.items[tradePreferences.items]].filter(display => display !== undefined)
    
    const tradeableCollections = (userData !== undefined && ownerData._id !== userData._id) && userData.collections.filter(col => checkIfCanTrade(basicColData, col))
    const canInitiateTrade = ((userData !== undefined && ownerData._id !== userData._id) && tradeableCollections.length !== 0)
    const loggedInUserIsBlockedByOwner = userData !== undefined && ownerData._id !== userData._id && ownerData.settings.privacy.blockedUsers.includes(userData.username)

    const currSelectedList = useSelector((state) => selectCorrectOpList(state))

    useEffect(() => {
        if (itemsState === 'none' && displayScreen === 'items') {
            setDisplayScreen('rates')
        }
    }, [itemsState, link])

    const colorStyles1 = {
        bgColor: smallScreen ? 'rgb(40,63,87)' : 'linear-gradient(90deg, rgba(40,63,87,1) 90%, rgba(60,165,186,0) 100%)',
        isGradient: true,
        textColor: 'white', 
        labelBgColor: '#1e2f41'
    }
    const colorStyles2 = {
        bgColor: smallScreen ? 'rgb(181,157,14)' : 'linear-gradient(90deg, rgba(181,157,14,1) 90%, rgba(60,165,186,0) 100%)',
        isGradient: true,
        textColor: 'black',
        labelBgColor: '#98830b'
    }

    const changeDisplayScreen = (newVal) => {setDisplayScreen(newVal)}
    const toggleComparisonModal = () => {setComparisonModal(!comparisonModal)}
    
    
    // const generateInteractionButtons = 
   
    //breakpoints when the label wraps
    const tradeStatusLabelStyles = {
        '@media only screen and (min-width: 1051px)': {
            fontSize: '16px'
        },
        '@media only screen and (min-width: 929px) and (max-width: 1050px)': {
            fontSize: '14px'
        },
        '@media only screen and (min-width: 821px) and (max-width: 928px)': {
            fontSize: '12px'
        },
        '@media only screen and (min-width: 768px) and (max-width: 820px)': {
            fontSize: '11px'
        },
        '@media only screen and (min-width: 0px) and (max-width: 440px)': {
            fontSize: '11px'
        }
    }
    const tradeTagTextStyles = {
        '@media only screen and (max-width: 360px)': {
            marginLeft: 0,
            fontSize: '10.25px'
        },
        '@media only screen and (min-width: 908px) and (max-width: 1043px)': {
            marginRight: '20px'
        },
        '@media only screen and (min-width: 1044px) and (max-width: 1150px)': {
            marginRight: '40px'
        },
        fontSize: !smallScreen && formattedTradePreferences.length === 3 ? '10.5px' : '12px'
    }
    const tagAreaStyles = {
        '@media only screen and (max-width: 768px)': {
            marginLeft: 0
        },
        '@media only screen and (min-width: 772px) and (max-width: 1150px)': {
            marginLeft: '2%'
        },
        '@media only screen and (min-width: 1151px)': {
            marginLeft: '10%'
        },
        gap: formattedTradePreferences.length === 3 ? 0.5 : 2
    }

    const toggleButtonSelectedStyles = {
        '&.Mui-selected': {backgroundColor: 'rgba(40,63,87,1)', color: 'white'},
        '&.Mui-selected:hover': {backgroundColor: 'rgba(40,63,87,0.9)'},
        ':hover': {backgroundColor: 'rgba(39, 38, 37, 0.9)'}
    }

    const leaveEditMode = () => {
        dispatch(resetChangesAndUninitialize()) 
        
        const state = demo ? {state: {collection: passDemoCollectionForward(true, demoGen)}} : {}
        navigate(`${linkBack}${queries.col ? `?col=${queries.col}` : ''}`, state)
        revalidator.revalidate()
        //do not switch the order of these or it ends up revalidating the edit route before it changes which means every other unnecessary state 
        //(col onhand options) gets revalidated too. at least, i THINK thats what happens since it re-renders a LOT when leaving edit mode
    }

    const initializeEditMode = () => {
        const state = demo ? {state: {collection: passDemoCollectionForward(true, demoGen)}} : {}
        navigate(demo ? '/demo-collection/edit' : `/collections/${collectionID}/edit${queries.col ? `?col=${queries.col}` : ''}`, state)
    }

    

    return (
        <Box sx={{display: 'flex', flexDirection: smallScreen ? 'column' : 'row', marginBottom: '1rem', height: smallScreen ? 'auto' : '200px'}}>
            <Box sx={{display: 'flex', flexDirection: 'column', width:  smallScreen ? '100%' : '45%'}}>
                {/* <TextSpaceDouble label1={'Type'} text1={collectionType} label2={'Owner'} text2={ownerData.username} colorStyles={colorStyles} width='100%'/>
                <TextSpaceDouble label1='Trade Status' text1={tradeStatus} text2={formattedTradePreferences} colorStyles={colorStyles} width='100%' isLast={true} otherTextStyles={tradeStatusStyles}/> */}
                <TextSpaceSingle 
                    colorStyles={colorStyles1}
                    otherStyles={{borderBottom: '1px solid white', marginBottom: 0}} 
                    text={collectionType}
                    label={'Type'}
                    width='100%'
                    noRounding={smallScreen ? true : false}
                />
                <TextSpaceSingle 
                    colorStyles={colorStyles2}
                    otherStyles={{borderBottom: '1px solid white', marginBottom: 0}} 
                    text={demo ? 'You' : ownerData.username}
                    label={'Owner'}
                    width='100%'
                    noRounding={smallScreen ? true : false}
                />
                <TextSpaceSingle 
                    colorStyles={colorStyles1}
                    otherStyles={{borderBottom: '1px solid white', marginBottom: 0}} 
                    otherLabelStyles={tradeStatusLabelStyles}
                    text={ownerTradesDisabled ? 'Not accepting offers!' : tradePreferenceDisplay.status[tradePreferences.status]}
                    label={'Trade Status'}
                    width='100%'
                    noRounding={smallScreen ? true : false}
                />
                <TextSpaceSingle 
                    colorStyles={colorStyles2}
                    otherTextStyles={tradeTagTextStyles}
                    tagAreaStyles={(tradePreferences.status === 'closed' || ownerTradesDisabled) ? {...tagAreaStyles, opacity: 0.5} : tagAreaStyles}
                    multipleTexts={formattedTradePreferences}
                    displayingTags={true}
                    width='100%'
                    noRounding={smallScreen ? true : false}
                />
                {!smallScreen ? 
                <Box sx={{width: '100%', height: '20%', display: 'flex', justifyContent: 'center'}}>
                    <ToggleButtonGroup exclusive sx={{mt: 0.5, mb: 0.5, width: smallScreen ? '100%' : '95%', '& .MuiToggleButton-root': {border: '1px solid rgba(40,63,87,1)', color: 'white', backgroundColor: '#272625'}}} size='small' value={displayScreen} onChange={(e, newVal) => changeDisplayScreen(newVal)}>
                        <ToggleButton value='ballProgress' sx={{width: '40%', fontSize: '12px', padding: 0, ...toggleButtonSelectedStyles}}>Progress</ToggleButton>
                        <ToggleButton value='rates' sx={{width: '30%', fontSize: '12px', ...toggleButtonSelectedStyles}}>Rates</ToggleButton>
                        <ToggleButton value='items' sx={{width: '30%', fontSize: '12px', ...toggleButtonSelectedStyles, '&.Mui-disabled': {color: 'white', opacity: 0.7}}} disabled={tradePreferences.items === 'none'}>Items</ToggleButton>
                    </ToggleButtonGroup>
                </Box> : 
                <Box sx={{width: '100%', height: '20%', ...theme.components.box.fullCenterCol}}>
                    <SWDisplays 
                        display={displayScreen}
                        changeDisplayScreen={changeDisplayScreen}
                        ballScopeInit={collectingBalls}
                        isEditMode={isEditMode}
                        demo={demo}
                        collectionList={currSelectedList}
                        userData={userData}
                        isOwner={isOwner}
                        owner={demo ? 'You' : ownerData.username}
                        gen={basicColData.gen}
                        tradePreferences={tradePreferences}
                    />
                </Box>
                }
                <Box sx={{width: '100%', height: '15%', display: 'flex', justifyContent: 'center'}}>
                    {canInitiateTrade && <Button sx={{width: '60%', fontSize: '11px'}} onClick={toggleComparisonModal}>Compare Collections</Button>}
                    {canInitiateTrade && 
                        <>
                        {
                        (loggedInUserIsBlockedByOwner || ownerTradesDisabled || collectionTradesDisabled) ? 
                        <Tooltip title={ownerTradesDisabled ? 'This user has trades disabled at the moment!' : collectionTradesDisabled ? 'This collection is not accepting trade offers' : 'You were blocked by this user, and cannot initiate a trade!'}>
                            <Typography sx={{':hover': {cursor: 'pointer'}, width: '40%', height: '18px', paddingTop: '6px', fontSize: '11px', color: 'grey', textAlign: 'center'}}>OFFER TRADE</Typography>
                        </Tooltip> :
                        <Button sx={{width: '40%', fontSize: '11px'}} onClick={() => navigate(`/collections/${basicColData._id}/trade`)}>Offer Trade</Button>
                        }
                        </>
                    }
                    {(isOwner && !isEditMode) && <Button sx={{width: '40%', fontSize: '12px'}} onClick={initializeEditMode}>Edit Mode</Button>}
                    {(isEditMode && smallScreen) && <Button sx={{fontSize: '11px', width: '50%'}} onClick={() => (anyUnsavedChanges && !demo) ? dispatch(toggleSaveChangesConfirmModal()) : leaveEditMode()}>Leave Edit Mode</Button>}
                    {isEditMode && <Button sx={{fontSize: smallScreen ? '11px' : '12px', width: smallScreen ? '50%' : 'auto'}} onClick={() => dispatch(changeModalState({open: true, screen: 'main'}))}>Collection Options</Button>}
                </Box>
            </Box>
            {!smallScreen && 
            <RegWidthDisplays 
                displayScreen={displayScreen}
                ballScopeInit={ballScopeInit}
                collectingBalls={collectingBalls}
                isEditMode={isEditMode}
                demo={demo}
                currSelectedList={currSelectedList}
                isOwner={isOwner}
                userData={userData}
                tradePreferences={tradePreferences}
                ownerData={ownerData}
                basicColData={basicColData}
            />
            }
            {canInitiateTrade && 
                <ComparisonMain 
                    open={comparisonModal} 
                    toggleModal={toggleComparisonModal} 
                    tradeableCollections={tradeableCollections} 
                    collectionData={basicColData.main ? collectionInfo : {...basicColData,
                        options: {tradePreferences},
                        owner: ownerData,
                    }} 
                    userData={userData} 
                    sw={smallScreen}
                    getStateLists={basicColData.main ? false : true}
                />}
            <TitleSaveChangesController 
                mainID={collectionInfo._id}
                collectionID={collectionID}
                leaveEditMode={leaveEditMode}
                anyUnsavedChanges={anyUnsavedChanges}
                smallScreen={smallScreen}
                startTransition={startTransition}
                link={link}
            />
        </Box>
    )
}