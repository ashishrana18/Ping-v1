# Ping

**Ping** is a real-time messaging platform that supports direct and group chats—including a secret chat feature with end-to-end encryption for private communications. The application uses modern technologies and performance optimizations to deliver a seamless user experience.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript, React, Tailwind CSS
- **Backend:** Express, Prisma, PostgreSQL, Redis, Socket.IO
- **Others:** JWT authentication, server-side rate limiting, and Redis caching

## Features

- **Real-Time Messaging:**  
  Instant messaging via Socket.IO with an Optimistic UI for low-latency updates.
- **Direct & Group Chats:**  
  Chat one-on-one or in groups.
- **Secret Chat:**  
  Secure secret chats where messages are ephemeral and automatically removed after 5 minutes of inactivity.
- **Performance Optimizations:**  
  Uses Redis caching and server-side rate limiting to efficiently handle high volumes of messages.
- **Secure Authentication:**  
  JWT-based authentication ensures only authorized users can access the system.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) database
- [Redis](https://redis.io/) server

### Clone the Repository

```bash
git clone https://github.com/yourusername/ping.git
cd ping


# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/ping_db

# Redis connection URL
REDIS_URL=redis://localhost:6379

# Server port
PORT=8000

# JWT secret for authentication
ACCESS_TOKEN_SECRET="your key"
ACCESS_TOKEN_EXPIRY="1d"
REFRESH_TOKEN_SECRET="your key"
REFRESH_TOKEN_EXPIRY="7d"

```

## API Endpoints
### User Authentication & Profile
- **POST /api/auth/login**
Login endpoint for user authentication.

- **POST /api/auth/register**
User registration endpoint.

# API Documentation

## User Endpoints

### GET /api/user/profile  
Fetch the authenticated user's profile.

### GET /api/user/online/:userId  
Check if a user is online.

## Chat Routes

### POST /api/chat/create  
Create a new chat (direct or group).

### GET /api/messages/:chatId  
Fetch messages for a specific chat.

### DELETE /api/chat/:chatId  
Delete a chat or trigger message cleanup.

## Secret Chat Routes

### POST /api/secret/create  
Save a secret message.  
- The controller hashes the message and stores it in Redis under a key like `secret:<chatId>` using a sorted set.  
- Each message is stored with a score equal to its timestamp.

### GET /api/secret/:chatId  
Retrieve secret messages for a given chat from the last 5 minutes.

### DELETE /api/secret/:chatId  
Remove expired secret messages (older than 5 minutes).

## Socket.IO

Ping uses Socket.IO for real-time messaging. Key events include:

- **joinRoom:**  
  Clients emit this event to join a chat room (both for regular and secret chats).

- **sendMessage / receiveMessage:**  
  Used for direct or group chats.

- **sendSecretMessage / receiveSecretMessage:**  
  Used specifically for secret chats.

> **Note:** Ensure that your frontend Socket.IO client is configured with the correct URL (e.g., `http://localhost:8000`) and that CORS settings on your backend allow connections from your frontend's origin.

## How It Works

### User Authentication
- Users register and log in using JWT-based authentication.
- The JWT token is used to secure API requests.

### Chat Functionality
- Users can start direct or group chats.
- Secret chats are initiated only when the friend is online.
- In secret chats, messages are stored in Redis with a TTL of 5 minutes.
- A background process (or long polling) triggers cleanup of messages older than 5 minutes.  
  If no messages remain, the secret chat is considered expired and users are redirected to the home page.

### Real-Time Updates
- Socket.IO handles real-time messaging.
- When a message is sent, it is emitted to the appropriate room so that all clients in that room receive the update.

### Client-Side UI
- **ChatNavbar:** Displays friend information, online status, and a button to start a secret chat.
- **SecretChatPage:** Displays secret chat messages, a header, and an input area.
- The UI uses Tailwind CSS for styling and responsive design.

## Running Tests & Debugging

### Postman
Use Postman to test your API endpoints (e.g., `/api/secret/create`, `/api/secret/:chatId`).

### Socket.IO Testing
Use your browser’s developer tools or a dedicated Socket.IO client to verify that events like `joinRoom`, `sendMessage`, and `receiveSecretMessage` are working correctly.

### Redis Insights
Use Redis Insights or the Redis CLI to monitor your Redis keys and ensure that secret messages expire as expected.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request with improvements or bug fixes.

## License
This project is licensed under the MIT License.

