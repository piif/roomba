Après le passage en heure d'hiver, il s'avère que le robot a son planning décalé d'une heure.

D'après la doc, `getRobotState` doit retourner des champs relatifs à la timezone.
Dans la doc :
```
  localtimeoffset: -180,
  utctime: 1487103319,
  tz:
   { events: [ { dt: 0, off: -180 }, { dt: 0, off: -180 }, { dt: 0, off: 0 } ],
     ver: 2 },
  timezone: 'America/Buenos_Aires'
```

Sur mon robot :
```
  tz: {
    ver: 0,
    events: [ { dt: 0, off: 120 }, { dt: 0, off: 0 }, { dt: 0, off: 0 } ]
  }
  timezone: 'Europe/Paris',
```
Mais pas de `localtimeoffset` ni `utctime`.

Si j'appelle `getRobotState(['localtimeoffset', 'utctime', 'tz', 'timezone'])` la fonction ne rend jamais la main.
De même si je ne laisse que `utctime` ou `localtimeoffset`.

Ces champs semblent donc absents de ma version.

Questions :
 * comment interpréter le contenu de la structure `tz` ? ces 3 entrées `events` correspondent elles à un format standard ?
 * y a t'il d'autres moyen d'obtenir les information de timestamp courant et timeoffset ?

## Réponses

### Structure `tz`

La structure `tz` n'est pas décrite comme un format standard dans la documentation de `dorita980` consultée. Il faut donc la considérer comme une structure interne au firmware/API iRobot, et non comme un objet IANA, POSIX ou RFC 5545 directement interprétable.

Les noms suggèrent que `events` décrit des événements de changement d'heure et que `off` représente un décalage en minutes par rapport à UTC. La valeur `-180` de l'exemple Buenos Aires est cohérente avec UTC−03:00. En revanche, l'exemple du robot parisien (`120`, puis deux zéros, avec `ver: 0` et des `dt` à zéro) ne permet pas d'établir la signification exacte de `dt`, des entrées inutilisées ou de la version. En particulier, il ne faut pas supposer que `dt: 0` est un timestamp Unix ni que la liste encode de manière complète les règles de changement d'heure. Les données semblent incomplètes ou spécifiques à cette version du firmware.

Le champ `timezone: 'Europe/Paris'` est, lui, un identifiant de fuseau IANA exploitable. Pour calculer l'heure civile ou le décalage attendu à une date donnée, mieux vaut s'appuyer sur cet identifiant et une base de fuseaux horaires (par exemple `Intl` en JavaScript), plutôt que tenter de décoder `tz.events` sans spécification fiable.

### Timestamp et décalage horaire

`dorita980` documente une méthode `getTime()` qui renvoie le timestamp Unix du robot en secondes. Dans l'implémentation installée, cette méthode attend toutefois la propriété `utctime` dans l'état reçu. Elle peut donc, comme `getRobotState(['utctime'])`, ne jamais résoudre si le firmware du robot ne publie pas cette propriété. La méthode d'attente de `getRobotState` n'a pas de délai d'expiration : demander une propriété absente explique le blocage observé. `getTime()` vaut donc la peine d'être essayé, mais ce n'est pas une solution de repli garantie sur ce robot.

Si le robot ne publie ni `utctime` ni `localtimeoffset`, l'API locale documentée dans cette version ne fournit pas nécessairement ces valeurs. On peut obtenir l'heure courante de la machine qui exécute l'application avec `Date.now()` (en millisecondes Unix), puis calculer son affichage et son décalage à partir de `timezone`. Cela donne l'heure et l'offset du système/fuseau configuré, pas une mesure de l'horloge interne du robot. Il faut donc vérifier que l'horloge de l'hôte est synchronisée (NTP) et que le fuseau `Europe/Paris` correspond bien à celui configuré sur le robot.

Si `utctime` est disponible, la conversion se fait par `new Date(utctime * 1000)` ; le timestamp Unix est en secondes dans la réponse documentée. L'offset documenté par `localtimeoffset` est exprimé en minutes (l'exemple donne `-180` pour UTC−03:00). Attention : `Date.prototype.getTimezoneOffset()` utilise la convention inverse (`UTC − heure locale`), et retourne donc `-60` pour Paris en hiver et `-120` en été.
