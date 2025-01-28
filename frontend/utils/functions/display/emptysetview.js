const hideEmptySets = (collectionList) => {
    return collectionList.filter(p => {
        const isEmptySet = !Object.keys(p.balls).map(b => {
            return p.balls[b].isOwned
        }).includes(true)
        return !isEmptySet
    })
}

export {hideEmptySets}