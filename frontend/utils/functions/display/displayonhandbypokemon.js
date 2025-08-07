import { apriballs } from "../../../common/infoconstants/miscconstants.mjs"

//please make this function as efficient as possible!
//changing displays to by pokemon/filtering is heavily slowed down with large (400+) onhand lists
export default function displayOnHandByPokemon(onhandList, collectionList) {
    const pData = {}
    const onlyUniquePokemon = onhandList.filter((p, idx) => {
        //this function performs two functions -> counts the balls of each pokemon and creates the ball data as well as filtering for only the unique pokemon
        if (pData[p.name] === undefined) {
            pData[p.name] = {name: p.name, natDexNum: p.natDexNum, imgLink: p.imgLink, haName: p.haName, balls: {}}
        }
        if (pData[p.name].balls[p.ball] === undefined) {
            pData[p.name].balls[p.ball] = {numTotal: 0, reserved: 0}
        }
        if (p.isHA !== undefined && !p.isHA) {
            if (pData[p.name].balls[p.ball].numNonHA === undefined) {pData[p.name].balls[p.ball].numNonHA = p.qty}
            else {pData[p.name].balls[p.ball].numNonHA += p.qty}
        }
        if (p.reserved) {
            pData[p.name].balls[p.ball].reserved += p.qty
        }

        pData[p.name].balls[p.ball].numTotal += p.qty

        return onhandList.findIndex(p2 => p2.name === p.name) === idx
    })
    const displayList = onlyUniquePokemon.map(p => {
        
        //below is the graveyard of the very inefficient method used to setup the by pokemon.


        // const collectionData = collectionList.filter(cP => cP.name === p.name)[0]
        // const possibleBalls = collectionData === undefined ? apriballs : Object.keys(collectionData.balls)

        // const noHAMon = p.isHA === undefined

        // const numOfBalls = possibleBalls.map(pB => {
        //     const numOfTotalPb = onhandList.filter(p2 => p2.name === p.name && p2.ball === pB).map(p2 => p2.qty).reduce((accumulator, currentValue) => accumulator+currentValue, 0)
        //     const numOfNonHaPb = onhandList.filter(p2 => p2.name === p.name && p2.ball === pB && (p2.isHA !== undefined && !(p2.isHA))).map(p2 => p2.qty).reduce((accumulator, currentValue) => accumulator+currentValue, 0)
        //     const numReserved = onhandList.filter(p2 => p2.name === p.name && p2.ball === pB).map(p2 => p2.reserved).filter(el => el !== undefined).reduce((accumulator, currentValue) => accumulator+currentValue, 0)
        //     const numGeneral = noHAMon ? {numTotal: numOfTotalPb, reserved: numReserved} : {numTotal: numOfTotalPb, numNonHA: numOfNonHaPb, reserved: numReserved}
        //     return {ball: pB, number: numGeneral}
        // })
        // const ballData = {}
        // numOfBalls.forEach(bD => {
        //     ballData[bD.ball] = bD.number
        // })
        return pData[p.name]
    })
    return displayList
}

export function updateListWithNewOnHands(newOnhands, onhandList, collectionList) {
    const newOnhandsInListAlready = newOnhands.filter(p => onhandList.filter(p2 => p2.imgLink === p.imgLink).length !== 0)
    const newOnhandsNotInList = newOnhands.filter(p => onhandList.filter(p2 => p2.imgLink === p.imgLink).length === 0)

    const newOnHands = displayOnHandByPokemon(newOnhandsNotInList, collectionList)
    const newOnHandList = onhandList.map(p => {
        const newOnhandsData = newOnhandsInListAlready.filter(p2 => p2.imgLink === p.imgLink)
        const changeQty = newOnhandsData.length !== 0
        if (changeQty) {
            newOnhandsData.forEach(ohD => {
                p.balls[ohD.ball].numTotal += ohD.qty
                if (ohD.isHA !== undefined && !ohD.isHA) {
                    p.balls[ohD.ball].numNonHA += ohD.qty
                }
            })
        }
        return p
    })
    return [...newOnHandList, ...newOnHands]
}