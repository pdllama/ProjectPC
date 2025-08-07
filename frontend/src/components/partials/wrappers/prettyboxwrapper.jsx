import {Box, useTheme} from '@mui/material'
import hexToRgba from 'hex-to-rgba'

export default function PrettyBoxWrapper({width='65%', height='90%', color, borderColor, sx, props, children}) {
    const theme = useTheme()
    const trueColor = color === undefined ? theme.palette.color3.main : color
    const trueBorderColor = borderColor === undefined ? theme.palette.color3.dark : borderColor

    return (
        <Box sx={{
            width, height, 
            border: `1px solid ${trueBorderColor}`, 
            borderRadius: '10px', 
            backgroundColor: hexToRgba(trueColor, 0.3), 
            ...theme.components.box.fullCenterCol,
            ...sx
        }} {...props}>
            {children}
        </Box>
    )
}