-- create default user for access to AfterLifeDB
CREATE SCHEMA `AfterLifeDB` ;

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

-- insert dummy data into User table
INSERT INTO User (
    userId,
    username,
    password,
    fullName,
    contactNumber,
    nric,
    dob,
    nationality,
    address,
    appliedUrns
)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',  -- example UUID
    'demoUser',
    'hashedPassword123!',                   -- replace with real hashed password if needed
    'John Doe',
    '98765432',
    'S1234567A',
    '1990-01-01',
    'Singaporean',
    '123 Sample Street, SG 54321',
    '["urn123", "urn456"]'                 -- JSON array as string
);

SELECT * FROM User;