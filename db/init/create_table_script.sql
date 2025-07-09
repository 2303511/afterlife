DROP SCHEMA IF EXISTS `AfterLifeDB`; -- If the schema exsists, then the code will end at line 2 and no tables will be created :(
CREATE SCHEMA `AfterLifeDB`;
USE AfterLifeDB;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Booking;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Beneficiary;
DROP TABLE IF EXISTS Niche;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Block;
DROP TABLE IF EXISTS Level;
DROP TABLE IF EXISTS Building;
DROP TABLE IF EXISTS Role;
DROP TABLE IF EXISTS sessions;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Role table (no dependencies)
CREATE TABLE Role (
    roleID CHAR(36) PRIMARY KEY,
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
    FOREIGN KEY (buildingID) REFERENCES Building(buildingID)
);

-- 4. Block table (depends on Level)
CREATE TABLE Block (
    blockID CHAR(36) PRIMARY KEY,
    levelID CHAR(36),
    blockName VARCHAR(50),
    FOREIGN KEY (levelID) REFERENCES Level(levelID)
);

-- 5. User table (depends on Role)
CREATE TABLE User (
    userID CHAR(36) PRIMARY KEY,
    username VARCHAR(255) UNIQUE, -- add unique
    email VARCHAR(255) UNIQUE, -- add unique
    hashedPassword VARCHAR(255),
    salt VARCHAR(255), 
    currentSessionID VARCHAR(128) COLLATE utf8mb4_bin,
    failLoginCount INT DEFAULT 0,
    accountCreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, 
    lastLogin DATETIME NULL,
    fullName VARCHAR(255),
    contactNumber VARCHAR(20) UNIQUE, -- add unique
    nric VARCHAR(20) UNIQUE, -- add unique
    dob DATE,
    nationality VARCHAR(255),
    userAddress TEXT,
    gender ENUM('Male', 'Female', 'Others'),
    roleID CHAR(36),
    temp2FASecret VARCHAR(255) NULL,
    twoFASecret VARCHAR(255) NULL,
    twoFAEnabled BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (roleID) REFERENCES Role(roleID)
);

-- 6. Niche table (depends on Block and Booking)
CREATE TABLE Niche (
    nicheID CHAR(36) PRIMARY KEY,
    blockID CHAR(36),
    nicheColumn INT,
    nicheRow INT,
    nicheCode VARCHAR(50),
    status ENUM('Available', 'Pending', 'Reserved', 'Occupied'),
    changeRemarks VARCHAR(255) NULL, -- admin comments on why this niche status was overriden
    lastUpdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (blockID) REFERENCES Block(blockID)
);

-- 7. Payment table (depends on Booking)
CREATE TABLE Payment (
    paymentID CHAR(36) PRIMARY KEY,
    amount FLOAT(10,2),
    paymentMethod VARCHAR(50),
    paymentDate DATE,
    paymentStatus ENUM('Pending', 'Cancelled', 'Refunded', 'Fully Paid')
);

-- 8. Urn table (depends on User and Niche)
CREATE TABLE Beneficiary (
    beneficiaryID CHAR(36) PRIMARY KEY,
    beneficiaryName VARCHAR(50),
    gender ENUM('Male', 'Female', 'Others'),
    nationality VARCHAR(255),
    nric VARCHAR(20),
    beneficiaryAddress TEXT,
    dateOfBirth DATE,
    dateOfDeath DATE,
    birthCertificate LONGBLOB,
    birthCertificateMime VARCHAR(100),
    deathCertificate LONGBLOB,
    deathCertificateMime VARCHAR(100),
    relationshipWithApplicant ENUM('Mother', 'Father', 'Sibling', 'Relative', 'Others'),
    insertedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    lastUpdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. Booking table (depends on User, will later be used by Niche and Payment)
CREATE TABLE Booking (
    bookingID CHAR(36) PRIMARY KEY,
    nicheID CHAR(36),         
    paidByID CHAR(36),
    paymentID CHAR(36),
    beneficiaryID CHAR(36),
    bookingType ENUM('Current', 'PreOrder', 'Archived'),
    bookingStatus ENUM('Pending', 'Cancelled', 'Confirmed'),
    FOREIGN KEY (nicheID) REFERENCES Niche(nicheID),
    FOREIGN KEY (paidByID) REFERENCES User(userID),
    FOREIGN KEY (paymentID) REFERENCES Payment(paymentID),
    FOREIGN KEY (beneficiaryID) REFERENCES Beneficiary(beneficiaryID)
);

CREATE TABLE sessions (
  `session_id` VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
  `expires`    INT UNSIGNED NOT NULL,
  `data`       TEXT         COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB;

CREATE TABLE PasswordResetToken (
  tokenID INT AUTO_INCREMENT PRIMARY KEY,
  userID CHAR(36) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expiresAt DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES User(userID) ON DELETE CASCADE,
  UNIQUE(token)
);

-- 9. for niche logging
CREATE TABLE NicheStatusLog (
    logID INT AUTO_INCREMENT PRIMARY KEY,
    nicheID CHAR(36),
    previousStatus ENUM('Available', 'Pending', 'Reserved', 'Occupied'),
    newStatus ENUM('Available', 'Pending', 'Reserved', 'Occupied'),
    reason TEXT,
    changedBy CHAR(36), 
    changedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (changedBy) REFERENCES User(userID),
    FOREIGN KEY (nicheID) REFERENCES Niche(nicheID) ON DELETE SET NULL -- log gets kept even if niche is deleted
);

