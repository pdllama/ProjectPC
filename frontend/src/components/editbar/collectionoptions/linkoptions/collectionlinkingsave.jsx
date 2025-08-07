import {Box, Typography, useTheme, Tabs, Tab} from '@mui/material'
import LinkedColDisplayItem from './linkedcoldisplay/linkedcoldisplayitem'

export default function CollectionLinkingSave({newLink, newUnlink, currColData, sw}) {

    const multiLinkage = Array.isArray(newLink) || Array.isArray(newUnlink)

    return (
        <>
        <Box sx={{width: '100%', height: '50%', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', display: 'flex'}}>
            {newLink && <>
            <Typography>You will link to the following collection{multiLinkage ? 's' : ''}:</Typography>
            {multiLinkage ? 
            newLink.map(nL => {
                return (
                    <LinkedColDisplayItem 
                        key={`link-display-${nL._id}`}
                        name={nL.name}
                        gen={nL.gen}
                        type={nL.type}
                        currentCol={{gen: nL.gen, type: nL.type}}
                        wrapperSx={{width: '80%', maxWidth: '400px', mt: 0.5}}
                        nameSx={{'@media only screen and (min-width: 500px)': {width: '375px'}}}
                    />
                )
            }) : 
            <LinkedColDisplayItem 
                        name={newLink.name}
                        gen={newLink.gen}
                        type={newLink.type}
                        currentCol={{gen: newLink.gen, type: newLink.type}}
                        wrapperSx={{width: '80%', maxWidth: '400px'}}
                        nameSx={{'@media only screen and (min-width: 500px)': {width: '375px'}}}
            />}
            </>}
            {newUnlink && <>
            <Typography sx={{mt: 2}}>You will un-link the following collection{multiLinkage ? 's' : ''}:</Typography>
                {Array.isArray(newUnlink) ? 
                newUnlink.map(nUl => {
                    return (
                        <LinkedColDisplayItem 
                            key={`unlink-display-${nUl._id}`}
                            name={nUl.name}
                            gen={nUl.gen}
                            type={nUl.type}
                            currentCol={{gen: nUl.gen, type: nUl.type}}
                            wrapperSx={{width: '80%', maxWidth: '400px'}}
                            nameSx={{'@media only screen and (min-width: 500px)': {width: '375px'}}}
                        />
                    )
                }) : 
                <LinkedColDisplayItem 
                    name={newUnlink.name}
                    gen={newUnlink.gen}
                    type={newUnlink.type}
                    currentCol={{gen: newUnlink.gen, type: newUnlink.type}}
                    wrapperSx={{width: '80%', maxWidth: '400px'}}
                    nameSx={{'@media only screen and (min-width: 500px)': {width: '375px'}}}
                />
                }
            </>}
        </Box>
        <Box sx={{width: '90%', height: '40%', flexDirection: 'column', justifyContent: 'start', alignItems: 'center', display: 'flex'}}>
            {newLink !== undefined && 
            <Typography sx={{fontSize: '14px', textIndent: '10px'}}>All linked collections' progress will merge together as one. While re-separation of collections is possible, re-separating the progress <b>is not reversible.</b> Please be absolutely sure you want to link collections before proceeding!</Typography>
            }
            {newUnlink !== undefined && 
            <Typography sx={{fontSize: '14px', textIndent: '10px', mt: 2}}>Unlinked collections will separate, however, the progress between both collections will be the same.</Typography>
            }
        </Box>
        </>
    )
}