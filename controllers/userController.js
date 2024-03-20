const sharp = require("sharp");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Sequelize, QueryTypes } = require('sequelize');
//const twilio = require("twilio");
const { v4: uuidv4 } = require("uuid");
const {
  User,
  Otp,
  Cashback,
  UserSponsoring,
  SettingSponsoring,
  UserCashback,
  Transaction,
  UserReferral,
} = require("../models");
const accountSid = "ACa1159c8d1faa08ab522ea1705fa55f6f";
const authToken = "de90c1334e51e3d3d32d88dd9e9b074b";
//const twilioClient = new twilio(accountSid, authToken);
const fs = require("fs");
const generatedSponsoringCode = require("../utils/sponsoringUtils");

const sequelizeSecondary = new Sequelize({
  username: "postgres",
  password: "Admin@Casino2024",
  database: "database_casino_old",
  host: "127.0.0.1",
  dialect: "postgres",
  port: 5432
});

const userCheck = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le numéro de portable.",
      });
    }

    const existingUser = await User.findOne({
      where: { phone },
    });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message:
          "Ce numéro de portable est déjà associé à une carte de fidélité. Veuillez vous connecter.",
      });
    }

    // Requête optimisée pour obtenir les détails de l'utilisateur depuis la base de données secondaire
    const [results] = await sequelizeSecondary.query(
      `SELECT c.first_name, c.last_name, ca.montant
       FROM clients c
       INNER JOIN cartes ca ON c.id = ca.client_id
       WHERE c.phone = :phone
       LIMIT 1`,
      {
        replacements: { phone },
        type: QueryTypes.SELECT,
      }
    );

    if (results) {
      const userResponse = {
        firstName: results.first_name,
        lastName: results.last_name,
        amount: results.montant,
      };

      return res.status(200).json({
        status: "success",
        user: userResponse,
      });
    } else {
      return res.status(404).json({
        status: "error",
        message:
          "Cette carte de fidélité n'est plus valide. Veuillez vous inscrire en indiquant ne pas avoir de carte.",
      });
    }
  } catch (error) {
    console.error(`ERROR LOGIN USER: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la connexion à la carte de fidélité.",
    });
  }
};

// Fonction pour envoyer l'OTP via Twilio
async function sendOtpViaTwilio(phone, otp) {
  try {
   /*  await twilioClient.messages
      .create({
        body: `Votre code de vérification est : ${otp}`,
        from: "+13023062887",
        to: "+242" + phone,
      })
      .then((call) => console.log(`SMS RESPONSE: ${call.sid}`));
    console.log(`OTP sent to 044913233`); */
  } catch (error) {
    console.error(`ERROR SENDING OTP VIA TWILIO: ${error}`);
    throw error;
  }
}

// Fonction pour générer un OTP
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Enregistrez les codes dans la base de données avec l'état "non utilisé"
async function storeOtpsInDatabase(phone, otpSms) {
  try {
    await Otp.create({
      phone,
      otpSms,
      isOtpSmsUsed: false,
    });
  } catch (error) {
    console.error(`ERROR STORING OTPS IN DATABASE: ${error}`);
    throw error;
  }
}

// Fonction pour valider les codes côté serveur
async function validateOtps(phone, otpSms) {
  try {
    const user = await Otp.findOne({
      where: {
        phone,
        otpSms,
        isOtpSmsUsed: false,
      },
    });

    if (user) {
      // Marquez les codes comme utilisés
      await user.update({
        isOtpSmsUsed: true,
      });
      return true; // Les codes sont valides et ont été marqués comme utilisés
    } else {
      return false; // Les codes n'existent pas ou ont déjà été utilisés
    }
  } catch (error) {
    console.error(`ERROR VALIDATING OTPS: ${error}`);
    throw error;
  }
}

const validateCode = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Vérifiez si les codes sont valides
    const isValid = await validateOtps(phone, otp);

    if (isValid) {
      return res.status(200).json({
        status: "success",
        message: "Codes validés avec succès.",
      });
    } else {
      return res.status(401).json({
        status: "error",
        message: "Codes invalides ou déjà utilisés. Veuillez réessayer.",
      });
    }
  } catch (error) {
    console.error(`ERROR VALIDATING OTPS: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la validation des codes.",
    });
  }
};

const registerWithAccount = async (req, res) => {
  try {
    const { firstName, lastName, birthday, amount, phone, password } = req.body;

    if (!firstName) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le nom.",
      });
    }

    if (!lastName) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le prénom.",
      });
    }

    if (!phone) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le numéro de portable.",
      });
    }

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le mot de passe.",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        status: "error",
        message: "Le mot de passe doit contenir au moins 4 caractères.",
      });
    }

    const existingUser = await User.findOne({
      where: { phone },
    });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message:
          "Ce numéro de portable est déjà associé à une carte de fidelité.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sponsoringCode = generatedSponsoringCode.generateSponsoringCode();

    const newUser = await User.create({
      firstName,
      lastName,
      birthday: birthday || null,
      phone,
      barcode: uuidv4(),
      password: hashedPassword,
      sponsoringCode: sponsoringCode,
    });

    const cashback = await Cashback.create({
      userId: newUser.id,
      amount: amount || 0,
    });

    await UserSponsoring.create({
      userId: newUser.id,
      sponsoringCode: 0,
    });

    if (!newUser || !cashback) {
      return res.status(500).json({
        status: "error",
        message:
          "Une erreur s'est produite lors de la création de la carte de fidelité.",
      });
    }

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET);

    const userResponse = {
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      birthday: newUser.birthday,
      phone: newUser.phone,
      barcode: newUser.barcode,
      sponsoringCode: newUser.sponsoringCode,
      imageUrl: newUser.imageUrl,
      whatsapp: newUser.isWhatsapp,
      token: token,
    };

    await UserCashback.create({
      userId: newUser.id,
      amount: 5000,
    });

    return res.status(201).json({
      status: "success",
      user: userResponse,
    });
  } catch (error) {
    console.error(`ERROR REGISTER WITH ACCOUNT USER: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la création de la carte de fidelité.",
    });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    // Vérifie si l'en-tête commence par "Bearer "
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Format de token invalide.",
      });
    }

    // Extrait le token en supprimant le préfixe "Bearer "
    const userToken = token.substring(7);
    let decodedToken;

    try {
      decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }

    const userId = decodedToken.id;

    // Vérifier si l'utilisateur existe dans la base de données en utilisant son ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Utilisateur non trouvé." });
    }

    // Utilisation de Sharp pour redimensionner l'image à 200x200
    const resizedImageFilename = `${Date.now()}_resized${path.extname(
      req.file.filename
    )}`;
    const resizedImagePath = path.join(
      __dirname,
      "..",
      "public/profiles/",
      resizedImageFilename
    );

    // Crée le répertoire s'il n'existe pas
    const resizedImageDirectory = path.dirname(resizedImagePath);
    if (!fs.existsSync(resizedImageDirectory)) {
      fs.mkdirSync(resizedImageDirectory, { recursive: true });
    }

    await sharp(req.file.path).resize(350, 350).toFile(resizedImagePath);

    // Mettre à jour le lien complet de l'image de profil dans la base de données
    const profileImageUrl = `${req.protocol}://${req.get(
      "host"
    )}/profiles/${resizedImageFilename}`;
    user.imageUrl = profileImageUrl; // Sauvegarde l'URL complète dans le champ 'imageUrl'
    await user.save();

    // Supprimer le fichier d'origine après la mise à jour
    fs.unlinkSync(req.file.path);

    res.json({
      status: "success",
      message: "Image de profil mise à jour avec succès.",
      profileImageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur est survenue lors de la mise à jour de l'image de profil.",
    });
  }
};

const registerWithoutAccount = async (req, res) => {
  try {
    const {
      phone,
      firstName,
      lastName,
      birthday,
      sponsorCode,
      isWhatsapp,
      password,
    } = req.body;

    if (!firstName) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le nom.",
      });
    }

    if (!lastName) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le prénom.",
      });
    }

    if (!phone) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le numéro de portable.",
      });
    }

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le mot de passe.",
      });
    }

    // Validation de la longueur du mot de passe
    if (password.length < 4) {
      return res.status(400).json({
        status: "error",
        message: "Le mot de passe doit contenir au moins 4 caractères.",
      });
    }

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { phone } });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message:
          "Ce numéro de portable est déjà associé à une carte de fidélité.",
      });
    }

    // Vérification de la longueur du code de parrainage
    if (sponsorCode && sponsorCode.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Le code de parrainage doit contenir au moins 6 caractères.",
      });
    }

    const [results] = await sequelizeSecondary.query(
      `SELECT c.first_name, c.last_name, ca.montant FROM clients c INNER JOIN cartes ca ON c.id = ca.client_id WHERE c.phone = :phone LIMIT 1`,
      {
        replacements: { phone },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (results) {
      return res.status(409).json({
        status: "error",
        message:
          "Ce numéro de portable est déjà associé à une carte de fidélité. Veuillez vous connecter en indiquant que vous possédez déjà une carte de fidélité.",
      });
    }

    let sponsorId = null;

    if (sponsorCode) {
      const sponsor = await User.findOne({
        where: { sponsoringCode: sponsorCode },
      });

      if (!sponsor) {
        return res.status(400).json({
          status: "error",
          message: "Le code de parrainage est incorrect.",
        });
      }

      sponsorId = sponsor.id;
    }
    // Création d'un nouveau code de parrainage s'il n'est pas fourni
    const mySponsorCode = generatedSponsoringCode.generateSponsoringCode();
    const hashedpassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const user = await User.create({
      phone: phone,
      firstName: firstName,
      lastName: lastName,
      password: hashedpassword,
      barcode: uuidv4(),
      isWhatsapp: isWhatsapp === null ? false : isWhatsapp,
      birthday: birthday || null,
      sponsoringCode: mySponsorCode,
    });

    await UserCashback.create({
      userId: user.id,
      amount: 5000,
    });

    if (sponsorCode) {
      await UserReferral.create({
        referredId: user.id,
        referrerId: sponsorId,
        amount: 0,
      });
    }

    await UserSponsoring.create({
      userId: user.id,
      amount: 0,
    });

    await Cashback.create({
      userId: user.id,
      amount: 0,
    });

    // Génération du token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    // Réponse avec les détails de l'utilisateur
    const userResponse = {
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday,
      phone: user.phone,
      barcode: user.barcode,
      sponsoringCode: user.sponsoringCode,
      imageUrl: user.imageUrl,
      whatsapp: user.isWhatsapp,
      token: token,
    };

    res.status(201).json({
      status: "success",
      user: userResponse,
    });
  } catch (error) {
    console.error(`ERROR REGISTER WITHOUT ACCOUNT USER: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la création de la carte de fidelité.",
    });
  }
};

const checkCode = async (req, res) => {
  try {
    const { sponsoringCode } = req.body;

    if (!sponsoringCode) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir un code de parrainage.",
      });
    }

    const isSponsoringCodeValid = await checkSponsoringCode(sponsoringCode);

    if (isSponsoringCodeValid) {
      return res.status(200).json({
        status: "success",
        message: "Le code de parrainage est valide.",
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Aucun utilisateur trouvé avec ce code de parrainage.",
      });
    }
  } catch (error) {
    console.error(`Error handling sponsoring code check: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la vérification du code de parrainage.",
    });
  }
};

const checkSponsoringCode = async (sponsoringCode) => {
  try {
    const existingUser = await User.findOne({
      where: { sponsoringCode },
    });

    return existingUser !== null;
  } catch (error) {
    console.error(`Error checking sponsoring code: ${error}`);
    throw error;
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone) {
      return res.status(401).json({
        status: "error",
        message: "Numéro de portable non fourni.",
      });
    }

    if (!password) {
      return res.status(401).json({
        status: "error",
        message: "Mot de passe non fourni.",
      });
    }

    if (password.length < 4) {
      return res.status(401).json({
        status: "error",
        message: "Le mot de passe doit contenir au moins 6 caractères.",
      });
    }

    // Vérifiez si l'utilisateur existe dans la base de données en utilisant le numéro de téléphone
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      // Si l'utilisateur n'existe pas, demandez de créer un compte
      return res.status(401).json({
        status: "error",
        message:
          "Numéro de téléphone non enregistré. Veuillez créer un compte.",
      });
    }

    // Vérifiez si le mot de passe est valide
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Numéro de téléphone ou mot de passe incorrect.",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

    const userCashback = await Cashback.findOne({
      where: { userId: user.id },
    });

    const cashbackAmount = userCashback.amount;

    const userResponse = {
      firstName: user.firstName,
      lastName: user.lastName,
      birthday: user.birthday,
      phone: user.phone,
      barcode: user.barcode,
      sponsoringCode: user.sponsoringCode,
      imageUrl: user.imageUrl,
      cashback: cashbackAmount,
      whatsapp: user.isWhatsapp,
      token: token,
    };

    res.status(200).json({
      status: "success",
      user: userResponse,
    });
  } catch (error) {
    console.error(`Error login: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la connexion.",
    });
  }
};

const list = async (req, res) => {
  try {
    const users = await User.findAll();

    const userResponse = users.map((user) => {
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        birthday: user.birthday,
        phone: user.phone,
        barcode: user.barcode,
        sponsoringCode: user.sponsoringCode,
        imageUrl: user.imageUrl,
        cashback: user.cashback,
        whatsapp: user.isWhatsapp,
      };
    });
    res.status(200).json({
      status: "success",
      users: userResponse,
    });
  } catch (error) {
    console.error(`Error listing users: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la recuperation de tous les utilisateurs.",
    });
  }
};

const getCashback = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    // Vérifiez si l'en-tête commence par "Bearer "
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Format de token invalide.",
      });
    }
    // Extrait le token en supprimant le préfixe "Bearer "
    const userToken = token.substring(7);
    let decodedToken;
    try {
      decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }
    const userId = decodedToken.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Utilisateur non trouvé." });
    }

    const userCashback = await Cashback.findOne({
      where: { userId: user.id },
    });

    const cashbackAmount = userCashback.amount;

    res.status(200).json({
      status: "success",
      cashback: cashbackAmount,
    });
  } catch (error) {
    console.error(`Error getting user cashback: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la recuperation du cashback de l'utilisateur.",
    });
  }
};

const updateCashbackLimit = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { amount } = req.body;

    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    if (!amount) {
      return res
        .status(401)
        .json({ status: "error", message: "Montant non fourni." });
    }
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Format de token invalide.",
      });
    }
    const userToken = token.substring(7);
    let decodedToken;
    try {
      decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }
    const userId = decodedToken.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Utilisateur non trouvé." });
    }
    const userCashback = await UserCashback.findOne({
      where: { userId: user.id },
    });

    if (!userCashback) {
      await UserCashback.create({
        userId: user.id,
        amount: amount,
      });
      return res.status(200).json({
        status: "success",
        message: "Cashback creé avec succes.",
      });
    }

    userCashback.amount = amount;

    await userCashback.save();

    res.status(200).json({
      status: "success",
      message: "Cashback mis à jour avec succes.",
    });
  } catch (error) {
    console.error(`Error updating cashback user: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la mise à jour du cashback.",
    });
  }
};

const getCashbackLimit = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    // Vérifiez si l'en-tête commence par "Bearer "
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Format de token invalide.",
      });
    }
    // Extrait le token en supprimant le préfixe "Bearer "
    const userToken = token.substring(7);
    let decodedToken;
    try {
      decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }
    const userId = decodedToken.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Utilisateur non trouvé." });
    }

    const userCashback = await UserCashback.findOne({
      where: { userId: user.id },
    });

    const cashbackAmount = userCashback.amount;

    res.status(200).json({
      status: "success",
      cashback: cashbackAmount,
    });
  } catch (error) {
    console.error(`Error getting user cashback limit: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la recuperation du cashback de l'utilisateur.",
    });
  }
};

const getSponsoringAmount = async (req, res) => {
  try {
    const setting = await SettingSponsoring.findByPk(1);
    const godsonAmount = setting ? setting.godsonAmount : 0;
    const godfatherAmount = setting ? setting.godfatherAmount : 0;

    const response = {
      godsonAmount: godsonAmount,
      godfatherAmount: godfatherAmount,
    };

    res.status(200).json({
      status: "success",
      data: response,
    });
  } catch (error) {
    console.error(`Error getting refferral amount: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la recuperation des montant de parrainage des utilisateurs.",
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    // Vérifiez si l'en-tête commence par "Bearer "
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Format de token invalide.",
      });
    }
    // Extrait le token en supprimant le préfixe "Bearer "
    const userToken = token.substring(7);
    let decodedToken;
    try {
      decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }
    const userId = decodedToken.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Utilisateur non trouvé." });
    }

    const transaction = await Transaction.findAll({
      where: { userId: user.id },
    });

    const transactionsResponse = transaction.map((transaction) => ({
      id: transaction.id,
      ticketNumber: transaction.ticketNumber,
      ticketNumber: transaction.ticketNumber,
      ticketAmount: transaction.ticketAmount,
      ticketCashback: transaction.ticketCashback,
    }));

    res.status(200).json({
      status: "success",
      transactions: transactionsResponse,
    });
  } catch (error) {
    console.error(`Error getting user transaction: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la recuperation des transactions de l'utilisateur.",
    });
  }
};

const getSponsoredUsers = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    if (!token.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: "error", message: "Format de token invalide." });
    }

    const userToken = token.substring(7);
    let decodedToken;

    try {
      decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }

    const sponsorId = decodedToken.id;

    const sponsoredUsers = await UserReferral.findAll({
      where: {
        referrerId: sponsorId,
      },
      include: [
        {
          model: User,
          as: "referreduser",
          attributes: ["firstName", "lastName", "amount"],
        },
      ],
    });

    if (!sponsoredUsers || sponsoredUsers.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Aucun utilisateur parrainé n'a été trouvé.",
      });
    }

    const usersResponse = sponsoredUsers.map((referral) => ({
      firstName: referral.referreduser.firstName,
      lastName: referral.referreduser.lastName,
      amount: referral.referreduser.amount,
    }));

    res.status(200).json({
      status: "success",
      users: usersResponse,
    });
  } catch (error) {
    console.error(`ERROR GET SPONSORED USERS: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la récupération des utilisateurs parrainés.",
    });
  }
};

const userVoucher = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    // Vérifie si l'en-tête commence par "Bearer "
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Format de token invalide.",
      });
    }

    // Extrait le token en supprimant le préfixe "Bearer "
    const userToken = token.substring(7);
    let decodedToken;

    try {
      decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }

    const userId = decodedToken.id;

    const userWithVoucherAmount = await Transaction.findOne({
      where: {
        transactionType: "voucher",
        userId: userId,
        state: 1,
      },
    });

    if (!userWithVoucherAmount) {
      return res.status(404).json({
        status: "error",
        message: {
          barcode: "",
          voucherAmount: 0,
        },
      });
    }

    const userResponse = {
      barcode: userWithVoucherAmount.code,
      voucherAmount: userWithVoucherAmount.voucherAmount,
    };

    res.status(200).json({
      status: "success",
      user: userResponse,
    });
  } catch (error) {
    console.error(`ERROR GET USER WITH VOUCHER AMOUNT: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la récupération de l'utilisateur avec voucherAmount et state égaux à 1.",
    });
  }
};

const updateNotifToken = async (req, res) => {
  const token = req.headers.authorization;
  try {
    const { notifToken } = req.body;
    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    // Vérifie si l'en-tête commence par "Bearer "
    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Format de token invalide.",
      });
    }

    // Extrait le token en supprimant le préfixe "Bearer "
    const userToken = token.substring(7);
    let decodedToken;

    try {
      decodedToken = jwt.verify(userToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }

    // Extract the user ID from the token
    const userId = decodedToken.id;

    // check if request is null
    if (!notifToken) {
      return res.status(400).json({
        status: "error",
        message: "Le token de notification est obligatoire.",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Utilisateur non trouvé." });
    }

    // Update the notifToken field for the user
    user.token = notifToken;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Token de notification mis à jour avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour du token de notification.",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { newPassword } = req.body;

    if (!authHeader) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: "error", message: "Format de token invalide." });
    }

    // Extrait le token en supprimant le préfixe "Bearer "
    const token = authHeader.substring(7);

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }

    // Extrait l'ID de l'utilisateur du token
    const userId = decodedToken.id;

    // Vérifie si l'utilisateur existe dans la base de données en utilisant son ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Cet utilisateur n'existe pas." });
    }

    if (!newPassword) {
      return res.status(409).json({
        status: "error",
        message: "Le nouveau mot de passe est obligatoire.",
      });
    }

    if (newPassword.length < 4) {
      return res.status(409).json({
        status: "error",
        message: "Le nouveau mot de passe doit contenir au moins 4 caractères.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({ password: hashedPassword });

    res.status(200).json({
      status: "success",
      message: "Le mot de passe a été mis à jour avec succes.",
    });
  } catch (error) {
    console.error(`ERROR UPDATING PASSWORD: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour du mot de passe.",
    });
  }
};

const getReferralCount = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: "error", message: "Format de token invalide." });
    }

    // Extrait le token en supprimant le préfixe "Bearer "
    const token = authHeader.substring(7);

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }

    // Extrait l'ID de l'utilisateur du token
    const referrerId = decodedToken.id;

    // Vérifie si l'utilisateur existe dans la base de données en utilisant son ID
    const user = await User.findByPk(referrerId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Cet utilisateur n'existe pas." });
    }

    // Compter le nombre d'utilisateurs parrainés par le parrain
    const referralCount = await UserReferral.count({ where: { referrerId } });

    res.status(200).json({
      status: "success",
      message: "Nombre d'utilisateurs parrainés récupéré avec succès.",
      count: referralCount || 0,
    });
  } catch (error) {
    console.log(`ERREUR RECUPERATION REFERRAL COUNT : ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur est survenue lors de la récupération du nombre d'utilisateurs parrainés.",
    });
  }
};

const getReferralAmount = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: "error", message: "Format de token invalide." });
    }

    // Extrait le token en supprimant le préfixe "Bearer "
    const token = authHeader.substring(7);

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }

    // Extrait l'ID de l'utilisateur du token
    const referrerId = decodedToken.id;

    // Vérifie si l'utilisateur existe dans la base de données en utilisant son ID
    const user = await User.findByPk(referrerId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Cet utilisateur n'existe pas." });
    }

    const referralAmount = await UserSponsoring.findOne({
      where: { userId: referrerId },
      attributes: ["amount"], // Spécifie les colonnes que vous voulez récupérer
    });

    res.status(200).json({
      status: "success",
      message: "Montant des utilisateurs parrainés sélectionnés.",
      amount: referralAmount ? referralAmount.amount : 0,
    });
  } catch (error) {
    console.log(`ERREUR RECUPERATION REFERRAL AMOUNT : ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur est survenue lors de la sélection du montant des utilisateurs parrainés.",
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ status: "error", message: "Token non fourni." });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: "error", message: "Format de token invalide." });
    }

    // Extrait le token en supprimant le préfixe "Bearer "
    const token = authHeader.substring(7);

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ status: "error", message: "TokenExpiredError" });
      }
      return res
        .status(401)
        .json({ status: "error", message: "Token invalide." });
    }

    // Extrait l'ID de l'utilisateur du token
    const userId = decodedToken.id;

    // Vérifie si l'utilisateur existe dans la base de données en utilisant son ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Cet utilisateur n'existe pas." });
    }

    // Ajouter un x_ au début de chaque numéro de telephone de l'utilisateur pour supprimer l'utilisateur
    const newPhone = `X_${user.phone}`;
    await User.update(
      { phone: newPhone },
      {
        where: { id: userId },
      }
    );

    res.status(200).json({
      status: "success",
      message: "Le compte de l'utilisateur a été supprimé.",
    });
  } catch (error) {
    console.log(`ERROR DELETING USER : ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur est survenue lors de la suppression de l'utilisateur.",
    });
  }
};

module.exports = {
  userCheck,
  validateCode,
  registerWithoutAccount,
  registerWithAccount,
  updateProfileImage,
  checkCode,
  login,
  list,
  getCashback,
  updateCashbackLimit,
  getCashbackLimit,
  getSponsoringAmount,
  getTransactions,
  getSponsoredUsers,
  userVoucher,
  updateNotifToken,
  updatePassword,
  getReferralCount,
  getReferralAmount,
  deleteAccount,
};
