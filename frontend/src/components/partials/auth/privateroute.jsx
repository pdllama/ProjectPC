import { useRouteLoaderData, useNavigate, useLocation, useLoaderData, useParams, useOutletContext } from "react-router-dom";
import BodyWrapper from "../routepartials/bodywrapper";
import { useEffect, useContext, useState, Fragment } from "react";
import { AlertsContext } from "../../../alerts/alerts-context";
import ErrorPage from "../../../error-page";

//private routes are routes that only one user can access, such as an edit route to their own collection.

export default function PrivateRoute({Component, PlaceholderComponent, routeType, loaderData, loaderDataProp={}}) {
    const userData = useRouteLoaderData("root")
    // const privateTradePage = routeType === 'userTrades' ? loaderData.settings.account.privatizeTrades
    const pathname = useLocation().pathname
    const editCollectionLoaderD = routeType === 'editCollection' && useLoaderData()

    //the loader for edit collection doesnt allow for its own built in error page redirect, since it uses redux's fetch. this is a workaround
    const errorRedirect = routeType === 'editCollection' && editCollectionLoaderD.status === 500 

    const Placeholder = PlaceholderComponent === undefined ? BodyWrapper : PlaceholderComponent
    const unauthorizedRedirect = routeType === 'editCollection' ? useLocation().pathname.slice(0, -5) : 
        routeType === 'tradeCounteroffer' ? useLocation().pathname.slice(0, -14) : 
        routeType === 'userSettings' ? useLocation().pathname.slice(0, -9) :
        routeType === 'userNotifications' ? useLocation().pathname.slice(0, -14) :
        routeType === 'userTrades' && useLocation().pathname.slice(0, -7)
    const comparisonRef = (routeType === 'editCollection' && !errorRedirect)? editCollectionLoaderD.owner._id : 
        routeType === 'tradeCounteroffer' ? loaderData.tradeData.users.filter(userData => userData.username === loaderData.latestOfferData.recipient)[0]._id :
        (routeType === 'userSettings' || routeType === 'userNotifications' || routeType === 'userTrades') && useParams().username
    const navigate = useNavigate()
    const notLoggedIn = userData.loggedIn === false

    const isAuthorized = !notLoggedIn && ((routeType === 'editCollection' || routeType === 'tradeCounteroffer') ? (userData.user._id === comparisonRef && (routeType === 'tradeCounteroffer' ? loaderData.tradeData.history.length < 5 : true)) : 
        (routeType === 'userSettings' || routeType === 'userNotifications' || routeType === 'userTrades') && userData.user.username === comparisonRef)

    // const otherProps = routeType === 'editCollection' ? {collection: editCollectionLoaderD} : {}
    const otherProps = {}

    //alerts
    const [alertIds, setAlertIds] = useState([])
    const {addAlert, dismissAlert} = useContext(AlertsContext)

    const clearAlerts = () => {
        alertIds.forEach((id) => {
            dismissAlert(id);
        });
        setAlertIds([]);
    }

    useEffect(() => {
        if (notLoggedIn && !errorRedirect) {
            navigate('/login', {state: {error: true, message: 'You must be logged in to go to that page!', redirectTo: pathname}})
        } else {
            if (!isAuthorized && !errorRedirect) {
                //spawning alert. this ends up spawning two alerts because its in react strictmode (dev thing)
                const tradeTooManyOffersMessage = (routeType === 'tradeCounteroffer' && !(userData.user._id === comparisonRef)) && 'Maximum number of offers reached for this trade (5). You cannot make a counter-offer!'
                const alertMessage = tradeTooManyOffersMessage ? tradeTooManyOffersMessage : `You aren't authorized to ${routeType === 'editCollection' ? 'edit this collection' : routeType === 'userSettings' ? "change this user's settings" : routeType === 'tradeCounteroffer' ? 'make a counter-offer' : routeType === 'userNotifications' ? "view this user's notifications!" : routeType === 'userTrades' && "view this user's trades!"}!`
                const alertInfo = {severity: 'error', message: alertMessage, timeout: 5}
                const id = addAlert(alertInfo);
                setAlertIds((prev) => [...prev, id]);
                navigate(unauthorizedRedirect)
            }
        }
        return () => {
            clearAlerts();
        };
    }, [])
    return (
        errorRedirect ? <ErrorPage errorData={editCollectionLoaderD}/> : !isAuthorized ? <Placeholder /> : <Component {...loaderDataProp} {...otherProps}/>
    )
}