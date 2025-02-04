import {Box, Typography, useTheme, Modal, Fade, Backdrop, Tabs, Tab, Checkbox, Tooltip, ToggleButton, Button} from '@mui/material'
import SmallWidthModalWrapper from '../../../partials/wrappers/smallwidthmodalwrapper'
import modalStyles from '../../../../../utils/styles/componentstyles/modalstyles'
import ImgData from '../../../collectiontable/tabledata/imgdata'
import { useState, useRef } from 'react'
import hexToRgba from 'hex-to-rgba'
import {CSVLink} from 'react-csv'
import { convertCollectionToCSV, convertOnHandToCSV } from '../../../../../utils/functions/export/exportmain'
import { useSelector } from 'react-redux'
import displayOnHandByPokemon from '../../../../../utils/functions/display/displayonhandbypokemon'

//NOTE: this function, when the ball order selection is hidden then shown, brings up an error about an uncontrolled st

export default function ExportCollectionModal({sw, open, toggleModal, collectionGen, useOhByPInit, userBallOrder, nameDisplaySettings=undefined, availableHomeGames={}, collectionName}) {
    const theme = useTheme()
    const collectionList = useSelector((state) => state.collectionState.collection)
    const onhandList = useSelector((state) => state.collectionState.onhand)
    const [exportOptions, setExportOptions] = useState({
        tab: 'collection',
        optionsSection: true,
        convertOptions: {
            HAExport: false, //determines if that information should be exported when exporting isOwned
            EMExport: false, //same thing as above. exports as a column of checkboxes which is checked if ANY ball combos have it.
            addHANameColumn: true, //adds a column that tells you of the pokemon's HA
            imgOwned: false, //adds image if ball combo is owned
            getGameSprite: collectionGen === 'home' ? null : false, //(only for home collections), selects whether to get the sprite from their most recent home game, rather than their home sprite.
            ballOrder: userBallOrder, //the ball order of the user from their settings. Note that this selection is based on the ball scope of the collection
            useByPView: useOhByPInit, //used for onhand exports if they want to export the byPview
            ohRawBallData: false,
            gen: collectionGen
        }
    })
    // const currentCSVRef = useRef([['dasda', 'asdas'], ['sda', 'asda']])

    const tentativeBallOrder = !(exportOptions.convertOptions.ballOrder.length === userBallOrder.length) ? [...exportOptions.convertOptions.ballOrder, ...userBallOrder.filter(b => !exportOptions.convertOptions.ballOrder.includes(b))] : exportOptions.convertOptions.ballOrder
    const ballOrderSelectionActive = exportOptions.tab === 'collection' || exportOptions.convertOptions.useByPView

    const toggleBooleanOption = (optionKey) => {
        setExportOptions({...exportOptions, convertOptions: {...exportOptions.convertOptions, [optionKey]: !exportOptions.convertOptions[optionKey]}})
    }


    const toggleBallOrder = (ball) => {
        const newBallOrder = exportOptions.convertOptions.ballOrder.includes(ball) ? exportOptions.convertOptions.ballOrder.filter(b => b !== ball) : [...exportOptions.convertOptions.ballOrder, ball]
        setExportOptions({...exportOptions, convertOptions: {...exportOptions.convertOptions, ballOrder: newBallOrder}})
    }

    const ballButtonStyles = {
        '&.Mui-selected': {
            backgroundColor: hexToRgba(theme.palette.color1.main, 0.9),
            ':hover': {
                backgroundColor: hexToRgba(theme.palette.color1.main, 0.75)
            }
        },
        '@media only screen and (max-width: 400px) and (min-width: 335px)': {
            px: 0.5
        },
        '@media only screen and (max-width: 334px)': {
            px: 0.25
        }
    }

    const generateCSV = () => {
        const listToUse = exportOptions.tab === 'collection' ? collectionList.filter(p => !p.disabled) : exportOptions.convertOptions.useByPView ? displayOnHandByPokemon(onhandList, collectionList) : onhandList
        const functionToUse = exportOptions.tab === 'collection' ? convertCollectionToCSV : convertOnHandToCSV
        const blob = new Blob([functionToUse(listToUse, {...exportOptions.convertOptions, ballOrder: tentativeBallOrder}, nameDisplaySettings, availableHomeGames)], {type: 'text/csv'})

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a')
        link.href = url
        link.download = `${collectionName}-${exportOptions.tab === 'collection' ? 'list' : 'onhand'}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const generateModalContents = () => {
        return (
            <>
            <Box sx={{...theme.components.box.fullCenterRow, backgroundColor: theme.palette.color1.dark, color: 'white', height: '8%', width: '95%', borderRadius: '10px'}}>
                <Typography sx={{fontSize: '24px'}}><b>Export Collection</b></Typography>
            </Box>
            <Box sx={{...theme.components.box.fullCenterCol, backgroundColor: theme.palette.color1.dark, color: 'white', width: '95%', height: '5%', borderRadius: '10px', mt: 1}}>
                <Tabs value={exportOptions.tab} onChange={(e, newVal) => setExportOptions({...exportOptions, tab: newVal})}>
                    <Tab value='collection' label='Collection List'/>
                    <Tab value='onhand' label='On-Hand List'/>
                </Tabs>
            </Box>
            <Box sx={{...theme.components.box.fullCenterCol, backgroundColor: theme.palette.color1.dark, color: 'white', width: '95%', height: '45%', borderRadius: '10px', mt: 1, position: 'relative'}}>
                {exportOptions.optionsSection ?
                <>
                <Typography sx={{fontSize: '24px'}}><b>Export Options</b></Typography>
                <Box sx={{width: '100%', height: '100%', ...theme.components.box.fullCenterCol, justifyContent: 'start'}}>
                   
                    <Box sx={{width: '90%', ...theme.components.box.fullCenterRow, gap: '5%', position: 'relative'}}>
                        {/* <Box sx={{width: '50%', ...theme.components.box.fullCenterCol, alignItems: 'end'}}>
                            <Tooltip title='Check this option if you want to add a column of hidden ability information, if applicable.'>
                                <Typography sx={{fontSize: '14px'}}>Add Hidden Ability Name Column:</Typography>
                            </Tooltip>
                        </Box>
                        <Box sx={{width: '15%', ...theme.components.box.fullCenterCol, justifyContent: 'start'}}>
                            <Checkbox
                                sx={{color: 'white'}}
                                checked={exportOptions.convertOptions.addHANameColumn}
                                onChange={() => toggleBooleanOption('addHANameColumn')}
                            />
                        </Box> */}
                        <Tooltip placement='top' title='Check this option if you want to add a column of hidden ability information, if applicable.'>
                            <Typography sx={{fontSize: '14px', ':hover': {cursor: 'pointer'}}}>Add Hidden Ability Name Column:</Typography>
                        </Tooltip>
                        <Checkbox
                            sx={{color: 'white'}}
                            checked={exportOptions.convertOptions.addHANameColumn}
                            onChange={() => toggleBooleanOption('addHANameColumn')}
                        />
                    </Box>
                    {exportOptions.tab === 'collection' && 
                    <Box sx={{width: '90%', ...theme.components.box.fullCenterRow, gap: '5%', position: 'relative'}}>
                        <Tooltip title='Check this option if you want an image of a ball if a particular pokemon/ball combo is owned. Otherwise, a checkbox will be used.'>
                            <Typography sx={{fontSize: '14px', ':hover': {cursor: 'pointer'}}}>Use Image if Owned:</Typography>
                        </Tooltip>
                        <Checkbox
                            sx={{color: 'white'}}
                            checked={exportOptions.convertOptions.imgOwned}
                            onChange={() => toggleBooleanOption('imgOwned')}
                        />
                    </Box>}
                    {collectionGen === 'home' && 
                    <Box sx={{width: '90%', ...theme.components.box.fullCenterRow, gap: '5%', position: 'relative'}}>
                        <Tooltip title='Check this option if you want to the pokemon sprites column to use the sprite from the latest pokemon game that the pokemon is featured in. Otherwise, it will use their HOME sprite.'>
                            <Typography sx={{fontSize: '14px', ':hover': {cursor: 'pointer'}}}>Use Sprite from Game:</Typography>
                        </Tooltip>
                        <Checkbox
                            sx={{color: 'white'}}
                            checked={exportOptions.convertOptions.getGameSprite}
                            onChange={() => toggleBooleanOption('getGameSprite')}
                        />
                    </Box>}
                    {exportOptions.tab === 'collection' && 
                    <>
                    <Box sx={{width: '90%', ...theme.components.box.fullCenterRow, gap: '5%', position: 'relative', mb: 5}}>
                        <Tooltip title='Check this option if you want to export the HA data of pokemon in the collection.'>
                            <Typography sx={{fontSize: '14px', ':hover': {cursor: 'pointer'}}}>Export Hidden Ability Data:</Typography>
                        </Tooltip>
                        <Checkbox
                            sx={{color: 'white'}}
                            checked={exportOptions.convertOptions.HAExport}
                            onChange={() => toggleBooleanOption('HAExport')}
                        />
                        <Typography sx={{position: 'absolute', bottom: '-30px', fontSize: '11px', textAlign: 'center', lineHeight: '12px', maxWidth: '285px'}}>
                            This will export a column of "HA Available" checkboxes where it will be checked if at least one ball of the pokemon has its hidden ability. Left of Owned Data.
                        </Typography>
                    </Box>
                    {collectionGen !== 'home' &&
                    <Box sx={{width: '90%', ...theme.components.box.fullCenterRow, gap: '5%', position: 'relative', mb: 5}}>
                        <Tooltip title='Check this option if you want to export the EM data of pokemon in the collection.'>
                            <Typography sx={{fontSize: '14px', ':hover': {cursor: 'pointer'}}}>Export Egg Move Data:</Typography>
                        </Tooltip>
                        <Checkbox
                            sx={{color: 'white'}}
                            checked={exportOptions.convertOptions.EMExport}
                            onChange={() => toggleBooleanOption('EMExport')}
                        />
                        <Typography sx={{position: 'absolute', bottom: '-20px', fontSize: '11px', textAlign: 'center', lineHeight: '12px', maxWidth: '285px'}}>
                            This will export the following columns at the end of each line: EM1, EM2, EM3, EM4, Additional EMs.
                        </Typography>
                    </Box>}
                    </>
                    }
                    {(exportOptions.tab === 'onhand') && 
                    <Box sx={{width: '90%', ...theme.components.box.fullCenterRow, gap: '5%', position: 'relative', mb: 5}}>
                        <Typography sx={{fontSize: '13px', ':hover': {cursor: 'pointer'}}}>Export On-Hand Data by Pokemon:</Typography>
                        <Checkbox
                            sx={{color: 'white'}}
                            checked={exportOptions.convertOptions.useByPView}
                            onChange={() => toggleBooleanOption('useByPView')}
                        />
                    </Box>
                    }
                    {exportOptions.tab === 'onhand' && 
                    <Box sx={{width: '90%', ...theme.components.box.fullCenterRow, gap: '5%', position: 'relative', mb: 5}}>
                        <Typography sx={{fontSize: '13px', ':hover': {cursor: 'pointer'}}}>Use Raw Ball/Gender Names:</Typography>
                        <Checkbox
                            sx={{color: 'white'}}
                            checked={exportOptions.convertOptions.ohRawBallData}
                            onChange={() => toggleBooleanOption('ohRawBallData')}
                        />
                        <Typography sx={{position: 'absolute', bottom: '-20px', fontSize: '11px', textAlign: 'center', lineHeight: '12px', maxWidth: '285px'}}>
                            This will export the ball and gender of onhands as the name rather than as an image.
                        </Typography>
                    </Box>
                    }
                    
                </Box>
                </> : 
                <>
                <Typography sx={{fontSize: '24px', textAlign: 'center'}}><b>Setting up Sheets with Images/Checkboxes</b></Typography>
                <Box sx={{width: '100%', height: '100%', ...theme.components.box.fullCenterCol, justifyContent: 'start'}}>
                    <Typography sx={{textAlign: 'center', fontSize: '12px', width: '100%'}}>
                        The CSV exports image formulas for pokemon sprites, ball sprites, and genders to use when exporting to google sheets. 
                        You will have to initialize these formulas by adding an "=" sign in front of them in google sheets.
                        <br></br>There is a very easy way to do so:
                        <br></br><span style={{textIndent: '20px'}}>1. Highlight all cells with formulas</span>
                        <br></br><span style={{textIndent: '20px'}}>2. Hit Ctrl+F and click the three dots in the new box</span>
                        <br></br><span style={{textIndent: '20px'}}>3. Enter "^" in "Find", "=" in "Replace", and check "Match case" and "Search using regular expressions"</span>
                    </Typography>
                    <Typography sx={{textAlign: 'center', fontSize: '12px', width: '100%', mt: 1}}>
                        Additionally, you'll have to initialize all checkboxes (TRUE/FALSE values) by highlighting the cells and clicking Insert =&gt; Checkbox
                    </Typography>
                </Box>    
                </>
                }
                <Button sx={{position: 'absolute', bottom: '-5px', right: '20px'}} onClick={() => setExportOptions({...exportOptions, optionsSection: !exportOptions.optionsSection})}>
                    Considerations with Images/Checkboxes
                </Button>
            </Box>
            {ballOrderSelectionActive && 
            <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', backgroundColor: theme.palette.color1.dark, color: 'white', width: '95%', height: '30%', borderRadius: '10px', mt: 1}}>
                <Typography sx={{fontSize: '18px'}}>Ball Order</Typography>
                <Typography sx={{fontSize: '12px', textAlign: 'center'}}>Select the ball order to export the data in. By default, it is set to your default ball order in your user settings.</Typography>
                <Box sx={{width: '100%', height: '40%', display: 'flex', flexDirection: 'row', justifyContent: 'center', mt: 2}}>
                    {userBallOrder.slice(0, 7).map((ball) => {
                        return (
                            <ToggleButton 
                                key={`order-select-${ball}-ball`} 
                                value={ball}
                                selected={exportOptions.convertOptions.ballOrder.includes(ball)}
                                onChange={() => toggleBallOrder(ball)}
                                sx={{padding: 0, px: 1, display: 'flex', flexDirection: 'column', justifyContent: 'end', mx: 0.2, position: 'relative', height: '55px', ...ballButtonStyles}}
                            >
                                {exportOptions.convertOptions.ballOrder.includes(ball) && 
                                <Typography
                                    sx={{
                                        fontSize: '14px', 
                                        position: 'absolute',
                                        top: '-3px', 
                                        fontWeight: 700,
                                        color: 'white'
                                    }}
                                >
                                        {exportOptions.convertOptions.ballOrder.indexOf(ball) + 1}
                                </Typography>
                                }
                                <ImgData type='ball' linkKey={ball}/>
                            </ToggleButton>
                        )
                    })}
                    
                </Box>
                <Box sx={{width: '100%', height: '40%', display: 'flex', flexDirection: 'row', justifyContent: 'center', mt: 1}}>
                    {userBallOrder.slice(7, userBallOrder.length).map((ball) => {
                        return (
                            <ToggleButton 
                                key={`order-select-${ball}-ball`} 
                                value={ball}
                                selected={exportOptions.convertOptions.ballOrder.includes(ball)}
                                onChange={() => toggleBallOrder(ball)}
                                sx={{padding: 0, px: 1, display: 'flex', flexDirection: 'column', justifyContent: 'end', mx: 0.2, position: 'relative', height: '55px', ...ballButtonStyles}}
                            >
                                {exportOptions.convertOptions.ballOrder.includes(ball) && 
                                <Typography
                                    sx={{
                                        fontSize: '14px', 
                                        position: 'absolute',
                                        top: '-3px', 
                                        fontWeight: 700,
                                        color: 'white'
                                    }}
                                >
                                        {exportOptions.convertOptions.ballOrder.indexOf(ball) + 1}
                                </Typography>
                                }
                                <ImgData type='ball' linkKey={ball}/>
                            </ToggleButton>
                        )
                    })}
                </Box>
            </Box>
            }
            <Box sx={{...theme.components.box.fullCenterCol, backgroundColor: theme.palette.color1.dark, color: 'white', width: '95%', height: ballOrderSelectionActive ? '8%' : '37%', borderRadius: '10px', mt: 1}}>
                <Button
                    onClick={generateCSV}
                >
                    Download CSV
                </Button>
            </Box>
            </>
        )
    }

    const generateModal = () => {
        return sw ? 
        <SmallWidthModalWrapper 
            ariaLabel='export collection'
            ariaDescribe='export collection to a csv file'
            handleClose={toggleModal}
            open={open}
            sx={{justifyContent: 'start', pt: 0.5}}
        >
            {generateModalContents()}
        </SmallWidthModalWrapper> :
        <Modal
            aria-labelledby='export collection'
            aria-describedby='export collection to a csv file'
            open={open}
            onClose={toggleModal}
            closeAfterTransition
            slots={{backdrop: Backdrop}}
            slotProps={{
                backdrop: {
                    timeout: 500
                }
            }}
        >
            <Fade in={open}>
                <Box sx={{...modalStyles.onhand.modalContainer, justifyContent: 'start', height: '665px', width: '70%', maxWidth: '800px', display: 'flex', alignItems: 'center'}}>
                    {generateModalContents()}
                </Box>
            </Fade>
        </Modal>
    }

    return generateModal()
}
