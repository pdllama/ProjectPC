import {Box, Typography, useTheme, Checkbox} from '@mui/material'
import { useDispatch } from 'react-redux'
import HAIndicator from '../../tabledata/haindicator'
import EMIndicator from '../../tabledata/emindicator'
import { setSelected } from '../../../../app/slices/editmode'
import { renderBallListDragVer } from '../../../../../utils/functions/renderballselection'
import { getCenterOffset } from '../../../../../utils/functions/renderballselection'
import HomeEMIndicatorController from '../../tabledata/homeemindicatorcontroller'

export default function SmallWidthCheckbox({ballInfo, isEditMode, handleEditBallInfo, pokeName, ball, collectionId, ownerId, isRow2=false, pokeid, allowedBallsTotal, isHomeCollection}) {
    const theme = useTheme()
    const disabled = !isEditMode
    const dispatch = useDispatch()

    const onClickFunc = isEditMode ? {
        onClick: () => dispatch(setSelected({
            selected: pokeid, 
            selectedBall: ball, 
            dontShowEditScreen: true, 
            sw: true, 
            allowedBalls: allowedBallsTotal
        }))
    } : {}

    const handleHAChangeFunc = (e) => {
        handleEditBallInfo(e, 'isHA', pokeName, ball, collectionId, ownerId)
    }
    const handleEMCountChangeFunc = (e, emGen, currEmCount) => {
        handleEditBallInfo(e, 'emCount', pokeName, ball, emGen, currEmCount)
    }
    const renderTagIndicator = (tagType) => {
        return (
            <Typography
                sx={{
                    color: theme.palette.color3.light,
                    border: 'none',
                    position: 'absolute',
                    margin: 0,
                    padding: '2px',
                    fontWeight: 700,
                    opacity: tagType === 'highlyWanted' ? 1 : 0.5,
                    top: '5px',
                    fontSize: '13px'
                }}
            >
                {tagType === 'highlyWanted' ? 'WANT' : 'PEND'}
            </Typography>
        )
    }

    const hasEMs = ballInfo.emCount !== undefined || ballInfo.eggMoveData !== undefined
    return (
        <Box 
            sx={{
                width: '100%', 
                height: '100%', 
                border: '1px solid black', 
                borderTop: 'none', 
                borderBottom: isRow2 ? 'none' : '1px solid black', 
                ...theme.components.box.fullCenterCol, 
                justifyContent: 'start',
                ':hover': {cursor: isEditMode ? 'pointer' : 'auto'}
            }}
            {...onClickFunc}
        >
            <Checkbox
                checked={ballInfo.isOwned} 
                sx={{color: 'white', '&.Mui-disabled': {color: 'white', '&.Mui-checked': {color: '#1976d2'}}, mt: 1}} 
                disabled={disabled}
                size='large'
                onClick={isEditMode ? ((e) => handleEditBallInfo(e, 'isOwned', pokeName, ball, collectionId, ownerId, ballInfo.pending ? 'pending' : ballInfo.highlyWanted ? 'highlyWanted' : undefined)) : undefined}
            />
            <Box sx={{...theme.components.box.fullCenterCol, borderTop: '1px solid white', width: '90%', position: 'relative'}}>
                {ballInfo.isOwned && ballInfo.isHA !== undefined &&
                <HAIndicator 
                    sx={{width: '100%', fontSize: '18px', height: '24px', top: '4px'}}
                    textOnly={false}
                    isEditMode={isEditMode}
                    isHAActive={ballInfo.isHA}
                    handleChange={(e) => handleHAChangeFunc(e)}
                    noTopRow={true}
                    smallWidth={true}
                />}
                {(ballInfo.isOwned && hasEMs) &&
                (isHomeCollection ? 
                <HomeEMIndicatorController 
                    sx={{width: '100%', fontSize: '16px', height: '24px', top: '28px'}}
                    textOnly={false}
                    isEditMode={isEditMode}
                    emCount={ballInfo.emCount}
                    EMs={ballInfo.EMs}
                    eggMoveData={ballInfo.eggMoveData}
                    handleChange={handleEMCountChangeFunc}
                    smallWidth={true}
                    isHomeCollection={isHomeCollection}
                /> : 
                <EMIndicator 
                    sx={{width: '100%', fontSize: '16px', height: '24px', top: '28px'}}
                    textOnly={false}
                    isEditMode={isEditMode}
                    emCount={ballInfo.emCount}
                    EMs={ballInfo.EMs}
                    eggMoveData={ballInfo.eggMoveData}
                    handleChange={handleEMCountChangeFunc}
                    smallWidth={true}
                    isHomeCollection={isHomeCollection}
                />
            )
                }
                {ballInfo.pending && renderTagIndicator('pending')}
                {ballInfo.highlyWanted && renderTagIndicator('highlyWanted')} 

            </Box>
        </Box>
    )
}