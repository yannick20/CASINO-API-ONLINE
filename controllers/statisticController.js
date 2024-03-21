const { User, Transaction, sequelize, UserSponsoring } = require("../models");
const { Op, fn } = require("sequelize");

const getSubscriberCount = async (req, res) => {
    try {
        const subscriberCount = await User.count();
        return res.status(200).json({
            status: "success",
            count: subscriberCount || 0,
        });
    } catch (error) {
        console.error(
            "Erreur lors de la récupération du nombre d'abonnés :",
            error
        );
        return res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la récupération du nombre d'abonnés.",
        });
    }
};

const getSponsoringAmount = async (req, res) => {
    try {
        const totalAmount = await UserSponsoring.sum("amount");
        return res.status(200).json({
            status: "success",
            count: totalAmount || 0,
        });
    } catch (error) {
        console.error(
            "Erreur lors de la récupération du montant total de parrainnage :",
            error
        );
        return res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la récupération du montant total de parrainnage.",
        });
    }
};

const getUsersCountWithRecentTransactions = async (req, res) => {
    try {
        const currentDate = new Date();
        const threeMonthsAgo = new Date(currentDate);
        threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

        const countUsersWithRecentTransactions = await User.count({
            include: [
                {
                    model: Transaction,
                    as: "transactions",
                    attributes: ["id"],
                    where: {
                        userId: { [Op.eq]: fn("User.id") },
                        createdAt: { [Op.gte]: threeMonthsAgo },
                    },
                    required: true,
                },
            ],
        });

        res.status(200).json({
            status: "success",
            count: countUsersWithRecentTransactions || 0,
        });
    } catch (error) {
        console.error(
            `ERROR GET COUNT USERS WITH RECENT TRANSACTIONS: ${error}`
        );
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la récupération du nombre d'utilisateurs avec des transactions récentes.",
        });
    }
};

const getUsersWithRecentTransactions = async (req, res) => {
    try {
        const currentDate = new Date();
        const threeMonthsAgo = new Date(currentDate);
        threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

        const usersWithRecentTransactions = await User.findAll({
            attributes: ["firstName", "lastName", "phone", "imageUrl"],
            include: [
                {
                    model: Transaction,
                    as: "transactions",
                    attributes: [],
                    where: {
                        createdAt: {
                            [Op.gte]: threeMonthsAgo,
                        },
                    },
                },
            ],
            where: {
                "$transactions.id$": {
                    [Op.not]: null,
                },
            },
        });

        const formattedUsers = usersWithRecentTransactions.map((user) => ({
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            imageUrl: user.imageUrl,
        }));

        res.status(200).json({
            status: "success",
            users: formattedUsers,
        });
    } catch (error) {
        console.error(`ERROR GET USERS WITH RECENT TRANSACTIONS: ${error}`);
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la récupération des utilisateurs avec des transactions récentes.",
        });
    }
};

const getUsersWithoutRecentTransactions = async (req, res) => {
    try {
        const currentDate = new Date();
        const threeMonthsAgo = new Date(currentDate);
        threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

        const usersWithoutRecentTransactions = await User.findAll({
            attributes: ["firstName", "lastName", "phone", "imageUrl"],
            include: [
                {
                    model: Transaction,
                    as: "transactions",
                    attributes: ["id"],
                    where: {
                        userId: { [Op.eq]: fn("User.id") },
                        createdAt: { [Op.gte]: threeMonthsAgo },
                    },
                    required: false,
                },
            ],
            where: {
                "$transactions.id$": { [Op.is]: null },
            },
        });

        const formattedUsers = usersWithoutRecentTransactions.map((user) => ({
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            imageUrl: user.imageUrl,
        }));

        res.status(200).json({
            status: "success",
            users: formattedUsers,
        });
    } catch (error) {
        console.error(`ERROR GET USERS WITHOUT RECENT TRANSACTIONS: ${error}`);
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la récupération des utilisateurs sans transactions récentes.",
        });
    }
};

const getCountUsersWithoutRecentTransactions = async (req, res) => {
    try {
        const currentDate = new Date();
        const threeMonthsAgo = new Date(currentDate);
        threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

        const countUsersWithoutRecentTransactions = await User.count({
            include: [
                {
                    model: Transaction,
                    as: "transactions",
                    attributes: [],
                    where: {
                        createdAt: { [Op.gte]: threeMonthsAgo },
                    },
                    required: false,
                },
            ],
            where: {
                '$transactions.id$': { [Op.is]: null },
            },
        });

        res.status(200).json({
            status: "success",
            count: countUsersWithoutRecentTransactions || 0,
        });
    } catch (error) {
        console.error(
            `ERROR GET COUNT USERS WITHOUT RECENT TRANSACTIONS: ${error}`
        );
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la récupération du nombre d'utilisateurs sans transactions récentes.",
        });
    }
};

const getAverageTicketAmount = async (req, res) => {
    try {
        const averageTicketAmount = await Transaction.findOne({
            attributes: [
                [
                    sequelize.fn("AVG", sequelize.col("ticketAmount")),
                    "averageTicketAmount",
                ],
            ],
        });

        const result = averageTicketAmount.get("averageTicketAmount");

        res.status(200).json({
            status: "success",
            amount: result || 0,
        });
    } catch (error) {
        console.error(`ERROR GET AVERAGE TICKET AMOUNT: ${error}`);
        res.status(500).json({
            status: "error",
            message:
                "Une erreur s'est produite lors de la récupération du montant moyen du ticket d'achat.",
        });
    }
};

module.exports = {
    getSubscriberCount,
    getSponsoringAmount,
    getUsersCountWithRecentTransactions,
    getUsersWithRecentTransactions,
    getUsersWithoutRecentTransactions,
    getCountUsersWithoutRecentTransactions,
    getAverageTicketAmount,
};
