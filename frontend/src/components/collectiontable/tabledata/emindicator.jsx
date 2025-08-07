import {Box, Typography, ToggleButton, Button, Grid, Tooltip, ClickAwayListener, useTheme, ToggleButtonGroup} from '@mui/material'
import { useState, useRef } from 'react'
import getMoveStyles from '../../../../utils/functions/eggmoves/getmovestyles'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { homeDisplayGames } from '../../../../common/infoconstants/miscconstants.mjs'
import GameIndicatorBox from './gameindicatorbox'

export const getHighestEmGen = (eggMoveData) => {
    let iteratedHighestEmCount = 0
    if (eggMoveData === undefined) {return homeDisplayGames[homeDisplayGames.length-1]}
    const highestEmCountGens = homeDisplayGames.filter(hDG => {
        if (eggMoveData[hDG] === undefined) {return false}
        if (eggMoveData[hDG].emCount > iteratedHighestEmCount) {
            iteratedHighestEmCount = eggMoveData[hDG].emCount
            return true
        }
        if (eggMoveData[hDG].emCount === iteratedHighestEmCount) {return true}
    })
    return highestEmCountGens[highestEmCountGens.length-1].toString()
}

export default function EMIndicator({sx, textOnly, isEditMode, emCount, EMs, eggMoveData, handleChange, smallWidth, isHomeCollection, homeEMView, availableGames}) {
    const theme = useTheme()
    if (homeEMView === 'hidden') {
        return <></>
    }
    const [emsOpen, setEmsOpen] = useState({open: false})
    
    
    const offset = smallWidth ? {} : (!textOnly) ? 
        {right: '0px', ...(isHomeCollection ? {'@media only screen and (min-width: 1201px)': {right: '4px', bottom: '2px'}} : {})} : 
        {}

    const gameIndMediaQ = {'@media only screen and (min-width: 1201px)': {px: 0.5, width: '100%'}}
    const highestEmCountGen = (isHomeCollection && homeEMView === 'highest') && getHighestEmGen(eggMoveData)
    const genRef = useRef((isHomeCollection) && (homeEMView === 'highest' ? highestEmCountGen : homeEMView))
    const trueEmCountGen = (isHomeCollection && homeEMView === 'highest') && ((genRef.current !== undefined && genRef.current !== highestEmCountGen) ? genRef.current : highestEmCountGen)
    const shownEmCount = isHomeCollection ? 
        homeEMView === 'highest' ? eggMoveData[trueEmCountGen].emCount : 
        (eggMoveData === undefined || eggMoveData[homeEMView] === undefined) ? 'unavailable' : eggMoveData[homeEMView].emCount : emCount
    const shownEMs = isHomeCollection ? homeEMView === 'highest' ? 
        eggMoveData[trueEmCountGen].EMs : 
        (eggMoveData === undefined || eggMoveData[homeEMView] === undefined) ? [] : eggMoveData[homeEMView].EMs : EMs === undefined ? [] : EMs

    const renderEmTooltip = () => {
        const renderedEms = shownEMs.slice(0, emCount)
        if (shownEmCount > shownEMs.length) {
            const noInfoCount = shownEmCount - shownEMs.length
            for (let i=0;i < noInfoCount;i++) {
                renderedEms.push('none')
            }
        }
        return (
            <Grid container sx={{...theme.components.box.fullCenterRow, justifyContent: 'start'}}>
                {renderedEms.map((rEm, idx)=> {
                    const moveStyles = rEm === 'none' ? {backgroundColor: 'dark grey', color: 'white'} : getMoveStyles(rEm)
                    return (
                        <Grid item xs={6} key={`egg-move-${rEm}-${idx+1}`}>
                            <Box sx={{...theme.components.box.fullCenterCol, ...moveStyles, width: '95%', height: '95%', borderRadius: '10px'}}>
                                <Typography sx={{width: '100%', textAlign: 'center', fontSize: '12px'}}>
                                    {rEm === 'none' ? <i>No Info</i> : rEm}
                                </Typography>
                            </Box>
                        </Grid>
                    )
                })}

            </Grid>
        )
    }

    useEffect(() => {
        if (homeEMView === 'highest' || homeEMView === 'hidden') {
            genRef.current = highestEmCountGen
        } else {
            genRef.current = homeEMView
        }
    }, [homeEMView])


    const isNoEm = (!(typeof shownEmCount === 'number'))

    const disabledButton = (!textOnly && !isEditMode) || isNoEm

    if (textOnly) {
        return (
            isHomeCollection ?  
            <Box 
                sx={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '100%',
                    position: 'absolute', 
                    ':hover': {cursor: 'pointer'},
                    bottom: '0px', 
                    color: 'white', 
                    fontSize: '14px', 
                    opacity: isNoEm ? 0.1 : shownEmCount === 0 ? 0.25 : 1, 
                    fontWeight: shownEmCount === 0 ? 400 : 700,
                    ...sx
                }}>
                <GameIndicatorBox 
                    game={homeEMView === 'highest' ? trueEmCountGen : homeEMView}
                    customText={isNoEm ? 'N/A' : `${shownEmCount}EM`}
                    textSx={{opacity: 1, color: 'white', fontSize: smallWidth ? '16px' : '14px'}}
                    sx={{px: 0, py: smallWidth ? 0.5 : 0, mx: 0, height: '16px', width: '80%', ...gameIndMediaQ}}
                    backgroundOpacity={isNoEm ? 0.15 : 0.4}
                />
            </Box> :
            <Typography 
                sx={{
                    position: 'absolute', 
                    ':hover': {cursor: 'pointer'},
                    bottom: '0px', 
                    width: '100%',
                    color: 'white', 
                    fontSize: '14px', 
                    opacity: shownEmCount === 0 ? 0.5 : 1, 
                    fontWeight: shownEmCount === 0 ? 400 : 700,
                    ...sx
                }}
                // onClick={() => setEmsOpen(true)}
            >
                {shownEmCount}EM   
            </Typography>
        )
    } else {
        if (isEditMode) {
            return (
                <ToggleButton
                    sx={{
                        position: 'absolute',
                        zIndex: 1,
                        color: 'white',
                        bottom: isHomeCollection ? '1px' : '-2px',
                        backgroundColor: 'none',
                        border: 'none',
                        ...offset,
                        margin: 0,
                        padding: isHomeCollection ? '0px' : '2px',
                        width: '100%',
                        fontWeight: !isNoEm && shownEmCount !== 0  ? 700 : 400,
                        opacity: !isNoEm && shownEmCount !== 0  ? 1 : 0.5,
                        '&.Mui-disabled': {
                            border: 'none',
                            color: 'white',
                            fontWeight: !isNoEm ? 700 : 400,
                            opacity: !isNoEm ? 1 : 0.5
                        },
                        ...sx
                    }}
                    onChange={isEditMode ? isHomeCollection ? (e) => {
                        if (homeEMView !== genRef.current) {
                            setEmsOpen({...emsOpen, homeEmGen: genRef.current})
                        }
                        handleChange(e, (homeEMView === 'highest' ? trueEmCountGen : homeEMView), shownEmCount)
                    } : (e) => handleChange(e, false, shownEmCount) : null}
                    value={shownEmCount === undefined ? '' : shownEmCount}
                    disabled={disabledButton}
                >
                    {isHomeCollection ? 
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
                    <GameIndicatorBox 
                        game={homeEMView === 'highest' ? trueEmCountGen : homeEMView}
                        customText={isNoEm ? 'N/A' : `${shownEmCount}EM`}
                        textSx={{opacity: 1, color: 'white', fontSize: smallWidth ? '16px' : '14px'}}
                        sx={{px: 0, py: smallWidth ? 0.5 : 0, mx: 0, height: '16px', width: '80%', ...gameIndMediaQ}}
                        backgroundOpacity={isNoEm ? 0.15 : 0.4}
                    />
                    </Box> : 
                    `${shownEmCount}EM`
                    }
                </ToggleButton>
            )
        } else {
            return (
                <ClickAwayListener onClickAway={() => setEmsOpen({...emsOpen, open: false})}>
                    <Tooltip
                        PopperProps={{
                            disablePortal: true,
                            sx: {width: '300px'}
                        }}
                        arrow
                        onClose={() => setEmsOpen({...emsOpen, open: false})}
                        open={emsOpen.open}
                        disableFocusListener
                        disableHoverListener
                        disableTouchListener
                        title={renderEmTooltip()}
                    >
                        <ToggleButton
                            sx={{
                                position: 'absolute',
                                zIndex: 1,
                                color: 'white',
                                bottom: isHomeCollection ? '1px' : '-2px',
                                borderLeftColor: '2px',
                                backgroundColor: 'none',
                                border: 'none',
                                '& .MuiButtonBase-root': {width: '100%'},
                                ...offset,
                                margin: 0,
                                padding: isHomeCollection ? '0px' : '2px',
                                width: '100%',
                                fontWeight: !isNoEm && shownEmCount !== 0 ? 700 : 400,
                                opacity: !isNoEm && shownEmCount !== 0 ? 1 : 0.5,
                                ...sx
                            }}
                            value={''}
                            onClick={(shownEmCount !== 0 && shownEmCount !== 'unavailable') ? () => setEmsOpen({...emsOpen, open: true}) : null}
                        >
                            {isHomeCollection ? 
                            <GameIndicatorBox 
                                game={homeEMView === 'highest' ? trueEmCountGen : homeEMView}
                                customText={isNoEm ? 'N/A' : `${shownEmCount}EM`}
                                textSx={{opacity: 1, color: 'white', fontSize: smallWidth ? '16px' : '14px'}}
                                sx={{px: 0.5, py: smallWidth ? 0.5 : 0, mx: 0, height: '16px', width: '80%', ...gameIndMediaQ}}
                                // sx={{opacity: isNoEm ? 0.15 : 0.4}}
                                backgroundOpacity={isNoEm ? 0.15 : 0.4}
                            /> : 
                            `${shownEmCount}EM`
                            }
                        </ToggleButton>
                    </Tooltip>
                </ClickAwayListener>
            )
        }
    }
}