const express = require("express");
const voucherController = require("../controllers/voucherController");
const adminTokenMiddleware = require("../middlewares/adminTokenMiddleware");
const router = express.Router();


/**
 * @swagger
 * /api/v1/voucher/list-active:
 *   get:
 *     summary: Récupérer le bon d'achat actif de l'utilisateur
 *     description: Récupère le bon d'achat actif associé à l'utilisateur.
 *     tags:
 *       - Bon d'achat
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Token d'authentification Bearer.
 *     responses:
 *       200:
 *         description: Succès - Le bon d'achat actif de l'utilisateur a été récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 voucher:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                       description: ID du bon d'achat.
 *                     amount:
 *                       type: number
 *                       example: 10.00
 *                       description: Montant du bon d'achat.
 *                     expirateDate:
 *                       type: string
 *                       example: "2023-12-31"
 *                       description: Date d'expiration du bon d'achat (YYYY-MM-DD).
 *                     ticketDate:
 *                       type: string
 *                       example: "2023-01-01"
 *                       description: Date du ticket associé au bon d'achat (YYYY-MM-DD).
 *                     ticketNumber:
 *                       type: string
 *                       example: "ABC123"
 *                       description: Numéro du ticket associé au bon d'achat.
 *                     ticketAmount:
 *                       type: number
 *                       example: 50.00
 *                       description: Montant du ticket associé au bon d'achat.
 *                     ticketCashback:
 *                       type: number
 *                       example: 5.00
 *                       description: Montant de cashback associé au ticket du bon d'achat.
 *                     state:
 *                       type: integer
 *                       example: 1
 *                       description: État du bon d'achat (1 pour actif, 0 pour inactif).
 *       401:
 *         description: Non autorisé - Veuillez fournir un token d'authentification valide.
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
 *                   example: "Token non fourni."
 *       404:
 *         description: Non trouvé - Aucun bon d'achat actif trouvé pour cet utilisateur.
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
 *                   example: "Aucun bon d'achat actif trouvé pour cet utilisateur."
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
 *                   example: "Une erreur s'est produite lors de la récupération du bon d'achat de l'utilisateur."
 */
router.get("/list-active", voucherController.getUserVoucher);

/**
 * @swagger
 * /api/v1/voucher/generate:
 *   post:
 *     summary: Générer ou mettre à jour un bon d'achat pour l'utilisateur
 *     description: Génère ou met à jour un bon d'achat pour l'utilisateur en fonction du montant du cashback accumulé.
 *     tags:
 *       - Bon d'achat
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Token d'authentification Bearer.
 *     responses:
 *       200:
 *         description: Succès - Bon d'achat généré ou mis à jour avec succès.
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
 *                   example: "Bon d'achat généré ou mis à jour avec succès."
 *       400:
 *         description: Requête incorrecte - Le montant du cashback est insuffisant.
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
 *                   example: "Le montant du cashback est insuffisant. Minimum requis : 50.00."
 *       401:
 *         description: Non autorisé - Veuillez fournir un token d'authentification valide.
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
 *                   example: "Token non fourni."
 *       404:
 *         description: Non trouvé - Utilisateur non trouvé, configuration non trouvée, ou bon d'achat non trouvé.
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
 *                   example: "Utilisateur non trouvé."
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
 *                   example: "Une erreur s'est produite lors de la génération ou de la mise à jour du bon d'achat."
 *                 error:
 *                   type: string
 *                   example: "Message d'erreur détaillé."
 */
router.post("/generate", voucherController.generateVoucher);

/**
 * @swagger
 * /api/v1/voucher/validate:
 *   get:
 *     summary: Récupérer tous les bons d'achat validés
 *     description: Récupère tous les bons d'achat validés avec les détails des utilisateurs associés.
 *     tags:
 *       - Bon d'achat
 *     responses:
 *       200:
 *         description: Succès - Bons d'achat validés récupérés avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 voucher:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       phone:
 *                         type: string
 *                         example: "+1234567890"
 *                       code:
 *                         type: string
 *                         example: "ABC123"
 *                       amount:
 *                         type: number
 *                         example: 50.0
 *                       expirateDate:
 *                         type: string
 *                         format: date
 *                         example: "2023-01-01"
 *       404:
 *         description: Non trouvé - Aucun bon d'achat validé trouvé.
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
 *                   example: "Aucun bon d'achat des utilisateurs n'a été trouvé."
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
 *                   example: "Une erreur s'est produite lors de la récupération de tous les bon d'achat des utilisateurs."
 */
router.get("/list-valide", adminTokenMiddleware, voucherController.getValidateVoucher);

/**
 * @swagger
 * /api/v1/voucher/consumed:
 *   post:
 *     summary: Récupérer tous les bons d'achat consommés dans un intervalle de temps spécifié
 *     description: Récupère tous les bons d'achat consommés avec les détails des utilisateurs associés dans un intervalle de temps spécifié.
 *     tags:
 *       - Bon d'achat
 *     parameters:
 *       - in: query
 *         name: timeInterval
 *         description: Intervalle de temps pour filtrer les bons d'achat consommés (day, week, month, year).
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *     responses:
 *       200:
 *         description: Succès - Bons d'achat consommés récupérés avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 consumedVouchers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       currentDate:
 *                         type: string
 *                         example: 2024-01-19
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       phone:
 *                         type: string
 *                         example: "+1234567890"
 *                       consumedCount:
 *                         type: number
 *                         example: 13
 *                       totalVoucherAmount:
 *                         type: number
 *                         example: 50.0
 *       400:
 *         description: Requête incorrecte - Paramètre de l'intervalle de temps manquant ou invalide.
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
 *                   example: "Paramètre de l'intervalle de temps manquant ou invalide."
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
 *                   example: "Une erreur s'est produite lors de la récupération des bons d'achat consommés."
 */
router.post("/list-consumed", adminTokenMiddleware, voucherController.getConsumedVoucher);
/**
 * @swagger
 * /api/v1/voucher/list-consumed-shop:
 *   post:
 *     summary: Récupérer tous les bons d'achat consommés dans un intervalle de temps spécifié
 *     description: Récupère tous les bons d'achat consommés avec les détails des utilisateurs associés dans un intervalle de temps spécifié.
 *     tags:
 *       - Bon d'achat
 *     parameters:
 *       - in: query
 *         name: timeInterval
 *         description: Intervalle de temps pour filtrer les bons d'achat consommés (day, week, month, year).
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *     responses:
 *       200:
 *         description: Succès - Bons d'achat consommés récupérés avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 consumedVouchers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       currentDate:
 *                         type: string
 *                         example: 2024-01-19
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       phone:
 *                         type: string
 *                         example: "+1234567890"
 *                       consumedCount:
 *                         type: number
 *                         example: 13
 *                       totalVoucherAmount:
 *                         type: number
 *                         example: 50.0
 *       400:
 *         description: Requête incorrecte - Paramètre de l'intervalle de temps manquant ou invalide.
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
 *                   example: "Paramètre de l'intervalle de temps manquant ou invalide."
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
 *                   example: "Une erreur s'est produite lors de la récupération des bons d'achat consommés."
 */
router.post("/list-consumed-shop", adminTokenMiddleware, voucherController.getShopConsumedVoucher);

/**
 * @swagger
 * /api/v1/voucher/expired:
 *   get:
 *     summary: Récupérer tous les bons d'achat expirés
 *     description: Récupère tous les bons d'achat expirés avec les détails des utilisateurs associés.
 *     tags:
 *       - Bon d'achat
 *     responses:
 *       200:
 *         description: Succès - Bons d'achat expirés récupérés avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 voucher:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       phone:
 *                         type: string
 *                         example: "+1234567890"
 *                       code:
 *                         type: string
 *                         example: "ABC123"
 *                       amount:
 *                         type: number
 *                         example: 50.0
 *                       expirateDate:
 *                         type: string
 *                         format: date
 *                         example: "2023-01-01"
 *       404:
 *         description: Non trouvé - Aucun bon d'achat expiré trouvé.
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
 *                   example: "Aucun bon d'achat des utilisateurs n'a été trouvé."
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
 *                   example: "Une erreur s'est produite lors de la récupération de tous les bon d'achat expirée."
 */
router.get("/list-expired", adminTokenMiddleware, voucherController.getExpiredVoucher);

module.exports = router;