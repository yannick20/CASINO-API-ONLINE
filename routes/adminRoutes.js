const express = require("express");
const adminController = require("../controllers/adminController");
const adminTokenMiddleware = require("../middlewares/adminTokenMiddleware");
const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/login:
 *   post:
 *     summary: Connexion de l'administrateur
 *     tags:
 *       - Auth Administrateurs
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: Informations d'identification pour la connexion
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: L'adresse email de l'administrateur
 *               example: admin@example.com
 *             password:
 *               type: string
 *               description: Le mot de passe de l'administrateur
 *               example: MotDePasseSecret
 *     responses:
 *       '200':
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               admin:
 *                 email: admin@example.com
 *                 token: VOTRE_TOKEN_D'ACCÈS
 *       '401':
 *         description: Adresse email ou mot de passe incorrect
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Adresse email ou mot de passe incorrect. Veuillez réessayer.
 *       '500':
 *         description: Erreur Interne du Serveur
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Une erreur s'est produite lors de la connexion.
 */
router.post("/login", adminController.login);

router.post("/create", adminTokenMiddleware, adminController.createAdmin);

router.get("/list-fidelity-users", adminTokenMiddleware, adminController.getUsersFidelityInfos);

router.get("/list-admins", adminTokenMiddleware, adminController.getAllAdmins);

module.exports = router;
