import {Box, useTheme} from '@mui/material'

export default function LinkedColDisplayConnection({orientation, width='100%', height='100%', lineThickness=1, lineColor='white', lineDecoration='solid', wrapperSx={}, boxSx={}}) {
    //orientation: horizontal, vertical (both these values are straight lines), bottom-left, bottom-right, top-left, top-right (corner connections)
    const baseStyles = {display: 'flex'}
    const wrapperStyles = orientation === 'horizontal' ? {flexDirection: 'column'} : 
        orientation === 'vertical' ? {flexDirection: 'row'} : 
        orientation === 'bottom-left' ? {flexDirection: 'column', alignItems: 'end'} : 
        orientation === 'bottom-right' ? {flexDirection: 'column', alignItems: 'start'} : 
        orientation === 'top-left' ? {flexDirection: 'column', justifyContent: 'end', alignItems: 'end'} : 
        orientation === 'top-right' && {flexDirection: 'column', justifyContent: 'end', alignItems: 'start'} 
    
    const pxSize = `${lineThickness}px`
    const boxSizeCalc = `calc(50% - ${lineThickness}px)`
    const borderStyle = `${pxSize} ${lineDecoration} ${lineColor}`

    const boxStyles = orientation === 'horizontal' ? {height: boxSizeCalc, borderBottom: borderStyle} : 
    orientation === 'vertical' ? {width: boxSizeCalc, borderRight: borderStyle} : 
    orientation === 'bottom-left' ? {borderBottom: borderStyle, borderLeft: borderStyle, borderBottomLeftRadius: '10px'} : 
    orientation === 'bottom-right' ? {borderBottom: borderStyle, borderRight: borderStyle, borderBottomRightRadius: '10px'} : 
    orientation === 'top-left' ? {borderTop: borderStyle, borderLeft: borderStyle, borderTopLeftRadius: '10px'} : 
    orientation === 'top-right' && {borderTop: borderStyle, borderRight: borderStyle, borderTopRightRadius: '10px'} 

    const boxSize = orientation !== 'horizontal' && orientation !== 'vertical' ? {height: boxSizeCalc, width: boxSizeCalc} : {}

    return (
        <Box sx={{width, height, ...baseStyles, ...wrapperStyles, ...wrapperSx}}>
            <Box sx={{...boxSize, ...boxStyles, ...boxSx}}/>
        </Box>
    )
}