import {Box, Typography, Tooltip, Button} from '@mui/material'
import {useState} from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ImgData from '../../../../collectiontable/tabledata/imgdata'

//i extracted this part from the aprimonimportnotice bcause i didnt want to do any refactoring - i needed it for import information.
//if we do refactoring, please set it up :)

export default function AprimonNoticeSlideshow({arrowColor}) {
    const exampleTypes = ['checkbox_import', 'picture_function_import', 'inserted_picture_import']
    const [exampleScreen, setExampleScreen] = useState(0)

    const moveRight = () => {
        setExampleScreen(exampleScreen + 1)
    }

    const moveLeft = () => {
        setExampleScreen(exampleScreen - 1)
    }

    return (
        <Box sx={{display: 'flex', height: '300px', width: '100%', justifyContent: 'center', mb: 1}}>
            
            <Box sx={{width: '85px', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center'}}>
                {exampleScreen !== 0 &&
                <Button onClick={moveLeft} sx={{color: 'black'}}>
                    <ArrowBackIcon/>
                </Button> 
                }
            </Box>
            
            {/* <Box sx={{display: 'flex', height: '100%', width: '528.578px', minWidth: '528.578px', justifyContent: 'center', gap: 1, position: 'relative', overflowX: 'hidden', overflowY: 'hidden'}}>
                <Box sx={{width: '100%', height: '100%', position: 'absolute', transform: `translateX(${exampleScreen === 0 ? '-100%' : exampleScreen === 1 ? '0%' : exampleScreen === 2 && '100%'})`}}>
                    {exampleTypes.map((example, idx) => {
                        const right = idx === 0 ? '-100%' : idx === 1 ? '0%' : idx === 2 && '100%'
                        return (
                            <Box sx={{position: 'absolute', right, height: '100%', width: '100%'}} key={`import-notice-example-${idx + 1}`}>
                                <ImgData linkKey={example} size='100%' imgFolder='misc'/>
                            </Box>
                        )
                    })}
                </Box>
            </Box>  */}
            <Box sx={{height: '100%', width: '530px', minWidth: '530px'}}>
                <ImgData linkKey={exampleTypes[exampleScreen]} size='100%' imgFolder='misc'/>
            </Box>
            
            <Box sx={{width: '85px', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', zIndex: 50}}>
                {exampleScreen !== 2 &&
                    <Button onClick={moveRight} sx={{color: 'black'}}>
                        <ArrowForwardIcon/>
                    </Button>
                }
            </Box>
        </Box>
    )
}