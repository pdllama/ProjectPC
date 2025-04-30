import AdminMain from "../routes/admin/adminmain"
import SendMessagesPage from "../routes/admin/sendmessagespage"
import ChangeTableData from "../routes/admin/changetabledata"
import MakeAnnouncements from "../routes/admin/makeannouncements"
import PreRouteLogic from "../components/partials/auth/preroutelogic"
import getAdminMain from "../../utils/functions/backendrequests/api/getadminmain"

export default [
    {
        path: '/admin',
        element: <PreRouteLogic logicType='admin-route' Component={AdminMain} />
    },
    {
        path: '/admin/send-notifications',
        element: <PreRouteLogic logicType='admin-route' Component={SendMessagesPage} />
    },
    {
        path: '/admin/table-data',
        element: <PreRouteLogic logicType='admin-route' Component={ChangeTableData} />
    },
    {
        path: '/admin/make-announcements', 
        element: <PreRouteLogic logicType='admin-route' Component={MakeAnnouncements}/>,
        id: 'makeAnnouncement',
        loader: getAdminMain
    }
]