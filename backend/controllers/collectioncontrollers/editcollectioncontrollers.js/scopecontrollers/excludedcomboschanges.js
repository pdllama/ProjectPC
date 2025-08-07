import Collection from '../../../../models/collections.js'

export default async function excludedCombosChanges(req, res) {
    const {id} = req.params
    const {addedPokemon=[], removedPokemon=[], ballChangedPokemon=[]} = req.body
    //note: addedPokemon are pokemon who previously didnt have excluded combos, who NOW do.
    //      removedPokemon are pokemon who had excluded combos, which are now all being enabled again
    //      ballChangedPokemon are pokemon who had excluded combos, but the combos are just being changed without being entirely removed.

    const col = await Collection.findById(id)
    const isLinkedCollection = col.linkedTo !== undefined

    const newOwnedPokemon = col.ownedPokemon.map(p => {
        const addedMon = addedPokemon.filter(mon => mon.name === p.name)[0]
        if (addedMon) {
            const excludedBalls = addedMon.excludedBalls
            excludedBalls.forEach(ball => {
                if (isLinkedCollection) {
                    p.disabledBalls.push(ball)
                } else {
                    const hasBallCombo = p.balls[ball] !== undefined
                    if (hasBallCombo) {
                        p.balls[ball].disabled = true
                    }
                }
            })
        }
        const removedMon = removedPokemon.filter(mon => mon.name === p.name)[0]
        if (removedMon) {
            if (isLinkedCollection) {p.disabledBalls = []}
            else {
                Object.keys(p.balls).forEach(ball => {
                    if (p.balls[ball].disabled !== undefined) {
                        delete p.balls[ball].disabled
                    }
                })
            }
            
        }
        const ballChangedMon = ballChangedPokemon.filter(mon => mon.name === p.name)[0]
        if (ballChangedMon) {
            const addedBalls = ballChangedMon.addedBalls
            const removedBalls = ballChangedMon.removedBalls
            if (isLinkedCollection) {
                const newDisabledBalls = p.disabledBalls.filter(b => !removedBalls.includes(b))
                p.disabledBalls = [...newDisabledBalls, ...addedBalls]
            } else {
                Object.keys(p.balls).forEach(ball => {
                    const reEnableBall = removedBalls.includes(ball)
                    const disableBall = addedBalls.includes(ball)
                    //addedBalls as in balls to be disabled
                    //removedBalls as in balls to be re-enabled
                    if (p.balls[ball].disabled !== undefined && reEnableBall) {
                        delete p.balls[ball].disabled
                    } else if (p.balls[ball].disabled === undefined && disableBall) {
                        p.balls[ball].disabled = true
                    }
                })
            }
        }
        return p
    })
    col.ownedPokemon = newOwnedPokemon
    col.markModified('ownedPokemon')
    await col.save()
    res.end()
}