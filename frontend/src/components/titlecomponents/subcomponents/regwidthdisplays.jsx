import { Box } from "@mui/material";
import CollectionProgress from "../collectionprogress";
import RateDisplay from "../ratedisplay";
import ItemDisplay from "../itemdisplay";

export default function RegWidthDisplays({displayScreen, ballScopeInit, collectingBalls, isEditMode, demo, currSelectedList, isOwner, userData, tradePreferences, ownerData, basicColData}) {


    return (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '55%', height: 'auto'}}>
            {displayScreen === 'ballProgress' && <CollectionProgress ballScopeInit={ballScopeInit} ballScope={collectingBalls} isEditMode={isEditMode} demo={demo} collectionList={currSelectedList} isOwner={isOwner} userData={userData}/>}
            {displayScreen === 'rates' && <RateDisplay rates={tradePreferences.rates} owner={demo ? '' : ownerData.username} collectionGen={basicColData.gen} demo={demo}/>}
            {(displayScreen === 'items' && basicColData.gen !== 'home') && <ItemDisplay collectionGen={basicColData.gen} itemTradeStatus={tradePreferences.items} lfItems={tradePreferences.lfItems} ftItems={tradePreferences.ftItems}/>}
        </Box>
    )
}