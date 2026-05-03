# FullStackApp

A mini Twitter-style full-stack web application built with Flask, SQLite, and vanilla JavaScript.

The app allows users to sign up, sign in, view user data, post messages to user walls, and retrieve messages through a REST API. It also includes basic session/token handling and WebSocket support for handling active sign-in sessions.

## Features

- User registration and login
- Token-based authentication
- Sign out functionality
- User profile data retrieval
- Post messages to a user's wall
- View messages by user email or active token
- SQLite database integration
- REST API backend using Flask
- WebSocket support using Flask-Sock
- Frontend served from static HTML, CSS, and JavaScript files

## Tech Stack

- Python
- Flask
- Flask-Sock
- SQLite
- JavaScript
- HTML
- CSS

## Project Structure

```text
App/
├── static/
│   ├── client.html
│   ├── client.css
│   ├── client.js
│   └── wimage.png
├── database.db
├── database_helper.py
├── info.txt
├── requirements.txt
├── schema.sql
└── server.py





