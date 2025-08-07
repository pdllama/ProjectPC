import {Box, Typography, useTheme, Button, ToggleButton} from '@mui/material'
import SmallWidthModalWrapper from '../../partials/wrappers/smallwidthmodalwrapper'
import { useSelector, useDispatch } from 'react-redux'
import { useState, useRef, useEffect } from 'react'
import { genRomans, generations, apriballs, homeDisplayGames, getGameColor } from '../../../../common/infoconstants/miscconstants.mjs'
import { capitalizeFirstLetter } from '../../../../utils/functions/misc'
import { deselect } from '../../../app/slices/editmode'
import { setFilters, setSortKey, filterSearch, toggleFullSetView, toggleEmptySetView, resetFilters } from '../../../app/slices/collectionstate'
import displayOnHandByPokemon from '../../../../utils/functions/display/displayonhandbypokemon'
import { checkForTypeOfFilter } from '../../../../utils/functions/sortfilterfunctions/filterfunctions'
import { useDebouncedCallback } from 'use-debounce'
import hexToRgba from 'hex-to-rgba'
import ImgData from '../tabledata/imgdata'
import { useRouteLoaderData } from 'react-router'
import ListSearch from '../../functionalcomponents/listsearch'
import ChangeAbilitiesView from '../changeabilitiesview'
import ChangeOnHandView from '../changeonhandviewbutton'
import ChangeHomeEMView from '../changehomeemview'

export default function SWFilterSort({collectionGen, loggedInUserSettings}) {
    const theme = useTheme()
    const dispatch = useDispatch()
    const user = useRouteLoaderData('root')
    const nameDisplaySettings = !user.loggedIn ? undefined : user.user.settings.display.pokemonNames
    const [openStates, setOpenStates] = useState({modal: false, cat: '', subCat: ''})
    const toggleModal = () => setOpenStates({...openStates, modal: !openStates.modal})
    const gen = collectionGen
    
    const toggleSubCat = (subCat) => setOpenStates({...openStates, subCat: subCat === openStates.subCat ? '' : subCat})
    
    const list = useSelector((state) => state.editmode.listType).toLowerCase()
    const onhandViewType = useSelector(state => state.collectionState.listDisplay.onhandView)
    const showFullSets = useSelector((state) => state.collectionState.listDisplay.showFullSets)
    const showEmptySets = useSelector((state) => state.collectionState.listDisplay.showEmptySets)
    const ballScope = useSelector((state) => state.collectionState.options.collectingBalls)

    const catRef = useRef(openStates.cat)
    const sortCats = [{display: 'National Dex Number', value: 'natDexNum'}, {display: 'Name', value: 'name'}]
    const tagFilter = list === 'collection' ? [{display: 'Tag', value: 'tag'}, {display: 'Sets', value: 'sets'}] : []
    const gameFilter = gen === 'home' ? [{display: 'Game', value: 'game'}] : []
    const filterCats = [{display: 'Generation', value: 'gen'}, {display: list === 'collection' ? 'Owned Ball' : 'Ball', value: 'ball'}, ...gameFilter, ...tagFilter]

    const dexNumSorts = [{display: 'Lowest to Highest', value: 'NatDexNumL2H'}, {display: 'Highest to Lowest', value: 'NatDexNumH2L'}]
    const nameSorts = [{display: 'A to Z', value: 'A2Z'}, {display: 'Z to A', value: 'Z2A'}]
    
    const genFilters = generations.map((g, i) => {return {display: genRomans[i], value: g}}).filter(g => {
        if (gen === 'home') {return true}
        const genNum = isNaN(parseInt(gen)) ? ((gen === 'swsh') ? 8 : gen === 'bdsp' && 4) : parseInt(gen)
        return g.value <= genNum
    })
    const ballFilters = apriballs.filter(b => ballScope.includes(b)).map(b => {return {display: capitalizeFirstLetter(b), value: b}})
    const tagFilters = list === 'collection' && [{display: 'Highly Wanted', value: 'highlyWanted'}, {display: 'Pending', value: 'pending'}]
    const gameFilters = gen === 'home' && homeDisplayGames.map(game => {return {display: game === 9 ? 'S/V' : game === 'swsh' ? 'SW/SH' : game === 'bdsp' && 'BD/SP', value: game}})

    // this below section is copied bar for bar from filter.jsx
    const currentFilters = list === 'collection' ? useSelector((state) => state.collectionState.listDisplay.collectionFilters) : useSelector((state) => state.collectionState.listDisplay.onhandFilters)
    const ballFiltersState = currentFilters.filters.ballFilters
    const genFiltersState = currentFilters.filters.genFilters
    const gameFiltersState = currentFilters.filters.gameFilters
    const miscFiltersState = currentFilters.filters.otherFilters

    const activeFilters = ballFiltersState.concat(genFiltersState, miscFiltersState)
    const currentSortKey = currentFilters.sort
    const filterSearchTerm = useSelector((state) => state.collectionState.listDisplay.filterSearchTerm)

    // ------

    const generateButtonStyles = (type) => {
        const even = type === 'even'
        return {
            color: theme.palette.color2.contrastText,
            backgroundColor: even ? theme.palette.color2.darker : theme.palette.color2.main,
            ':hover': {
                backgroundColor: hexToRgba(even ? theme.palette.color2.darker : theme.palette.color2.main, 0.8) 
            },
            '&.Mui-selected': {
                backgroundColor: hexToRgba(theme.palette.color3.darker),
                color: theme.palette.color3.contrastText
            },
            '&.Mui-selected:hover': {
                backgroundColor: hexToRgba(theme.palette.color3.darker, 0.8),
                color: theme.palette.color3.contrastText
            }
        }
    }

    const toggleCat = (cat) => {
        setOpenStates({...openStates, cat: cat === openStates.cat ? '' : cat, subCat: ''})
    }

    const handleFilterChange = (filterKey, filterCategory) => {
        dispatch(deselect())
        dispatch(setFilters({filterKey, filterCategory, listType: list, userNameDisplaySettings: nameDisplaySettings}))
    }

    const handleSortChange = (val) => {
        dispatch(setSortKey({sortKey: val, listType: list}))
    }

    const generateStyles = () => {
        return `
            @keyframes grow-sw-sort-subcats {
                from {
                    height: 0px;
                }
                to {
                    height: 120px;
                }
            }
            @keyframes shrink-sw-sort-subcats {
                from {
                    height: 120px;
                }
                to {
                    height: 0px;
                }
            }
            @keyframes grow-sw-filter-subcats {
                from {
                    height: 0px;
                }
                to {
                    height: ${(gen === 'home' && list === 'collection') ? '300' : (list === 'collection') ? '240' : (gen === 'home') ? '180' : '120'}px;
                }
            }
            @keyframes shrink-sw-filter-subcats {
                from {
                    height: ${(gen === 'home' && list === 'collection') ? '240' : (gen === 'home' || list === 'collection') ? '180' : '120'}px;
                }
                to {
                    height: 0px;
                }
            }
            .add-sw-sort-subcats-height {
                animation: 0.5s ease-out 0s 1 grow-sw-sort-subcats;
                animation-fill-mode: forwards;
            }
            .shrink-sw-sort-subcats-height {
                animation: 0.5s ease-out 0s 1 shrink-sw-sort-subcats;
                animation-fill-mode: forwards;
            }
            .add-sw-filter-subcats-height {
                animation: 0.5s ease-out 0s 1 grow-sw-filter-subcats;
                animation-fill-mode: forwards;
            }
            .shrink-sw-filter-subcats-height {
                animation: 0.5s ease-out 0s 1 shrink-sw-filter-subcats;
                animation-fill-mode: forwards;
            }
        `
    }
    const firstRender = openStates.cat === '' && catRef.current === ''
    const resettingCat = openStates.cat === ''
    const sortSubCatClass = ((openStates.cat === 'filter') || firstRender) ? '' : openStates.cat === 'sort' ? 'add-sw-sort-subcats-height' : (resettingCat && catRef.current === 'sort') && 'shrink-sw-sort-subcats-height'
    const filterSubCatClass = (openStates.cat === 'sort' || firstRender) ? '' : openStates.cat === 'filter' ? 'add-sw-filter-subcats-height' : (resettingCat && catRef.current === 'filter') && 'shrink-sw-filter-subcats-height'

    const handleSearchChange = (query, reFilterList) => {
        debouncedSearch(query, reFilterList)
    }   

    const debounceFunction = (query, reFilterList) => {
        dispatch(filterSearch({searchQuery: query, listType: list, reFilterList, nameDisplaySettings}))
    }

    const debouncedSearch = useDebouncedCallback(
        debounceFunction,
        500
    )

    useEffect(() => {
        catRef.current = openStates.cat
    }, [openStates.cat])

    return (
        <>
        <style>{generateStyles()}</style>
        <Box sx={{width: '100%', height: '50px', ...theme.components.box.fullCenterRow, justifyContent: 'end', mb: 0.25}}>
            <Box sx={{width: '100%', height: '100%', display: 'flex'}}>
            {gen === 'home' && <ChangeAbilitiesView listType={list} sw={true}/>}
            {list === 'onhand' && <ChangeOnHandView sw={true} listType={list} nameDisplaySettings={nameDisplaySettings}/>}
            {(list === 'collection' && gen === 'home') && <ChangeHomeEMView sw={true}/>}
            </Box>
            <Box sx={{width: '150px', height: '100%', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', backgroundColor: theme.palette.color2.main}}>
                <Button onClick={toggleModal} sx={{width: '100%', height: '100%', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', color: theme.palette.color2.contrastText, fontSize: '16px'}}>Filter/Sort</Button>
            </Box>
        </Box>
        <SmallWidthModalWrapper
            ariaLabel={'filter/sort modal'}
            ariaDescribe={'apply filtering and/or sorting keys to a list'}
            open={openStates.modal}
            handleClose={toggleModal}
            hideCloseButton={true}
            sx={{width: '160px', backgroundColor: theme.palette.color2.dark, justifyContent: 'start', position: 'relative', color: theme.palette.color2.contrastText}}
            modalSx={{alignItems: 'end'}}
        >
            <Box sx={{height: '30px', ...theme.components.box.fullCenterCol, mb: 1}}>
                <Typography sx={{fontWeight: 700}}>{list === 'collection' ? 'Collection List' : 'On-Hand List'}</Typography>
            </Box>
            <Box sx={{height: '100px', width: '100%', ...theme.components.box.fullCenterCol}}>
                <ToggleButton 
                    value={'sort-button'}
                    selected={openStates.cat === 'sort'} 
                    onClick={() => toggleCat('sort')}
                    sx={{width: '100%', height: '100%', fontWeight: 700, fontSize: '24px', border: 'none', borderRadius: '0px', ...generateButtonStyles('odd'), position: 'relative'}}
                >
                    Sort
                    {currentSortKey !== '' && 
                    <Typography sx={{position: 'absolute', fontSize: '11px', bottom: '5%'}}>
                        Sorted by {currentSortKey.includes('NatDexNum') ? `Dex Number` : `Name - ${currentSortKey.includes('A2Z') ? 'A to Z' : 'Z to A'}`}
                    </Typography>
                    }
                </ToggleButton>
            </Box>
            <Box sx={{height: '0px', width: '100%', ...theme.components.box.fullCenterCol, overflowY: openStates.cat === 'sort' ? 'visible' : 'hidden'}} className={sortSubCatClass}>
                {sortCats.map((sC, idx) => {
                    const eOStyle = idx % 2 === 0 ? generateButtonStyles('even') : generateButtonStyles('odd')
                    const borderTop = idx === 0 ? {borderTop: '1px solid black'} : {}
                    const sortingArr = sC.value === 'natDexNum' ? dexNumSorts : nameSorts

                    return (
                        <Box key={`${sC.value}-sorting-category`} sx={{width: '100%', height: `${100/sortCats.length}%`, ...theme.components.box.fullCenterCol, ...borderTop, position: 'relative'}}>
                            <ToggleButton 
                                value={sC.value}
                                selected={openStates.subCat === sC.value} 
                                onClick={() => toggleSubCat(sC.value)}
                                sx={{width: '100%', height: '100%', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '0px', ...eOStyle}}
                            >
                                {sC.display}
                            </ToggleButton>
                            {openStates.subCat === sC.value && 
                            <Box sx={{position: 'absolute', right: '100%', width: '160px'}}>
                                {sortingArr.map((s, i) => {
                                    const eOStyle2 = i % 2 === 0 ? generateButtonStyles('even') : generateButtonStyles('odd')

                                    return (
                                        <Box key={`${s.value}-sorting-option`} sx={{height: '60px', ...theme.components.box.fullCenterCol, backgroundColor: theme.palette.color2.dark}}>
                                            <ToggleButton 
                                                value={s.value}
                                                selected={currentSortKey === s.value} 
                                                onClick={() => handleSortChange(s.value, list)}
                                                sx={{width: '100%', height: '100%', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '0px', ...eOStyle2}}
                                            >
                                                {s.display}
                                            </ToggleButton>
                                        </Box>
                                    )
                                })}
                            </Box>
                            }
                        </Box>
                    )
                })}
            </Box>
            <Box sx={{height: '100px', width: '100%', ...theme.components.box.fullCenterCol}}>
                <ToggleButton 
                    value={'filter-button'}
                    selected={openStates.cat === 'filter'}
                    onClick={() => toggleCat('filter')}
                    sx={{width: '100%', height: '100%', fontWeight: 700, fontSize: '24px', border: 'none', borderRadius: '0px', ...generateButtonStyles('even'), position: 'relative'}}
                >
                    Filter
                    {activeFilters.length !== 0 &&
                    <Typography sx={{position: 'absolute', fontSize: '11px', bottom: '5%'}}>
                        {activeFilters.length} filter{activeFilters.length >= 2 ? 's' : ''} applied
                    </Typography>
                    }
                </ToggleButton>
            </Box>
            <Box sx={{height: '0px', width: '100%', ...theme.components.box.fullCenterCol, overflow: openStates.cat === 'filter' ? 'visible' : 'hidden'}} className={filterSubCatClass}>
                {filterCats.map((fC, idx) => {
                    const eOStyle = (idx+1) % 2 === 0 ? generateButtonStyles('even') : generateButtonStyles('odd')
                    const borderTop = idx === 0 ? {borderTop: '1px solid black'} : {}
                    const filteringArr = fC.value === 'sets' ? [{display: 'Full Sets', value: 'sFS'}, {display: 'Empty Sets', value: 'sES'}] : 
                        fC.value === 'gen' ? genFilters : 
                        fC.value === 'ball' ? ballFilters : 
                        fC.value === 'tag' ? tagFilters : gameFilters
                    const catFiltersArr = fC.value === 'gen' ? genFiltersState : fC.value === 'ball' ? ballFiltersState : fC.value === 'game' ? gameFiltersState : miscFiltersState
                    const filterCountArr = fC.value === 'game' ? catFiltersArr.filter(c => gameFilters.filter(gF => gF.value === c)[0] !== undefined || c === 'no-game') : 
                        fC.value === 'tag' ? (currentFilters.filters.tagFilter !== '' ? 1 : 0)  : catFiltersArr
                    const isGameFilt = fC.value === 'game'
                    const filterCategoryKey = `${fC.value}Filter${fC.value === 'tag' ? '' : 's'}`
                    return (
                        <Box key={`${fC.value}-filtering-category`} sx={{width: '100%', height: `${100/filterCats.length}%`, ...theme.components.box.fullCenterCol, ...borderTop, position: 'relative'}}>
                            <ToggleButton 
                                value={fC.value}
                                selected={openStates.subCat === fC.value} 
                                onClick={() => toggleSubCat(fC.value)}
                                sx={{width: '100%', height: '100%', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '0px', ...eOStyle}}
                            >
                                {fC.display}
                                {((fC.value === 'tag' && currentFilters.filters.tagFilter !== '') || (fC.value !== 'tag' && filterCountArr.length !== 0)) && 
                                <Typography sx={{position: 'absolute', fontSize: '9px', bottom: '5%'}}>
                                    {!Array.isArray(filterCountArr) ? filterCountArr : filterCountArr.length} filter{!Array.isArray(filterCountArr) ? '' : filterCountArr.length >= 2 ? 's' : ''} applied
                                </Typography>
                                }
                                {((fC.value === 'sets') && (!showEmptySets || !showFullSets)) && 
                                <>
                                <Typography sx={{position: 'absolute', fontSize: '9px', bottom: '5%'}}>
                                    {!showFullSets && !showEmptySets ? 2 : !showEmptySets || !showFullSets ? 1 : 0} filter{!showFullSets && !showEmptySets ? 's' : ''} applied
                                </Typography>
                                </>
                                }
                            </ToggleButton>
                            {openStates.subCat === fC.value && 
                            <Box sx={{position: 'absolute', right: '100%', width: '160px'}}>
                                {filteringArr.map((f, i) => {
                                    const eOStyle2 = i % 2 === 0 ? generateButtonStyles('even') : generateButtonStyles('odd')
                                    const isSetFilter = fC.value === 'sets'
                                    const firstGame = isGameFilt && f.display.slice(0, f.display.indexOf('/'))
                                    const secondGame = isGameFilt && f.display.slice(f.display.indexOf('/')+1, f.display.length)
                                    const firstGameColor = isGameFilt && getGameColor(firstGame)
                                    const secondGameColor = isGameFilt && getGameColor(secondGame)
                                    const setsSelected = isSetFilter && (f.value === 'sFS' ? !showFullSets : f.value === 'sES' && !showEmptySets)
                                    
                                    return (
                                        <Box key={`${f.value}-filtering-option`} sx={{height: '60px', ...theme.components.box.fullCenterCol, backgroundColor: theme.palette.color2.dark}}>
                                            <ToggleButton 
                                                value={isSetFilter ? (f.value === 'sFS' ? showFullSets : f.value === 'sES' && showEmptySets) : f.value}
                                                selected={isSetFilter ? setsSelected : 
                                                    fC.value === 'tag' ? currentFilters.filters.tagFilter === f.value : 
                                                    catFiltersArr.includes(f.value)} 
                                                onClick={isSetFilter ? 
                                                    f.value === 'sFS' ? () => dispatch(toggleFullSetView({nameDisplaySettings: loggedInUserSettings ? loggedInUserSettings.settings.display.pokemonNames : {}})) : 
                                                    () => dispatch(toggleEmptySetView({nameDisplaySettings: loggedInUserSettings ? loggedInUserSettings.settings.display.pokemonNames : {}})) : 
                                                    () => handleFilterChange(f.value, filterCategoryKey)}
                                                sx={{width: '100%', height: '100%', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '0px', ...theme.components.box.fullCenterRow, flexDirection: fC.value === 'ball' ? 'column' : 'row', ...eOStyle2}}
                                            >
                                                {isGameFilt ? 
                                                <>
                                                    <Typography sx={{color: firstGameColor}}>{firstGame}</Typography>
                                                    <Typography sx={{color: secondGameColor}}>/{secondGame}</Typography>
                                                </> : 
                                                isSetFilter ? `${setsSelected ? 'Show' : 'Hide'} ${f.display}` : f.display}
                                                {fC.value === 'ball' && 
                                                <ImgData type='ball' linkKey={f.value} size='28px'/>
                                                }
                                            </ToggleButton>
                                        </Box>
                                    )
                                })}
                                {fC.value === 'game' && 
                                    <Box sx={{height: '60px', ...theme.components.box.fullCenterCol, backgroundColor: theme.palette.color2.dark}}>
                                        <ToggleButton 
                                            value={'no-game'}
                                            selected={catFiltersArr.includes('no-game')} 
                                            onClick={() => handleFilterChange('no-game', 'gameFilters')}
                                            sx={{width: '100%', height: '100%', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '0px', ...theme.components.box.fullCenterCol, ...generateButtonStyles(gameFilters.length % 2 === 0 ? 'even' : 'odd')}}
                                        >
                                            None
                                        </ToggleButton>
                                    </Box>
                                }
                            </Box>
                            }
                        </Box>
                    )
                })}
            </Box>
            <Box sx={{height: '99px', width: '100%', ...theme.components.box.fullCenterCol, position: 'absolute', bottom: '0px', justifyContent: 'end', gap: 0.5}}>
                {/* {list === 'collection' &&
                <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', position: 'relative'}}>
                    <Button 
                        sx={{
                            border: `1px solid ${theme.palette.color1.dark}`, 
                            backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), 
                            color: theme.palette.color1.main,
                            padding: 0.5,
                            fontSize: '14px',
                            zIndex: 15,
                            ':hover': {cursor: 'pointer', backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), opacity: 0.65},
                            position: 'relative'
                        }}
                        onClick={() => {
                            dispatch(deselect())
                            dispatch(toggleFullSetView({useState: (isEditMode || demo), collection: collection.ownedPokemon.filter(p => p.disabled === undefined)}))
                        }}
                    >
                        {showFullSets ? 'Hide' : 'Show'} Full Sets
                        <Typography sx={{color: 'black', fontSize: '8px', position: 'absolute', bottom: '-2px'}}>Currently: {showFullSets ? 'Shown' : 'Hidden'}</Typography>
                    </Button>
                    
                </Box>
                } */}
                <ListSearch 
                    queryFunc={handleSearchChange} 
                    textFieldProps={{
                        label: 'Search Pokemon',
                        variant: 'outlined',
                        size: 'small', 
                        // sx: {
                        
                        // },
                        InputLabelProps: {sx: {color: 'white', fontSize: '16px'}},
                        InputProps: {sx: {color: 'white',  '& .MuiInputBase-input': {paddingY: 1}, mx: 0.5}}
                    }}
                    customValue={filterSearchTerm}
                />
                <Button 
                    sx={{width: '100%', height: '60px', backgroundColor: hexToRgba(theme.palette.color2.darker, 0.8) }}
                    onClick={() => {
                        dispatch(deselect())
                        dispatch(resetFilters({listType: list}))
                    }}
                >
                    Reset All Filters
                </Button>
            </Box>
        </SmallWidthModalWrapper>
        </>
    )
}