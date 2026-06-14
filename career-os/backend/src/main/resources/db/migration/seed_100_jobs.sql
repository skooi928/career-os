-- ── Seed: 100 Diverse Job Postings for Fair Pay Salary Benchmarking ─────────
-- Run this in Supabase SQL Editor.
-- Covers: Tech, Finance, Marketing, Operations, Design, Healthcare, Engineering
-- Locations: KL, Penang, Johor Bahru, Selangor, Cyberjaya, Remote, Sabah, Sarawak
-- Salaries in MYR/month — Malaysian market rates as of 2025-2026
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO jobs (id, title, company, initials, location, employment_type, min_salary, max_salary, deadline, vacancies, website, created_at) VALUES

-- ── TECH ROLES (001–035) ─────────────────────────────────────────────────────
('a0000000-0001-0000-0000-000000000001', 'Junior Software Engineer', 'TechVenture Sdn Bhd', 'TV', 'Kuala Lumpur', 'Full-time', 3500, 5500, '2026-09-30', 3, 'https://techventure.my', NOW()),
('a0000000-0001-0000-0000-000000000002', 'Software Engineer', 'Nexus Systems Sdn Bhd', 'NS', 'Cyberjaya, Selangor', 'Full-time', 5500, 8500, '2026-09-15', 2, 'https://nexussystems.my', NOW()),
('a0000000-0001-0000-0000-000000000003', 'Senior Software Engineer', 'CloudNine Malaysia', 'CN', 'Petaling Jaya, Selangor', 'Full-time', 9000, 14000, '2026-10-31', 2, 'https://cloudnine.my', NOW()),
('a0000000-0001-0000-0000-000000000004', 'Software Engineer (Backend)', 'DataSpark Analytics', 'DS', 'Penang', 'Full-time', 5000, 8000, '2026-08-31', 3, 'https://dataspark.my', NOW()),
('a0000000-0001-0000-0000-000000000005', 'Frontend Developer', 'BlueSky Digital', 'BD', 'Kuala Lumpur', 'Full-time', 4500, 7500, '2026-09-30', 2, 'https://blueskydigital.my', NOW()),
('a0000000-0001-0000-0000-000000000006', 'Full Stack Developer', 'KL Digital Hub', 'KD', 'Johor Bahru', 'Full-time', 5000, 9000, '2026-09-30', 3, 'https://kldigitalhub.my', NOW()),
('a0000000-0001-0000-0000-000000000007', 'Full Stack Developer', 'Pacific Rim Technologies', 'PR', 'Remote', 'Full-time', 6000, 10000, '2026-10-31', 5, 'https://pacificrim.tech', NOW()),
('a0000000-0001-0000-0000-000000000008', 'Mobile Developer (iOS)', 'PetalingTech Berhad', 'PT', 'Kuala Lumpur', 'Full-time', 5500, 9500, '2026-09-30', 2, 'https://petalingtech.my', NOW()),
('a0000000-0001-0000-0000-000000000009', 'Mobile Developer (Android)', 'Nexus Systems Sdn Bhd', 'NS', 'Shah Alam, Selangor', 'Full-time', 5000, 9000, '2026-10-15', 2, 'https://nexussystems.my', NOW()),
('a0000000-0001-0000-0000-000000000010', 'Junior Data Analyst', 'RainForest Analytics', 'RA', 'Kuala Lumpur', 'Full-time', 3000, 5000, '2026-08-31', 4, 'https://rainforest.my', NOW()),
('a0000000-0001-0000-0000-000000000011', 'Data Analyst', 'AsiaPacific Analytics', 'AP', 'Penang', 'Full-time', 5000, 8000, '2026-09-15', 2, 'https://asiapacific-analytics.my', NOW()),
('a0000000-0001-0000-0000-000000000012', 'Senior Data Analyst', 'DataSpark Analytics', 'DS', 'Kuala Lumpur', 'Full-time', 7500, 12000, '2026-10-31', 2, 'https://dataspark.my', NOW()),
('a0000000-0001-0000-0000-000000000013', 'Data Scientist', 'CloudNine Malaysia', 'CN', 'Cyberjaya, Selangor', 'Full-time', 7000, 13000, '2026-10-31', 2, 'https://cloudnine.my', NOW()),
('a0000000-0001-0000-0000-000000000014', 'Machine Learning Engineer', 'AsiaPacific Analytics', 'AP', 'Kuala Lumpur', 'Full-time', 8000, 15000, '2026-11-30', 1, 'https://asiapacific-analytics.my', NOW()),
('a0000000-0001-0000-0000-000000000015', 'AI Engineer', 'Pacific Rim Technologies', 'PR', 'Bangsar South, KL', 'Full-time', 9000, 16000, '2026-11-30', 2, 'https://pacificrim.tech', NOW()),
('a0000000-0001-0000-0000-000000000016', 'DevOps Engineer', 'TechVenture Sdn Bhd', 'TV', 'Kuala Lumpur', 'Full-time', 6000, 11000, '2026-09-30', 2, 'https://techventure.my', NOW()),
('a0000000-0001-0000-0000-000000000017', 'Cloud Architect', 'CloudNine Malaysia', 'CN', 'Cyberjaya, Selangor', 'Full-time', 10000, 17000, '2026-11-30', 1, 'https://cloudnine.my', NOW()),
('a0000000-0001-0000-0000-000000000018', 'Cybersecurity Analyst', 'Nexus Systems Sdn Bhd', 'NS', 'Kuala Lumpur', 'Full-time', 5500, 10000, '2026-10-31', 2, 'https://nexussystems.my', NOW()),
('a0000000-0001-0000-0000-000000000019', 'Network Engineer', 'KL Digital Hub', 'KD', 'Subang Jaya, Selangor', 'Full-time', 4500, 8000, '2026-09-30', 2, 'https://kldigitalhub.my', NOW()),
('a0000000-0001-0000-0000-000000000020', 'QA Engineer', 'BlueSky Digital', 'BD', 'Petaling Jaya, Selangor', 'Full-time', 3500, 6500, '2026-09-15', 3, 'https://blueskydigital.my', NOW()),
('a0000000-0001-0000-0000-000000000021', 'Product Manager', 'PetalingTech Berhad', 'PT', 'Kuala Lumpur', 'Full-time', 7000, 13000, '2026-10-31', 2, 'https://petalingtech.my', NOW()),
('a0000000-0001-0000-0000-000000000022', 'Technical Product Manager', 'DataSpark Analytics', 'DS', 'Cyberjaya, Selangor', 'Full-time', 8000, 15000, '2026-11-30', 1, 'https://dataspark.my', NOW()),
('a0000000-0001-0000-0000-000000000023', 'Scrum Master', 'Pacific Rim Technologies', 'PR', 'Remote', 'Full-time', 6000, 10000, '2026-10-31', 2, 'https://pacificrim.tech', NOW()),
('a0000000-0001-0000-0000-000000000024', 'IT Project Manager', 'TechVenture Sdn Bhd', 'TV', 'Kuala Lumpur', 'Full-time', 7000, 13000, '2026-10-31', 2, 'https://techventure.my', NOW()),
('a0000000-0001-0000-0000-000000000025', 'Software Engineer', 'Northern IT Solutions', 'NI', 'Kota Kinabalu, Sabah', 'Full-time', 4000, 7000, '2026-09-30', 3, 'https://northernit.my', NOW()),
('a0000000-0001-0000-0000-000000000026', 'Junior Frontend Developer', 'Sarawak Tech Ventures', 'ST', 'Kuching, Sarawak', 'Full-time', 3000, 5000, '2026-08-31', 3, 'https://sarawaktech.my', NOW()),
('a0000000-0001-0000-0000-000000000027', 'Backend Developer', 'BlueSky Digital', 'BD', 'Johor Bahru', 'Full-time', 5000, 9000, '2026-09-30', 2, 'https://blueskydigital.my', NOW()),
('a0000000-0001-0000-0000-000000000028', 'Database Administrator', 'RainForest Analytics', 'RA', 'Kuala Lumpur', 'Full-time', 6000, 11000, '2026-10-31', 2, 'https://rainforest.my', NOW()),
('a0000000-0001-0000-0000-000000000029', 'Systems Analyst', 'Nexus Systems Sdn Bhd', 'NS', 'Shah Alam, Selangor', 'Full-time', 5000, 9000, '2026-09-30', 2, 'https://nexussystems.my', NOW()),
('a0000000-0001-0000-0000-000000000030', 'Software Engineer (Internship)', 'TechVenture Sdn Bhd', 'TV', 'Kuala Lumpur', 'Internship', 1200, 1800, '2026-08-31', 5, 'https://techventure.my', NOW()),
('a0000000-0001-0000-0000-000000000031', 'Data Analyst (Internship)', 'DataSpark Analytics', 'DS', 'Cyberjaya, Selangor', 'Internship', 1000, 1500, '2026-08-31', 3, 'https://dataspark.my', NOW()),
('a0000000-0001-0000-0000-000000000032', 'IT Support Engineer', 'KL Digital Hub', 'KD', 'Petaling Jaya, Selangor', 'Full-time', 2800, 4500, '2026-09-30', 3, 'https://kldigitalhub.my', NOW()),
('a0000000-0001-0000-0000-000000000033', 'Software Engineer (Contract)', 'Pacific Rim Technologies', 'PR', 'Remote', 'Contract', 7000, 12000, '2026-09-30', 3, 'https://pacificrim.tech', NOW()),
('a0000000-0001-0000-0000-000000000034', 'Site Reliability Engineer', 'CloudNine Malaysia', 'CN', 'Kuala Lumpur', 'Full-time', 8000, 14000, '2026-10-31', 2, 'https://cloudnine.my', NOW()),
('a0000000-0001-0000-0000-000000000035', 'Software Architect', 'PetalingTech Berhad', 'PT', 'Kuala Lumpur', 'Full-time', 12000, 20000, '2026-11-30', 1, 'https://petalingtech.my', NOW()),

-- ── FINANCE & BUSINESS (036–050) ─────────────────────────────────────────────
('a0000000-0001-0000-0000-000000000036', 'Junior Accountant', 'Emerald Finance Berhad', 'EF', 'Kuala Lumpur', 'Full-time', 2800, 4000, '2026-08-31', 5, 'https://emeraldfinance.my', NOW()),
('a0000000-0001-0000-0000-000000000037', 'Accountant', 'Mayflower Holdings Berhad', 'MH', 'Petaling Jaya, Selangor', 'Full-time', 4500, 7000, '2026-09-30', 3, 'https://mayflower.my', NOW()),
('a0000000-0001-0000-0000-000000000038', 'Senior Accountant', 'Emerald Finance Berhad', 'EF', 'Kuala Lumpur', 'Full-time', 6500, 9500, '2026-10-31', 2, 'https://emeraldfinance.my', NOW()),
('a0000000-0001-0000-0000-000000000039', 'Finance Analyst', 'MyFinance Group Berhad', 'MF', 'Cyberjaya, Selangor', 'Full-time', 4500, 8000, '2026-09-30', 3, 'https://myfinance.my', NOW()),
('a0000000-0001-0000-0000-000000000040', 'Senior Finance Analyst', 'Mayflower Holdings Berhad', 'MH', 'Kuala Lumpur', 'Full-time', 7000, 11000, '2026-10-31', 2, 'https://mayflower.my', NOW()),
('a0000000-0001-0000-0000-000000000041', 'Investment Analyst', 'MyFinance Group Berhad', 'MF', 'KLCC, Kuala Lumpur', 'Full-time', 6000, 10000, '2026-10-31', 2, 'https://myfinance.my', NOW()),
('a0000000-0001-0000-0000-000000000042', 'Risk Analyst', 'Emerald Finance Berhad', 'EF', 'Kuala Lumpur', 'Full-time', 5000, 9000, '2026-10-31', 2, 'https://emeraldfinance.my', NOW()),
('a0000000-0001-0000-0000-000000000043', 'Audit Associate', 'GreenLeaf Consultancy', 'GL', 'Kuala Lumpur', 'Full-time', 3000, 5000, '2026-09-30', 4, 'https://greenleaf.my', NOW()),
('a0000000-0001-0000-0000-000000000044', 'Business Analyst', 'DataSpark Analytics', 'DS', 'Cyberjaya, Selangor', 'Full-time', 5000, 9000, '2026-10-31', 3, 'https://dataspark.my', NOW()),
('a0000000-0001-0000-0000-000000000045', 'Financial Controller', 'Mayflower Holdings Berhad', 'MH', 'Kuala Lumpur', 'Full-time', 10000, 16000, '2026-11-30', 1, 'https://mayflower.my', NOW()),
('a0000000-0001-0000-0000-000000000046', 'Tax Consultant', 'GreenLeaf Consultancy', 'GL', 'Kuala Lumpur', 'Full-time', 4500, 8000, '2026-09-30', 3, 'https://greenleaf.my', NOW()),
('a0000000-0001-0000-0000-000000000047', 'Credit Analyst', 'MyFinance Group Berhad', 'MF', 'Penang', 'Full-time', 4000, 7000, '2026-09-30', 2, 'https://myfinance.my', NOW()),
('a0000000-0001-0000-0000-000000000048', 'Treasury Analyst', 'Emerald Finance Berhad', 'EF', 'Kuala Lumpur', 'Full-time', 5000, 9000, '2026-10-31', 2, 'https://emeraldfinance.my', NOW()),
('a0000000-0001-0000-0000-000000000049', 'Finance Intern', 'Mayflower Holdings Berhad', 'MH', 'Kuala Lumpur', 'Internship', 1000, 1500, '2026-08-31', 5, 'https://mayflower.my', NOW()),
('a0000000-0001-0000-0000-000000000050', 'Finance Manager', 'MyFinance Group Berhad', 'MF', 'Johor Bahru', 'Full-time', 8000, 13000, '2026-10-31', 2, 'https://myfinance.my', NOW()),

-- ── MARKETING, SALES & BUSINESS DEVELOPMENT (051–065) ────────────────────────
('a0000000-0001-0000-0000-000000000051', 'Digital Marketing Executive', 'MalaysiaMart Sdn Bhd', 'MM', 'Kuala Lumpur', 'Full-time', 3000, 5000, '2026-09-30', 4, 'https://malaysiamart.my', NOW()),
('a0000000-0001-0000-0000-000000000052', 'Digital Marketing Manager', 'BlueSky Digital', 'BD', 'Kuala Lumpur', 'Full-time', 6000, 10000, '2026-10-31', 2, 'https://blueskydigital.my', NOW()),
('a0000000-0001-0000-0000-000000000053', 'Content Writer', 'GreenLeaf Consultancy', 'GL', 'Remote', 'Full-time', 2800, 4500, '2026-09-30', 3, 'https://greenleaf.my', NOW()),
('a0000000-0001-0000-0000-000000000054', 'Social Media Manager', 'MalaysiaMart Sdn Bhd', 'MM', 'Penang', 'Full-time', 3500, 6000, '2026-09-30', 2, 'https://malaysiamart.my', NOW()),
('a0000000-0001-0000-0000-000000000055', 'SEO Specialist', 'BlueSky Digital', 'BD', 'Kuala Lumpur', 'Full-time', 3500, 6000, '2026-09-30', 2, 'https://blueskydigital.my', NOW()),
('a0000000-0001-0000-0000-000000000056', 'Sales Executive', 'Mayflower Holdings Berhad', 'MH', 'Kuala Lumpur', 'Full-time', 3000, 5000, '2026-09-30', 5, 'https://mayflower.my', NOW()),
('a0000000-0001-0000-0000-000000000057', 'Sales Manager', 'MalaysiaMart Sdn Bhd', 'MM', 'Petaling Jaya, Selangor', 'Full-time', 6000, 11000, '2026-10-31', 2, 'https://malaysiamart.my', NOW()),
('a0000000-0001-0000-0000-000000000058', 'Brand Manager', 'Mayflower Holdings Berhad', 'MH', 'Kuala Lumpur', 'Full-time', 7000, 12000, '2026-10-31', 1, 'https://mayflower.my', NOW()),
('a0000000-0001-0000-0000-000000000059', 'Marketing Analyst', 'RainForest Analytics', 'RA', 'Kuala Lumpur', 'Full-time', 4000, 7000, '2026-09-30', 3, 'https://rainforest.my', NOW()),
('a0000000-0001-0000-0000-000000000060', 'E-commerce Specialist', 'MalaysiaMart Sdn Bhd', 'MM', 'Subang Jaya, Selangor', 'Full-time', 3500, 6000, '2026-09-30', 3, 'https://malaysiamart.my', NOW()),
('a0000000-0001-0000-0000-000000000061', 'Business Development Executive', 'GreenLeaf Consultancy', 'GL', 'Kuala Lumpur', 'Full-time', 4000, 7000, '2026-09-30', 3, 'https://greenleaf.my', NOW()),
('a0000000-0001-0000-0000-000000000062', 'Business Development Manager', 'Pacific Rim Technologies', 'PR', 'Kuala Lumpur', 'Full-time', 8000, 14000, '2026-10-31', 2, 'https://pacificrim.tech', NOW()),
('a0000000-0001-0000-0000-000000000063', 'Marketing Intern', 'BlueSky Digital', 'BD', 'Kuala Lumpur', 'Internship', 900, 1300, '2026-08-31', 3, 'https://blueskydigital.my', NOW()),
('a0000000-0001-0000-0000-000000000064', 'Performance Marketing Specialist', 'MalaysiaMart Sdn Bhd', 'MM', 'Kuala Lumpur', 'Full-time', 4500, 8000, '2026-10-31', 2, 'https://malaysiamart.my', NOW()),
('a0000000-0001-0000-0000-000000000065', 'Growth Marketing Lead', 'PetalingTech Berhad', 'PT', 'Remote', 'Contract', 6000, 10000, '2026-09-30', 2, 'https://petalingtech.my', NOW()),

-- ── OPERATIONS, HR & ADMIN (066–078) ─────────────────────────────────────────
('a0000000-0001-0000-0000-000000000066', 'HR Executive', 'TalentFirst HR Solutions', 'TF', 'Kuala Lumpur', 'Full-time', 3000, 5000, '2026-09-30', 4, 'https://talentfirst.my', NOW()),
('a0000000-0001-0000-0000-000000000067', 'HR Manager', 'Mayflower Holdings Berhad', 'MH', 'Petaling Jaya, Selangor', 'Full-time', 6000, 10000, '2026-10-31', 2, 'https://mayflower.my', NOW()),
('a0000000-0001-0000-0000-000000000068', 'Talent Acquisition Specialist', 'TalentFirst HR Solutions', 'TF', 'Kuala Lumpur', 'Full-time', 4000, 7000, '2026-09-30', 3, 'https://talentfirst.my', NOW()),
('a0000000-0001-0000-0000-000000000069', 'Operations Manager', 'Peninsular Engineering Group', 'PE', 'Penang', 'Full-time', 7000, 12000, '2026-10-31', 2, 'https://peninsular-eng.my', NOW()),
('a0000000-0001-0000-0000-000000000070', 'Supply Chain Analyst', 'MalaysiaMart Sdn Bhd', 'MM', 'Shah Alam, Selangor', 'Full-time', 4000, 7500, '2026-09-30', 3, 'https://malaysiamart.my', NOW()),
('a0000000-0001-0000-0000-000000000071', 'Logistics Coordinator', 'Peninsular Engineering Group', 'PE', 'Subang Jaya, Selangor', 'Full-time', 3000, 5500, '2026-09-30', 4, 'https://peninsular-eng.my', NOW()),
('a0000000-0001-0000-0000-000000000072', 'Project Manager', 'TechVenture Sdn Bhd', 'TV', 'Kuala Lumpur', 'Full-time', 6000, 12000, '2026-10-31', 2, 'https://techventure.my', NOW()),
('a0000000-0001-0000-0000-000000000073', 'Admin Executive', 'GreenLeaf Consultancy', 'GL', 'Kuala Lumpur', 'Full-time', 2500, 3800, '2026-09-30', 3, 'https://greenleaf.my', NOW()),
('a0000000-0001-0000-0000-000000000074', 'Customer Service Executive', 'MalaysiaMart Sdn Bhd', 'MM', 'Kuala Lumpur', 'Full-time', 2800, 4000, '2026-09-30', 5, 'https://malaysiamart.my', NOW()),
('a0000000-0001-0000-0000-000000000075', 'Operations Analyst', 'DataSpark Analytics', 'DS', 'Cyberjaya, Selangor', 'Full-time', 3500, 6500, '2026-09-30', 3, 'https://dataspark.my', NOW()),
('a0000000-0001-0000-0000-000000000076', 'HR Intern', 'TalentFirst HR Solutions', 'TF', 'Kuala Lumpur', 'Internship', 800, 1200, '2026-08-31', 3, 'https://talentfirst.my', NOW()),
('a0000000-0001-0000-0000-000000000077', 'Office Manager', 'Emerald Finance Berhad', 'EF', 'Kuala Lumpur', 'Full-time', 4000, 7000, '2026-09-30', 2, 'https://emeraldfinance.my', NOW()),
('a0000000-0001-0000-0000-000000000078', 'Procurement Specialist', 'Peninsular Engineering Group', 'PE', 'Shah Alam, Selangor', 'Full-time', 4000, 7500, '2026-09-30', 2, 'https://peninsular-eng.my', NOW()),

-- ── DESIGN & CREATIVE (079–088) ───────────────────────────────────────────────
('a0000000-0001-0000-0000-000000000079', 'UI/UX Designer', 'BlueSky Digital', 'BD', 'Kuala Lumpur', 'Full-time', 4000, 7500, '2026-09-30', 3, 'https://blueskydigital.my', NOW()),
('a0000000-0001-0000-0000-000000000080', 'Senior UI/UX Designer', 'PetalingTech Berhad', 'PT', 'Kuala Lumpur', 'Full-time', 7000, 12000, '2026-10-31', 2, 'https://petalingtech.my', NOW()),
('a0000000-0001-0000-0000-000000000081', 'Graphic Designer', 'MalaysiaMart Sdn Bhd', 'MM', 'Penang', 'Full-time', 3000, 5500, '2026-09-30', 3, 'https://malaysiamart.my', NOW()),
('a0000000-0001-0000-0000-000000000082', 'Product Designer', 'TechVenture Sdn Bhd', 'TV', 'Cyberjaya, Selangor', 'Full-time', 5500, 10000, '2026-10-31', 2, 'https://techventure.my', NOW()),
('a0000000-0001-0000-0000-000000000083', 'Motion Designer', 'BlueSky Digital', 'BD', 'Kuala Lumpur', 'Full-time', 4000, 7000, '2026-09-30', 2, 'https://blueskydigital.my', NOW()),
('a0000000-0001-0000-0000-000000000084', 'Creative Director', 'MalaysiaMart Sdn Bhd', 'MM', 'Kuala Lumpur', 'Full-time', 10000, 16000, '2026-11-30', 1, 'https://malaysiamart.my', NOW()),
('a0000000-0001-0000-0000-000000000085', 'Visual Designer', 'GreenLeaf Consultancy', 'GL', 'Remote', 'Full-time', 3500, 7000, '2026-09-30', 2, 'https://greenleaf.my', NOW()),
('a0000000-0001-0000-0000-000000000086', 'UI Designer (Internship)', 'PetalingTech Berhad', 'PT', 'Kuala Lumpur', 'Internship', 1000, 1500, '2026-08-31', 3, 'https://petalingtech.my', NOW()),
('a0000000-0001-0000-0000-000000000087', 'Video Editor', 'MalaysiaMart Sdn Bhd', 'MM', 'Petaling Jaya, Selangor', 'Full-time', 3000, 5500, '2026-09-30', 2, 'https://malaysiamart.my', NOW()),
('a0000000-0001-0000-0000-000000000088', 'UX Researcher', 'DataSpark Analytics', 'DS', 'Kuala Lumpur', 'Full-time', 5000, 9000, '2026-10-31', 2, 'https://dataspark.my', NOW()),

-- ── HEALTHCARE & EDUCATION (089–095) ─────────────────────────────────────────
('a0000000-0001-0000-0000-000000000089', 'Registered Nurse', 'KPJ Healthcare Sdn Bhd', 'KJ', 'Kuala Lumpur', 'Full-time', 3000, 5000, '2026-09-30', 10, 'https://kpj.com.my', NOW()),
('a0000000-0001-0000-0000-000000000090', 'Pharmacist', 'Guardian Health & Beauty', 'GH', 'Penang', 'Full-time', 4500, 7000, '2026-09-30', 4, 'https://guardian.com.my', NOW()),
('a0000000-0001-0000-0000-000000000091', 'Medical Laboratory Technologist', 'KPJ Healthcare Sdn Bhd', 'KJ', 'Kuala Lumpur', 'Full-time', 3500, 5500, '2026-09-30', 5, 'https://kpj.com.my', NOW()),
('a0000000-0001-0000-0000-000000000092', 'Physiotherapist', 'Pantai Hospital', 'PH', 'Kuala Lumpur', 'Full-time', 4000, 6500, '2026-09-30', 3, 'https://pantai.com.my', NOW()),
('a0000000-0001-0000-0000-000000000093', 'Lecturer', 'Multimedia University', 'MM', 'Cyberjaya, Selangor', 'Full-time', 4500, 8000, '2026-10-31', 5, 'https://mmu.edu.my', NOW()),
('a0000000-0001-0000-0000-000000000094', 'Training & Development Specialist', 'TalentFirst HR Solutions', 'TF', 'Kuala Lumpur', 'Full-time', 4000, 7000, '2026-09-30', 3, 'https://talentfirst.my', NOW()),
('a0000000-0001-0000-0000-000000000095', 'Secondary School Teacher', 'SJK Selangor', 'SJ', 'Shah Alam, Selangor', 'Full-time', 2800, 4500, '2026-08-31', 5, 'https://sjk.edu.my', NOW()),

-- ── ENGINEERING NON-IT (096–100) ─────────────────────────────────────────────
('a0000000-0001-0000-0000-000000000096', 'Mechanical Engineer', 'SolarPeak Engineering', 'SP', 'Shah Alam, Selangor', 'Full-time', 3500, 7000, '2026-09-30', 4, 'https://solarpeak.my', NOW()),
('a0000000-0001-0000-0000-000000000097', 'Civil Engineer', 'Peninsular Engineering Group', 'PE', 'Kuala Lumpur', 'Full-time', 4000, 8000, '2026-10-31', 4, 'https://peninsular-eng.my', NOW()),
('a0000000-0001-0000-0000-000000000098', 'Electrical Engineer', 'SolarPeak Engineering', 'SP', 'Penang', 'Full-time', 4000, 7500, '2026-09-30', 3, 'https://solarpeak.my', NOW()),
('a0000000-0001-0000-0000-000000000099', 'Process Engineer', 'Peninsular Engineering Group', 'PE', 'Johor Bahru', 'Full-time', 5000, 9000, '2026-10-31', 3, 'https://peninsular-eng.my', NOW()),
('a0000000-0001-0000-0000-000000000100', 'Chemical Engineer', 'SolarPeak Engineering', 'SP', 'Gebeng, Pahang', 'Full-time', 4500, 8500, '2026-10-31', 2, 'https://solarpeak.my', NOW())

ON CONFLICT (id) DO NOTHING;


-- ── JOB BENEFITS ─────────────────────────────────────────────────────────────
INSERT INTO job_benefits (benefit_id, job_id, benefit_text) VALUES
-- Tech roles benefits
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000001', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000001', 'Flexible working hours'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000001', 'Training and development budget RM3,000/year'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000002', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000002', 'Performance bonus (1-3 months)'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000002', 'Remote work 2 days per week'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000002', 'Company laptop provided'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000003', 'Comprehensive medical, dental and optical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000003', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000003', 'Hybrid work arrangement'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000003', 'Training budget RM5,000/year'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000003', 'ESOP stock options'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000004', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000004', 'Annual leave 18 days'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000004', 'Performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000005', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000005', 'Flexible working hours'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000005', 'Remote work 3 days per week'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000006', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000006', 'Annual bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000006', 'Annual leave 16 days'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000007', 'Fully remote work'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000007', 'Home office allowance RM2,000'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000007', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000007', 'Flexible work schedule'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000008', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000008', 'Performance bonus (2-4 months)'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000008', 'Company iPhone provided'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000009', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000009', 'Quarterly team building activities'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000009', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000010', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000010', 'Flexi hours'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000010', 'Training and certification support'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000011', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000011', 'Annual leave 16 days'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000011', 'Performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000012', 'Comprehensive medical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000012', 'Annual bonus 2-3 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000012', 'AWS/GCP certification reimbursement'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000012', 'Hybrid work arrangement'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000013', 'Medical, dental and optical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000013', 'Conference attendance budget'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000013', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000013', 'Hybrid work 3 days WFH'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000014', 'Comprehensive medical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000014', 'Annual bonus 2-4 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000014', 'Professional certification budget RM8,000/year'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000014', 'ESOP stock options'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000014', 'Flexible/remote work'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000015', 'Premium medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000015', 'Annual bonus 3-5 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000015', 'Stock options'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000015', 'Conference and training budget RM10,000/year'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000016', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000016', 'Certification support (AWS, Kubernetes)'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000016', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000016', 'Hybrid work arrangement'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000017', 'Comprehensive medical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000017', 'Annual bonus 3-5 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000017', 'Cloud certification reimbursement'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000017', 'Car allowance RM1,000/month'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000017', 'ESOP stock options'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000018', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000018', 'Security certification budget (CISSP, CEH)'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000018', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000019', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000019', 'Annual leave 14 days'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000019', 'Overtime compensation'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000020', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000020', 'Flexible working hours'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000020', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000021', 'Comprehensive medical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000021', 'Annual bonus 2-4 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000021', 'Leadership development program'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000021', 'Car allowance'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000022', 'Premium medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000022', 'Annual bonus 3-5 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000022', 'ESOP stock options'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000022', 'Training budget RM8,000/year'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000023', 'Fully remote / hybrid'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000023', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000023', 'Agile certification reimbursement'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000024', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000024', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000024', 'PMP certification support'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000024', 'Car allowance RM800/month'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000025', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000025', 'Relocation allowance for outstation candidates'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000025', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000026', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000026', 'Annual leave 14 days'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000026', 'Mentorship program'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000027', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000027', 'Hybrid work 2 days WFH'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000027', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000028', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000028', 'Oracle/PostgreSQL certification support'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000028', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000029', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000029', 'Annual leave 16 days'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000029', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000030', 'Internship allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000030', 'Mentorship by senior engineers'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000030', 'Potential full-time conversion'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000031', 'Internship allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000031', 'Learning and development support'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000031', 'Flexible internship hours'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000032', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000032', 'Overtime allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000032', 'Transport allowance'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000033', 'Remote work'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000033', 'Contract renewal based on performance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000033', 'Competitive contract rate'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000034', 'Comprehensive medical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000034', 'Annual bonus 2-4 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000034', 'On-call allowance RM500/month'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000034', 'Cloud certification budget'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000035', 'Premium medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000035', 'Annual bonus 3-5 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000035', 'ESOP stock options'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000035', 'Car allowance RM1,200/month'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000035', 'Executive health screening'),

-- Finance benefits
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000036', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000036', 'Annual leave 14 days'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000036', 'ACCA/CPA study support'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000037', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000037', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000037', 'Professional development support'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000038', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000038', 'Annual bonus 1-2 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000038', 'CPA/ACCA certification reimbursement'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000038', 'Annual leave 18 days'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000039', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000039', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000039', 'CFA study support'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000040', 'Comprehensive medical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000040', 'Annual bonus 2-3 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000040', 'Car allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000040', 'Annual leave 20 days'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000041', 'Medical and dental coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000041', 'Annual bonus based on fund performance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000041', 'CFA exam sponsorship'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000041', 'Bloomberg terminal access'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000042', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000042', 'FRM certification support'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000042', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000043', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000043', 'Annual leave 14 days'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000043', 'Audit certification support'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000044', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000044', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000044', 'Hybrid work arrangement'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000045', 'Premium medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000045', 'Annual bonus 2-4 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000045', 'Car allowance RM1,500/month'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000045', 'Executive health screening'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000046', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000046', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000046', 'Tax certification support (CTIM)'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000047', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000047', 'Annual leave 16 days'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000047', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000048', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000048', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000048', 'Treasury certification support'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000049', 'Internship allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000049', 'Mentorship program'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000050', 'Comprehensive medical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000050', 'Annual bonus 2-3 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000050', 'Car allowance RM1,000/month'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000050', 'Annual leave 20 days'),

-- Marketing/Sales benefits
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000051', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000051', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000051', 'Digital marketing tools provided'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000052', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000052', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000052', 'Marketing tools and software budget'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000052', 'Hybrid work arrangement'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000053', 'Fully remote work'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000053', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000053', 'Flexible hours'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000054', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000054', 'Social media tool subscriptions provided'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000054', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000055', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000055', 'SEO tool subscriptions (Ahrefs, SEMrush)'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000055', 'Performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000056', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000056', 'Commission scheme'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000056', 'Transport allowance RM500/month'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000057', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000057', 'Commission + quarterly bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000057', 'Car allowance RM1,000/month'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000058', 'Comprehensive medical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000058', 'Annual bonus 2-3 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000058', 'Car allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000058', 'Entertainment/marketing budget'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000059', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000059', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000059', 'Analytics tools provided'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000060', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000060', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000060', 'E-commerce platform subscriptions'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000061', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000061', 'Commission scheme'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000061', 'Transport allowance'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000062', 'Comprehensive medical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000062', 'Annual bonus 2-4 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000062', 'Car allowance RM1,200/month'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000062', 'Entertainment allowance'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000063', 'Internship allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000063', 'Hands-on campaign exposure'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000064', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000064', 'Performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000064', 'Ad spend management tools provided'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000065', 'Fully remote'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000065', 'Performance-based contract renewal'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000065', 'Growth tools and software budget'),

-- Operations/HR benefits
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000066', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000066', 'Annual leave 14 days'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000066', 'HRDF training claimable'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000067', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000067', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000067', 'Car allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000067', 'Annual leave 18 days'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000068', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000068', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000068', 'Recruitment tools and LinkedIn Recruiter provided'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000069', 'Comprehensive medical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000069', 'Annual bonus 2-3 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000069', 'Car allowance RM1,000/month'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000070', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000070', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000070', 'Supply chain certification support'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000071', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000071', 'Transport allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000071', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000072', 'Comprehensive medical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000072', 'Annual bonus 2-3 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000072', 'PMP certification support'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000072', 'Car allowance'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000073', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000073', 'Annual leave 14 days'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000073', 'Transport allowance'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000074', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000074', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000074', 'Shift allowance'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000075', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000075', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000075', 'Flexible working hours'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000076', 'Internship allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000076', 'Exposure to full HR lifecycle'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000077', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000077', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000077', 'Annual leave 16 days'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000078', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000078', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000078', 'CIPS procurement certification support'),

-- Design benefits
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000079', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000079', 'Design tool subscriptions (Figma, Adobe CC)'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000079', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000080', 'Comprehensive medical coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000080', 'Annual bonus 2-3 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000080', 'Design conference attendance budget'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000080', 'Hybrid work arrangement'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000081', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000081', 'Adobe Creative Cloud subscription'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000081', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000082', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000082', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000082', 'Design tools provided (Figma, Sketch)'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000082', 'Remote work 2 days/week'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000083', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000083', 'Adobe Creative Cloud provided'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000083', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000084', 'Premium medical and dental coverage'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000084', 'Annual bonus 3-4 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000084', 'Full Adobe Creative Suite'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000084', 'Car allowance'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000085', 'Fully remote'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000085', 'Design tools allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000085', 'Medical insurance'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000086', 'Internship allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000086', 'Figma and design tools provided'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000086', 'Mentorship by senior designers'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000087', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000087', 'Adobe Creative Cloud subscription'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000087', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000088', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000088', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000088', 'UX conference and training budget'),

-- Healthcare/Education benefits
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000089', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000089', 'Annual leave 14 days + sick leave'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000089', 'Uniform provided'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000089', 'Annual performance bonus'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000090', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000090', 'Annual leave 16 days'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000090', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000090', 'CPD training support'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000091', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000091', 'Annual leave 14 days'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000091', 'Professional development support'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000092', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000092', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000092', 'CPD training reimbursement'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000093', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000093', 'Research grant support'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000093', 'Conference attendance budget'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000093', 'Annual leave 30 days (academic schedule)'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000094', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000094', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000094', 'HRDF trainer certification support'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000095', 'Medical insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000095', 'Annual leave 14 days + school holidays'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000095', 'EPF and SOCSO'),

-- Engineering benefits
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000096', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000096', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000096', 'Professional Engineer (PE) registration support'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000097', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000097', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000097', 'Car allowance RM700/month'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000097', 'Site allowance'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000098', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000098', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000098', 'IEM membership support'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000099', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000099', 'Annual bonus 2-3 months'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000099', 'On-site allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000099', 'Safety equipment provided'),

(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000100', 'Medical and dental insurance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000100', 'Annual performance bonus'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000100', 'Safety allowance'),
(gen_random_uuid(), 'a0000000-0001-0000-0000-000000000100', 'Accommodation provided for outstation')

ON CONFLICT DO NOTHING;
