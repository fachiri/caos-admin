module.exports = {
    isLogin: (req, res, next) => {
        if(req.session.loggedin === true){
            next();
            return;
        } else {
            req.session.destroy((err) => {
                res.redirect('/login');
            })
        }
    },
    loggedIn: (req, res, next) => {
        if(req.session.loggedin === true){
            return res.redirect('/');
        }
        next()
    },
    isSuperAdmin: (req, res, next) => {
        if(req.session.role !== 'admin'){
            return res.redirect('/');
        }
        next()
    },
    isAdminPuskesmas: (req, res, next) => {
        if(req.session.role !== 'admin_puskesmas'){
            return res.redirect('/');
        }
        next()
    },
    isAdminPosyandu: (req, res, next) => {
        if(req.session.role !== 'admin_posyandu'){
            return res.redirect('/');
        }
        next()
    },
};