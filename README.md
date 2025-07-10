# IVR and CRM for ABIS Traders
- application developed for abis traders to manage.

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
│  │  ├─ Dialer
│  │  │  ├─ CallRemarksPage.jsx
│  │  │  └─ DialerPanel.jsx
│  │  ├─ Header.jsx
│  │  └─ Navbar.jsx
│  ├─ constants
│  ├─ context
│  │  ├─ AuthContext.jsx
│  │  ├─ Contexts.jsx
│  │  ├─ DialerContext.jsx
│  │  ├─ Providers
│  │  │  ├─ AuthProvider.jsx
│  │  │  ├─ DialerProvider.jsx
│  │  │  └─ UserProvider.jsx
│  │  └─ UserContext.jsx
│  ├─ hooks
│  │  └─ useDialer.jsx
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


Notes-
1. DailerPanel line no- 729  /// Outgoing Call -> Incoming Call