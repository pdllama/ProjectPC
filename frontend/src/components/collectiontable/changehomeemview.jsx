import { useDispatch, useSelector } from "react-redux";
import { Button, useTheme, Box } from "@mui/material";
import hexToRgba from "hex-to-rgba";
import { getGameColor, homeDisplayGames } from "../../../common/infoconstants/miscconstants.mjs";
import { toggleHomeEMView } from "../../app/slices/collectionstate";
import GameIndicatorBox from "./tabledata/gameindicatorbox";

//note: '9' must be a number for homeEMView, else the nextHomeEmView thing does NOT work.

export default function ChangeHomeEMView({sx, sw, isDisabled}) {
    const theme = useTheme()
    const dispatch = useDispatch()
    const homeEMView = useSelector((state) => state.collectionState.listDisplay.homeEMView)
    const nextHomeEMView = homeEMView === 'hidden' ? 'highest' : homeEMView === 'highest' ? homeDisplayGames[homeDisplayGames.length-1] : homeDisplayGames.indexOf(homeEMView) === 0 ? 'hidden' : homeDisplayGames[homeDisplayGames.indexOf(homeEMView)-1]

    const mediaQuery = {
        '@media only screen and (max-width: 332px)': {
            fontSize: '8.5px'
        },
        '@media only screen and (min-width: 333px) and (max-width: 421px)': {
            fontSize: '10px'
        },
        '@media only screen and (min-width: 768px) and (max-width: 778px)': {
            fontSize: '11px'
        }
    }

    return (
        <Button 
            sx={{
                border: `1px solid ${theme.palette.color1.dark}`, 
                backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), 
                color: theme.palette.color1.main,
                padding: (!sw) ? 0 : 0.75, ml: 0.5, mr: sw ? 1 : 0,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                fontSize: '12px', 
                zIndex: (!sw) ? 1 : 15,
                ':hover': {cursor: 'pointer', backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), opacity: 0.65},
                ...mediaQuery,
                paddingX: 1,
                '@media only screen and (max-width: 403px)': {
                    width: sw ? '90%' : 'auto'
                },
                ...sx
            }}
            onClick={() => {
                dispatch(toggleHomeEMView(nextHomeEMView))
            }}
            disabled={isDisabled}
        >
            Egg Move View: 
            {(homeEMView === 'highest' || homeEMView === 'hidden') ? 
            <Box 
                sx={{backgroundColor: 'rgb(30, 30, 30)', color: 'white', borderRadius: '2px', mb: 0.25, px: 0.25, display: 'flex', gap: 1, fontWeight: 400, fontSize: '11px', opacity: (homeEMView === 'hidden')  ? 0.75 : 1}}
            >
                {homeEMView === 'highest' ? `${homeEMView} Count` : homeEMView}
            </Box> : 
            <GameIndicatorBox game={homeEMView} sx={{opacity: isDisabled ? 0.75 : 1}}/>
            }
        </Button>
    )
}