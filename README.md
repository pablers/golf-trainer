# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Running the Full Application (Frontend + Backend)

This project now includes a backend server to store and manage data. To run the full application, you will need to run both the frontend and the backend servers.

### 1. Running the Backend

The backend is a Node.js server located in the `backend` directory. For detailed instructions on how to set it up and run it, please see the [backend/README.md](backend/README.md) file.

In summary, you will need to:
1.  Install dependencies: `cd backend && npm install`
2.  Set up a PostgreSQL database and configure the `.env` file.
3.  Run database migrations: `npx prisma migrate dev`
4.  Start the backend server: `npm run dev` (from the `backend` directory)

The backend server will run on `http://localhost:3001`.

### 2. Running the Frontend

The frontend is a React application. To run it, navigate to the root directory of the project and run the following commands:

1.  Install dependencies: `npm install`
2.  Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key.
3.  Start the frontend server: `npm run dev`

The frontend development server will start on `http://localhost:5173`.

Once both servers are running, you can open `http://localhost:5173` in your browser to use the application.
