# Utiliser l'image de base node.js
FROM node:18-alpine

# Créer un répertoire pour l'application
WORKDIR /app

# Copier les fichiers de l'application dans l'image
COPY package*.json ./
COPY . .

# Installer les dépendances de l'application
RUN npm install
RUN npm install pm2
RUN npm install sequelize-cli -g

# Execution des migrations de base de donne de l'application
CMD npx sequelize-cli db:migrate --env production
CMD npx sequelize-cli db:migrate --env development
CMD npx sequelize-cli db:migrate --env test

# Lancer les seeder
CMD npx sequelize-cli db:seed:all --env production
CMD npx sequelize-cli db:seed:all --env development
CMD npx sequelize-cli db:seed:all --env test

# Exposer le port utilisé par l'application
EXPOSE 6004

# Lancer l'application
CMD ["npm", "start"]
