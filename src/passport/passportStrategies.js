import passport from 'passport'
import bcrypt from 'bcrypt';
import localStrategy from 'passport-local';
import { userModel } from '../dao/models/users.models.js';

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id)
        done(null, user)
    } catch (error) {
        done(error)
    }
})


passport.use(new localStrategy((username, password, done) => {
    userModel.findOne({ username: username }, function (err, user) {
        if (err) return done(err)
        if (!user) return done(null, false, { message: 'Nombre de usuario incorrecto.' })

        bcrypt.compare(password, user.password, function (err, res) {
            if (err) return done(err)

            if (res === false) {
                return done(null, false, { message: 'Contraseña incorrecta.' })
            }

            return done(null, user)
        })
    })
}))

export function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login')
}

/* si el usuario intenta volver a login no puede, ya que inicio sesion */
export function isLoggedOut(req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect('/products')
}