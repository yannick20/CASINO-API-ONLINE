const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { Shop, Shelve } = require("../models");

// Create new Shelve
const createShelve = async (req, res) => {
  try {
    const { name, shopId } = req.body;

    if (!name) {
      return res.status(401).json({
        status: "error",
        message: "Nom de la boutique non fourni.",
      });
    }

    // Check if a shelve with the same name already exists for the shop
    const existingShelve = await Shelve.findOne({
      where: {
        name,
        shopId,
      },
    });

    if (existingShelve) {
      return res.status(409).json({
        status: "error",
        message: "Un rayon avec le même nom existe déjà pour cette boutique.",
      });
    }

    // Check if shop exists
    const shop = await Shop.findByPk(shopId);
    if (!shop) {
      return res.status(409).json({
        status: "error",
        message: "Boutique non initialisée.",
      });
    }

    // Utilisation de Sharp pour redimensionner l'image à 250x250
    const resizedImagePath = path.join(
      __dirname,
      "..",
      "public/uploads/shelves",
      `resized_${req.file.filename}`
    );
    const resizedImageDirectory = path.dirname(resizedImagePath);

    // Crée le répertoire s'il n'existe pas
    if (!fs.existsSync(resizedImageDirectory)) {
      fs.mkdirSync(resizedImageDirectory, { recursive: true });
    }

    await sharp(req.file.path).resize(250, 250).toFile(resizedImagePath);

    const profileImageUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/shelves/resized_${req.file.filename}`;

    // Maintenant, vous avez l'URL de l'image, vous pouvez créer le Shelve
    const newShelve = await Shelve.create({
      name,
      shopId,
      imageUrl: profileImageUrl,
    });

    // Plus besoin de newShelve.save(), car create() le fait déjà

    const shelveResponse = {
      id: newShelve.id,
      name: newShelve.name,
      imageUrl: profileImageUrl,
    };

    res.status(200).json({
      status: "success",
      shelve: shelveResponse,
    });
  } catch (error) {
    console.error(`ERROR SHELVE CREATION: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la création de la boutique.",
    });
  }
};

// Get list of all shelve order by created date
const getShelvesList = async (req, res) => {
  try {
    const shopId = req.headers.shopid; 
    // Utilisez la méthode findAll pour récupérer tous les rayons avec les informations associées
    const shelvesList = await Shelve.findAll({
       where: { shopId: shopId }, 
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "name", "imageUrl", "createdAt"],
    });

    // Retourne la liste des rayons avec les informations associées
    const shelvesResponse = shelvesList.map((shelve) => ({
      id: shelve.id,
      shopId: shelve.Shop.id,
      name: shelve.name,
      shopName: shelve.Shop.name,
      imageUrl: shelve.imageUrl,
      createdAt: shelve.createdAt,
    }));

    res.status(200).json({
      status: "success",
      shelves: shelvesResponse,
    });
  } catch (error) {
    console.error(`ERROR GETTING SHELVES LIST: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la récupération de la liste des rayons.",
    });
  }
};

const updateShelve = async (req, res) => {
  try {
    const { name, shopId, shelveId } = req.body;
    // Vérifiez si le rayon existe
    const existingShelve = await Shelve.findByPk(shelveId);

    if (!existingShelve) {
      return res.status(404).json({
        status: "error",
        message: "Rayon non trouvé.",
      });
    }

    // Vérifiez si le nom du rayon est déjà utilisé pour la même boutique (évitez les conflits)
    const otherShelveWithSameName = await Shelve.findOne({
      where: {
        name,
        shopId,
        id: { [Op.not]: shelveId }, // Exclure le rayon actuel de la recherche
      },
    });

    if (otherShelveWithSameName) {
      return res.status(409).json({
        status: "error",
        message:
          "Un autre rayon avec le même nom existe déjà pour cette boutique.",
      });
    }

    // Mise à jour du rayon
    const updatedShelve = await existingShelve.update({
      name,
      shopId,
    });

    const shelveResponse = {
      id: updatedShelve.id,
      name: updatedShelve.name,
      shopId: updatedShelve.shopId,
      createdAt: updatedShelve.createdAt,
    };

    res.status(200).json({
      status: "success",
      shelve: shelveResponse,
    });
  } catch (error) {
    console.error(`ERROR UPDATING SHELVE: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la mise à jour du rayon.",
    });
  }
};

const updateShelveImage = async (req, res) => {
  try {
    const { shelveId, shopId } = req.body;

    // Vérifiez si le rayon existe
    const existingShelve = await Shelve.findByPk(shelveId);
    const existingShop = await Shop.findByPk(shopId);

    if (!existingShelve) {
      return res.status(404).json({
        status: "error",
        message: "Rayon non trouvé.",
      });
    }

    if (!existingShop) {
      return res.status(404).json({
        status: "error",
        message: "Boutique non trouvé.",
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
      "public/uploads/shelves",
      `resized_${req.file.filename}`
    );

    await sharp(req.file.path).resize(350, 350).toFile(resizedImagePath);

    const newImageUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/shelves/resized_${req.file.filename}`;

    // Mise à jour de l'image du rayon
    const updatedShelve = await existingShelve.update({
      imageUrl: newImageUrl,
      where: {
        id: shelveId,
        shopId: shopId,
      }
    });

    const shelveResponse = {
      name: updatedShelve.name,
      imageUrl: updatedShelve.imageUrl,
      updatedAt: updatedShelve.updatedAt,
    };

    res.status(200).json({
      status: "success",
      shelve: shelveResponse,
    });
  } catch (error) {
    console.error(`ERROR UPDATING SHELVE IMAGE: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour de l'image du rayon.",
    });
  }
};

const deleteShelve = async (req, res) => {
  try {
    const shelveId = req.headers.shelveid;

    // Vérifiez si le rayon existe
    const existingShelve = await Shelve.findByPk(shelveId);
    console.log(`ID--------${shelveId}`);

    if (!existingShelve) {
      return res.status(404).json({
        status: "error",
        message: "Rayon non trouvé.",
      });
    }

    // Suppression du rayon
    await existingShelve.destroy();

    res.status(200).json({
      status: "success",
      message: "Rayon supprimé avec succès.",
    });
  } catch (error) {
    console.error(`ERROR DELETING SHELVE: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la suppression du rayon.",
    });
  }
};

const countShelves = async (req, res) => {
  try {
    // Compter le nombre total de produits
    const shelveCount = await Shelve.count();

    res.status(200).json({
      status: "success",
      count: shelveCount || 0,
    });
  } catch (error) {
    console.error(`ERROR COUNTING SHELVES: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors du comptage des rayons.",
    });
  }
};

module.exports = {
  createShelve,
  getShelvesList,
  updateShelve,
  updateShelveImage,
  deleteShelve,
  countShelves,
};
