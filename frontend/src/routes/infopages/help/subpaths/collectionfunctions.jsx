import {Box, Typography, useTheme} from '@mui/material'
import HelpPath from '../helppath'
import PrettyBoxWrapper from '../../../../components/partials/wrappers/prettyboxwrapper'
import hexToRgba from 'hex-to-rgba'
import Dropdown from '../components/dropdown'
import {titleWrapperMq, prettyWrapperMq, primaryIndentation, secondaryIndentation, tertiaryIndentation, paraFontSizeMq} from './../components/mqsandstyles'

//things to talk about:
// 1. peripherals - defaults, global defaults, pending, wanted, EMs, HA, home EMs
// 2. how table data is displayed. black square = combo is illegal, grey = combo is disabled. HA being low opacity if not there, EMs, can click on EM to see them, etc. 
// 3. Quick editing vs full editing 
//      1. how you can click on certain places of a row to get to different places (ex clicking on ball cell)
//      2. quick editing - clicking table data to change it (checkbox, HA and EM indicators)
// 4. home onhand EM data (emgen)
// 5. sharing progress between collections (linking and upcoming custom sheets)
//      also: the limitations of the different ways to share progress
// 6. how scopes work
// 7. ball selection in collection vs onhand lists
//      also talk about if you remove the pokemon from the collection list, if theres an onhand of that pokemon, you cant edit it anymore

//update: no longer talking about 



export default function CollectionFunctionsHelp({}) {
    const theme = useTheme()
    const Highlighted = ({children, blue=false}) => {
        return (
            <span style={{color: blue ? theme.palette.color1.dark : theme.palette.color3.light}}>{children}</span>
        )
    }
    //, '@media only screen and (max-width: 500px)': {mx: 1}

    return (
        <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', width: '100%', height: '100%', maxWidth: '1000px', gap: 1}}>
            <HelpPath path={[{display: 'Help', link: '/help'}, {display: 'Collection Functions'}]}/>
            <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', ...titleWrapperMq, py: 2, px: 3, backgroundColor: hexToRgba(theme.palette.color1.main, 0.9), borderRadius: '10px', border: `2px solid ${theme.palette.color1.dark}`, color: theme.palette.color1.contrastText, width: '100%', height: '100%', gap: 3}}>
                <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                    <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>Collection List Table Data</Typography>
                </PrettyBoxWrapper>
                <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                    When you look at a collection, each row corresponds to a particular pokemon in the collection. 
                    The columns represent the ball combinations that the collector is collecting of that pokemon.
                    The <Highlighted>checkbox</Highlighted> determines whether the user has that combination in their collection.
                    Furthermore, there is various <Highlighted>peripheral data</Highlighted> that collectors tend to keep track of for every pokemon/ball combination, as listed below:
                </Typography>
                <Dropdown
                    title={'Peripherals if the ball combination is owned'}
                    autoHeight={true}
                    sx={{width: '100%', backgroundColor: hexToRgba(theme.palette.color1.light, 0.3), border: `1px solid ${theme.palette.color1.dark}`, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
                    innerWrapperSx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', gap: 3}}
                >
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ml: 2, mt: 1, ...paraFontSizeMq}}>
                        Here is a list of peripherals that are only displayed and/or changeable if the ball combination is marked as owned:
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                        - <Highlighted>Hidden Ability</Highlighted> (HA): Whether that combination is available with the pokemon's Hidden Ability.
                    </Typography>
                    <Typography sx={{...secondaryIndentation, fontSize: '16px', textAlign: 'start', ...paraFontSizeMq}}>
                        - <Highlighted>Egg Moves</Highlighted> (EM): Whether that combination is available with the pokemon's Egg Moves, as well as how many and which ones that combination has.
                        This data is divided into two separate data pieces: <Highlighted>Egg Move Count</Highlighted> (the number of egg moves) and <Highlighted>Egg Moves</Highlighted> (which egg moves they are).
                        You can choose to change only the egg move count without specifying the egg moves, but once you set the egg moves, it <Highlighted>changes the egg move count</Highlighted>. The reason
                        they are two separate data pieces is so that users can choose the level of peripheral tracking they want for themselves. Some users just want to track the egg move number, but some may want to 
                        be more meticulous. Whichever way you want to collect is available to you!
                    </Typography>
                        <Typography sx={{...tertiaryIndentation, fontSize: '16px', textAlign: 'start', my: -2, ...paraFontSizeMq}}>
                            - Egg Move data will account for when the <Highlighted>possible number of egg moves of a pokemon is 4 or less</Highlighted>. For example, if the selected pokemon only has 3 possible egg moves, you will only be able to select up to 3 for the egg move count.
                            If you select 3 for the egg move count, <Highlighted>the Egg Moves will automatically be changed</Highlighted> to those 3 possible egg moves. In that same example, if you decide to set it to 2 or less, the egg moves will be reset,
                            since the app doesn't know which ones they are! 
                        </Typography>
                        <Typography sx={{...tertiaryIndentation, fontSize: '16px', textAlign: 'start', mb: -2, ...paraFontSizeMq}}>
                            Note: Egg Move data works differently for HOME collections. See the HOME Egg Moves section further below
                        </Typography>
                    <Typography sx={{...secondaryIndentation, fontSize: '16px', textAlign: 'start', ...paraFontSizeMq}}>
                        - <Highlighted>Default</Highlighted>: If an owned ball combination is marked as the default, then once another ball combination <Highlighted>of the same pokemon species</Highlighted> is 
                        marked as owned, it will automatically <Highlighted>copy</Highlighted> the peripheral data of the default combination. This means the HA, EM count, and EMs will all be copied. These come in two types: 
                    </Typography>
                        <Typography sx={{...tertiaryIndentation, fontSize: '16px', textAlign: 'start', mt: -2, ...paraFontSizeMq}}>
                            <Highlighted>Global Defaults:</Highlighted> Defaults which apply to all pokemon. Only HA and EM count are affected by this type of default. These defaults can be changed in the collection options.
                            Global defaults will also take into account <Highlighted>the maximum possible egg moves</Highlighted> of each pokemon and update the egg moves of the pokemon accordingly!
                        </Typography>
                        <Typography sx={{...tertiaryIndentation, fontSize: '16px', textAlign: 'start', my: -2, ...paraFontSizeMq}}>
                            <Highlighted>Pokemon-Specific Defaults:</Highlighted> Defaults which apply to a specific pokemon. All peripherals are affected by this type of default, and they will <Highlighted>override the global defaults</Highlighted> if one is designated. 
                            These defaults can be designated by editing the pokemon via the edit bar.
                        </Typography>
                        <Typography sx={{...tertiaryIndentation, fontSize: '16px', textAlign: 'start', ...paraFontSizeMq}}>
                            Note: Defaults are <Highlighted>not visible in the collection table</Highlighted>. For now, they can only be selecting the pokemon in edit mode and seeing the edit bar.
                        </Typography>
                </Dropdown>
                <Dropdown
                    title={'Peripherals if the ball combination is not owned'}
                    autoHeight={true}
                    sx={{mt: -3, width: '100%', backgroundColor: hexToRgba(theme.palette.color2.light, 0.3), border: `1px solid ${theme.palette.color2.dark}`, borderTopLeftRadius: 0, borderTopRightRadius: 0}}
                    innerWrapperSx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', gap: 3}}
                >
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ml: 2, mt: 1, ...paraFontSizeMq}}>
                        Here is a list of peripherals that are only displayed and/or changeable if the ball combination is marked as un-owned:
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                        - <Highlighted>Highly Wanted</Highlighted> (WANT): Whether that combination is highly wanted by the collector. This is also called a <Highlighted>wishlist</Highlighted> aprimon.
                        Users may be willing to offer more aprimon if you can offer them a wanted aprimon. 
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                        - <Highlighted>Pending</Highlighted> (PEND): Whether that combination is incoming from an outside trade. This typically means the collector is not looking for offers of that aprimon, and
                        when you compare collections with them, it will purposefully exclude that combination.
                    </Typography>
                    <Typography sx={{...secondaryIndentation, fontSize: '16px', textAlign: 'start', ...paraFontSizeMq}}>
                            Note: These peripherals are <Highlighted>mutually exclusive</Highlighted>, and are removed upon <Highlighted>marking the combo as owned</Highlighted>.
                        </Typography>
                </Dropdown>
                <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                    An empty black square cell means the pokemon/ball combo is <Highlighted>illegal</Highlighted> in that generation, while an empty grey square means the combo is <Highlighted>excluded</Highlighted> by the user.
                </Typography>
                <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                    <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>HOME Collection Egg Move Data</Typography>
                </PrettyBoxWrapper>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        Egg Move Data works a bit differently for HOME collections.
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        With HOME collections, you can specify the egg move peripherals of a ball combination for <Highlighted>every HOME-compatible game</Highlighted> where that pokemon
                        is featured in, and has egg moves in. So, you could specify <Highlighted>multiple egg move counts/egg moves</Highlighted> per ball combo. While only one game's egg move data is viewed at a time,
                        you can specify which one is shown on the table by clicking the Egg Move View button above the list.
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        For On-Hand pokemon in HOME collections, you will also have to specify <Highlighted>which game that on-hand's egg moves are available in</Highlighted>. For on-hands, you can only specify one game and not multiple like you can do in the collection list.
                    </Typography>
                <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                    <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>Quick Editing</Typography>
                </PrettyBoxWrapper>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        You can click on shown table data in edit mode to quickly edit some peripherals, or get to certain screens faster. If the pokemon/ball combo wasn't already selected, using any of these quick edits will <Highlighted>select</Highlighted> the combo 
                        and immediately go to the edit screen.
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        <span style={{fontWeight: 700}}>Is Owned</span> - You can click the checkbox to mark it as owned/un-owned. 
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        <span style={{fontWeight: 700}}>Hidden Ability</span> - You can click on the indicator to change whether it's available. Low opacity means the combo doesn't have it, while a High opacity means it does.
                        This indicator will not show for <Highlighted>pokemon who do not have hidden abilities</Highlighted>, or for pokemon who <Highlighted>cannot have their hidden ability</Highlighted> in the given ball combination
                        (which typically only happens for Gen 6/7 collections).
                    </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        <span style={{fontWeight: 700}}>Egg Move Count</span> - You can click on the indicator to change how many egg moves the combo has. 
                        Low opacity means they don't have any, while a High opacity means they do. 
                        This indicator will not show for <Highlighted>pokemon who do not have egg moves</Highlighted> in the given generation.
                    </Typography>
                    <Typography sx={{fontSize: '14px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        Note: You can click on the cell of a ball/combo (without hitting the checkbox or indicators) to select the ball/combo and go to the edit screen quickly.
                    </Typography>
                <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                    <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>Sharing Progress across Collections</Typography>
                </PrettyBoxWrapper>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        The primary way to share progress among collections is through <Highlighted>collection linking</Highlighted>, however, 
                        there will be a different way to do so: <Highlighted>sub-sheets</Highlighted> (<Highlighted>this feature is not yet implemented!!</Highlighted>). While collection linking essentially 
                        combines two collections' progress (so they can still have separate scopes, sorting options, and trade preferences), sub-sheets is intended to be 
                        essentially <Highlighted>a partition of a collection</Highlighted>, so they cannot have the separate options. More information will be given once it is fully implemented!
                    </Typography>
            </Box>
        </Box>
    )
}