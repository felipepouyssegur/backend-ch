export const errorMiddleware = (error, req, res, next) => {
    req.send({
        status: error.name,
        message: error.message,
        cause: error.cause
    })
}