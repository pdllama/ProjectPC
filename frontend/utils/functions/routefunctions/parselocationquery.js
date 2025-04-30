export default function parseLocationQuery(queryString, defaultReturn={}) {
    if (queryString === '') {
        return defaultReturn
    }
    const separatedQueries = queryString.split("&")
    const queriesObj = {}
    separatedQueries.forEach(q => {
        const separateKeysObjs = q.split("=")
        queriesObj[separateKeysObjs[0]] = separateKeysObjs[1]
    }) 
    Object.keys(defaultReturn).forEach(k => {
        if (queriesObj[k] === undefined) {
            queriesObj[k] = defaultReturn[k]
        }
    })
    return queriesObj
}