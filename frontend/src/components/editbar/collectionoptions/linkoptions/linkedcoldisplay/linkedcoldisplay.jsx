import {Box, Typography, useTheme} from '@mui/material'
import hexToRgba from 'hex-to-rgba'
import LinkedColDisplayItem from './linkedcoldisplayitem'
import LinkedColDisplayConnection from './linkedcoldisplayconnection'
import { useSelector } from 'react-redux'
import { selectScreenBreakpoint } from '../../../../../app/selectors/windowsizeselectors'

export default function LinkedColDisplay({width='90%', height='50%', collectionGen, collectionType, bg, border, wrapperSx, linkedCollections, sw}) {
    const theme = useTheme()
    const sBkpt = useSelector((state) => selectScreenBreakpoint(state, 'linkedCollectionsDisplay'))
    const smallerWidth = sBkpt === 'sm'
    const hasLinkedCollections = linkedCollections.length >= 2
    const linkedCollectionsAdjusted = hasLinkedCollections && (
        linkedCollections.length > 2 ? linkedCollections.filter(col => col.gen !== 'home') : linkedCollections)
    const homeCollection = (hasLinkedCollections && (linkedCollections.length > 2)) && linkedCollections.filter(col => col.gen === 'home')[0]

    const trueBg = bg ? bg : hexToRgba(theme.palette.color3.main, 0.2)
    const trueBorder = border ? border : `1px solid ${theme.palette.color3.dark}`
    const wrapperStyle = hasLinkedCollections ?({...theme.components.box.fullCenterCol, alignItems: 'start'}) : {...theme.components.box.fullCenterCol}

    return (
        <Box sx={{width, height, backgroundColor: trueBg, border: trueBorder, borderRadius: '10px', padding: '5px', ...wrapperStyle, ...wrapperSx}}>
            {hasLinkedCollections ? 
                <>
                {(linkedCollections.length === 2) ? 
                    <Box sx={{display: 'flex', width: '100%', height: smallerWidth ? '100%' : 'auto', justifyContent: 'center', alignItems: smallerWidth ? 'center' : 'start', position: 'relative', flexDirection: smallerWidth ? 'column' : 'row'}}>
                        <Box sx={{width: '35%', minWidth: '212px'}}>
                            <LinkedColDisplayItem 
                                name={linkedCollectionsAdjusted[0].name} 
                                type={linkedCollectionsAdjusted[0].type} 
                                gen={linkedCollectionsAdjusted[0].gen} 
                                currentCol={{gen: collectionGen, type: collectionType}} 
                                wrapperSx={{zIndex: 2, position: 'relative'}}
                            />
                        </Box>
                        <Box sx={{width: smallerWidth ? '212px' : '30%', minHeight: smallerWidth ? '60%' : 0, flexShrink: 2, position: smallerWidth ? 'relative' : 'static'}}>
                            <LinkedColDisplayConnection orientation={smallerWidth ? 'vertical' : 'horizontal'} wrapperSx={{zIndex: 1, position: 'absolute'}} width={smallerWidth ? '100%' : '50%'}/>
                        </Box>
                        <Box sx={{width: '35%', minWidth: '212px'}}>
                            <LinkedColDisplayItem 
                                name={linkedCollectionsAdjusted[1].name} 
                                type={linkedCollectionsAdjusted[1].type} 
                                gen={linkedCollectionsAdjusted[1].gen} 
                                currentCol={{gen: collectionGen, type: collectionType}} 
                                wrapperSx={{zIndex: 2, position: 'relative'}}
                            />
                        </Box>
                    </Box> : 
                    <Box sx={{display: 'flex', width: '100%', height: smallerWidth ? '100%' : 'auto', justifyContent: smallerWidth ? 'start' : 'center', position: 'relative', alignItems: smallerWidth ? 'start' : 'center', flexDirection: smallerWidth ? 'column' : 'row'}}>
                        {smallerWidth ? 
                        <>
                        <Box sx={{height: '60px', minWidth: '212px', ...theme.components.box.fullCenterCol, alignItems: 'start'}}>
                            <LinkedColDisplayItem 
                                name={homeCollection.name} 
                                type={homeCollection.type} 
                                gen={homeCollection.gen} 
                                currentCol={{gen: collectionGen, type: collectionType}} 
                                wrapperSx={{zIndex: 2, position: 'relative'}}
                            />
                        </Box>
                        <Box sx={{width: '100%', flexShrink: 1, position: 'relative', ...theme.components.box.fullCenterCol}}>
                            {linkedCollectionsAdjusted.map((lC, idx) => {

                                return (
                                    <>
                                    <Box key={`${lC._id}-sw-connection-and-item`} sx={{...theme.components.box.fullCenterRow, justifyContent: 'end', height: '60px', width: '100%', position: 'relative'}}>
                                        <Box sx={{height: '100%', width: '212px'}}>
                                            <LinkedColDisplayItem 
                                                name={lC.name}
                                                gen={lC.gen}
                                                type={lC.type}
                                                currentCol={{gen: collectionGen, type: collectionType}}
                                                wrapperSx={{zIndex: 2, position: 'relative'}}
                                            />
                                        </Box>
                                        <LinkedColDisplayConnection 
                                            orientation='bottom-left'
                                            width='100px'
                                            height={idx !== 0 ? '250%' : '150%'}
                                            wrapperSx={{zIndex: 1, position: 'absolute', left: '0px'}}
                                            boxSx={idx !== (linkedCollectionsAdjusted.length-1) ? {borderBottomLeftRadius: '0px'} : {}}
                                        />
                                        <LinkedColDisplayConnection 
                                            orientation='horizontal'
                                            width='50%'
                                            height={'100%'}
                                            wrapperSx={{zIndex: 1, position: 'absolute', left: '100px'}}
                                        />
                                    </Box>
                                    
                                    </>
                                )
                            })}
                        </Box>
                        </> 
                         : 
                        <>
                        <Box sx={{width: '35%', minWidth: '212px'}}>
                            <LinkedColDisplayItem 
                                name={homeCollection.name} 
                                type={homeCollection.type} 
                                gen={homeCollection.gen} 
                                currentCol={{gen: collectionGen, type: collectionType}} 
                                wrapperSx={{zIndex: 2, position: 'relative'}}
                            />
                        </Box>
                        <Box sx={{width: '30%', flexShrink: 1, position: 'relative'}}>
                            <LinkedColDisplayConnection orientation='horizontal' wrapperSx={{zIndex: 1, position: 'absolute'}} width='100%'/>
                            {linkedCollectionsAdjusted.slice(1, linkedCollectionsAdjusted.length).map((lC, idx) => {
                                const evenIdx = (idx % 2) === 0
                                const orientation = evenIdx ? 'top-left' : 'bottom-left'
                                const scaleFactor = Math.floor(idx/2)+1
                                const style = evenIdx ? {bottom: '0px'} : {top: '0px'}
                                return (
                                    <LinkedColDisplayConnection key={`col-${lC._id}-connection-line`} orientation={orientation} height={`${120*scaleFactor}px`} wrapperSx={{zIndex: 1, position: 'absolute', ...style}} width={'100%'}/> 
                                )
                            })}
                        </Box>
                        <Box sx={{width: '35%', minWidth: '212px', position: 'relative'}}>
                            <LinkedColDisplayItem 
                                name={linkedCollectionsAdjusted[0].name} 
                                type={linkedCollectionsAdjusted[0].type} 
                                gen={linkedCollectionsAdjusted[0].gen} 
                                currentCol={{gen: collectionGen, type: collectionType}} 
                                wrapperSx={{zIndex: 2, position: 'relative'}}
                            />
                            {linkedCollectionsAdjusted.slice(1, linkedCollectionsAdjusted.length).map((lC, idx) => {
                                const evenIdx = (idx % 2 === 0)
                                const scale = Math.floor(idx/2)
                                const scale2 = Math.floor(idx/2)+1
                                const otherItemsSizeAccounts = (scale*54)
                                const positionStyle = evenIdx ? {bottom: `calc(100% + ${otherItemsSizeAccounts+(6*scale2)}px)`} : {top: `calc(100% + ${otherItemsSizeAccounts+(6*scale2)}px)`}
                                return (
                                    <LinkedColDisplayItem 
                                        key={`col-${lC._id}-connection-item`}
                                        name={lC.name} 
                                        gen={lC.gen} 
                                        type={lC.type}
                                        currentCol={{gen: collectionGen, type: collectionType}} 
                                        wrapperSx={{position: 'absolute', ...positionStyle}}
                                    />
                                )
                            })}
                        </Box></>}
                    </Box> 
                }
                </> : 
                <Typography sx={{color: 'grey'}}><i>No Linked Collections</i></Typography>
            }
        </Box>
    )
}