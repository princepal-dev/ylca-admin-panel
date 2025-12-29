# Environment Configuration

This project uses environment variables for configuration. Create a `.env` or `.env.local` file in the root directory with the following variables:

## Required Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080
```

## Development Setup

1. Copy the example above to `.env.local`
2. Modify the URLs for your environment

## Production Setup

For production deployment, set the environment variables in your hosting platform:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Available Variables

- `VITE_API_BASE_URL`: Base URL for the backend API (includes protocol, host, and port)

## Notes

- The admin panel uses Vite as the build tool, so environment variables must be prefixed with `VITE_` to be available in the client code
- All API calls are made relative to this base URL
