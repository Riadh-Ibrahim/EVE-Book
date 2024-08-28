# 🚀 EVE-BOOK : VM Reservation Module

## 📜 Description

Le module de réservation de VM permet aux utilisateurs de réserver des machines virtuelles (VM) à partir d'un calendrier en ligne. Les utilisateurs peuvent spécifier la date et le nombre d'heures pour leur réservation. Le système vérifie la disponibilité des VM, crée une VM dans l'environnement de virtualisation EVE-NG, et envoie les paramètres d'authentification SSH à l'utilisateur.

## 🛠️ Fonctionnalités

- **Réservation de VM** : Réservez des VM en choisissant la date et la durée depuis une interface web interactive.
- **Vérification de disponibilité** : Assurez-vous qu'aucune réservation n'existe déjà pour la date spécifiée.
- **Création automatique de VM** : Déclenche la création d'une VM dans EVE-NG.
- **Envoi des paramètres SSH** : Transmet les informations d'authentification SSH à l'utilisateur.
- **Personnalisation du thème** : Adaptez le thème et le style de l'interface selon vos préférences.
- **Menu principal** : Modifiez le menu principal pour mieux correspondre à vos besoins et améliorer l'expérience utilisateur.
- **Édition du profil utilisateur** : Permet aux utilisateurs de mettre à jour leurs informations personnelles et de gérer leur profil.
- **Interface dynamique interactive** : Profitez d'une interface utilisateur réactive et interactive pour une meilleure expérience.
- **Admin Dashboard** : Accédez à un tableau de bord administrateur pour gérer les réservations et les utilisateurs.
- **Visualisation et gestion des réservations à venir** : Consultez, modifiez ou annulez les réservations futures.
- **Visualisation de l'archive des réservations** : Accédez à un historique complet des réservations passées.

## 📦 Prérequis

- [Node.js](https://nodejs.org) (pour le backend Express)
- [MongoDB](https://www.mongodb.com) (pour la gestion des réservations)
- [Ansible](https://www.ansible.com) (pour la création des VM)
- [EVE-NG](https://www.eve-ng.net) (environnement de virtualisation)
- [VMware](https://www.vmware.com) (environnement de virtualisation sur Windows 11)

## 🚀 Installation

1. **Cloner le dépôt** :

   ```bash
   git clone https://github.com/votre-utilisateur/votre-projet.git
   cd votre-projet
2. **Configurer le backend** :

   - Naviguez dans le répertoire `api` et installez les dépendances :

     ```bash
     cd api
     npm install
     ```

   - Créez un fichier `.env` dans `api` pour les variables d'environnement nécessaires:

     ```env
     MONGO_URI=mongodb://localhost:27017/EVE-Book
     ANSIBLE_PLAYBOOK_PATH=/root/ansible/playbooks/create_vm.yml
     ```

3. **Configurer le frontend** :

   - Naviguez dans le répertoire `client` et installez les dépendances :

     ```bash
     cd ../client
     npm install
     ```

   - Configurez les paramètres de connexion au backend dans le fichier de configuration du frontend.

4. **Configurer Ansible** :

   - Assurez-vous que le script Ansible pour la création des VM est correctement configuré et accessible. Vérifiez les paramètres de connexion à EVE-NG et les chemins des images de disque.

5. **Lancer le serveur** :

   - Démarrez le backend :

     ```bash
     cd ../api
     npm start
     ```

   - Démarrez le frontend :

     ```bash
     cd ../client
     npm start
     ```

## 🔧 Utilisation

1. **Accéder à l'interface web** : Ouvrez votre navigateur et allez sur `http://localhost:5173`.
2. **Creer et acceder a vitre compte utilisateur.**

3. **Réserver une VM** :
   - Sélectionnez les dates et heures de debut et de fin de la réservation.
   - Cliquez sur "Confirmer" pour valider la réservation.

4. **Vérification et création** :
   - Le système vérifiera la disponibilité et créera la VM dans EVE-NG si la date est disponible.

5. **Recevoir les informations SSH** : Après la création de la VM, les paramètres d'authentification SSH seront envoyés par email.

6. **Personnaliser le thème et le menu principal** :
   - Modifiez le thème de l'application via le fichier de configuration du frontend.
   - Personnalisez le menu principal en modifiant les composants de navigation dans le code React.

7. **Édition du profil utilisateur** :
   - Les utilisateurs peuvent mettre à jour leurs informations personnelles depuis la section "Profil" de l'interface.

8. **Visualiser et gérer les réservations à venir** :
   - Consultez la liste des réservations futures dans l'interface d'administration, et apportez les modifications ou annulations nécessaires.

9. **Visualiser l'archive des réservations** :
   - Accédez à l'historique complet des réservations passées à partir du tableau de bord administrateur.
     
10. **Admin Dashboard** :
   - Les administrateurs peuvent accéder au tableau de bord via l'interface d'administration pour gérer les réservations et les utilisateurs.

## 📂 Structure du Projet

- `api/` : Code backend Express.js et logique de réservation.
- `client/` : Code frontend React.js et interface utilisateur.
- `ansible/` : Scripts Ansible pour la gestion des VM.
- `docs/` : Documentation et guides supplémentaires.

## 💬 Contribuer

1. Forkez le dépôt.
2. Créez une branche pour vos modifications (`git checkout -b feature/nouvelle-fonctionnalite`).
3. Commitez vos modifications (`git commit -am 'Ajoute une nouvelle fonctionnalité'`).
4. Poussez la branche (`git push origin feature/nouvelle-fonctionnalite`).
5. Ouvrez une pull request.


## 📚 Documentation

Pour plus d'informations sur l'utilisation et la configuration du projet, veuillez consulter les [documents de la documentation](docs/).

## 🤝 Contact

Pour toute question ou support, vous pouvez nous contacter à [riadhibrahim007@gmail.com](mailto:riadhibrahim007@gmail.com).
