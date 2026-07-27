#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE seatsync_user_db;
    CREATE DATABASE seatsync_event_db;
    CREATE DATABASE seatsync_booking_db;
EOSQL
