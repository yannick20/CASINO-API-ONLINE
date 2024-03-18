const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const promotionController = require("../controllers/promotionController");
const adminTokenMiddleware = require("../middlewares/adminTokenMiddleware");
const userTokenMiddleware = require("../middlewares/userTokenMiddleware");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/promotions");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Vérifier si le fichier est une image ou une vidéo
    if (file.mimetype.startsWith("image/") || file.mimetype === "video/mp4") {
      cb(null, true);
    } else {
      cb(new Error("Le fichier doit être une image ou une vidéo MP4."));
    }
  },
});


/**
 * @swagger
 * /api/v1/promotion/create:
 *   post:
 *     summary: Créer une nouvelle promotion pour une boutique
 *     description: |
 *       Permet de créer une nouvelle promotion pour une boutique spécifiée. Les détails de la promotion, y compris les dates de début et de fin, ainsi que l'image de la promotion, doivent être fournis.
 *     tags:
 *       - Promotion
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Jeton Bearer pour l'authentification de l'administrateur
 *         required: true
 *         schema:
 *           type: string
 *         example: Bearer VOTRE_TOKEN_D'ACCÈS
 *       - in: header
 *         name: shopid
 *         type: string
 *         required: true
 *         description: Identifiant de la boutique pour laquelle la promotion est créée.
 *       - in: body
 *         name: promotionData
 *         description: Données de création de la promotion
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             startAt:
 *               type: string
 *               format: date
 *               description: Date de début de la promotion (format YYYY-MM-DD)
 *               example: 2023-01-01
 *             endAt:
 *               type: string
 *               format: date
 *               description: Date de fin de la promotion (format YYYY-MM-DD)
 *               example: 2023-01-15
 *     responses:
 *       201:
 *         description: Succès - Promotion créée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     shopId:
 *                       type: string
 *                       example: "shop123"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://example.com/uploads/promotions/promo123.jpg"
 *                     startAt:
 *                       type: string
 *                       format: date
 *                       example: 2023-01-01
 *                     endAt:
 *                       type: string
 *                       format: date
 *                       example: 2023-01-15
 *       400:
 *         description: Requête invalide - Vérifiez les paramètres de la requête.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "ID de la boutique manquant."
 *       404:
 *         description: Ressource non trouvée - La boutique spécifiée n'a pas été trouvée.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Boutique non trouvée."
 *       500:
 *         description: Erreur interne du serveur - Vérifiez les journaux pour plus de détails.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Une erreur s'est produite lors de la création de la promotion."
 */
router.post("/create", adminTokenMiddleware, upload.single("media"), promotionController.createPromotions);

/**
 * @swagger
 * /api/v1/promotion/list-by-shop:
 *   get:
 *     summary: Liste des promotions pour une boutique spécifique
 *     description: |
 *       Récupère la liste des promotions pour une boutique spécifiée. L'identifiant de la boutique doit être inclus dans les en-têtes de la requête.
 *     tags:
 *       - Promotion
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Jeton Bearer pour l'authentification de l'administrateur
 *         required: true
 *         schema:
 *           type: string
 *         example: Bearer VOTRE_TOKEN_D'ACCÈS
 *       - in: header
 *         name: shopid
 *         type: string
 *         required: true
 *         description: Identifiant de la boutique pour laquelle les promotions sont récupérées.
 *     responses:
 *       200:
 *         description: Succès - Liste des promotions récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 promotions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       imageUrl:
 *                         type: string
 *                         example: "https://example.com/uploads/promotions/promo123.jpg"
 *                       startAt:
 *                         type: string
 *                         format: date
 *                         example: 2023-01-01
 *                       endAt:
 *                         type: string
 *                         format: date
 *                         example: 2023-01-15
 *       400:
 *         description: Requête invalide - Vérifiez les paramètres de la requête.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "ID de la boutique manquant dans les en-têtes."
 *       404:
 *         description: Ressource non trouvée - La boutique spécifiée n'a pas été trouvée.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Boutique non trouvée."
 *       500:
 *         description: Erreur interne du serveur - Vérifiez les journaux pour plus de détails.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Une erreur s'est produite lors de la récupération des promotions de la boutique."
 */
router.get("/list-by-shop", adminTokenMiddleware, promotionController.listPromotionsByShopId);

/**
 * @swagger
 * /api/v1/promotion/list-active:
 *   get:
 *     summary: Liste des promotions actives
 *     description: |
 *       Récupère la liste des promotions actives en fonction de la date actuelle. Les promotions actives sont celles dont la date de fin est postérieure à la date actuelle.
 *     tags:
 *       - Promotion
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Jeton Bearer pour l'authentification de l'utilisateur
 *         required: true
 *         schema:
 *           type: string
 *         example: Bearer VOTRE_TOKEN_D'ACCÈS
 *     responses:
 *       200:
 *         description: Succès - Liste des promotions actives récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 promotions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       shopName:
 *                         type: string
 *                         example: "Nom de la boutique"
 *                       imageUrl:
 *                         type: string
 *                         example: "http://example.com/promotion.jpg"
 *                       startAt:
 *                         type: string
 *                         format: date
 *                         example: "2023-01-01"
 *                       endAt:
 *                         type: string
 *                         format: date
 *                         example: "2023-02-01"
 *       500:
 *         description: Erreur interne du serveur - Vérifiez les journaux pour plus de détails.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Une erreur s'est produite lors de la récupération des promotions actives."
 */
router.get("/list-active", userTokenMiddleware, promotionController.listActivePromotions);

/**
 * @swagger
 * /api/v1/promotion/delete:
 *   delete:
 *     summary: Supprimer une promotion
 *     description: |
 *       Supprime une promotion spécifiée en utilisant l'identifiant de la promotion. L'identifiant de la promotion doit être inclus dans le corps de la requête.
 *     tags:
 *       - Promotion
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Jeton Bearer pour l'authentification de l'administrateur
 *         required: true
 *         schema:
 *           type: string
 *         example: Bearer VOTRE_TOKEN_D'ACCÈS
 *       - in: body
 *         name: promotionId
 *         required: true
 *         description: Identifiant de la promotion à supprimer.
 *         schema:
 *           type: object
 *           properties:
 *             promotionId:
 *               type: number
 *               example: 1
 *     responses:
 *       200:
 *         description: Succès - La promotion a été supprimée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "La promotion a été supprimée avec succès."
 *       404:
 *         description: Ressource non trouvée - La promotion spécifiée n'existe pas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "La promotion spécifiée n'existe pas."
 *       500:
 *         description: Erreur interne du serveur - Vérifiez les journaux pour plus de détails.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Une erreur s'est produite lors de la suppression de la promotion."
 */
router.delete("/delete", adminTokenMiddleware, promotionController.deletePromotion);

module.exports = router;