CREATE SCHEMA `AfterLifeDB`;

USE AfterLifeDB;

-- Role table
CREATE TABLE Role (
    roleId CHAR(36) PRIMARY KEY,
    roleName VARCHAR(255)
);

-- User table
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

-- Building table
CREATE TABLE Building (
    buildingID CHAR(36) PRIMARY KEY,
    buildingName VARCHAR(255),
    buildingLocation TEXT
);

-- Level table
CREATE TABLE Level (
    levelID CHAR(36) PRIMARY KEY,
    buildingID CHAR(36),
    levelNumber INT,
    notes TEXT,
    FOREIGN KEY (buildingID) REFERENCES Building(buildingID)
);

-- Block table
CREATE TABLE Block (
    blockID CHAR(36) PRIMARY KEY,
    levelID CHAR(36),
    levelNumber INT,
    notes TEXT,
    FOREIGN KEY (levelID) REFERENCES Level(levelID)
);

-- Niche table
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
    bookingID CHAR(36),
    FOREIGN KEY (blockID) REFERENCES Block(blockID),
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID)
);

-- Urn table
CREATE TABLE Urn (
    urnID CHAR(36) PRIMARY KEY,
    inscription TEXT,
    inserted_at TIMESTAMP,
    applicantID CHAR(36),
    nicheID CHAR(36),
    FOREIGN KEY (applicantID) REFERENCES User(userId),
    FOREIGN KEY (nicheID) REFERENCES Niche(nicheID)
);

-- Booking table
CREATE TABLE Booking (
    bookingID CHAR(36) PRIMARY KEY,
    nicheID CHAR(36),
    paidByID CHAR(36),
    paymentID CHAR(36),
    bookingType ENUM('Current', 'PreOrder'),
    FOREIGN KEY (nicheID) REFERENCES Niche(nicheID),
    FOREIGN KEY (paidByID) REFERENCES User(userId),
    FOREIGN KEY (paymentID) REFERENCES Payment(paymentID)
);

-- Payment table
CREATE TABLE Payment (
    paymentID CHAR(36) PRIMARY KEY,
    bookingID CHAR(36),
    amount FLOAT(10,2),
    paymentMethod VARCHAR(50),
    paymentDate DATE,
    paymentStatus ENUM('Pending', 'Cancelled', 'Refunded', 'Fully Paid'),
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID)
);
