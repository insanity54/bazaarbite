# Bazaarbite

[![Greenkeeper badge](https://badges.greenkeeper.io/insanity54/bazaarbite.svg)](https://greenkeeper.io/)

Break down your OpenBazaar selling experience into bite sized tasks or something idk idk idk

* keeps separate database of all items created in OpenBazaaar
* fires events when things happen in openbazaar
  * [ ] customer pays for digital item
  * [ ] customer
* plugin support to manage your items
  * [x] lib/randomFollower.js - picks a random follower (used in ob://@saveabit weekly giveaways)


## Usage

create an environment file, `.env` with the following contents--

```
OB_PASSWORD=enter_your_openbazaar_login_password
OB_USERNAME=enter_your_openbazaar_login_username
OB_HOST=123.456.789.123
OB_PORT=18469
OB_PROTO=https
OB_CA=/path/to/your/rootCA.crt
```

or if your store is super insecure (no SSL)--

```
OB_PASSWORD=enter_your_openbazaar_login_password
OB_USERNAME=enter_your_openbazaar_login_username
OB_HOST=123.456.789.123
OB_PORT=18469
OB_PROTO=http
```


then run the program or something


    nf run index