# GEMINI.md

## Project Overview

This is the frontend for a CRM and IVR application for "ABIS Traders". It's built with React and Vite. The application is designed to manage customer interactions, including features like a dialer, call history, contact management, and user-specific dashboards.

**Key Technologies:**

*   **Framework:** React
*   **Build Tool:** Vite
*   **Routing:** React Router
*   **Styling:** Tailwind CSS
*   **API Communication:** Axios
*   **Real-time Communication:** Socket.IO Client
*   **Linting:** ESLint

**Architecture:**

*   The application uses a component-based architecture, with components organized by feature.
*   State management is handled through React Context API, with dedicated providers for Authentication, Dialer, Forms, Sockets, and User data.
*   Routing is split into public and protected routes, with authentication handled by `AuthContext`.
*   The main application entry point is `src/main.jsx`, which sets up the router and context providers. The root component is `src/App.jsx`.

## Building and Running

*   **Install Dependencies:**
    ```bash
    npm install
    ```

*   **Run Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3009`.

*   **Build for Production:**
    ```bash
    npm run build
    ```

*   **Lint Files:**
    ```bash
    npm run lint
    ```

*   **Preview Production Build:**
    ```bash
    npm run preview
    ```

## Development Conventions

*   **Styling:** Use Tailwind CSS for styling.
*   **State Management:** Use the React Context API for managing global state. For feature-specific state, consider custom hooks.
*   **API Calls:** Use the pre-configured Axios instance in `src/library/axios.js` for making API calls.
*   **Routing:** Use `react-router-dom` for navigation. Add new routes in `src/App.jsx`. Use the `ProtectedRoute` and `PublicRoute` components for authentication-based routing.
*   **Linting:** Adhere to the ESLint rules defined in `eslint.config.js`.



```
Traders-Frontend
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  ├─ icon-512.png
│  └─ sounds
│     ├─ button-click.mp3
│     ├─ dial-tone.mp3
│     └─ phone-ring.mp3
├─ README.md
├─ src
│  ├─ App.jsx
│  ├─ assets
│  ├─ components
│  │  ├─ CallRemarks
│  │  │  ├─ CallRemarksForm.jsx
│  │  │  ├─ CallRemarksPage.jsx
│  │  │  ├─ CustomerCallHistory.jsx
│  │  │  ├─ CustomerInfoPanel.jsx
│  │  │  └─ CustomerSearchBox.jsx
│  │  ├─ Dialer
│  │  │  └─ DialerPanel.jsx
│  │  ├─ Header.jsx
│  │  └─ Navbar.jsx
│  ├─ constants
│  ├─ context
│  │  ├─ AuthContext.jsx
│  │  ├─ Contexts.jsx
│  │  ├─ DialerContext.jsx
│  │  ├─ FormContext.jsx
│  │  ├─ Providers
│  │  │  ├─ AuthProvider.jsx
│  │  │  ├─ DialerProvider.jsx
│  │  │  ├─ FormProvider.jsx
│  │  │  ├─ SocketProvider.jsx
│  │  │  └─ UserProvider.jsx
│  │  ├─ SocketContext.jsx
│  │  └─ UserContext.jsx
│  ├─ hooks
│  │  ├─ useDialer.jsx
│  │  ├─ useForm.jsx
│  │  └─ useSocket.jsx
│  ├─ index.css
│  ├─ layouts
│  │  └─ DashboardLayout.jsx
│  ├─ library
│  │  └─ axios.js
│  ├─ main.jsx
│  ├─ page
│  │  ├─ Dashboard
│  │  │  ├─ CallHistory
│  │  │  │  └─ CallHistoryPage.jsx
│  │  │  ├─ Contacts
│  │  │  │  └─ ContactsPage.jsx
│  │  │  ├─ Dashboard.jsx
│  │  │  ├─ DashboardPage
│  │  │  │  └─ DashboardPage.jsx
│  │  │  ├─ IncomingCall
│  │  │  │  └─ IncomingCallPage.jsx
│  │  │  ├─ OutgoingCall
│  │  │  │  └─ OutgoingCallPage.jsx
│  │  │  └─ Profile
│  │  │     └─ ProfilePage.jsx
│  │  ├─ Login.jsx
│  │  └─ NotFound.jsx
│  └─ utils
│     ├─ ProtectedRoute.jsx
│     └─ PublicRoute.jsx
└─ vite.config.js

```