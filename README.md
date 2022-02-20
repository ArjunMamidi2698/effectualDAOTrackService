# EffectualDAOTrackService

Api service to track a DAO

## Prerequisites

### Node

-   #### Ubuntu installation of Node

    You can install nodejs and npm easily with apt install, just run the following commands.

        $ sudo apt install nodejs
        $ sudo apt install npm

-   #### Other Operating Systems
    You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v12.10.0

    $ npm --version
    6.12.0

### DAO created using [aragon](https://client.aragon.org/#/)

-   Create a organisation in aragon client
-   Choose a template
-   Claim a name
-   Configure your organisation with required actions
-   Launch app and create a token for the organisation and respective token holders who participate in voting/decisions for the organisation
-   Create a sample vote which would be used to track through our api service below.
-   see [Aragon guide](https://help.aragon.org/collection/1-aragon-user-guide) for more information
-   Existing App( DAO_ADDRESS=effectual.aragonid.eth ) -> [Effectual]( https://client.aragon.org/#/effectual.aragonid.eth )
## Concepts involved

-   DAO( Decentralized Autonomous Organization )
-   DAO connect using @aragon/connect
-   Fetch Apps in organisation
-   Fetch Votes from Voting app

## Steps to run

### Clone application

```
$ git clone https://github.com/ArjunMamidi2698/effectualDAOTrackService.git

$ cd effectualDAOTrackService
```

### .env file

-   After above steps create .env file in this path `effectualDAOTrackService/.env`

```
   SERVER_PORT=<port> // server listents to this port
   DAO_ADDRESS=<DAO_ADDRESS> // org location/name( example: "effectual.aragonid.eth" ) or address for dao( we can get from organisation settings from the aragon app )
   NETWORK_ID=<NETWORK_ID> // 4 for rinkeby testnet
```

### Install packages and Start application

```
$ npm i

$ npm run start
```
For devlopement
```
$ npm run dev
```

## Api's exposed:

server port in the .env file should match the curl request port

```
    - curl http://localhost:2022/
        - retrieves organisation info for the given DAO_ADDRESS
    - curl http://localhost:2022/apps
        - retrieves all apps info of the organisation
    - curl http://localhost:2022/apps?name=<appName>
        - retrieves apps info filtered by name( voting, finance, ... )
    - curl http://localhost:2022/apps?address=<appAddress>
        - retrieves apps info filtered by app address
    - curl http://localhost:2022/votes
        - retrieves votes info from voting app
    - curl http://localhost:2022/token
        - retrieves token info for the organization from tokens app
    - curl http://localhost:2022/token-holders
        - retrieves token holders info

```
