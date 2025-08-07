export default (func) => {
    return (req, res, next) => {
        try {
            func(req, res, next)
        }
        catch (err) {
            console.log(err)
            const {statusCode = 500} = err;

            if (!err.message) err.message = "Our server has encountered an unexpected error."
            if (!err.name) err.name = 'Internal Server Error'
            return res.status(statusCode).send(err)
        }
    }
}