# wChallenge

* Setup
  - Install node version [^14.16.0] (https://nodejs.org/en/)
  - Create a postgres database
  - npm i
  - cp .env.example .env
  - set your environment variables values in the .env file
  - npm run knex migrate:latest

* Start server in develop mode
  - npm run dev

* Start server
  - npm run start

* Run tests
  - npm run test

* Run tests with coverage dashboard
  - npm run nycTest

* Activate githooks
  - git config core.hooksPath .githooks 