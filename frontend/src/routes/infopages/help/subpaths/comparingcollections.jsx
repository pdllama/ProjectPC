import {Box, Typography, useTheme} from '@mui/material'
import HelpPath from '../helppath'
import PrettyBoxWrapper from '../../../../components/partials/wrappers/prettyboxwrapper'
import hexToRgba from 'hex-to-rgba'
import Dropdown from '../components/dropdown'
import {titleWrapperMq, prettyWrapperMq, primaryIndentation, secondaryIndentation, tertiaryIndentation, paraFontSizeMq} from './../components/mqsandstyles'

//to talk about:
//  1. the purpose of comparing collections
//  2. which collections can trade with each other and the fact that if you dont have one, the option wont appear
//  3. how it works: 
//      1. which pokemon it prioritizes
//      2. the filters
//      3. the advanced filters and why they're there (ex including certain pokemon is normally disabled since they cant be bred, but can include anyway)
//      4. !! baby/adult equalization

export default function ComparingCollectionsHelp({}) {
    const theme = useTheme()
    const Highlighted = ({children, blue=false}) => {
        return (
            <span style={{color: blue ? theme.palette.color1.dark : theme.palette.color3.light}}>{children}</span>
        )
    }

    return (
        <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', width: '100%', height: '100%', maxWidth: '1000px', gap: 1}}>
            <HelpPath path={[{display: 'Help', link: '/help'}, {display: 'Comparing Collections'}]}/>
            <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', ...titleWrapperMq, py: 2, px: 3, backgroundColor: hexToRgba(theme.palette.color1.main, 0.9), borderRadius: '10px', border: `2px solid ${theme.palette.color1.dark}`, color: theme.palette.color1.contrastText, width: '100%', height: '100%', gap: 2}}>
                <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                    Collection comparing gives you a <Highlighted>fast and easy way</Highlighted> to see which pokemon <Highlighted>you can provide</Highlighted> to a collector and 
                    which pokemon <Highlighted>they can provide you</Highlighted>. There are multiple options which let you customize how you want to compare collections.
                </Typography>
                <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                    <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>Basic Information</Typography>
                </PrettyBoxWrapper>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        You can compare collections with a user by going to their collection's page, and <Highlighted>clicking "Compare Collections"</Highlighted> above their list.
                        You will also be able to compare collections when <Highlighted>making a trade offer</Highlighted> or <Highlighted>counter-offering</Highlighted>. 
                        Not all collections can compare with each other:
                    </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                            - <Highlighted>Non-HOME Collections</Highlighted>: Can only trade with collections of the same generation. However, if the generation is HOME-compatible 
                            (ex a Sword/Shield or Scarlet/Violet collection), then they <Highlighted>can be compared with a HOME collection</Highlighted>.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                            - <Highlighted>HOME Collections</Highlighted>: Can trade with other HOME collections or with any HOME-compatible game. 
                        </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        If you cannot see the option to compare collections, then it means you don't have any compatible collection to compare with. 
                    </Typography>
                <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                    <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>Comparison Options</Typography>
                </PrettyBoxWrapper>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        You can decide various options for comparison. The basic ones are to select only the pokemon that have  
                        their <Highlighted>hidden abilities</Highlighted>  and <Highlighted>max egg moves</Highlighted> in that combo, as well as select 
                        only <Highlighted>on-hand</Highlighted> pokemon. You can decide to set it just for your list, and/or for the other person's list.
                    </Typography>
                        <Typography sx={{fontSize: '14px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                            Note: If you decide to select only HA pokemon in a list, it will not exclude <Highlighted>pokemon who do not have hidden abilities</Highlighted>.
                            It will just exclude pokemon who can possibly have HA in that ball combo, but they are marked as not having it. <Highlighted>It works
                            the same way for egg moves</Highlighted>.
                        </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        The main advanced option that is important to understand is <Highlighted>equalizing baby/adult pokemon</Highlighted>. This option simply sets
                        an <Highlighted>equivalency for the adult and baby versions</Highlighted> of a pokemon if one list has one, and the other list has the other.
                        So, if one list is looking for Moon Ball Cleffa, and the other list owns Moon Ball Clefairy, it will <Highlighted>pass the comparison</Highlighted> and 
                        a note will be made that it is an equivalency. In the individual view, this will show as an <Highlighted>"EQ"</Highlighted> on the top right, 
                        while in the by pokemon view, <Highlighted>it will say "For: Cleffa"</Highlighted>.
                    </Typography>
                        <Typography sx={{fontSize: '14px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq, my: -1}}>
                            Note: This equivalency only applies if the baby/adult is <Highlighted>absent</Highlighted> from the list's scope. Following the previous example,
                            if the first list has Clefairy in its scope (so they are collecting both Cleffa AND Clefairy), the Moon Ball Clefairy that the second list can offer
                            will be <Highlighted>compared against their Clefairy</Highlighted>, and <Highlighted>not against their Cleffa</Highlighted>.
                        </Typography>
                        <Typography sx={{fontSize: '14px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                            This option was primarily included to stabilize if people had differing preferences on whether to have the baby or the adult in their collection.
                        </Typography>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        As for the other advanced options, they are just options to include certain non-breedable pokemon groups in the comparison. 
                        These are unchecked by default, since they normally can't be offered without losing it from your collection.
                    </Typography>
                <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                    <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>The Comparison Process</Typography>
                </PrettyBoxWrapper>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        Here are some miscellaneous information about how the comparison process works:
                    </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                            1. <Highlighted>On-Hand pokemon are always checked before the collection</Highlighted>. If a pokemon/ball combo
                            is already being provided by an on-hand, it is <Highlighted>not offered</Highlighted> by the collection.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                            2. Pokemon marked as 'pending' are <Highlighted>excluded</Highlighted> from comparison.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                            3. If the total quantity of an on-hand Pokemon and its <Highlighted>reserved quantity</Highlighted> (which is the amount that has been promised to another trade)
                            are equal, then that on-hand is <Highlighted>excluded</Highlighted> from comparison.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                            4. If an aprimon offered by one list is an aprimon marked as 'highly wanted' in the other, it is <Highlighted>displayed as 'wanted'</Highlighted> when
                            you see the comparison results.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                            5. The egg move data is sent and <Highlighted>displayed differently</Highlighted> for comparisons with HOME collections, depending on the generation of the other collection. 
                            In <Highlighted>HOME to HOME comparisons</Highlighted>, it checks the highest EM count among the generations (if the max EM option is selected) and displays the <Highlighted>full egg move data</Highlighted> of each combination. 
                            In <Highlighted>HOME to HOME game comparisons</Highlighted>, for the HOME collection, it checks the EM count of the generation of the HOME game (if the max EM option is selected)
                            and displays <Highlighted>only the EM data of that generation</Highlighted>.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                            6. Equivalencies are established for <Highlighted>interchangeable alternate form pokemon</Highlighted> (pokemon who can switch between their alternate forms). 
                            For example, if one collection is collecting Burmy (Any), and the other collection can offer Fast Ball Burmy (Plant) and 
                            Lure Ball Burmy (Sandy), <Highlighted>both of them pass comparison</Highlighted> (if they don't have those balls already)
                            and the equivalency is flagged. Of course, only <Highlighted>one of each ball</Highlighted> would pass comparison.
                        </Typography>
                            <Typography sx={{fontSize: '14px', textAlign: 'start', ...tertiaryIndentation, ...paraFontSizeMq}}>
                                This relationship is <Highlighted>one-way</Highlighted>. A collection offering combos for Burmy (Any) would not pass comparisons for a collection looking 
                                for specific Burmy forms.
                            </Typography>
                        
            </Box>
        </Box>
    )
}