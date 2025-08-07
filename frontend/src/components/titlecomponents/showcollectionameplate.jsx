import {Box, Typography} from '@mui/material'
import Header from './subcomponents/header'
import { useSelector } from 'react-redux'

export default function ShowCollectionNamePlate({nameInit}) {
    const collectionNameState = useSelector((state) => state.collectionState.options.collectionName)

    return (
        <Box sx={{alignItems: 'center'}}>
            <Header 
                additionalStyles={{
                    backgroundColor: '#26BCC9', color: 'black', fontSize: '18px', wordBreak: 'break-all'
                }} 
                noWrap={false}
            >
                {collectionNameState ? collectionNameState : nameInit}
            </Header>
        </Box>
    )
}