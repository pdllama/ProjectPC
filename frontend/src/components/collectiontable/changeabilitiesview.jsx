import {Box, Typography, Button, useTheme} from '@mui/material'
import { toggleAbilitiesView } from '../../app/slices/collectionstate'
import hexToRgba from 'hex-to-rgba'
import { useDispatch, useSelector } from 'react-redux'

export default function ChangeAbilitiesView({}) {
    const theme = useTheme()
    const dispatch = useDispatch()
    const abilitiesView = useSelector((state) => state.collectionState.listDisplay.showHAView)

    return (
        <Button 
            sx={{
                border: `1px solid ${theme.palette.color1.dark}`, 
                backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), 
                color: theme.palette.color1.main,
                padding: 0, ml: 0.5,
                fontSize: '9.5px',
                zIndex: 15,
                ':hover': {cursor: 'pointer', backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), opacity: 0.65}
            }}
            onClick={() => {
                dispatch(toggleAbilitiesView())
            }}
        >
            Show {abilitiesView ? 'Available Games' : 'Hidden Abilities'}
        </Button>
    )
}