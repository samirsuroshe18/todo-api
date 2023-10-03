const jwt = require('jsonwebtoken');

module.exports = async function(req, res, next){
    const token = req.header('Authorization');

    if(!token){
        return res.status(401).json({
            msg : "No token! authorization denied"
        });
    } 

    try {
        await jwt.verify(token, process.env.JWT_USER_SECREATE, (err, decoded) => {
            if (err) {
                res.status(401).json({
                    msg: "Token not valid"
                });
            } else {
                req.user = decoded.user;
                next();
            }
        });
    } catch (error) {
        console.log('something went wrong wwith middleware'+ error);
        res.json(500).json({
            msg:'server error'
        });
    }
}