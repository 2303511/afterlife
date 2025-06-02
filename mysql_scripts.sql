-- create default user for access to AfterLifeDB
CREATE SCHEMA `AfterLifeSchema` ;

CREATE DATABASE AfterLifeDB;
CREATE USER 'ITAdmin'@'%' IDENTIFIED BY 'AfterLifeITAdmin';
GRANT ALL PRIVILEGES ON AfterLifeDB.* TO 'ITAdmin'@'%';
FLUSH PRIVILEGES;
EXIT;

USE AfterLifeDB; 

-- user table
CREATE TABLE User (
    userId CHAR(36) PRIMARY KEY,  -- UUID format
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(255),
    contactNumber VARCHAR(20),
    nric VARCHAR(20),
    dob DATE,
    nationality VARCHAR(255),
    address TEXT,
    appliedUrns JSON  -- assuming this stores an array or structured data
);
