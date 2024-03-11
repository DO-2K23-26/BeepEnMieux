# BEEP

## Configurer la BD
### Prèrequis
Assurez vous de posseder ```Node.js``` installé sur la machine.

### Instancier la BD
  - TODO

### Connecter la BD
- Après avoir instancié la bd il faut récupérer le fichier ```beepenmieux/.env.template```.
- Ouvrir le fichier et modifier les données avec celles de votre bd sous le format : 
```bash
DATABASE_URL="mongodb://user:password@ip:port/mybdname"
```
- Saugarder le fichier et le renomer en **.env** (il suffit simplement de retirer le .template). 

## Sockets
- Pour se connecter au socket server, il faut se connecter au même port que le serveur nest
- Pour rejoindre une room il faut envoyer un message de type ```join_room``` avec le nom de la room en paramètre ```roomName``` et user ```user``` dans le payload
- Pour quitter une room il faut envoyer un message de type ```leave_room``` avec le nom de la room en paramètre ```roomName``` et user ```user``` dans le payload
- Pour envoyer un message dans une room il faut envoyer un message de type ```chat``` avec le nom de la room en paramètre ```roomName``` dans le payload

### Routes
- /api/rooms
  - GET : Récupérer toutes les rooms
- /api/rooms/:id
  - GET : Récupérer une room

Plus de routes à venir