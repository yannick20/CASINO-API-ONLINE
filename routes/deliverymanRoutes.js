const express = require("express");
const deliverymanController = require("../controllers/deliverymanController");
const adminTokenMiddleware = require("../middlewares/adminTokenMiddleware");
const router = express.Router();

/**
 * @swagger
 * /api/v1/deliveryman/create:
 *   post:
 *     summary: Crée un livreur
 *     description: Crée un nouveau livreur avec le nom, le numéro de téléphone, l'email et le mot de passe fournis.
 *     tags:
 *       - Livreur
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Token d'authentification Bearer.
 *       - in: header
 *         name: ShopId
 *         required: true
 *         type: integer
 *         description: Identifiant du magasin.
 *       - in: body
 *         name: credentials
 *         description: Informations d'identification pour la connexion
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Le nom du livreur
 *               example: John Doe
 *             phone:
 *               type: string
 *               description: Le numéro de portable du livreur
 *               example: 066000000
 *             email:
 *               type: string
 *               description: L'email du livreur
 *               example: john.doe@example.com
 *             password:
 *               type: string
 *               description: Le mot de passe du livreur
 *               example: MotDePasseSecret
 *     responses:
 *       200:
 *         description: Succès - Renvoie les informations du livreur créé.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 deliveryman:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Livreur 1
 *                     phone:
 *                       type: string
 *                       example: 123456789
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: livreur@example.com
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-01T12:00:00Z
 *       409:
 *         description: Conflit - Un livreur avec le même nom et numéro de téléphone existe déjà.
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
 *                   example: Ce livreur existe déjà.
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
 *                   example: Une erreur s'est produite lors de la création du livreur.
 */
router.post("/create", adminTokenMiddleware, deliverymanController.createDeliveryman);

/**
 * @swagger
 * /api/v1/deliveryman/delete:
 *   delete:
 *     summary: Supprime un livreur
 *     description: Supprime un livreur en fonction de son ID. Le token d'authentification Bearer est requis dans le header.
 *     tags:
 *       - Livreur
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Token d'authentification Bearer.
 *       - in: header
 *         name: DeliverymanId
 *         type: integer
 *         required: true
 *         description: ID du livreur à supprimer.
 *     responses:
 *       200:
 *         description: Succès - Livreur supprimé avec succès.
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
 *                   example: Livreur supprimé avec succès.
 *       404:
 *         description: Non trouvé - Aucun livreur trouvé avec l'ID fourni.
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
 *                   example: Livreur non trouvé.
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
 *                   example: Une erreur s'est produite lors de la suppression du livreur.
 */
router.delete("/delete", adminTokenMiddleware, deliverymanController.deleteDeliveryman);

/**
 * @swagger
 * /api/v1/deliveryman/list-all:
 *   get:
 *     summary: Liste tous les livreurs
 *     description: Récupère la liste de tous les livreurs avec leurs ID, nom, téléphone et email. Le token d'authentification Bearer est requis dans le header.
 *     tags:
 *       - Livreur
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *         description: Token d'authentification Bearer.
 *       - in: header
 *         name: ShopId
 *         required: true
 *         type: integer
 *         description: Identifiant du magasin.
 *     responses:
 *       200:
 *         description: Succès - Liste des livreurs récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 deliverymen:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       phone:
 *                         type: string
 *                         example: +123456789
 *                       email:
 *                         type: string
 *                         example: john.doe@example.com
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
 *                   example: Une erreur s'est produite lors de la récupération de la liste des livreurs.
 */
router.get("/list-all", adminTokenMiddleware, deliverymanController.listDeliverymen);

module.exports = router;