const jwt = require("jsonwebtoken");
const { Caisse } = require("../models");

const tokenCheck = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    // Vérifiez si l'en-tête commence par "Bearer "
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: "error", message: "Format de token invalide." });
    }

    // Extrait le token en supprimant le préfixe "Bearer "
    const token = authHeader.substring(7);

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }

    // Extrait l'ID de la caisse du token
    const caisseId = decodedToken.id;

    // Vérifie si la caisse existe dans la base de données en utilisant son ID
    const caisse = await Caisse.findByPk(caisseId);
    if (!caisse) {
      return res.status(404).json({ status: 'error', message: "Caisse non trouvé." });
    }
    next();
  } catch (error) {
    console.error(`ERROR TOKEN CHECK: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la vérification du jeton.",
    });
  }
};

module.exports = tokenCheck;
