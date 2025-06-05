CREATE SCHEMA `AfterLifeDB`;
USE AfterLifeDB;

-- 1. Role table (no dependencies)
CREATE TABLE Role (
    roleId CHAR(36) PRIMARY KEY,
    roleName VARCHAR(255)
);

-- 2. Building table (no dependencies)
CREATE TABLE Building (
    buildingID CHAR(36) PRIMARY KEY,
    buildingName VARCHAR(255),
    buildingLocation TEXT
);

-- 3. Level table (depends on Building)
CREATE TABLE Level (
    levelID CHAR(36) PRIMARY KEY,
    buildingID CHAR(36),
    levelNumber INT,
    notes TEXT,
    FOREIGN KEY (buildingID) REFERENCES Building(buildingID)
);

-- 4. Block table (depends on Level)
CREATE TABLE Block (
    blockID CHAR(36) PRIMARY KEY,
    levelID CHAR(36),
    levelNumber INT,
    notes TEXT,
    FOREIGN KEY (levelID) REFERENCES Level(levelID)
);

-- 5. User table (depends on Role)
CREATE TABLE User (
    userId CHAR(36) PRIMARY KEY,
    username VARCHAR(255),
    hashedPassword VARCHAR(255),
    fullName VARCHAR(255),
    contactNumber VARCHAR(20),
    nric VARCHAR(20),
    dob DATE,
    nationality VARCHAR(255),
    userAddress TEXT,
    appliedUrns TEXT,
    roleId CHAR(36),
    FOREIGN KEY (roleId) REFERENCES Role(roleId)
);

-- 6. Booking table (depends on User, will later be used by Niche and Payment)
CREATE TABLE Booking (
    bookingID CHAR(36) PRIMARY KEY,
    nicheID CHAR(36),         -- FK to Niche (but will define after Niche)
    paidByID CHAR(36),
    paymentID CHAR(36),       -- FK to Payment (will be created after)
    bookingType ENUM('Current', 'PreOrder'),
    FOREIGN KEY (paidByID) REFERENCES User(userId)
    -- FOREIGN KEYs to nicheID and paymentID later via ALTER after tables are created
);

-- 7. Niche table (depends on Block and Booking)
CREATE TABLE Niche (
    nicheID CHAR(36) PRIMARY KEY,
    blockID CHAR(36),
    nicheColumn INT,
    nicheRow INT,
    niche_code VARCHAR(50),
    status ENUM('Available', 'Pending', 'Reserved', 'Occupied'),
    lastUpdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    dateOfBirth DATE,
    dateOfDeath DATE,
    birthCertificate TEXT,
    deathCertificate TEXT,
    occupantName VARCHAR(50),
    FOREIGN KEY (blockID) REFERENCES Block(blockID)
);

-- 8. Now ALTER Booking table to add FK to Niche and Payment
ALTER TABLE Booking
    ADD FOREIGN KEY (nicheID) REFERENCES Niche(nicheID);

-- 9. Payment table (depends on Booking)
CREATE TABLE Payment (
    paymentID CHAR(36) PRIMARY KEY,
    amount FLOAT(10,2),
    paymentMethod VARCHAR(50),
    paymentDate DATE,
    paymentStatus ENUM('Pending', 'Cancelled', 'Refunded', 'Fully Paid')
);

-- 10. Now ALTER Booking table to add FK to Payment
ALTER TABLE Booking
    ADD FOREIGN KEY (paymentID) REFERENCES Payment(paymentID);

-- 11. Urn table (depends on User and Niche)
CREATE TABLE Urn (
    urnID CHAR(36) PRIMARY KEY,
    inscription TEXT,
    inserted_at TIMESTAMP,
    applicantID CHAR(36),
    nicheID CHAR(36),
    FOREIGN KEY (applicantID) REFERENCES User(userId),
    FOREIGN KEY (nicheID) REFERENCES Niche(nicheID)
);
