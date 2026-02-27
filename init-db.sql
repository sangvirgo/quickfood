-- Create databases for each service
CREATE DATABASE quickfood_core;
CREATE DATABASE quickfood_delivery;

-- Enable PostGIS extension on both databases
\c quickfood_core
CREATE EXTENSION IF NOT EXISTS postgis;

\c quickfood_delivery
CREATE EXTENSION IF NOT EXISTS postgis;
