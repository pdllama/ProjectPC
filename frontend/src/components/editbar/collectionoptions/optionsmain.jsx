import {Box, Typography, Button, useTheme} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { changeModalState } from '../../../app/slices/editmode'
import { selectUnsavedChanges, selectAnyUnsavedOnhandChanges } from '../../../app/selectors/selectors'
import ArrowForward from '@mui/icons-material/ArrowForward'

export default function OptionsMain({elementBg, sw, collectionGen, demo}) {
    const theme = useTheme()
    const dispatch = useDispatch()
    const unsavedChanges = useSelector((state) => selectUnsavedChanges(state))
    const unsavedOnhandChanges = useSelector((state) => selectAnyUnsavedOnhandChanges(state))
    const noLinking = collectionGen === '6' || collectionGen === '7'
    const saveBeforeLinking = unsavedChanges || unsavedOnhandChanges
    return (
        <>
        <Box sx={{...elementBg, width: '95%', height: '35px', display: 'flex', alignItems: 'center'}}>
            <Typography sx={{color: 'white', fontWeight: 700, mx: 1}}>Collection Options</Typography>
        </Box>
        <Box sx={{...elementBg, width: '95%', height: '92%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: 1}}>
            <Box sx={{width: '95%', height: '75%', padding: '5%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center'}}>
                <Button size='large' sx={{color: 'white', fontSize: '24px', fontWeight: 700}} onClick={() => dispatch(changeModalState({screen: 'changeScope'}))}>Change Scope</Button>
                <Button size='large' sx={{color: 'white', fontSize: '24px', fontWeight: 700}} onClick={() => dispatch(changeModalState({screen: 'sorting'}))}>Sorting Options</Button>
                <Button size='large' sx={{color: 'white', fontSize: '24px', fontWeight: 700}} onClick={() => dispatch(changeModalState({screen: 'tradePreferences'}))}>Trade Preferences</Button>
                <Box sx={{position: 'relative', width: '100%', ...theme.components.box.fullCenterCol}}>
                    <Button size='large' sx={{color: 'white', fontSize: '24px', fontWeight: 700}} onClick={() => dispatch(changeModalState({screen: 'linking'}))} disabled={noLinking || saveBeforeLinking || demo}>
                        Collection Linking 
                    </Button>
                    {(noLinking || demo) && <Typography sx={{color: 'grey', position: 'absolute', bottom: '-10px', pointerEvents: 'none'}}>
                        <i>Linking is not available for {demo ? 'demo' : `gen 6/7`} collections</i>
                    </Typography>}
                    {(saveBeforeLinking && !(noLinking || demo)) && <Typography sx={{color: 'grey', position: 'absolute', bottom: '-10px', pointerEvents: 'none'}}><i>Please save any changes before linking</i></Typography>}
                </Box>
                {/* <Button size='large' sx={{color: 'white', fontSize: '24px', fontWeight: 700}} onClick={() => dispatch(changeModalState({screen: 'sheets'}))}>Custom Sheets</Button> */}
                <Button size='large' sx={{color: 'white', fontSize: '24px', fontWeight: 700}} onClick={() => dispatch(changeModalState({screen: 'other'}))}>Other Options</Button>
            </Box>
        </Box>
        </>
    )
}