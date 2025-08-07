import {Box, Button, Typography, useTheme} from '@mui/material'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setOnhandChange } from '../../../../../app/slices/editmode'
import { setBall, setGender, setIsHA, setEmCount, deleteEms, setEms, setQty, setEmGen} from '../../../../../app/slices/collectionstate'
import { selectNextEmCount, setMaxEmArr } from '../../../../../../utils/functions/misc'
import QtySelectionForm from '../../../editsectioncomponents/onhandeditonly/qtyselectionform'
import HASelectionForm from '../../../editsectioncomponents/shared/haselectionform'
import GenderSelectionForm from '../../../editsectioncomponents/onhandeditonly/genderselectionform'
import EggMoveSelectionForm from '../../../editsectioncomponents/shared/eggmoveselectionform'
import SWEditEggMovesForm from './swediteggmovesform'
import SmallWidthModalWrapper from '../../../../partials/wrappers/smallwidthmodalwrapper'
import SWOnHandPokemonSelectionForm from './swonhandpokemonselectionform'
import SWDeleteSingleOnHand from './swdeletesingleonhand'
import { selectPokeIdMatches } from '../../../../../app/selectors/selectpokeidmatches'

export default function SWOnhandEditor({collectionID, demo, pokemonId, allowedBalls, isHomeCollection, idxOfPokemon, possibleGender, noHA, noEMs, allowedHomeEmGens, customPeripheralStates=undefined, customHandlerFuncs=undefined, noSpeciesEdit=false, noDelete=false, disabledSelections=false, modal=false, removeDeleteButton=false, colorOverride, customBoxSx={}, emProps={}, additionalDeleteDispatchProps={}, additionalDeleteSuccessFunction=null, otherCustomButton=null, emSelectionHeight='40%'}) {
    const theme = useTheme()
    const dispatch = useDispatch()
    const listType = 'onhand'
    const pokemon = customPeripheralStates ? customPeripheralStates : useSelector((state) => state.collectionState.onhand.filter(p => p._id === pokemonId)[0])
    const possibleEggMoves = useSelector((state) => isHomeCollection ? state.collectionState.collection.filter(p => selectPokeIdMatches(p.imgLink, pokemon.imgLink, false))[0].possibleEggMoves : state.collectionState.eggMoveInfo[pokemon.name])
    const colorProp = colorOverride ? {color: colorOverride} : {} 
    const [popOutScreens, setPopOutScreens] = useState({emScreen: {selectedEm: '', open: 'firstRenderFalse'}, speciesSelectOpen: false, deleteModal: false})
    const toggleSpeciesSelect = () => setPopOutScreens({...popOutScreens, speciesSelectOpen: !popOutScreens.speciesSelectOpen})
    const toggleDeleteModal = () => setPopOutScreens({...popOutScreens, deleteModal: !popOutScreens.deleteModal})
    const toggleEditEggMoveScreen = (action) => {
        if (action !== 'close') {
            setPopOutScreens({...popOutScreens, emScreen: {open: true, selectedEm: pokemon.EMs.length}})
        } else if (action === 'close') {
            setPopOutScreens({...popOutScreens, emScreen: {open: false, selectedEm: ''}})
        }
    }
    const handleGenderChange = () => {
        const newGender = pokemon.gender === 'male' ? 'female' : pokemon.gender === 'female' ? 'unknown' : 'male'
        dispatch(setGender({idx: idxOfPokemon, gender: newGender}))
        dispatch(setOnhandChange({colId: collectionID, id: pokemon._id, field: 'gender', prevValue: pokemon.gender, currValue: newGender}))
    }
    const handleIsHAChange = (event) => {
        dispatch(setIsHA({idx: idxOfPokemon, listType}))
        dispatch(setOnhandChange({colId: collectionID, id: pokemon._id, field: 'isHA', currValue: !pokemon.isHA}))
    }
    const handleEmCountChange = (event) => {
        const newValue = selectNextEmCount(emCountSelectionList, parseInt(event.target.value))
        const hasAllPossibleEggMoves = (possibleEggMoves.length === maxEMs) && (newValue === maxEMs)
        setPopOutScreens({...popOutScreens, emScreen: {...popOutScreens.emScreen, selectedEm: ''}})
        dispatch(setEmCount({idx: idxOfPokemon, listType, numEMs: newValue}))
        dispatch(setOnhandChange({colId: collectionID, id: pokemon._id, field: 'emCount', prevValue: pokemon.emCount, currValue: newValue}))
        if (newValue < pokemon.EMs.length) {
            dispatch(deleteEms({idx: idxOfPokemon, listType}))
            dispatch(setOnhandChange({colId: collectionID, id: pokemon._id, field: 'EMs', prevValue: pokemon.EMs, currValue: []}))
        }
        if (hasAllPossibleEggMoves) {
            for (let eggmove of possibleEggMoves) {
                dispatch(setEms({idx: idxOfPokemon, listType, emName: eggmove}))
            }
            dispatch(setOnhandChange({colId: collectionID, id: pokemon._id, field: 'EMs', prevValue: pokemon.EMs, currValue: possibleEggMoves}))
        }
    }
    const handleEMChange = (event) => {
        const selectedEM = event.target.innerText
        const newEMArr = pokemon.EMs.includes(selectedEM) ? pokemon.EMs.filter(em => em !== selectedEM) : [...pokemon.EMs, selectedEM]
        // state change adds or removes egg moves based on innerText event
        const increaseEMCount = (newEMArr.length) > pokemon.emCount
        // if the new ems array is greater than the current emcount, increase the em count
        const decreaseEMCount = maxEMs === possibleEggMoves.length && pokemon.EMs.length > newEMArr.length
        // if the max possible ems is 4 or less AND we are taking out an egg move, decrease the em count
        const changeEMCount = increaseEMCount || decreaseEMCount
        dispatch(setEms({idx: idxOfPokemon, listType, emName: selectedEM}))
        dispatch(setOnhandChange({colId: collectionID, id: pokemon._id, field: 'EMs', prevValue: pokemon.EMs, currValue: newEMArr}))
        // next two if statements determine how the selected EM (selection box) moves depending on whether an egg move is being added (1st) or removed (2nd)
        if (!(pokemon.EMs.includes(selectedEM))) {
            const newSelectedEMIdx = (popOutScreens.emScreen.selectedEm === 3 && newEMArr === 4) ? '' : popOutScreens.emScreen.selectedEm+1 // if all egg moves slots are selected, remove selection borders. if not, select next empty slot
            setPopOutScreens({...popOutScreens, emScreen: {...popOutScreens.emScreen, selectedEm: newSelectedEMIdx}})
        } else if (pokemon.EMs.includes(selectedEM)) {
            setPopOutScreens({...popOutScreens, emScreen: {...popOutScreens.emScreen, selectedEm: ''}})
        }
        if (changeEMCount) {
            dispatch(setEmCount({idx: idxOfPokemon, listType, numEMs: newEMArr.length}))
            dispatch(setOnhandChange({colId: collectionID, id: pokemon._id, field: 'emCount', prevValue: pokemon.emCount, currValue: newEMArr.length}))
        }
    }
    const handleIncrementQty = () => {
        if (pokemon.qty < 99) {
            const newQty = pokemon.qty+1
            dispatch(setQty({idx: idxOfPokemon, qty: newQty}))
            dispatch(setOnhandChange({colId: collectionID, id: pokemon._id, field: 'qty', prevValue: pokemon.qty, currValue: newQty}))
        }
    }
    const handleDecrementQty = () => {
        if (pokemon.qty > 1) {
            const newQty = pokemon.qty-1
            dispatch(setQty({idx: idxOfPokemon, qty: newQty}))
            dispatch(setOnhandChange({colId: collectionID, id: pokemon._id, field: 'qty', prevValue: pokemon.qty, currValue: newQty}))
        }
    }
    const handleEmGenChange = (newEmGen) => {
        const newEMs = pokemon.EMs.filter(em => possibleEggMoves[newEmGen].includes(em))
        const newEmCount = pokemon.emCount > possibleEggMoves[newEmGen].length ? possibleEggMoves[newEmGen].length : pokemon.emCount
        const changedEMs = newEMs.length !== pokemon.EMs.length
        const changedEmCount = newEmCount !== pokemon.emCount
        dispatch(setEmGen({idx: idxOfPokemon, newEmGen, newEMs: changedEMs ? newEMs : undefined, newEmCount: changedEmCount ? newEmCount : undefined}))
        dispatch(setOnhandChange({colId: collectionID, id: pokemon._id, field: 'emGen', prevValue: pokemon.emGen, currValue: newEmGen}))
        if (changedEMs) {
            dispatch(setOnhandChange({colId: collectionID, id: pokemon._id, field: 'EMs', prevValue: pokemon.EMs, currValue: newEMs}))
        }
        if (changedEmCount) {
            dispatch(setOnhandChange({colId: collectionID, id: pokemon._id, field: 'emCount', prevValue: pokemon.emCount, currValue: newEmCount}))
        }

    }
    const maxEMs = !noEMs && (possibleEggMoves === undefined ? 0 : isHomeCollection ? (possibleEggMoves[pokemon.emGen].length > 4 ? 4 : possibleEggMoves[pokemon.emGen].length) : possibleEggMoves.length > 4 ? 4 : possibleEggMoves.length)
    const emCountSelectionList = setMaxEmArr(maxEMs) 

    return (
        <>
        <Box sx={{width: '100%', height: '100%', ...theme.components.box.fullCenterRow, position: 'relative'}}>
            <Box sx={{width: '100%', maxWidth: '376px', height: '100%', ...theme.components.box.fullCenterCol, justifyContent: 'start', gap: 1, position: 'relative', ...customBoxSx}}>
                <Box sx={{width: '100%', height: '30%', ...theme.components.box.fullCenterRow, gap: 1}}>
                    <QtySelectionForm
                        qty={pokemon.qty}
                        handleIncrement={customHandlerFuncs ? customHandlerFuncs.incrementQty : handleIncrementQty}
                        disabled={disabledSelections}
                        handleDecrement={customHandlerFuncs ? customHandlerFuncs.decrementQty : handleDecrementQty}
                        width='30%'
                    />
                    <HASelectionForm
                        noHA={noHA} 
                        isHA={pokemon.isHA} 
                        disabled={disabledSelections}
                        handleChange={customHandlerFuncs ? customHandlerFuncs.haChange : handleIsHAChange}
                        buttonSizes={'medium'}
                        width='30%'
                        {...colorProp}
                    />
                    <GenderSelectionForm 
                        gender={pokemon.gender} 
                        possibleGenders={possibleGender} 
                        handleChange={customHandlerFuncs ? customHandlerFuncs.genderChange :handleGenderChange}
                        width='30%'
                        newOnHand={modal}
                    />
                </Box>
                <Box sx={{width: '100%', height: emSelectionHeight, ...theme.components.box.fullCenterRow, gap: 0}}>
                    <EggMoveSelectionForm
                        noEMs={noEMs} 
                        emCount={pokemon.emCount}
                        EMs={pokemon.EMs}
                        maxEms={maxEMs}
                        disabled={disabledSelections}
                        idxOfSelectedEM={popOutScreens.emScreen.selectedEm}
                        handleEmCountChange={customHandlerFuncs ? customHandlerFuncs.emCountChange : handleEmCountChange}
                        handleEMChange={customHandlerFuncs ? customHandlerFuncs.emChange : handleEMChange}
                        toggleScreen={toggleEditEggMoveScreen}
                        isHomeCollection={isHomeCollection}
                        width='100%'
                        otherEmTextStyles={{fontSize: '14px'}}
                        {...colorProp}
                        {...emProps}
                        homeEmGen={pokemon.emGen}
                        changeHomeEmGen={customHandlerFuncs ? customHandlerFuncs.emGenChange :handleEmGenChange}
                        emGameData={allowedHomeEmGens}
                        list='onhand'
                    />
                </Box>
                {otherCustomButton &&
                <Box sx={{...theme.components.box.fullCenterRow, width: '100%', height: '10%', gap: 5}}>
                    {otherCustomButton()}
                    {!removeDeleteButton && 
                        <Button 
                            size='small' 
                            sx={{
                                backgroundColor: 'rgb(220, 53, 69)', 
                                color: 'white', 
                                border: '1px solid black', 
                                mt: isHomeCollection ? 8 : 2, 
                                ':hover': {
                                    cursor: 'pointer', 
                                    backgroundColor: 'rgb(250, 83, 99)'
                                }
                            }}
                            onClick={toggleDeleteModal}
                        >
                            Delete On-Hand
                        </Button>
                    }
                </Box>
                
                }
                {(!removeDeleteButton && !otherCustomButton) && 
                <Button 
                    size='small' 
                    sx={{
                        backgroundColor: 'rgb(220, 53, 69)', 
                        color: 'white', 
                        border: '1px solid black', 
                        mt: isHomeCollection ? 4 : 2, 
                        ':hover': {
                            cursor: 'pointer', 
                            backgroundColor: 'rgb(250, 83, 99)'
                        }
                    }}
                    onClick={toggleDeleteModal}
                >
                    Delete On-Hand
                </Button>}
            </Box>
            
        </Box>
        {(!noEMs && pokemon.emCount !== undefined) && 
        <SWEditEggMovesForm 
            EMs={pokemon.EMs}
            maxEms={maxEMs}
            emCount={pokemon.emCount}
            idxOfSelectedEM={popOutScreens.emScreen.selectedEm}
            possibleEggMoves={possibleEggMoves === undefined ? [] : isHomeCollection ? possibleEggMoves[pokemon.emGen] :  possibleEggMoves}
            toggleScreen={toggleEditEggMoveScreen}
            handleEMChange={customHandlerFuncs ? customHandlerFuncs.emChange : handleEMChange}
            toggleClass={popOutScreens.emScreen.open === 'firstRenderFalse' ? '' : popOutScreens.emScreen.open ? 'open-sw-em-selection' : 'close-sw-em-selection'}
        />}
        {!noSpeciesEdit && <Button sx={{width: '100vw', height: '45.016px', top: '0%', position: 'absolute', zIndex: 90}} onClick={toggleSpeciesSelect}></Button>}
        {!noSpeciesEdit && 
        <SmallWidthModalWrapper
            ariaLabel={'species select'}
            ariaDescribe='change the species of an on-hand pokemon'
            handleClose={toggleSpeciesSelect}
            open={popOutScreens.speciesSelectOpen}
        >
            <SWOnHandPokemonSelectionForm 
                collectionID={collectionID}
                speciesEditOnly={true}
                open={popOutScreens.speciesSelectOpen}
                handleClose={toggleSpeciesSelect}
                initialPokemonData={pokemon}
                isHomeCollection={isHomeCollection}
                demo={demo}
            />
        </SmallWidthModalWrapper>}
        {!noDelete &&
        <SmallWidthModalWrapper
            ariaLabel={'delete on-hand'}
            ariaDescribe='delete a single on-hand pokemon'
            handleClose={toggleDeleteModal}
            open={popOutScreens.deleteModal}
            sx={{height: '50%'}}
        >
            <SWDeleteSingleOnHand 
                handleClose={toggleDeleteModal}
                isHomeCollection={isHomeCollection}
                pokemonName={pokemon.name}
                dexNum={pokemon.natDexNum}
                ball={pokemon.ball}
                imgLink={pokemon.imgLink}
                isHA={pokemon.isHA}
                emCount={pokemon.emCount}
                emGen={pokemon.emGen}
                gender={pokemon.gender}
                isMaxEMs={pokemon.EMs !== undefined && pokemon.EMs.length === maxEMs}
                pokemonId={pokemon._id}
                collectionID={collectionID}
                demo={demo}
                additionalDispatchProps={additionalDeleteDispatchProps}
                additionalSuccessFunction={additionalDeleteSuccessFunction}
            />
        </SmallWidthModalWrapper>
        }
        </>
    )
}