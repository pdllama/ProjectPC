import HelpMain, { HelpPageWrapper } from "../routes/infopages/help/helpmain";
import CollectionFunctionsHelp from "../routes/infopages/help/subpaths/collectionfunctions";
import ImportingCollectionsHelp from "../routes/infopages/help/subpaths/importingcollections";
import ComparingCollectionsHelp from "../routes/infopages/help/subpaths/comparingcollections";
import TradingCollectionsHelp from "../routes/infopages/help/subpaths/tradingcollections";

export default [
    {
        path: '/help',
        element: <HelpPageWrapper/>,
        children: [
            {
                path: '',
                element: <HelpMain/>
            },
            {
                path: 'collections',
                element: <CollectionFunctionsHelp/>
            },
            {
                path: 'importing',
                element: <ImportingCollectionsHelp/>
            },
            {
                path: 'comparing',
                element: <ComparingCollectionsHelp/>
            },
            {
                path: 'trading',
                element: <TradingCollectionsHelp/>
            }
        ]
    },
]
