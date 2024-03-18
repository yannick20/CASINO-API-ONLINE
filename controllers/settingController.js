const { Setting } = require("../models");

const updateCashbackAmount = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({
                status: "error",
                message: "Veuillez fournir le montant du cashback.",
            });
        }

        const setting = await Setting.findByPk(1);

        if (!setting) {
            setting = await Setting.create({ cashbackAmount: 0 });
        }

        setting.cashbackAmount = amount;

        await setting.save();
        res.status(200).json({
            status: "success",
            message: "Le montant du cashback a été mis à jour avec succès.",
        });
    } catch (error) {
        console.error(`ERROR UPDATE CASHBACK AMOUNT: ${error}`);
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la mise à jour du montant du cashback.",
        });
    }
};

const getCashbackAmount = async (req, res) => {
    try {
        const setting = await Setting.findByPk(1);
        if (!setting) {
            setting = await Setting.create({ cashbackAmount: 0 });
        }

        const amount = setting.cashbackAmount;

        res.status(200).json({
            status: "success",
            amount: amount,
        });
    } catch (error) {
        console.error(`ERROR GET CASHBACK AMOUNT: ${error}`);
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la recuperation du montant du cashback.",
        });
    }
};

const updateVoucherDurate = async (req, res) => {
    try {
        const { durate } = req.body;

        if (!durate) {
            return res.status(400).json({
                status: "error",
                message: "Veuillez fournir la durée du cashback.",
            });
        }

        if (durate < 1) {
            return res.status(400).json({
                status: "error",
                message: "La durée du cashback doit être supérieure à 0.",
            });
        }

        const setting = await Setting.findByPk(1);

        if (!setting) {
            setting = await Setting.create({ voucherDurate: 30 });
        }

        setting.voucherDurate = durate;

        await setting.save();
        res.status(200).json({
            status: "success",
            message: `La durée du cashback a été mis à jour avec succès pour une duree de ${durate} jours.`,
        });
    } catch (error) {
        console.error(`ERROR UPDATE CASHBACK DURATE: ${error}`);
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la mise à jour de la durée du cashback.",
        });
    }
};

const getVoucherDurate = async (req, res) => {
    try {
        const setting = await Setting.findByPk(1);
        if (!setting) {
            setting = await Setting.create({ voucherDurate: 0 });
        }

        const durate = setting.voucherDurate;

        res.status(200).json({
            status: "success",
            durate: durate,
        });
    } catch (error) {
        console.error(`ERROR GET CASHBACK DURATE: ${error}`);
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la recuperation de la durée.",
        });
    }
};

const updateVoucherAmountMin = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({
                status: "error",
                message:
                    "Veuillez fournir un montant minimal pour le parrainage.",
            });
        }

        const setting = await Setting.findByPk(1);

        if (!setting) {
            setting = await Setting.create({ voucherAmountMin: 0 });
        }

        setting.voucherAmountMin = amount;
        await setting.save();

        res.status(200).json({
            status: "success",
            message:
                "Le montant minimal du cashback a été mis à jour avec succès.",
        });
    } catch (error) {
        console.error(`ERROR UPDATE CASHBACK AMOUNT MIN: ${error}`);
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la mise à jour du montant minimal du parrainage.",
        });
    }
};

const getVoucherAmountMin = async (req, res) => {
    try {
        const setting = await Setting.findByPk(1);
        if (!setting) {
            setting = await Setting.create({ voucherAmountMin: 0 });
        }

        const amount = setting.voucherAmountMin;

        res.status(200).json({
            status: "success",
            amount: amount,
        });
    } catch (error) {
        console.error(`ERROR GET VOUCHER AMOUNT MIN: ${error}`);
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la recuperation du montant minimal.",
        });
    }
};

const updateVoucherDay = async (req, res) => {
    try {
        const { durate } = req.body;

        if (!durate) {
            return res.status(400).json({
                status: "error",
                message:
                    "Veuillez fournir le nombre de jours pour la validation du parrainage.",
            });
        }

        const setting = await Setting.findByPk(1);

        if (!setting) {
            setting = await Setting.create({ voucherDay: 10 });
        }

        setting.voucherDay = durate;
        await setting.save();

        res.status(200).json({
            status: "success",
            message:
                "Le nombre de jours pour la validation du parrainage a été mis à jour avec succès.",
        });
    } catch (error) {
        console.error(`ERROR UPDATE REFERAL DAY MIN: ${error}`);
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la mise à jour du nombre de jours pour la validation du parrainage.",
        });
    }
};

const getVoucherDay = async (req, res) => {
    try {
        const setting = await Setting.findByPk(1);
        if (!setting) {
            setting = await Setting.create({ voucherDay: 10 });
        }

        const durate = setting.voucherDay;

        res.status(200).json({
            status: "success",
            durate: durate,
        });
    } catch (error) {
        console.error(`ERROR GET VOUCHER AMOUNT MIN: ${error}`);
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la recuperation du montant minimal.",
        });
    }
};

module.exports = {
    updateCashbackAmount,
    getCashbackAmount,
    updateVoucherDurate,
    updateVoucherAmountMin,
    getVoucherDurate,
    getVoucherAmountMin,
    updateVoucherDay,
    getVoucherDay,
};
