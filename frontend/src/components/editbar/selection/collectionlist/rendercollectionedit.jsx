import {useState, useEffect, useTransition, useContext} from 'react'
import { ErrorContext } from '../../../../app/contexts/errorcontext'
import { AlertsContext } from '../../../../alerts/alerts-context'
import {useDispatch, connect, useSelector} from 'react-redux'
import store from './../../../../app/store'
import {setIsOwned, setIsHA, setEmCount, setEms, deleteEms, setDefault} from './../../../../app/slices/collectionstate'
import { setCollectionChange } from './../../../../app/slices/editmode'
import {setSelectedBall} from './../../../../app/slices/editmode'
import {Box, Typography, FormGroup, FormControl, FormControlLabel, FormLabel, ToggleButton} from '@mui/material'
import ImgData from '../../../collectiontable/tabledata/imgdata'
import {usePutRequest, useTagRequest} from './../../../../../utils/functions/backendrequests/editcollection'
import {setMaxEmArr, selectNextEmCount} from './../../../../../utils/functions/misc'
import getDefaultData, { changeDefaultDataToChangeFormat, handleMultipleDefaultData } from '../../../../../utils/functions/defaultdata'
import EditWrapper from './../components/editwrapper'
import BallSelectionForm from '../../editsectioncomponents/shared/ballselectionform'
import IsOwnedSelectionForm from '../../editsectioncomponents/collectioneditonly/isownedselectionform'
import HASelectionForm from '../../editsectioncomponents/shared/haselectionform'
import EggMoveSelectionForm from '../../editsectioncomponents/shared/eggmoveselectionform'
import EditEggMovesForm from '../../editsectioncomponents/shared/editeggmovesform'
import { getHighestEmGen } from '../../../collectiontable/tabledata/emindicator'
import { genGameAdjustments } from '../../../../../common/infoconstants/miscconstants.mjs'

function RenderCollectionEdit({collectionId, ownerId, pokemon, ballInfo, selectedBall, allEggMoves, isHomeCollection, subListIdx, collectionGen, dummyMain}) {
    const homeEmGenInit = useSelector((state) => state.collectionState.listDisplay.homeEMView)
    const [editEggMoves, setEditEggMoves] = useState({open: 'firstRenderFalse', idx: '', homeEmGen: (homeEmGenInit === 'hidden' || homeEmGenInit === 'highest') ? getHighestEmGen(pokemon.balls[selectedBall].eggMoveData) : homeEmGenInit})
    const dispatch = useDispatch()
    const {handleError} = useContext(ErrorContext)
    const {addAlert} = useContext(AlertsContext)
    const allowedBalls = Object.keys(ballInfo).filter(ball => ballInfo[ball].disabled === undefined)
    // const initState = allowedBalls.length === 3 || allowedBalls.length === 4 ? allowedBalls[1] : allowedBalls[0] 
    

    //useEffect(() => {
    //  dispatch(setSelectedBall(initState))
    //}, [])

    const listType = 'collection'
    
    const toggleClass = editEggMoves.open === true ? 'egg-moves-slide-in' : 
        editEggMoves.open === false && 'egg-moves-slide-out'
    
    //can update renderedBall to selectedBall in this file
    const renderedBall = selectedBall
    const trueEmGen = editEggMoves.homeEmGen
    const possibleEggMoves = isHomeCollection ? pokemon.possibleEggMoves[trueEmGen] : allEggMoves[pokemon.name]
    const selectedIdx = useSelector(state => state.collectionState.collection.findIndex(p => p.imgLink === pokemon.imgLink))
    const isOwnedState = pokemon.balls[renderedBall].isOwned
    const isHAState = pokemon.balls[renderedBall].isHA
    
    //default logic used for isOwned state and setDefault state
    const globalDefault = useSelector((state) => state.collectionState.options.globalDefaults)
    const superColGlobalDefault = useSelector((state) => (subListIdx !== undefined && state.collectionState.linkedCollections[0].gen !== 'dummy') ? state.collectionState.linkedCollections[0].options.globalDefaults : undefined)
    const monDataInSuperCol = useSelector((state) => subListIdx !== undefined ? state.collectionState.collection[selectedIdx] : undefined)
    const checkDefault = Object.keys(ballInfo)[Object.values(ballInfo).map((b) => b.default !== undefined).indexOf(true)]
    const currentDefault = checkDefault === undefined ? 'none' : checkDefault
    


    const noEMs = (pokemon.balls[renderedBall].EMs === undefined && pokemon.balls[renderedBall].eggMoveData === undefined)

    const emsUnavailableInGameGen = (isHomeCollection) && (noEMs ? true : pokemon.balls[renderedBall].eggMoveData[trueEmGen] === undefined)
    const emCountState = isHomeCollection ? emsUnavailableInGameGen ? 0 : pokemon.balls[renderedBall].eggMoveData[trueEmGen].emCount : pokemon.balls[renderedBall].emCount
    const EMs = isHomeCollection ? emsUnavailableInGameGen ? [] : pokemon.balls[renderedBall].eggMoveData[trueEmGen].EMs : pokemon.balls[renderedBall].EMs

    const noHA = pokemon.balls[renderedBall].isHA === undefined
    const maxEMs = (possibleEggMoves === undefined) ? 0 : possibleEggMoves.length > 4 ? 4 : possibleEggMoves.length
    const emCountSelectionList = setMaxEmArr(maxEMs) 

    const subListActive = subListIdx !== undefined
    const emsChangePrefix = subListActive ? collectionGen : isHomeCollection ? trueEmGen : ''
    const emsChangeField = emsChangePrefix ? `${genGameAdjustments[emsChangePrefix]}EMs` : 'EMs'
    const emCChangeField = emsChangePrefix ? `${genGameAdjustments[emsChangePrefix]}EmCount` : 'emCount'

    const handleBallChange = (event, newBall) => {
        dispatch(setSelectedBall(newBall))
    }
    const handleIsOwnedChange = (event) => {
        const newValue = event.target.checked
        const defaultData = (subListIdx !== undefined) ? 
            handleMultipleDefaultData(globalDefault, collectionGen, superColGlobalDefault, renderedBall, monDataInSuperCol.balls, monDataInSuperCol.possibleEggMoves) : 
            getDefaultData(globalDefault, currentDefault, pokemon.balls, maxEMs, possibleEggMoves, renderedBall, isHomeCollection)
        const prevDefaultData = newValue ? changeDefaultDataToChangeFormat(subListIdx !== undefined ? monDataInSuperCol.balls[renderedBall] : pokemon.balls[renderedBall], subListIdx !== undefined && collectionGen, true) : undefined
        dispatch(setIsOwned({idx: selectedIdx, ball: renderedBall, ballDefault: defaultData, subListIdx, currColGen: collectionGen, currDefault: currentDefault}))
        // if (unsavedChanges === false) {addAlert({severity: 'error', timeout: 4, message: 'You have unsaved changes. Make sure to save before leaving!'})}
        dispatch(setCollectionChange({id: pokemon.imgLink, ball: renderedBall, field: 'isOwned', currValue: newValue, prevDefaultData, defaultData: newValue && changeDefaultDataToChangeFormat(defaultData, isHomeCollection && trueEmGen)}))
        // const backendFunc = async() => await usePutRequest('isOwned', newValue, {pokename: pokemon.name, ballname: renderedBall}, 'collection', collectionId, ownerId, defaultData)
        // const successFunc = () => dispatch(setIsOwned({idx: selectedIdx, ball: renderedBall, ballDefault: defaultData}))
        // handleError(backendFunc, false, successFunc, () => {})
    }
    const handleIsHAChange = (event) => {
        const newValue = event.target.value === 'true' // event.target.value comes out as a string instead of boolean
        dispatch(setIsHA({idx: selectedIdx, ball: renderedBall, listType}))
        // if (unsavedChanges === false) {addAlert({severity: 'error', timeout: 4, message: 'You have unsaved changes. Make sure to save before leaving!'})}
        dispatch(setCollectionChange({id: pokemon.imgLink, ball: renderedBall, field: 'isHA', currValue: newValue}))
        // const successFunc = () => dispatch(setCollectionIsHA({idx: selectedIdx, ball: renderedBall, listType}))
        // const backendFunc = async() => await usePutRequest('isHA', newValue, {pokename: pokemon.name, ballname: renderedBall}, 'collection', collectionId, ownerId)
        // handleError(backendFunc, false, successFunc, () => {})
    }
    const handleEmCountChange = (event) => {
        const newValue = selectNextEmCount(emCountSelectionList, parseInt(event.target.value))
        
        // if (newValue < EMs.length) {
        //     const noEmSuccessFunc = () => dispatch(deleteCollectionEms({idx: selectedIdx, ball: renderedBall, listType}))
        //     const noEmBackendReq = async() => await usePutRequest('EMs', [], {pokename: pokemon.name, ballname: renderedBall}, 'collection', collectionId, ownerId)
        //     handleError(noEmBackendReq, false, noEmSuccessFunc, () => {})
        // }
        
        setEditEggMoves({...editEggMoves, idx: ''})
        const hasAllPossibleEggMoves = (possibleEggMoves.length === maxEMs) && (newValue === maxEMs)
        if (newValue < EMs.length) {
            dispatch(deleteEms({idx: selectedIdx, ball: renderedBall, listType, subListIdx, emGen: trueEmGen, currColGen: collectionGen}))
            dispatch(setCollectionChange({id: pokemon.imgLink, ball: renderedBall, field: emsChangeField, prevValue: EMs, currValue: []}))
        }
        if (hasAllPossibleEggMoves) {
            for (let eggmove of possibleEggMoves) {
                dispatch(setEms({idx: selectedIdx, ball: renderedBall, listType, emName: eggmove, subListIdx, emGen: trueEmGen, currColGen: collectionGen}))
            }
            dispatch(setCollectionChange({id: pokemon.imgLink, ball: renderedBall, field: emsChangeField, prevValue: EMs, currValue: possibleEggMoves}))
        }
        dispatch(setEmCount({idx: selectedIdx, ball: renderedBall, listType, numEMs: newValue, subListIdx, emGen: trueEmGen, currColGen: collectionGen}))
        // if (unsavedChanges === false) {addAlert({severity: 'error', timeout: 4, message: 'You have unsaved changes. Make sure to save before leaving!'})}
        dispatch(setCollectionChange({id: pokemon.imgLink, ball: renderedBall, field: emCChangeField, prevValue: emCountState, currValue: newValue}))
    }

    const handleEMChange = (event) => {
        if (event === 'onlyOnePossibleEM') {
            dispatch(setEms({idx: selectedIdx, ball: renderedBall, listType, emName: possibleEggMoves[0], subListIdx, emGen: trueEmGen, currColGen: collectionGen}))
            dispatch(setEmCount({idx: selectedIdx, ball: renderedBall, listType, numEMs: 1, subListIdx, emGen: trueEmGen, currColGen: collectionGen} ))
            dispatch(setCollectionChange({id: pokemon.imgLink, ball: renderedBall, field: emCChangeField, prevValue: emCountState, currValue: 1}))
            dispatch(setCollectionChange({id: pokemon.imgLink, ball: renderedBall, field: emsChangeField, prevValue: EMs, currValue: [possibleEggMoves[0]]}))
        } else {
            const selectedEM = event.target.innerText
            
            // const newEMArr = store.getState().collection[selectedIdx].balls[renderedBall].EMs
            const newEMArr = EMs.includes(selectedEM) ? EMs.filter(em => em !== selectedEM) : [...EMs, selectedEM]
            // state change adds or removes egg moves based on innerText event

            const increaseEMCount = (newEMArr.length) > emCountState
            // if the new ems array is greater than the current emcount, increase the em count
            const decreaseEMCount = maxEMs === possibleEggMoves.length && EMs.length > newEMArr.length
            // if the max possible ems is 4 or less AND we are taking out an egg move, decrease the em count
            const changeEMCount = increaseEMCount || decreaseEMCount
            dispatch(setEms({idx: selectedIdx, ball: renderedBall, listType, emName: selectedEM, subListIdx, emGen: trueEmGen, currColGen: collectionGen}))
            dispatch(setCollectionChange({id: pokemon.imgLink, ball: renderedBall, field: emsChangeField, prevValue: EMs, currValue: newEMArr}))
            if (changeEMCount) {
                dispatch(setEmCount({idx: selectedIdx, ball: renderedBall, listType, numEMs: newEMArr.length, subListIdx, emGen: trueEmGen, currColGen: collectionGen}))
                dispatch(setCollectionChange({id: pokemon.imgLink, ball: renderedBall, field: emCChangeField, prevValue: emCountState, currValue: newEMArr.length}))
            }
            // next two if statements determine how the selected EM (selection box) moves depending on whether an egg move is being added (1st) or removed (2nd)
            if (!(EMs.includes(selectedEM))) {
                const newSelectedEMIdx = (editEggMoves.idx === 3 && newEMArr === 4) ? '' : editEggMoves.idx+1 // if all egg moves slots are selected, remove selection borders. if not, select next empty slot
                setEditEggMoves({...editEggMoves, idx: newSelectedEMIdx})
            } else if (EMs.includes(selectedEM)) {
                setEditEggMoves({...editEggMoves, idx: ''})
            }
        }
    }

    const handleDefaultChange = () => {
        dispatch(setDefault({idx: selectedIdx, ball: renderedBall, prevDefault: currentDefault, subListIdx}))
        // if (unsavedChanges === false) {addAlert({severity: 'error', timeout: 4, message: 'You have unsaved changes. Make sure to save before leaving!'})}
        dispatch(setCollectionChange({id: pokemon.imgLink, ball: renderedBall, field: 'default', currValue: currentDefault === renderedBall ? 'none' : renderedBall, currDefault: currentDefault}))
        // const successFunc = () => dispatch(setDefault({idx: selectedIdx, ball: renderedBall, prevDefault: currentDefault}))
        // const backendReq = async() => await useTagRequest(renderedBall, currentDefault, {pokename: pokemon.name, ballname: renderedBall, default: true}, collectionId)
        // handleError(backendReq, false, successFunc, () => {})
    }

    const toggleEditEggMoveScreen = (idx) => {
        if (idx !== 'close') {
            setEditEggMoves({...editEggMoves, open: true, idx: EMs.length})
        } else if (idx === 'close') {
            setEditEggMoves({...editEggMoves, open: false, idx: ''})
        }
    }

    const changeHomeEmGen = (homeEmGen) => {
        setEditEggMoves({...editEggMoves, open: 'firstRenderFalse', idx: '', homeEmGen})
    }

    return (
        <EditWrapper imgLink={pokemon.imgLink} name={pokemon.name} natDexNum={pokemon.natDexNum}>
            <BallSelectionForm 
                allowedBalls={allowedBalls} 
                handleChange={handleBallChange} 
                value={renderedBall}
            />
            {/* 20% width */}
            <IsOwnedSelectionForm 
                isOwned={isOwnedState} 
                handleChange={handleIsOwnedChange}
            />
            {/* 10% width */}
            <HASelectionForm 
                noHA={noHA} 
                isHA={isHAState} 
                handleChange={handleIsHAChange}
                disabled={isOwnedState === false}
                buttonSizes={'small'}
            />
            {/* 15% width */}
            <EggMoveSelectionForm
                noEMs={noEMs} 
                emCount={emCountState}
                EMs={EMs}
                maxEms={maxEMs}
                idxOfSelectedEM={editEggMoves.idx}
                handleEmCountChange={handleEmCountChange}
                handleEMChange={handleEMChange}
                toggleScreen={toggleEditEggMoveScreen}
                changeHomeEmGen={changeHomeEmGen}
                disabled={isOwnedState === false}
                isHomeCollection={isHomeCollection}
                emsUnavailableInGameGen={emsUnavailableInGameGen}
                homeEmGen={trueEmGen}
                emGameData={pokemon.balls[renderedBall].eggMoveData}
            />
            {/* 40% width */}
            {(editEggMoves.open !== 'firstRenderFalse') &&
            <EditEggMovesForm 
                emCount={emCountState}
                EMs={EMs}
                maxEms={maxEMs}
                idxOfSelectedEM={editEggMoves.idx}
                possibleEggMoves={possibleEggMoves}
                toggleClass={toggleClass} 
                toggleScreen={toggleEditEggMoveScreen}
                handleEMChange={handleEMChange}
            />}
            {(ballInfo[renderedBall].isOwned === true && !(ballInfo[renderedBall].isHA === undefined && ballInfo[renderedBall].EMs === undefined)) && 
            <ToggleButton 
                sx={{width: '10%', fontSize: ballInfo[renderedBall].default !== undefined ? '10px' : '11px', padding: 0, border: 'none', marginLeft: '3%', color: '#73661e'}}
                size='small'
                value='default'
                selected={ballInfo[renderedBall].default !== undefined}
                onClick={handleDefaultChange}
            >
                {ballInfo[renderedBall].default !== undefined ? 'Current Default' : 'Set as Default'}
            </ToggleButton>}
            {/* 13% width */}
        </EditWrapper>
    )
}

//having selectedBall as a global state allows to set the selected ball after changing isOwned from the table to true. refer to editmode reducers.
//if you find a way to get around that, we can completely remove this part of the store.
function mapStateToProps(state) {
    const selectedBall = state.editmode.selectedBall
    return ({selectedBall})
}

export default connect(mapStateToProps)(RenderCollectionEdit)