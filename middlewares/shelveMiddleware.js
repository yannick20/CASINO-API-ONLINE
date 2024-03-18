const shelveMiddleware = (req, res, next) => {
    const shopId = req.body;
    try {
        if (!shopId) {
            return res.status(401).json({ status: 'error' , message: 'ID de la boutique manquant.' });
        }
        next();
    } catch (error) {
        console.error(`ERROR MIDDLEWARE SHELVE: ${error}`);
        return res.status(401).json({ status: 'error' ,message: 'ID de la boutique non fournie ou invalide.' });
    }
}

module.exports = shelveMiddleware;