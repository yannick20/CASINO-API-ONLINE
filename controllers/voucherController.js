const jwt = require("jsonwebtoken");
const fs = require("fs");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { Op,fn, literal, Sequelize  } = require('sequelize');
const { sequelize, User,  Cashback, UserCashback, Setting, Transaction, Caisse, Shop } = require("../models");

const getUserVoucher = async (req, res) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res
          .status(401)
          .json({ status: "error", message: "Token non fourni." });
      }
  
      // Vérifiez si l'en-tête commence par "Bearer "
      if (!token.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ status: "error", message: "Format de token invalide." });
      }
      // Extrait le token en supprimant le préfixe "Bearer "
      const userToken = token.substring(7);
      let decodedToken;
      try {
        decodedToken = jwt.verify(userToken, "EyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcxMDc3Mz");
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
      const userId = decodedToken.id;
  
      const user = await User.findByPk(userId);
  
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "L'utilisateur n'existe pas.",
        });
      }
  
      // Recherche de tous les bons d'achat actifs de l'utilisateur avec state=2 et 3
      const userVouchers = await Transaction.findAll({
        where: {
          userId: userId,
          state: {
            [Op.in]: [2, 3],
          }
        },
      });
  
      if (!userVouchers || userVouchers.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Aucun bon d'achat actif trouvé pour cet utilisateur.",
        });
      }
  
      const vouchersResponse = userVouchers.map((voucher) => ({
        createAt: voucher.createdAt,
        amount: voucher.voucherAmount,
        updatedAt: voucher.updatedAt,
        ticketNumber: voucher.ticketNumber || '',
        state: voucher.state,
      }));
  
      res.status(200).json({
        status: "success",
        voucher: vouchersResponse,
      });
    } catch (error) {
      console.error(`ERROR GET USER VOUCHER: ${error}`);
      res.status(500).json({
        status: "error",
        message:
          "Une erreur s'est produite lors de la récupération du bon d'achat de l'utilisateur.",
      });
    }
};
  
const generateVoucher = async (req, res) => {
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

    const userCashback = user.usercashback;

    if (!userCashback) {
      return res.status(404).json({ status: "error", message: "Montant du cashback non trouvé pour cet utilisateur." });
    }

    const setting = await Setting.findOne();

    if (!setting) {
      return res.status(404).json({ status: "error", message: "Configuration non trouvée." });
    }

    const cashback = await Cashback.findOne({
      where: {
        userId: userId,
      },
    });

    const cashbackAmountThreshold = userCashback.amount;

    if (cashback.amount < cashbackAmountThreshold) {
      return res.status(400).json({
        status: "error",
        message: `Le montant du cashback est insuffisant. Minimum requis : ${cashbackAmountThreshold}.`,
      });
    }

    // Récupérer le nombre de jours à ajouter à la date actuelle
    const voucherDurate = setting.voucherDurate || 0;

    // Calculer la date d'expiration en ajoutant le nombre de jours à la date actuelle
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + voucherDurate);

    // Formater la date d'expiration au format YYYY-MM-DD
    const formattedExpirationDate = expirationDate.toISOString().split("T")[0];

    // Vérifier si un bon d'achat existe déjà pour cet utilisateur
    const existingVoucher = await Transaction.findOne({
      where: {
        userId: userId,
        state: 1,
      },
    });
     
    if (existingVoucher) {
      // Si un bon d'achat existe déjà, mettez à jour les informations et le champ state
      const amountVoucher = existingVoucher.voucherAmount + cashbackAmountThreshold;
      const voucherAmountThreshold = cashback.amount - cashbackAmountThreshold;
      await existingVoucher.update({
        voucherAmount: amountVoucher,
        expirateDate: formattedExpirationDate,
        cagnotte: cashback.amount - cashbackAmountThreshold == 0 ? existingVoucher.cagnotte : existingVoucher.cagnotte + voucherAmountThreshold,
      });
    } else {
      // Si aucun bon d'achat n'existe, créez-en un
      await Transaction.create({
        userId: userId,
        transactionType: 'voucher',
        amount: cashback.amount,
        ticketCashbackType: '-',
        code: uuidv4(),
        expirationDate: formattedExpirationDate,
        voucherAmount: cashbackAmountThreshold,
        cagnotte: cashback.amount - cashbackAmountThreshold,
        state: 1,
      });
    }
    // Réduire le montant du cashback de l'utilisateur après la génération ou la mise à jour du bon d'achat
    await cashback.update({
      amount: cashback.amount - cashbackAmountThreshold,
    });

    // Envoyer une réponse réussie avec un statut 200
    return res.status(200).json({
      status: "success",
      message: "Bon d'achat généré ou mis à jour avec succès.",
    });
  } catch (error) {
    console.error(`Erreur lors de la génération ou de la mise à jour du bon d'achat : ${error.message}`);
    // Envoyer une réponse d'erreur avec le statut approprié (par exemple, 500 pour une erreur interne du serveur)
    return res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la génération ou de la mise à jour du bon d'achat.",
    });
  }
};

const getValidateVoucher = async(req, res) => {
  try {
    const usersVouchers = await Transaction.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "phone"],
        }
      ],
      where: {
        state: 1
      }
    });

    if (!usersVouchers) {
      return res.status(404).json({
        status: "error",
        message: "Aucun bon d'achat des utilisateurs n'a été trouvé.",
      });
    }

    const usersResponses = usersVouchers.map((voucher) => ({
      firstName: voucher.user.firstName,
      lastName: voucher.user.lastName,
      phone: voucher.user.phone,
      code: voucher.code,
      amount: voucher.voucherAmount,
      expirateDate: voucher.expirationDate,
    }));

    return res.status(200).json({
      status: "success",
      voucher: usersResponses
    });
    
  } catch (error) {
    console.error(`ERROR GET ALL USER VOUCHER: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la récupération de tous les bon d'achat des utilisateurs.",
    });
  }
}

const getExpiredVoucher = async(req, res) => {
  try {
    const usersVouchers = await Transaction.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName", "phone"],
        }
      ],
      where: {
        state: 3
      }
    });

    if (!usersVouchers) {
      return res.status(404).json({
        status: "error",
        message: "Aucun bon d'achat des utilisateurs n'a été trouvé.",
      });
    }

    const usersResponses = usersVouchers.map((voucher) => ({
      firstName: voucher.user.firstName,
      lastName: voucher.user.lastName,
      phone: voucher.user.phone,
      code: voucher.code,
      amount: voucher.voucherAmount,
      expirateDate: voucher.expirationDate,
    }));

    return res.status(200).json({
      status: "success",
      voucher: usersResponses
    });
    
  } catch (error) {
    console.error(`ERROR GET EXPIRATED USER VOUCHER: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la récupération de tous les bon d'achat expirée.",
    });
  }
}

const getConsumedVoucher = async (req, res) => {
  try {
    const { timeInterval, shopId } = req.body;

    if (!timeInterval || !['day', 'week', 'month', 'year'].includes(timeInterval)) {
      return res.status(400).json({
        status: 'error',
        message: 'Paramètre de l\'intervalle de temps manquant ou invalide.',
      });
    }

    let startDate, endDate;

    switch (timeInterval) {
      case 'day':
        startDate = moment().startOf('day');
        endDate = moment().endOf('day');
        break;
      case 'week':
        startDate = moment().startOf('isoWeek');
        endDate = moment().endOf('isoWeek');
        break;
      case 'month':
        startDate = moment().startOf('month');
        endDate = moment().endOf('month');
        break;
      case 'year':
        startDate = moment().startOf('year');
        endDate = moment().endOf('year');
        break;
      default:
        break;
    }

    const transactions = await Transaction.findAll({
      where: {
        transactionType: 'voucher',
        shopId: shopId,
        state: 2,
        createdAt: {
          [Sequelize.Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'phone'],
        },
        {
          model: Caisse,
          as: 'caisse',
          attributes: ['firstName', 'lastName', 'phone'],
        },
        {
          model: Shop,
          as: 'shop',
          attributes: ['name'],
        },
      ],
      attributes: [
        'updatedAt',
        'ticketNumber',
        'voucherAmount',
      ],
      order: [['updatedAt', 'DESC']],
    });

    // Formatage de la date pour chaque transaction
    const formattedTransactions = transactions.map(transaction => {
      return {
        ...transaction.toJSON(),
        updatedAt: moment(transaction.updatedAt).format('YYYY-MM-DD HH:mm:ss')
      };
    });

    return res.status(200).json({
      status: 'success',
      transactions: formattedTransactions,
    });
  } catch (error) {
    console.error(`ERROR GET CONSUMED VOUCHERS: ${error}`);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur s\'est produite lors de la récupération des bons d\'achat consommés.',
    });
  }
};

const getShopConsumedVoucher = async (req, res) => {
  try {
    const { timeInterval, shopId } = req.body;

    if (!timeInterval || !['day', 'week', 'month', 'year'].includes(timeInterval)) {
      return res.status(400).json({
        status: 'error',
        message: 'Paramètre de l\'intervalle de temps manquant ou invalide.',
      });
    }

    let startDate, endDate;

    switch (timeInterval) {
      case 'day':
        startDate = moment().startOf('day');
        endDate = moment().endOf('day');
        break;
      case 'week':
        startDate = moment().startOf('isoWeek');
        endDate = moment().endOf('isoWeek');
        break;
      case 'month':
        startDate = moment().startOf('month');
        endDate = moment().endOf('month');
        break;
      case 'year':
        startDate = moment().startOf('year');
        endDate = moment().endOf('year');
        break;
      default:
        break;
    }

    let consumedVouchers;

    if (shopId === 3) {
      // Si shopId est égal à 3, récupérez les données pour tous les magasins
      consumedVouchers = await Transaction.findAll({
        attributes: [
          [sequelize.literal('COUNT(`shop`.`id`)'), 'totalTransactions'],
          [sequelize.literal('SUM(`voucherAmount`)'), 'totalAmount'],
          [sequelize.literal('`shop`.`name`'), 'shopName'],
        ],
        include: [
          {
            model: Shop,
            attributes: [],
            as: 'shop',
          },
        ],
        where: {
          transactionType: 'voucher',
          state: 2,
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: [sequelize.literal('`Shop`.`id`')],
      });
    } else {
      // Sinon, récupérez les données uniquement pour le magasin spécifié par shopId
      consumedVouchers = await Transaction.findAll({
        attributes: [
          [sequelize.literal('COUNT(`shop`.`id`)'), 'totalTransactions'],
          [sequelize.literal('SUM(`voucherAmount`)'), 'totalAmount'],
          [sequelize.literal('`shop`.`name`'), 'shopName'],
        ],
        include: [
          {
            model: Shop,
            attributes: [],
            as: 'shop',
            where: { id: shopId },
          },
        ],
        where: {
          transactionType: 'voucher',
          state: 2,
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        group: [sequelize.literal('`shop`.`id`')],
      });
    }
    
    if (consumedVouchers && consumedVouchers.length > 0) {
      const totalTransactions = consumedVouchers[0].get('totalTransactions');
      const totalAmount = consumedVouchers[0].get('totalAmount');
      const shopName = consumedVouchers[0].get('shopName') || 'N/A';
    
      const infosResponse = {
        totalTransactions,
        totalAmount,
        shopName,
      };
    
      return res.status(200).json({
        status: 'success',
        infos: infosResponse,
      });
    } else {
      // Aucun résultat trouvé
      return res.status(200).json({
        status: 'success',
        infos: {
          totalTransactions: 0,
          totalAmount: 0,
          shopName: 'N/A',
        },
      });
    }

  } catch (error) {
    console.error(`ERROR GET CONSUMED VOUCHERS: ${error}`);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur s\'est produite lors de la récupération des bons d\'achat consommés.',
    });
  }
};


module.exports = { getUserVoucher,  generateVoucher, getValidateVoucher, getExpiredVoucher, getConsumedVoucher, getShopConsumedVoucher };