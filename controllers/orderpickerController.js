const bcrypt = require("bcrypt");
const { OrderPicker, Shop } = require("../models");

const createOrderPicker = async (req, res) => {
    try {
        const shopId = req.headers.shopid;
        const { name, phone, email, password } = req.body;
    
    
        if (!shopId) {
            return res.status(401).json({
                status: "error",
                message: "Identifiant de magasin non fourni.",
            });
        }
    
        if (!name) {
            return res.status(401).json({
                status: "error",
                message: "Nom du prépareur de commandes non fourni.",
            });
        }
    
        if (!phone) {
            return res.status(401).json({
                status: "error",
                message: "Numéro de portable du prépareur de commandes non fourni.",
            });
        }
        
        if (!password) {
            return res.status(401).json({
                status: "error",
                message: "Mot de passe du prépareur de commandes non fourni.",
            });
        }
    
        if (password.length < 4) {
            return res.status(401).json({
                status: "error",
                message: "Le mot de passe doit contenir au moins 4 caractères.",
            });
        }
    
        // Vérifier si la boutique existe
        const existingShop = await Shop.findByPk(shopId);
        if (!existingShop) {
            return res.status(404).json({
                status: "error",
                message: "Le magasin n'existe pas.",
            });
        }
    
        // Vérifier si le livreur existe déjà par son nom et son téléphone
        const existingoderPicker = await OrderPicker.findOne({
          where: {
            name: name,
            phone: phone,
            shopId: shopId,
          },
        });
    
        if (existingoderPicker) {
          return res.status(409).json({
            status: "error",
            message: "Ce préparateur de commandes existe déjà.",
          });
        }
    
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Créer le livreur
        const newOrderPicker = await OrderPicker.create({
          name: name,
          phone: phone,
          email: email,
          shopId: shopId,
          password: hashedPassword,
        });
    
        const orderpickerResponse = {
          id: newOrderPicker.id,
          shopId: newOrderPicker.shopId,
          name: newOrderPicker.name,
          phone: newOrderPicker.phone,
          email: newOrderPicker.email,
          createdAt: newOrderPicker.createdAt,
        };
    
        res.status(200).json({
          status: "success",
          orderpicker: orderpickerResponse,
        });
      } catch (error) {
        console.error(`ERROR CREATE ORDER PICKER: ${error}`);
        res.status(500).json({
          status: "error",
          message: "Une erreur s'est produite lors de la création du préparateur de commandes.",
        });
      }
}

const listOrderPicker = async (req, res) => {
    try {
        const shopId = req.headers.shopid;

        // Récupérer la liste de tous les livreurs
        const orderpickerList = await OrderPicker.findAll({
            where: { shopId: shopId },
            attributes: ['id', 'name', 'phone', 'email'],
            order: [['name', 'ASC']],
        });

        res.status(200).json({
            status: 'success',
            orderpicker: orderpickerList,
        });
    } catch (error) {
    console.error(`ERROR LIST ORDER PICKER: ${error}`);
        res.status(500).json({
            status: 'error',
            message: "Une erreur s'est produite lors de la récupération de la liste des preparateurs de commandes.",
        });
    }
};

const deleteOrderPicker = async (req, res) => {
    try {
      const orderpickerId = req.headers.orderpickerid;
  
      // Vérifier si le preparateur de commandes existe
      const existingOrderPicker = await OrderPicker.findByPk(orderpickerId);
  
      if (!existingOrderPicker) {
        return res.status(404).json({
          status: "error",
          message: "Preparateur de commandes non trouvé.",
        });
      }
  
      // Supprimer le livreur
      await existingOrderPicker.destroy();
  
      res.status(200).json({
        status: "success",
        message: "Ce préparateur de commandes supprimé avec succès.",
      });
    } catch (error) {
    console.error(`ERROR DELETE ORDER PICKER: ${error}`);
      res.status(500).json({
        status: "error",
        message: "Une erreur s'est produite lors de la suppression du preparateur de commandes.",
      });
    }
  };

  module.exports = {
    createOrderPicker,
    listOrderPicker,
    deleteOrderPicker,
  }