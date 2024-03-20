const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");
const helmet = require("helmet");
const https = require("https");
const permissionsPolicy = require("permissions-policy");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { RateLimiterMemory } = require("rate-limiter-flexible");
const admin = require("firebase-admin");
const fs = require("fs");
const serviceAccount = require("./utils/casino-b1ed2-firebase-adminsdk-yqns6-258deb73b2.json");
const shopRoutes = require("./routes/shopRoutes");
const shelveRoutes = require("./routes/shelveRoutes");
const subshelveRoutes = require("./routes/subshelveRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const deliverymanRoutes = require("./routes/deliverymanRoutes");
const orderpickerRoutes = require("./routes/orderpickerRoutes");
const caisseRoutes = require("./routes/caisseRoutes");
const userRouters = require("./routes/userRoutes");
const promotionRouters = require("./routes/promotionRoutes");
const sponsoringRouters = require("./routes/sponsoringRoutes");
const settingRouters = require("./routes/settingRoute");
const voucherRoutes = require("./routes/voucherRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const statisticRoutes = require("./routes/statisticRoutes");

// Initialize express app
const app = express();

// SwaggerOptions
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "CASINO API",
      version: "1.0.0",
      description: "API CASINO SUPERMARKET",
    },
    securityDefinitions: {
      jwt: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Charger les certificats SSL
const privateKey = fs.readFileSync("/etc/letsencrypt/live/nyota-apps.com/privkey.pem","utf8");
const certificate = fs.readFileSync("/etc/letsencrypt/live/nyota-apps.com/fullchain.pem","utf8");
const credentials = { key: privateKey, cert: certificate };
 
// Firebase cloud messaging initialisation
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Mogan logger
app.use(morgan("combined"));

// Variable d'environnement à partir de .env
dotenv.config();

// Middleware to create the destination folder for public
const createUploadsProfileFolder = (req, res, next) => {
  const folderPath = "public/profiles";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  next();
};

const createUploadsShelvesFolder = (req, res, next) => {
  const folderPath = "public/uploads/shelves";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  next();
};

const createUploadsSubShelvesFolder = (req, res, next) => {
  const folderPath = "public/uploads/subshelves";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  next();
};

const createUploadsProductsFolder = (req, res, next) => {
  const folderPath = "public/uploads/products";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  next();
};

const createUploadsPromotionsFolder = (req, res, next) => {
  const folderPath = "public/uploads/promotions";
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  next();
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Public folder
app.use(express.static("public"));

// Implementing security measures
// XSS protection
app.use(helmet());

app.use(
  permissionsPolicy({
    features: {
      payment: ["self", '"nyota-apps.com"'],
      syncXhr: [],
    },
  })
);

// DDOS protection with Rate Limiting Middleware
const limiter = new RateLimiterMemory({
  points: 100, // 100 requests
  duration: 15 * 60, // per 15 minutes
});

const rateLimitMiddleware = (req, res, next) => {
  limiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).send({
        status: "error",
        message: "Too Many Requests.",
      });
    });
};
app.use(rateLimitMiddleware);

// Middleware gestionnaire d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erreur serveur." });
});

// Routes
app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/api/v1/shop", shopRoutes);
app.use("/api/v1/shelve", createUploadsShelvesFolder, shelveRoutes);
app.use("/api/v1/subshelve", createUploadsSubShelvesFolder, subshelveRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/product", createUploadsProductsFolder, productRoutes);
app.use("/api/v1/deliveryman", deliverymanRoutes);
app.use("/api/v1/orderpicker", orderpickerRoutes);
app.use("/api/v1/caisse", caisseRoutes);
app.use("/api/v1/user", createUploadsProfileFolder, userRouters);
app.use("/api/v1/promotion", createUploadsPromotionsFolder, promotionRouters);
app.use("/api/v1/referral", sponsoringRouters);
app.use("/api/v1/setting", settingRouters);
app.use("/api/v1/voucher", voucherRoutes);
app.use("/api/v1/transaction", transactionRoutes);
app.use("/api/v1/statistic", statisticRoutes);

// Créer le serveur HTTPS
const httpsServer = https.createServer(credentials, app);

const PORT = process.env.PORT || 3000;

// Démarrage serveur
/* app.listen(PORT, () => {
  console.log(`
=======================================================
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
==> API CASINO RUNNING
==> ENV: ${process.env.NODE_ENV}
==> PORT: ${process.env.PORT}
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
=======================================================
`)
}); */
// Démarrage serveur
httpsServer.listen(PORT, () => {
  console.log(`
=======================================================
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
==> API CASINO RUNNING
==> ENV: ${process.env.NODE_ENV}
==> PORT: ${process.env.PORT}
🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
=======================================================
  `);
});
