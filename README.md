## leaury-backend-app

### Setup

1) Install deps

```bash
npm install
```

2) Create your env file

- Copy `env.example` to `.env`
- Set your Mongo connection string:
  - **Preferred**: `MONGO_URI=...`
  - Also accepted: `MONGODB_URI=...` or `DATABASE_URL=...`

3) Run

```bash
npm run dev
```

If you see: `uri parameter to openUri() must be a string, got "undefined"`, it means your `.env` is missing **MONGO_URI** (or it’s named differently).



