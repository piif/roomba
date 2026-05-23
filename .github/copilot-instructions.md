# Instructions génériques pour Copilot 

## Contexte du projet
Ce projet a pour but de controler un robot Roomba à travers les APIs locales définies dans la librairie dorita980.
Les tests de l'application pourront également passer par un mock du client robot pour éviter de out tester avec le vrai robot.

Une première phase d'exploration consiste à vérifier le fonctionnement de la librairie sur mon modèle de robot.
Le répertoire `first-tests/` contient donc quelques scripts qui servent uniquement à explorer les APIs disponibles et le contenu de leur réponses.

La seconde phase consiste à créer une application web simple permettant de piloter le robot depuis un navigateur.
Les objectifs fonctionalités attendues à terme sont :
 - affichier le statut du robot (mission en cours, éventuel statut d'erreur et niveau de charge);
 - lancer / stopper une mission (nettoyage, retour à la base);
 - mettre à jour la programmation hebdomadaire.

Aujourd'hui, la 1ère phase est considérée terminée (on y reviendra au cas par cas si nécessaire)

## Règles de codage
 - Les noms de classes, fonctions, variables et les commentaires sont en anglais
 - L'indentation est de 4 espaces

## Règles de documentation
 - Les noms de répertoires et fichiers sont en anglais.
 - Les README, la documentation et les prompts sont en français.
 - Le README principal doit rester minimal et contenir des références aux fichiers du répertoire `docs/`.
