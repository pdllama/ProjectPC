import {Box, Typography, Tooltip} from '@mui/material'
import { useState } from 'react'
import ImgData from '../../../components/collectiontable/tabledata/imgdata'
import { items } from '../../../../common/infoconstants/miscconstants.mjs'
import { capitalizeFirstLetter } from '../../../../utils/functions/misc'
import getNameDisplay from '../../../../utils/functions/display/getnamedisplay'
import EmTooltipWrapper from '../../../components/collectiontable/tabledata/emtooltipwrapper'
import { useSelector } from 'react-redux'
import { getHighestEmGen } from '../../../components/collectiontable/tabledata/emindicator'
import GameIndicatorBox from '../../../components/collectiontable/tabledata/gameindicatorbox'

function ListEmAndEmcount({emCount, EMs, eggMoveData, smallWidth, customHomeEmStyles}) {
    const [open, setOpen] = useState(false)
    const homeEMView = eggMoveData !== undefined && useSelector((state) => state.collectionState.listDisplay.homeEMView)
    const trueEMGen = homeEMView === 'hidden' ? undefined : homeEMView === 'highest' ? getHighestEmGen(eggMoveData) : homeEMView
    const trueEMCount = (trueEMGen === undefined || eggMoveData === undefined || eggMoveData[trueEMGen] === undefined) ? undefined : eggMoveData[trueEMGen].emCount
    const trueEMs = (trueEMGen === undefined || eggMoveData === undefined || eggMoveData[trueEMGen] === undefined) ? undefined : eggMoveData[trueEMGen].EMs

    return (
        eggMoveData !== undefined ?
            homeEMView === 'hidden' ? <></> : 
            trueEMCount === undefined ? 
            <Box sx={{width: 'calc(10% + 16px)'}}>
            <GameIndicatorBox 
                game={trueEMGen} //trueEMGen is always defined atp
                customText={`N/A`}
                sx={{
                    opacity: 0.2, width: '100%', px: 0, ...customHomeEmStyles
                }}
                textSx={{
                    fontSize: smallWidth ? '11px' : '12px', 
                    fontWeight: 400
                }}
            /></Box> :  
            <EmTooltipWrapper
                EMs={trueEMs}
                emCount={trueEMCount}
                open={open}
                closeTooltip={() => setOpen(false)}
            >
                <Box sx={{width: 'calc(10% + 16px)', ':hover': {cursor: trueEMCount === 0 ? 'default' : 'pointer'}}} onClick={trueEMCount === 0 ? null : () => setOpen(true)}>
                    <GameIndicatorBox 
                        game={trueEMGen}
                        customText={`${trueEMCount}EM`}
                        sx={{width: '100%', px: 0, opacity: trueEMCount === 0 ? 0.6 : 1, ...customHomeEmStyles}}
                        // onClickFunc={() => setOpen(true)}
                    />
                </Box>
            </EmTooltipWrapper> : 
        <EmTooltipWrapper
            EMs={EMs}
            emCount={emCount}
            open={open}
            closeTooltip={() => setOpen(false)}
        >
            <Typography 
                sx={{
                    fontSize: smallWidth ? '11px' : '12px', 
                    opacity: emCount !== 0? 1 : 0.5, 
                    fontWeight: emCount !== 0 ? 700 : 400, 
                    mx: 0.5,
                    ':hover': {cursor: 'pointer'}
                }}
                onClick={() => setOpen(true)}
            >
                {emCount}EM
            </Typography>
        </EmTooltipWrapper>
    )
}

const listPokemonBallPeripheralData = (p, smallWidth, sideScreen, isTradeSummaryPage, customHomeEmStyles) => {
    //if eggMoveData is defined, it means all that information is MEANT to be shown 
    //(meaning, its a HOME-HOME trade of a pokemon with egg moves)
    //we dont need to do any fancy logic to check if we should actually use that information. Just use it.
    return (
        <>
        {p.isHA !== undefined && <Typography sx={{fontSize: smallWidth ? '11px' : '12px', opacity: p.isHA ? 1 : 0.5, fontWeight: p.isHA ? 700 : 400, mx: 0.5}}>HA</Typography>}
        {(p.emCount !== undefined || p.eggMoveData !== undefined) && <ListEmAndEmcount emCount={p.emCount} EMs={p.EMs} eggMoveData={p.eggMoveData} smallWidth={smallWidth} customHomeEmStyles={customHomeEmStyles}/>}
        {p.wanted === true && 
            <Tooltip title={`This is marked as 'Highly Wanted' in ${!isTradeSummaryPage ? (sideScreen === 'offering' ? 'their' : 'your') : "the other user's"} collection.`}>
                <Typography sx={{fontSize: '10px', mx: 0.5, ':hover': {cursor: 'pointer'}}}>{smallWidth ? 'Wishlist' : 'WANT'}</Typography>
            </Tooltip>
        }
        {p.for !== undefined && 
            <Tooltip title={`This is an equivalent pokemon. ${!isTradeSummaryPage ? (sideScreen === 'offering' ? 'They are' : 'You are') : `The other user is`} looking for ${p.for}`}>
                <Typography sx={{fontSize: '10px', mx: 0.5, ':hover': {cursor: 'pointer'}}}>{smallWidth ? `For: ${p.for}` : 'EQ'}</Typography>
            </Tooltip>
        }
        </>
    )
}

export const listTradePokemon = (p, theme, sideScreen, isTradeSummaryPage=false, smallWidth=false, userNameDisplaySettings, customHomeEmStyles={}) => {
    const nameDisplay = `${capitalizeFirstLetter(p.ball)} ${userNameDisplaySettings === undefined ? p.name : getNameDisplay(userNameDisplaySettings, p.name, p.natDexNum)}`
    const orientationStyles = smallWidth ? theme.components.box.fullCenterCol : theme.components.box.fullCenterRow
    return (
        <Box sx={{...orientationStyles, height: smallWidth ? '40px' : '25px', width: '100%', borderRadius: '3px', backgroundColor: theme.palette.color1.main, my: 0.5}}>
            <Box sx={{width: smallWidth ? '100%' : '70%', height: smallWidth ? '25px' : '100%', ...theme.components.box.fullCenterRow, justifyContent: 'start', ml: smallWidth ? 0 : 1}}>
                <Box sx={{width: smallWidth ? '16%' : '12%'}}>
                    <Typography sx={{fontSize: '12px', mr: 1}}>#{p.natDexNum}</Typography>
                </Box>
                <Box sx={{...theme.components.box.fullCenterRow}}>
                    <ImgData type='ball' linkKey={p.ball} size='24px'/>
                    <ImgData linkKey={p.id} size='28px'/>
                </Box>
                <Typography sx={{textAlign: 'center', fontSize: p.onhandId !== undefined ? '11px' : '12px', ml: 1}}>{nameDisplay}</Typography>
                {p.onhandId !== undefined && <Typography sx={{textAlign: 'center', fontSize: '11px', ml: 0.5}}>(On-Hand)</Typography>}
            </Box>
            <Box sx={{width: smallWidth ? '100%' : '30%', height: smallWidth ? '15px' :'100%', ...theme.components.box.fullCenterRow, justifyContent: smallWidth ? 'center' : 'end', mr: smallWidth ? 0 : 0.5}}>
                {listPokemonBallPeripheralData(p, smallWidth, sideScreen, isTradeSummaryPage, customHomeEmStyles)}
            </Box>
        </Box>
    )
}

export const listTradeItem = (i, theme) => {
    const nameDisplay = items.filter(item => item.value === i.name)[0].display
    return (
        <Box sx={{...theme.components.box.fullCenterRow, justifyContent: 'start', height: '25px', width: '100%', borderRadius: '3px', backgroundColor: theme.palette.color1.main, my: 0.5}}>
            <Box sx={{...theme.components.box.fullCenterRow, ml: 4}}>
            <ImgData type='items' linkKey={i.name} size='24px'/>
            <Typography sx={{ml: 1, fontSize: '12px'}}>{nameDisplay} x<b>{i.qty}</b></Typography>
            </Box>
        </Box>
    )
}