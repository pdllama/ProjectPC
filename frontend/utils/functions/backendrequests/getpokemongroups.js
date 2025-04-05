const backendurl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const getPokemonGroups = async(gen) => {
    const pokemonGroups = await fetch(`${backendurl}/collections/pokemongroups?gen=${gen}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(async(data) => {
        return {
            ok: data.ok,
            load: await data.json()
        }
    }).catch(e => {return {
        ok: false,
        load: {
            name: 'Internal Server Error',
            message: "Our server has encountered an unexpected error!",
            status: 500
        }
    }})
    return pokemonGroups
}

export {getPokemonGroups}