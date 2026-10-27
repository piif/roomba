#!/bin/bash -eu

# to put in a crontab for each DST day
# for France, it's last sunday of april and october, thus
# 00 5 24-31 4,10 0,1 /path/to/update_tz.sh >> /var/log/user/roomba/update_tz.log

curl localhost:3000/api/tz_offset -XPUT -H 'Content-Type: application/json' -d "{\"offset\":\"$(date +\%z)\"}"
