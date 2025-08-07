const hideFullSets = (collectionList) => {
    return collectionList.filter(p => {
        const fullSet = isFullSet(p)
        return !fullSet
    })
}

const isFullSet = (p) => {
    return !Object.keys(p.balls).map(b => {
        return p.balls[b].isOwned
    }).includes(false)
}

export {isFullSet, hideFullSets}