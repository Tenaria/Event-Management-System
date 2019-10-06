# Event Management System
To run the project, you will need both a backend server and a frontend server to be running at the same timeas such, run each in a separate terminal.

### Common Commands
`yarn start`, to run the frontend  
`php artisan serve`, to run the backend

`yarn install` to update the frontend packages  
`composer update --no-scripts` to update the backend packages

## Backend Setup
1. Download PHP 7.2 *(Minimum requirement)* and add it to your system environment
2. Install *[Composer](https://getcomposer.org/download/)*
3. Install *laravel* by running the following command `composer global require laravel/installer`
4. In the back-end folder, make sure you have an ***.env*** file. *(Just copy the **.env.example** file and remove .example)*
5. In the command line, run `composer update --no-scripts` to install / update the backend packages
6. Next, run `php artisan key:generate`
7. Finally, run `php artisan serve` to start the server on localhost:8000 *(This can be changed in the **.env** file)*

## Frontend Setup
1. Make sure you have *[node.js](https://nodejs.org/en/)* installed
2. Next, you need to install *[Yarn](https://yarnpkg.com/lang/en/docs/install)*
3. After you installed ***Yarn***, enter the front-end folder, run the following command `yarn install` to install / update the packages
4. Finally, run `yarn start` to start the frontend on localhost:3000.

## Project Proposal
[Click Here](https://docs.google.com/document/d/1-w7v9Rlvemvw2kY4GCaXRQ8yOQIgn346m-cODJI7PaI/edit?fbclid=IwAR2crQ6EXDGjrtEJXbBRhCDmGm6dFGwlbCzKYWsvFdRtyqRheAEuMT31vbI) to access the project proposal.
