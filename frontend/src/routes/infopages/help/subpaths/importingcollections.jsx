import {Box, Typography, useTheme, Button} from '@mui/material'
import { useState } from 'react'
import HelpPath from '../helppath'
import PrettyBoxWrapper from '../../../../components/partials/wrappers/prettyboxwrapper'
import hexToRgba from 'hex-to-rgba'
import Dropdown from '../components/dropdown'
import {titleWrapperMq, prettyWrapperMq, primaryIndentation, secondaryIndentation, tertiaryIndentation, paraFontSizeMq} from './../components/mqsandstyles'
import AprimonNoticeSlideshow from '../../../../components/collectioncreation/stepcomponents/importselection/aprimon/aprimonimportnoticeslideshow'
import NameFormatModal from '../../../../components/collectioncreation/stepcomponents/importselection/shared/nameformatmodal'
import { useSelector } from 'react-redux'
import { selectScreenBreakpoint } from '../../../../app/selectors/windowsizeselectors'

//to talk about:
//  1. how to import
//  2. limitations (can only do from google sheets, cant import if stuff is displayed certain way (like the warning))
//  3. considerations 
//      1. how the name/natdexnum detection works (name is required, natdexnum is not, but natdexnum allows for more grace on naming)
//      2. name identifiers and the strictness
//      3. how row spans/column spans work (ex what to put, if ends are included (they are))
//      3. notice/warning that while most failed imports will provide an error notice, to still double check that all names were imported correctly
//  4. peripheral importing and how it works (column vs color importing)
//  5. the required information and how to obtain it all

export default function ImportingCollectionsHelp({}) {
    const theme = useTheme()
    const [openNameModal, setOpenNameModal] = useState(false)
    const scrBrkpt = useSelector((state) => selectScreenBreakpoint(state))
    const Highlighted = ({children, blue=false}) => {
        return (
            <span style={{color: blue ? theme.palette.color1.dark : theme.palette.color3.light}}>{children}</span>
        )
    }

    return (
        <>
        <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', width: '100%', height: '100%', maxWidth: '1000px', gap: 1}}>
            <HelpPath path={[{display: 'Help', link: '/help'}, {display: 'Importing Collections'}]}/>
            <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', ...titleWrapperMq, py: 2, px: 3, backgroundColor: hexToRgba(theme.palette.color1.main, 0.9), borderRadius: '10px', border: `2px solid ${theme.palette.color1.dark}`, color: theme.palette.color1.contrastText, width: '100%', height: '100%', gap: 3}}>
                <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                    Importing Collections (from Google Sheets only) allows you to start off a collection with all your previous data.
                </Typography>
                <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                    <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>How to Import your Collection</Typography>
                </PrettyBoxWrapper>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        You can import your collection when you're creating a new one. You currently <Highlighted>cannot import to an already created collection</Highlighted> (but there is plans to set it up).
                        There is a single prerequisite to import your collection: that you do <Highlighted>not</Highlighted> show a combo is owned by inserting an image via <Highlighted>Insert -{'>'} Images -{'>'} Insert Image in Cell</Highlighted>. If 
                        you do track your combos that way, then unfortunately there is no way to import your collection, since google's API does not allow any data to be sent via those cells. You can 
                        click the dropdowns below to see more information, as well as see the required information for importing:
                    </Typography>
                <Dropdown
                    title={'Pre-requisite'}
                    autoHeight={true}
                    sx={{width: '100%', backgroundColor: hexToRgba(theme.palette.color1.light, 0.3), border: `1px solid ${theme.palette.color1.dark}`, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
                    innerWrapperSx={{...theme.components.box.fullCenterCol, alignItems: 'start', gap: 3, width: '100%', overflowX: 'scroll'}}
                    titleOnlyOnClick={true}
                    titleSx={{width: '100%', textAlign: 'start'}}
                >
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ml: 2, mt: 1, ...paraFontSizeMq}}>
                        Here is an infographic to better understand the pre-requisite. Essentially, if there is something in the fx box when you click on a combo cell, you're good to go.
                    </Typography>
                    <Box>
                    <AprimonNoticeSlideshow/>
                    </Box>
                </Dropdown>
                <Dropdown
                    title={'Required Information'}
                    autoHeight={true}
                    sx={{mt: -3, width: '100%', backgroundColor: hexToRgba(theme.palette.color2.light, 0.3), border: `1px solid ${theme.palette.color2.dark}`, borderTopLeftRadius: 0, borderTopRightRadius: 0}}
                    innerWrapperSx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', gap: 2}}
                >
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ml: 2, mt: 1, ...paraFontSizeMq}}>
                        Here is a list of all the required information to import. You will be asked for these in the import page:
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                        - <Highlighted>Spreadsheet Link</Highlighted>: The link to the spreadsheet. Make sure it <Highlighted>isn't the link to the published sheet</Highlighted>, but the
                        same link that is there when you're editing the spreadsheet.
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                        - <Highlighted>Sheet Name</Highlighted>: The name of the sheet you want to import. When you're editing you're spreadsheet, it will be the name at the <Highlighted>bottom of the editor</Highlighted>, where
                        the tab is displayed.
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                        - <Highlighted>Row Span</Highlighted>: The start and end rows of all the pokemon in the collection. So if your first pokemon is on row 8 and the last one is 
                        on row 294, the row span will be 8-294. This will automatically filter out <Highlighted>divider rows</Highlighted> like, for example, rows that say 
                        "Generation 2".
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                        - <Highlighted>Identifier Columns</Highlighted>: The letters of the columns which are used to identify which pokemon a row is associated with. There are two types:
                    </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', mt: -1, ...tertiaryIndentation, ...paraFontSizeMq}}>
                            - <Highlighted>National Dex Number</Highlighted> (Optional): The column letter of the dex numbers of pokemon. This is not required, but allows for more leniency if a name is mispelled, for example.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', my: -1, ...tertiaryIndentation, ...paraFontSizeMq}}>
                            - <Highlighted>Name</Highlighted> (Required): The column letter of the names of pokemon. There are <Highlighted>additional considerations</Highlighted> when it comes
                            to this row, particularly for alternate form and regional form pokemon (since there are different naming conventions). See the "Identifying Pokemon" section for more details. 
                        </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                         - <Highlighted>Owned Ball Column Span</Highlighted>: The start and end letters for the columns of whether the ball combo is owned. The first letter is the ball furthest to the left of your spreadsheet,
                         while the last letter is ball furthest to the right.
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                         - <Highlighted>Ball Order</Highlighted>: This is the order of the balls in the ball columns, from left to right. It is <Highlighted>crucial that the ball order is correct</Highlighted>, since
                         this is what allows our program to know which ball belongs to which column. If this is input incorrectly, the import <Highlighted>be completely wrong</Highlighted>. If you are not collecting a 
                         particular ball, you can leave it blank.
                    </Typography>
                </Dropdown>
                <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                    <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>Importing Peripheral Data</Typography>
                </PrettyBoxWrapper>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        You can also import three pieces of peripheral data: <Highlighted>Hidden Ability (HA)</Highlighted>, <Highlighted>Egg Move Count (EM Count)</Highlighted>, and <Highlighted>Egg Moves (EMs)</Highlighted>.
                         How you import them depends on your style of tracking that data. To mark that a combo has its hidden ability or has the maximum number of egg moves possible, some decide
                         to <Highlighted>color-code</Highlighted> the cell. Alternatively, some people prefer to track HA and EM data in <Highlighted>separate columns</Highlighted>. 
                         We have included support for importing both of these methods, which work for specific peripherals:
                    </Typography>
                    <Typography sx={{fontSize: '18px', textAlign: 'start', fontWeight: 700, textDecoration: 'underline'}}>Color-Coded Importing (HA and EM Count)</Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', mt: -2, ...primaryIndentation, ...paraFontSizeMq}}>
                            To import color-coded peripherals (for HA and EM Count), input the hex codes of <Highlighted>all the possible colors that indicate the aprimon has HA and/or max EM count</Highlighted>. So if you're
                            importing HA and a blue cell means they have HA, but a green cell means they have HA and max EMs, then you would input the hex codes for both of the colors. 
                            You can input up to <Highlighted>4 colors</Highlighted>.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', mt: -2, ...primaryIndentation, ...paraFontSizeMq}}>
                            Color codes are the <Highlighted>only way to import EM Count</Highlighted>, but you can also import <Highlighted>EMs by column</Highlighted> to accompany the data.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', mt: -2, ...primaryIndentation, ...paraFontSizeMq}}>
                            For <Highlighted>HA</Highlighted>, color-coded importing is only one way we can gather the data: we can also import by column. These methods are <Highlighted>exclusive</Highlighted>, 
                            so only one of these methods are available at a time.
                        </Typography>
                    <Typography sx={{fontSize: '18px', textAlign: 'start', fontWeight: 700, textDecoration: 'underline'}}>Column Importing (HA and EMs)</Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', mt: -2, ...primaryIndentation, ...paraFontSizeMq}}>
                            Importing HA by column is for if, in your sheet, there is <Highlighted>a dedicated column to indicate if HA is available on the ball combos</Highlighted> of the given pokemon in the row. In other words, if there is a column
                            of checkboxes/images (NOT via the Insert {'->'} Images {'->'} Insert Image in Cell) which indicate it. 
                            Here, you would indicate the letter of that column.
                            If you import this way, and it is marked true, <Highlighted>all owned ball combos will have HA marked as true</Highlighted>. So there is no specificity like there is with color-coded importing.
                            Again, this is <Highlighted>mutually exclusive</Highlighted> with color-coded importing, so you can only import one way or the other.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', mt: -2, ...primaryIndentation, ...paraFontSizeMq}}>
                            Importing EMs via column (can only be done when <Highlighted>each EM is in its own column</Highlighted>) is simply putting the letter column of each EM. Like with HA column
                            importing, this will apply the EMs to <Highlighted>all owned ball combos</Highlighted>. If you decide to import EMs but not EM Count, the EM count will <Highlighted>be updated based on the EM imports</Highlighted>.
                        </Typography>
                <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                    <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>Identifying Pokemon</Typography>
                </PrettyBoxWrapper>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        The most difficult part about importing is making sure our program correctly identifies the pokemon in the row. This typically involves making sure 
                        the pokemon's name is spelled correctly, and that the dex number matches the pokemon (if you so choose to include that). However, especially when it comes to 
                        alternate form/regional form pokemon, the most important thing is making sure you have the correct <Highlighted>identifier</Highlighted> for the pokemon. 
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        The import can be <Highlighted>very strict</Highlighted> with making sure the name is correct, so please ensure that all the pokemon's names are spelled correctly!
                        Otherwise, it will likely fail.
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        You can click the button below to see detailed information on the required name identifiers for alternate form/regional form pokemon:
                    </Typography>
                    <Box sx={{...theme.components.box.fullCenterCol, width: '100%'}}>
                        <Button sx={{fontSize: '18px'}} variant='contained' onClick={() => setOpenNameModal(true)}>See Name Identifiers</Button>
                    </Box>
                <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                    <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>Handling Errors</Typography>
                </PrettyBoxWrapper>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        Once the import result is displayed to you, any errors in the imports will also be displayed. Some of the most common
                        reasons for errors will be <Highlighted>mispelled names</Highlighted>, <Highlighted>mismatching names/dex numbers</Highlighted> and <Highlighted>lack of required identifiers</Highlighted> (for alternate/regional forms).
                        Furthermore, if you imported egg moves, you'll get information on any <Highlighted>failed egg moves imports</Highlighted>.
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        While our program does try to catch errors, it's still a good idea to double check that everything imported correctly!
                    </Typography>
            </Box>
        </Box>
        <NameFormatModal open={openNameModal} handleClose={() => setOpenNameModal(false)} sw={scrBrkpt === 'sm'}/>
        </>
    )
}