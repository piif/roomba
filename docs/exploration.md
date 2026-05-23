# Premiers tests

Comme je n'ai aucun accès au cloud, les commandes "cloud" ne marchent pas, et je n'ai pas de login/mot de passe cloud. \
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

J'ai du ajouter des options pour qu'openssl soit vraiment en mode openbar car la CA est expirée et les protocoles sont pas trop à jour.

Résultat, on a bien une connexion TLS qui est établie :
```
Server certificate
subject=C = US, O = iRobot, L = Bedford, ST = MA, CN = Roomba-6802211C51437680
issuer=C = US, ST = MA, L = Bedford, O = iRobot, OU = HBU, CN = Roomba CA
```

Mais aucun payload en retour.

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

On doit donc pouvoir faire des trucs avec ça.

# Tests de commandes locales

```
npm install dorita980 --save
node getStatus.js
```

⇒ On obtient quelques infos qui confirment que le dialogue passe

En regardant le code de la lib, il s'avère que toutes les méthodes `getPreferences`, `getWeek`, `get...` sont en fait des raccourcis vers la même méthode `waitPreference`, et sont donc équivalentes à `getRobotState` avec une sélection de préférences à renvoyer.

Par contre, `getRobotState` renvoie tout alors que `waitPreference` a une option pour sélectionner uniquement les entrées demandées.

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
```json
    cycle: 'clean',
    phase: 'stop',
```

Un nouvel appel à "dock" passe ensuite à :
```json
    cycle: 'clean',
    phase: 'hmUsrDock',
```

Je l'attrape pour le ramener à sa base : pas de message d'erreru sonore, mais le statut devient :
```json
    cycle: 'clean',
    phase: 'stop',
    ...
    error: 0,
    notReady: 1,
```

après relance (bouton home), et en le soulevant de nouveau, c'est un bip, le voyant rouge et ce statut :
```json
    cycle: 'clean',
    phase: 'stuck',
    expireM: 90,
    rechrgM: 0,
    error: 6,
    notReady: 0,
```

Après nouvelle relance, quand il arrive sur son dock :
```json
    cycle: 'none',
    phase: 'charge',
```

En parallèle, on a des events à creuser :
```json
onUpdate {
  state: { reported: { cleanMissionStatus: [Object], dock: [Object] } }
}
```

## Conclusion

Globalement, ce qui peut être intéressant à récupérer :
```json
{
  netinfo: {
    dhcp: true,
    addr: 3232235788, // = 0xc0a8010c = 192.168.1.12 si on découpe par octets
    mask: 4294967040, // idem = 255.255.255.0
    gw: 3232235777,   // idem = 192.168.1.1
    dns1: 3232235777, // idem
    dns2: 0,
    bssid: '..:..:..:..:..:..', // le bssid de la borne wifi
    sec: 4
  },
  wifistat: { wifi: 1, uap: false, cloud: 6 },
  wlcfg: { sec: 7, ssid: 'xxxxxxxxxxxx' }, // "hexdump" du ssid
  mac: '..:..:..:..:..:..', // mac du robot
  country: 'FR',
  cloudEnv: 'prod',
  name: 'Roomba',
  lastDisconnect: 4,
  batInfo: {
    mName: 'PanasonicEnergy',
    mDate: 'aaaa-mm-dd', // ???
    mDaySerial: ??,
    mData: '???',
    mLife: '???',
    cCount: 458   // nombre de fois qu'il a été en charge ?
  },
  bbchg3: { nAvail: 1124, estCap: 1642 }, // infos sur la capa de la batterie ??
  cleanSchedule: {
    cycle: [  // jour ou le clean est activé, du dimanche au samedi
      'none',  'start',
      'start', 'start',
      'start', 'start',
      'none'
    ],
    h: [   // heure de démarrage pour chaque jour
      9, 7, 7, 7,
      7, 7, 9
    ],
    m: [   // minute de démarrage pour chaque jour
       0, 15, 15, 15,
      15, 15,  0
    ]
  },
  language: 1,
  cleanMissionStatus: { // le status actuel du robot
    cycle: 'none',    // none=au repos, clean=en cours de mission
    phase: 'charge',  // charge=en charge sur le dock, stop=arrété (sur dock ou ailleurs), hmUsrDock=en cours de retour vers le dock, stuck=erreur
    expireM: 0,
    rechrgM: 0,
    error: 0,    // cas d'erreur si !=0
    notReady: 0, // 1 si mission interrompue ?
    mssnM: 57,
    sqft: 0,
    initiator: '',
    nMssn: 360
  },
  dock: { known: true },
  bin: { present: true, full: false }, // poubelle présente et pas pleine
  batPct: 100,                         // niveau de charge batterie
  mobilityVer: 'xxx',                  // \
  bootloaderVer: 'xxx',                //  | infos firmware
  soundVer: 'xx',                      //  |
  batteryType: 'xx',                   // /
  binPause: false,     // certaines options
  carpetBoost: false,  // qu'on peut modifier
  noAutoPasses: false, // mais je ne me souviens pas
  noPP: false,         // de ces options dans l'appli
  openOnly: false,
  twoPass: false,
  vacHigh: false,
  sku: 'xxx',
  timezone: 'Europe/Paris',
  wifiSwVer: 'xx',
  softwareVer: 'xx',
}
```

Donc :
 * pour les infos "fixes" : les entrées netinfo, wlcfg, mac, name, sku,
   timezone, wifiSwVer, softwareVer, mobilityVer, bootloaderVer, soundVer, batteryType
 * pour les infos "dynamiques" : cleanMissionStatus, bin, batPct
 * cas particulier du planning : cleanSchedule
