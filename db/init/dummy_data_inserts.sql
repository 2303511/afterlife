USE AfterLifeDB;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE Booking;
TRUNCATE TABLE Payment;
TRUNCATE TABLE Beneficiary;
TRUNCATE TABLE Niche;
TRUNCATE TABLE User;
TRUNCATE TABLE Block;
TRUNCATE TABLE Level;
TRUNCATE TABLE Building;
TRUNCATE TABLE Role;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO Role (roleID, roleName) VALUES
('65e115aa-94e7-47c9-8ca6-19d799dea2b4', 'Admin'),
('cd73d682-5aca-4bb2-8963-8a197c5fb43b', 'Applicant'),
('96ac5a94-f0ee-44a8-86f3-82d65dc4936c', 'Staff');

INSERT INTO Building (buildingID, buildingName, buildingLocation) VALUES
('251db174-6bbc-4032-91ca-1af7586608bb', 'Tranquil Hall', 'Bukit Brown'),
('0a33cd7f-8884-41fb-9ae6-e192ea6651b8', 'Eternal Light', 'Bukit Brown');

INSERT INTO Level (levelID, buildingID, levelNumber) VALUES
('6ce2f7bd-2e9a-4dd7-886b-1cde50e35d06', '251db174-6bbc-4032-91ca-1af7586608bb', 1),
('ca2c29b7-ee1b-4e58-ab90-1b9113522731', '251db174-6bbc-4032-91ca-1af7586608bb', 2),
('b8c413a8-94fc-4309-a2d4-2481fcadab20', '0a33cd7f-8884-41fb-9ae6-e192ea6651b8', 1),
('126d75d4-79cc-4ccb-b10f-23d4aac48cea', '0a33cd7f-8884-41fb-9ae6-e192ea6651b8', 2);

INSERT INTO Block (blockID, levelID, blockName) VALUES
('1b048553-e3da-484a-a76a-66108714a29d', '6ce2f7bd-2e9a-4dd7-886b-1cde50e35d06', 'Block A'),
('77435da1-e7a7-42a9-b62a-4ce60715eea7', '6ce2f7bd-2e9a-4dd7-886b-1cde50e35d06', 'Block B'),
('180df4c3-86d7-4a50-a051-df5ab7b01979', 'ca2c29b7-ee1b-4e58-ab90-1b9113522731', 'Block A'),
('98232d67-2e53-41d5-94a0-6c52c843c3ca', 'ca2c29b7-ee1b-4e58-ab90-1b9113522731', 'Block B'),
('b805aa3e-bd69-4a67-923d-578106f353f1', 'b8c413a8-94fc-4309-a2d4-2481fcadab20', 'Block A'),
('179320f9-8ea6-44fd-b67a-40c342a385c5', 'b8c413a8-94fc-4309-a2d4-2481fcadab20', 'Block B'),
('19f69cda-fc3f-4732-aef0-54fc58fe4d5d', '126d75d4-79cc-4ccb-b10f-23d4aac48cea', 'Block A'),
('4e5f76b9-0d7f-4f6f-b7ce-6846b4c38911', '126d75d4-79cc-4ccb-b10f-23d4aac48cea', 'Block B');

INSERT INTO User (userID, username, email, hashedPassword, salt, failLoginCount, accountCreatedAt, lastLogin, fullName, contactNumber, nric, dob, nationality, userAddress, gender, roleID) VALUES
('5055199d-6ebd-4d8f-8d2b-0a4748c6ac28', 'claire88', 'claire88@mail.com', '$2b$10$MLi38KmiGpnVowd2FKwjiOxzN5KOm5iLp70NKbCH9PE3GTZYsdbXO', '$2b$10$MLi38KmiGpnVowd2FKwjiO', 0, '2025-01-03 01:22:43', NULL, 'Claire Tan', '92345671', 'T1122334A', '1992-04-12', 'Singaporean', '789 Bukit Batok West Avenue 6, 03-45, 651123', 'Female', 'cd73d682-5aca-4bb2-8963-8a197c5fb43b'),
('ed289d68-98b4-455d-9d65-ce6d34a3c96a', 'kevin77', 'kevin77@mail.com', '$2b$10$cEvaPapwi1c4CC5PviSnxeYDMBeWSavO6MOjn6Qeu/WRgzGGobwim', '$2b$10$cEvaPapwi1c4CC5PviSnxe', 0, '2025-06-09 06:22:23', NULL, 'Kevin Goh', '93456782', 'T5566778B', '1988-09-30', 'Singaporean', '321 Tanjong Katong Road, 07-19, 437234', 'Male', 'cd73d682-5aca-4bb2-8963-8a197c5fb43b'),
-- ('915ef778-5040-4a47-9124-8868e79f7614', 'farah_lee', 'farah_lee@mail.com', '$2b$10$8oF9y6jFKwMgxPv.dkT3f.EScYNfpclU.gyKysIKmHqgtdRPUtxnq', '$2b$10$8oF9y6jFKwMgxPv.dkT3f.', 0, '2025-07-19 01:11:26', NULL, 'Farah Lee', '94567893', 'T9988776D', '1995-01-17', 'Singaporean', '654 Clementi Avenue 2, 09-05, 120654', 'Female', 'cd73d682-5aca-4bb2-8963-8a197c5fb43b'),
('137c5d51-1bf1-4ddc-9668-d6b074eeef88', 'user', 'user@mail.com', '$2b$10$vbiVf22z9UHnBurxXAm5VeB.uY4.gxHqclyN1C.2.AOOwYqt0EN4m', '$2b$10$vbiVf22z9UHnBurxXAm5Ve', 0, '2025-07-09 09:26:05', NULL, 'Test User', '91234567', 'T1234567H', '1993-06-09', 'Singaporean', '123 Main Street, 05-23, 529536', 'Female', 'cd73d682-5aca-4bb2-8963-8a197c5fb43b'),

-- staff
('dc42f08c-71f6-4795-95c4-1a32f54f3f45', 'staff', 'staff@mail.com', '$2b$10$2AVfK1dOEuH.qmH/X9luruJw5XJSiaFC7LUXnETfnquY1ZhLN3qIe', '$2b$10$2AVfK1dOEuH.qmH/X9luru', 0, '2025-06-20 21:43:27', NULL, 'Staff Member', '87654321', 'T1234567J', '1997-11-18', 'Singaporean', '22 Tanjong Katong, 11-23, 928739', 'Female', '96ac5a94-f0ee-44a8-86f3-82d65dc4936c'),

-- admin
('883bb845-d68c-4222-a6fe-b12dba512e8e', 'admin', 'admin@mail.com', '$2b$10$.ZqnPfVMTAaB/9i5kUERguTNvy.LacvRE9pC/bVeiFMbXK/a3E.yG', '$2b$10$.ZqnPfVMTAaB/9i5kUERgu', 0, '2025-06-20 21:37:03', NULL, 'Admin User', '81234567', 'S1234567J', '1980-12-20', 'Singaporean', '789 Bukit Timah Road, 14-07, 179094', 'Female', '65e115aa-94e7-47c9-8ca6-19d799dea2b4');


INSERT INTO Niche (nicheID, blockID, nicheColumn, nicheRow, nicheCode, status, lastUpdated) VALUES
('693aa513-05cb-43b3-8ad1-12b202b8f82e', '1b048553-e3da-484a-a76a-66108714a29d', 1, 1, '1-1-1b04', 'Available', '2025-06-06 08:18:47'),
('564a5355-8bbc-42fb-9f6f-e90430d64e3d', '1b048553-e3da-484a-a76a-66108714a29d', 1, 2, '1-2-1b04', 'Available', '2025-06-06 08:18:47'),
('39312f49-ffc8-4830-80df-c8b51271a233', '1b048553-e3da-484a-a76a-66108714a29d', 2, 1, '2-1-1b04', 'Available', '2025-06-06 08:18:47'),
('361790b4-b930-49b3-af47-4a01080cb238', '1b048553-e3da-484a-a76a-66108714a29d', 2, 2, '2-2-1b04', 'Available', '2025-06-06 08:18:47'),
('312b1b42-b552-441f-a083-f7433eb5af52', '77435da1-e7a7-42a9-b62a-4ce60715eea7', 1, 1, '1-1-7743', 'Available', '2025-06-06 08:18:47'),
('1b174c71-73ee-405e-b02f-c57701d0711a', '77435da1-e7a7-42a9-b62a-4ce60715eea7', 1, 2, '1-2-7743', 'Available', '2025-06-06 08:18:47'),
('467aace6-ca13-4939-8469-d68c05063cf7', '77435da1-e7a7-42a9-b62a-4ce60715eea7', 2, 1, '2-1-7743', 'Available', '2025-06-06 08:18:47'),
('ddd6422d-d914-427b-be7e-7be893619811', '77435da1-e7a7-42a9-b62a-4ce60715eea7', 2, 2, '2-2-7743', 'Available', '2025-06-06 08:18:47'),
('ece0289b-54b2-4b0c-b8ba-535f655e2c14', '180df4c3-86d7-4a50-a051-df5ab7b01979', 1, 1, '1-1-180d', 'Available', '2025-06-06 08:18:47'),
('9d61c42c-039a-4fa4-a5d1-75a63a8653fc', '180df4c3-86d7-4a50-a051-df5ab7b01979', 1, 2, '1-2-180d', 'Available', '2025-06-06 08:18:47'),
('a856d16b-e851-4c66-8574-ca4639b5557a', '180df4c3-86d7-4a50-a051-df5ab7b01979', 2, 1, '2-1-180d', 'Available', '2025-06-06 08:18:47'),
('ac1f2a9e-a9f1-45fd-b40d-a2c453ad267e', '180df4c3-86d7-4a50-a051-df5ab7b01979', 2, 2, '2-2-180d', 'Available', '2025-06-06 08:18:47'),
('abf6b20f-1b41-4e5c-b219-6bec54f482e0', '98232d67-2e53-41d5-94a0-6c52c843c3ca', 1, 1, '1-1-9823', 'Available', '2025-06-06 08:18:47'),
('92c8ae2a-d68b-45e3-be65-14f9b344c325', '98232d67-2e53-41d5-94a0-6c52c843c3ca', 1, 2, '1-2-9823', 'Available', '2025-06-06 08:18:47'),
('4eb62ca1-5b8d-427f-aa72-a456abc1efe8', '98232d67-2e53-41d5-94a0-6c52c843c3ca', 2, 1, '2-1-9823', 'Available', '2025-06-06 08:18:47'),
('93a443e1-253f-4975-800f-60bd2bb81ee2', '98232d67-2e53-41d5-94a0-6c52c843c3ca', 2, 2, '2-2-9823', 'Available', '2025-06-06 08:18:47'),
('7f216c0c-f3d9-4f2e-8f1a-db3c5bb19fec', 'b805aa3e-bd69-4a67-923d-578106f353f1', 1, 1, '1-1-b805', 'Available', '2025-06-06 08:18:47'),
('a85ff83d-142c-43aa-acb5-275589d9f10c', 'b805aa3e-bd69-4a67-923d-578106f353f1', 1, 2, '1-2-b805', 'Available', '2025-06-06 08:18:47'),
('234d7f2a-27b2-4346-aa78-be8d7318b40e', 'b805aa3e-bd69-4a67-923d-578106f353f1', 2, 1, '2-1-b805', 'Available', '2025-06-06 08:18:47'),
('d3fc33e9-6483-4998-92c7-47418fb86d75', 'b805aa3e-bd69-4a67-923d-578106f353f1', 2, 2, '2-2-b805', 'Available', '2025-06-06 08:18:47'),
('2892d74d-82ab-48c5-a194-abbf0d67fb06', '179320f9-8ea6-44fd-b67a-40c342a385c5', 1, 1, '1-1-1793', 'Available', '2025-06-06 08:18:47'),
('d133e0f5-9d31-4b20-898d-00947c1a2b8e', '179320f9-8ea6-44fd-b67a-40c342a385c5', 1, 2, '1-2-1793', 'Available', '2025-06-06 08:18:47'),
('40ac2a0f-3706-4b94-afba-3614a9ccbcc8', '179320f9-8ea6-44fd-b67a-40c342a385c5', 2, 1, '2-1-1793', 'Available', '2025-06-06 08:18:47'),
('4af13598-72be-4673-8490-8e823f3f4f03', '179320f9-8ea6-44fd-b67a-40c342a385c5', 2, 2, '2-2-1793', 'Available', '2025-06-06 08:18:47'),
('0618b28a-9a84-4feb-a8e4-e79429b1ac9b', '19f69cda-fc3f-4732-aef0-54fc58fe4d5d', 1, 1, '1-1-19f6', 'Available', '2025-06-06 08:18:47'),
('7ad603e4-438b-4a30-b81f-c7adcd8c9566', '19f69cda-fc3f-4732-aef0-54fc58fe4d5d', 1, 2, '1-2-19f6', 'Available', '2025-06-06 08:18:47'),
('856b01ea-a941-4628-ab60-ec0a2abc3714', '19f69cda-fc3f-4732-aef0-54fc58fe4d5d', 2, 1, '2-1-19f6', 'Available', '2025-06-06 08:18:47'),
('588fde66-908a-4209-9fab-8fc8206b3d14', '19f69cda-fc3f-4732-aef0-54fc58fe4d5d', 2, 2, '2-2-19f6', 'Available', '2025-06-06 08:18:47'),
('5a607ade-5096-4683-8b60-94ae0937ebb9', '4e5f76b9-0d7f-4f6f-b7ce-6846b4c38911', 1, 1, '1-1-4e5f', 'Available', '2025-06-06 08:18:47'),
('9e14f9d7-0b6e-4a4a-9aec-d632a5a1f622', '4e5f76b9-0d7f-4f6f-b7ce-6846b4c38911', 1, 2, '1-2-4e5f', 'Available', '2025-06-06 08:18:47'),
('5291bee8-6652-40cf-84ad-d404565e207f', '4e5f76b9-0d7f-4f6f-b7ce-6846b4c38911', 2, 1, '2-1-4e5f', 'Available', '2025-06-06 08:18:47'),
('8eb32db5-cbec-4809-bd98-e4d2e2e8bdaf', '4e5f76b9-0d7f-4f6f-b7ce-6846b4c38911', 2, 2, '2-2-4e5f', 'Available', '2025-06-06 08:18:47');

-- AUTO-FILL missing niches: 10 columns x 8 rows per block
INSERT INTO Niche (nicheID, blockID, nicheColumn, nicheRow, nicheCode, status)
SELECT
    UUID(),
    b.blockID,
    c.num AS nicheColumn,
    r.num AS nicheRow,
    CONCAT(c.num, '-', r.num, '-', LEFT(b.blockID, 4)),
    'Available'
FROM
    Block b
    CROSS JOIN (SELECT 1 AS num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) c
    CROSS JOIN (SELECT 1 AS num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8) r
WHERE
    NOT EXISTS (
        SELECT 1 FROM Niche n
        WHERE n.blockID = b.blockID
          AND n.nicheColumn = c.num
          AND n.nicheRow = r.num
    );

-- INSERT INTO Payment (paymentID, amount, paymentMethod, paymentDate, paymentStatus) VALUES
-- ('ac4a9159-ba34-44fd-8b5c-935aff4f5852', 1619.88, 'Credit Card', '2025-06-06', 'Pending'),
-- ('08f68240-e534-4ce9-b48a-43013b8172b7', 2948.52, 'Bank Transfer', '2025-06-06', 'Fully Paid'),
-- ('2d245a62-09bb-4f8b-81e0-6bbbd5c78770', 2304.74, 'Bank Transfer', '2025-06-06', 'Fully Paid'),
-- ('8a610402-4352-4322-8baa-06cefdd06546', 2757.44, 'Cash', '2025-06-06', 'Refunded'),
-- ('5277a396-bb15-4c31-9110-91cf4bb2cff9', 2481.51, 'Cash', '2025-06-06', 'Pending'),
-- ('0205b357-bf95-4111-829a-9414d1850028', 1859.63, 'Credit Card', '2025-06-06', 'Fully Paid'),
-- ('4a58ee6c-bb49-42ea-9c76-af3c5ad463ad', 2161.52, 'Bank Transfer', '2025-06-06', 'Pending'),
-- ('75c7245d-ce2a-4a33-b9c3-7f9126aad4f0', 2643.35, 'Credit Card', '2025-06-06', 'Refunded'),
-- ('2e70df2a-bfec-49ee-ab08-c12fd9792202', 1944.28, 'Bank Transfer', '2025-06-06', 'Pending'),
-- ('bc6d0460-914e-40ac-9099-24e8df77f43c', 1633.26, 'Bank Transfer', '2025-06-06', 'Fully Paid'),
-- ('b64abb07-f0fe-4a78-b003-2608467c06ef', 1666.7, 'Bank Transfer', '2025-06-06', 'Refunded');

-- -- Niche status mapping:
-- -- - Current → Occupied
-- -- - PreOrder → Reserved
-- -- - Archived → Available

-- -- All Booking types and statuses now properly match the required niche status logic.

-- -- Ensure Niche table already has these statuses for the below nicheIDs

-- INSERT INTO Booking (bookingID, nicheID, paidByID, paymentID, beneficiaryID, bookingType, bookingStatus) VALUES
-- -- Current → Confirmed → Niche must be Occupied
-- ('4f9a5a8c-3c76-4d93-a462-5b6f91a7a6be', '693aa513-05cb-43b3-8ad1-12b202b8f82e', '79a4e4f0-5d5c-472b-95f7-bc237faffc2a', 'ac4a9159-ba34-44fd-8b5c-935aff4f5852', '8fb6d670-06f0-4d80-bcd2-0611648e9f4f', 'Current', 'Confirmed'),

-- -- PreOrder → Pending → Niche must be Reserved
-- ('8c0e2e0a-eeb1-4727-a5f0-31f4fc4e34a2', '564a5355-8bbc-42fb-9f6f-e90430d64e3d', '79a4e4f0-5d5c-472b-95f7-bc237faffc2a', '08f68240-e534-4ce9-b48a-43013b8172b7', '27e6a7a2-82a1-4a55-ac1e-582e6dc4dbc5', 'PreOrder', 'Pending'),

-- -- Archived → Confirmed → Niche must be Available
-- ('1b2cd3a1-7c3e-49d2-aab6-cb0f5dbd1e2f', 'ac1f2a9e-a9f1-45fd-b40d-a2c453ad267e', '79a4e4f0-5d5c-472b-95f7-bc237faffc2a', '2d245a62-09bb-4f8b-81e0-6bbbd5c78770', '1b4a9a6e-653a-45be-aa49-52e26bde8f82', 'Archived', 'Confirmed'),

-- -- PreOrder → Cancelled → Niche still considered Reserved
-- ('9db774d7-51c0-4e35-8c0f-e24c9628ed1f', 'ddd6422d-d914-427b-be7e-7be893619811', '79a4e4f0-5d5c-472b-95f7-bc237faffc2a', '8a610402-4352-4322-8baa-06cefdd06546', '4ecb99d7-7c2d-4310-be76-0305513a1490', 'PreOrder', 'Cancelled'),

-- -- PreOrder → Confirmed → Niche must be Reserved
-- ('b492c8a5-6726-4a11-a26e-5bb95f6efdea', '92c8ae2a-d68b-45e3-be65-14f9b344c325', '79a4e4f0-5d5c-472b-95f7-bc237faffc2a', '5277a396-bb15-4c31-9110-91cf4bb2cff9', '0c8517f2-0b84-424d-8854-7cb96e84141e', 'PreOrder', 'Confirmed'),

-- -- Archived → Confirmed → Niche must be Available
-- ('0d4a2a13-6b5b-4f7a-a3a8-72357f42f2cd', 'a85ff83d-142c-43aa-acb5-275589d9f10c', '79a4e4f0-5d5c-472b-95f7-bc237faffc2a', '0205b357-bf95-4111-829a-9414d1850028', '3a4bf023-58aa-4574-b2af-639ce375d92a', 'Archived', 'Confirmed'),

-- -- Current → Confirmed → Niche must be Occupied
-- ('5e3c2bb4-104f-42d3-9bb6-68c98f06a676', '467aace6-ca13-4939-8469-d68c05063cf7', '28d19716-d0f8-4c90-ace1-60a8143d4c1a', '4a58ee6c-bb49-42ea-9c76-af3c5ad463ad', '7989e00f-ec52-443d-8ca3-f1642ddd5686', 'Current', 'Confirmed'),

-- -- PreOrder → Cancelled → Niche still considered Reserved
-- ('e7d98724-8657-4cb2-9b2a-6a084d539b88', 'd133e0f5-9d31-4b20-898d-00947c1a2b8e', '28d19716-d0f8-4c90-ace1-60a8143d4c1a', '75c7245d-ce2a-4a33-b9c3-7f9126aad4f0', '6f3fed40-f317-4786-84c5-a093f1ba8724', 'PreOrder', 'Cancelled'),

-- -- Archived → Pending → Niche must be Available
-- ('3372a4e3-7c9f-423a-b4b6-0de6f5cc5dd3', 'ece0289b-54b2-4b0c-b8ba-535f655e2c14', '28d19716-d0f8-4c90-ace1-60a8143d4c1a', '2e70df2a-bfec-49ee-ab08-c12fd9792202', '3c15e5b3-25e2-404f-adca-c5e360a75f14', 'Archived', 'Pending'),

-- -- Archived → Confirmed → Niche must be Available
-- ('84d29c01-179b-4ae1-a9d0-69c5d0c064e0', '0618b28a-9a84-4feb-a8e4-e79429b1ac9b', '28d19716-d0f8-4c90-ace1-60a8143d4c1a', 'bc6d0460-914e-40ac-9099-24e8df77f43c', 'd95887dd-c1e4-4598-b908-db696cbb4cd6', 'Archived', 'Confirmed'),

-- -- Archived → Confirmed → Niche must be Available
-- ('c6d76030-251a-4a4b-8f42-08d3980124d2', '588fde66-908a-4209-9fab-8fc8206b3d14', '28d19716-d0f8-4c90-ace1-60a8143d4c1a', 'b64abb07-f0fe-4a78-b003-2608467c06ef', 'e2addc40-cf96-403a-a3e1-2188d4617bed', 'Archived', 'Confirmed');
