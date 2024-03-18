const express = require("express");
const sponsoringController = require("../controllers/sponsoringController");
const adminTokenMiddleware = require("../middlewares/adminTokenMiddleware");
const router = express.Router();

/**
 * @swagger
 * /api/v1/referral/update-godfather-amount:
 *   put:
 *     summary: Mettre à jour le montant du parrain
 *     description: |
 *       Met à jour le montant du parrain dans les paramètres du système. Cette opération nécessite un montant valide à fournir.
 *     tags:
 *       - Parrainage
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Token d'authentification Bearer de l'administrateur.
 *       - in: body
 *         name: updateGodSonAmountData
 *         description: Montant du parrain à mettre à jour
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               description: Montant du parrain
 *               example: 10.00
 *     responses:
 *       200:
 *         description: Succès - Le montant du parrain a été mis à jour avec succès.
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
 *                   example: "Le montant du parrain a été mis à jour avec succès."
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
 *                   example: "Veuillez fournir le montant du parrain."
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
 *                   example: "Une erreur s'est produite lors de la mise à jour du montant du parrain."
 */
router.put("/update-godfather-amount", adminTokenMiddleware, sponsoringController.updateGodfatherAmount);

/**
 * @swagger
 * /api/v1/referral/godfather-amount:
 *   get:
 *     summary: Obtenir le montant du parrain
 *     description: |
 *       Récupère le montant actuel du parrain dans les paramètres du système.
 *     tags:
 *       - Parrainage
 *     responses:
 *       200:
 *         description: Succès - Le montant du parrain a été récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 godfatherAmount:
 *                   type: number
 *                   example: 10.00
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
 *                   example: "Une erreur s'est produite lors de la récupération du montant du parrain."
 */
router.get("/godfather-amount", sponsoringController.getGodfatherAmount);

/**
 * @swagger
 * /api/v1/referral/update-godson-amount:
 *   put:
 *     summary: Mettre à jour le montant du fils du parrain
 *     description: |
 *       Met à jour le montant du fils du parrain dans les paramètres du système. Cette opération nécessite un montant valide à fournir.
 *     tags:
 *       - Parrainage
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Token d'authentification Bearer de l'administrateur..
 *       - in: body
 *         name: updateGodSonAmountData
 *         description: Montant du fils du parrain à mettre à jour
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *               description: Montant du fils du parrain
 *               example: 5.00
 *     responses:
 *       200:
 *         description: Succès - Le montant du fils du parrain a été mis à jour avec succès.
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
 *                   example: "Le montant du fils du parrain a été mis à jour avec succès."
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
 *                   example: "Veuillez fournir le montant du fils du parrain."
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
 *                   example: "Une erreur s'est produite lors de la mise à jour du montant du fils du parrain."
 */
router.put("/update-godson-amount", adminTokenMiddleware, sponsoringController.updateGodSonAmount);

/**
 * @swagger
 * /api/v1/referral/godson-amount:
 *   get:
 *     summary: Obtenir le montant du fils du parrain
 *     description: |
 *       Récupère le montant actuel du fils du parrain dans les paramètres du système.
 *     tags:
 *       - Parrainage
 *     responses:
 *       200:
 *         description: Succès - Le montant du fils du parrain a été récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 godsonAmount:
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
 *                   example: "Une erreur s'est produite lors de la récupération du montant du fils du parrain."
 */
router.get("/godson-amount", sponsoringController.getGodSonAmount);

module.exports = router;