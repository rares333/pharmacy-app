# --- Clone ---
git clone https://github.com/rares333/pharmacy-app.git

cd pharmacy-app

# --- Postgres via Docker (recommended) ---
docker run --name pharmacy-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# --- Create DB & user ---
docker exec -it pharmacy-pg psql -U postgres -c "CREATE ROLE pharmacy_user WITH LOGIN PASSWORD '1234';"

docker exec -it pharmacy-pg psql -U postgres -c "CREATE DATABASE pharmacy OWNER pharmacy_user;"

# --- Load schema ---
docker cp db/schema.sql pharmacy-pg:/schema.sql

docker exec -it pharmacy-pg psql -U pharmacy_user -d pharmacy -f /schema.sql

# --- Backend env & deps ---
cd backend

printf "DATABASE_URL=postgres://pharmacy_user:1234@localhost:5432/pharmacy\nPORT=8000\n" > .env

npm install

# (optional) categorize products from ATC/keywords
node scripts/categorize_from_atc.js

# start backend
node app.js
# (leave running; open a new terminal for the next steps)

# --- Frontend env & deps ---
cd ../frontend

printf "REACT_APP_API_URL=http://localhost:8000/api\n" > .env

npm install

npm start

If you don’t use Docker and already have Postgres locally, replace the DB steps with:

# create role & db locally (psql must be on PATH)
psql -U postgres -c "CREATE ROLE pharmacy_user WITH LOGIN PASSWORD '1234';"
psql -U postgres -c "CREATE DATABASE pharmacy OWNER pharmacy_user;"
psql -U pharmacy_user -d pharmacy -f db/schema.sql
