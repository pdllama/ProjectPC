import { ToggleButton, useTheme, Box } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { changeList, toggleSaveChangesConfirmModal } from "../../app/slices/editmode";

export const switchLinkedCollections = (navigate, dispatch, startTransition, id, idx, list, link, unsavedOnhandChanges, changeListDispatch, toggleSaveChangesConfirmDispatch) => {
    if (unsavedOnhandChanges) {
        dispatch(toggleSaveChangesConfirmDispatch(`linkedOnhandNotice-${idx}`))
    } else {
        dispatch(changeListDispatch({list, idx}))  
        startTransition(() => {
            if (idx === 0) {
                // setSearchParams('')
                navigate(link, {replace: true, state: {linkedSwitching: true}})
            } else {
                // setSearchParams({col: id})
                navigate(`${link}?col=${id}`, {replace: true, state: {linkedSwitching: true}})
            }
        })
    }
}

export function LinkedCollectionSelectionBuffer({}) {
    const ohByPSWShowEditScreen = useSelector((state) => state.editmode.ohByPSWShowEditScreen)
    const selected = useSelector((state) => state.editmode.selected)

    const height = ohByPSWShowEditScreen ? '47px' : selected ? '4.547px' : '80px'
    return <Box sx={{width: '100%', height}}></Box>
}

export default function LinkedCollectionSelection({smallScreen, startTransition, list, queryPCol, isPending, link}) {
    const theme = useTheme()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const linkedSelectedIdx = useSelector((state) => state.collectionState.linkedSelectedIdx)
    const linkedCollections = useSelector((state) => state.collectionState.linkedCollections)
    const unsavedOnhandChanges = useSelector((state) => state.editmode.unsavedOnhandChanges)
    const hasLinkedCollections = linkedCollections !== undefined

    const trueLinkedCollections = linkedCollections === undefined ? undefined : linkedCollections.map((c, idx) => {return {...c, idx}}).filter(lC => lC.gen !== 'dummy')

    if (trueLinkedCollections !== undefined && trueLinkedCollections.length === 3) {
        //sends the HOME collection to the back which means its in the center
        trueLinkedCollections.reverse()
    }

    const tGButtonWidth = (trueLinkedCollections !== undefined && linkedCollections.length === 3) ? {
        '@media only screen and (max-width: 899px)': {width: `50%`}
    } : {
        '@media only screen and (max-width: 1099px)': {width: '50%'}
    }

    return (
        hasLinkedCollections ? 
        <Box sx={{}}>
        {trueLinkedCollections.map(c => {
            const addStyle = c.gen === 'home' && trueLinkedCollections.length === 3 ? {width: '100%', '@media only screen and (min-width: 900px)': {width: `${100/3}%`}} : tGButtonWidth
            return (
                <ToggleButton 
                    key={`${c._id}-selection`}
                    sx={{...theme.components.toggleButton.dark.buttons, height: smallScreen ? '40px' : 'auto', backgroundColor: theme.palette.color2.main, color: 'white', border: '1px solid rgba(40,63,87,1)', borderRadius: 0, padding: '2px', width: `${100/trueLinkedCollections.length}%`, '&.Mui-disabled': {opacity: 1}, fontSize: smallScreen ? '12px' : '14px', ...addStyle}}
                    selected={linkedSelectedIdx === c.idx}
                    onClick={isPending ? null : () => switchLinkedCollections(navigate, dispatch, startTransition, linkedCollections[c.idx]._id, c.idx, list, link, unsavedOnhandChanges, changeList, toggleSaveChangesConfirmModal)}
                    disabled={linkedSelectedIdx === c.idx}
                    value={c.idx}
                >
                    {isNaN(parseInt(c.gen)) ? c.gen.toUpperCase() : `Gen ${c.gen}`} {c.type.toUpperCase()} Collection
                </ToggleButton>
            )
        })}</Box> : 
        <></>
    )
}