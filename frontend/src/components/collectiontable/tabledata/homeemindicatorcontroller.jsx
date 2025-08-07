import { useSelector, useDispatch } from "react-redux";
import EMIndicator from "./emindicator";

export default function HomeEMIndicatorController({sx={}, textOnly, isEditMode, emCount, EMs, eggMoveData, handleChange, smallWidth, isHomeCollection}) {
    const homeEMView = useSelector((state) => state.collectionState.listDisplay.homeEMView)
    if (homeEMView === 'hidden') {
        return <></>
    } else {
        return (
            <EMIndicator 
                sx={sx}
                textOnly={textOnly}
                isEditMode={isEditMode}
                emCount={emCount}
                EMs={EMs}
                eggMoveData={eggMoveData}
                handleChange={handleChange}
                isHomeCollection={isHomeCollection}
                smallWidth={smallWidth}
                homeEMView={homeEMView}
            />
        )
    }
}