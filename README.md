## Description

The NFT Concert Ticketing Project is a cutting-edge Web3-based platform designed to revolutionize event ticketing by leveraging blockchain technology. This project empowers event organizers to seamlessly create, manage, and sell event tickets as Non-Fungible Tokens (NFTs), while providing users with a secure, transparent, and efficient way to purchase and verify event tickets. By integrating blockchain technology, we eliminate fraud, ensure ticket authenticity, and enable a decentralized marketplace for event ticketing.

# Prerequisites

Install Docker
Install Docker Compose
Node.js

## Project structure

```
src/
├── common/ # Shared resources
│ ├── decorators/ # Attach metadata to a class, method, property, or parameter
│ ├── guards/ # Authorization guards to control access to routes
│ ├── pipes/ # Input data processing (validating and transforming)
│ └── strategies/ # Handle various authentication methods
├── config/ # Customize configuration files
├── controller/ # Handles API requests 
├── database/ # Database configurations/connections
├── dto/ # Defines data structures used for request validation and API response
├── entities/ # Entity definitions that map to database tables
├── services/ # Handles business logic and interacts with the database
├── .env.example # Provide a configuration template for variables
├── .env.dev # Environment variables for development environment
├── .env.prod # Environment variables for production environment
├── app.module.ts # The main module that imports and organizes other modules
├── Dockerfile # Docker setup to run the application in a containerized environment
└── main.ts # Application entry point
```

## Tech Stack

```
Framework: NestJS
Database: PostgreSQL + TypeORM
Authentication: JWT-based authentication
API Documentation: Swagger (OpenAPI)
Caching: Cache-manager
Containerization: Docker & Docker Compose
File Uploads: Cloudinary integration
```

## Features

```
Authentication & Authorization (JWT-based)
Role-based Access Control (RBAC)
RESTful API with Swagger Documentation
PostgreSQL Database Integration with TypeORM
Caching Mechanism
File Uploads via Cloudinary
Docker Support for Deployment
Environment Variable Validation using Joi
```

## Dependencies

```
{
  "dependencies": {
  "@nestjs/cache-manager": "^3.0.0",
  "@nestjs/common": "^11.0.1",
  "@nestjs/config": "^4.0.0",
  "@nestjs/core": "^11.0.1",
  "@nestjs/jwt": "^11.0.0",
  "@nestjs/passport": "^11.0.5",
  "@nestjs/platform-express": "^11.0.1",
  "@nestjs/typeorm": "^11.0.0",
  "buffer-to-stream": "^1.0.0",
  "cache-manager": "^6.4.1",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.14.1",
  "cloudinary": "^2.5.1",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "ethers": "^6.13.5",
  "joi": "^17.13.3",
  "nestjs-pino": "^4.3.1",
  "nodemailer": "^6.10.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "pg": "^8.13.3",
  "reflect-metadata": "^0.2.2",
  "rxjs": "^7.8.1",
  "typeorm": "^0.3.20",
  "uuid": "^11.1.0"
  }
}
```

## Project setup

```bash
# Clone the repository
git clone https://github.com/Ekotek/NFT_Concert_Git
# Navigate to the project directory
cd nft-concert-ticket-be
# Install dependencies
npm install
# Configure environment variables
cp .env.example .env
```

# Build and start the containers

docker-compose up --build -d

# Check running containers

docker ps

## Accessing the Database

You can connect to the database using a tool like psql or pgAdmin with the following details:
Host: <DB_HOST>
Port: <DB_PORT>
User: <DB_USERNAME>
Password: <DB_PASSWORD>
Database: <DB_NAME>

## Interacting database with migrations:

```bash
# Generate a new migration

npm run migration:generate -n your_migration_path/your_migration_name

# Run unapplied migrations

npm run migration:run

# Revert applied migrations

npm run migration:revert
```

## Compile and run the project

```bash
# development
$ npm run start
# watch mode
$ npm run start:dev
# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test
```

## API Documentation

Swagger is available at:
http://localhost:<PORT>/api-docs

## Deployment
