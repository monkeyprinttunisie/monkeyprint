# Next.js App Setup Guide

This guide provides step-by-step instructions to set up and run your Next.js application. Follow these steps carefully to ensure a smooth installation and setup.

## Prerequisites
Make sure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (Recommended: Latest LTS version)
- [pnpm](https://pnpm.io/) (will be installed in the next step)
- [Neon](https://neon.tech/) account for database setup

## Installation Steps

### 1. Open your terminal
Ensure you are in the root directory of the project before proceeding.

### 2. Install pnpm globally
Run the following command to install pnpm globally:

npm install -g pnpm


### 3. Verify pnpm installation
Check if pnpm is installed correctly:

pnpm --version

If the version is displayed, pnpm is installed successfully.

### 4. Install project dependencies
Navigate to the project root and install dependencies:

pnpm install


### 5. Navigate to the database package directory
Move into the packages/db folder:

cd packages/db


### 6. Create a .env file
Inside the /packages/db directory, create a .env file and add your database URL. You can use either a local database URL or a remote database URL (e.g., from Neon): 

DATABASE_URL="postgres://your-username:your-password@localhost:5432/your-database"
or 
DATABASE_URL="postgres://your-username:your-password@your-host:your-port/your-database"

### 7. Generate Prisma client
This command generates the Prisma client based on the current schema:

npx prisma generate


### 8. Apply database migrations
Run the following command to apply any pending database migrations:

npx prisma migrate dev


### 9. Push schema changes to the database
Ensure the schema is properly applied:

npx prisma db push


### 10. Open Prisma Studio (Database UI)
To inspect your database visually, run:

npx prisma studio


---

## Setting Up a Database on Neon
To use a remote PostgreSQL database, follow these steps:

### 1. Create a Neon Database
- Go to [Neon](https://neon.tech/)
- Sign up or log in
- Create a new PostgreSQL database
- Copy the DATABASE_URL from Neon (it will look like this):
  
  postgres://username:password@host:port/database


### 2. Update the .env file
- Navigate to packages/db
- Open the .env file
- Replace the existing DATABASE_URL with your Neon database URL:
  

  DATABASE_URL="postgres://your-username:your-password@your-host:your-port/your-database"


### 3. Re-run Prisma commands
After updating the .env file, run the following commands inside the /packages/db folder to sync the database:

npx prisma generate
npx prisma migrate dev
npx prisma db push


Your database is now set up and ready to use! 🚀

---

### Running the Application
Once the database setup is complete, return to the root directory and start your Next.js application:

pnpm dev


Now, open http://localhost:3000 in your browser to see your app in action. 🎉