export function transformToSubSheet(list) {
    return list.map(p => {
        if (p.disabled) {return undefined}
        const disabledBalls = Object.keys(p.balls).filter(b => p.balls[b].disabled)
        return {name: p.name, natDexNum: p.natDexNum, disabledBalls}
    }).filter(p => p !== undefined)
}

export function transformToFullSheet(list, fullList, colGen) {
    //colGen refers to gen of list (parameter 1)
    return list.map(p => {
        const fullData = fullList.find(p2 => p2.name === p.name)
        const newBallData = {}
        Object.keys(fullData.balls).forEach(b => {
            const eggMovesObj = fullData.balls[b].eggMoveData === undefined || (fullData.balls[b].eggMoveData !== undefined && fullData.balls[b].eggMoveData[colGen] === undefined) ? 
                {} : 
                {
                    emCount: fullData.balls[b].eggMoveData[colGen].emCount, 
                    EMs: fullData.balls[b].eggMoveData[colGen].EMs
                }
            newBallData[b] = {
                ...fullData.balls[b], 
                disabled: p.disabledBalls.includes(b) ? true : undefined, 
                ...eggMovesObj, 
                eggMoveData: undefined
            }
        })
        return {...fullData, disabled: undefined, balls: newBallData}
    })
}