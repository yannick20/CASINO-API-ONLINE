const { SettingSponsoring, User } = require("../models");

const updateGodfatherAmount = async (req, res) => {
  const { amount } = req.body;
  try {
    if (!amount) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le montant du parrain.",
      });
    }

    // Récupérer la valeur actuelle de godsonAmount
    let setting = await SettingSponsoring.findByPk(1);

    // Vérifier si setting existe
    if (!setting) {
      setting = await SettingSponsoring.create({ godsonAmount: 0, godfatherAmount: 0 });
    }

    const currentGodsonAmount = setting.godsonAmount;

    // Mettre à jour godfatherAmount
    setting.godfatherAmount = amount;
    await setting.save();

    // Réaffecter la valeur actuelle de godsonAmount
    setting.godsonAmount = currentGodsonAmount;
    await setting.save();

    res.status(200).json({
      status: "success",
      message: "Le montant du parrain a été mis à jour avec succès.",
    });
  } catch (error) {
    console.error(`ERROR GODFATHER AMOUNT: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour du montant du parrain.",
    });
  }
};

const getGodfatherAmount = async (req, res) => {
  try {
    const setting = await SettingSponsoring.findByPk(1);
    res.status(200).json({
      status: "success",
      amount: setting.godfatherAmount,
    });
  } catch (error) {
    console.error(`ERROR GODFATHER AMOUNT: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour du montant du parrain.",
    });
  }
};

const updateGodSonAmount = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le montant du fils du parrain.",
      });
    }

    // Récupérer la valeur actuelle de godfatherAmount
    let setting = await SettingSponsoring.findByPk(1);

    // Vérifier si setting existe
    if (!setting) {
      setting = await SettingSponsoring.create({ godsonAmount: 0, godfatherAmount: 0 });
    }

    const currentGodfatherAmount = setting.godfatherAmount;

    // Mettre à jour godsonAmount
    setting.godsonAmount = amount;
    await setting.save();

    // Réaffecter la valeur actuelle de godfatherAmount
    setting.godfatherAmount = currentGodfatherAmount;
    await setting.save();

    res.status(200).json({
      status: "success",
      message: "Le montant du fils du parrain a été mis à jour avec succès.",
    });
  } catch (error) {
    console.error(`ERROR GODSON AMOUNT: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour du montant du fils du parrain.",
    });
  }
};

const getGodSonAmount = async (req, res) => {
  try {
    const setting = await SettingSponsoring.findByPk(1);
    res.status(200).json({
      status: "success",
      amount: setting.godsonAmount,
    });
  } catch (error) {
    console.error(`ERROR GODSON AMOUNT: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour du montant du fils du parrain.",
    });
  }
};

module.exports = {
  updateGodfatherAmount,
  getGodfatherAmount,
  updateGodSonAmount,
  getGodSonAmount,
};
