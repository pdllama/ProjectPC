import {Box, Typography, useTheme, CircularProgress} from '@mui/material'
import ImgData from '../../collectiontable/tabledata/imgdata'
import SearchItemWrapper from './searchitemwrapper'
import Highlighter from 'react-highlight-words'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectScreenBreakpoint } from '../../../app/selectors/windowsizeselectors'

function CustomHighlighter({textToHighlight, searchWords}) {

}

export default function SearchCollectionItem({query, name, type, subType, owner, progress, percentProgress, collectionId, showOwner=true}) {
    const typeDisplay = type === 'aprimon' && isNaN(parseInt(subType)) ? `${subType.toUpperCase()} Aprimon Collection` : `Gen ${subType} Aprimon Collection`
    const theme = useTheme()
    const navigate = useNavigate()
    const sendToCollection = () => {
        navigate(`/collections/${collectionId}`)
    }
    const smScreen = useSelector((state) => selectScreenBreakpoint(state, 'dashboard')) === 'sm' //same brkpt (500px)
    return (
        <SearchItemWrapper onClickFunc={sendToCollection}>
            <style>
                {`.temper-width {
                    white-space: nowrap;
                }`}
            </style>
            <Box sx={{width: '80%', height: '100%', display: 'flex', alignItems: 'center', gap: 2, '@media only screen and (max-width: 450px)': {width: 'calc(80%-130px)'}, '@media only screen and (max-width: 400px)': {width: '83%'}}}>
                <Box sx={{ml: smScreen ? 0.5 : 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center'}}><ImgData type='icons' linkKey={type} size={smScreen ? '40px' : '50px'}/></Box>
                <Box sx={{width: '80%', minWidth: '100px', display: 'flex', flexDirection: 'column'}}>
                    <Typography sx={{fontWeight: 700, fontSize: smScreen ? '14px' : '16px', textAlign: 'start', my: -0.25, '@media only screen and (max-width: 650px)': {width: '90%'}}} noWrap><Highlighter className={'temper-width'} textToHighlight={name} searchWords={[query]}/></Typography>
                    <Typography sx={{fontSize: smScreen ? '10px' : '11px', textAlign: 'start', my: 0, opacity: 0.8}}><Highlighter textToHighlight={typeDisplay} searchWords={[query]}/></Typography>
                    {showOwner && <Typography sx={{fontSize: smScreen ? '10px' : '11px', textAlign: 'start', my: -0.25, opacity: 0.8}}>Owned by <Highlighter textToHighlight={owner} searchWords={[query]}/></Typography>}
                </Box>
            </Box>
            <Box sx={{width: '20%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'end', position: 'relative', gap: 0.5, '@media only screen and (max-width: 400px)': {width: '17%'}}}>
                <Typography 
                    sx={{
                        textAlign: 'center', fontWeight: 700, fontSize: '14px', width: '100%', textAlign: 'end', position: 'absolute', right: '60px',
                        '@media only screen and (max-width: 450px)': {fontSize: '12px'},
                        '@media only screen and (max-width: 400px)': {position: 'absolute', right: '7.25px', top: '30px', fontSize: '10px', textAlign: 'center', width: '50px', fontWeight: 700, zIndex: 5, color: theme.palette.color2.light}
                    }}
                >
                    {progress}
                </Typography>
                <Box sx={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'end'}}>
                    
                </Box>
                 <Box sx={{position: 'absolute', width: '45px', height: '45px', right: '10px'}}>
                    <CircularProgress sx={{position: 'absolute', opacity: 0.2, top: 0, right: 0, '@media only screen and (max-width: 400px)': {color: theme.palette.color3.main}}} variant='determinate' value={100} size={45}/>
                    <CircularProgress sx={{position: 'absolute', top: 0, right: 0, '@media only screen and (max-width: 400px)': {color: theme.palette.color3.main}}} variant='determinate' value={percentProgress} size={45}/>
                    <Typography sx={{
                        fontSize: '12px', width: '32px', fontWeight: 700, position: 'absolute', top: '14.25px', right: '6.25px', 
                        '@media only screen and (max-width: 400px)': {top: '8px'}}}>
                            {Math.round(percentProgress)}%
                    </Typography>
                </Box>
            </Box>
           
        </SearchItemWrapper>
    )
}