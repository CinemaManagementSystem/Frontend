# 🎬 CINEMATIQUE - Modern Cinema Booking Platform

Cinematique is a modern, high-performance web application for movie discovery, real-time seat reservation, and cinema ticket booking. Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Zustand**.

---

## ✨ Features

- **🎬 Movie Discovery**: Browse trending movies, premieres, coming soon, and now showing films with search and category filtering.
- **📄 Dedicated Movie Catalog (`/movies`)**: Full catalog with search by title or genre and category pills.
- **🎟️ Movie Details & Trailer Player (`/movies/:id`)**: Rich movie information, embedded official trailers, synopsis, cast details, date selection, and showtime schedules.
- **💺 Interactive Seat Booking (`/booking/:showtimeId`)**: Visual cinema seat map (Regular & VIP seats) with real-time price calculation and checkout.
- **📜 Ticket Booking History (`/history`)**: View confirmed tickets with scannable QR codes and cinema hall information.
- **🛡️ Admin Dashboard (`/admin`)**:
  - **Metrics Overview (`/admin/dashboard`)**: Total revenue, ticket sales, active movies, and occupancy rates.
  - **Movie Management (`/admin/movies`)**: Add, edit, and remove movies.
  - **Booking Management (`/admin/bookings`)**: Manage customer reservations and statuses.
  - **User Management (`/admin/users`)**: Manage registered user accounts and roles.
- **🔐 Authentication**: Sign In and Sign Up pages with instant role-switching demo mode.
- **🍿 Dedicated Cinemas Page (`/cinemas`)**: Standalone page showcasing cinematic viewing formats (IMAX, Dolby Atmos, VIP Recliners) and flagship theater locations.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + Custom Glassmorphism Theme |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **HTTP Client** | [Axios](https://axios-http.com/) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Sothearith22/Cinema-Project.git

# Navigate into Frontend
cd Frontend

# Install dependencies
npm install
```

### Running Locally

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

### Building for Production

```bash
npm run build
npm run preview
```

---

## 🧭 Application Routes

| Path | Description | Layout |
| :--- | :--- | :--- |
| `/` | Homepage (Featured banner, premieres, cinema technology) | `Mainlayout` |
| `/movies` | Dedicated Movies Catalog with filters and search | `Mainlayout` |
| `/movies/:id` | Movie Details, showtimes schedule, and trailer modal | `Mainlayout` |
| `/booking/:showtimeId` | Interactive seat selection & checkout | `Mainlayout` |
| `/history` | User ticket history & QR passes | `Mainlayout` |
| `/cinemas` | Showcase of premium formats and local theater locations | `Mainlayout` |
| `/login` | User login | `AuthLayout` |
| `/register` | User registration | `AuthLayout` |
| `/admin/dashboard` | Admin analytics & summary | `DashboardLayout` |
| `/admin/movies` | Admin movie catalog management | `DashboardLayout` |
| `/admin/bookings` | Admin booking orders | `DashboardLayout` |
| `/admin/users` | Admin user directory | `DashboardLayout` |

---

## 📚 Documentation

Detailed architectural and coding documentation is available in the [`src/docs/`](file:///d:/Project/ETEC_Project/Frontend/src/docs) folder and [`PROJECT_STRUCTURE.md`](file:///d:/Project/ETEC_Project/Frontend/PROJECT_STRUCTURE.md):

- [🤖 AI Agent & Developer Guide](file:///d:/Project/ETEC_Project/Frontend/agent_guide.md)
- [01 - Project Structure](file:///d:/Project/ETEC_Project/Frontend/src/docs/01-project-structure.md)
- [02 - Folder Guidelines](file:///d:/Project/ETEC_Project/Frontend/src/docs/02-folder-guidelines.md)
- [03 - Coding Conventions](file:///d:/Project/ETEC_Project/Frontend/src/docs/03-coding-conventions.md)
- [04 - Component Guidelines](file:///d:/Project/ETEC_Project/Frontend/src/docs/04-component-guidelines.md)
- [05 - API Services](file:///d:/Project/ETEC_Project/Frontend/src/docs/05-api-services.md)
- [06 - Animations & Routing](file:///d:/Project/ETEC_Project/Frontend/src/docs/06-animations-routing.md)
- [API Endpoints Specification](file:///d:/Project/ETEC_Project/Frontend/src/docs/APIEndpoint.md)
