# Statuspage App

This is a service management application built with Next.js, React, and MongoDB. It allows users to manage services, track their status, and view event logs.

## Features

- User authentication with Auth0
- Service creation, updating, and deletion
- Service status management
- Event logging for services
- Dashboard with service statistics and recent events
- User management

## Prerequisites

- Node.js (v18 or later)
- MongoDB
- Auth0 account

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/kaybhutani/statuspage
   cd statuspage
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env.template` file to `.env`:
     ```
     cp .env.template .env
     ```
   - Open the `.env` file and fill in the required values:
     - Auth0 credentials (CLIENT_ID, CLIENT_SECRET, DOMAIN, etc.)
     - MongoDB connection string
     - Other configuration variables

4. Run the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

To deploy the application to a production environment:

1. Build the application:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

Make sure to set the appropriate environment variables in your production environment.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
