import {Box, Typography, useTheme} from '@mui/material'
import { useState, useRef } from 'react'
import PrettyBoxWrapper from '../../../../components/partials/wrappers/prettyboxwrapper'

export default function Dropdown({children, title, sx, titleWrapperProps, innerWrapperSx, titleSx, dropdownHeight='300px', autoHeight=false, titleOnlyOnClick=false}) {
    const [open, setOpen] = useState('firstRenderFalse')
    const classToApply = open === 'firstRenderFalse' ? 'firstRenderFalse' : open ? 'dropdown-open-class' : 'dropdown-close-class'

    const toggleDropdown = () => {
        setOpen(open === 'firstRenderFalse' ? true : open ? false : true)
    }
    
    const animDur = autoHeight ? 0 : 0.5
    return (
        <>
        <style>
            {`
                @keyframes dropdown-open {
                    0% {
                        height: 0px;
                    }
                    100% {
                        height: ${autoHeight ? 'auto' : dropdownHeight};
                    }
                } 
                @keyframes dropdown-close {
                    0% {
                        height: ${autoHeight ? 'auto' : dropdownHeight};
                    }
                    100% {
                        height: 0px;
                    }
                }  
                .dropdown-open-class {
                    animation: ${animDur}s ease-out 0s 1 dropdown-open;
                    animation-fill-mode: forwards;
                }
                .dropdown-close-class {
                    animation: ${animDur}s ease-out 0s 1 dropdown-close;
                    animation-fill-mode: forwards;
                }
                .firstRenderFalse {
                    height: 0px;
                }
            `}
        </style>
        <PrettyBoxWrapper sx={{alignItems: 'start', ':hover': titleOnlyOnClick ? {} : {opacity: 0.5, cursor: 'pointer'}, ...sx}} props={{onClick: titleOnlyOnClick ? null :toggleDropdown, ...titleWrapperProps}}>
            <Typography sx={{fontSize: '20px', fontWeight: 700, mx: 2, ':hover': titleOnlyOnClick ? {opacity: 0.5, cursor: 'pointer'} : {}, ...titleSx}} onClick={titleOnlyOnClick ? toggleDropdown : null}>
                {title}
            </Typography>
            <Box sx={{overflow: 'hidden', ...innerWrapperSx}} className={classToApply}>
                {children}
            </Box>
        </PrettyBoxWrapper>      

        </>
    )
}