const { Shop } = require("../models");

// Create shop
const createShop = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(401)
        .json({ status: "error", message: "Nom de la boutique non fourni." });
    }

    const existingShopName = await Shop.findOne({ where: { name } });
    if (existingShopName) {
      return res
        .status(409)
        .json({
          status: "error",
          message: "Une boutique avec ce nom existe déjà.",
        });
    }

    const newShop = await Shop.create({ name });

    await newShop.save();

    const id = newShop.id;
    const nameShop = newShop.name;
    const responseShop = { id, nameShop };

    res.status(200).json({ status: "success", shop: responseShop });
  } catch (error) {
    console.error(`ERROR SHOP CREATION: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la création de la boutique.",
    });
  }
};

// Update shop name
const updateShop = async (req, res) => {
  try {
    const { id, name } = req.body;

    if (!name) {
      return res
        .status(401)
        .json({ status: "error", message: "Nom de la boutique non fourni." });
    }

    const shop = await Shop.findByPk(id);
    if (!shop) {
      return res.status(409).json({
        status: "error",
        message: "Boutique non trouvé.",
      });
    }
    // Check if name already exists in database before updating
    const existingName = await Shop.findOne({ where: { name } });
    if (existingName) {
      return res
        .status(409)
        .json({
          status: "error",
          message: "Ce nom existe déjà dans la base de données.",
        });
    }

    shop.name = name;
    await shop.save();

    res.status(200).json({
      status: "success",
      message: "La boutique à été mise à jours avec succès.",
    });
  } catch (error) {
    console.error(`ERROR SHOP UPDATE: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jours de la boutique.",
    });
  }
};

// Delete shop by Id
const deleteShop = async (req, res) => {
  const idShop = req.headers.shopid;
  try {
    const shop = await Shop.findByPk(idShop);
    if (!shop) {
      return res
        .status(404)
        .json({ status: "error", message: "Boutique non trouvé." });
    }

    shop.destroy();
    res.status(200).json({
      status: "success",
      message: "La boutique à été supprimé avec succès.",
    });
  } catch (error) {
    console.error(`ERROR SHOP DELETE: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la suppéssion de la boutique.",
    });
  }
};

// Get list of all shop order by created date
const allShop = async (req, res) => {
  try {
    // List all shops name and id order by name
    const shops = await Shop.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    // check if shops exist
    if (shops.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Aucune boutique trouvée.",
      });
    }
    // send list of shops with status 200 and success message
    res.status(200).json({
      status: "success",
      shops: shops,
    });
  } catch (error) {
    console.error(`ERROR SHOP LIST ALL: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la suppéssion de la boutique.",
    });
  }
};

const countShops = async (req, res) => {
  try {
    // Compter le nombre total de produits
    const shopCount = await Shop.count();

    res.status(200).json({
      status: "success",
      count: shopCount || 0,
    });
  } catch (error) {
    console.error(`ERROR COUNTING SHOPS: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors du comptage des boutiques.",
    });
  }
};

module.exports = { createShop, updateShop, deleteShop, allShop, countShops };
