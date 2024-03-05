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