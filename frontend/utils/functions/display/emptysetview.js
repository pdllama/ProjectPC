const hideEmptySets = (collectionList) => {
    return collectionList.filter(p => {
        const emptySet = isEmptySet(p)
        return !emptySet
    })
}

const isEmptySet = (p) => {
    return !Object.keys(p.balls).map(b => {
        return p.balls[b].isOwned
    }).includes(true)
}

export {isEmptySet, hideEmptySets}