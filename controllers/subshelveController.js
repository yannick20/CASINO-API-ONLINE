const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");
const { Shop, SubShelve, Shelve } = require("../models");

const createSubShelve = async (req, res) => {
  try {
    const shopId = req.headers.shopid;
    const shelveId = req.headers.shelveid;
    const { name } = req.body;

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

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Nom du sous-rayon manquant.",
      });
    }

    // Vérifier si la boutique  existe
    const existingShop = await Shop.findByPk(shopId);

    if (!existingShop) {
      return res.status(404).json({
        status: "error",
        message: "Boutique non trouvé.",
      });
    }

    // Vérifier si le rayon (Shelve) existe
    const existingShelve = await Shelve.findByPk(shelveId);

    if (!existingShelve) {
      return res.status(404).json({
        status: "error",
        message: "Rayon non trouvé.",
      });
    }
    // Vérifier si le sous-rayon existe déjà pour le même rayon
    const existingSubShelve = await SubShelve.findOne({
      where: {
        ShelveId: shelveId,
        name,
      },
    });
    if (existingSubShelve) {
      return res.status(409).json({
        status: "error",
        message: "Un sous-rayon avec le même nom existe déjà pour ce rayon.",
      });
    }

    // Utilisation de Sharp pour redimensionner l'image à 250x250
    const resizedImagePath = path.join(
      __dirname,
      "..",
      "public/uploads/subshelves",
      `resized_${req.file.filename}`
    );
    const resizedImageDirectory = path.dirname(resizedImagePath);

    // Crée le répertoire s'il n'existe pas
    if (!fs.existsSync(resizedImageDirectory)) {
      fs.mkdirSync(resizedImageDirectory, { recursive: true });
    }

    await sharp(req.file.path).resize(250, 250).toFile(resizedImagePath);

    // Créer le sous-rayon
    const newSubShelve = await SubShelve.create({
      shopId: shopId,
      shelveId: shelveId,
      name,
      imageUrl: req.file
        ? `${req.protocol}://${req.get("host")}/uploads/subshelves/resized_${
            req.file.filename
          }`
        : null,
    });

    const subShelveResponse = {
      id: newSubShelve.id,
      shopId: newSubShelve.shopId,
      shelveId: newSubShelve.shelveId,
      name: newSubShelve.name,
      imageUrl: newSubShelve.imageUrl,
      createdAt: newSubShelve.createdAt,
    };

    res.status(200).json({
      status: "success",
      subShelve: subShelveResponse,
    });
  } catch (error) {
    console.error(`ERROR CREATING SUBSHELVE: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Erreur lors de la création du sous-rayon.",
    });
  }
};

const updateSubShelveName = async (req, res) => {
  try {
    const subShelveId = req.headers.subshelveid;
    const shopId = req.headers.shopid;
    const shelveId = req.headers.shelveid;
    const { name } = req.body;

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

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Nom du sous-rayon manquant.",
      });
    }

    // Vérifier si la boutique existe
    const existingShop = await Shop.findByPk(shopId);

    if (!existingShop) {
      return res.status(404).json({
        status: "error",
        message: "Boutique non trouvée.",
      });
    }

    // Vérifier si le rayon (Shelve) existe
    const existingShelve = await Shelve.findByPk(shelveId);

    if (!existingShelve) {
      return res.status(404).json({
        status: "error",
        message: "Rayon non trouvé.",
      });
    }

    // Vérifier si le sous-rayon existe
    const existingSubShelve = await SubShelve.findByPk(subShelveId);

    if (!existingSubShelve) {
      return res.status(404).json({
        status: "error",
        message: "Sous-rayon non trouvé.",
      });
    }

    // Vérifier si le nouveau nom est déjà utilisé pour le même rayon et sous-rayon dans la même boutique
    const otherSubShelveWithSameName = await SubShelve.findOne({
      where: {
        name: name,
        ShelveId: existingShelve.id,
        shopId: existingShop.id,
        id: { [Op.not]: subShelveId }, // Exclure le sous-rayon actuel de la recherche
      },
    });

    if (otherSubShelveWithSameName) {
      return res.status(409).json({
        status: "error",
        message:
          "Un autre sous-rayon avec le même nom existe déjà pour ce rayon et cette boutique.",
      });
    }

    // Mise à jour du nom du sous-rayon
    await existingSubShelve.update({
      name: name,
    });

    const subShelveResponse = {
      id: existingSubShelve.id,
      name: name,
      shopId: existingSubShelve.shopId,
      shelveId: existingSubShelve.shelveId,
      createdAt: existingSubShelve.createdAt,
    };

    res.status(200).json({
      status: "success",
      subShelve: subShelveResponse,
    });
  } catch (error) {
    console.error(`ERROR UPDATING SUBSHELVE: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour du sous-rayon.",
    });
  }
};

const getSubShelvesList = async (req, res) => {
  try {
    const shopId = req.headers.shopid;
    const shelveId = req.headers.shelveid;

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

    // Vérifiez si la boutique, le rayon existent
    const existingShop = await Shop.findByPk(shopId);
    const existingShelve = await Shelve.findByPk(shelveId);

    if (!existingShop) {
      return res.status(404).json({
        status: "error",
        message: "Boutique non trouvée.",
      });
    }

    if (!existingShelve) {
      return res.status(404).json({
        status: "error",
        message: "Rayon non trouvé.",
      });
    }

    // Récupérez les sous-rayons en fonction de l'ID de la boutique et du rayon
    const sousRayons = await SubShelve.findByShopAndShelve(shopId, shelveId, {
      order: [["name", "ASC"]],
    });

    // Formatez les données pour la réponse
    const listeSousRayons = sousRayons.map((sousRayon) => ({
      id: sousRayon.id,
      shopId: sousRayon.shopId,
      shelveId: sousRayon.shelveId,
      name: sousRayon.name,
      imageUrl: sousRayon.imageUrl,
      createdAt: sousRayon.createdAt,
    }),);

    res.status(200).json({
      status: "success",
      subShelves: listeSousRayons,
    });
  } catch (error) {
    console.error(`ERROR GETTING SUBSHELVES LIST: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la récupération de la liste des sous-rayons.",
    });
  }
};

const deleteSubShelve = async (req, res) => {
  try {
    const subShelveId = req.headers.subshelveid;

    // Vérifiez si le sous-rayon existe
    const existingSubShelve = await SubShelve.findByPk(subShelveId);

    if (!existingSubShelve) {
      return res.status(404).json({
        status: "error",
        message: "Sous-rayon non trouvé.",
      });
    }

    // Suppression du sous-rayon
    await existingSubShelve.destroy();

    res.status(200).json({
      status: "success",
      message: "Sous-rayon supprimé avec succès.",
    });
  } catch (error) {
    console.error(`ERROR DELETING SUBSHELVE: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la suppression du sous-rayon.",
    });
  }
};

const updateSubShelveImage = async (req, res) => {
  try {
    const { subShelveId } = req.body;

    // Vérifiez si le sous-rayon existe
    const existingSubShelve = await SubShelve.findByPk(subShelveId);

    if (!existingSubShelve) {
      return res.status(404).json({
        status: "error",
        message: "Sous-rayon non trouvé.",
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
      "public/uploads/subshelves",
      `resized_${req.file.filename}`
    );

    await sharp(req.file.path).resize(250, 250).toFile(resizedImagePath);

    const newImageUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/subshelves/resized_${req.file.filename}`;

    // Mise à jour de l'image du sous-rayon
    const updatedSubShelve = await existingSubShelve.update({
      imageUrl: newImageUrl,
    });

    const subShelveResponse = {
      name: updatedSubShelve.name,
      imageUrl: updatedSubShelve.imageUrl,
      updatedAt: updatedSubShelve.updatedAt,
    };

    res.status(200).json({
      status: "success",
      subShelve: subShelveResponse,
    });
  } catch (error) {
    console.error(`ERROR UPDATING SUBSHELVE IMAGE: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour de l'image du sous-rayon.",
    });
  }
};

const countSubShelve = async (req, res) => {
  try {
    // Compter le nombre total de sous-rayons
    const subShelveCount = await SubShelve.count();

    res.status(200).json({
      status: "success",
      count: subShelveCount || 0,
    });
  } catch (error) {
    console.error(`ERROR COUNTING SOUS-RAYONS: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors du comptage des sous-rayons.",
    });
  }
};

module.exports = {
  createSubShelve,
  updateSubShelveName,
  getSubShelvesList,
  deleteSubShelve,
  updateSubShelveImage,
  countSubShelve,
};
