# BEEP

## Configurer la BD
### Prèrequis
Assurez vous de posseder ```Node.js``` installé sur la machine.

### Connecter la BD
- Après avoir instancié la bd il faut récupérer le fichier ```beepenmieux/.env.template```.
- Ouvrir le fichier et modifier les données avec celles de votre bd sous le format : 
```bash
DATABASE_URL="mongodb://user:password@ip:port/mybdname"
```
- Saugarder le fichier et le renomer en **.env** (il suffit simplement de retirer le .template). 

### Instancier la BD
Tout d'abord, générez le modèle de notre base de données. Le modèle se trouve dans le fichier **./prisma/schema.prisma**, et grâce à Prisma, nous pouvons gérer la base de données automatiquement avec la commande suivante :
```bash
npx prisma generate
```
## Lancer le docker compose
Ensuite, lancez Docker Compose :
```bash
docker compose up -d postgres
```

## Lancer l'application
Enfin, lancez l'application :
```bash
npm run start:dev
```

## Sockets
- Pour se connecter au socket server, il faut se connecter au même port que le serveur nest
- Pour rejoindre une room il faut envoyer un message de type ```join_room``` avec le nom de la room en paramètre ```roomName``` et user ```user``` dans le payload
- Pour quitter une room il faut envoyer un message de type ```leave_room``` avec le nom de la room en paramètre ```roomName``` et user ```user``` dans le payload
- Pour envoyer un message dans une room il faut envoyer un message de type ```chat``` avec le nom de la room en paramètre ```roomName``` dans le payload

### Routes
Voici les routes du projet avec leurs méthodes de requête et leurs utilisations :
- /user
  - POST : Création de l'utilisateur
- /user
  - PATCH : Mise à jour de l'utilisateur
- /user/:id
  - DELETE : Suppression de l'utilisateur indiqué

- /auth/login
  - POST : Crée et retourne le token de l'utilisateur connécté
- /auth/refresh
  - POST : Reload le token courant
- /auth/@me
  - GET : Retourne les données de l'utilisateur connecté

- /message/:id
  - GET : Retourne le message indiqué
- /message/:serverId/:channelId
  - GET : Retourne tout les messages du channel indiqué dans le serveur séléctionné
- /message
  - POST : Création d'un message
- /message/:id
  - PATCH : Mise à jour du message indiqué

- /channel/:id
  - GET : Retourne les donées du chanel indiqué
- /channel/:id/messages
  - GET : Retourne tout les messages du channel indiqué
- /channel
  - POST : Création d'un channel

- /server
  - GET : Retourne tout les serveurs dans lequel est présent l'utilisateur courant.
- /server/:name
  - GET : Retourne le serveur indiqué
- /server/:name
  - POST : Crée un serveur et ajoute authomatiquement l'utilisateur courant dans ce dernier 
- /server/:name
  - PATCH : Mise à jour du serveur indiqué
- /server/:id
  - DELETE : Suppression du serveur indiqué
- /server/:name/owner
  - GET : Retourne si OUI ou NON l'utilisateur courant est le 'owner' du serveur indiqué
- /server/:name/timeout/:user
  - GET : Retourne si OUI ou NON l'utilisateur est banni
- /server/:id/channels
  - GET : Retourne tout les channels du serveur indiqué