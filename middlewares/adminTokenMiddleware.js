const jwt = require("jsonwebtoken");
const { Admin } = require("../models");

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
      decodedToken = jwt.verify(token, "EyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcxMDc3Mz");
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

    // Extrait l'ID de l'administrateur du token
    const adminId = decodedToken.id;

    // Vérifie si l'administrateur existe dans la base de données en utilisant son ID
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ status: 'error', message: "Administrateur non trouvé." });
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
