import jwt from 'jsonwebtoken';

const isAuth = (req, res, next) => {
    const authHeader = req.get('Authorization')
    if(!authHeader){
        req.isAuth = false
        return next()
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'thisisasecretkey')
    }
    catch(err){
        req.isAuth = false
        return next()
    }

    if(!decodedToken){
        req.isAuth = false
        return next()
    }

    req.userId = decodedToken.userId;
    req.isAuth = true
    next()
}

export default isAuth;