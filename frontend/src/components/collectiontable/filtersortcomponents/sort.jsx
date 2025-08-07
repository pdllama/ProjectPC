import { Box, Typography, styled, Button, ToggleButton, ToggleButtonGroup, useTheme} from "@mui/material"
import { useSelector, useDispatch } from 'react-redux'
import { setSortKey, toggleEmptySetView } from "../../../app/slices/collectionstate"
import MuiToggleButton from '@mui/material/ToggleButton'
import hexToRgba from "hex-to-rgba"
import { deselect } from "../../../app/slices/editmode"
import { toggleFullSetView } from "../../../app/slices/collectionstate"

export default function Sort({listType, loggedInUserSettings}) {
    const dispatch = useDispatch()
    const theme = useTheme()
    const ToggleButton = styled(MuiToggleButton)({
        '&.MuiToggleButton-sizeSmall': {
            color: 'white',
            borderColor: 'grey'
        },
        '&.Mui-selected': {
            backgroundColor: '#b59d0e',
            color: '#1e2f41'
        }
    })
    const showFullSets = useSelector((state) => state.collectionState.listDisplay.showFullSets)
    const showEmptySets = useSelector((state) => state.collectionState.listDisplay.showEmptySets)

    // const collectionSort = useSelector((state) => state.listDisplay.collectionFilters.sort)
    // const onhandSort = useSelector((state) => state.listDisplay.onhandFilters.sort)
    const sortKey = listType === 'collection' ? useSelector((state) => state.collectionState.listDisplay.collectionFilters.sort) : useSelector((state) => state.collectionState.listDisplay.onhandFilters.sort)
  
    const handleChange = (e) => {
        dispatch(setSortKey({sortKey: e.target.value, listType}))
    }

    return (
        <>
        <Box sx={{height: listType === 'collection' ? '80%' : '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'start', marginLeft: '10px'}}>
            <Box sx={{height: '20%'}}><Typography color='white' variant='h6'>Sort By</Typography></Box>
            <Box sx={{height: '40%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Typography color='white' sx={{width: '20%'}}>Dex #</Typography>
                <Box sx={{width: '65%', display: 'flex', flexDirection: 'column', marginLeft: '15px'}}>
                    <ToggleButtonGroup size='small' orientation='vertical' value={sortKey} onChange={(e) => handleChange(e)} exclusive={true}>
                        <ToggleButton 
                            sx={{padding: '0px', width: '100%', ':hover': {cursor: 'pointer', opacity: '0.5', backgroundColor: theme.palette.color3.main}, '&.Mui-selected': {':hover': {cursor: 'pointer', opacity: '0.5', backgroundColor: theme.palette.color3.main}}}}
                            value='NatDexNumL2H'
                        >
                            Lowest to Highest
                        </ToggleButton>
                        <ToggleButton 
                            sx={{padding: '0px', width: '100%', ':hover': {cursor: 'pointer', opacity: '0.5', backgroundColor: theme.palette.color3.main}, '&.Mui-selected': {':hover': {cursor: 'pointer', opacity: '0.5', backgroundColor: theme.palette.color3.main}}}}
                            value='NatDexNumH2L'
                        >
                            Highest to Lowest
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>
            <Box sx={{height: '40%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: listType === 'collection' ? '1px solid white' : ''}}>
                <Typography color='white' sx={{width: '20%'}}>Name</Typography>
                <Box sx={{width: '65%', display: 'flex', flexDirection: 'column', alignItems: 'start', marginLeft: '15px'}}>
                    <ToggleButtonGroup size='small' orientation='horizontal' value={sortKey} sx={{width: '100%'}} onChange={(e) => handleChange(e)} exclusive={true}>
                        <ToggleButton 
                            sx={{padding: '0px', width: '100%', ':hover': {cursor: 'pointer', opacity: '0.5', backgroundColor: theme.palette.color3.main}, '&.Mui-selected': {':hover': {cursor: 'pointer', opacity: '0.5', backgroundColor: theme.palette.color3.main}}}}
                            value='A2Z'
                        >
                            A-Z
                        </ToggleButton>
                        <ToggleButton 
                            sx={{padding: '0px', width: '100%', ':hover': {cursor: 'pointer', opacity: '0.5', backgroundColor: theme.palette.color3.main}, '&.Mui-selected': {':hover': {cursor: 'pointer', opacity: '0.5', backgroundColor: theme.palette.color3.main}}}}
                            value='Z2A'
                        >
                            Z-A
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>
        </Box>
        {listType === 'collection' &&
        <Box sx={{height: '30%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'}}>
            <Box sx={{width: '50%', height: '100%', position: 'relative', ...theme.components.box.fullCenterCol}}>
                <Button 
                    sx={{
                        border: `1px solid ${theme.palette.color1.dark}`, 
                        position: 'absolute',
                        top: '5px',
                        backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), 
                        color: theme.palette.color1.main,
                        padding: 0.5,
                        fontSize: '11px',
                        zIndex: 15,
                        ':hover': {cursor: 'pointer', backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), opacity: 0.65}
                    }}
                    onClick={() => {
                        dispatch(deselect())
                        dispatch(toggleFullSetView({nameDisplaySettings: loggedInUserSettings ? loggedInUserSettings.settings.display.pokemonNames : {}}))
                    }}
                >
                    {showFullSets ? 'Hide' : 'Show'} Full Sets
                </Button>
                <Typography sx={{color: 'white', position: 'absolute', fontSize: '11px', bottom: '0px'}}>Full Sets: {showFullSets ? 'Shown' : 'Hidden'}</Typography>
            </Box>
            <Box sx={{width: '50%', height: '100%', position: 'relative', ...theme.components.box.fullCenterCol}}>
                <Button 
                    sx={{
                        border: `1px solid ${theme.palette.color1.dark}`, 
                        position: 'absolute',
                        top: '5px',
                        backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), 
                        color: theme.palette.color1.main,
                        padding: 0.5,
                        fontSize: '11px',
                        zIndex: 15,
                        ':hover': {cursor: 'pointer', backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), opacity: 0.65}
                    }}
                    onClick={() => {
                        dispatch(deselect())
                        dispatch(toggleEmptySetView({nameDisplaySettings: loggedInUserSettings ? loggedInUserSettings.settings.display.pokemonNames : {}}))
                        // dispatch(toggleFullSetView({useState: (isEditMode || demo), collection: collection.ownedPokemon.filter(p => p.disabled === undefined)}))
                    }}
                >
                    {showEmptySets ? 'Hide' : 'Show'} Empty Sets
                </Button>
                <Typography sx={{color: 'white', position: 'absolute', fontSize: '11px', bottom: '0px'}}>Empty Sets: {showEmptySets ? 'Shown' : 'Hidden'}</Typography>
            </Box>
            
        </Box>
        }
        </>
    )
}