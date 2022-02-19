# effectualDAOTrackService

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
- Create a organisation in aragon client
- Choose a template
- Claim a name
- Configure your organisation with required actions
- Launch app and create a token for the organisation and respective token holders who participate in voting/decisions for the organisation
- Create a sample vote which would be used to track through our api service below.
- see [Aragon guide](https://help.aragon.org/collection/1-aragon-user-guide) for more information
## Concepts involved

-   DAO( Decentralized Autonomous Organization )
-   DAO connect using @aragon/connect
-   Fetch Apps in organisation
-   Fetch Votes from Voting app

## steps to run

### clone application

```
$ git clone https://github.com/ArjunMamidi2698/effectualDAOTrackService.git

$ cd effectualDAOTrackService
```

### .env file

-   After above steps create .env file in this path `effectualDAOTrackService/.env`

```
   SERVER_PORT=<port>
```

### install packages and start application

```
$ npm i

$ npm run start
```
