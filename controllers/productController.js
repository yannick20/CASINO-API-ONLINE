const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { Shop, Shelve, SubShelve, Product } = require("../models");

const createProduct = async (req, res) => {
  try {
    const shopId = req.headers.shopid;
    const shelveId = req.headers.shelveid;
    const subShelveId = req.headers.subshelveid;
    const { name, barcode, price } = req.body;

    if (!shopId) {
      return res.status(400).json({
        status: "error",
        message: "ID de la boutique manquant.",
      });
    }

    if (!shelveId) {
      return res.status(400).json({
        status: "error",
        message: "ID du rayon manquant.",
      });
    }

    if (!subShelveId) {
      return res.status(400).json({
        status: "error",
        message: "ID du sous-rayon manquant.",
      });
    }

    // Vérifier si la boutique, le rayon et le sous-rayon existent
    const existingShop = await Shop.findByPk(shopId);
    const existingShelve = await Shelve.findByPk(shelveId);
    const existingSubShelve = await SubShelve.findByPk(subShelveId);

    if (!existingShop) {
      return res.status(404).json({
        status: "error",
        message: "Boutique non trouvé.",
      });
    }

    if (!existingShelve) {
      return res.status(404).json({
        status: "error",
        message: "Rayon non trouvé.",
      });
    }

    if (!existingSubShelve) {
      return res.status(404).json({
        status: "error",
        message: "Sous-rayon non trouvé.",
      });
    }

    if (barcode.length < 8) {
      return res.status(400).json({
        status: "error",
        message: "Le code-barres doit contenir 8 chiffres minimum.",
      });
    }

    // Vérifier si le code-barres du produit existe
    const existingBarcode = await Product.findOne({
      where: {
        brcode: barcode,
      },
    });

    // Vérifier si le produit existe
    const existingProduct = await Product.findOne({
      where: {
        ShopId: shopId,
        ShelveId: shelveId,
        SubShelveId: subShelveId,
        name,
      },
    });
    if (existingProduct) {
      return res.status(409).json({
        status: "error",
        message: "Ce produit existe de déjà.",
      });
    }

    // Vérifier si une image a été envoyée
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "L'image du produit est requise.",
      });
    }

    // Utilisation de Sharp pour redimensionner l'image à 250x250
    const resizedImagePath = path.join(
      __dirname,
      "..",
      "public/uploads/products",
      `resized_${req.file.filename}`
    );
    const resizedImageDirectory = path.dirname(resizedImagePath);
    // Crée le répertoire s'il n'existe pas
    if (!fs.existsSync(resizedImageDirectory)) {
      fs.mkdirSync(resizedImageDirectory, { recursive: true });
    }

    await sharp(req.file.path).resize(250, 250).toFile(resizedImagePath);

    const productImageUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/products/resized_${req.file.filename}`;

    // Créer le produit
    const newProduct = await Product.create({
      shopId: shopId,
      shelveId: shelveId,
      subShelveId: subShelveId,
      name: name,
      imageUrl: productImageUrl,
      brcode: barcode,
      price: price,
    });

    const productResponse = {
      id: newProduct.id,
      shopId: newProduct.ShopId,
      shelveId: newProduct.ShelveId,
      subShelveId: newProduct.SubShelveId,
      name: newProduct.name,
      imageUrl: newProduct.imageUrl,
      imageUrlLarge: newProduct.imageUrl,
      brcode: newProduct.barcode,
      price: newProduct.price,
      createdAt: newProduct.createdAt,
    };

    res.status(200).json({
      status: "success",
      product: productResponse,
    });
  } catch (error) {
    console.error(`ERROR PRODUCT CREATION: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la création du produit.",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.headers.productid;

    // Vérifier si le produit existe
    const existingProduct = await Product.findByPk(productId);

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Le produit n'a pas été trouvé.",
      });
    }

    // Supprimer le produit
    await existingProduct.destroy();

    res.status(200).json({
      status: "success",
      message: "Le produit a été supprimé avec succès.",
    });
  } catch (error) {
    console.error(`ERROR DELETING PRODUCT: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la suppression du produit.",
    });
  }
};

const countProducts = async (req, res) => {
  try {
    // Compter le nombre total de produits
    const productCount = await Product.count();

    res.status(200).json({
      status: "success",
      count: productCount || 0,
    });
  } catch (error) {
    console.error(`ERROR COUNTING PRODUCTS: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors du comptage des produits.",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.headers.productid;
    const { name, barcode, price } = req.body;

    // Vérifier si le produit existe
    const existingProduct = await Product.findByPk(productId);

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Produit non trouvé.",
      });
    }

    // Mettre à jour le nom, le code-barres et le prix du produit
    existingProduct.name = name || existingProduct.name;
    existingProduct.barcode = barcode || existingProduct.barcode;
    existingProduct.price = price || existingProduct.price;

    await existingProduct.save();

    const updatedProduct = await Product.findByPk(productId);

    const productResponse = {
      id: updatedProduct.id,
      shopId: updatedProduct.ShopId,
      shelveId: updatedProduct.ShelveId,
      subShelveId: updatedProduct.SubShelveId,
      name: updatedProduct.name,
      imageUrl: updatedProduct.imageUrl,
      barcode: updatedProduct.barcode,
      price: updatedProduct.price,
      createdAt: updatedProduct.createdAt,
    };

    res.status(200).json({
      status: "success",
      product: productResponse,
    });
  } catch (error) {
    console.error(`ERROR UPDATING PRODUCT: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la mise à jour du produit.",
    });
  }
};

const updateImage = async (req, res) => {
  try {
    const productId = req.headers.productid;

    // Vérifiez si le rayon existe
    const existingProduct = await Product.findByPk(productId);

    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: "Produit non trouvé.",
      });
    }

    // Vérifiez si une nouvelle image a été téléchargée
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Aucune nouvelle image fournie.",
      });
    }

    // Utilisation de Sharp pour redimensionner la nouvelle image
    const resizedImagePath = path.join(
      __dirname,
      "..",
      "public/uploads/products",
      `resized_${req.file.filename}`
    );

    await sharp(req.file.path).resize(250, 250).toFile(resizedImagePath);

    const newImageUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/products/resized_${req.file.filename}`;

    // Mise à jour de l'image du rayon
    const updatedProduct = await existingProduct.update({
      imageUrl: newImageUrl,
    });

    const productResponse = {
      name: updatedProduct.name,
      imageUrl: updatedProduct.imageUrl,
      updatedAt: updatedProduct.updatedAt,
    };

    res.status(200).json({
      status: "success",
      shelve: productResponse,
    });
  } catch (error) {
    console.error(`ERROR UPDATING PRODUCT IMAGE: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour de l'image du produit.",
    });
  }
};

const listProducts = async (req, res) => {
  try {
    const shopId = req.headers.shopid;
    const shelveId = req.headers.shelveid;
    const subShelveId = req.headers.subshelveid;

    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      return res
        .status(404)
        .json({
          status: "error",
          message: "Aucun produit trouvé pour cette boutique",
        });
    }

    const shelve = await Shelve.findOne({
      where: {
        id: shelveId,
        shopId: shopId,
      },
    });

    if (!shelve) {
      return res
        .status(404)
        .json({ status: "error", message: "Aucun produit dans ce rayon" });
    }

    const subShelve = await SubShelve.findOne({
      where: {
        id: subShelveId,
        shopId: shopId,
        shelveId: shelveId,
      },
    });

    if (!subShelve) {
      return res
        .status(404)
        .json({ status: "error", message: "Aucun produit dans ce sous-rayon" });
    }

    const products = await Product.findAll({
      where: {
        shopId: shopId,
        shelveId: shelveId,
        subShelveId: subShelveId,
      },
      attributes: ["id", "name", "imageUrl", "brcode", "price"],
      order: [["name", "ASC"]],
    });

    const productsResponse = products.map((product) => ({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      brcode: product.brcode,
      price: product.price,
      shopId: shopId,
      shelveId: shelveId,
      subShelveId: subShelveId,
    }));

    res.status(200).json({
      status: "success",
      products: productsResponse,
    });
  } catch (error) {
    console.error(`ERROR LISTING PRODUCTS: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la récupération de la liste des produits.",
    });
  }
};

module.exports = {
  createProduct,
  deleteProduct,
  countProducts,
  updateProduct,
  updateImage,
  listProducts,
};
