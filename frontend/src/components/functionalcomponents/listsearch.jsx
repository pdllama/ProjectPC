import { TextField } from "@mui/material";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function ListSearch({queryFunc, textFieldProps, textFieldStyles, customValue=undefined, followSearchState}) {
    const [searchData, setSearchData] = useState('')
    const searchState = useSelector((state) => state.collectionState.listDisplay.filterSearchTerm)

    const handleSearch = (e) => {
        const comparator = customValue ? customValue : searchData
        setSearchData(e.target.value)
        const extensionOfPreviousQuery = e.target.value.length > comparator.length && e.target.value.slice(0, comparator.length) === comparator
        const reFilterList = !extensionOfPreviousQuery
        queryFunc(e.target.value, reFilterList)
    }

    useEffect(() => {
        if (followSearchState) {
            if (searchState === '') {
                setSearchData('')
            }
        }
    }, [searchState])

    return (
        <TextField 
            {...textFieldProps}
            sx={{...textFieldStyles}}
            value={searchData}
            onChange={(e) => handleSearch(e)}
        />
    )
}