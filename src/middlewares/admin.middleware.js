export const isAdmin = (req, res, next) => {
    // Verificar si el usuario actual tiene el rol de administrador
    if (req.user && req.user.role === 'admin') {
        // El usuario es administrador, permitir el acceso a la ruta
        next();
    } else {
        // El usuario no es administrador, redireccionar a una página de acceso denegado o mostrar un mensaje de error
        res.status(403).send('Acceso denegado');
    }
};