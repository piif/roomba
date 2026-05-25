# Mise en place d'une WebApp

## But
Créer le squlette d'une web app de controle du robot.

## Périmètre
- Dans le scope:
  - L'interface web permettant de consuter l'état du robot, et lui envoyer des ordres;
  - L'application serveur permettant d'afficher ces pages web.
- Hors scope:
  - L'identification de l'utilisateur (plus tard, un proxy gérera cet aspect);
  - La découverte du robot (la config est stockée dans le fichier config/config.json).

## Contraintes
- L'interface web doit être adaptée à un usage depuis un mobile.
- Le serveur web utilise un framework nodejs minimal
- L'interface graphique utilise des styles minimaux, mais quand meme intuitifs
- Le site présente un favicon qui représente un robot roomba stylisé, mais assez grand pour pouvoir
  en faire l'icone d'une appli mobile en affectant la page à l'écran d'accueil d'un téléphone mobile
- L'interface web est en anglais ou en français, ce choix étant imposé côté serveur par un argument
  de la ligne de commande. \
  Comme il n'y a pas de texte complexes, de dates ou d'unités, il n'est pas nécessaire d'embarquer une lib I18N complète: un simple dictionnaire des chaines à traduire suffit.

## Validation
- Commandes à lancer:
  - Deux commandes permettent de lancer le serveur web :
    - l'une en mode "mock" (la classe MockClient est alors instanciée et stocke le statut du robot);
    - l'autre en mode "réel" avec la classe DoritaClient.
  - Le serveur web permet de servir la page d'accueil de la webapp et une API permettant de transmettre
    les requête à l'instance de RobotClient
- Cinématique de la web app:
  - La page d'acceuil affiche le status du robot (statut, mission en cours, état de charge, état de la poubelle ("bin")). \
    Un bouton "actualiser" permet de lancer une requête pour obtenir de nouveau les informations actualisées.
  - Des boutons permettent de :
    - si le robot est à l'arrêt: lancer un clean;
    - si le robot est à l'arrêt hors de son dock: renvoyer le robot à sa base;
    - si une mission est en cours: renvoyer le robot à sa base ou l'arrêter sans retour à la base.
    - si le statut est "NotReady", aucune action n'est possible
  - Un menu permet d'accéder à une page de planning :
    - Le planning courant est affiché sous forme de liste : une ligne par jour du dimanche au samedi,
      avec un icone "inactif", ou l'heure de lancement
    - On peut basculer l'icone en actif/inactif
    - S'il est actif, on peut modifier l'heure
    - Dès qu'on fait un changement, un bouton "confirmer" apparait pour envoyer le nouveau planning
  - Le menu permet aussi d'accéder à une page de statut détaillé, indiquant les informations
    techniques connues du robot.
  - À tout moment, si une requête échoue, une bannière en haut de l'écran doit afficher un message
    d'erreur.

## Notes

Ce qu'il faut afficher :
 - page d'accueil :
   - nom du robot : `robot.config().name`
   - mission en cours : `robot.status().mission`
   - charge de la batterie: pourcentage retourné par `robot.status().battery.percent` et logo "en charge"
     si `robot.status().battery.charging` vaut "true".
   - état de la poubelle : selon de contenu des champs `present` et `full` de `robot.status().bin` :
     - true/false : "OK"
     - true/true : "Pleine"
     - false/* : "Absente"
 - planning : la méthode `robot.planning()` retourne un tableau de 7 éléments correspondant à la
   programmation les 7 jours de la semaine (du dimanche au samedi). Chaque entrée contient :
   - `null` qui signifie programmation désactivée pour ce jour de la semaine
   - sinon, un tableau de 2 nombres corerspondant à l'heure et la minute de dbut d'une mission cleaning.
 - statut détaillé : afficher le contenu de la réponse à la méthode `robot.config()`
