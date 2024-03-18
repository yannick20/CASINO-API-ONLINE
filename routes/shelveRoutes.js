const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const shelveController = require("../controllers/shelveController");
const shelveMiddleware = require("../middlewares/shelveMiddleware");
const adminTokenMiddleware = require("../middlewares/adminTokenMiddleware");
const router = express.Router();

// Middleware for the upload of files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/shelves");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Vérifiez le type de fichier si nécessaire
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Le fichier doit être une image."));
    }
  },
});

/**
 * @swagger
 * /api/v1/shelve/create:
 *   post:
 *     summary: Créer un nouveau rayon
 *     tags:
 *       - Rayons
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
 *         description: Nom du rayon
 *         required: true
 *         example: Rayon 1
 *       - in: formData
 *         name: shopId
 *         type: string
 *         description: ID de la boutique à laquelle le rayon appartient
 *         required: true
 *         example: 123
 *       - in: formData
 *         name: image
 *         type: file
 *         description: Image du rayon (téléchargement de fichier)
 *         required: true
 *     responses:
 *       '200':
 *         description: Rayon créé avec succès
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               shelve:
 *                 id: 1
 *                 name: Rayon 1
 *                 imageUrl: http://example.com/uploads/shelves/image1.jpg
 *       '401':
 *         description: Nom de la boutique non fourni ou Token invalide
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Nom de la boutique non fourni ou Token invalide.
 *       '409':
 *         description: Un rayon avec le même nom existe déjà pour cette boutique
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Un rayon avec le même nom existe déjà pour cette boutique.
 *       '500':
 *         description: Erreur Interne du Serveur
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Une erreur s'est produite lors de la création du rayon.
 */
router.post("/create", adminTokenMiddleware, shelveMiddleware, upload.single("image"), shelveController.createShelve);

/**
 * @swagger
 * /api/v1/shelve/list-all:
 *   get:
 *     summary: Récupérer la liste des rayons
 *     tags:
 *       - Rayons
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
 *         description: Liste des rayons récupérée avec succès
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               shelves:
 *                 - id: 1
 *                   shopId: 123
 *                   name: Rayon 1
 *                   shopName: Boutique 1
 *                   imageUrl: http://example.com/uploads/shelves/image1.jpg
 *                   createdAt: "2023-11-23T12:00:00Z"
 *                 - id: 2
 *                   shopId: 456
 *                   name: Rayon 2
 *                   shopName: Boutique 2
 *                   imageUrl: http://example.com/uploads/shelves/image2.jpg
 *                   createdAt: "2023-11-23T12:30:00Z"
 *       '500':
 *         description: Erreur Interne du Serveur
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Une erreur s'est produite lors de la récupération de la liste des rayons.
 */
router.get("/list-all", adminTokenMiddleware, shelveController.getShelvesList);

/**
 * @swagger
 * /api/v1/shelve/update-name:
 *   put:
 *     summary: Mettre à jour le nom d'un rayon
 *     tags:
 *       - Rayons
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Jeton Bearer pour l'authentification
 *         required: true
 *         schema:
 *           type: string
 *         example: Bearer VOTRE_TOKEN_D'ACCÈS
 *       - in: body
 *         name: shelve
 *         description: Informations du rayon à mettre à jour
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Le nom du rayon
 *               example: Nouveau Nom du Rayon
 *             shopId:
 *               type: string
 *               description: L'ID de la boutique à laquelle le rayon appartient
 *               example: 123
 *             shelveId:
 *               type: string
 *               description: L'ID du rayon à mettre à jour
 *               example: 456
 *     responses:
 *       '200':
 *         description: Rayon mis à jour avec succès
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               shelve:
 *                 id: 456
 *                 name: Nouveau Nom du Rayon
 *                 shopId: 123
 *                 createdAt: "2023-11-23T12:00:00Z"
 *       '404':
 *         description: Rayon non trouvé
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Rayon non trouvé.
 *       '409':
 *         description: Conflit - Un autre rayon avec le même nom existe déjà pour cette boutique
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Un autre rayon avec le même nom existe déjà pour cette boutique.
 *       '500':
 *         description: Erreur Interne du Serveur
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Une erreur s'est produite lors de la mise à jour du rayon.
 */
router.put("/update-name", adminTokenMiddleware, shelveController.updateShelve);

/**
 * @swagger
 * /api/v1/shelve/update-image:
 *   put:
 *     summary: Mettre à jour l'image d'un rayon
 *     tags:
 *       - Rayons
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Jeton Bearer pour l'authentification
 *         required: true
 *         schema:
 *           type: string
 *         example: Bearer VOTRE_TOKEN_D'ACCÈS
 *       - in: body
 *         name: shelve
 *         description: Informations pour la mise à jour de l'image du rayon
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             shelveId:
 *               type: string
 *               description: L'ID du rayon à mettre à jour
 *               example: 456
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image à télécharger pour la mise à jour
 *     responses:
 *       '200':
 *         description: Image du rayon mise à jour avec succès
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               shelve:
 *                 name: Nom du Rayon
 *                 imageUrl: http://example.com/uploads/shelves/resized_image.jpg
 *                 updatedAt: "2023-11-23T12:00:00Z"
 *       '400':
 *         description: Aucune nouvelle image fournie
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Aucune nouvelle image fournie.
 *       '404':
 *         description: Rayon non trouvé
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Rayon non trouvé.
 *       '500':
 *         description: Erreur Interne du Serveur
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Une erreur s'est produite lors de la mise à jour de l'image du rayon.
 */
router.put("/update-image", adminTokenMiddleware, upload.single("image"), shelveController.updateShelveImage);

/**
 * @swagger
 * /api/v1/shelve/delete:
 *   delete:
 *     summary: Supprimer un rayon
 *     tags:
 *       - Rayons
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         description: Jeton Bearer pour l'authentification
 *         required: true
 *         schema:
 *           type: string
 *         example: Bearer VOTRE_TOKEN_D'ACCÈS
 *       - in: header
 *         name: shelveID
 *         description: L'ID du rayon à supprimer
 *         required: true
 *         schema:
 *           type: string
 *         example: 456
 *     responses:
 *       '200':
 *         description: Rayon supprimé avec succès
 *         content:
 *           application/json:
 *             example:
 *               status: success
 *               message: Rayon supprimé avec succès.
 *       '404':
 *         description: Rayon non trouvé
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Rayon non trouvé.
 *       '500':
 *         description: Erreur Interne du Serveur
 *         content:
 *           application/json:
 *             example:
 *               status: error
 *               message: Une erreur s'est produite lors de la suppression du rayon.
 */
router.delete('/delete', adminTokenMiddleware, shelveController.deleteShelve);

/**
 * @swagger
 * /api/v1/shelve/count:
 *   get:
 *     summary: Compter le nombre de rayons
 *     description: Renvoie le nombre total de rayons.
 *     tags:
 *       - Rayons
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *     responses:
 *       200:
 *         description: Succès - Renvoie le nombre total de rayons.
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
 *                   example: Une erreur s'est produite lors du comptage des rayons.
 */
router.get("/count", adminTokenMiddleware, shelveController.countShelves);

module.exports = router;
