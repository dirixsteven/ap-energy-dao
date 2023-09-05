import { Fragment, useEffect } from "react"
import { setGlobalState } from "../store";

export const Participant = () => {
    useEffect(() => {
        setGlobalState('activeView', 'Participant');
    },[]);

    return (
        <Fragment>
            
        </Fragment>
    )
}