# Testing and Debugging MERN App

## Overview
This project is a **MERN (MongoDB, Express, React, Node.js) application** with a strong focus on **reliability, testing, and debugging**. It includes unit tests for React components, custom hooks, and Redux slices to ensure stable and maintainable code.

---

## Features
- Fully functional **React frontend**.
- **Redux** state management with slices and actions.
- Custom React hooks (e.g., `useCounter`) tested with **@testing-library/react-hooks**.
- Components tested with **React Testing Library** and **Jest**.
- Utility functions tested with **Jest**.
- Debugging setup with proper **Babel configuration**.
- Peer dependency issues resolved for React 19 compatibility.

---

## Tech Stack
- **Frontend:** React, Redux, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Testing:** Jest, React Testing Library, @testing-library/react-hooks
- **Bundler:** Vite / Webpack (as per project setup)
- **Language:** JavaScript (ES6+)

---

## Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- MongoDB running locally or via a cloud provider

### Installation

1. Clone the repository:
```bash
git clone https://github.com/PLP-MERN-Stack-Development/deployment-and-devops-essentials-EUGEN254.git
cd testing-and-debugging-ensuring-mern-app-reliability-EUGEN254
Install dependencies for the client:

bash
Copy code
cd client
npm install --legacy-peer-deps
Install dependencies for the server:

bash
Copy code
cd ../server
npm install
Running the App
Development Mode
Frontend:

bash
Copy code
cd client
npm run dev
Backend:

bash
Copy code
cd server
npm run dev
Production Mode
bash
Copy code
cd server
npm start
The frontend will be served at http://localhost:5173 (if using Vite) or as configured.

Testing
This project uses Jest and React Testing Library.

Run all tests:

bash
Copy code
cd client
npm run test
Tests include:

Unit tests for React components

Hook tests using @testing-library/react-hooks

Utility function tests (e.g., formatDate)

Redux slice tests (e.g., counterSlice)

All tests are currently passing, ensuring application stability.

