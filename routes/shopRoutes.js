const express = require('express');
const shopController = require('../controllers/shopController');
const adminTokenMiddleware = require('../middlewares/adminTokenMiddleware');
const router = express.Router();

/**
 * @swagger
 * /api/v1/shop/create:
 *   post:
 *     summary: Créer une nouvelle boutique
 *     tags:
 *       - Boutiques
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Jeton Bearer pour l'authentification
 *         required: true
 *         schema:
 *           type: string
 *         example: Bearer VOTRE_TOKEN_D'ACCÈS
 *       - in: formData
 *         name: name
 *         type: string
 *         description: Nom de la boutique
 *         required: true
 *         example: Boutique 1
 *     responses:
 *       '200':
 *         description: Boutique créée avec succès
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               shop:
 *                 id: 1
 *                 name: Boutique 1
 *       '401':
 *         description: Nom de la boutique non fourni ou Token invalide
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Nom de la boutique non fourni ou Token invalide.
 *       '409':
 *         description: Une boutique avec ce nom existe déjà
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Une boutique avec ce nom existe déjà.
 *       '500':
 *         description: Erreur Interne du Serveur
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Une erreur s'est produite lors de la création de la boutique.
 */
router.post('/create', adminTokenMiddleware, shopController.createShop);

/**
 * @swagger
 * /api/v1/shop/update:
 *   put:
 *     summary: Mettre à jour une boutique existante
 *     tags:
 *       - Boutiques
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Jeton Bearer pour l'authentification
 *         required: true
 *         schema:
 *           type: string
 *         example: Bearer VOTRE_TOKEN_D'ACCÈS
 *       - in: formData
 *         name: id
 *         type: integer
 *         description: ID de la boutique à mettre à jour
 *         required: true
 *         example: 1
 *       - in: formData
 *         name: name
 *         type: string
 *         description: Nouveau nom de la boutique
 *         required: true
 *         example: Nouvelle Boutique 1
 *     responses:
 *       '200':
 *         description: Boutique mise à jour avec succès
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: La boutique a été mise à jour avec succès.
 *       '401':
 *         description: Nom de la boutique non fourni ou Token invalide
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Nom de la boutique non fourni ou Token invalide.
 *       '409':
 *         description: Une boutique avec le même nom existe déjà
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Une boutique avec le même nom existe déjà.
 *       '500':
 *         description: Erreur Interne du Serveur
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Une erreur s'est produite lors de la mise à jour de la boutique.
 */
router.put('/update', adminTokenMiddleware, shopController.updateShop);

/**
 * @swagger
 * /api/v1/shop/delete:
 *   delete:
 *     summary: Supprimer une boutique existante
 *     tags:
 *       - Boutiques
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Jeton Bearer pour l'authentification
 *         required: true
 *         schema:
 *           type: string
 *         example: Bearer VOTRE_TOKEN_D'ACCÈS
 *       - in: header
 *         name: shopID
 *         type: integer
 *         description: ID de la boutique à supprimer
 *         required: true
 *         example: 1
 *     responses:
 *       '200':
 *         description: Boutique supprimée avec succès
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: La boutique a été supprimée avec succès.
 *       '401':
 *         description: Token invalide
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Token invalide.
 *       '404':
 *         description: Boutique non trouvée
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Boutique non trouvée.
 *       '500':
 *         description: Erreur Interne du Serveur
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Une erreur s'est produite lors de la suppression de la boutique.
 */
router.delete('/delete', adminTokenMiddleware, shopController.deleteShop);

/**
 * @swagger
 * /api/v1/shop/list-all:
 *   get:
 *     summary: Récupérer la liste de toutes les boutiques
 *     tags:
 *       - Boutiques
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Jeton Bearer pour l'authentification
 *         required: true
 *         schema:
 *           type: string
 *         example: Bearer VOTRE_TOKEN_D'ACCÈS
 *     responses:
 *       '200':
 *         description: Liste de toutes les boutiques
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               shops:
 *                 - id: 1
 *                   name: Boutique1
 *                 - id: 2
 *                   name: Boutique2
 *       '404':
 *         description: Aucune boutique trouvée
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Aucune boutique trouvée.
 *       '500':
 *         description: Erreur Interne du Serveur
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Une erreur s'est produite lors de la récupération de la liste des boutiques.
 */
router.get('/list-all', adminTokenMiddleware, shopController.allShop);

/**
 * @swagger
 * /api/v1/shop/count:
 *   get:
 *     summary: Compter le nombre de boutiques
 *     description: Renvoie le nombre total de boutiques.
 *     tags:
 *       - Boutiques
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *     responses:
 *       200:
 *         description: Succès - Renvoie le nombre total de boutiques.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 count:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Non autorisé - Jeton non fourni ou invalide.
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
 *                   example: Token non fourni ou invalide.
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
 *                   example: Une erreur s'est produite lors du comptage des boutiques.
 */
router.get("/count", adminTokenMiddleware, shopController.countShops);

module.exports = router;