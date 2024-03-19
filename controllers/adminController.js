const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin, AdminAutorization, User, Cashback } = require('../models');

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({
            where: { email },
            include: [{ model: AdminAutorization, as: 'adminautorization' }]
        });

        if (!admin) {
            return res.status(409).json({
                status: "error",
                message: "Adresse email non enregistrée ou incorrecte. Veuillez réessayer.",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: "error",
                message: "Mot de passe incorrect. Veuillez réessayer.",
            });
        }

        const token = jwt.sign({ id: admin.id }, "EyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcxMDc3Mz");

        const adminResponse = {
            email: admin.email,
            token: token,
            permissions: {
                gestion: admin.adminautorization.gestion,
                rapport: admin.adminautorization.rapport,
                factures: admin.adminautorization.factures,
                promotion: admin.adminautorization.promotion,
                bonAchat: admin.adminautorization.bonAchat,
                parametre: admin.adminautorization.parametre,
                utilisateur: admin.adminautorization.utilisateur
            }
        };

        res.status(200).json({
            status: "success",
            admin: adminResponse
        })
    } catch (error) {
        console.error(`ERROR LOGIN: ${error}`);
        res.status(500).json({
            status: "error",
            message: "Une erreur s'est produite lors de la connexion.",
        })
    }
};

const createAdmin = async (req, res) => {
    const { firstName, lastName, email, phone, password, gestion, rapport, factures, promotion, bonAchat, parametre, utilisateur } = req.body;

    try {
       
        if (!firstName) {
            return res.status(409).json({
                status: "error",
                message: "Le nom est obligatoire.",
            });
        }
        if (!lastName) {
            return res.status(409).json({
                status: "error",
                message: "Le prénom est obligatoire.",
            });
        }
        if (!email) {
            return res.status(409).json({
                status: "error",
                message: "L'email est obligatoire.",
            });
        }
        if (password.length < 6) {
            return res.status(409).json({
                status: "error",
                message: "Le mot de passe doit contenir au moins 6 caractères.",
            });
        }
        
         // Vérification de l'existence de l'administrateur
         const existingAdmin = await Admin.findOne({ where: { email } });
         if (existingAdmin) {
             return res.status(409).json({
                 status: "error",
                 message: "Cet administrateur existe déjà.",
             });
         }

         const existingPhone = await Admin.findOne({ where: { phone } });
         if (existingPhone) {
             return res.status(409).json({
                 status: "error",
                 message: "Un administrateur avec de numéro de portable existe déjà.",
             });
         }

        // Création de l'administrateur
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await Admin.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
        });

        // Création des autorisations associées à l'administrateur
        const adminAuthorization = await AdminAutorization.create({
            adminId: admin.id,
            gestion: gestion | 0,
            rapport: rapport | 0,
            factures: factures | 0,
            promotion: promotion | 0,
            bonAchat: bonAchat | 0,
            parametre: parametre | 0,
            utilisateur: utilisateur | 0,
        });

        res.status(201).json({
            status: "success",
            admin: {
                id: admin.id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                phone: admin.phone,
                permissions: {
                    gestion: adminAuthorization.gestion,
                    rapport: adminAuthorization.rapport,
                    factures: adminAuthorization.factures,
                    promotion: adminAuthorization.promotion,
                    bonAchat: adminAuthorization.bonAchat,
                    parametre: adminAuthorization.parametre,
                    utilisateur: adminAuthorization.utilisateur
                },
            }
        });
    } catch (error) {
        console.error(`ERROR CREATE ADMIN: ${error}`);
        res.status(500).json({
            status: "error",
            message: "Une erreur s'est produite lors de la création de l'administrateur.",
        });
    }
};


const getUsersFidelityInfos = async (req, res) => {
try {
    const users = await User.findAll({
    include: [
        {
        model: Cashback,
        as: "cashback",
        },
    ],
    order: [
        ["lastname", "ASC"],
    ]
    });

    const usersFidelityInfos = users.map((user) => ({
    firstname: user.firstName,
    lastname: user.lastName,
    phone: user.phone,
    cashbackAmount: user.cashback.amount,
    }));

    res.status(200).json({
    status: "success",
    users: usersFidelityInfos,
    });
    
} catch (error) {
    console.error(`ERROR GET USER CASHBACK INFORMATION: ${error}`);
    res.status(500).json({
    status: "error",
    message:
        "Une erreur s'est produite lors de la recuperation des informations des utilisateurs.",
    })
}
}

const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll({
            include: [
                {
                model: AdminAutorization,
                as: "adminautorization",
                },
            ],
        });
        
        const administrators = admins.map((admin) => ({
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            phone: admin.phone,
            permissions: {
                gestion: admin.adminautorization.gestion,
                rapport: admin.adminautorization.rapport,
                factures: admin.adminautorization.factures,
                promotion: admin.adminautorization.promotion,
                bonAchat: admin.adminautorization.bonAchat,
                parametre: admin.adminautorization.parametre,
                utilisateur: admin.adminautorization.utilisateur
            }
        }));

        res.status(200).json({
            status: "success",
            admins: administrators,
        });
        
    } catch (error) {
        console.error(`ERROR GET ALL ADMINS: ${error}`);
        res.status(500).json({
            status: "error",
            message: "Une erreur s'est produite lors de la recuperation de tous les administrateurs.",
        });
    }
}

module.exports = { login, createAdmin, getUsersFidelityInfos, getAllAdmins };