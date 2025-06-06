INSERT INTO Role (roleID, roleName) VALUES
('65e115aa-94e7-47c9-8ca6-19d799dea2b4', 'Admin'),
('cd73d682-5aca-4bb2-8963-8a197c5fb43b', 'Applicant'),
('96ac5a94-f0ee-44a8-86f3-82d65dc4936c', 'Staff');

INSERT INTO Building (buildingID, buildingName, buildingLocation) VALUES
('251db174-6bbc-4032-91ca-1af7586608bb', 'Tranquil Hall', 'North Wing'),
('0a33cd7f-8884-41fb-9ae6-e192ea6651b8', 'Eternal Light', 'South Wing');

INSERT INTO Level (levelID, buildingID, levelNumber, notes) VALUES
('6ce2f7bd-2e9a-4dd7-886b-1cde50e35d06', '251db174-6bbc-4032-91ca-1af7586608bb', 1, 'Level 1 of Tranquil Hall'),
('ca2c29b7-ee1b-4e58-ab90-1b9113522731', '251db174-6bbc-4032-91ca-1af7586608bb', 2, 'Level 2 of Tranquil Hall'),
('b8c413a8-94fc-4309-a2d4-2481fcadab20', '0a33cd7f-8884-41fb-9ae6-e192ea6651b8', 1, 'Level 1 of Eternal Light'),
('126d75d4-79cc-4ccb-b10f-23d4aac48cea', '0a33cd7f-8884-41fb-9ae6-e192ea6651b8', 2, 'Level 2 of Eternal Light');

INSERT INTO Block (blockID, levelID, levelNumber, notes) VALUES
('1b048553-e3da-484a-a76a-66108714a29d', '6ce2f7bd-2e9a-4dd7-886b-1cde50e35d06', 1, 'Block 1 of Level 1'),
('77435da1-e7a7-42a9-b62a-4ce60715eea7', '6ce2f7bd-2e9a-4dd7-886b-1cde50e35d06', 1, 'Block 2 of Level 1'),
('180df4c3-86d7-4a50-a051-df5ab7b01979', 'ca2c29b7-ee1b-4e58-ab90-1b9113522731', 2, 'Block 1 of Level 2'),
('98232d67-2e53-41d5-94a0-6c52c843c3ca', 'ca2c29b7-ee1b-4e58-ab90-1b9113522731', 2, 'Block 2 of Level 2'),
('b805aa3e-bd69-4a67-923d-578106f353f1', 'b8c413a8-94fc-4309-a2d4-2481fcadab20', 1, 'Block 1 of Level 1'),
('179320f9-8ea6-44fd-b67a-40c342a385c5', 'b8c413a8-94fc-4309-a2d4-2481fcadab20', 1, 'Block 2 of Level 1'),
('19f69cda-fc3f-4732-aef0-54fc58fe4d5d', '126d75d4-79cc-4ccb-b10f-23d4aac48cea', 2, 'Block 1 of Level 2'),
('4e5f76b9-0d7f-4f6f-b7ce-6846b4c38911', '126d75d4-79cc-4ccb-b10f-23d4aac48cea', 2, 'Block 2 of Level 2');

INSERT INTO User (userID, username, hashedPassword, fullName, contactNumber, nric, dob, nationality, userAddress, appliedUrns, roleID) VALUES
('e06d0bce-62da-4f1d-bf6e-9c1f090ffcfd', 'user1', 'hashedpass1', 'User 1', '81234560', 'S1234560A', '1990-01-01', 'Singaporean', 'Blk 10 Jurong West', '', 'cd73d682-5aca-4bb2-8963-8a197c5fb43b'),
('be4e4478-4251-47d2-b571-40d35308bc6a', 'user2', 'hashedpass2', 'User 2', '81234561', 'S1234561A', '1991-01-01', 'Singaporean', 'Blk 11 Jurong West', '', 'cd73d682-5aca-4bb2-8963-8a197c5fb43b'),
('e43f9844-a6d8-4428-88ff-1225109d7061', 'user3', 'hashedpass3', 'User 3', '81234562', 'S1234562A', '1992-01-01', 'Singaporean', 'Blk 12 Jurong West', '', 'cd73d682-5aca-4bb2-8963-8a197c5fb43b');

INSERT INTO Niche (nicheID, blockID, nicheColumn, nicheRow, nicheCode, status, lastUpdated) VALUES
('693aa513-05cb-43b3-8ad1-12b202b8f82e', '1b048553-e3da-484a-a76a-66108714a29d', 1, 1, '1-1-1b04', 'Available', '2025-06-06 08:18:47'),
('564a5355-8bbc-42fb-9f6f-e90430d64e3d', '1b048553-e3da-484a-a76a-66108714a29d', 1, 2, '1-2-1b04', 'Reserved', '2025-06-06 08:18:47'),
('39312f49-ffc8-4830-80df-c8b51271a233', '1b048553-e3da-484a-a76a-66108714a29d', 2, 1, '2-1-1b04', 'Reserved', '2025-06-06 08:18:47'),
('361790b4-b930-49b3-af47-4a01080cb238', '1b048553-e3da-484a-a76a-66108714a29d', 2, 2, '2-2-1b04', 'Reserved', '2025-06-06 08:18:47'),
('312b1b42-b552-441f-a083-f7433eb5af52', '77435da1-e7a7-42a9-b62a-4ce60715eea7', 1, 1, '1-1-7743', 'Reserved', '2025-06-06 08:18:47'),
('1b174c71-73ee-405e-b02f-c57701d0711a', '77435da1-e7a7-42a9-b62a-4ce60715eea7', 1, 2, '1-2-7743', 'Available', '2025-06-06 08:18:47'),
('467aace6-ca13-4939-8469-d68c05063cf7', '77435da1-e7a7-42a9-b62a-4ce60715eea7', 2, 1, '2-1-7743', 'Reserved', '2025-06-06 08:18:47'),
('ddd6422d-d914-427b-be7e-7be893619811', '77435da1-e7a7-42a9-b62a-4ce60715eea7', 2, 2, '2-2-7743', 'Occupied', '2025-06-06 08:18:47'),
('ece0289b-54b2-4b0c-b8ba-535f655e2c14', '180df4c3-86d7-4a50-a051-df5ab7b01979', 1, 1, '1-1-180d', 'Available', '2025-06-06 08:18:47'),
('9d61c42c-039a-4fa4-a5d1-75a63a8653fc', '180df4c3-86d7-4a50-a051-df5ab7b01979', 1, 2, '1-2-180d', 'Available', '2025-06-06 08:18:47'),
('a856d16b-e851-4c66-8574-ca4639b5557a', '180df4c3-86d7-4a50-a051-df5ab7b01979', 2, 1, '2-1-180d', 'Pending', '2025-06-06 08:18:47'),
('ac1f2a9e-a9f1-45fd-b40d-a2c453ad267e', '180df4c3-86d7-4a50-a051-df5ab7b01979', 2, 2, '2-2-180d', 'Pending', '2025-06-06 08:18:47'),
('abf6b20f-1b41-4e5c-b219-6bec54f482e0', '98232d67-2e53-41d5-94a0-6c52c843c3ca', 1, 1, '1-1-9823', 'Occupied', '2025-06-06 08:18:47'),
('92c8ae2a-d68b-45e3-be65-14f9b344c325', '98232d67-2e53-41d5-94a0-6c52c843c3ca', 1, 2, '1-2-9823', 'Occupied', '2025-06-06 08:18:47'),
('4eb62ca1-5b8d-427f-aa72-a456abc1efe8', '98232d67-2e53-41d5-94a0-6c52c843c3ca', 2, 1, '2-1-9823', 'Pending', '2025-06-06 08:18:47'),
('93a443e1-253f-4975-800f-60bd2bb81ee2', '98232d67-2e53-41d5-94a0-6c52c843c3ca', 2, 2, '2-2-9823', 'Reserved', '2025-06-06 08:18:47'),
('7f216c0c-f3d9-4f2e-8f1a-db3c5bb19fec', 'b805aa3e-bd69-4a67-923d-578106f353f1', 1, 1, '1-1-b805', 'Reserved', '2025-06-06 08:18:47'),
('a85ff83d-142c-43aa-acb5-275589d9f10c', 'b805aa3e-bd69-4a67-923d-578106f353f1', 1, 2, '1-2-b805', 'Occupied', '2025-06-06 08:18:47'),
('234d7f2a-27b2-4346-aa78-be8d7318b40e', 'b805aa3e-bd69-4a67-923d-578106f353f1', 2, 1, '2-1-b805', 'Pending', '2025-06-06 08:18:47'),
('d3fc33e9-6483-4998-92c7-47418fb86d75', 'b805aa3e-bd69-4a67-923d-578106f353f1', 2, 2, '2-2-b805', 'Available', '2025-06-06 08:18:47'),
('2892d74d-82ab-48c5-a194-abbf0d67fb06', '179320f9-8ea6-44fd-b67a-40c342a385c5', 1, 1, '1-1-1793', 'Available', '2025-06-06 08:18:47'),
('d133e0f5-9d31-4b20-898d-00947c1a2b8e', '179320f9-8ea6-44fd-b67a-40c342a385c5', 1, 2, '1-2-1793', 'Available', '2025-06-06 08:18:47'),
('40ac2a0f-3706-4b94-afba-3614a9ccbcc8', '179320f9-8ea6-44fd-b67a-40c342a385c5', 2, 1, '2-1-1793', 'Reserved', '2025-06-06 08:18:47'),
('4af13598-72be-4673-8490-8e823f3f4f03', '179320f9-8ea6-44fd-b67a-40c342a385c5', 2, 2, '2-2-1793', 'Occupied', '2025-06-06 08:18:47'),
('0618b28a-9a84-4feb-a8e4-e79429b1ac9b', '19f69cda-fc3f-4732-aef0-54fc58fe4d5d', 1, 1, '1-1-19f6', 'Pending', '2025-06-06 08:18:47'),
('7ad603e4-438b-4a30-b81f-c7adcd8c9566', '19f69cda-fc3f-4732-aef0-54fc58fe4d5d', 1, 2, '1-2-19f6', 'Occupied', '2025-06-06 08:18:47'),
('856b01ea-a941-4628-ab60-ec0a2abc3714', '19f69cda-fc3f-4732-aef0-54fc58fe4d5d', 2, 1, '2-1-19f6', 'Pending', '2025-06-06 08:18:47'),
('588fde66-908a-4209-9fab-8fc8206b3d14', '19f69cda-fc3f-4732-aef0-54fc58fe4d5d', 2, 2, '2-2-19f6', 'Available', '2025-06-06 08:18:47'),
('5a607ade-5096-4683-8b60-94ae0937ebb9', '4e5f76b9-0d7f-4f6f-b7ce-6846b4c38911', 1, 1, '1-1-4e5f', 'Available', '2025-06-06 08:18:47'),
('9e14f9d7-0b6e-4a4a-9aec-d632a5a1f622', '4e5f76b9-0d7f-4f6f-b7ce-6846b4c38911', 1, 2, '1-2-4e5f', 'Available', '2025-06-06 08:18:47'),
('5291bee8-6652-40cf-84ad-d404565e207f', '4e5f76b9-0d7f-4f6f-b7ce-6846b4c38911', 2, 1, '2-1-4e5f', 'Pending', '2025-06-06 08:18:47'),
('8eb32db5-cbec-4809-bd98-e4d2e2e8bdaf', '4e5f76b9-0d7f-4f6f-b7ce-6846b4c38911', 2, 2, '2-2-4e5f', 'Occupied', '2025-06-06 08:18:47');

INSERT INTO Beneficiary (beneficiaryID, beneficiaryName, inscription, dateOfBirth, dateOfDeath, birthCertificate, deathCertificate, insertedAt, lastUpdated) VALUES
('8fb6d670-06f0-4d80-bcd2-0611648e9f4f', 'Deceased 1', 'In Loving Memory of Deceased 1', '1950-01-01', '2020-01-01', 'BC1XYZ', 'DC1XYZ', '2025-06-06 08:18:47', '2025-06-06 08:18:47'),
('27e6a7a2-82a1-4a55-ac1e-582e6dc4dbc5', 'Deceased 2', 'In Loving Memory of Deceased 2', '1951-01-01', '2020-01-01', 'BC2XYZ', 'DC2XYZ', '2025-06-06 08:18:47', '2025-06-06 08:18:47'),
('1b4a9a6e-653a-45be-aa49-52e26bde8f82', 'Deceased 3', 'In Loving Memory of Deceased 3', '1952-01-01', '2020-01-01', 'BC3XYZ', 'DC3XYZ', '2025-06-06 08:18:47', '2025-06-06 08:18:47');

INSERT INTO Payment (paymentID, amount, paymentMethod, paymentDate, paymentStatus) VALUES
('8a43c203-1054-4239-ac56-0d16ceeb2f58', 2960.41, 'Cash', '2025-06-06', 'Pending'),
('1ad688ac-c3c0-41ac-b881-28e2ca83911d', 2743.8, 'Credit Card', '2025-06-06', 'Refunded'),
('97365402-c6a6-4d6d-a37f-b473965a1f79', 1033.85, 'Bank Transfer', '2025-06-06', 'Refunded');

INSERT INTO Booking (bookingID, nicheID, paidByID, paymentID, beneficiaryID, bookingType) VALUES
('fe259361-bb5f-49b3-a097-72cd35cc3f56', '693aa513-05cb-43b3-8ad1-12b202b8f82e', 'e06d0bce-62da-4f1d-bf6e-9c1f090ffcfd', '8a43c203-1054-4239-ac56-0d16ceeb2f58', '8fb6d670-06f0-4d80-bcd2-0611648e9f4f', 'Current'),
('c03fba81-43ef-4f0e-b2c0-85d1da52f052', '564a5355-8bbc-42fb-9f6f-e90430d64e3d', 'e06d0bce-62da-4f1d-bf6e-9c1f090ffcfd', '1ad688ac-c3c0-41ac-b881-28e2ca83911d', '8fb6d670-06f0-4d80-bcd2-0611648e9f4f', 'PreOrder'),
('ec6eab74-4abd-4cff-a72e-d43e8b8bd1ac', '39312f49-ffc8-4830-80df-c8b51271a233', 'e06d0bce-62da-4f1d-bf6e-9c1f090ffcfd', '97365402-c6a6-4d6d-a37f-b473965a1f79', '8fb6d670-06f0-4d80-bcd2-0611648e9f4f', 'Archived'),
('98cda605-f193-47c3-acaf-965017d08fc5', '361790b4-b930-49b3-af47-4a01080cb238', 'be4e4478-4251-47d2-b571-40d35308bc6a', '8a43c203-1054-4239-ac56-0d16ceeb2f58', '27e6a7a2-82a1-4a55-ac1e-582e6dc4dbc5', 'Current'),
('c9a905c7-522d-4cd7-b6ee-1e1ece9047a0', '312b1b42-b552-441f-a083-f7433eb5af52', 'be4e4478-4251-47d2-b571-40d35308bc6a', '1ad688ac-c3c0-41ac-b881-28e2ca83911d', '27e6a7a2-82a1-4a55-ac1e-582e6dc4dbc5', 'PreOrder'),
('926b581b-0d02-47fc-9a3b-d459b23c9121', '1b174c71-73ee-405e-b02f-c57701d0711a', 'be4e4478-4251-47d2-b571-40d35308bc6a', '97365402-c6a6-4d6d-a37f-b473965a1f79', '27e6a7a2-82a1-4a55-ac1e-582e6dc4dbc5', 'Archived'),
('c9196e7c-0e4c-45d1-ab68-7fcd7b5978c8', '467aace6-ca13-4939-8469-d68c05063cf7', 'e43f9844-a6d8-4428-88ff-1225109d7061', '8a43c203-1054-4239-ac56-0d16ceeb2f58', '1b4a9a6e-653a-45be-aa49-52e26bde8f82', 'Current'),
('ae643e4c-c141-463c-aabe-58078b1f6384', 'ddd6422d-d914-427b-be7e-7be893619811', 'e43f9844-a6d8-4428-88ff-1225109d7061', '1ad688ac-c3c0-41ac-b881-28e2ca83911d', '1b4a9a6e-653a-45be-aa49-52e26bde8f82', 'PreOrder'),
('4c9885bd-31bc-40cd-80ef-de0579bc330d', 'ece0289b-54b2-4b0c-b8ba-535f655e2c14', 'e43f9844-a6d8-4428-88ff-1225109d7061', '97365402-c6a6-4d6d-a37f-b473965a1f79', '1b4a9a6e-653a-45be-aa49-52e26bde8f82', 'Archived');

