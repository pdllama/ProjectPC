import {Box, FormLabel, ToggleButtonGroup, styled, Grid, Typography, ToggleButton} from '@mui/material'
import MuiToggleButton from '@mui/material/ToggleButton'
import RenderEggMoves from './rendereggmoves'
import { homeDisplayGames } from '../../../../../common/infoconstants/miscconstants.mjs'
import GameIndicatorBox from '../../../collectiontable/tabledata/gameindicatorbox'

export default function EggMoveSelectionForm({noEMs, EMs, emCount, handleEmCountChange, toggleScreen, maxEms=4, idxOfSelectedEM, handleEMChange, disabled, width='40%', height='100%', color='black', newOnHandSelect=false, noInfoBgColor, isHomeCollection, otherEmTextStyles={}, emsUnavailableInGameGen, homeEmGen, changeHomeEmGen, emGameData, smallWidth, list, dontShowEmGen=false}) {

    const disabledStyle = disabled ? {opacity: 0.5} : {}

    const ToggleButtonStyled = styled(MuiToggleButton)({
        '&.Mui-selected, &.Mui-selected:hover': {
            color: 'white',
            backgroundColor: newOnHandSelect ? '#283f57' : '#4d4d4d'
        }
    })
    return (
        <Box sx={{display: 'flex', flexDirection: (noEMs === true || emsUnavailableInGameGen) ? 'column' : 'row', justifyContent: 'start', alignItems: 'center', width, height, marginLeft: '5px', ...disabledStyle, position: isHomeCollection ? 'relative' : 'static'}}>
            {(noEMs === true || emsUnavailableInGameGen) ? 
            <>
                <Box sx={{height: '30%', width: '100%'}}>
                    <Typography align='center' sx={{color, fontSize: '13px'}}>Egg Moves</Typography>
                </Box> 
                <Box sx={{height: '70%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <Typography align='center' sx={{color, fontSize: isHomeCollection ? '11px' : '13px', opacity: 0.8}}>{noEMs ? 'Egg Moves Unavailable' : emsUnavailableInGameGen && `Egg Moves Unavailable in ${homeEmGen === 9 ? 'SV' : homeEmGen.toUpperCase()}`}</Typography>
                </Box>
            </> :
            <>
                <Box sx={{height: '100%', width: '35%', alignItems: 'center', display: 'flex', flexDirection: 'column'}}>
                    <FormLabel sx={{height: '30%', color, fontSize: '12px', marginTop: '3px'}}>Egg Moves</FormLabel>
                    <Box sx={{height: '70%', width: '100%', display: 'flex', alignItems: 'center'}}>
                        <ToggleButtonGroup
                            sx={{height: '80%', width: '100%', display: 'flex', justifyContent: 'center'}}
                            value={emCount === 0 || disabled ? 'disable' : emCount}
                            size='small'
                            onChange={disabled ? undefined : (e) => handleEmCountChange(e)}
                            exclusive
                        >
                            <ToggleButtonStyled
                                sx={{color}}
                                value={emCount}
                            >
                                {disabled ? '0' : emCount}EM
                            </ToggleButtonStyled>
                        </ToggleButtonGroup>
                    </Box>
                </Box>
                <Box sx={{height: '100%', width: '65%', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <RenderEggMoves 
                        emCount={emCount} 
                        EMs={EMs} 
                        maxEms={maxEms} 
                        idxOfSelectedEM={idxOfSelectedEM} 
                        toggleScreen={toggleScreen} 
                        handleEMChange={handleEMChange} 
                        disabledSelection={disabled} 
                        noInfoBgColor={noInfoBgColor}
                        otherEmTextStyles={otherEmTextStyles}
                        // {...swRenderEMTooltipInfo}
                    />
                </Box>
            </>
            }
            {(isHomeCollection && (!noEMs) && !disabled) && 
            <ToggleButtonGroup value={homeEmGen} onChange={(e, newVal) => changeHomeEmGen(newVal)} exclusive 
                sx={{position: 'absolute', top: '100%', width: '100%', border: 'none', borderRadius: '0px', borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px'}}
            >
                {homeDisplayGames.map((hDG, idx) => {
                    const trueValue = hDG.toString()
                    const disabledOverride = disabled ? true : list === 'onhand' ? !(emGameData.includes(hDG.toString())) : emGameData[hDG] === undefined
                    const emCount = (disabledOverride || list === 'onhand') ? 0 : emGameData[hDG].emCount
                    const borderStyles = idx === 0 ? {borderLeft: '1px solid black', borderBottom: '1px solid black'} : idx === homeDisplayGames.length-1 ? {borderRight: '1px solid black', borderBottom: '1px solid black'} : {borderBottom: '1px solid black'}
                    return (
                        <ToggleButton
                            key={`${hDG}-egg-move-gen-change`}
                            value={trueValue}
                            disabled={disabledOverride || trueValue === homeEmGen}
                            sx={{padding: 0, width: `${100/homeDisplayGames.length}%`, border: 'none', ...borderStyles, margin: 0, backgroundColor: 'black', ':hover': {backgroundColor: 'black'}, '&.Mui-selected': {backgroundColor: 'black', ':hover': {backgroundColor: 'black'}}}}
                        >   
                            <GameIndicatorBox 
                                game={hDG}
                                sx={{width: '100%', height: smallWidth ? '25px' :'30px', mb: 0}}
                                backgroundOpacity={trueValue === homeEmGen ? 1 : 0.5}
                                allowHover={trueValue === homeEmGen ? false : true}
                                subText={(disabledOverride) ? `N/A` : list === 'onhand' ? '' : `${emCount}EM`}
                            />
                        </ToggleButton>
                    )
                })}
            </ToggleButtonGroup>
            }
        </Box>
    )
}