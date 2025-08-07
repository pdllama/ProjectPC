import { useDispatch, useSelector } from "react-redux";
import { Button, useTheme, CircularProgress } from "@mui/material";
import { setOnHandView } from "../../app/slices/collectionstate";
import { deselect } from "../../app/slices/editmode";
import hexToRgba from "hex-to-rgba";
import { useTransition } from "react";

export default function ChangeOnHandView({sw, listType, nameDisplaySettings={}}) {
    const theme = useTheme()
    const dispatch = useDispatch()
    const [isPending, startTransition] = useTransition()
    const onhandView = useSelector((state) => state.collectionState.listDisplay.onhandView)

    const mediaQuery = {
        '@media only screen and (min-width: 982px) and (max-width: 1062px)': {
            paddingY: 0.75
        },
        '@media only screen and (min-width: 1062px)': {
            padding: 0.75
        }
    }

    return (
        <Button 
            sx={{
                border: `1px solid ${theme.palette.color1.dark}`, 
                backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), 
                color: theme.palette.color1.main,
                padding: (listType === 'onHand' && !sw) ? 0 : 0.75, ml: 2, mr: sw ? 2 : 0,
                fontSize: '11px',
                zIndex: 15,
                ':hover': {cursor: 'pointer', backgroundColor: hexToRgba(theme.palette.color3.main, 0.75), opacity: 0.65},
                ...mediaQuery
            }}
            onClick={() => {
                dispatch(deselect())
                dispatch(setOnHandView({nameDisplaySettings}))
            }}
        >
            {/* {isPending ? <CircularProgress/> : `View by ${onhandView === 'byIndividual' ? 'Pokemon' : 'Individual'}`} */}
            View by {onhandView === 'byIndividual' ? 'Pokemon' : 'Individual'}
        </Button>
    )
}