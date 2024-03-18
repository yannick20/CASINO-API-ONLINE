const { getVideoDurationInSeconds } = require('get-video-duration');
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
const { Shop, Promotion } = require("../models");
const Op = require("sequelize").Op;

const createPromotions = async (req, res) => {
  try {
    const shopId = req.headers.shopid;
    const { startAt, endAt } = req.body;

    if (!shopId) {
      return res.status(400).json({
        status: "error",
        message: "ID de la boutique manquant.",
      });
    }

    if (!startAt || !isValidDateFormat(startAt)) {
      return res.status(400).json({
        status: "error",
        message:
          "Date de début manquante ou format invalide (doit être YYYY-MM-DD).",
      });
    }

    if (!endAt || !isValidDateFormat(endAt)) {
      return res.status(400).json({
        status: "error",
        message:
          "Date de fin manquante ou format invalide (doit être YYYY-MM-DD).",
      });
    }

    const existingShop = await Shop.findByPk(shopId);

    if (!existingShop) {
      return res.status(404).json({
        status: "error",
        message: "Boutique non trouvée.",
      });
    }

    const mediaFilename = req.file.filename;
    const mediaPath = path.join(__dirname, "./../public/uploads/promotions", mediaFilename);
    const mediaUrl = `${req.protocol}://${req.get("host")}/uploads/promotions/${mediaFilename}`;
    let mediaType;

    // Check if the uploaded file is an image or a video
    if (req.file.mimetype.startsWith("image/")) {
      mediaType = 0; // Image
    } else if (req.file.mimetype === "video/mp4") {
      const duration = await getVideoDurationInSeconds(mediaPath);

      // Check if the video duration exceeds 60 seconds
      if (duration > 60) {
        fs.unlinkSync(mediaPath);
        return res.status(400).json({
          status: "error",
          message: "La durée de la vidéo ne doit pas dépasser 60 secondes. Cette vidéo a une durée de " + duration + " secondes.",
        });
      }

      mediaType = 1; // Video
    } else {
      fs.unlinkSync(mediaPath);
      return res.status(400).json({
        status: "error",
        message: "Le fichier doit être une image ou une vidéo MP4.",
      });
    }

    const promotion = await Promotion.create({
      shopId: shopId,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      startAt: startAt,
      endAt: endAt,
    });

    const promotionResponse = {
      id: promotion.id,
      shopId: promotion.shopId,
      mediaUrl: promotion.mediaUrl,
      mediaType: promotion.mediaType,
      startAt: promotion.startAt,
      endAt: promotion.endAt,
    };

    // Fonction pour envoyer une notification à tous les utilisateurs du topic "promos"
    const message = {
      data: {
        title: 'Nouvelles promotions disponibles !',
        body: 'Découvrez nos offres spéciales.',
      },
      topic: 'promos',
    };

    // Envoyez la notification
    admin.messaging().send(message).then((response) => {
      console.log("Notification de promotion envoyée à tous les utilisateurs:", response);
    })
    .catch((error) => {
      console.error("Erreur lors de l'envoi de la notification :", error);
    });

    res.status(201).json({
      status: "success",
      data: promotionResponse,
    });
    
  } catch (error) {
    console.error(`ERROR CREATE PROMOTION: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la création de la promotion.",
    });
  }
};

const listPromotionsByShopId = async (req, res) => {
  try {
    const shopId = req.headers.shopid;

    if (!shopId) {
      return res.status(400).json({
        status: "error",
        message: "ID de la boutique manquant dans les en-têtes.",
      });
    }

    const existingShop = await Shop.findByPk(shopId);

    if (!existingShop) {
      return res.status(404).json({
        status: "error",
        message: "Boutique non trouvée.",
      });
    }

    let promotions;

    if (shopId === '3') {
      promotions = await Promotion.findAll({
        order: [["createdAt", "DESC"]],
      });
    } else {
      promotions = await Promotion.findAll({
        where: { shopId: shopId },
        order: [["createdAt", "DESC"]],
      });
    }

    const promotionsResponse = promotions.map((promotion) => ({
      id: promotion.id,
      mediaUrl: promotion.mediaUrl,
      mediaType: promotion.mediaType,
      startAt: promotion.startAt,
      endAt: promotion.endAt,
    }));

    res.status(200).json({
      status: "success",
      promotions: promotionsResponse,
    });
  } catch (error) {
    console.error(`ERROR LIST PROMOTIONS BY SHOP ID: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la récupération des promotions de la boutique.",
    });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const promotionId = req.body.promotionId;
    const promotion = await Promotion.findByPk(promotionId);

    if (!promotion) {
      return res.status(404).json({
        status: 'error',
        message: 'La promotion spécifiée n\'existe pas.',
      });
    }

    await promotion.destroy();

    res.status(200).json({
      status: 'success',
      message: 'La promotion a été supprimée avec succès.',
    });
  } catch (error) {
    console.error(`ERROR DELETE PROMOTION: ${error}`);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur s\'est produite lors de la suppression de la promotion.',
    });
  }
};

const listActivePromotions = async (req, res) => {
  try {

    // Récupérer la date actuelle
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toISOString().split('T')[0];

    // Trouver les promotions actives
    const activePromotions = await Promotion.findAll({
      where: {
        endAt: {
          [Op.gte]: formattedCurrentDate, // Op.gte signifie "supérieur ou égal"
        },
      },
      include: {
        model: Shop,
        attributes: ['name'],
      },
      order: [['createdAt', 'DESC']],
    });

    const activePromotionsResponse = activePromotions.map((promotion) => ({
      id: promotion.id,
      shopName: promotion.Shop.name,
      mediaUrl: promotion.mediaUrl,
      mediaType: promotion.mediaType,
      startAt: promotion.startAt,
      endAt: promotion.endAt,
    }));

    res.status(200).json({
      status: 'success',
      promotions: activePromotionsResponse,
    });
  } catch (error) {
    console.error(`ERROR LIST ACTIVE PROMOTIONS: ${error}`);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur s\'est produite lors de la récupération des promotions actives.',
    });
  }
};

/**
 * Vérifie si la date d'entrée est au format YYYY-MM-DD.
 *
 * @param {string} date - La date à valider.
 * @return {boolean} Retourne true si la date est au bon format, false sinon.
 */
function isValidDateFormat(date) {
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
  return dateFormat.test(date);
}

module.exports = { createPromotions, listPromotionsByShopId, deletePromotion, listActivePromotions };