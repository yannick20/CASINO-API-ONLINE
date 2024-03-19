const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User,  Cashback, UserCashback, Shop, Transaction } = require("../models");

const getHistory = async (req, res) => {
    try {
        const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ status: "error", message: "Token non fourni." });
    }

    // Vérifiez si l'en-tête commence par "Bearer "
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({ status: "error", message: "Format de token invalide." });
    }

    // Extrait le token en supprimant le préfixe "Bearer "
    const userToken = token.substring(7);
    let decodedToken;
    try {
      decodedToken = jwt.verify(userToken, "EyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcxMDc3Mz");
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ status: "error", message: "TokenExpiredError" });
      }
      return res.status(401).json({ status: "error", message: "Token invalide." });
    }

    const userId = decodedToken.id;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: UserCashback,
          as: "usercashback",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ status: "error", message: "Utilisateur non trouvé." });
    }

    const transactions = await Transaction.findAll({
      where: {
        userId: user.id,
        state: 2,
      },
      include: [
        {
          model: Shop,
          as: "shop",
        }
      ],
      order: [["createdAt", "DESC"]],
    })

    const historyTransactions = transactions.map((transaction) => ({
        createAt: transaction.createdAt,
        shop: transaction.shop.name,
        amount: transaction.ticketAmount,
        cashback: transaction.ticketCashback,
        voucherAmount: transaction.voucherAmount,
        type: transaction.ticketCashbackType,
        cagnote: transaction.cagnotte,
      }));
  

    // Renvoyer les données de l'historique de l'utilisateur
    res.status(200).json({ 
        status: "success", 
        history: historyTransactions
    });
        
    } catch (error) {
        console.error(`ERROR GET HISTORY: ${error}`);
        res.status(500).json({
            status: "error",
            message: "Une erreur s'est produite lors de la recherche de l'historique.",
        })
    }
}

module.exports = { getHistory }