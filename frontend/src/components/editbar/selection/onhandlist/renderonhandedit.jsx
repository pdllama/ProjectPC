import {useState, useContext} from 'react'
import { ErrorContext } from '../../../../app/contexts/errorcontext'
import { AlertsContext } from '../../../../alerts/alerts-context'
import {Box, Typography, FormGroup} from '@mui/material'
import {useDispatch, connect, useSelector} from 'react-redux'
import {selectCollectionPokemon} from './../../../../app/selectors/selectors'
import {setBall, setGender, setIsHA, setEmCount, setEms, deleteEms, setQty, setEmGen} from './../../../../app/slices/collectionstate'
import { setOnhandChange } from '../../../../app/slices/editmode'
import {getOwnedBalls, setMaxEmArr, selectNextEmCount} from './../../../../../utils/functions/misc'
import EditWrapper from './../components/editwrapper'
import OnHandPokemonSelectionForm from '../../editsectioncomponents/onhandeditonly/onhandpokemonselectionform'
import BallSelectionForm from '../../editsectioncomponents/shared/ballselectionform'
import GenderSelectionForm from '../../editsectioncomponents/onhandeditonly/genderselectionform'
import HASelectionForm from '../../editsectioncomponents/shared/haselectionform'
import EggMoveSelectionForm from '../../editsectioncomponents/shared/eggmoveselectionform'
import EditEggMovesForm from '../../editsectioncomponents/shared/editeggmovesform'
import QtySelectionForm from '../../editsectioncomponents/onhandeditonly/qtyselectionform'
import { usePutRequest } from '../../../../../utils/functions/backendrequests/editcollection'
import '../../../../../utils/styles/componentstyles/eggmoveselection.css'
import store from '../../../../app/store'

export default function RenderOnHandEdit({collectionId, ownerId, pokemon, idxOfPokemon, allEggMoves, isHomeCollection, demo, disableSpeciesEdit=false, setSelectedBall=false}) {
    const [popOutScreens, setPopOutScreens] = useState({eggmoveScreen: {open: 'firstRenderFalse', idx: ''}, pokemonSelection: false})
    const {handleError} = useContext(ErrorContext)
    const {addAlert} = useContext(AlertsContext)
    const dispatch = useDispatch()
    const listType = 'onhand'
    const unsavedOnhandChanges = useSelector((state) => state.editmode.unsavedOnhandChanges)

    const handleOpen = () => setPopOutScreens({...popOutScreens, pokemonSelection: true})
    const handleClose = () => setPopOutScreens({...popOutScreens, pokemonSelection: false})
    const toggleEditEggMoveScreen = (action) => {
        if (action !== 'close') {
            setPopOutScreens({...popOutScreens, eggmoveScreen: {open: true, idx: pokemon.EMs.length}})
        } else if (action === 'close') {
            setPopOutScreens({...popOutScreens, eggmoveScreen: {open: false, idx: ''}})
        }
    }

    const handleBallChange = (e, newBall) => {
        dispatch(setBall({idx: idxOfPokemon, ball: newBall, setSelectedBall}))
        // if (unsavedOnhandChanges === false) {addAlert({severity: 'error', timeout: 4, message: 'You have unsaved on-hand changes. Make sure to save before leaving!'})}
        dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'ball', prevValue: pokemon.ball, currValue: newBall}))
        // const successFunc = () => dispatch(setBall({idx: idxOfPokemon, ball: newBall}))
        // const backendFunc = async() => await usePutRequest('ball', newBall, {id: pokemon._id}, 'onhand', collectionId, ownerId)
        // handleError(backendFunc, false, successFunc, () => {})
    }
    const handleGenderChange = () => {
        const newGender = pokemon.gender === 'male' ? 'female' : pokemon.gender === 'female' ? 'unknown' : 'male'
        dispatch(setGender({idx: idxOfPokemon, gender: newGender}))
        dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'gender', prevValue: pokemon.gender, currValue: newGender}))
    }
    const handleIsHAChange = (event) => {
        const newValue = event.target.value === 'true'
        dispatch(setIsHA({idx: idxOfPokemon, listType}))
        // if (unsavedOnhandChanges === false) {addAlert({severity: 'error', timeout: 4, message: 'You have unsaved on-hand changes. Make sure to save before leaving!'})}
        dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'isHA', currValue: !pokemon.isHA}))
        // const successFunc = () => dispatch(setOnHandIsHA({idx: idxOfPokemon, listType}))
        // const backendFunc = async() => await usePutRequest('isHA', newValue, {id: pokemon._id}, 'onhand', collectionId, ownerId)
        // handleError(backendFunc, false, successFunc, () => {})
    }

    const handleEmCountChange = (event) => {
        const newValue = selectNextEmCount(emCountSelectionList, parseInt(event.target.value))
        // if (newValue < pokemon.EMs.length) {
        //     dispatch(deleteOnHandEms({idx: idxOfPokemon, listType}))
        //     usePutRequest('EMs', [], {id: pokemon._id}, 'onhand', collectionId, ownerId)
        // }
        const hasAllPossibleEggMoves = (possibleEggMoves.length === maxEMs) && (newValue === maxEMs)
        setPopOutScreens({...popOutScreens, eggmoveScreen: {...popOutScreens.eggmoveScreen, idx: ''}})
        dispatch(setEmCount({idx: idxOfPokemon, listType, numEMs: newValue}))
        dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'emCount', prevValue: pokemon.emCount, currValue: newValue}))
        if (newValue < pokemon.EMs.length) {
            dispatch(deleteEms({idx: idxOfPokemon, listType}))
            dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'EMs', prevValue: pokemon.EMs, currValue: []}))
        }
        if (hasAllPossibleEggMoves) {
            for (let eggmove of possibleEggMoves) {
                dispatch(setEms({idx: idxOfPokemon, listType, emName: eggmove}))
            }
            dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'EMs', prevValue: pokemon.EMs, currValue: possibleEggMoves}))
        }
        // if (unsavedOnhandChanges === false) {addAlert({severity: 'error', timeout: 4, message: 'You have unsaved on-hand changes. Make sure to save before leaving!'})}
        // const successFunc = () => {
        //     setPopOutScreens({...popOutScreens, eggmoveScreen: {...popOutScreens.eggmoveScreen, idx: ''}})
        //     dispatch(setOnHandEmCount({idx: idxOfPokemon, listType, numEMs: newValue}))
        //     if (newValue < pokemon.EMs.length) {
        //         dispatch(deleteOnHandEms({idx: idxOfPokemon, listType}))
        //     }
        //     if (hasAllPossibleEggMoves) {
        //         for (let eggmove of possibleEggMoves) {
        //             dispatch(setOnHandEms({idx: idxOfPokemon, listType, emName: eggmove}))
        //         }
        //     }
        // }
        // const backendReq = async() => await usePutRequest('emCount', newValue, {id: pokemon._id}, 'onhand', collectionId, ownerId, newValue < pokemon.EMs.length ? {EMs: []} : hasAllPossibleEggMoves ? {EMs: possibleEggMoves} : undefined)
        // handleError(backendReq, false, successFunc, () => {})
        // if (hasAllPossibleEggMoves) {
        //     for (let eggmove of possibleEggMoves) {
        //         dispatch(setOnHandEms({idx: idxOfPokemon, listType, emName: eggmove}))
        //     }
        //     usePutRequest('EMs', possibleEggMoves, {id: pokemon._id}, 'onhand', collectionId, ownerId)
        // }
        
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
        dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'EMs', prevValue: pokemon.EMs, currValue: newEMArr}))
        // next two if statements determine how the selected EM (selection box) moves depending on whether an egg move is being added (1st) or removed (2nd)
        if (!(pokemon.EMs.includes(selectedEM))) {
            const newSelectedEMIdx = (popOutScreens.eggmoveScreen.idx === 3 && newEMArr === 4) ? '' : popOutScreens.eggmoveScreen.idx+1 // if all egg moves slots are selected, remove selection borders. if not, select next empty slot
            setPopOutScreens({...popOutScreens, eggmoveScreen: {...popOutScreens.eggmoveScreen, idx: newSelectedEMIdx}})
        } else if (pokemon.EMs.includes(selectedEM)) {
            setPopOutScreens({...popOutScreens, eggmoveScreen: {...popOutScreens.eggmoveScreen, idx: ''}})
        }
        if (changeEMCount) {
            dispatch(setEmCount({idx: idxOfPokemon, listType, numEMs: newEMArr.length}))
            dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'emCount', prevValue: pokemon.emCount, currValue: newEMArr.length}))
        }
        // if (unsavedOnhandChanges === false) {addAlert({severity: 'error', timeout: 4, message: 'You have unsaved on-hand changes. Make sure to save before leaving!'})}
    }
    const handleIncrementQty = () => {
        if (pokemon.qty < 99) {
            const newQty = pokemon.qty+1
            dispatch(setQty({idx: idxOfPokemon, qty: newQty}))
            // if (unsavedOnhandChanges === false) {addAlert({severity: 'error', timeout: 4, message: 'You have unsaved on-hand changes. Make sure to save before leaving!'})}
            dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'qty', prevValue: pokemon.qty, currValue: newQty}))
            // const successFunc = () => dispatch(setQty({idx: idxOfPokemon, qty: newQty}))
            // const backendFunc = async() => await usePutRequest('qty', newQty, {id: pokemon._id}, 'onhand', collectionId, ownerId)
            // handleError(backendFunc, false, successFunc, () => {})
        }
    }
    const handleDecrementQty = () => {
        if (pokemon.qty > 1) {
            const newQty = pokemon.qty-1
            dispatch(setQty({idx: idxOfPokemon, qty: newQty}))
            // if (unsavedOnhandChanges === false) {addAlert({severity: 'error', timeout: 4, message: 'You have unsaved on-hand changes. Make sure to save before leaving!'})}
            dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'qty', prevValue: pokemon.qty, currValue: newQty}))
            // const successFunc = () => dispatch(setQty({idx: idxOfPokemon, qty: newQty}))
            // const backendFunc = async() => await usePutRequest('qty', newQty, {id: pokemon._id}, 'onhand', collectionId, ownerId)
            // handleError(backendFunc, false, successFunc, () => {})
        }
    }

    

    const ownedPokemonInfo = selectCollectionPokemon(store.getState(), pokemon.imgLink)
    //below is like that as it prevents errors arising from a user having a certain onhand ball combo then changing the ball scope of that ball,
    //resulting in the collection data being wiped. 
    const allowedBalls = !getOwnedBalls(ownedPokemonInfo.balls).includes(pokemon.ball) ? [...getOwnedBalls(ownedPokemonInfo.balls), pokemon.ball] : getOwnedBalls(ownedPokemonInfo.balls)
    const possibleGenders = ownedPokemonInfo.possibleGender
    const noHA = ownedPokemonInfo.balls[pokemon.ball].isHA === undefined
    const noEMs = ownedPokemonInfo.balls[pokemon.ball].EMs === undefined && ownedPokemonInfo.balls[pokemon.ball].eggMoveData === undefined
    const possibleEggMoves = (isHomeCollection) ? ownedPokemonInfo.possibleEggMoves[pokemon.emGen] : allEggMoves[pokemon.name]
    const maxEMs = possibleEggMoves === undefined ? 0 : possibleEggMoves.length > 4 ? 4 : possibleEggMoves.length
    const emCountSelectionList = setMaxEmArr(maxEMs) 
    const allowedHomeEmGens = isHomeCollection && !noEMs ? Object.keys(ownedPokemonInfo.balls[pokemon.ball].eggMoveData) : []

    const handleEmGenChange = (newEmGen) => {
        const newEMs = pokemon.EMs.filter(em => ownedPokemonInfo.possibleEggMoves[newEmGen].includes(em))
        const newEmCount = pokemon.emCount > ownedPokemonInfo.possibleEggMoves[newEmGen].length ? ownedPokemonInfo.possibleEggMoves[newEmGen].length : pokemon.emCount
        const changedEMs = newEMs.length !== pokemon.EMs.length
        const changedEmCount = newEmCount !== pokemon.emCount
        dispatch(setEmGen({idx: idxOfPokemon, newEmGen, newEMs: changedEMs ? newEMs : undefined, newEmCount: changedEmCount ? newEmCount : undefined}))
        dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'emGen', prevValue: pokemon.emGen, currValue: newEmGen}))
        if (changedEMs) {
            dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'EMs', prevValue: pokemon.EMs, currValue: newEMs}))
        }
        if (changedEmCount) {
            dispatch(setOnhandChange({colId: collectionId, id: pokemon._id, field: 'emCount', prevValue: pokemon.emCount, currValue: newEmCount}))
        }
    }

    const toggleClass = popOutScreens.eggmoveScreen.open === true ? 'egg-moves-slide-in' : 
        popOutScreens.eggmoveScreen.open === false && 'egg-moves-slide-out'
    return (
        <EditWrapper customNameWrapperStyles={{height: '100%'}} imgLink={pokemon.imgLink} name={pokemon.name} natDexNum={pokemon.natDexNum} onClickFunc={disableSpeciesEdit ? undefined : handleOpen}>
            {!disableSpeciesEdit && <OnHandPokemonSelectionForm speciesEditOnly={true} open={popOutScreens.pokemonSelection} handleClose={handleClose} initialPokemonData={pokemon} idxOfInitialPokemon={idxOfPokemon} demo={demo}/>}
            <BallSelectionForm allowedBalls={allowedBalls} handleChange={handleBallChange} value={pokemon.ball} width='18%'/>
            <GenderSelectionForm gender={pokemon.gender} possibleGenders={possibleGenders} handleChange={handleGenderChange}/>
            <HASelectionForm noHA={noHA} isHA={pokemon.isHA} handleChange={handleIsHAChange} buttonSizes='small'/>
            <EggMoveSelectionForm 
                noEMs={noEMs}
                emCount={pokemon.emCount}
                EMs={pokemon.EMs}
                maxEms={maxEMs}
                idxOfSelectedEM={popOutScreens.eggmoveScreen.idx}
                handleEmCountChange={handleEmCountChange}
                handleEMChange={handleEMChange}
                toggleScreen={toggleEditEggMoveScreen}
                isHomeCollection={isHomeCollection}
                changeHomeEmGen={handleEmGenChange}
                homeEmGen={pokemon.emGen}
                emGameData={allowedHomeEmGens}
                list='onhand'
            />
            {(popOutScreens.eggmoveScreen.open !== 'firstRenderFalse') &&
            <EditEggMovesForm 
                emCount={pokemon.emCount}
                EMs={pokemon.EMs}
                maxEms={maxEMs}
                idxOfSelectedEM={popOutScreens.eggmoveScreen.idx}
                possibleEggMoves={possibleEggMoves}
                toggleClass={toggleClass}
                toggleScreen={toggleEditEggMoveScreen}
                handleEMChange={handleEMChange}
            />}
            <QtySelectionForm qty={pokemon.qty} handleIncrement={handleIncrementQty} handleDecrement={handleDecrementQty}/>
        </EditWrapper>
    )
}