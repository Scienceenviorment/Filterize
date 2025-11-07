#!/bin/bash

# Navigate to the backend directory and start the Flask server
cd backend
export FLASK_APP=app.py
export FLASK_ENV=development
flask run &

# Navigate to the frontend directory and start the React application
cd ../frontend
npm start