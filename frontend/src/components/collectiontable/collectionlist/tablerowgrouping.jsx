import * as React from 'react';
import {useState, useEffect, useRef, useContext} from 'react'
import { ErrorContext } from '../../../app/contexts/errorcontext';
import { AlertsContext } from '../../../alerts/alerts-context';
import Box from '@mui/material/Box'
import './../../../routes/showCollection.css'
import TableCell from '@mui/material/TableCell'
import IsOwnedCheckbox from '../tabledata/isownedcheckbox'
import DataCell from '../tabledata/datacell'
import {useLoaderData} from 'react-router-dom'
import {useSelector, useDispatch, connect} from 'react-redux'
import {setIsOwned, setIsHA, setEmCount, setEms, deleteEms} from './../../../app/slices/collectionstate'
import {setMaxEmArr, selectNextEmCount} from './../../../../utils/functions/misc'
import {seeIfPokemonIsSelected, selectCollectionPokemon, selectIdxOfMon, selectUnsavedChanges} from './../../../app/selectors/selectors'
import {setSelected, deselect, setSelectedAfterChangingOwned, setCollectionChange, setHomeEmBuffer} from './../../../app/slices/editmode'
import {usePutRequest} from './../../../../utils/functions/backendrequests/editcollection'
import getDefaultData, { changeDefaultDataToChangeFormat, handleMultipleDefaultData } from '../../../../utils/functions/defaultdata';
import { apriballs } from '../../../../common/infoconstants/miscconstants.mjs';
import getNameDisplay from '../../../../utils/functions/display/getnamedisplay';
import {createSelector} from '@reduxjs/toolkit'
import {setCollectionInitialState} from '../../../app/slices/collection'
import store from '../../../app/store'
import newObjectId from '../../../../utils/functions/newobjectid';

const blackTableCellStyles = { //for illegal ball combos
    color: 'white',
    backgroundColor: 'black'
}

const disabledTableCellStyles = { //for disabled ball combos (which the user purposefully doesn't wanna collect)
    color: 'white',
    backgroundColor: 'grey'
}

export function TableRowGroupingNoRedux({columns, row, id, collectionId, ownerId, styles, isHomeCollection, availableGames, isTradePage, tradeSide, wantedByOtherList, userData, otherListGen}) {
    //mainly used for trade page, since most of that editing/selecting functionality is not needed. 'no redux' might be misleading.
    const showHAView = useSelector((state) => state.collectionState.listDisplay.showHAView)
    return (
        <React.Fragment>
            {columns.map(c => {
                const isImg = c.label === 'img' && true
                const textSizeAdjustor = c.dataKey === 'name' && row[c.dataKey] === 'Basculin (White-Striped)' ? {fontSize: '13px'} : {}
                const validBallCombo = apriballs.includes(c.dataKey) && (row.balls[c.dataKey] !== undefined && row.balls[c.dataKey].disabled !== true)
                const isBallColumn = row.balls[c.dataKey] !== undefined
                const wantedData = isBallColumn && (wantedByOtherList[0] === undefined ? {} : wantedByOtherList[0].balls.includes(c.dataKey) ? {wanted: true} : {})
                const nameLabel = (c.dataKey === 'name' && userData.loggedIn) ? getNameDisplay(userData.user.settings.display.pokemonNames, row[c.dataKey], row.natDexNum) : c.dataKey === 'name' && row[c.dataKey]
                
                return (
                    c.label === '#' ? 
                        <DataCell
                            key={`${row.imgLink}-${c.label}`}
                            label={row[c.dataKey]} 
                            styles={styles} 
                            alignment={styles.alignment.numAlignment}
                            isEditMode={false}
                            leftMostCell={true}
                            isSelected={false}
                            onClickFunc={null}
                        /> :
                    row[c.dataKey] !== undefined ? 
                        <DataCell 
                            key={`${row.imgLink}-${c.label}`}
                            label={c.dataKey === 'name' && nameLabel}
                            styles={styles}
                            alignment={c.label === 'img' ? styles.alignment.imgAlignment : c.dataKey === 'name' && {position: 'relative'}}
                            imgParams={{isImg: isImg, imgLinkKey: row.imgLink}}
                            specialStyles={textSizeAdjustor}
                            isEditMode={false}
                            isSelected={false}
                            onClickFunc={null}
                            availableGames={(availableGames === undefined || showHAView) ? undefined : c.dataKey === 'name' ? availableGames[row.name] : undefined}
                            haName={(showHAView && c.dataKey === 'name') ? row.haName : undefined}
                        />:
                    row.balls[c.dataKey] === undefined ? 
                        <TableCell sx={blackTableCellStyles} key={`${row.imgLink}-${c.label}`}>
                        </TableCell> :
                    row.balls[c.dataKey].disabled === true ? 
                        <TableCell sx={disabledTableCellStyles} key={`${row.imgLink}-${c.label}`}>
                        </TableCell> :
                    <IsOwnedCheckbox
                        key={`${row.imgLink}-${c.label}`} 
                        ballInfo={row.balls}
                        handleEditBallInfo={null}
                        pokeName={row.name}
                        ball={c.dataKey}
                        collectionId={collectionId}
                        ownerId={ownerId}
                        styles={styles}
                        isEditMode={false}
                        isHomeCollection={isHomeCollection}
                        isTradePage={isTradePage}
                        tradeSide={tradeSide}
                        tradeDispData={isTradePage && {
                            pData: {name: row.name, id: row.imgLink, natDexNum: row.natDexNum},
                            ballData: {
                                ball: c.dataKey, 
                                ...wantedData,
                                ...row.balls[c.dataKey]
                            },
                            otherListGen
                        }}
                        pAvailableGames={isHomeCollection && availableGames[row.name]}
                    />
                )
            })}
        </React.Fragment>
    )
}

//dont remove id, mapStateToProps uses it
function TableRowGrouping({columns, row, id, collectionId, ownerId, styles, isSelected, setSelected, isEditMode, demo, isHomeCollection, userData, subListIdx, currColGen, dummyMain}) {    
    const dispatch = useDispatch()
    // console.log(`rendered ${row.name}`)

    if (row === undefined) { //when switching between collections theres seems to be a bit of lag in updating the state, even though i tried to stop it.
        return <>
            {columns.map(c => {
                return (
                    <TableCell key={`${id}-${c.dataKey}-${newObjectId()}-undefined-row`} sx={{backgroundColor: 'black'}}></TableCell>
                )
            })}
        </>
    }

    const {handleError} = useContext(ErrorContext)
    const {addAlert} = useContext(AlertsContext)
    //following data is used for editing values in the list
    // console.log(useSelector((state) => state.collectionState.eggMoveInfo))
    const possibleEggMoves = ((isEditMode || demo) && !isHomeCollection) ? useSelector((state) => state.collectionState.eggMoveInfo[row.name]) : isHomeCollection ? row.possibleEggMoves : null
    const maxEMs = ((isEditMode || demo) && !isHomeCollection) ? possibleEggMoves.length > 4 ? 4 : possibleEggMoves.length : null
    const emCountSelectionList = ((isEditMode || demo)) ? setMaxEmArr(maxEMs) : null
    const idx = (isEditMode || demo) ? useSelector(state => state.collectionState.collection.findIndex((p) => p.imgLink === id)) : null

    //available games and ha view data
    const availableGames = (isHomeCollection) ? useSelector((state) => state.collectionState.availableGamesInfo[row.name]) : null
    const haView = (isHomeCollection) ? useSelector((state) => state.collectionState.listDisplay.showHAView) : null

    //default data and data used for it
    const globalDefaults = (isEditMode || demo) ? useSelector((state) => state.collectionState.options.globalDefaults) : null
    const superColGlobalDefault = (isEditMode || demo) ? useSelector((state) => (subListIdx !== undefined && !dummyMain) ? state.collectionState.linkedCollections[0].options.globalDefaults : undefined) : null
    const monDataInSuperCol = useSelector((state) => subListIdx !== undefined ? state.collectionState.collection[idx] : undefined) 
    const checkDefault = Object.keys(row.balls)[Object.values(row.balls).map((b) => b.default !== undefined).indexOf(true)]
    const currentDefault = checkDefault === undefined ? 'none' : checkDefault

    const handleEditBallInfo = (e, key, pokename, ballname, emGen, currEmCount, tag) => {
        const trueMaxEMs = (key === 'emCount' && isHomeCollection) ? (possibleEggMoves[emGen].length > 4 ? 4 : possibleEggMoves[emGen].length) : maxEMs
        const trueEmCountSelectionList = setMaxEmArr(trueMaxEMs)
        const newValue = 
            (
                key === 'isOwned' ? e.target.checked :
                key === 'isHA' ? !(e.target.value === 'true') :
                key === 'emCount' ? selectNextEmCount(trueEmCountSelectionList, isHomeCollection ? currEmCount : parseInt(e.target.value)) :
                key === 'EMs' && 'none'
            )
        
        const deleteEMs = key === 'emCount' && (isHomeCollection ? row.balls[ballname].eggMoveData[emGen].EMs.length > newValue : row.balls[ballname].EMs.length > newValue)
        const hasAllPossibleEMs = key === 'emCount' && (isHomeCollection ? newValue === possibleEggMoves[emGen].length : newValue === possibleEggMoves.length)
        // const defaultData = key === 'emCount' ? (deleteEMs ? {EMs: []} : hasAllPossibleEMs ? {EMs: possibleEggMoves} : undefined) : getDefaultData(globalDefaults, currentDefault, row.balls, maxEMs, possibleEggMoves, ballname)
        const defaultData = (subListIdx !== undefined && !dummyMain) ? handleMultipleDefaultData(globalDefaults, currColGen, superColGlobalDefault, ballname, monDataInSuperCol.balls, monDataInSuperCol.possibleEggMoves) : getDefaultData(globalDefaults, currentDefault, row.balls, trueMaxEMs, possibleEggMoves, ballname, isHomeCollection)
        // const successFunc = () => {
        if (key === 'isOwned') {
            const prevDefaultData = newValue ? changeDefaultDataToChangeFormat(subListIdx !== undefined ? monDataInSuperCol.balls[ballname] : row.balls[ballname], subListIdx !== undefined && currColGen, true) : undefined
            if (newValue === true) {
                dispatch(setSelectedAfterChangingOwned({idx: id, ball: ballname}))
            }
            dispatch(setIsOwned({idx, ball: ballname, ballDefault: defaultData, subListIdx, currColGen, currDefault: currentDefault}))
            dispatch(setCollectionChange({id: row.imgLink, ball: ballname, field: 'isOwned', currValue: newValue, 
                    prevDefaultData, 
                    defaultData: newValue && changeDefaultDataToChangeFormat(defaultData, subListIdx !== undefined && currColGen)
                }))
            
        } else if (key === 'isHA') {
            dispatch(setIsHA({idx, ball: ballname, listType: 'collection', subListIdx}))
            dispatch(setCollectionChange({id: row.imgLink, ball: ballname, field: 'isHA', currValue: newValue}))
        } else if (key === 'emCount') {
            const prevValue = isHomeCollection ? currEmCount : parseInt(e.target.value)
            const genKey = isHomeCollection ? (emGen === '9' || emGen === 9) ? 'sv' : emGen : subListIdx !== undefined ? (currColGen === '9' || currColGen === 9) ? 'sv' : currColGen : ''
            dispatch(setEmCount({idx, ball: ballname, listType: 'collection', numEMs: newValue, subListIdx, emGen, currColGen}))
            dispatch(setCollectionChange({id: row.imgLink, ball: ballname, field: `${genKey}${genKey ? 'E' : 'e'}mCount`, prevValue, currValue: newValue}))
            if (deleteEMs) {
                const prevEMs = isHomeCollection ? row.balls[ballname].eggMoveData[emGen].EMs : row.balls[ballname].EMs
                dispatch(deleteEms({idx, ball: ballname, listType: 'collection', subListIdx, emGen, currColGen}))
                dispatch(setCollectionChange({id: row.imgLink, ball: ballname, field: `${genKey}EMs`, prevValue: prevEMs, currValue: []}))
            }
            if (hasAllPossibleEMs) {
                const prevEMs = isHomeCollection ? row.balls[ballname].eggMoveData[emGen].EMs : row.balls[ballname].EMs
                const iterate = isHomeCollection ? possibleEggMoves[emGen] : possibleEggMoves
                for (let eggmove of iterate) {
                    dispatch(setEms({idx, ball: ballname, listType: 'collection', emName: eggmove, subListIdx, emGen, currColGen}))
                }
                dispatch(setCollectionChange({id: row.imgLink, ball: ballname, field: `${genKey}EMs`, prevValue: prevEMs, currValue: iterate}))
            }
            if (isHomeCollection) {
                dispatch(setHomeEmBuffer(emGen))
            }
        }
        // }}
        // const backendFunc = async() => await usePutRequest(key, newValue, {pokename, ballname}, 'collection', collectionID, ownerID, defaultData)
        // handleError(backendFunc, false, successFunc, () => {})
    }

    const blackTableCellStyles = { //for illegal ball combos
        color: 'white',
        backgroundColor: 'black'
    }

    const disabledTableCellStyles = { //for disabled ball combos (which the user purposefully doesn't wanna collect)
        color: 'white',
        backgroundColor: 'grey'
    }

    return (
        <React.Fragment>
            {columns.map(c => {
                const isImg = c.label === 'img' && true
                const textSizeAdjustor = c.dataKey === 'name' && row[c.dataKey] === 'Basculin (White-Striped)' ? {fontSize: '13px'} : {}
                const validBallCombo = apriballs.includes(c.dataKey) && (row.balls[c.dataKey] !== undefined && row.balls[c.dataKey].disabled !== true)
                const nameLabel = (c.dataKey === 'name' && userData.loggedIn) ? getNameDisplay(userData.user.settings.display.pokemonNames, row[c.dataKey], row.natDexNum) : c.dataKey === 'name' && row[c.dataKey]
                return (
                    c.label === '#' ? 
                        <DataCell
                            key={`${row.imgLink}-${c.label}`}
                            label={row[c.dataKey]} 
                            styles={styles} 
                            alignment={styles.alignment.numAlignment}
                            isEditMode={isEditMode}
                            leftMostCell={true}
                            isSelected={isSelected}
                            onClickFunc={isSelected ? null : setSelected}
                        /> :
                    row[c.dataKey] !== undefined ? 
                        <DataCell 
                            key={`${row.imgLink}-${c.label}`}
                            label={c.dataKey === 'name' && nameLabel}
                            styles={styles}
                            alignment={c.label === 'img' ? styles.alignment.imgAlignment : c.dataKey === 'name' && {position: 'relative'}}
                            imgParams={{isImg: isImg, imgLinkKey: row.imgLink}}
                            specialStyles={textSizeAdjustor}
                            isEditMode={isEditMode}
                            isSelected={isSelected}
                            onClickFunc={isSelected ? null : setSelected}
                            availableGames={(availableGames === null) ? undefined : c.dataKey === 'name' ? availableGames : undefined}
                            haName={((isHomeCollection && haView === false) ? undefined : c.dataKey === 'name' ? row.haName : undefined)}
                        />:
                    row.balls[c.dataKey] === undefined ? 
                        <TableCell sx={blackTableCellStyles} key={`${row.imgLink}-${c.label}`}>
                        </TableCell> :
                    row.balls[c.dataKey].disabled === true ? 
                        <TableCell sx={disabledTableCellStyles} key={`${row.imgLink}-${c.label}`}>
                        </TableCell> :
                    <IsOwnedCheckbox
                        key={`${row.imgLink}-${c.label}`} 
                        id={row.imgLink}
                        ballInfo={row.balls}
                        isSelectedEditPage={isSelected}
                        handleEditBallInfo={handleEditBallInfo}
                        pokeName={row.name}
                        ball={c.dataKey}
                        collectionId={collectionId}
                        ownerId={ownerId}
                        styles={styles}
                        isEditMode={isEditMode}
                        isHomeCollection={isHomeCollection}
                        pAvailableGames={availableGames}
                    />
                )
            })}
        </React.Fragment>
    )
}

const mapStateToProps = function(state, ownProps) {
    if (!ownProps.isEditMode && !ownProps.demo) {
        return {}
    } 
    const isPokemonSelected = seeIfPokemonIsSelected(state, ownProps.id)
    // const pokemon = state.collection[ownProps.idx]
    const pokemon = selectCollectionPokemon(state, ownProps.id)
    const subListIdx = (state.collectionState.linkedCollections !== undefined && state.collectionState.linkedSelectedIdx !== 0) && state.collectionState.subList.findIndex(p => p.imgLink === ownProps.id)
    const dummyMain = state.collectionState.linkedCollections !== undefined && state.collectionState.linkedCollections[0].gen === 'dummy'

    return {
        row: pokemon,
        isSelected: isPokemonSelected,
        subListIdx: subListIdx === false ? undefined : subListIdx,
        dummyMain: dummyMain
    }
}

const mapDispatchToProps = function(dispatch, ownProps) {
    if (!ownProps.isEditMode && !ownProps.demo) {
        return {}
    }
    return {
        setSelected: () => dispatch(setSelected(ownProps.id))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TableRowGrouping);
