const express = require("express");
const statisticController = require("../controllers/statisticController");
const adminTokenMiddleware = require("../middlewares/adminTokenMiddleware");
const router = express.Router();

/**
 * @swagger
 * /api/v1/statistic/subscriber-count:
 *   get:
 *     summary: Récupérer le nombre d'abonnés inscrits
 *     description: Récupère le nombre total d'abonnés inscrits dans le système.
 *     tags:
 *       - Statistiques
 *     responses:
 *       200:
 *         description: Succès - Nombre d'abonnés inscrits récupéré avec succès.
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
 *                   example: "Nombre d'abonnés inscrits récupéré avec succès."
 *                 count:
 *                   type: number
 *                   example: 100
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
 *                   example: "Une erreur s'est produite lors de la récupération du nombre d'abonnés."
 */
router.get("/subscriber-count", adminTokenMiddleware, statisticController.getSubscriberCount);

/**
 * @swagger
 * /api/v1/statistic/sponsoring-amount:
 *   get:
 *     summary: Récupérer le montant total de parrainage
 *     description: Récupère le montant total généré par le parrainage dans le système.
 *     tags:
 *       - Statistiques
 *     responses:
 *       200:
 *         description: Succès - Montant total de parrainage récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 count:
 *                   type: number
 *                   example: 1000
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
 *                   example: "Une erreur s'est produite lors de la récupération du montant total de parrainage."
 */
router.get("/sponsoring-amount", adminTokenMiddleware, statisticController.getSponsoringAmount);

/**
 * @swagger
 * /api/v1/statistic/actif-clients-count:
 *   get:
 *     summary: Récupérer le nombre total d'utilisateurs avec des transactions récentes
 *     description: Récupère le nombre total d'utilisateurs ayant effectué des transactions au cours des trois derniers mois.
 *     tags:
 *       - Statistiques
 *     responses:
 *       200:
 *         description: Succès - Nombre total d'utilisateurs avec des transactions récentes récupéré avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 userCount:
 *                   type: number
 *                   example: 50
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
 *                   example: "Une erreur s'est produite lors de la récupération du nombre total d'utilisateurs avec des transactions récentes."
 */
router.get("/actif-clients-count", adminTokenMiddleware, statisticController.getUsersCountWithRecentTransactions);

/**
 * @swagger
 * /api/v1/statistic/inactif-clients-count:
 *   get:
 *     summary: Récupérer le nombre d'utilisateurs sans transactions récentes
 *     description: Récupère le nombre d'utilisateurs n'ayant pas effectué de transactions au cours des trois derniers mois.
 *     tags:
 *       - Statistiques
 *     responses:
 *       200:
 *         description: Succès - Nombre d'utilisateurs sans transactions récentes récupéré avec succès.
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
 *                   example: 42
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
 *                   example: "Une erreur s'est produite lors de la récupération du nombre d'utilisateurs sans transactions récentes."
 */
router.get("/inactif-clients-count", adminTokenMiddleware, statisticController.getCountUsersWithoutRecentTransactions);

/**
 * @swagger
 * /api/v1/statistic/list-actif-clients:
 *   get:
 *     summary: Récupérer les utilisateurs avec des transactions récentes
 *     description: Récupère la liste des utilisateurs ayant effectué des transactions au cours des trois derniers mois.
 *     tags:
 *       - Statistiques
 *     responses:
 *       200:
 *         description: Succès - Liste des utilisateurs avec des transactions récentes récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 users:
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
 *                         example: "+123456789"
 *                       imageUrl:
 *                         type: string
 *                         example: "https://example.com/johndoe.jpg"
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
 *                   example: "Une erreur s'est produite lors de la récupération des utilisateurs avec des transactions récentes."
 */
router.get("/list-active-clients", adminTokenMiddleware, statisticController.getUsersWithRecentTransactions);

/**
 * @swagger
 * /api/v1/statistic/list-inactive-clients:
 *   get:
 *     summary: Récupérer les utilisateurs sans transactions récentes
 *     description: Récupère la liste des utilisateurs n'ayant pas effectué de transactions au cours des trois derniers mois.
 *     tags:
 *       - Statistiques
 *     responses:
 *       200:
 *         description: Succès - Liste des utilisateurs sans transactions récentes récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 users:
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
 *                         example: "+123456789"
 *                       imageUrl:
 *                         type: string
 *                         example: "https://example.com/johndoe.jpg"
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
 *                   example: "Une erreur s'est produite lors de la récupération des utilisateurs sans transactions récentes."
 */
router.get("/list-inactive-clients", adminTokenMiddleware, statisticController.getUsersWithoutRecentTransactions);

router.get("/average-ticket-amount", adminTokenMiddleware, statisticController.getAverageTicketAmount);

module.exports = router;


