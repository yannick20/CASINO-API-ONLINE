const jwt = require("jsonwebtoken");
const { User } = require("../models");

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

    // Extrait l'ID de l'utulisateur du token
    const userId = decodedToken.id;

    // Vérifie si la carte de fidelité existe dans la base de données en utilisant son ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Utilisateur non trouvé." });
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
