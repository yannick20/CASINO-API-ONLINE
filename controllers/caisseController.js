const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const moment = require("moment");
const { User, Caisse, Shop, Transaction, Setting, UserCashback, UserSponsoring, SettingSponsoring, UserReferral, Cashback } = require("../models");

const createCaisse = async (req, res) => {
  try {
    const shopId = req.headers.shopid;
    const { firstName, code, lastName, phone, email, password } = req.body;

    if (!shopId) {
      return res.status(401).json({
        status: "error",
        message: "Identifiant de magasin non fourni.",
      });
    }

    if (!code) {
      return res.status(401).json({
        status: "error",
        message: "Code d'identification de la caissiere non fourni.",
      });
    }

    if (!firstName) {
      return res.status(401).json({
        status: "error",
        message: "Nom de la caissiere non fourni.",
      });
    }

    if (!lastName) {
      return res.status(401).json({
        status: "error",
        message: "Prenom de la caissiere non fourni.",
      });
    }

    if (!phone) {
      return res.status(401).json({
        status: "error",
        message: "Numéro de portable de la caissiere non fourni.",
      });
    }

    if (!password) {
      return res.status(401).json({
        status: "error",
        message: "Mot de passe de la caissiere non fourni.",
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

    // Vérifié si le code existe deja
    const existingCaisseCode = await Caisse.findOne({
      where: { code },
    });
    if (existingCaisseCode) {
      return res.status(409).json({
        status: "error",
        message: "Ce code d'identification existe deja.",
      });
    }

    // Vérifie si la caisse existe déja par son téléphone de portable
    const existingCaisse = await Caisse.findOne({
      where: { phone },
    });

    if (existingCaisse) {
      return res.status(409).json({
        status: "error",
        message: "Une caisse existe déjà avec ce numéro de portable.",
      });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creer la caisse
    const newCaisse = await Caisse.create({
      firstName,
      lastName,
      phone,
      code,
      email,
      password: hashedPassword,
      shopId,
    });

    const caisseResponse = {
      id: newCaisse.id,
      firstName: newCaisse.firstName,
      lastName: newCaisse.lastName,
      phone: newCaisse.phone,
      email: newCaisse.email,
      code: newCaisse.code,
      shopName: existingShop.name,
    };

    res.status(201).json({
      status: "success",
      caisse: caisseResponse,
    });
  } catch (error) {
    console.error(`ERROR CREATE CAISSE: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la création de la caisse.",
    });
  }
};

const loginCaisse = async (req, res) => {
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

    const existingCaisse = await Caisse.findOne({
      where: { phone },
      include: [{ model: Shop, attributes: ["name", "id"] }],
    });

    if (!existingCaisse) {
      return res.status(404).json({
        status: "error",
        message: "La caisse n'existe pas. Veuillez vous inscrire au prealable.",
      });
    }

    // Vérifier si le mot de passe est correct
    const isPasswordValid = await bcrypt.compare(
      password,
      existingCaisse.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Mot de passe incorrect. Veuillez réessayer.",
      });
    }

    // Vérifier si le mot de passe a une longueur minimale de 4 caractères
    if (password.length < 4) {
      return res.status(400).json({
        status: "error",
        message:
          "Le mot de passe doit avoir une longueur minimale de 4 caractères.",
      });
    }

    // Générer un token JWT sans durée de vie spécifiée
    const token = jwt.sign({ id: existingCaisse.id }, process.env.JWT_SECRET);

    const setting = await Setting.findByPk(1);
    const cashbackAmount = setting ? setting.cashbackAmount : 0;

    const caisseResponse = {
      id: existingCaisse.id,
      shopId: existingCaisse.Shop.id,
      shopName: existingCaisse.Shop.name,
      firstName: existingCaisse.firstName,
      lastName: existingCaisse.lastName,
      cashback: cashbackAmount,
      token,
    };

    res.status(200).json({
      status: "success",
      caisse: caisseResponse,
    });
  } catch (error) {
    console.error(`ERROR LOGIN CAISSE: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la connexion de la caisse.",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { caisseId, password } = req.body;

    if (!caisseId) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir l'ID de la caissière.",
      });
    }

    if (!password) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le nouveau mot de passe.",
      });
    }

    // Récupérer la caissière depuis la base de données
    const caisse = await Caisse.findByPk(caisseId);

    if (!caisse) {
      return res.status(404).json({
        status: "error",
        message: "La caissière n'existe pas.",
      });
    }

    // Vérifier si le nouveau mot de passe a une longueur minimale de 4 caractères
    if (password.length < 4) {
      return res.status(400).json({
        status: "error",
        message:
          "Le nouveau mot de passe doit avoir une longueur minimale de 4 caractères.",
      });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe dans la base de données
    await caisse.update({ password: hashedPassword });

    res.status(200).json({
      status: "success",
      message: "Mot de passe mis à jour avec succès.",
    });
  } catch (error) {
    console.error(`ERROR UPDATE PASSWORD CAISSE: ${error}`);
    res.status(500).json({
      status: "error",
      message:
        "Une erreur s'est produite lors de la mise à jour du mot de passe de la caissière.",
    });
  }
};

const deleteCaisse = async (req, res) => {
  try {
      const { caisseId } = req.headers.caisseid;

      if (!caisseId) {
          return res.status(400).json({
              status: "error",
              message: "Veuillez fournir l'ID de la caissière à supprimer.",
          });
      }

      // Vérifier si la caissière existe
      const caisse = await Caisse.findByPk(caisseId);

      if (!caisse) {
          return res.status(404).json({
              status: "error",
              message: "La caissière n'existe pas.",
          });
      }

      // Supprimer la caissière de la base de données
      await caisse.destroy();

      res.status(200).json({
          status: "success",
          message: "Caissière supprimée avec succès.",
      });
  } catch (error) {
      console.error(`ERROR DELETE CAISSE: ${error}`);
      res.status(500).json({
          status: "error",
          message: "Une erreur s'est produite lors de la suppression de la caissière.",
      });
  }
};

const listCaissesByShop = async (req, res) => {
  try {
    const shopId = req.headers.shopid;

    if (!shopId) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir l'ID du magasin.",
      });
    }

    // Vérifier si le magasin existe
    const existingShop = await Shop.findByPk(shopId);
    if (!existingShop) {
      return res.status(404).json({
        status: "error",
        message: "Le magasin n'existe pas.",
      });
    }

    // Récupérer la liste des caisses pour le magasin spécifié
    const caisses = await Caisse.findAll({
      where: { shopId },
      attributes: ["id", "firstName", "lastName", "phone", "code"],
    });

    res.status(200).json({
      status: "success",
      caisses,
    });
  } catch (error) {
    console.error(`ERROR LIST CAISSES: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la récupération des caisses.",
    });
  }
};

const clientInfos = async (req, res) => {
  try {
    const { barcode } =  req.body;
    if (!barcode) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez scanner le QR du client.",
      });
    }

    const client = await User.findOne({
      where: { barcode },
      attributes: ["id", "barcode", "firstName", "lastName", "phone", "imageUrl"],
    });

    if (!client) {
      return res.status(404).json({
        status: "error",
        message: "Cette carte de fidelité n'existe pas, veuillez scanner une autre carte ou réessayer à nouveau.",
      });
    }

    const clientResponse = {
      id: client.id,
      barcode: client.barcode,
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      imageUrl: client.imageUrl,
    };
    
    res.status(200).json({
      status: "success",
      client: clientResponse,
    })
    
  } catch (error) {
    console.error(`ERROR RECUPERATION INFOS CLIENT: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la création de la caisse.",
    });
  }
}

const clientInfosVoucher = async (req, res) => {
  try {
    const { barcode } =  req.body;
    if (!barcode) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez scanner le QR du client.",
      });
    }

    const client = await User.findOne({
      where: { barcode },
      attributes: ["id", "firstName", "lastName", "phone", "imageUrl"],
    });

    if (!client) {
      return res.status(404).json({
        status: "error",
        message: "Cette carte de fidelité n'existe pas, veuillez scanner une autre carte ou réessayer à nouveau.",
      });
    }

    const clientVoucher = await Transaction.findOne({
      where: { userId: client.id, state: 1, transactionType: 'voucher' },
    }) 

    if (!clientVoucher) {
      return res.status(404).json({
        status: "error",
        message: "Le client n'a pas générer de bon d'achat valide.",
      });
    }

    const clientResponse = {
      id: client.id,
      barcode: clientVoucher.code,
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      imageUrl: client.imageUrl,
      amount: clientVoucher.voucherAmount || 0
    };
    
    res.status(200).json({
      status: "success",
      client: clientResponse,
    })
    
  } catch (error) {
    console.error(`ERROR RECUPERATION INFOS CLIENT: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la création de la caisse.",
    });
  }
}

const validateTicket = async (req, res) => {
  try {
    const { caisseId, shopId, userId, ticketDate, number, amount, cashback } = req.body;

    if (!shopId) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir l'ID de la boutique.",
      });  
    }

    if (!caisseId) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir l'ID de la caisse.",
      });  
    }

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir l'ID de l'utilisateur.",
      });  
    }

    if (!ticketDate) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir la date de la validation.",
      });  
    }

    if (!number) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le numéro du ticket.",
      });
    }

    if (!amount) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le montant du ticket.",
      });
    }

    if (!cashback) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le montant du cashback.",
      });
    }

    /*  const formattedTicketNumber = formatTicketNumber(number);
    if (!formattedTicketNumber) {
      return res.status(400).json({
        status: "error",
        message: "Numéro de ticket invalide. Veuillez scanner à nouveau le ticket.",
      });
    } */

    const shop = await Shop.findOne({ where: { id: shopId } });

    if (!shop) {
      return res.status(404).json({
        status: "error",
        message: "La boutique n'existe pas.",
      });
    }

    const caisse = await Caisse.findOne({ where: { id: caisseId } });

    if (!caisse) {
      return res.status(404).json({
        status: "error",
        message: "La caisse n'existe pas.",
      });
    }

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "L'utilisateur n'existe pas.",
      });
    }

    const existingTransaction = await Transaction.findOne({
      where: { ticketNumber: number, transactionType: 'purchase' },
    });

    if (existingTransaction) {
      return res.status(400).json({
        status: 'error',
        message: 'Ce numéro de ticket a déjà été consommé. Veuillez en choisir un autre.',
      });
    }

    // Calculate the new cagnotte amount
    const currentCashback = await Cashback.findOne({ where: { userId } });
    const isFirstTransaction = await Transaction.count({ where: { userId } }) === 0;

    let newCagnotte;
    if (currentCashback.amount === 0 && isFirstTransaction) {
      newCagnotte = parseFloat(cashback);
    } else if (currentCashback.amount > 1) {
      newCagnotte = currentCashback.amount + parseFloat(cashback);
    } else {
      const lastTransaction = await Transaction.findOne({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });

      if (lastTransaction) {
        if (lastTransaction.ticketCashbackType === '+') {
          newCagnotte = lastTransaction.cagnotte + parseFloat(cashback);
        } else if (lastTransaction.ticketCashbackType === '-') {
          newCagnotte = lastTransaction.cagnotte - parseFloat(cashback);
        }
      } else {
        console.error('No previous transaction found for the user.');
        return res.status(500).json({
          status: 'error',
          message: 'Une erreur s\'est produite lors de la validation du ticket de l\'utilisateur.',
        });
      }
    }

    // Formatting the date
    const formattedDate = moment(ticketDate, 'YY.MM.DD HH:mm').format('YYYY-MM-DD HH:mm');

    // Create the transaction
    const transactionResult = await Transaction.create({
      userId,
      caisseId,
      shopId,
      paymentType: 1,
      transactionType: 'purchase',
      ticketDate: formattedDate,
      ticketNumber: number,
      ticketAmount: amount,
      ticketCashback: cashback,
      cagnotte: newCagnotte,
      ticketCashbackType: '+',
      state: 2
    });

    // Update UserCashback with the new amount
    const cashbackAmount = currentCashback.amount + parseFloat(cashback);

    await Cashback.update({ amount: cashbackAmount }, { where: { userId } });

    // Condition pour le parrainage et le versement du montant de parrainage
    const setting = await Setting.findByPk(1);
    const referral = await SettingSponsoring.findByPk(1);
    const limitDate = setting.voucherDay;
    const limitAmount = setting.voucherAmountMin;
    const godfatherReferral = referral.godfatherAmount;
    const godsonReferral = referral.godsonAmount;

    const totalPurchaseAmount = await Transaction.sum('ticketAmount', {
      where: {
        userId,
        transactionType: 'purchase',
        state: 2,
      },
    });

    // Vérifier si les conditions de parrainage sont remplies
    if (totalPurchaseAmount >= limitAmount || isWithinLimitDate(user.createdAt, limitDate)) {
      // Créditer le parrain
      const godfather = await UserReferral.findOne({ where: { referredId: userId } });

      if (godfather) {
        const godfatherUser = await User.findOne({ where: { id: godfather.referrerId } });
        const godfatherToken = godfatherUser ? godfatherUser.token : null;

        // Créditer le compte du parrain
        const currentGodfatherAmount = godfather.amount + parseFloat(godfatherReferral);
        await godfather.update({ amount: currentGodfatherAmount });
        const sponsoringAmount = UserSponsoring.findOne({ where: { userId } });
        const amountSonsporing = sponsoringAmount.amount + parseFloat(godfatherReferral);
        await UserSponsoring.update({ amount: amountSonsporing }, { where: { userId } });

        // Envoi de la notification FCM au parrain
        if (godfatherToken) {
          const godfatherMessage = {
            notification: {
              title: "Parrainage",
              body: `Vous avez reçu un montant de parrainage de ${godfatherReferral} CFA.`,
            },
            token: godfatherToken,
          };
          admin.messaging().send(godfatherMessage).then((response) => {
            console.log("Ticket validé avec succès :", response);
          })
          .catch((error) => {
            console.error("Erreur lors de la validation du ticket :", error);
          });
        }
      }

      // Créditer le filleul
      const godson = await UserReferral.findOne({ where: { referrerId: userId } });

      if (godson) {
        const godsonUser = await User.findOne({ where: { id: godson.referredId } });
        const godsonToken = godsonUser ? godsonUser.token : null;

        // Créditer le compte du filleul
        const currentGodsonAmount = godson.amount + parseFloat(godsonReferral);
        await godson.update({ amount: currentGodsonAmount });

        // Envoi de la notification FCM au filleul
        if (godsonToken) {
          const godsonMessage = {
            notification: {
              title: "Parrainage",
              body: `Vous avez reçu un montant de parrainage de ${godsonReferral} CFA.`,
            },
            token: godsonToken,
          };

          admin.messaging().send(godsonMessage).then((response) => {
            console.log("Ticket validé avec succès :", response);
          })
          .catch((error) => {
            console.error("Erreur lors de la validation du ticket :", error);
          });
        }
        
      }
    }

    const userToken = user.token;
    if (userToken) {
      const userMessage = {
        notification: {
          title: "Validation du ticket",
          body: "Votre ticket a été validé, votre compte a été crédité de " + cashback + " CFA de cashback.",
        },
        token: userToken,
      };

      admin.messaging().send(userMessage).then((response) => {
        console.log("Notification envoyée avec succès :", response);
      })
      .catch((error) => {
        console.error("Erreur lors de l'envoi de la notification :", error);
      });
    }

    res.status(201).json({
      status: "success",
      message: "Le ticket a été validé avec succès.",
      transaction: transactionResult
    });

  } catch (error) {
    console.error(`ERROR VALIDATION DE TICKET: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la validation du ticket de l'utilisateur.",
    });
  }
};

// Fonction pour vérifier si la date de création est dans la limite requise
const isWithinLimitDate = (creationDate, limitDays) => {
  const currentDate = new Date();
  const diffInDays = Math.floor((currentDate - creationDate) / (1000 * 3600 * 24));

  return diffInDays <= limitDays;
};

const formatTicketNumber = (rawNumber) => {
  // Remove any non-digit characters
  const cleanedNumber = rawNumber.replace(/\D/g, '');

  // Check if the cleaned number has the expected length
  if (cleanedNumber.length === 12) {
    // Format the number into "#### ## #### ###"
    return cleanedNumber.replace(/(\d{4})(\d{2})(\d{4})(\d{3})/, "$1 $2 $3 $4");
  } else {
    // Return null if the format is incorrect
    return null;
  }
};

const validateVoucher = async (req, res) => {
  try {
    const { caisseId, userId, shopId, ticketDate, number, amount, cashback } = req.body;

    if (!shopId) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir l'ID de la boutique.",
      });  
    }

    if (!caisseId) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir l'ID de la caisse.",
      });  
    }

    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir l'ID de l'utilisateur.",
      });  
    }

    if (!ticketDate) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir la date de la validation.",
      });  
    }

    if (!number) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le numéro du ticket.",
      });
    }

    if (!amount) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le montant du ticket.",
      });
    }

    if (!cashback) {
      return res.status(400).json({
        status: "error",
        message: "Veuillez fournir le montant du cashback.",
      });
    }

    /*  const formattedTicketNumber = formatTicketNumber(number);
    if (!formattedTicketNumber) {
      return res.status(400).json({
        status: "error",
        message: "Numéro de ticket invalide. Veuillez scanner à nouveau le ticket.",
      });
    } */

    const caisse = await Caisse.findOne({ where: { id: caisseId } });

    if (!caisse) {
      return res.status(404).json({
        status: "error",
        message: "La caisse n'existe pas.",
      });
    }

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "L'utilisateur n'existe pas.",
      });
    }

    // Vérifier si le ticketNumber existe déjà
    const existingTransaction = await Transaction.findOne({
      where: { ticketNumber: number, transactionType: 'voucher' },
    });

    if (existingTransaction) {
      return res.status(400).json({
        status: 'error',
        message: 'Ce numéro de ticket à déja été consomé. Veuillez en choisir un autre.',
      });
    }

    const formattedDate = moment(ticketDate, 'YY.MM.DD HH:mm').format('YYYY-MM-DD HH:mm');

    const transactionResult = await Transaction.update(
      {
        transactionType: 'voucher',
        ticketCashbackType: '-',
        paymentType: 1,
        shopId,
        caisseId,
        ticketDate: formattedDate,
        ticketNumber: number,
        ticketAmount: amount,
        ticketCashback: cashback,
        state: 2
      },
      {
        where: { userId: userId, transactionType: 'voucher' },
      }
    );

    const message = {
      notification: {
        title: "Bon d'achat",
        body: `Votre bon d'achat à été consomé avec de succès.`,
      },
      token: user.token,
    };

    admin
      .messaging()
      .send(message)
      .then((response) => {
        console.log("Ticket validé avec succès :", response);
      })
      .catch((error) => {
        console.error("Erreur lors de la validation du ticket :", error);
      });

      if (!transactionResult) {
        return res.status(500).json({
          status: "error",
          message: "Une erreur s'est produite lors de la validation du bon d'achat.",
        });
      }

      res.status(200).json({
        status: "success",
        message: "Le bon d'achat a été validé avec succès.",
      });

  } catch (error) {
    console.error(`ERROR VALIDATION DE BON D'ACHAT: ${error}`);
    res.status(500).json({
      status: "error",
      message: "Une erreur s'est produite lors de la validation du bon d'achat.",
    });
  }
}


module.exports = {
  createCaisse,
  loginCaisse,
  updatePassword,
  deleteCaisse,
  listCaissesByShop,
  clientInfos,
  clientInfosVoucher,
  validateTicket,
  validateVoucher
};
