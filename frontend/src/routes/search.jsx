import { useTheme, Box, Typography, ToggleButton, ToggleButtonGroup, Button, CircularProgress} from "@mui/material"; 
import DotWaitingText from "../components/functionalcomponents/dotwaitingtext";
import { useState, useRef, useEffect, useTransition, useContext } from "react";
import { ErrorContext } from "../app/contexts/errorcontext";
import SearchIcon from '@mui/icons-material/Search';
import BodyWithBanner from "../components/partials/routepartials/bodywithbanner";
import SearchAreaRoute from "../components/functionalcomponents/search/searcharearoute";
import ControlledTextInput from "../components/functionalcomponents/controlledtextinput";
import { searchDB } from "../../utils/functions/backendrequests/search";
import { useDebouncedCallback } from "use-debounce";
import { useLocation, useNavigate } from "react-router";
import parseLocationQuery from "../../utils/functions/routefunctions/parselocationquery";

export default function Search({type}) {
    const locationData = useLocation()
    const navigate = useNavigate()
    const queries = parseLocationQuery(locationData.search.slice(1, locationData.search.length), {query: '', page: 1})
    const {handleError} = useContext(ErrorContext)
    // const [searchData, setSearchData] = useState({type: 'all', query: '', queryFunction: '', page: 1, result: {collections: [], users: [], collectionCount: 0, userCount: 0}, searching: false})
    //query controls what is shown in the input while query function controls the query that operators take. since the function operators are debounced,
    //we want the child components to update when the debounce update, necessitating a new variable which only updates when the debounce occurs
    
    const [searchData, setSearchData] = useState({result: {collections: [], users: [], collectionCount: 0, userCount: 0}, shownQuery: queries.query, error: false, searching: true})

    const [isPending, startTransition] = useTransition()
    // const searchTypeRef = useRef(searchData.type)

    const changeSearchType = (newVal) => {
        if (newVal !== type) {
            navigate(`/search${newVal === 'all' ? '' : `/${newVal}`}${queries.query !== '' ? `?query=${queries.query}` : ''}`)
        }
        // if (newVal === null) { //when clicking a selected button the value becomes null, it doesnt send the regular value of the button.
        //     return
        // } 
        // debounceSearchFunction(queries.query, 1, true, newVal)
    }
    const theme = useTheme()
    const groupTheme = theme.components.toggleButton.dark.group
    const buttonTheme = theme.components.toggleButton.dark.buttons

    const changeQuery = (newVal) => {
        setSearchData({...searchData, shownQuery: newVal})
        searchDatabaseState(newVal)
        // navigate(`/search/${type}?queries=${newVal}`)
        
        // searchDatabaseState(newVal)
    }

    const searchDatabaseState = (query) => {
        debouncedSearch(query)
    }

    const searchFunction = async(query, pageNum=1) => {
        setSearchData({...searchData, searching: true})
        const backendFunc = async() => {return await searchDB(type, query, pageNum)}
        const successFunc = (searchResult) => {
            // if (changeSearchType) { 
            //     setSearchData({...searchData, queryFunction: query, result: searchResult, page: 1, type: newSearchType, error: false, searching: false})
            //     return
            // }
            setSearchData({...searchData, result: searchResult, error: false, searching: false})
        }
        const errorFunc = (errorData) => {
            setSearchData({...searchData, error: true, errorData, searching: false})
        }
        handleError(backendFunc, false, successFunc, errorFunc, false, true)
        // if (changeSearchType) {
        //     const newSearchResult = await searchDB(newSearchType, query, pageNum)
        //     setSearchData({...searchData, queryFunction: query, result: newSearchResult, page: 1, type: newSearchType})
        //     return
        // }
        // const searchResult = await searchDB(searchData.type, query, pageNum)
        // setSearchData({...searchData, queryFunction: query, result: searchResult, page: pageNum})
    }

    const debouncedSearch = useDebouncedCallback(
        (newVal) => {navigate(`/search${type === 'all' ? '' : `/${type}`}${newVal === '' ? '' : `?query=${newVal}`}`)},
        750
    )

    // useEffect(() => {
    //     // console.log(`REF: ${searchTypeRef.current} NOW: ${searchData.type}`)
    //     if (searchTypeRef.current !== searchData.type) {
    //         debounceSearchFunction(searchData.query, 1)
    //         searchTypeRef.current = searchData.type
    //     }
    // }, [searchData.type])

    useEffect(() => {
        searchFunction(queries.query, queries.page)
    }, [type, queries.query, queries.page])


    
    // useEffect(() => {
    //     searchFunction(queries.query, queries.page)
    // }, [])

    const changePage = (newPage) => {
        navigate(`/search/${type}?${queries.query !== '' ? `query=${queries.query}&` : ''}page=${newPage}`)
        // setSearchData({...searchData, page: newPage})
        // startTransition(() => {
        //     debounceSearchFunction(searchData.query, newPage)
        // })
    }
    // const seedDB = () => {
    //     fetch(`http://localhost:3000/collections/new/seeddb`, {
    //         method: 'POST',
    //         credentials: 'same-origin',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //     })
    // }

    return (
        <BodyWithBanner 
            bodySx={{height: '100%', mt: 2, mb: 0, ...theme.components.box.fullCenterCol, justifyContent: 'start', position: 'relative', '@media only screen and (max-width: 550px)': {mx: 2, justifyContent: 'center'}, '@media only screen and (max-width: 500px)': {mx: 0, justifyContent: 'center'}}} 
            bannerSx={{backgroundColor: theme.palette.color1.light, color: theme.palette.color1.contrastTextLight}} text='Search'
        >
            {/* <Button onClick={seedDB} sx={{position: 'absolute', right: '10px'}} size='large'>Seed Database</Button> */}
            <ToggleButtonGroup exclusive sx={{mt: 0.5, mb: 0.5, width: '50%', ...groupTheme, '@media only screen and (max-width: 768px)': {width: '80%'}, '@media only screen and (max-width: 500px)': {width: '100%'}}} size='small' value={type} onChange={(e, newVal) => {if (newVal !== null) {changeSearchType(newVal)}}}>
                <ToggleButton value='all' sx={{width: '35%', fontSize: '12px', padding: 0, ...buttonTheme}}>All</ToggleButton>
                <ToggleButton value='users' sx={{width: '35%', fontSize: '12px', ...buttonTheme}}>Users</ToggleButton>
                <ToggleButton value='collections' sx={{width: '35%', fontSize: '12px', ...buttonTheme}}>Collections</ToggleButton>
                
            </ToggleButtonGroup>
            <ControlledTextInput 
                textFieldProps={
                    {
                        autoFocus: true,
                        size: 'small',
                        InputProps: {
                            endAdornment: <SearchIcon />
                        }
                    }
                }
                textFieldStyles={
                    {width: '60%', '@media only screen and (max-width: 768px)': {width: '80%'}, '@media only screen and (max-width: 500px)': {width: '90%'}, mt: 2}
                }
                defaultValue={searchData.shownQuery}
                controlInputFunc={changeQuery}
                useRegex={true}
            />
            {searchData.error ? 
            searchData.searching ? 
            <Box sx={{width: '80%', minHeight: '600px', mt: 2}}>
                <Box sx={{...theme.components.box.fullCenterCol, width: '100%', height: '50px', mt: 10}}>
                    <Typography sx={{color: 'grey', mb: 2}}>
                    <i>
                        Searching<DotWaitingText/>
                    </i>
                    </Typography>
                    <CircularProgress/>
                </Box>
            </Box> : 
            <Box sx={{width: '80%', minHeight: '600px', mt: 2, ...theme.components.box.fullCenterCol, justifyContent: 'start'}}>
                <Typography sx={{fontSize: '24px', color: 'rgb(200, 50, 50)', fontWeight: 700, mb: 2, mt: 10}}>
                    Error {searchData.errorData.status}: {searchData.errorData.name}
                </Typography>
                <Typography sx={{fontSize: '16px', color: 'rgb(200, 50, 95)', fontWeight: 700}}>
                    {searchData.errorData.message}
                </Typography>
                <Typography sx={{fontSize: '16px', color: 'rgb(200, 50, 50)', fontWeight: 700}}>
                    Try again later!
                </Typography>
            </Box> :
            <SearchAreaRoute 
                query={queries.query} 
                result={searchData.result} 
                searchType={type} 
                page={parseInt(queries.page)} 
                changePage={changePage} 
                changeSearchType={changeSearchType} 
                changingPage={isPending}
                searching={searchData.searching}
            />}
        </BodyWithBanner>
    )
}