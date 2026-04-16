# 🏠 RF Marketing - Lead Management Dashboard

A premium, full-stack lead management platform built for RentAFlow. Built with React, TypeScript, Vite, Express.js, and Airtable integration.

## ✨ Features

- **Dashboard**: Real-time KPIs, funnel analytics, and activity feeds
- **Lead Management**: Comprehensive lead table with filtering, sorting, and inline editing
- **Pipeline Kanban**: Drag-and-drop board for managing leads through sales pipeline stages
- **Agencias Base**: Import and export functionality for bulk lead management
- **Lead Details Modal**: Complete lead information with timeline, notes, and journey tracking
- **Multi-Role Authentication**: Admin, Commercial, Demo, Onboarding roles with granular permissions
- **Notifications**: Real-time updates when leads are modified by team members
- **Statistics**: Advanced analytics on conversion rates, time in stage, and trends
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🎨 Design System

- **Dark Glassmorphic Theme**: Premium aesthetic with warm-tinted surfaces
- **Playful Animations**: Spring-based motion (cubic-bezier damping) for delightful interactions
- **Component Library**: 
  - 4 button variants (primary, secondary, ghost, accent)
  - Enhanced badges with glow effects
  - Input fields with spring focus animations
  - Smart tables with row distinction
  - Reusable modals and cards

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Build tool with hot module reloading
- **Tailwind CSS** - Utility-first styling
- **React Query (TanStack)** - Server state management
- **Zustand** - Client state management
- **Lucide React** - Icon library
- **Radix UI** - Headless UI components

### Backend
- **Express.js** - REST API server
- **TypeScript** - Type-safe backend
- **Airtable API** - Database integration
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **node-cache** - Response caching

### Data & Infrastructure
- **Airtable** - Backend database
- **Node.js** - Runtime environment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Airtable account with API access
- GitHub CLI (optional, for gh CLI commands)

### Setup Environment Variables

Create `.env` file in root directory:
```bash
# Frontend API configuration
VITE_API_URL=/api

# Backend Airtable configuration
AIRTABLE_PAT=your_airtable_personal_access_token
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_LEADS_TABLE_ID=your_leads_table_id
AIRTABLE_AGENCIAS_BASE_TABLE_ID=Agencias Base
AIRTABLE_AGENCIAS_TABLE_ID=Agencias

# Server configuration
JWT_SECRET=your_jwt_secret_key
PORT=3006
```

### Installation & Running

```bash
# Install dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Start both frontend and backend
npm run dev

# Frontend will run on: http://localhost:5176
# Backend will run on: http://localhost:3006
```

### Create Admin User

```bash
cd server
npm run create-admin
```

## 📁 Project Structure

```
rf-marketing/
├── src/                          # React frontend
│   ├── components/              # React components (layout, leads, dashboard, etc)
│   ├── api/                     # React Query hooks for API calls
│   ├── stores/                  # Zustand stores (auth, notifications, UI state)
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities, constants, helpers
│   ├── styles/                  # Global styles and design tokens
│   └── types/                   # TypeScript type definitions
│
├── server/                      # Express backend
│   └── src/
│       ├── routes/             # API endpoints
│       ├── middleware/         # Auth middleware
│       ├── services/           # Airtable service layer
│       ├── utils/              # Utilities (JWT, password hashing)
│       └── scripts/            # Admin creation, setup scripts
│
└── public/                      # Static assets
```

## 🔐 Authentication

The app uses JWT-based authentication with role-based access control:

- **Admin**: Full access to all features and user management
- **Commercial**: Lead management with state transition restrictions
- **Demo**: Limited to demo-stage leads
- **Onboarding**: Post-sale customer onboarding

Login credentials are stored in Airtable's USUARIOS table.

## 📊 Data Models

### Lead (AGENCIAS table)
- Basic info: name, province, zone
- Contact: email, phone, website
- Marketing: source, rental type, active listings
- Status: current state, priority, validation date
- Notes: internal comments

### User (USUARIOS table)
- Email (unique identifier)
- Password hash
- Role (admin, commercial, demo, onboarding)
- Saved filters (JSON)

## 🔄 API Endpoints

```
Authentication
POST   /api/auth/login

Leads
GET    /api/leads (with filters: status, fuente, provincia, search)
GET    /api/leads/:id
PATCH  /api/leads/:id
GET    /api/agencias-base

Statistics
GET    /api/stats/kpis
GET    /api/stats/funnel
GET    /api/stats/by-source
GET    /api/stats/by-province

Users (admin only)
GET    /api/users
POST   /api/users
PATCH  /api/users/:id
DELETE /api/users/:id
```

## 🎯 Key Features in Detail

### Export Agencias Base
- Bulk import agencies from "Agencias Base" table
- Field validation ensures data integrity
- Computed fields are properly handled
- Auto-deletion from source after successful export

### Lead Details Modal
- Multi-tab interface: Information, Journey, Notes, Filters
- Real-time updates across all users
- Support for inline editing
- Custom filter saving

### Pipeline Kanban
- Drag-and-drop lead management
- Role-based column restrictions
- Bulk state transitions
- Optimistic updates

## 🧪 Testing

```bash
# Run frontend tests
npm run test

# Run backend tests
cd server && npm run test
```

## 📝 Development

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

Proprietary - RentAFlow

## 📞 Support

For issues or questions, contact the development team.

---

Built with ❤️ by Claude Code
