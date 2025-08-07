import {Box, Typography, useTheme, Button, Tooltip} from '@mui/material'
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso'
import { capitalizeFirstLetter } from '../../../../utils/functions/misc'
import { useDispatch, useSelector } from 'react-redux'
import { useRouteLoaderData } from 'react-router'
import { useState, useEffect, useRef, forwardRef } from 'react'
import { selectIfPokemonIsSelected } from '../../../app/selectors/tradeselectors'
import { setPokemon } from '../../../app/slices/tradeoffer'
import { getCompareDisplayGridComponents, IndividualCompareDisplayComponent, PokemonCompareDisplayComponent } from '../comparecollections/comparedisplaygridcomponents'
import ShowCollectionList from '../../collectiontable/collectionlist/showcollectionlist'
import ShowOnHandList from '../../collectiontable/onhandlist/showonhandlist'
import { reFormatToIndividual, reFormatIndividualRow } from '../../../../utils/functions/comparecollections/comparison'
import displayOnHandByPokemon from '../../../../utils/functions/display/displayonhandbypokemon'
import listStyles from '../../../../utils/styles/componentstyles/liststyles'
import ScrollBar from './../scrollbar'
import hexToRgba from 'hex-to-rgba'
import ChangeHomeEMView from '../../collectiontable/changehomeemview'
import ChangeAbilitiesView from '../../collectiontable/changeabilitiesview'

export default function SetPokemon({minHeight='650px', type, view, data, relValue, oneHomeCollection, fullCollectionData, wantedPokemonData, onhandView, changeOnhandView, homeHomeTrade, isHomeCollection, otherListGen}) {
    const theme = useTheme()
    const userData = useRouteLoaderData('root')
    const viewSubTypes = view === 'comparison' ? ['individual', 'pokemon'] : ['collection', 'onhand']
    const dataInit = view === 'comparison' ? data : (data.collection !== undefined ? data.collection : [])
    const [viewData, setViewData] = useState({viewSub: viewSubTypes[0], listDisplay: dataInit})
    const dataPath = view === 'comparison' ? data : data[viewData.viewSub]

    // console.log(view)
    // console.log(viewData)
    // console.log(data)

    useEffect(() => {
        setViewData({...viewData, viewSub: viewSubTypes[0], listDisplay: dataInit})
        // if (typeRef.current !== type) {typeRef.current = type}
        // if (viewRef.current !== view) {viewRef.current = view}
        // if (idRef.current !== fullCollectionData._id) {idRef.current = fullCollectionData._id}
    }, [view, type, fullCollectionData._id])

    const changeViewData = (newType) => {
        const newListDisplay = newType === 'collection' ? {listDisplay: data.collection.filter(p => (p.disabled === undefined) && (Object.values(p.balls).map(ballData => ballData.isOwned === true).includes(true)))} : 
            newType === 'onhand' ? {listDisplay: data.onhand.filter(p => p.reserved === undefined || p.reserved < p.qty)} : data
        setViewData({...viewData, viewSub: newType, ...newListDisplay})
    }

    //we need to take the state to create this boolean otherwise the view variable updates immediately while the list display takes time.
    const isComparisonSection = (view === 'comparison') && (viewData.viewSub === 'individual' || viewData.viewSub === 'pokemon')

    const isIndividualCompareDisplay = view === 'comparison' && viewData.viewSub === 'individual'
    const formattedComparisonDisplay = isIndividualCompareDisplay ? reFormatToIndividual(viewData.listDisplay, true) : viewData.listDisplay
    const ShowComparisonDisplay = isIndividualCompareDisplay ? VirtuosoGrid : Virtuoso
    const useGridComponentsIfGrid = isIndividualCompareDisplay ? getCompareDisplayGridComponents() : {}
    const ItemContentFunc = isIndividualCompareDisplay ? IndividualCompareDisplayComponent : PokemonCompareDisplayComponent

    return (
        <>
        <Box sx={{position: 'relative', ...theme.components.box.fullCenterCol, width: '100%'}}>
        {view === 'comparison' ? 
            <Box sx={{...theme.components.box.fullCenterRow}}>
                <Button sx={{color: theme.palette.color1.light}} onClick={() => changeViewData(viewData.viewSub === 'individual' ? 'pokemon' : 'individual')}>Group {viewData.viewSub === 'individual' ? 'by Pokemon' : 'individually'}</Button> 
                {homeHomeTrade && <ChangeHomeEMView sx={{my: 0.5}}/>}
            </Box> : 
            // viewData.viewSub === 'onhand' ? 
            <Box sx={{...theme.components.box.fullCenterRow, width: '80%'}}>
                <Button sx={{color: theme.palette.color1.light}} onClick={() => changeViewData(viewData.viewSub === 'collection' ? 'onhand' : 'collection')}>View {viewData.viewSub === 'collection' ? 'On-Hand List' : 'Collection List'}</Button>
                {isHomeCollection && 
                    <ChangeAbilitiesView/>
                }
                {(viewData.viewSub === 'collection' && isHomeCollection) && 
                    (homeHomeTrade ? 
                    <ChangeHomeEMView sx={{my: 0.5}}/> : 
                    <Tooltip
                        title='This cannot be changed since the other collection is not a HOME collection, so the egg moves in other games do not matter.'
                    >
                        <Box sx={{':hover': {cursor: 'pointer'}}}>
                            <ChangeHomeEMView sx={{my: 0.5}} isDisabled={true}/>
                        </Box>
                    </Tooltip>)
                }
                {viewData.viewSub === 'onhand' && 
                <Button 
                    sx={{
                        border: `1px solid ${theme.palette.color1.dark}`, 
                        backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), 
                        color: theme.palette.color1.main,
                        padding: 0.5, ml: 2,
                        fontSize: '11px',
                        zIndex: 15,
                        ':hover': {cursor: 'pointer', backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), opacity: 0.65}
                    }}
                    onClick={changeOnhandView}
                >
                    View by {onhandView === 'byIndividual' ? 'Pokemon' : 'Individual'}
                </Button>}
            </Box> 
            // : 
            // <Button sx={{color: theme.palette.color1.light}} onClick={() => changeViewData(viewData.viewSub === 'collection' ? 'onhand' : 'collection')}>View {viewData.viewSub === 'collection' ? 'On-Hand List' : 'Collection List'}</Button>
        }
        {(viewData.viewSub === 'onhand' && onhandView === 'byPokemon' ) &&
            <Typography sx={{fontSize: '12px', color: 'white'}}>This view mode is view-only. Change the on-hand view to select!</Typography>
        }
        </Box>
        <Box sx={{width: '98%', height: minHeight}}>
            {(view === 'comparison') ? 
                <ShowComparisonDisplay 
                    totalCount={formattedComparisonDisplay.length}
                    components={{
                        ...useGridComponentsIfGrid,
                        Scroller: forwardRef((props, ref) => {
                            const otherProps = {...props, ref: undefined, children: undefined, style: undefined}
                            return <ScrollBar style={props.style} forwardedRef={ref} color={theme.palette.color2.main} children={props.children} otherProps={otherProps}/>
                        })
                    }}
                    style={{width: '99%', height: '95%', border: '1px solid white', borderRadius: '10px'}}
                    itemContent={(idx) => {
                        return (
                            // itemContentFunc(pokemon, oneHomeCollection, theme, `can${capitalizeFirstLetter(type)}`, true, useSelectorFunc, dispatchFunc)
                            <ItemContentFunc 
                                p={formattedComparisonDisplay[idx]}
                                oneHomeCollection={oneHomeCollection}
                                list={type}
                                userNameDisplaySettings={!userData.loggedIn ? undefined : userData.user.settings.display.pokemonNames}
                                homeHomeTrade={homeHomeTrade}
                                otherListGen={otherListGen}
                                isHomeCollection={isHomeCollection}
                            />
                        )
                    }}
                /> : 
            (viewData.viewSub === 'collection') ? 
                <ShowCollectionList 
                    collectionLoader={fullCollectionData}
                    styles={listStyles.collection}
                    isEditMode={false}
                    localDisplayState={viewData.listDisplay}
                    ballScopeInit={fullCollectionData.options.collectingBalls}
                    height={minHeight}
                    isTradePage={true}
                    tradeSide={type === 'offer' ? 'offering' : 'receiving'}
                    wantedByOtherListData={wantedPokemonData}
                    userData={userData}
                    currCollectionGen={fullCollectionData.gen}
                    otherListGen={otherListGen}
                /> : 
                <ShowOnHandList 
                    collectionID={fullCollectionData._id}
                    styles={listStyles.onhand}
                    isEditMode={false}
                    eggMoveInfo={{}}
                    isHomeCollection={fullCollectionData.gen === 'home'}
                    collectionListStyles={listStyles.collection}
                    collectingBallsConst={fullCollectionData.options.collectingBalls}
                    localDisplayState={onhandView === 'byIndividual' ? viewData.listDisplay : displayOnHandByPokemon(viewData.listDisplay, fullCollectionData.ownedPokemon)}
                    height={minHeight}
                    isTradePage={true}
                    tradeSide={type === 'offer' ? 'offering' : 'receiving'}
                    userData={userData}
                    localOnhandView={onhandView}
                    otherListGen={otherListGen}
                />
            }
        </Box>
        </>
    )
}