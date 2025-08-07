import {useState, useRef, useEffect, useContext, memo, useTransition} from 'react';
import { AlertsContext } from '../alerts/alerts-context';
import {useLoaderData, Link, useRouteLoaderData, useLocation, useNavigate, useSearchParams} from 'react-router-dom'
import * as React from 'react';
import Box from '@mui/material/Box'
import {Tabs, Tab, Button, useTheme, Typography, ToggleButton} from '@mui/material'
import ShowCollectionList from '../components/collectiontable/collectionlist/showcollectionlist'
import ShowOnHandList from '../components/collectiontable/onhandlist/showonhandlist'
import ShowCollectionTitle from '../components/titlecomponents/showcollectiontitle';
import Header from '../components/titlecomponents/subcomponents/header';
import EditCollection from './editcollection'
import FilterSortArea from '../components/collectiontable/filtersortcomponents/filtersortarea';
import FilterSortButton from '../components/collectiontable/filtersortcomponents/filtersortbutton';
import BodyWrapper from '../components/partials/routepartials/bodywrapper'
import {useSelector, useDispatch} from 'react-redux'
import {setCollectionInitialState} from './../app/slices/collection'
import {setOnHandInitialState} from './../app/slices/onhand'
import {setListInitialState} from './../app/slices/listdisplay'
import { setNameState, setOptionsInitialState } from '../app/slices/options';
import store from '../app/store';
import {deselect, changeList} from './../app/slices/editmode'
import listStyles from '../../utils/styles/componentstyles/liststyles';
import ChangeOnHandView from '../components/collectiontable/changeonhandviewbutton';
import ChangeAbilitiesView from '../components/collectiontable/changeabilitiesview';
import SmallWidthColList from '../components/collectiontable/collectionlist/smallwidth/smallwidthcol';
import { selectScreenBreakpoint } from '../app/selectors/windowsizeselectors';
import collectionState from '../app/slices/collectionstate';
import SmallWidthOnHand from '../components/collectiontable/onhandlist/smallwidth/smallwidthonhand';
import SWFilterSort from '../components/collectiontable/filtersortcomponents/swfiltersort';
import { selectAllLinkedCols, selectIfHasLinkedCols, selectLinkedColGen } from '../app/selectors/linkedcolsselectors';
import { capitalizeFirstLetter } from '../../utils/functions/misc';
import queryParamsDecipher from '../../utils/functions/routefunctions/parsequeryparams';
import { ShowCollectionSkeleton } from '../components/partials/skeletons/routeskeletons';
import ShowCollectionNamePlate from '../components/titlecomponents/showcollectionameplate';
import LinkedCollectionSelection, { LinkedCollectionSelectionBuffer } from '../components/titlecomponents/linkedcollectionselection';
import { unstable_batchedUpdates } from 'react-dom';
import ChangeHomeEMView from '../components/collectiontable/changehomeemview';
import { passDemoCollectionForward } from '../components/titlecomponents/showcollectiontitle';

const listTypes = ['collection', 'onHand']

function ShowCollection({collection, isCollectionOwner, colorStyles, demo=false}) {
    const theme = useTheme()
    const list = useSelector(state => state.editmode.listType)
    const pathData = useLocation()
    const navigate = useNavigate()
    const screenBreakpoint = useSelector((state) => selectScreenBreakpoint(state, 'default'))
    const [isPending, startTransition] = useTransition()

    const stateColData = pathData.state !== null && pathData.state.collection
    const currentLink = pathData.pathname 
    const currentlyLoggedInUser = useRouteLoaderData("root")
    const collectionLoaderData = demo ? stateColData : collection ? collection : useLoaderData()
    // const linkedCollections = useSelector((state) => state.collectionState.linkedCollections)
    // const linkedSelectedIdx = useSelector((state) => state.collectionState.linkedSelectedIdx)
    
    // const linkedCollectionLists = useSelector((state) => )
    // const currentCollectionInfo = useSelector((state) => selectSpecificLinkedCol(state, 'basic', collectionLoaderData._id, collectionLoaderData.gen, collectionLoaderData.type))  
    // const {linkedCollections, linkedSelectedIdx, currentCollectionInfo} = useSelector((state) => selectShowCollectionData(state, collectionLoaderData._id, collectionLoaderData.gen, collectionLoaderData.type))
    const currentCollectionGen = useSelector((state) => selectLinkedColGen(state, collectionLoaderData.gen))
    // const hasLinkedCollections = linkedCollections !== undefined

    const smallScreen = screenBreakpoint === 'sm'

    if (demo && (!stateColData || currentlyLoggedInUser.loggedIn)) {
        return (
            !stateColData ? 
            <BodyWrapper>
                <Box sx={{height: '750px', width: '100%', borderRadius: '10px', ...theme.components.box.fullCenterCol, justifyContent: 'start', color: 'black'}}>
                    <Typography sx={{fontSize: '32px', fontWeight: 700, my: 2}}>No data was sent to load a demo collection!</Typography>
                    <Typography sx={{fontSize: '24px', my: 1}}>If you think this is an error, contact us to resolve it!</Typography>
                </Box>
            </BodyWrapper> : 
            <BodyWrapper>
                <Box sx={{height: '750px', width: '100%', borderRadius: '10px', ...theme.components.box.fullCenterCol, justifyContent: 'start', color: 'black'}}>
                    <Typography sx={{fontSize: '32px', fontWeight: 700, my: 2}}>The collection is no longer available!</Typography>
                    <Typography sx={{fontSize: '24px', my: 1}}>Login was detected. You can freely leave this page.</Typography>
                </Box>
            </BodyWrapper>
        )
    }
    const queryP = queryParamsDecipher(pathData.search)
    // const [searchParams, setSearchParams] = useSearchParams(queryP.col ? {col: queryP.col} : '')
    // const changeSearchParams = (colProp) => setSearchParams(colProp)
    
    const initLinkedColLoaderData = collectionLoaderData.linkedCollections ? collectionLoaderData.linkedCollections.filter(c => c._id === queryP.col)[0] : undefined
    const ballScopeInit = initLinkedColLoaderData !== undefined ? initLinkedColLoaderData.options.collectingBalls : collectionLoaderData.options.collectingBalls
    const nameInit = initLinkedColLoaderData !== undefined ? initLinkedColLoaderData.name : collectionLoaderData.name
    // const [searchParams, setSearchParams] = useSearchParams(queryP.col === undefined ? '' : {col: queryP.col})

    //required for collection and collection progress, but wanting to improve so it doesnt. see collectionprogress.jsx

    const userIsLoggedIn = currentlyLoggedInUser.loggedIn && currentlyLoggedInUser.user._id !== collectionLoaderData.owner._id
    const isOwner = demo || (currentlyLoggedInUser.loggedIn && currentlyLoggedInUser.user._id === collectionLoaderData.owner._id)
    const isEditMode = currentLink.includes('edit') && isOwner

    const collectionId = collectionLoaderData._id
    // console.log(store.getState().collectionState)
    const dispatch = useDispatch()
    // useEffect(() => {dispatch(setListInitialState({collection: collection.ownedPokemon, onhand: collection.onHand, updatedEggMoveInfo: collection.eggMoveInfo, resetCollectionFilters: true, resetOnHandFilters: true}))}, [currentLink])
    // useEffect(() => {dispatch(deselect())})

    const changeListType = (e, newList) => {
        dispatch(changeList({list: newList}))
    } 
    

    const tabStyles = (isSelected) => {
        return {
            paddingBottom: 0,
            paddingTop: 0,
            backgroundColor: '#26BCC9',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            border: '1px solid #343434',
            borderBottom: 'none',
            fontWeight: 700,
            width: '50%',
            opacity: isSelected ? 1 : 0.5
        }
    }
    
    return (
        <>
        <Box sx={{flex: 1}}>
            {(isEditMode && list === 'onHand' && smallScreen) && <LinkedCollectionSelectionBuffer/>}
            <LinkedCollectionSelection smallScreen={smallScreen} startTransition={startTransition} list={list} isPending={isPending} link={pathData.pathname}/>
            {isPending ? 
                <ShowCollectionSkeleton /> : 
                <>
                <ShowCollectionNamePlate nameInit={nameInit}/>
                {demo && 
                <Box sx={{width: '100%', height: screenBreakpoint === 'sm' ? '120px' : '50px', justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: screenBreakpoint === 'sm' ? 'column' : 'row', backgroundColor: theme.palette.color3.main, gap: screenBreakpoint === 'sm' ? 0 : 2}}>
                    <Typography sx={{color: theme.palette.color1.main, fontWeight: 700, textAlign: 'center', fontSize: screenBreakpoint === 'sm' ? '15px' : '16px', '@media only screen and (min-width: 936px) and (max-width: 1050px)': {fontSize: '14px'}, '@media only screen and (min-width: 822px) and (max-width: 935px)': {fontSize: '12px'}, '@media only screen and (min-width: 768px) and (max-width: 821px)': {fontSize: '11px'}}}>
                        This demo collection will be lost once you leave or refresh the page. To permanently save the collection, register here:
                    </Typography>
                    <Button size='large' onClick={() => navigate('/register', {state: {collection: passDemoCollectionForward(false, collectionLoaderData.gen)}})} sx={{'&.MuiButtonBase-root': {color: theme.palette.color1.contrastText, backgroundColor: theme.palette.color2.main}}}>Register</Button>
                </Box>
                }
                <BodyWrapper sx={{margin: smallScreen ? 0 : 5}}>
                    <ShowCollectionTitle 
                        collectionInfo={collectionLoaderData} 
                        ownerData={collectionLoaderData.owner}
                        collectionID={collectionId}  
                        isEditMode={isEditMode} 
                        demo={demo} 
                        isOwner={isOwner} 
                        userIsLoggedIn={userIsLoggedIn} 
                        userData={currentlyLoggedInUser.user}
                        smallScreen={smallScreen}
                        ballScopeInit={ballScopeInit}
                        link={pathData.pathname}
                        queries={queryP}
                        startTransition={startTransition}
                    />
                    {!smallScreen && <FilterSortArea collectionGen={currentCollectionGen} loggedInUserSettings={currentlyLoggedInUser.user}/>}
                    {smallScreen && <SWFilterSort collectionGen={currentCollectionGen} loggedInUserSettings={currentlyLoggedInUser.user}/>}
                    <Box sx={{flexGrow: 1, margin: 0, width: '100%', display: 'flex'}}>
                        <Tabs 
                            textcolor='inherit'
                            value={list}
                            onChange={changeListType}
                            indicatorColor='#FFDF26'
                            sx={{width: smallScreen ? '100%' : '40%', zIndex: 100}}
                        >
                            {
                            listTypes.map(lT => {
                                return (
                                    <Tab 
                                        key={`${lT}-tab`}
                                        sx={list === lT ? tabStyles(true) : tabStyles(false)} 
                                        style={{color: '#283f57'}}
                                        label={lT === `collection` ? 'Collection List' : 'On-Hand List'} 
                                        value={lT}
                                    />
                                )
                            })  }
                            
                        </Tabs>
                        <Box sx={{width: '60%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            {(currentCollectionGen === 'home' && !smallScreen) && 
                                <ChangeAbilitiesView sw={smallScreen} listType={list}/>
                            }
                            {(list === 'onHand' && !smallScreen) && 
                                <ChangeOnHandView listType={list} nameDisplaySettings={currentlyLoggedInUser.loggedIn ? currentlyLoggedInUser.user.settings.display.pokemonNames : {}}/>
                            }
                            {(currentCollectionGen === 'home' && list === 'collection' && !smallScreen) && 
                                <ChangeHomeEMView sw={smallScreen}/>
                            }
                            <Box sx={{width: (currentCollectionGen === 'home' && list === 'collection' && !smallScreen) ? '30%' : '50%', height: '100%', display: 'flex', flexDirection: 'column'}}>
                            </Box>
                        </Box>
                    </Box>
                    {list === 'collection' ? 
                    smallScreen ? 
                    <SmallWidthColList 
                        collectionLoader={collectionLoaderData}
                        currCollectionGen={currentCollectionGen}
                        demo={demo}
                        isCollectionOwner={isCollectionOwner}
                        styles={listStyles.collection}
                        isEditMode={isEditMode}
                        userData={currentlyLoggedInUser}
                        height='680px'
                        ballScopeInit={ballScopeInit}
                    /> : 
                    <ShowCollectionList
                        collectionLoader={collectionLoaderData}
                        currCollectionGen={currentCollectionGen}
                        isCollectionOwner={isCollectionOwner}
                        styles={listStyles.collection}
                        isEditMode={isEditMode}
                        demo={demo}
                        userData={currentlyLoggedInUser}
                        ballScopeInit={ballScopeInit}
                        pathname={pathData.pathname}
                    /> :
                    smallScreen ? 
                    <SmallWidthOnHand 
                        onhandList={collectionLoaderData.onHand}
                        collectionID={collectionLoaderData._id}
                        collectingBallsConst={collectionLoaderData.options.collectingBalls}
                        styles={listStyles.onhand}
                        collectionListStyles={listStyles.collection}
                        isEditMode={isEditMode}
                        demo={demo}
                        isHomeCollection={currentCollectionGen === 'home'}
                        userData={currentlyLoggedInUser}
                        height='680px'
                    /> : 
                    <ShowOnHandList
                        onhandList={collectionLoaderData.onHand}
                        collectionID={collectionLoaderData._id}
                        collectingBallsConst={collectionLoaderData.options.collectingBalls}
                        styles={listStyles.onhand}
                        collectionListStyles={listStyles.collection}
                        isEditMode={isEditMode}
                        demo={demo}
                        isHomeCollection={currentCollectionGen === 'home'}
                        userData={currentlyLoggedInUser}
                    />
                    }
                </BodyWrapper>
                </>
            }
            
        </Box>
        </>
    )
}

export default ShowCollection
