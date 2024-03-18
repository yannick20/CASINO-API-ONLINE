const express = require('express');
const settingController = require('../controllers/settingController');
const adminTokenMiddleware = require('../middlewares/adminTokenMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/v1/setting/update-cashback:
 *   put:
 *     summary: Mettre à jour le montant du cashback
 *     description: |
 *       Met à jour le montant actuel du cashback dans les paramètres du système.
 *     tags:
 *       - Cashback
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Token d'authentification Bearer de l'administrateur.
 *       - in: body
 *         name: updateCashbackAmountData
 *         description: Données de mise à jour du montant du cashback
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               description: Montant du cashback à mettre à jour
 *               example: 5.00
 *     responses:
 *       200:
 *         description: Succès - Le montant du cashback a été mis à jour avec succès.
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
 *                   example: "Le montant du cashback a été mis à jour avec succès."
 *       400:
 *         description: Requête invalide - Veuillez vérifier les paramètres de la requête.
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
 *                   example: "Veuillez fournir le montant du cashback."
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
 *                   example: "Une erreur s'est produite lors de la mise à jour du montant du cashback."
 */
router.put("/update-cashback", adminTokenMiddleware, settingController.updateCashbackAmount);

/**
 * @swagger
 * /api/v1/setting/cashback-amount:
 *   get:
 *     summary: Obtenir le montant du cashback
 *     description: |
 *       Récupère le montant actuel du cashback dans les paramètres du système.
 *     tags:
 *       - Cashback
 *     responses:
 *       200:
 *         description: Succès - Le montant du cashback a été récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 amount:
 *                   type: number
 *                   example: 5.00
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
 *                   example: "Une erreur s'est produite lors de la récupération du montant du cashback."
 */
router.get("/cashback-amount", settingController.getCashbackAmount);

/**
 * @swagger
 * /api/v1/setting/voucher-durate:
 *   patch:
 *     summary: Mettre à jour la durée des bons d'achat
 *     description: Met à jour la durée des bons d'achat pour déterminer la période d'expiration.
 *     tags:
 *       - Réglages
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Objet JSON contenant la nouvelle durée des bons d'achat.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             durate:
 *               type: number
 *               description: Nouvelle durée des bons d'achat en jours.
 *               example: 30
 *     responses:
 *       200:
 *         description: Succès - Durée des bons d'achat mise à jour avec succès.
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
 *                   example: "La durée des bons d'achat a été mise à jour avec succès."
 *       400:
 *         description: Requête incorrecte - Veuillez fournir la durée des bons d'achat.
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
 *                   example: "Veuillez fournir la durée des bons d'achat."
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
 *                   example: "Une erreur s'est produite lors de la mise à jour de la durée des bons d'achat."
 */
router.put("/voucher-durate", adminTokenMiddleware, settingController.updateVoucherDurate);
router.get("/voucher-durate", adminTokenMiddleware, settingController.getVoucherDurate);

/**
 * @swagger
 * /api/v1/setting/voucher-refferal-amount:
 *   patch:
 *     summary: Mettre à jour le montant minimum pour recevoir les fond de parrainage
 *     description: Met à jour le montant minimum pour recevoir les fond de parrainage
 *     tags:
 *       - Réglages
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Objet JSON contenant la nouvelle durée des bons d'achat.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               description: Nouveau montant minimum pour recevoir les fond de parrainage.
 *               example: 30
 *     responses:
 *       200:
 *         description: Succès - Le montant minimal du cashback a été mis à jour avec succès.
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
 *                   example: "La durée des bons d'achat a été mise à jour avec succès."
 *       400:
 *         description: Requête incorrecte - Veuillez fournir un montant minimal pour le parrainage.
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
 *                   example: "Veuillez fournir un montant minimal pour le parrainage."
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
 *                   example: "Une erreur s'est produite lors de la mise à jour du montant minimal du parrainage."
 */
router.put("/voucher-refferal-amount", adminTokenMiddleware, settingController.updateVoucherAmountMin);
router.get("/voucher-refferal-amount", adminTokenMiddleware, settingController.getVoucherAmountMin);

/**
 * @swagger
 * /api/v1/setting/referral-durate:
 *   put:
 *     summary: Mettre à jour le nombre de jours pour la validation du parrainage
 *     description: Met à jour le nombre de jours pour la validation du parrainage dans les paramètres de l'application.
 *     tags:
 *       - Réglages
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Objet JSON contenant le nombre de jours pour la validation du parrainage.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             durate:
 *               type: integer
 *               example: 10
 *     responses:
 *       200:
 *         description: Succès - Nombre de jours pour la validation du parrainage mis à jour avec succès.
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
 *                   example: "Le nombre de jours pour la validation du parrainage a été mis à jour avec succès."
 *       400:
 *         description: Requête incorrecte - Assurez-vous que les paramètres sont corrects.
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
 *                   example: "Veuillez fournir le nombre de jours pour la validation du parrainage."
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
 *                   example: "Une erreur s'est produite lors de la mise à jour du nombre de jours pour la validation du parrainage."
 */
router.put("/referral-durate", adminTokenMiddleware, settingController.updateVoucherDay);
router.get("/referral-durate", adminTokenMiddleware, settingController.getVoucherDay);

module.exports = router;