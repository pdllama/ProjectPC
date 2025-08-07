import {Box, Typography, Button, useTheme} from '@mui/material'
import { toggleAbilitiesView } from '../../app/slices/collectionstate'
import hexToRgba from 'hex-to-rgba'
import { useDispatch, useSelector } from 'react-redux'
import { deselect } from '../../app/slices/editmode'

export default function ChangeAbilitiesView({sw, listType}) {
    const theme = useTheme()
    const dispatch = useDispatch()
    const abilitiesView = useSelector((state) => state.collectionState.listDisplay.showHAView)

    const mediaQuery = {
        '@media only screen and (max-width: 329px)': {
            fontSize: '9.5px',
            padding: 0
        },
        '@media only screen and (min-width: 330px) and (max-width: 344px)': {
            fontSize: '9.5px',
            py: 0
        },
        '@media only screen and (min-width: 345px) and (max-width: 354px)': {
            fontSize: '10px',
            py: 0.9
        },
        '@media only screen and (max-width: 981px)': {
            paddingY: listType === 'collection' ? 0.75 : 0
        },
        '@media only screen and (min-width: 982px) and (max-width: 1062px)': {
            paddingY: 0.75
        },
        '@media only screen and (min-width: 1062px)': {
            padding: 0.75
        }
    }

    return (
        <Button 
            sx={{
                border: `1px solid ${theme.palette.color1.dark}`, 
                backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), 
                color: theme.palette.color1.main,
                padding: (!sw) ? 0 : 0.75, ml: 0.5, mr: (!sw && listType === 'onHand') ? -1 : 0, 
                fontSize: (listType === 'onHand' && sw) ? '9.5px' : '11px',
                zIndex: (!sw && listType !== 'onHand') ? 1 : 15,
                ':hover': {cursor: 'pointer', backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), opacity: 0.65},
                ...mediaQuery,
                paddingX: (sw && listType === 'collection') ? 0 : 0.75
            }}
            onClick={() => {
                dispatch(toggleAbilitiesView())
            }}
        >
            Show {abilitiesView ? 'Available Games' : 'Hidden Abilities'}
        </Button>
    )
}