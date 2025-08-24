# Server (Express + MySQL + Sequelize)

## Setup
1. Copy `.env.example` to `.env` and set values.
2. Create the database in MySQL: `CREATE DATABASE ratings_app;`
3. Install: `npm i`
4. (Optional) Seed dev data (drops tables): `npm run seed`
5. Run dev: `npm run dev`

## Notes
- JWT-based auth for all roles
- Password policy enforced server-side
- Filtering, sorting, pagination on list endpoints
- Composite unique index on (user_id, store_id) in ratings
