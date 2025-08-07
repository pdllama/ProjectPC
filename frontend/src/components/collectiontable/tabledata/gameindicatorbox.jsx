import {Box, Typography} from '@mui/material'
import { getGameColor } from '../../../../common/infoconstants/miscconstants.mjs'
import hexToRgba from 'hex-to-rgba'

const constructImageGradient = (color1, color2, backgroundOpacity) => {
    return `-webkit-linear-gradient(-30deg, ${backgroundOpacity === 1 ? color1 : hexToRgba(color1, backgroundOpacity)} 50%, ${backgroundOpacity === 1 ? color2 : hexToRgba(color2, backgroundOpacity)} 50%)`
}

export default function GameIndicatorBox({game, sx={}, textSx={}, customText='', backgroundOpacity=1, subText='', allowHover, isSelected, onClickFunc}) {
    const gameFixed = (game === 9 || game === '9') ? 'SV' : game.toUpperCase()
    const gamesFormatted = [gameFixed.slice(0, gameFixed.length/2), gameFixed.slice(gameFixed.length/2)]

    const colorStyles = 
        {
            // backgroundColor: getGameColor(gamesFormatted[0]),
            backgroundImage: constructImageGradient(getGameColor(gamesFormatted[0]), getGameColor(gamesFormatted[1]), allowHover ? 1 : backgroundOpacity),
            color: 'black'
        }
    
    const hoverStyles = allowHover ? isSelected ? 
        {} : {opacity: backgroundOpacity, ':hover': {opacity: 0.75}} : {}

    const onClickProp = onClickFunc ? {onClick: onClickFunc} : {}

    return (
        <Box 
            sx={{
                ...colorStyles, 
                borderRadius: '2px', 
                mb: 0.25, 
                px: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 1, 
                fontWeight: 700, 
                position: subText ? 'relative' : 'static', 
                ...sx,
                ...hoverStyles
                // ':hover': {backgroundImage: `-webkit-linear-gradient(-30deg, ${backgroundOpacity === 1 ? hexToRgba(getGameColor(gamesFormatted[0]), 0.5) : hexToRgba(getGameColor(gamesFormatted[0]), backgroundOpacity)} 50%, ${backgroundOpacity === 1 ? hexToRgba(getGameColor(gamesFormatted[1]), 0.5) : hexToRgba(getGameColor(gamesFormatted[1]), backgroundOpacity)} 50%)`}
            }}
            {...onClickProp}
        >
            {customText ? 
            <Typography sx={{fontSize: '12px', fontWeight: 700, ...textSx}}>{customText}</Typography> : 
            subText ? 
            <Box sx={{position: 'relative', display: 'flex', flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', width: '100%'}}>
                <Box sx={{position: 'relative', display: 'flex',
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '100%',
                gap: 1, }}>
                    <Typography sx={{fontSize: '12px', fontWeight: 700, ...textSx}}>
                        {gamesFormatted[0]}
                    </Typography>
                    <Typography sx={{fontSize: '12px', fontWeight: 700, ...textSx}}>
                        {gamesFormatted[1]}
                    </Typography>
                </Box>
                <Typography sx={{fontSize: '10px', mt: -0.5}}>{subText}</Typography>
            </Box> : 
            <>
                <Typography sx={{fontSize: '12px', fontWeight: 700, ...textSx}}>
                    {gamesFormatted[0]}
                </Typography>
                <Typography sx={{fontSize: '12px', fontWeight: 700, ...textSx}}>
                    {gamesFormatted[1]}
                </Typography>
                {subText &&
                    <Typography sx={{fontSize: '10px', position: 'absolute', bottom: '0px'}}>{subText}</Typography>
                }
            </>
            
            }
        </Box>
    )
}