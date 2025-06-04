CREATE SCHEMA `AfterLifeDB`;

USE AfterLifeDB;

-- role table
CREATE TABLE Role (
    roleId SERIAL PRIMARY KEY,
    roleName VARCHAR(255)
);

-- user table
CREATE TABLE
    User (
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
        roleId BIGINT UNSIGNED,
        FOREIGN KEY (roleId) REFERENCES Role (roleId)
    );

-- building table
CREATE TABLE
    Building (
        buildingID SERIAL PRIMARY KEY,
        buildingName VARCHAR(255),
        buildingLocation TEXT
    );

-- level table
CREATE TABLE
    Level (
        levelID SERIAL PRIMARY KEY,
        buildingID BIGINT UNSIGNED,
        levelNumber INT,
        notes TEXT,
        FOREIGN KEY (buildingID) REFERENCES Building (buildingID)
    );

-- block table
CREATE TABLE
    Block (
        blockID SERIAL PRIMARY KEY,
        levelID BIGINT UNSIGNED,
        levelNumber INT,
        notes TEXT,
        FOREIGN KEY (levelID) REFERENCES Level (levelID)
    );

-- niche table
CREATE TABLE Niche (
    nicheID SERIAL PRIMARY KEY,
    blockID BIGINT UNSIGNED, -- [FK] blockID from Block table
    nicheColumn INT,
    nicheRow INT,
    niche_code VARCHAR(50), -- indicates niche column, and row. ie. 01-07 = column 1, row 7 (IS THIS REDUNDANT??)
    status ENUM('Available', 'Pending', 'Reserved', 'Occupied'),
    lastUpdated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    dateOfBirth DATE,
    dateOfDeath DATE,
    birthCertificate TEXT,
    deathCertificate TEXT,
    occupantName VARCHAR(50),
    urnID BIGINT UNSIGNED, -- [FK] urnID from Urn table
    bookingID CHAR(36), -- [FK] bookingID from Booking table
    FOREIGN KEY (blockID) REFERENCES Block(blockID),
    FOREIGN KEY (urnID) REFERENCES Urn(urnID),
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID)
);

-- booking table
CREATE TABLE Booking (
    bookingID CHAR(36) PRIMARY KEY,
    nicheID BIGINT UNSIGNED,
    paidByID BIGINT UNSIGNED,
    paymentID BIGINT UNSIGNED,
    bookingType ENUM('Current', 'PreOrder'),
    FOREIGN KEY (nicheID) REFERENCES Niche(nicheID),
    FOREIGN KEY (paidByID) REFERENCES User(userId),
    FOREIGN KEY (paymentID) REFERENCES Payment(paymentID)
);

-- payment table
CREATE TABLE Payment (
    paymentID CHAR(36) PRIMARY KEY,
    bookingID CHAR(36),
    amount FLOAT(10,2),
    paymentMethod VARCHAR(50),
    paymentDate DATE,
    paymentStatus ENUM('Pending', 'Cancelled', 'Refunded', 'Fully Paid'),
    FOREIGN KEY (bookingID) REFERENCES Booking(bookingID)
);

-- urn table
CREATE TABLE Urn (
    urnID SERIAL PRIMARY KEY,
    inscription TEXT,
    inserted_at TIMESTAMP,
    applicantID BIGINT UNSIGNED,
    nicheID BIGINT UNSIGNED,
    FOREIGN KEY (applicantID) REFERENCES User(userId),
    FOREIGN KEY (nicheID) REFERENCES Niche(nicheID)
);