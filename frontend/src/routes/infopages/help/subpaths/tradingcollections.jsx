import {Box, Typography, useTheme} from '@mui/material'
import HelpPath from '../helppath'
import PrettyBoxWrapper from '../../../../components/partials/wrappers/prettyboxwrapper'
import hexToRgba from 'hex-to-rgba'
import Dropdown from '../components/dropdown'
import {titleWrapperMq, prettyWrapperMq, primaryIndentation, secondaryIndentation, tertiaryIndentation, paraFontSizeMq} from './../components/mqsandstyles'
import { valueDefaults } from '../../../../../common/infoconstants/miscconstants.mjs'
//to talk about:
//  1. the trade response cycle (offer stage, acceptance stage, finalization)
//  2. using comparison data to trade vs using list to add to offer, and consequences of both.
//      1. the fact that the collection list only shows pokemon with at least one owned ball
//  3. relative value and rates
//      1. what relative value is, how it works and why its there
//      2. which rates are used (initial offerer can only use recipient's, while initial recipient can change the rates)
//      3. maybe include the default values for the value calculations?
//  4. what happens to the collection/onhand lists at each stage of the trade cycle
//  5. marking it as complete and finalizing the trade
//  6. the limitations of the trade functionality and why its there
//      1. lack of ability to communicate
//      2. idk what else

export default function TradingCollectionsHelp({}) {
    const theme = useTheme()
    const Highlighted = ({children, blue=false}) => {
        return (
            <span style={{color: blue ? theme.palette.color1.dark : theme.palette.color3.light}}>{children}</span>
        )
    }

    return (
        <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', width: '100%', height: '100%', maxWidth: '1000px', gap: 1}}>
            <HelpPath path={[{display: 'Help', link: '/help'}, {display: 'Trading'}]}/>
            <Box sx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', ...titleWrapperMq, py: 2, px: 3, backgroundColor: hexToRgba(theme.palette.color1.main, 0.9), borderRadius: '10px', border: `2px solid ${theme.palette.color1.dark}`, color: theme.palette.color1.contrastText, width: '100%', height: '100%', gap: 3}}>
                <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                    The Trading function allows you to keep track of your trades and <Highlighted>automatically updates your collection</Highlighted> once they are marked complete.
                </Typography>
                <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                    <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>The Trade Cycle</Typography>
                </PrettyBoxWrapper>
                    <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                        Trading can be divided into roughly <Highlighted>3 phases</Highlighted>. Click the dropdowns below to see information on each phase:
                    </Typography>
                    <Dropdown
                        title={'1. Offer Phase'}
                        autoHeight={true}
                        sx={{width: '100%', backgroundColor: hexToRgba(theme.palette.color1.light, 0.3), border: `1px solid ${theme.palette.color1.dark}`, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}
                        innerWrapperSx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', gap: 2}}
                    >
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ml: 2, mt: 1, ...paraFontSizeMq}}>
                            This is the phase where traders make offers to each other. One party makes the <Highlighted>initial offer</Highlighted>, and
                            the other party can respond with a <Highlighted>counter offer</Highlighted>. This can go on for a bit until a final response is reached.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                            - <Highlighted>Initial Offer</Highlighted>: The first offer made in a trade. This is how a trade is initiated. 
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                            - <Highlighted>Counter Offer</Highlighted>: Any subsequent offer made in a trade. The initial offerer and the initial recipient can go back and forth on offers.
                            However, after the 5th total offer, <Highlighted>a response must be given</Highlighted>. Therefore, there is a <Highlighted>maximum number of 5 offers</Highlighted>.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ml: 2, mt: 1, ...paraFontSizeMq}}>
                            Traders can also choose to provide an <Highlighted>offer message</Highlighted> when making an offer. This is to help
                            clarify certain decisions made on an offer and/or provide any more information on it. This is entirely optional and 
                            can be excluded when making an offer.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ml: 2, mt: 1, ...paraFontSizeMq}}>
                            Any offers made where on-hand pokemon were offered will immediately mark the on-hands as <Highlighted>reserved</Highlighted>.
                            This piece of data is a number which indicates how many of the total quantity of that on-hand is reserved. 
                            This indicates that the on-hand is being promised to another trade and lets users know that it's not tradeable if the reserved quantity = total quantity.
                        </Typography>
                            <Typography sx={{fontSize: '14px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                                - <Highlighted>Only the offerer's on-hand pokemon are flagged as reserved</Highlighted>. However, once the recipient accepts the trade, their on-hand pokemon gets marked as reserved.
                            </Typography>
                            <Typography sx={{fontSize: '14px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                                - The reserved on-hand pokemon by the previous user <Highlighted>lose the reserved mark</Highlighted> (or it just gets decremented by one) 
                                if the other user rejects the trade or if they counter offer. If they do the latter, the new user's offered on-hands get marked. 
                            </Typography>
                            <Typography sx={{fontSize: '14px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                                - Reserving on-hands happens automatically and <Highlighted>cannot be manually changed</Highlighted>.
                            </Typography>
                    </Dropdown>
                    <Dropdown
                        title={'2. Response Phase'}
                        autoHeight={true}
                        sx={{mt: -3, width: '100%', backgroundColor: hexToRgba(theme.palette.color2.light, 0.3), border: `1px solid ${theme.palette.color2.dark}`, borderRadius: 0}}
                        innerWrapperSx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', gap: 2}}
                    >
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ml: 2, mt: 1, ...paraFontSizeMq}}>
                            This is the phase after a response is made on an offer (that isn't a counter offer). Traders can either <Highlighted>accept</Highlighted> or <Highlighted>reject</Highlighted> a 
                            trade offer. If a user rejects a trade offer, then the <Highlighted>trade closes</Highlighted> and no more offers can be made on it. 
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ml: 2, mt: 1, ...paraFontSizeMq}}>
                            However, once a trade offer is <Highlighted>accepted</Highlighted>, the trade goes on. At this stage, it's up to 
                            the users to communicate and perform the trade. Furthermore, a couple of changes are made:
                        </Typography>
                            <Typography sx={{fontSize: '14px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                                1. The offer acceptor's on-hand pokemon get <Highlighted>marked as reserved</Highlighted> if they were in the offer.
                            </Typography>
                            <Typography sx={{fontSize: '14px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                                2. All aprimon that the collections are receiving get <Highlighted>marked as pending</Highlighted>.
                            </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ml: 2, mt: 1, ...paraFontSizeMq}}>
                            Once a trade is accepted, it can also be <Highlighted>cancelled</Highlighted> by either party. Cancelling the trade
                            will <Highlighted>reset any changes to both collections</Highlighted> (meaning the changes above), as well as close the trade. 
                        </Typography>
                    </Dropdown>
                    <Dropdown
                        title={'3. Finalization Phase'}
                        autoHeight={true}
                        sx={{mt: -3, width: '100%', backgroundColor: hexToRgba(theme.palette.color1.light, 0.3), border: `1px solid ${theme.palette.color1.dark}`, borderTopLeftRadius: 0, borderTopRightRadius: 0}}
                        innerWrapperSx={{...theme.components.box.fullCenterCol, justifyContent: 'start', alignItems: 'start', gap: 2}}
                    >
                       <Typography sx={{fontSize: '16px', textAlign: 'start', ml: 2, mt: 1, ...paraFontSizeMq}}>
                            After a trade offer is accepted and both users complete the trade in game, this is the phase where they complete the trade in the application.
                            At this stage, both users have to <Highlighted>mark the trade as complete</Highlighted> to finalize it. This will complete and close the trade, and 
                            do the following:
                        </Typography> 
                            <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                                1. All involved pokemon in the offer will be <Highlighted>marked as owned</Highlighted> in both collections. Any peripheral data 
                                (which means Hidden Ability and Egg Move Data) will additionally be copied over.
                            </Typography>
                                <Typography sx={{fontSize: '14px', textAlign: 'start', my: -0.5, mt: -1, ...tertiaryIndentation, ...paraFontSizeMq}}>
                                    Note: If one of the traders' collections is a HOME collection, the Egg Move data of aprimon gets <Highlighted>sent differently</Highlighted> depending
                                    on the generation of the other collection. If it's a <Highlighted>HOME-HOME</Highlighted> trade, the <Highlighted>full egg move data</Highlighted> (which
                                    means the egg move data of all HOME game generations) gets sent. If it's a <Highlighted>HOME-HOME game</Highlighted> trade, only 
                                    the <Highlighted>egg move data of the HOME game generation</Highlighted> gets sent from the HOME collection's side. 
                                </Typography>
                            <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                                2. Any reserved on-hand pokemon will either have their <Highlighted>quantity reduced by 1</Highlighted>, or <Highlighted>be removed</Highlighted> (if the
                                amount that was reserved was the total quantity of that on-hand).
                            </Typography>
                            <Typography sx={{fontSize: '16px', textAlign: 'start', ...secondaryIndentation, ...paraFontSizeMq}}>
                                3. If a user was offering items and had a definite quantity for how much they had for trade, the <Highlighted>quantity will be reduced</Highlighted> or
                                the item will be <Highlighted>removed for trade</Highlighted> (if the amount offered sets it to 0).
                            </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ml: 2, mt: 1, ...paraFontSizeMq}}>
                            It is highly recommended to make sure the trade ends up marked as complete, otherwise 
                            you will have to manually update your collection. Ensure to let the other party know to mark it
                            as complete once you finish the trade in game!
                        </Typography>
                    </Dropdown>
                    <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                        <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>Making an Offer</Typography>
                    </PrettyBoxWrapper>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                            When making an offer, you can either decide to use data gathered from the <Highlighted>compare function</Highlighted> or
                            you can use the regular <Highlighted>collection/on-hand lists</Highlighted>. When using the compare function, you can be confident
                            that any aprimon listed are <Highlighted>unowned by the other side</Highlighted>. On the other hand, while only 
                            pokemon <Highlighted>that have an owned ball</Highlighted> will be listed in the collection list, there's <Highlighted>no guarantee
                            that that aprimon is unowned by the other side</Highlighted>. That's why it's <Highlighted>highly recommended to use the compare function</Highlighted>.
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                            You can additionally <Highlighted>offer or request items</Highlighted> (<Highlighted>if neither sides are HOME collections</Highlighted>) in the offer section. 
                            However, the availability of offering/requesting depends on the <Highlighted>item trade status</Highlighted> of both users. 
                            For example, if the other user set their status as not looking for items, you will not be able to offer them items.
                            Similarly, if your status is set as not offering items, you will not be able to offer items even if they are looking for them.
                        </Typography>
                    <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                        <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>Preferences and Trade Value</Typography>
                    </PrettyBoxWrapper>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                            In the offer section, you will also be able to see your and their <Highlighted>trade rates</Highlighted> at the top of the dropdown.
                            Just under it, you will see their <Highlighted>trade size preference</Highlighted> as well as their <Highlighted>on-hand trade preference</Highlighted> (whether
                            or not they're only trading from their on-hand list). This information <Highlighted>does not limit what you can offer</Highlighted>, however
                            it's best to follow what the other user is looking for a trade so they accept the offer (especially if you're the initial offer)!
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                            Further down, you'll find an <Highlighted>offer value</Highlighted> and a <Highlighted>receiving value</Highlighted>.
                            These two values give an <Highlighted>idea for the value</Highlighted> of both sides of the trade in units of HA Aprimon (aprimon who have their hidden ability).
                            These values are decided based on the <Highlighted>rates of the recipient</Highlighted> of the trade or, if their rates aren't defined, 
                            <Highlighted> default rates</Highlighted>.
                        </Typography>
                            <Typography sx={{fontSize: '14px', textAlign: 'start', my: -0.5, mt: -1, ...secondaryIndentation, ...paraFontSizeMq}}>
                                - <Highlighted>These are not objective values!!</Highlighted> They are only used to give you an idea of how much you're offering/receiving!
                            </Typography>
                            <Typography sx={{fontSize: '14px', textAlign: 'start', my: -0.5, mt: -1, ...secondaryIndentation, ...paraFontSizeMq}}>
                                - If the original recipient (the person who receives the initial offer) is the one making a (counter) offer, they can 
                                <Highlighted> decide whose rates are used in the value calculation</Highlighted>.
                            </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                            You can click the dropdown below to see the default value of every aprimon/item in units of HA Aprimon (non on-hand):
                        </Typography>
                        <Dropdown
                            title={'Default Values'}
                            autoHeight={true}
                            sx={{width: '100%', backgroundColor: hexToRgba(theme.palette.color1.light, 0.3), border: `1px solid ${theme.palette.color1.dark}`}}
                            innerWrapperSx={{...theme.components.box.fullCenterCol, width: '100%', gap: 2}}
                            titleOnlyOnClick
                            titleSx={{width: '100%', textAlign: 'start'}}
                        >
                            <Box sx={{borderRadius: '5px', border: '1px solid white', my: 1}}>
                                <Box sx={{...theme.components.box.fullCenterRow}}>
                                    <Typography sx={{
                                        borderBottom: '1px solid white', 
                                        fontWeight: 700, 
                                        borderRight: '1px solid white', 
                                        padding: 2, 
                                        textAlign: 'start',
                                        width: '300px',
                                        '@media only screen and (max-width: 515px)': {width: '200px'},
                                        '@media only screen and (max-width: 415px)': {width: '150px'},
                                        '@media only screen and (max-width: 365px)': {width: '130px', padding: 1}
                                    }}>
                                        Aprimon/Item
                                    </Typography>
                                    <Typography sx={{borderBottom: '1px solid white', fontWeight: 700, padding: 2, width: '50px', '@media only screen and (max-width: 365px)': {padding: 1}}}>Value</Typography>
                                </Box>
                                {Object.keys(valueDefaults).map(vD => {
                                    const customMqFontSize = vD === 'On Hand Non-HA Aprimon' ? '10px' : '12px'
                                    return (
                                        <Box sx={{...theme.components.box.fullCenterRow}} key={`${vD}-value`}>
                                            <Typography sx={{
                                                borderBottom: '1px solid white',
                                                borderRight: '1px solid white', 
                                                padding: 2, 
                                                textAlign: 'start', 
                                                minHeight: '24px',
                                                width: '300px', 
                                                '@media only screen and (max-width: 515px)': {width: '200px'}, 
                                                '@media only screen and (max-width: 415px)': {width: '150px', fontSize: '12px'},
                                                '@media only screen and (max-width: 365px)': {width: '130px', fontSize: customMqFontSize, padding: 1}
                                                }}
                                            >
                                                {vD}
                                            </Typography>
                                            <Typography sx={{borderBottom: '1px solid white', fontWeight: 700, padding: 2, width: '50px', '@media only screen and (max-width: 365px)': {padding: 1}}}>{valueDefaults[vD]}</Typography>
                                        </Box>
                                    )
                                })}
                            </Box>
                        </Dropdown>
                    <PrettyBoxWrapper sx={{alignItems: 'start', width: 'auto', ...prettyWrapperMq}}>
                        <Typography sx={{mx: 2, fontSize: '20px', fontWeight: 700}}>Limitations</Typography>
                    </PrettyBoxWrapper>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                            The primary limitation of this trade functionality is the <Highlighted>lack of ability to communicate</Highlighted> with users throughout the trade process.
                            The only way to communicate are through the offer messages, but those were meant for communicating offer reasoning and not for coordinating the trade.
                            This limitation is intended, since there are many other platforms better suited for coordination and communication. 
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                            The idea is that you <Highlighted>seek trades elsewhere</Highlighted> (on other websites, for example), and once you can come to a trade with a user, you
                            <Highlighted> setup the trade on this website</Highlighted> while <Highlighted>coordinating on the other platform</Highlighted>. That way, you can communicate
                            to perform the trade while still benefitting from the auto-completion and trade tracking that our site can offer. Of course, this is just one way to do it. You are 
                            free to try setting up a trade however you like!
                        </Typography>
                        <Typography sx={{fontSize: '16px', textAlign: 'start', ...primaryIndentation, ...paraFontSizeMq}}>
                            There are currently <Highlighted>no plans to introduce communication infrastructure</Highlighted> on the website at this time.
                        </Typography>
            </Box>
        </Box>
    )
}