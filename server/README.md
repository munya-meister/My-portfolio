# Portfolio Backend

Minimal Express backend to upload and serve certificates and projects.

Usage:

Install deps:

```bash
cd server
npm install
```

Run:

```bash
npm run dev
```

API endpoints:

- `GET /api/certificates` - list certificates
- `GET /api/projects` - list projects
- `POST /api/certificates` - upload certificate (multipart form: file + fields)
- `POST /api/projects` - upload project (multipart form: file + fields)

Uploaded files are served under `/uploads`.
