USE AfterLifeDB;

INSERT INTO Role (roleId, roleName) VALUES ('fc3ee35b-af2f-4c8f-9a51-93984ee66ce1', 'Admin');
INSERT INTO Role (roleId, roleName) VALUES ('8a3003ac-af4b-4661-b96f-f5cb208c05f1', 'User');
INSERT INTO Role (roleId, roleName) VALUES ('9a6b5b55-38d8-45e2-9e1b-a280b9dee533', 'Staff');

INSERT INTO User (userId, username, hashedPassword, fullName, contactNumber, nric, dob, nationality, userAddress, appliedUrns, roleId) VALUES ('ee0df131-9b7e-4f72-a735-df613dad8544', 'user0', 'hashed_password_0', 'User Fullname 0', '91234560', 'S1234560A', '1980-01-01', 'Singaporean', 'Blk 10 Clementi Ave', '', 'fc3ee35b-af2f-4c8f-9a51-93984ee66ce1');
INSERT INTO User (userId, username, hashedPassword, fullName, contactNumber, nric, dob, nationality, userAddress, appliedUrns, roleId) VALUES ('04a49a5c-018f-48f4-b376-e2eb9ae6f7b6', 'user1', 'hashed_password_1', 'User Fullname 1', '91234561', 'S1234561A', '1981-01-01', 'Singaporean', 'Blk 11 Clementi Ave', '', '8a3003ac-af4b-4661-b96f-f5cb208c05f1');
INSERT INTO User (userId, username, hashedPassword, fullName, contactNumber, nric, dob, nationality, userAddress, appliedUrns, roleId) VALUES ('dcd5af57-e5a9-4731-b7bd-26d231275c77', 'user2', 'hashed_password_2', 'User Fullname 2', '91234562', 'S1234562A', '1982-01-01', 'Singaporean', 'Blk 12 Clementi Ave', '', '8a3003ac-af4b-4661-b96f-f5cb208c05f1');

INSERT INTO Building (buildingID, buildingName, buildingLocation) VALUES ('d6690e03-aaea-4b9c-9e87-dee1ea210db7', 'Columbarium Tower 1', 'Location 1');
INSERT INTO Building (buildingID, buildingName, buildingLocation) VALUES ('82d741c8-6697-4306-89d1-83d36f978ed8', 'Columbarium Tower 2', 'Location 2');

INSERT INTO Level (levelID, buildingID, levelNumber, notes) VALUES ('36b7d8f4-9f8c-4759-b73a-1139920c01dd', 'd6690e03-aaea-4b9c-9e87-dee1ea210db7', '1', 'Level 1 notes');
INSERT INTO Level (levelID, buildingID, levelNumber, notes) VALUES ('8fcf0b8e-eb6e-4a4b-8cf9-4bfa2541399a', '82d741c8-6697-4306-89d1-83d36f978ed8', '2', 'Level 2 notes');
INSERT INTO Level (levelID, buildingID, levelNumber, notes) VALUES ('1a69fa0d-e308-4bba-9b44-2d73157e6ee3', 'd6690e03-aaea-4b9c-9e87-dee1ea210db7', '3', 'Level 3 notes');

INSERT INTO Block (blockID, levelID, levelNumber, notes) VALUES ('4eddf318-3ca6-4df6-a669-3e90807fae11', '36b7d8f4-9f8c-4759-b73a-1139920c01dd', '1', 'Block 1 notes');
INSERT INTO Block (blockID, levelID, levelNumber, notes) VALUES ('2900250e-f165-4db2-8ec5-73a0bf344423', '8fcf0b8e-eb6e-4a4b-8cf9-4bfa2541399a', '2', 'Block 2 notes');
INSERT INTO Block (blockID, levelID, levelNumber, notes) VALUES ('3190ff47-bb46-4201-9b4e-6b4147c0920b', '1a69fa0d-e308-4bba-9b44-2d73157e6ee3', '3', 'Block 3 notes');

INSERT INTO Niche (nicheID, blockID, nicheColumn, nicheRow, niche_code, status, dateOfBirth, dateOfDeath, birthCertificate, deathCertificate, occupantName, bookingID) VALUES ('7897d582-8cd9-4da2-8334-7a9cc8fb6080', '4eddf318-3ca6-4df6-a669-3e90807fae11', '1', '2', '01-02', 'Pending', '1950-05-01', '2000-05-01', 'BC0001', 'DC0001', 'Occupant 1', '9dca1ade-5684-4282-8fdf-0a4bfd71e729');
INSERT INTO Niche (nicheID, blockID, nicheColumn, nicheRow, niche_code, status, dateOfBirth, dateOfDeath, birthCertificate, deathCertificate, occupantName, bookingID) VALUES ('e9307336-1495-48e7-9dbf-9d17255420e2', '2900250e-f165-4db2-8ec5-73a0bf344423', '2', '3', '02-03', 'Reserved', '1951-05-01', '2001-05-01', 'BC0002', 'DC0002', 'Occupant 2', '9f968b7c-4ae6-4dc9-b6a4-71de416f1dcc');
INSERT INTO Niche (nicheID, blockID, nicheColumn, nicheRow, niche_code, status, dateOfBirth, dateOfDeath, birthCertificate, deathCertificate, occupantName, bookingID) VALUES ('0da1de34-e927-4864-a05a-266199be69f5', '3190ff47-bb46-4201-9b4e-6b4147c0920b', '3', '4', '03-04', 'Pending', '1952-05-01', '2002-05-01', 'BC0003', 'DC0003', 'Occupant 3', '3aaa9459-ca3d-43e8-b4a9-3bd1b6c49783');

INSERT INTO Urn (urnID, inscription, inserted_at, applicantID, nicheID) VALUES ('ea3ed0a3-a15b-4ad4-8c90-2f113d1d643f', 'In Loving Memory of Occupant 1', '2025-06-04', 'ee0df131-9b7e-4f72-a735-df613dad8544', '7897d582-8cd9-4da2-8334-7a9cc8fb6080');
INSERT INTO Urn (urnID, inscription, inserted_at, applicantID, nicheID) VALUES ('0e577a49-f72b-461e-b9a9-25ba06dd6cc5', 'In Loving Memory of Occupant 2', '2025-06-04', '04a49a5c-018f-48f4-b376-e2eb9ae6f7b6', 'e9307336-1495-48e7-9dbf-9d17255420e2');
INSERT INTO Urn (urnID, inscription, inserted_at, applicantID, nicheID) VALUES ('13960b8d-6a93-4ae6-b206-5e784a440e7d', 'In Loving Memory of Occupant 3', '2025-06-04', 'dcd5af57-e5a9-4731-b7bd-26d231275c77', '0da1de34-e927-4864-a05a-266199be69f5');

INSERT INTO Payment (paymentID, bookingID, amount, paymentMethod, paymentDate, paymentStatus) VALUES ('7e6494d2-7008-4edd-a015-b00838969b1d', '9dca1ade-5684-4282-8fdf-0a4bfd71e729', '500.0', 'Credit Card', '2025-06-04', 'Pending');
INSERT INTO Payment (paymentID, bookingID, amount, paymentMethod, paymentDate, paymentStatus) VALUES ('d9152ebc-3210-451d-942b-92faef07d4c1', '9f968b7c-4ae6-4dc9-b6a4-71de416f1dcc', '600.0', 'Credit Card', '2025-05-25', 'Cancelled');
INSERT INTO Payment (paymentID, bookingID, amount, paymentMethod, paymentDate, paymentStatus) VALUES ('ba96cd40-0468-442b-8939-9bb2f74e5018', '3aaa9459-ca3d-43e8-b4a9-3bd1b6c49783', '700.0', 'Credit Card', '2025-05-15', 'Fully Paid');

INSERT INTO Booking (bookingID, nicheID, paidByID, paymentID, bookingType) VALUES ('9dca1ade-5684-4282-8fdf-0a4bfd71e729', '7897d582-8cd9-4da2-8334-7a9cc8fb6080', 'ee0df131-9b7e-4f72-a735-df613dad8544', '7e6494d2-7008-4edd-a015-b00838969b1d', 'PreOrder');
INSERT INTO Booking (bookingID, nicheID, paidByID, paymentID, bookingType) VALUES ('9f968b7c-4ae6-4dc9-b6a4-71de416f1dcc', 'e9307336-1495-48e7-9dbf-9d17255420e2', '04a49a5c-018f-48f4-b376-e2eb9ae6f7b6', 'd9152ebc-3210-451d-942b-92faef07d4c1', 'PreOrder');
INSERT INTO Booking (bookingID, nicheID, paidByID, paymentID, bookingType) VALUES ('3aaa9459-ca3d-43e8-b4a9-3bd1b6c49783', '0da1de34-e927-4864-a05a-266199be69f5', 'dcd5af57-e5a9-4731-b7bd-26d231275c77', 'ba96cd40-0468-442b-8939-9bb2f74e5018', 'Current');