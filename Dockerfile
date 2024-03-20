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
RUN npx sequelize-cli db:migrate --env production
RUN npx sequelize-cli db:migrate --env development
RUN npx sequelize-cli db:migrate --env test

# Lancer les seeder
RUN npx sequelize-cli db:seed:all --env production
RUN npx sequelize-cli db:seed:all --env development
RUN npx sequelize-cli db:seed:all --env test

# Exposer le port utilisé par l'application
EXPOSE 6003

# Lancer l'application
CMD ["npm", "start"]
