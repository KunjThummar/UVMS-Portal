const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (!allowedRoles.includes(req.user.role)) {            //checks that is user query include the allowed roles or not    
            return res.status(403).json({
                success: false,
                message: "Access denied."
            });
        }

        next();
    };
};

module.exports = authorize;