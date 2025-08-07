//was going to include a complicated function here just so i could do .updateOne instead of editing the col directly,
//but because i mistakenly used the pokemon.imgLink to store the changes (which is a virtual) theres no way for me to use updateOne to filter for each
//pokemon. so this will probably remain unchanged unless i switch it to the pokemon name

//meant for these functions to construct an array of $set and $unset operators, but they are just controllers now.
const collectionChangesConstructor = (collectionChanges) => {

}

export const onhandSingleValueUpdates = (onhandChanges, onhand) => { 
    //takes a single onhand changes object and a single onhand list to enact changes on them.
    //return a new array

    const onhandIds = Object.keys(onhandChanges)

    const newOnhandIds = onhandIds.filter(ohC => onhandChanges[ohC].new)
    const removedOnhandIds = onhandIds.filter(ohC => onhandChanges[ohC].remove)

    const newOnhand = onhand.filter(oh => !(removedOnhandIds.includes(oh._id))).map(oh => {
        const hasChanges = onhandChanges[oh._id] !== undefined && !newOnhandIds.includes(oh._id)
        if (hasChanges) {
            Object.keys(onhandChanges[oh._id]).forEach(updatedField => {
                const updatedFieldData = onhandChanges[oh._id][updatedField]
                if (typeof updatedFieldData === 'object') {
                    oh[updatedField] = updatedFieldData.curr
                } else {
                    oh[updatedField] = updatedFieldData
                }
            }) 
        }
        return oh
    })

    for (let newOhId of newOnhandIds) {
        const newOhData = onhandChanges[newOhId]
        Object.keys(newOhData).forEach(field => {
            if (typeof newOhData[field] === 'object') {
                newOhData[field] = newOhData[field].curr
            } 
        })
        
        newOnhand.push(newOhData)
    }
    return newOnhand
}