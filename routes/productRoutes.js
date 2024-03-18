const express = require('express');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const productController = require('../controllers/productController');
const adminTokenMiddleware = require('../middlewares/adminTokenMiddleware');
const router = express.Router();

// Middleware for the upload of files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/products");
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
 * /api/v1/product/list-all:
 *   get:
 *     summary: Liste tous les produits
 *     description: Récupère la liste de tous les produits avec leurs informations associées.
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *     responses:
 *       200:
 *         description: Succès - Renvoie la liste des produits avec leurs informations associées.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Nom du Produit
 *                       shopName:
 *                         type: string
 *                         example: Nom de la Boutique
 *                       shelveName:
 *                         type: string
 *                         example: Nom du Rayon
 *                       subShelveName:
 *                         type: string
 *                         example: Nom du Sous-rayon
 *                       imageUrl:
 *                         type: string
 *                         example: http://exemple.com/image.jpg
 *                       barcode:
 *                         type: string
 *                         example: 123456789
 *                       price:
 *                         type: number
 *                         example: 9.99
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2023-01-01T12:00:00Z
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
 *                   example: Une erreur s'est produite lors de la récupération des produits.
 */
router.get('/list-all', adminTokenMiddleware, productController.listProducts);

/**
 * @swagger
 * /api/v1/product/create:
 *   post:
 *     summary: Créer un nouveau produit
 *     description: |
 *       Crée un nouveau produit associé à une boutique, un rayon et un sous-rayon.
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *       - in: body
 *         name: body
 *         required: true
 *         description: Les informations du nouveau produit.
 *         schema:
 *           type: object
 *           properties:
 *             shopId:
 *               type: integer
 *               description: Identifiant de la boutique à laquelle le produit est associé.
 *             shelveId:
 *               type: integer
 *               description: Identifiant du rayon à laquelle le produit est associé.
 *             subShelveId:
 *               type: integer
 *               description: Identifiant du sous-rayon à laquelle le produit est associé.
 *             name:
 *               type: string
 *               description: Nom du produit.
 *             barcode:
 *               type: string
 *               description: Code-barres du produit.
 *             price:
 *               type: number
 *               format: double
 *               description: Prix du produit.
 *     responses:
 *       200:
 *         description: Succès - Le produit a été créé avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     shopId:
 *                       type: integer
 *                       example: 1
 *                     shelveId:
 *                       type: integer
 *                       example: 1
 *                     subShelveId:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Nom du produit
 *                     imageUrl:
 *                       type: string
 *                       format: uri
 *                       example: http://example.com/uploads/products/resized_image.jpg
 *                     barcode:
 *                       type: string
 *                       example: ABC123
 *                     price:
 *                       type: number
 *                       format: double
 *                       example: 19.99
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-01T12:00:00Z
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
 *         description: Non trouvé - Boutique, rayon ou sous-rayon non trouvé.
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
 *                   example: Boutique, rayon ou sous-rayon non trouvé.
 *       409:
 *         description: Conflit - Le nom du produit, le code-barres ou le produit lui-même existe déjà.
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
 *                   example: Ce nom de produit existe déjà.
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
 *                   example: Une erreur s'est produite lors de la création du produit.
 */
router.post('/create', adminTokenMiddleware, upload.single("image"), productController.createProduct);

/**
 * @swagger
 * /api/v1/product/delete:
 *   delete:
 *     summary: Supprimer un produit
 *     description: Supprime un produit par son identifiant.
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *       - in: header
 *         name: ProductId
 *         required: true
 *         type: integer
 *         description: Identifiant du produit à supprimer.
 *     responses:
 *       200:
 *         description: Succès - Le produit a été supprimé avec succès.
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
 *                   example: Le produit a été supprimé avec succès.
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
 *         description: Non trouvé - Le produit n'a pas été trouvé.
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
 *                   example: Le produit n'a pas été trouvé.
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
 *                   example: Une erreur s'est produite lors de la suppression du produit.
 */
router.delete('/delete', adminTokenMiddleware, productController.deleteProduct);

/**
 * @swagger
 * /api/v1/product/count:
 *   get:
 *     summary: Compter le nombre de produits
 *     description: Renvoie le nombre total de produits.
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *     responses:
 *       200:
 *         description: Succès - Renvoie le nombre total de produits.
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
 *                   example: Une erreur s'est produite lors du comptage des produits.
 */
router.get('/count', adminTokenMiddleware, productController.countProducts);

/**
 * @swagger
 * /api/v1/product/update-infos:
 *   put:
 *     summary: Mettre à jour un produit
 *     description: Met à jour le nom, le code-barres et le prix d'un produit existant.
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *       - in: header
 *         name: ProductId
 *         required: true
 *         type: integer
 *         description: ID du produit à mettre à jour
 *       - in: body
 *         name: body
 *         required: true
 *         description: Les nouvelles informations du nouveau produit.
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Nouveau Nom du produit.
 *             barcode:
 *               type: string
 *               description: Nouveau Code-barres du produit.
 *             price:
 *               type: number
 *               format: double
 *               description: Nouveau Prix du produit.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nouveau nom du produit
 *               barcode:
 *                 type: string
 *                 description: Nouveau code-barres du produit
 *               price:
 *                 type: number
 *                 description: Nouveau prix du produit
 *     responses:
 *       200:
 *         description: Succès - Renvoie les informations mises à jour du produit.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     shopId:
 *                       type: integer
 *                       example: 1
 *                     shelveId:
 *                       type: integer
 *                       example: 1
 *                     subShelveId:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Nouveau Nom
 *                     imageUrl:
 *                       type: string
 *                       example: http://exemple.com/image.jpg
 *                     barcode:
 *                       type: string
 *                       example: 123456789
 *                     price:
 *                       type: number
 *                       example: 9.99
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-01-01T12:00:00Z
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
 *         description: Non trouvé - Le produit avec l'ID spécifié n'existe pas.
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
 *                   example: Produit non trouvé.
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
 *                   example: Une erreur s'est produite lors de la mise à jour du produit.
 */
router.put('/update-infos', adminTokenMiddleware, productController.updateProduct);

/**
 * @swagger
 * /api/v1/product/update-image:
 *   put:
 *     summary: Mettre à jour l'image du produit
 *     tags:
 *       - Produits
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         type: string
 *         description: Jeton d'authentification (Bearer token)
 *       - in: header
 *         name: ProductId
 *         required: true
 *         type: integer
 *         description: ID du produit à mettre à jour
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
router.put('/update-image', adminTokenMiddleware, productController.updateImage);

module.exports = router;