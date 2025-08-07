import {Box, Typography, TableCell, TableRow, useTheme} from '@mui/material'
import { useSelector, useDispatch, connect } from 'react-redux'
import { setMaxEmArr, selectNextEmCount } from '../../../../../utils/functions/misc'
import { seeIfPokemonIsSelected, selectCollectionPokemon } from '../../../../app/selectors/selectors'
import { setSelected, setSelectedAfterChangingOwned, deselect, setHomeEmBuffer, setCollectionChange } from '../../../../app/slices/editmode'
import { setIsOwned, setIsHA, setEmCount, setEms, deleteEms } from '../../../../app/slices/collectionstate'
import getDefaultData, {handleMultipleDefaultData} from '../../../../../utils/functions/defaultdata'
import { changeDefaultDataToChangeFormat } from '../../../../../utils/functions/defaultdata'
import newObjectId from '../../../../../utils/functions/newobjectid'
import getNameDisplay from '../../../../../utils/functions/display/getnamedisplay'
import ImgData from '../../tabledata/imgdata'
import SmallWidthBallArea from './smallwidthballarea'
import Selection from '../../selection'
import { getGameColor, homeDisplayGames } from '../../../../../common/infoconstants/miscconstants.mjs'

export function ConnectlessSmallWidthColRow({row, id, isCollectionOwner, ownerId, isEditMode, isHomeCollection, availableGames, noStates, isTradePage, tradeSide, wantedByOtherList, userData}) {

}

function SmallWidthColRow({row, isSelected, collectionId, setSelected, ballScopeDisplay, id, isCollectionOwner, ownerId, isEditMode, isHomeCollection, userData, row1Balls, row2Balls, subListIdx, currColGen, dummyMain}) {
    const dispatch = useDispatch()
    const theme = useTheme()
    if (row === undefined) { //when switching between collections theres seems to be a bit of lag in updating the state, even though i tried to stop it.
        return <>
            <TableCell key={`${id}-${newObjectId()}-undefined-row`} sx={{backgroundColor: 'black', height: '165px'}}></TableCell>
        </>
    }

    const noRow2 = row2Balls.length === 0

    //following data is used for editing values in the list
    const possibleEggMoves = (isEditMode) ? (isHomeCollection ? row.possibleEggMoves : useSelector((state) => state.collectionState.eggMoveInfo[row.name])) : null
    const availableGames = (isHomeCollection) ? useSelector((state) => state.collectionState.availableGamesInfo[row.name]) : null
    const haView = (isHomeCollection) ? useSelector((state) => state.collectionState.listDisplay.showHAView) : null
    
    
    const idx = isEditMode ? useSelector(state => state.collectionState.collection.findIndex((p) => p.imgLink === id)) : null

    //default data
    const globalDefaults = isEditMode ? useSelector((state) => state.collectionState.options.globalDefaults) : null
    const superColGlobalDefault = (isEditMode) ? useSelector((state) => (subListIdx !== undefined && !dummyMain) ? state.collectionState.linkedCollections[0].options.globalDefaults : undefined) : null
    const monDataInSuperCol = useSelector((state) => subListIdx !== undefined ? state.collectionState.collection[idx] : undefined) 
    const checkDefault = Object.keys(row.balls)[Object.values(row.balls).map((b) => b.default !== undefined).indexOf(true)]
    const currentDefault = checkDefault === undefined ? 'none' : checkDefault

    const handleEditBallInfo = (e, key, pokename, ballname, emGen, currEmCount, tag) => {
        const maxEMs = key === 'emCount' && ((!isHomeCollection) ? possibleEggMoves === undefined ? 0 : possibleEggMoves.length > 4 ? 4 : possibleEggMoves.length : possibleEggMoves[emGen].length > 4 ? 4 : possibleEggMoves[emGen].length )
        const emCountSelectionList = setMaxEmArr(maxEMs)
        const newValue = 
            (
                key === 'isOwned' ? e.target.checked :
                key === 'isHA' ? !(e.target.value === 'true') :
                key === 'emCount' ? selectNextEmCount(emCountSelectionList, isHomeCollection ? currEmCount : parseInt(e.target.value)) :
                key === 'EMs' && 'none'
            )
        const deleteEMs = key === 'emCount' && (isHomeCollection ? row.balls[ballname].eggMoveData[emGen].EMs.length > newValue : row.balls[ballname].EMs.length > newValue)
        const hasAllPossibleEMs = key === 'emCount' && (isHomeCollection ? newValue === possibleEggMoves[emGen].length : newValue === possibleEggMoves.length)
        const defaultData = (subListIdx !== undefined && !dummyMain) ? 
            handleMultipleDefaultData(globalDefaults, currColGen, superColGlobalDefault, ballname, monDataInSuperCol.balls, monDataInSuperCol.possibleEggMoves) : 
            getDefaultData(globalDefaults, currentDefault, row.balls, maxEMs, possibleEggMoves, ballname, isHomeCollection)
        if (key === 'isOwned') {
            const prevDefaultData = newValue ? changeDefaultDataToChangeFormat(subListIdx !== undefined ? monDataInSuperCol.balls[ballname] : row.balls[ballname], subListIdx !== undefined && currColGen, true) : undefined
            if (newValue === true) {
                dispatch(setSelectedAfterChangingOwned({idx: id, ball: ballname, smScreen: true}))
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
    }

    const nameLabel = userData.loggedIn ? getNameDisplay(userData.user.settings.display.pokemonNames, row.name, row.natDexNum) : row.name
    const nonHAMon = row.haName.includes('Non-HA')
    
    return (
        <>
            <TableCell sx={{...theme.components.box.fullCenterCol, backgroundColor: theme.palette.color2.main, position: 'relative', height: noRow2 ? '165px' : '293.5px', color: 'white', width: '100%', padding: 0}}>
                {isSelected && <Selection height={noRow2 ? '165px' : '293.5px'} deselectFunc={() => dispatch(deselect())} otherStyles={{top: '-152px'}}/>}
                <Box 
                    sx={{
                        ...theme.components.box.fullCenterRow, 
                        height: '10%', 
                        width: '100%', 
                        backgroundColor: theme.palette.color2.dark, 
                        margin: 0, 
                        padding: '16px', 
                        borderRadius: '10px',
                        ':hover': {cursor: isEditMode ? 'pointer' : 'auto'}
                    }}
                    onClick={!isEditMode ? undefined : setSelected}
                >
                    <Box sx={{...theme.components.box.fullCenterRow, alignItems: 'center', width: '20%'}}>
                        <Typography>#{row.natDexNum}</Typography>
                    </Box>
                    <Box sx={{...theme.components.box.fullCenterRow, alignItems: 'center', width: '15%'}}>
                        <ImgData type='poke' linkKey={row.imgLink} size='40px'/>
                    </Box>
                    <Box sx={{...theme.components.box.fullCenterCol, alignItems: 'center', width: '65%', position: 'relative'}}>
                        <Typography><b>{nameLabel}</b></Typography>
                        
                        {(isHomeCollection && !haView) &&
                            <Box sx={{position: 'absolute', top: '100%', ...theme.components.box.fullCenterRow}}>
                            {homeDisplayGames.map((game, idx) => {
                                const nameOfGame = game === 9 ? 'S/V' : game === 'swsh' ? 'SW/SH' : game === 'bdsp' && 'BD/SP'
                                const firstGame = nameOfGame.slice(0, nameOfGame.indexOf('/'))
                                const secondGame = nameOfGame.slice(nameOfGame.indexOf('/')+1, nameOfGame.length)
                                const firstGameColor = getGameColor(firstGame)
                                const secondGameColor = getGameColor(secondGame)
                                const gamesEnabled = availableGames === undefined ? false : availableGames.includes(game)
                                const margin = idx !== 0 ? {ml: 1} : {} 
                                return (
                                    <Box key={`available-home-games-display-${nameOfGame}`} sx={{display: 'flex'}}>
                                        <Typography sx={{fontSize: '10px', color: firstGameColor, opacity: gamesEnabled ? 1 : 0.4, ...margin}}>{firstGame}</Typography>
                                        <Typography sx={{fontSize: '10px', color: secondGameColor, opacity: gamesEnabled ? 1 : 0.4}}>/{secondGame}</Typography>
                                    </Box>
                                )
                            })}
                            </Box>
                        }
                        {(!isHomeCollection || (isHomeCollection && haView)) && 
                            <Box sx={{display: 'flex', position: 'absolute', top: '100%'}}>
                                <Typography sx={{fontSize: '11px', color: theme.palette.color1.light, opacity: nonHAMon ? 0.75 : 1}}>
                                    {nonHAMon ? <i>{row.haName.slice(0, row.haName.indexOf(' - '))}</i> : <b>{row.haName}</b>}
                                </Typography>
                            </Box>
                        }
                    </Box>
                </Box>
                <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', height: '90%', width: '100%', color: 'white', position: 'relative'}}>
                    <Box sx={{width: '100%', height: '116.5px'}}>
                        <SmallWidthBallArea 
                            p={row}
                            rowBalls={row1Balls}
                            isEditMode={isEditMode}
                            handleEditBallInfo={handleEditBallInfo}
                            collectionId={collectionId}
                            allowedBallsTotal={row1Balls.concat(row2Balls).filter(b => row.balls[b] !== undefined && row.balls[b].disabled === undefined)}
                            isHomeCollection={isHomeCollection}
                        />
                    </Box>
                    {!noRow2 &&
                    <Box sx={{width: '100%', height: '116.5px'}}>
                        <SmallWidthBallArea 
                            p={row}
                            rowBalls={row2Balls}
                            isEditMode={isEditMode}
                            handleEditBallInfo={handleEditBallInfo}
                            collectionId={collectionId}
                            isRow2={true}
                            allowedBallsTotal={row1Balls.concat(row2Balls).filter(b => row.balls[b] !== undefined && row.balls[b].disabled === undefined)}
                            isHomeCollection={isHomeCollection}
                        />
                    </Box>
                    }
                </Box>
            </TableCell>
        </>
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
        setSelected: () => dispatch(setSelected({selected: ownProps.id, regSetSelected: true}))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SmallWidthColRow);
