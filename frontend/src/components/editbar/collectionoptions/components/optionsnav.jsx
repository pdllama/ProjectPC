import {Box, Typography, useTheme, Button} from '@mui/material'
import ArrowForward from '@mui/icons-material/ArrowForward'

export default function OptionsNav({elementBg, optionFuncs, stage, sw}) {
    
    const {option1, option2, option3, option4} = optionFuncs
    //optionFuncs { option[n]: {label, onClick (if applicable))} }
    const theme = useTheme()


    return (
        <Box sx={{...elementBg, width: '95%', height: sw ? '80px' : '35px', display: 'flex', alignItems: 'center', mb: 1}}>
            {stage === 1 ? <Typography sx={{color: 'white', fontWeight: 700, mx: 1, textAlign: 'center'}}>{option1.label}</Typography> : 
                <>
                <Button sx={{color: 'rgb(38, 188, 201)', fontWeight: 700, textTransform: 'none', fontSize: '1rem'}} onClick={option1.onClick}>
                    {option1.label}
                </Button>
                <ArrowForward sx={{color: 'rgb(38, 188, 201)'}}/>
                </>
            }
            {stage < 2 ? <></> : stage === 2 ? <Typography sx={{color: 'white', fontWeight: 700, mx: 1, textAlign: 'center'}}>{option2.label}</Typography> : 
                <>
                <Button sx={{color: 'rgb(38, 188, 201)', fontWeight: 700, textTransform: 'none', fontSize: '1rem'}} onClick={option2.onClick}>
                    {option2.label}
                </Button>
                <ArrowForward sx={{color: 'rgb(38, 188, 201)'}}/>
                </>
            }
            {stage < 3 ? <></> : stage === 2 ? <Typography sx={{color: 'white', fontWeight: 700, mx: 1}}>{option3.label}</Typography> : 
                <>
                <Button sx={{color: 'rgb(38, 188, 201)', fontWeight: 700, textTransform: 'none', fontSize: '1rem', textAlign: 'center'}} onClick={option3.onClick}>
                    {option3.label}
                </Button>
                <ArrowForward sx={{color: 'rgb(38, 188, 201)'}}/>
                </>
            }
            {stage < 4 ? <></> : stage === 4 && <Typography sx={{color: 'white', fontWeight: 700, mx: 1}}>{option4.label}</Typography>} 
        </Box>
    )
}