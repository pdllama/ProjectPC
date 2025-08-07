export default function queryParamsDecipher(url) {
    const queryParams = {}
    const queries = url.slice(url.indexOf('?')+1, url.length).split('&')
    queries.forEach(q => {
        const key = q.slice(0, q.indexOf('='))
        const value = q.slice(q.indexOf('=')+1, q.length)
        queryParams[key] = value
    })
    return queryParams
}
