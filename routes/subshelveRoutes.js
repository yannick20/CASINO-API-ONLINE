const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const subshelveController = require("../controllers/subshelveController");
const adminTokenMiddleware = require('../middlewares/adminTokenMiddleware');
const router = express.Router();

// Middleware for the upload of files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/subshelves");
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
 * /api/v1/subshelve/create:
 *   post:
 *     summary: Créer un sous-rayon
 *     description: Crée un nouveau sous-rayon pour un rayon existant.
 *     tags:
 *       - Sous-Rayons
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *       - in: formData
 *         name: shelveId
 *         required: true
 *         type: integer
 *         description: ID du rayon auquel le sous-rayon appartient
 *       - in: formData
 *         name: name
 *         required: true
 *         type: string
 *         description: Nom du sous-rayon
 *       - in: formData
 *         name: image
 *         type: file
 *         description: |
 *           Image du sous-rayon (format: image/jpeg, image/png).
 *           Taille recommandée: 250x250 pixels.
 *     responses:
 *       200:
 *         description: Succès - Le sous-rayon a été créé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 subShelve:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     shelveId:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Sous-rayon 1
 *                     imageUrl:
 *                       type: string
 *                       example: http://example.com/uploads/subshelves/resized_image.jpg
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-11-23T12:34:56Z
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
 *                   example: Aucune nouvelle image fournie.
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
 *       404:
 *         description: Rayon non trouvé - Le rayon spécifié n'existe pas.
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
 *                   example: Rayon non trouvé.
 *       409:
 *         description: Conflit - Un sous-rayon avec le même nom existe déjà pour ce rayon.
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
 *                   example: Un sous-rayon avec le même nom existe déjà pour ce rayon.
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
 *                   example: Une erreur s'est produite lors de la création du sous-rayon.
 */
router.post("/create", adminTokenMiddleware, upload.single('image'), subshelveController.createSubShelve);

/**
 * @swagger
 * /api/v1/subshelve/update-name:
 *   put:
 *     summary: Mettre à jour le nom du sous-rayon
 *     description: Met à jour le nom d'un sous-rayon existant.
 *     tags:
 *       - Sous-Rayons
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *       - in: formData
 *         name: shelveId
 *         required: true
 *         type: integer
 *         description: ID du rayon à mettre à jour
 *       - in: formData
 *         name: newName
 *         required: true
 *         type: string
 *         description: Nouveau nom du rayon
 *     responses:
 *       200:
 *         description: Succès - Le nom du rayon a été mis à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 shelve:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Nouveau nom du rayon
 *                     shopId:
 *                       type: integer
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-11-23T12:34:56Z
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
 *                   example: Un autre rayon avec le même nom existe déjà pour cette boutique.
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
 *       404:
 *         description: Rayon non trouvé - Le rayon spécifié n'existe pas.
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
 *                   example: Rayon non trouvé.
 *       409:
 *         description: Conflit - Un autre rayon avec le même nom existe déjà pour cette boutique.
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
 *                   example: Un autre rayon avec le même nom existe déjà pour cette boutique.
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
 *                   example: Une erreur s'est produite lors de la mise à jour du nom du rayon.
 */
router.put("/update-name", adminTokenMiddleware, subshelveController.updateSubShelveName);

/**
 * @swagger
 * /api/v1/subshelve/update-image:
 *   put:
 *     summary: Mettre à jour l'image d'un sous-rayon avec redimensionnement
 *     description: |
 *       Met à jour l'image d'un sous-rayon en utilisant son identifiant
 *       et en redimensionnant l'image.
 *     tags:
 *       - Sous-Rayons
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *       - in: body
 *         name: body
 *         required: true
 *         description: Les informations de mise à jour de l'image du sous-rayon.
 *         schema:
 *           type: object
 *           properties:
 *             subShelveId:
 *               type: integer
 *               description: Identifiant du sous-rayon à mettre à jour.
 *       - in: formData
 *         name: image
 *         type: file
 *         description: >
 *           Nouvelle image du sous-rayon (format: image/jpeg, image/png).
 *     responses:
 *       200:
 *         description: Succès - L'image du sous-rayon a été mise à jour avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 subShelve:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Nom du sous-rayon
 *                     imageUrl:
 *                       type: string
 *                       format: uri
 *                       example: http://example.com/uploads/subshelves/resized_image.jpg
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-01T12:00:00Z
 *       400:
 *         description: Requête incorrecte - Aucune nouvelle image fournie.
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
 *                   example: Aucune nouvelle image fournie.
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
 *       404:
 *         description: Non trouvé - Sous-rayon non trouvé.
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
 *                   example: Sous-rayon non trouvé.
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
 *                   example: Une erreur s'est produite lors de la mise à jour de l'image du sous-rayon.
 */
router.put("/update-image", adminTokenMiddleware, upload.single("image"), subshelveController.updateSubShelveImage);

/**
 * @swagger
 * /api/v1/subshelve/list-all:
 *   get:
 *     summary: Récupérer la liste des sous-rayons
 *     description: Récupère la liste de tous les sous-rayons avec les informations associées.
 *     tags:
 *       - Sous-Rayons
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *     responses:
 *       200:
 *         description: Succès - La liste des sous-rayons a été récupérée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 subShelves:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       shelveId:
 *                         type: integer
 *                         example: 1
 *                       shelveName:
 *                         type: string
 *                         example: Nom du rayon
 *                       name:
 *                         type: string
 *                         example: Nom du sous-rayon
 *                       imageUrl:
 *                         type: string
 *                         example: http://example.com/image.jpg
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2023-11-23T12:34:56Z
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
 *                   example: Une erreur s'est produite lors de la récupération de la liste des sous-rayons.
 */
router.get("/list-all", adminTokenMiddleware, subshelveController.getSubShelvesList);

/**
 * @swagger
 * /api/v1/subshelve/delete:
 *   delete:
 *     summary: Supprimer un sous-rayon
 *     description: Supprime un sous-rayon en utilisant son identifiant.
 *     tags:
 *       - Sous-Rayons
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *       - in: header
 *         name: subShelveID
 *         required: true
 *         type: integer
 *         description: Identifiant du sous-rayon à supprimer
 *     responses:
 *       200:
 *         description: Succès - Le sous-rayon a été supprimé avec succès.
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
 *                   example: Sous-rayon supprimé avec succès.
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
 *       404:
 *         description: Non trouvé - Sous-rayon non trouvé.
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
 *                   example: Sous-rayon non trouvé.
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
 *                   example: Une erreur s'est produite lors de la suppression du sous-rayon.
 */
router.delete("/delete", adminTokenMiddleware, subshelveController.deleteSubShelve);

/**
 * @swagger
 * /api/v1/subshelve/count:
 *   get:
 *     summary: Compter le nombre de sous-rayons
 *     description: Renvoie le nombre total de sous-rayons.
 *     tags:
 *       - Sous-Rayons
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *     responses:
 *       200:
 *         description: Succès - Renvoie le nombre total de sous-rayons.
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
 *                   example: Une erreur s'est produite lors du comptage des sous-rayons.
 */
router.get("/count", adminTokenMiddleware, subshelveController.countSubShelve);

module.exports = router;