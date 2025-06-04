-- INSERT DUMMY DATA SCRIPTS

-- insert dummy data into Role table
INSERT INTO Role (roleId, roleName) VALUES (1, 'Admin');
INSERT INTO Role (roleId, roleName) VALUES (2, 'Staff');
INSERT INTO Role (roleId, roleName) VALUES (3, 'Applicant');

-- insert dummy data into Building table
INSERT INTO Building (buildingID, buildingName, buildingLocation) VALUES (1, 'Columbarium A', 'Downtown');
INSERT INTO Building (buildingID, buildingName, buildingLocation) VALUES (2, 'Columbarium B', 'Uptown');

-- insert dummy data into Level table
INSERT INTO Level (levelID, buildingID, levelNumber, notes) VALUES (1, 1, 1, 'Ground Floor');
INSERT INTO Level (levelID, buildingID, levelNumber, notes) VALUES (2, 1, 2, 'Second Floor');
INSERT INTO Level (levelID, buildingID, levelNumber, notes) VALUES (3, 2, 1, 'Ground Floor');

-- insert dummy data into Block table
INSERT INTO Block (blockID, levelID, levelNumber, notes) VALUES (1, 1, 1, 'Left Wing');
INSERT INTO Block (blockID, levelID, levelNumber, notes) VALUES (2, 1, 2, 'Right Wing');
INSERT INTO Block (blockID, levelID, levelNumber, notes) VALUES (3, 2, 1, 'Center Wing');

-- insert dummy data into User table
INSERT INTO User (userId, username, hashedPassword, fullName, contactNumber, nric, dob, nationality, userAddress, appliedUrns, roleId) VALUES ('95f64ad5-ab9e-4558-9487-330231c58856', 'user0', 'hashed_pw_0', 'User Fullname 0', '91234560', 'S1234560A', '1986-10-16', 'Singaporean', 'Address 0', '', 1);
INSERT INTO User (userId, username, hashedPassword, fullName, contactNumber, nric, dob, nationality, userAddress, appliedUrns, roleId) VALUES ('9547c65f-1f65-422e-ad1b-4dd3dc059217', 'user1', 'hashed_pw_1', 'User Fullname 1', '91234561', 'S1234561A', '1970-10-15', 'Singaporean', 'Address 1', '', 2);
INSERT INTO User (userId, username, hashedPassword, fullName, contactNumber, nric, dob, nationality, userAddress, appliedUrns, roleId) VALUES ('dbba3960-1339-4123-9235-b4606838d7d6', 'user2', 'hashed_pw_2', 'User Fullname 2', '91234562', 'S1234562A', '1978-12-17', 'Singaporean', 'Address 2', '', 2);
INSERT INTO User (userId, username, hashedPassword, fullName, contactNumber, nric, dob, nationality, userAddress, appliedUrns, roleId) VALUES ('8b7c47b7-d94f-40f8-988d-5de16b8903bf', 'user3', 'hashed_pw_3', 'User Fullname 3', '91234563', 'S1234563A', '1997-05-14', 'Singaporean', 'Address 3', '', 2);
INSERT INTO User (userId, username, hashedPassword, fullName, contactNumber, nric, dob, nationality, userAddress, appliedUrns, roleId) VALUES ('fb02b35b-11db-49db-9cc7-56a824ddd4fc', 'user4', 'hashed_pw_4', 'User Fullname 4', '91234564', 'S1234564A', '1988-04-21', 'Singaporean', 'Address 4', '', 3);

-- insert dummy data into Urn table
INSERT INTO Urn (urnID, inscription, inserted_at, applicantID, nicheID) VALUES (1, 'In loving memory of Person 0', '2025-06-02 14:08:05', '95f64ad5-ab9e-4558-9487-330231c58856', 1);
INSERT INTO Urn (urnID, inscription, inserted_at, applicantID, nicheID) VALUES (2, 'In loving memory of Person 1', '2025-06-02 14:08:05', '9547c65f-1f65-422e-ad1b-4dd3dc059217', 2);
INSERT INTO Urn (urnID, inscription, inserted_at, applicantID, nicheID) VALUES (3, 'In loving memory of Person 2', '2025-06-02 14:08:05', 'dbba3960-1339-4123-9235-b4606838d7d6', 3);
INSERT INTO Urn (urnID, inscription, inserted_at, applicantID, nicheID) VALUES (4, 'In loving memory of Person 3', '2025-06-02 14:08:05', '8b7c47b7-d94f-40f8-988d-5de16b8903bf', 4);
INSERT INTO Urn (urnID, inscription, inserted_at, applicantID, nicheID) VALUES (5, 'In loving memory of Person 4', '2025-06-02 14:08:05', 'fb02b35b-11db-49db-9cc7-56a824ddd4fc', 5);

-- insert dummy data into Niche table
INSERT INTO Niche (nicheID, blockID, nicheColumn, nicheRow, niche_code, status, lastUpdated, dateOfBirth, dateOfDeath, birthCertificate, deathCertificate, occupantName, urnID, bookingID) VALUES (1, 1, 3, 8, '03-08', 'Available', '2025-06-02 14:08:05', NULL, NULL, '', '', 'Person 0', 1, 1);
INSERT INTO Niche (nicheID, blockID, nicheColumn, nicheRow, niche_code, status, lastUpdated, dateOfBirth, dateOfDeath, birthCertificate, deathCertificate, occupantName, urnID, bookingID) VALUES (2, 1, 1, 2, '01-02', 'Available', '2025-06-02 14:08:05', NULL, NULL, '', '', 'Person 1', 2, 2);
INSERT INTO Niche (nicheID, blockID, nicheColumn, nicheRow, niche_code, status, lastUpdated, dateOfBirth, dateOfDeath, birthCertificate, deathCertificate, occupantName, urnID, bookingID) VALUES (3, 1, 1, 9, '01-09', 'Available', '2025-06-02 14:08:05', NULL, NULL, '', '', 'Person 2', 3, 3);
INSERT INTO Niche (nicheID, blockID, nicheColumn, nicheRow, niche_code, status, lastUpdated, dateOfBirth, dateOfDeath, birthCertificate, deathCertificate, occupantName, urnID, bookingID) VALUES (4, 3, 3, 2, '03-02', 'Reserved', '2025-06-02 14:08:05', NULL, NULL, '', '', 'Person 3', 4, 4);
INSERT INTO Niche (nicheID, blockID, nicheColumn, nicheRow, niche_code, status, lastUpdated, dateOfBirth, dateOfDeath, birthCertificate, deathCertificate, occupantName, urnID, bookingID) VALUES (5, 2, 4, 1, '04-01', 'Reserved', '2025-06-02 14:08:05', NULL, NULL, '', '', 'Person 4', 5, 5);

-- insert dummy data into Booking table
INSERT INTO Booking (bookingID, nicheID, paidByID, paymentID, bookingType) VALUES (1, 1, '95f64ad5-ab9e-4558-9487-330231c58856', NULL, 'Current');
INSERT INTO Booking (bookingID, nicheID, paidByID, paymentID, bookingType) VALUES (2, 2, '9547c65f-1f65-422e-ad1b-4dd3dc059217', NULL, 'Current');
INSERT INTO Booking (bookingID, nicheID, paidByID, paymentID, bookingType) VALUES (3, 3, 'dbba3960-1339-4123-9235-b4606838d7d6', NULL, 'PreOrder');
INSERT INTO Booking (bookingID, nicheID, paidByID, paymentID, bookingType) VALUES (4, 4, '8b7c47b7-d94f-40f8-988d-5de16b8903bf', NULL, 'PreOrder');
INSERT INTO Booking (bookingID, nicheID, paidByID, paymentID, bookingType) VALUES (5, 5, 'fb02b35b-11db-49db-9cc7-56a824ddd4fc', NULL, 'PreOrder');

-- insert dummy data into Payment table
INSERT INTO Payment (paymentID, bookingID, amount, paymentMethod, paymentDate, paymentStatus) VALUES (1, 1, 3391.23, 'Credit Card', '2025-06-02', 'Pending');
INSERT INTO Payment (paymentID, bookingID, amount, paymentMethod, paymentDate, paymentStatus) VALUES (2, 2, 2785.47, 'Credit Card', '2025-06-02', 'Fully Paid');
INSERT INTO Payment (paymentID, bookingID, amount, paymentMethod, paymentDate, paymentStatus) VALUES (3, 3, 4563.03, 'Credit Card', '2025-06-02', 'Fully Paid');
INSERT INTO Payment (paymentID, bookingID, amount, paymentMethod, paymentDate, paymentStatus) VALUES (4, 4, 3855.16, 'Credit Card', '2025-06-02', 'Fully Paid');
INSERT INTO Payment (paymentID, bookingID, amount, paymentMethod, paymentDate, paymentStatus) VALUES (5, 5, 4191.68, 'Credit Card', '2025-06-02', 'Pending');
