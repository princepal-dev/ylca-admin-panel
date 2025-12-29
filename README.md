# YLCA Admin Panel

A modern React admin panel for managing the YLCA blogging system, built with TypeScript, Redux Toolkit, and shadcn/ui components.

## Features

- **Authentication**: Secure login/logout with JWT tokens
- **Dashboard**: Overview of blogs, users, and system statistics
- **Blog Management**: Create, read, update, and delete blog posts
- **Image Management**: Upload and manage multiple images per blog post
- **User Management**: Admin can create and manage user accounts
- **Profile Management**: Users can update their profile information
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes for better user experience

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **UI Components**: shadcn/ui with Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Theming**: next-themes for dark/light mode

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Running YLCA backend server (default: http://localhost:8080)

### Installation

1. Navigate to the admin panel directory:
   ```bash
   cd ylca-admin-panel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Backend Configuration

Update the API base URL in `src/lib/api.ts` if your backend is running on a different port:

```typescript
const api = axios.create({
  baseURL: 'http://localhost:8080', // Change this to match your backend URL
  // ...
});
```

## Usage

### Login

- Use admin credentials to log in
- Default admin account is created during backend setup

### Dashboard

- View system statistics and recent activity
- Monitor blog and user counts

### Blog Management

- **View Blogs**: Browse all blogs with search functionality
- **Create Blog**: Add new blog posts with rich text and images
- **Edit Blog**: Update existing blogs and manage images
- **Delete Blog**: Remove blogs with confirmation dialogs

### Image Management

- Upload multiple images per blog post
- Reorder images with display order
- Download or delete individual images
- Automatic image preview generation

### User Management

- View all users with their roles and information
- Create new user accounts (Admin only)
- Delete user accounts with confirmation

### Profile Management

- Update personal information
- Change profile details like name and phone number

## User Roles

- **Admin**: Full access to all features including user management
- **Collaborator**: Can create and manage their own blogs

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Layout.tsx      # Main layout with sidebar
│   └── ThemeProvider.tsx
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── BlogsPage.tsx
│   ├── CreateBlogPage.tsx
│   ├── BlogDetailPage.tsx
│   ├── EditBlogPage.tsx
│   ├── UsersPage.tsx
│   └── ProfilePage.tsx
├── store/              # Redux store
│   ├── slices/         # Redux slices
│   └── index.ts
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
│   ├── api.ts          # Axios configuration
│   └── utils.ts        # Utility functions
└── App.tsx             # Main app component
```

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for type safety
3. Follow React best practices
4. Test your changes thoroughly

## License

This project is part of the YLCA blogging system.