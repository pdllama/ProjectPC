import { apriballLiterals, genGameAdjustments } from "../../../../common/infoconstants/miscconstants.mjs"

export default function initializeLinkedCollectionDisplay(list, fullList, gen) {
    //this function edits the state.collection (full list) just to add an "isActive" value depending on if the list is currently displaying that mon
    //this function is n^2 operations, solely because sorting both beforehand would leave a sorted version of the list to the state which would invalidate
    //custom sorting. could we find a way to make this more efficient?
    
    // return fullList.map((p) => {
    //     const isActive = list.some(p2 => p2.name === p.name)
    //     if (isActive) {
    //         return {...p, isActive: true}
    //     } else {
    //         return {...p, isActive: false}
    //     }
    // })
    return list.map((pInSubList) => {
        const p = fullList.filter(p2 => p2.name === pInSubList.name)[0]
        if (p) {
            return convertPToSubListFormat(p, pInSubList.disabledBalls, gen)
        } else {
            return undefined
        }
    }).filter(p => p !== undefined)
}

export function convertPToSubListFormat(p, disabledBalls, gen) {
    const newBallData = {}
    Object.keys(p.balls).forEach(b => {
        if (p.name === 'Spinda' && gen === 'bdsp' && (!apriballLiterals.includes(b))) {
            //as of july 2025, spinda STILL cannot be transferred between bdsp and HOME. so any non-apriballs is still ILLEGAL in BDSP, but legal in home from gen 7 transfer.
            null
        } else {
            newBallData[b] = JSON.parse(JSON.stringify(p.balls[b]))
            const emData = p.balls[b].eggMoveData === undefined ? undefined : JSON.parse(JSON.stringify(p.balls[b].eggMoveData))
            const noEMs = emData === undefined || emData[gen] === undefined
            if (!noEMs) {
                newBallData[b].EMs = emData[gen].EMs
                newBallData[b].emCount = emData[gen].emCount
            }
            const isDisabled = disabledBalls.includes(b)
            if (isDisabled) {newBallData[b].disabled = true}
            else {delete newBallData[b].disabled}
            delete newBallData[b].eggMoveData
        }
    })
    return {...p, disabled: undefined, balls: newBallData}
}