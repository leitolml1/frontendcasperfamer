


import {createBrowserRouter} from "react-router-dom"
import { Dashboard } from "./pages/Dashboard"

export const appRouter=createBrowserRouter([

    //RUTAS PUBLICAS
    {
        path:"/",
        element:<Dashboard/>
    }
]

)
