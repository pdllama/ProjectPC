import {Box, Typography, useTheme} from '@mui/material'
import SearchItemWrapper from '../../components/functionalcomponents/search/searchitemwrapper'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowForward from '@mui/icons-material/ArrowForward'
import MultipleStopIcon from '@mui/icons-material/MultipleStop';
import ImgData from '../../components/collectiontable/tabledata/imgdata'

function extractContent(s) {
    const span = document.createElement('span')
    span.innerHTML = s
    let children = span.querySelectorAll('*:not(OL)');
    for(let i = 0 ; i < children.length ; i++) { 
        if(children[i].textContent)
            children[i].textContent+= ' ';
        else
            children[i].innerText+= ' ';
       
    }
    const result  = [span.textContent || span.innerText].toString().replace(/ +/g,' ')
    return result;
}

export default function UserNotificationItem({notiType, notiTradeData, notiTitle, notiMessage, unread, onClickFunc, sw, spSw}) {
    const theme = useTheme()
    const isTradeNoti = notiType.includes('trade-offer')
    const typeDisplay = isTradeNoti ? '[TRADE]' : notiType === 'system' ?  '[SYSTEM]' : '[UPDATE]'

    const genDisplay1 = (isTradeNoti && notiTradeData.tradeGen.includes('-')) && notiTradeData.tradeGen.slice(0, notiTradeData.tradeGen.indexOf('-'))
    const genDisplay2 = (isTradeNoti && notiTradeData.tradeGen.includes('-')) && notiTradeData.tradeGen.slice(notiTradeData.tradeGen.indexOf('-')+1)
    const genDisplay = isTradeNoti && (
        notiTradeData.tradeGen.includes('-') ? (
            `${isNaN(parseInt(genDisplay1)) ? genDisplay1.toUpperCase() : `Gen ${genDisplay1}`} - ${isNaN(parseInt(genDisplay2)) ? genDisplay2.toUpperCase() : `Gen ${genDisplay2}`}`
        ) : isNaN(parseInt(notiTradeData.tradeGen)) ? notiTradeData.tradeGen.toUpperCase() : `Gen ${notiTradeData.tradeGen}`
    )

    const otherParticipantDisplay = notiTradeData !== undefined && (notiTradeData.otherParticipant === 'deleted' ? '<Deleted User>' : notiTradeData.otherParticipant)

    const customColor = isTradeNoti ? (
        notiType.includes('new') ? '#FC8B00' : 
        notiType.includes('counter') ? '#007BFF' : 
        notiType.includes('accept') ? '#28A745' : 
        notiType.includes('reject') ? '#DC3545' :
        notiType.includes('cancel') && '#B30C1C'
    ) : theme.palette.color1.darker
    return (
        <SearchItemWrapper customColor={customColor} customStyles={{
            position: 'relative', mt: 1, height: sw ? '70px' : '50px', 
            '@media only screen and (max-width: 575px)': {
                flexDirection: (isTradeNoti) ? 'column' : 'row', 
                alignItems: (isTradeNoti) ? 'start' : 'center'
            }
        }} 
            onClickFunc={onClickFunc}
        >
            {unread && <Box sx={{width: '10px', height: '100%', backgroundColor: customColor, borderTopLeftRadius: '5px', borderBottomLeftRadius: '5px', position: 'absolute', left: '0px'}}></Box>}
            {isTradeNoti ? 
            <Box sx={{...theme.components.box.fullCenterRow, width: '50%', maxWidth: '170px', ml: 2}}>
                <ImgData type='icons' linkKey='user' size='40px'/>
                <MultipleStopIcon sx={{fontSize: '50px'}}/>
                <ImgData type='icons' linkKey='user' size='40px'/>
            </Box> :
            <></>
            }
            <Box sx={{...theme.components.box.fullCenterCol, alignItems: 'start', ml: (!isTradeNoti) ? sw ? 2 : 2.5 : 0, mt: (sw && !isTradeNoti) ? 1.5 : 0, '@media only screen and (max-width: 575px)': {ml: (!isTradeNoti) ? sw ? 2 : 2.5 : 2}}}>
                <Typography sx={{fontSize: (spSw && !isTradeNoti) ? '16px' : '13.5px', fontWeight: unread ? 700 : 400, textAlign: 'start'}}>
                    {isTradeNoti ? 
                        notiType.includes('new') ? `You have a new trade offer from ${otherParticipantDisplay}!` : 
                        notiType.includes('counter') ? `${otherParticipantDisplay} countered your trade offer!` :
                        notiType.includes('accept') ? `${otherParticipantDisplay} accepted your trade offer!` : 
                        notiType.includes('reject') ? `${otherParticipantDisplay} rejected your trade offer!` : 
                        notiType.includes('cancel') && `${otherParticipantDisplay} cancelled the trade!` : 
                        notiTitle
                    }
                </Typography>
                <Typography sx={{fontSize: '12px', '@media only screen and (max-width: 575px)': {
                    position: isTradeNoti && 'absolute', right: isTradeNoti && '5px', top: isTradeNoti && '15px', fontSize: isTradeNoti ? '10px' : '12px'
                }}}>
                    {isTradeNoti ?
                        notiType.includes('new') ? `${genDisplay} Trade` : 
                        notiType.includes('counter') ? `Ongoing ${genDisplay} Trade` :
                        notiType.includes('accept') ? `Ongoing ${genDisplay} Trade` :
                        notiType.includes('reject') ? `${genDisplay} Trade` : 
                        notiType.includes('cancel') && `Cancelled ${genDisplay} Trade` : 
                        !spSw && `${extractContent(notiMessage).slice(0, 80)}...`
                    }
                </Typography>
            </Box>

            <Box sx={{position: 'absolute', right: '5px', top: '0px'}}>
                <Typography sx={{fontSize: '12px'}}>{typeDisplay}</Typography>
            </Box>
        </SearchItemWrapper>
    )
}