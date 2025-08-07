import {Box, Typography, ToggleButton, ToggleButtonGroup, Button} from '@mui/material'
import {useState} from 'react'
import { homeDisplayGames } from '../../../../../../common/infoconstants/miscconstants.mjs'
import GameIndicatorBox from '../../../../collectiontable/tabledata/gameindicatorbox'

export default function MiscSelection({globalDefaultData, handleChange, collectionGen}) {
    const homeCollection = collectionGen === 'home'
    const [homeEmCount, setHomeEmCount] = useState(homeDisplayGames[homeDisplayGames.length-1])

    const switchHomeCountGen = () => {
        setHomeEmCount(homeDisplayGames[homeDisplayGames.length-1] === homeEmCount ? homeDisplayGames[0] : homeDisplayGames[homeDisplayGames.indexOf(homeEmCount)+1])
    }
    return (
        <Box sx={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative'}}>
            <Typography variant='h6' sx={{fontSize: '16px', fontWeight: 700, mt: 1}}>Set Global Defaults</Typography>
            <Typography sx={{fontSize: '12px'}}>
                Global Defaults affect the state of peripheral data (Hidden Ability, Egg Moves) of a ball combo when you first mark a combo as owned. 
                You can set pokemon-specific defaults later!
            </Typography>
            <Box sx={{display: 'flex', flexDirection: 'row', height: '30%', width: '80%', justifyContent: 'center', alignItems: 'center'}}>
                <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '50%', height: '100%'}}>
                    <Typography sx={{fontSize: '14px', mb: 1, fontWeight: 700}}>Hidden Ability</Typography>
                    <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                        <ToggleButtonGroup exclusive value={globalDefaultData.isHA} onChange={(e, newVal) => handleChange('isHA', newVal)}>
                        <ToggleButton sx={{fontSize: '12px'}} value={true}>
                            HA
                        </ToggleButton>
                        <ToggleButton sx={{fontSize: '12px'}} value={false}>
                            Non-HA
                        </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>
                <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '50%', height: '100%', position: 'relative'}}>
                    <Typography sx={{fontSize: '14px', mb: 1, fontWeight: 700}}>Egg Move Count</Typography>
                    <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                        {Array.from(Array(5).keys()).map((emCount, idx) => {
                            return (
                                <ToggleButton 
                                    sx={{fontSize: '12px', mx: 0.5}} 
                                    value={emCount} 
                                    selected={collectionGen === 'home' ? globalDefaultData.eggMoveData[homeEmCount] === emCount : globalDefaultData.emCount === emCount} 
                                    onChange={(e, newVal) => handleChange(collectionGen === 'home' ? 'eggMoveData' : 'emCount', newVal, homeEmCount)} 
                                    key={`global-default-emCount-${emCount}`}
                                >
                                    {emCount}
                                </ToggleButton>
                            )
                        })}
                    </Box>
                    {homeCollection && 
                        <Box sx={{position: 'absolute', top: '85%', display: 'flex', gap: 2, alignItems: 'center'}}>
                            <Button onClick={switchHomeCountGen}>Switch Gen</Button>
                            <GameIndicatorBox game={homeEmCount} sx={{height: '24px'}} textSx={{fontSize: '18px'}}/>
                        </Box>
                    }
                </Box>
            </Box>
            {homeCollection && 
            <Typography sx={{fontSize: '12px', width: '100%', mt: 2}}>
                In Home Collections, egg moves of a collection pokemon can be set for each HOME-compatible game, and the EM count default can be set accordingly. 
            </Typography>}
            <Typography sx={{fontSize: '10px', width: '100%', mt: 2}}>
                Defaults will account for cases where a pokemon may not have HA/EMs, as well as cases where the max possible EMs may be less than 4.
            </Typography>
        </Box>
    )
}