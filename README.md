# Objectif

Reprendre la main sur mon roomba e6, dont la carte mère avait rendu l'ame, et qui a décrété qu'il était chinois après remplacement de la carte mère (ce qui l'empèche visiblement d'accéder au cloud ...).

Ce qui marche actuellement :
 * Depuis l'appli roomba, on arrive à s'appairer au robot (après appui long sur "home").
 * On peut alors le programmer, mais le robot d'apparait jamais dans la liste des appareils
 * La programmation marche, mais on n'a aucune notif et on doit recommencer l'appairage pour chaque modif

Source d'informations : [dorita980](https://github.com/koalazak/dorita980)

D'après ce projet, on devrait pour le controler depuis un programme, donc depuis une page web hébergée dans le réseau domestique. Ça serait mieux que rien.

# Premiers tests

Comme je n'ai donc aucun accès au cloud, les commandes "cloud" ne marchent pas, et je n'ai pas de login/mot de passe cloud. \
Je suis donc parti du principe que le robot ne devait pas avoir de mot de passe local.

Openssl vers :8883 semble marcher, mais répond "du vide". \
Un nmap ne retourne aucun autre port ouvert.

Test de "set password" d'après la méthode indiquée [ici](https://github.com/koalazak/dorita980/issues/106#issuecomment-575839045):
```bash
( echo -n "f023efcc3b2900" | xxd -r -p ; \
  echo -n ":1:$(date +%s):MyR00mb@Password" \
) | openssl s_client -showcerts -connect $MY_IP:8883 -noservername \
       -legacy_renegotiation -no_check_time  -cipher DEFAULT@SECLEVEL=1 -CAfile CA.pem
```

Résultat :
```
Server certificate
subject=C = US, O = iRobot, L = Bedford, ST = MA, CN = Roomba-6802211C51437680
issuer=C = US, ST = MA, L = Bedford, O = iRobot, OU = HBU, CN = Roomba CA
```

Mais aucun payload en retour

J'ai du ajouter des options pour qu'openssl soit vraiment en mode openbar car la CA est expirée et les protocoles sont pas trop à jour.

L'option npm indiquée dans la section "Show old firmwares method" marche mieux :

```
> node ./bin/getpassword.js 192.168.1.12

Make sure your robot is on the Home Base and powered on (green lights on). Then press and hold the HOME button (or DOCK+SPOT on some models) on your robot until it plays a series of tones (about 2 seconds). Release the button and your robot will flash WIFI light.
Then press any key here...
(node:191292) [DEP0005] DeprecationWarning: Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Robot Data:
{
  ver: '3',
  hostname: 'Roomba-************',
  robotname: 'Roomba',
  ip: '192.168.1.12',
  mac: '**:**:**:**:**:**',
  sw: '3.4.59',
  sku: 'e515080',
  nc: 0,
  proto: 'mqtt',
  cap: { ota: 1, eco: 1, svcConf: 1 },
  blid: '***************'
}
Password=> :1:1775748274:************* <= Yes, all this string.
```

On doit donc pouvoir faire des trucs avec ça

# Tests de commandes locales

```
npm install dorita980 --save
node getStatus
```

⇒ On obtient quelques infos qui confirment que le dialogue passe

```
node command.js --start
node command.js --clean
node command.js --stop
node command.js --dock
```

⇒ le robot démarre, clean, s'arrête, retourne vers son dock.

On a la base, y'a plus qu'à en faire un truc utilisable ...

# Les évènements

La doc explique qu'on peut attraper divers évènements, notamment "mission". \
En, même sur sa base, quand on est connecté, on se prend un message par seconde, avec un contenu de ce type :

```json
onMission {
  cleanMissionStatus: {
    cycle: 'none',
    phase: 'charge',
    expireM: 0,
    rechrgM: 0,
    error: 0,
    notReady: 0,
    mssnM: 0,
    sqft: 0,
    initiator: '',
    nMssn: 357
  },
  pose: undefined,
  bin: { present: true, full: false }
}
```

Ici, on sait donc qu'il est en charge, que son bac à poussière et là, et qu'il n'est pas plein.

Après un start :
```json
{
  cleanMissionStatus: {
    cycle: 'clean',
    phase: 'run',
    expireM: 90,
    rechrgM: 0,
    error: 0,
    notReady: 0,
    mssnM: 0,
    sqft: 0,
    initiator: 'localApp',
    nMssn: 357
  },
  bin: { present: true, full: false },
  batPct: 100
}
```

On a donc le % de batterie en plus du fait qu'il bosse

Au bout d'un moment, mssnM vaut 13 (minutes depuis le début de la mission ?) et batPct vaut 95.

Il faut plusieurs ordres stop et dock avant qu'il daigne s'arrêter ?
On passe alors à :
```
    cycle: 'clean',
    phase: 'stop',
```

Un nouvel appel à "dock" passe ensuite à :
```
    cycle: 'clean',
    phase: 'hmUsrDock',
```

Je l'attrape pour le ramener à sa base : pas de message d'erreru sonore, mais le statut devient :
```
    cycle: 'clean',
    phase: 'stop',
    ...
    error: 0,
    notReady: 1,
```

après relance (bouton home), et en le soulevant de nouveau, c'est un bip, le voyant rouge et ce statut :
```
    cycle: 'clean',
    phase: 'stuck',
    expireM: 90,
    rechrgM: 0,
    error: 6,
    notReady: 0,
```

Après nouvelle relance, quand il arrive sur son dock :
```
    cycle: 'none',
    phase: 'charge',
```

En parallèle, on a des events à creuser :
```
onUpdate {
  state: { reported: { cleanMissionStatus: [Object], dock: [Object] } }
}
```
