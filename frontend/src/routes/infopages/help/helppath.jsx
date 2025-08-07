import {Box, Typography, useTheme, Button} from '@mui/material'
import { Fragment } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router';

export default function HelpPath({path}) {
    const theme = useTheme()
    const navigate = useNavigate()

    //path comes out as an array of objects as follows:
    // {link: <link to previous path>, display: <display of path>}

    return (
        <Box sx={{width: '100%', display: 'flex', alignItems: 'center'}}>
            {path.map((p, idx) => {
                const isActive = idx === path.length-1
                const hasLink = p.link !== undefined
                return (
                    <Fragment key={`help-${p.display}-path`}>
                    {idx !== 0 && 
                        <ArrowForwardIcon sx={{ color: 'rgb(75,75,75)', fontSize: '16px'}}/>
                    }
                    {(isActive || !hasLink) ? 
                    <Typography sx={{color: 'rgb(75, 75, 75)', fontSize: '14px', padding: 1, py: 0.75, minWidth: '48px'}}>
                        <i>{p.display}</i>
                    </Typography> : 
                    hasLink && 
                    <Button sx={{color: 'rgb(75, 75, 75)', fontSize: '14px', textTransform: 'none'}} onClick={() => navigate(p.link)}>
                        <i>{p.display}</i>
                    </Button>
                    }
                    </Fragment>
                )
            })}
        </Box>
    )
}