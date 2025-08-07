import {Box, Typography, useTheme} from '@mui/material'
import { capitalizeFirstLetter } from '../../../../../../utils/functions/misc'

export default function LinkedColDisplayItem({name, gen, type, currentCol, wrapperSx, nameSx}) {
    const theme = useTheme()
    const isCurrentCol = gen === currentCol.gen && type === currentCol.type
    const selectedStyles = isCurrentCol ? {backgroundColor: 'black'} : {}
    const genDisplay = !isNaN(parseInt(gen)) ? `Gen ${gen} ${capitalizeFirstLetter(type)} Collection` : `${gen.toUpperCase()} ${capitalizeFirstLetter(type)} Collection`
    
    
    return (
        <Box sx={{backgroundColor: 'rgba(120, 120, 120, 1)', padding: '5px', color: 'white', border: '1px solid rgb(40, 40, 40)', borderRadius: '10px', minWidth: '200px', width: 'calc(100% - 12px)', ...theme.components.box.fullCenterCol, ...selectedStyles, ...wrapperSx}}>
            <Typography sx={{fontSize: '16px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', width: '200px', textAlign: 'center', ...nameSx}}>
                {name}
            </Typography>
            <Typography sx={{fontSize: '12px'}}>
                {genDisplay}
            </Typography>
        </Box>
    )
}