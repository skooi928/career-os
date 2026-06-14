-- =================================================================
-- SEED DATA: 100 Malaysian Job Postings for Fair Pay AI Analysis
-- Covers: public.jobs + public.job_benefits
-- Salary unit: MYR per month
-- Run in Supabase SQL Editor — safe to re-run (ON CONFLICT DO NOTHING)
-- =================================================================

-- ==========================
-- PART 1: JOBS (100 rows)
-- ==========================
INSERT INTO public.jobs (id, employer_id, organisation_id, title, company, initials, location, employment_type, min_salary, max_salary, deadline, vacancies, website, created_at, updated_at)
VALUES
-- ===== SOFTWARE ENGINEERING (25 jobs) =====
('10000000-0000-0000-0000-000000000001', NULL, NULL, 'Junior Frontend Developer',         'TechCorp Malaysia',     'TC', 'Kuala Lumpur',   'Full-Time',  3500,  5500,  '2026-09-30', 2, 'https://techcorp.com.my',       NOW() - INTERVAL '30 days', NOW()),
('10000000-0000-0000-0000-000000000002', NULL, NULL, 'Senior Frontend Developer',          'Grab Malaysia',         'GM', 'Kuala Lumpur',   'Full-Time',  8000,  12000, '2026-10-15', 1, 'https://grab.com',              NOW() - INTERVAL '25 days', NOW()),
('10000000-0000-0000-0000-000000000003', NULL, NULL, 'Junior Backend Developer',           'Shopee Malaysia',       'SM', 'Petaling Jaya',  'Full-Time',  3800,  5800,  '2026-09-30', 3, 'https://shopee.com.my',         NOW() - INTERVAL '20 days', NOW()),
('10000000-0000-0000-0000-000000000004', NULL, NULL, 'Senior Backend Developer',           'Axiata Digital',        'AD', 'Kuala Lumpur',   'Full-Time',  9000,  14000, '2026-10-31', 1, 'https://axiata.com',            NOW() - INTERVAL '15 days', NOW()),
('10000000-0000-0000-0000-000000000005', NULL, NULL, 'Full Stack Developer',               'Revenue Monster',       'RM', 'Cyberjaya',      'Full-Time',  5000,  8000,  '2026-10-01', 2, 'https://revenuemonster.my',     NOW() - INTERVAL '10 days', NOW()),
('10000000-0000-0000-0000-000000000006', NULL, NULL, 'Senior Full Stack Developer',        'Fusionex International','FI', 'Kuala Lumpur',   'Full-Time',  8000,  13000, '2026-10-15', 1, 'https://fusionex-group.com',    NOW() - INTERVAL '28 days', NOW()),
('10000000-0000-0000-0000-000000000007', NULL, NULL, 'Android Developer',                  'AirAsia Digital',       'AA', 'Petaling Jaya',  'Full-Time',  5000,  9000,  '2026-09-30', 2, 'https://airasia.com',           NOW() - INTERVAL '18 days', NOW()),
('10000000-0000-0000-0000-000000000008', NULL, NULL, 'iOS Developer',                      'Celcom Axiata',         'CA', 'Kuala Lumpur',   'Full-Time',  5500,  9500,  '2026-10-15', 1, 'https://celcom.com.my',         NOW() - INTERVAL '22 days', NOW()),
('10000000-0000-0000-0000-000000000009', NULL, NULL, 'Software Engineer',                  'Telekom Malaysia',      'TM', 'Cyberjaya',      'Full-Time',  5000,  8000,  '2026-10-31', 3, 'https://tm.com.my',             NOW() - INTERVAL '14 days', NOW()),
('10000000-0000-0000-0000-000000000010', NULL, NULL, 'Senior Software Engineer',           'Maxis Berhad',          'MX', 'Kuala Lumpur',   'Full-Time',  9000,  14000, '2026-10-15', 1, 'https://maxis.com.my',          NOW() - INTERVAL '12 days', NOW()),
('10000000-0000-0000-0000-000000000011', NULL, NULL, 'Software Architect',                 'IBM Malaysia',          'IB', 'Petaling Jaya',  'Full-Time',  14000, 20000, '2026-11-30', 1, 'https://ibm.com/my',            NOW() - INTERVAL '8 days',  NOW()),
('10000000-0000-0000-0000-000000000012', NULL, NULL, 'React Developer',                    'MyDigi',                'MD', 'Shah Alam',      'Full-Time',  4500,  7500,  '2026-10-01', 2, 'https://digi.com.my',           NOW() - INTERVAL '16 days', NOW()),
('10000000-0000-0000-0000-000000000013', NULL, NULL, 'Java Developer',                     'CIMB Bank',             'CB', 'Kuala Lumpur',   'Full-Time',  5000,  8500,  '2026-10-31', 2, 'https://cimb.com',              NOW() - INTERVAL '20 days', NOW()),
('10000000-0000-0000-0000-000000000014', NULL, NULL, 'Node.js Developer',                  'RHB Banking Group',     'RH', 'Kuala Lumpur',   'Full-Time',  4500,  8000,  '2026-10-15', 2, 'https://rhb.com.my',            NOW() - INTERVAL '17 days', NOW()),
('10000000-0000-0000-0000-000000000015', NULL, NULL, 'Junior Software Developer',          'Fusionex International','FI', 'Penang',         'Full-Time',  3000,  5000,  '2026-09-30', 3, 'https://fusionex-group.com',    NOW() - INTERVAL '24 days', NOW()),
('10000000-0000-0000-0000-000000000016', NULL, NULL, 'Software Developer Intern',          'TechCorp Malaysia',     'TC', 'Kuala Lumpur',   'Internship', 800,   1500,  '2026-08-31', 4, 'https://techcorp.com.my',       NOW() - INTERVAL '30 days', NOW()),
('10000000-0000-0000-0000-000000000017', NULL, NULL, 'Frontend Developer Intern',          'Grab Malaysia',         'GM', 'Kuala Lumpur',   'Internship', 1000,  1800,  '2026-08-31', 3, 'https://grab.com',              NOW() - INTERVAL '25 days', NOW()),
('10000000-0000-0000-0000-000000000018', NULL, NULL, 'Backend Developer',                  'Shopee Malaysia',       'SM', 'Kuala Lumpur',   'Contract',   6000,  9000,  '2026-10-01', 2, 'https://shopee.com.my',         NOW() - INTERVAL '10 days', NOW()),
('10000000-0000-0000-0000-000000000019', NULL, NULL, 'React Native Developer',             'Revenue Monster',       'RM', 'Kuala Lumpur',   'Full-Time',  5000,  8500,  '2026-10-15', 2, 'https://revenuemonster.my',     NOW() - INTERVAL '7 days',  NOW()),
('10000000-0000-0000-0000-000000000020', NULL, NULL, 'Flutter Developer',                  'MyDigi',                'MD', 'Petaling Jaya',  'Full-Time',  4500,  8000,  '2026-10-31', 2, 'https://digi.com.my',           NOW() - INTERVAL '5 days',  NOW()),
('10000000-0000-0000-0000-000000000021', NULL, NULL, 'Senior React Developer',             'Microsoft Malaysia',    'MS', 'Kuala Lumpur',   'Full-Time',  10000, 16000, '2026-11-15', 1, 'https://microsoft.com/my',      NOW() - INTERVAL '3 days',  NOW()),
('10000000-0000-0000-0000-000000000022', NULL, NULL, 'Senior Node.js Developer',           'Google Malaysia',       'GG', 'Kuala Lumpur',   'Full-Time',  11000, 17000, '2026-11-15', 1, 'https://google.com.my',         NOW() - INTERVAL '2 days',  NOW()),
('10000000-0000-0000-0000-000000000023', NULL, NULL, 'Python Backend Developer',           'Amazon Web Services',   'AW', 'Kuala Lumpur',   'Full-Time',  9000,  15000, '2026-11-30', 2, 'https://aws.amazon.com',        NOW() - INTERVAL '4 days',  NOW()),
('10000000-0000-0000-0000-000000000024', NULL, NULL, 'Junior Java Developer',              'Maybank',               'MB', 'Kuala Lumpur',   'Full-Time',  3500,  5500,  '2026-09-30', 3, 'https://maybank.com',           NOW() - INTERVAL '22 days', NOW()),
('10000000-0000-0000-0000-000000000025', NULL, NULL, 'PHP Developer',                      'TIME dotCom',           'TD', 'Kuala Lumpur',   'Full-Time',  4000,  6500,  '2026-10-15', 2, 'https://time.com.my',           NOW() - INTERVAL '19 days', NOW()),
-- ===== DATA & AI (15 jobs) =====
('10000000-0000-0000-0000-000000000026', NULL, NULL, 'Data Analyst',                       'CIMB Bank',             'CB', 'Kuala Lumpur',   'Full-Time',  4500,  7500,  '2026-10-31', 2, 'https://cimb.com',              NOW() - INTERVAL '20 days', NOW()),
('10000000-0000-0000-0000-000000000027', NULL, NULL, 'Senior Data Analyst',                'Maybank',               'MB', 'Kuala Lumpur',   'Full-Time',  7000,  11000, '2026-10-15', 1, 'https://maybank.com',           NOW() - INTERVAL '18 days', NOW()),
('10000000-0000-0000-0000-000000000028', NULL, NULL, 'Data Scientist',                     'Petronas Digital',      'PD', 'Kuala Lumpur',   'Full-Time',  7000,  12000, '2026-10-31', 2, 'https://petronas.com',          NOW() - INTERVAL '15 days', NOW()),
('10000000-0000-0000-0000-000000000029', NULL, NULL, 'Senior Data Scientist',              'Grab Malaysia',         'GM', 'Kuala Lumpur',   'Full-Time',  11000, 17000, '2026-11-15', 1, 'https://grab.com',              NOW() - INTERVAL '12 days', NOW()),
('10000000-0000-0000-0000-000000000030', NULL, NULL, 'Machine Learning Engineer',          'Shopee Malaysia',       'SM', 'Kuala Lumpur',   'Full-Time',  8000,  14000, '2026-11-01', 1, 'https://shopee.com.my',         NOW() - INTERVAL '10 days', NOW()),
('10000000-0000-0000-0000-000000000031', NULL, NULL, 'AI Engineer',                        'Microsoft Malaysia',    'MS', 'Kuala Lumpur',   'Full-Time',  10000, 16000, '2026-11-15', 1, 'https://microsoft.com/my',      NOW() - INTERVAL '8 days',  NOW()),
('10000000-0000-0000-0000-000000000032', NULL, NULL, 'Data Engineer',                      'Axiata Digital',        'AD', 'Kuala Lumpur',   'Full-Time',  6000,  10000, '2026-10-31', 2, 'https://axiata.com',            NOW() - INTERVAL '14 days', NOW()),
('10000000-0000-0000-0000-000000000033', NULL, NULL, 'Senior Data Engineer',               'Amazon Web Services',   'AW', 'Kuala Lumpur',   'Full-Time',  10000, 16000, '2026-11-30', 1, 'https://aws.amazon.com',        NOW() - INTERVAL '6 days',  NOW()),
('10000000-0000-0000-0000-000000000034', NULL, NULL, 'Business Intelligence Analyst',      'RHB Banking Group',     'RH', 'Kuala Lumpur',   'Full-Time',  5000,  8000,  '2026-10-15', 2, 'https://rhb.com.my',            NOW() - INTERVAL '16 days', NOW()),
('10000000-0000-0000-0000-000000000035', NULL, NULL, 'Data Analyst Intern',                'CIMB Bank',             'CB', 'Kuala Lumpur',   'Internship', 1000,  1800,  '2026-08-31', 3, 'https://cimb.com',              NOW() - INTERVAL '22 days', NOW()),
('10000000-0000-0000-0000-000000000036', NULL, NULL, 'NLP Engineer',                       'Fusionex International','FI', 'Petaling Jaya',  'Full-Time',  8000,  13000, '2026-10-31', 1, 'https://fusionex-group.com',    NOW() - INTERVAL '9 days',  NOW()),
('10000000-0000-0000-0000-000000000037', NULL, NULL, 'Computer Vision Engineer',           'Petronas Digital',      'PD', 'Kuala Lumpur',   'Full-Time',  8000,  14000, '2026-11-01', 1, 'https://petronas.com',          NOW() - INTERVAL '7 days',  NOW()),
('10000000-0000-0000-0000-000000000038', NULL, NULL, 'Data Scientist',                     'Telekom Malaysia',      'TM', 'Kuala Lumpur',   'Contract',   8000,  12000, '2026-10-01', 1, 'https://tm.com.my',             NOW() - INTERVAL '11 days', NOW()),
('10000000-0000-0000-0000-000000000039', NULL, NULL, 'Analytics Manager',                  'Maxis Berhad',          'MX', 'Kuala Lumpur',   'Full-Time',  10000, 16000, '2026-11-15', 1, 'https://maxis.com.my',          NOW() - INTERVAL '5 days',  NOW()),
('10000000-0000-0000-0000-000000000040', NULL, NULL, 'Data Analytics Lead',                'AmBank Group',          'AB', 'Kuala Lumpur',   'Full-Time',  11000, 17000, '2026-11-30', 1, 'https://ambank.com.my',         NOW() - INTERVAL '3 days',  NOW()),
-- ===== DEVOPS & CLOUD (10 jobs) =====
('10000000-0000-0000-0000-000000000041', NULL, NULL, 'DevOps Engineer',                    'TechCorp Malaysia',     'TC', 'Cyberjaya',      'Full-Time',  6000,  10000, '2026-10-31', 2, 'https://techcorp.com.my',       NOW() - INTERVAL '20 days', NOW()),
('10000000-0000-0000-0000-000000000042', NULL, NULL, 'Senior DevOps Engineer',             'Grab Malaysia',         'GM', 'Kuala Lumpur',   'Full-Time',  10000, 16000, '2026-11-15', 1, 'https://grab.com',              NOW() - INTERVAL '15 days', NOW()),
('10000000-0000-0000-0000-000000000043', NULL, NULL, 'Cloud Engineer',                     'Amazon Web Services',   'AW', 'Kuala Lumpur',   'Full-Time',  8000,  14000, '2026-11-30', 2, 'https://aws.amazon.com',        NOW() - INTERVAL '10 days', NOW()),
('10000000-0000-0000-0000-000000000044', NULL, NULL, 'Azure Cloud Engineer',               'Microsoft Malaysia',    'MS', 'Kuala Lumpur',   'Full-Time',  8000,  13000, '2026-11-15', 1, 'https://microsoft.com/my',      NOW() - INTERVAL '8 days',  NOW()),
('10000000-0000-0000-0000-000000000045', NULL, NULL, 'Site Reliability Engineer',          'Shopee Malaysia',       'SM', 'Kuala Lumpur',   'Full-Time',  9000,  15000, '2026-11-01', 1, 'https://shopee.com.my',         NOW() - INTERVAL '12 days', NOW()),
('10000000-0000-0000-0000-000000000046', NULL, NULL, 'Infrastructure Engineer',            'Telekom Malaysia',      'TM', 'Cyberjaya',      'Full-Time',  6500,  10000, '2026-10-31', 2, 'https://tm.com.my',             NOW() - INTERVAL '18 days', NOW()),
('10000000-0000-0000-0000-000000000047', NULL, NULL, 'DevOps Intern',                      'TechCorp Malaysia',     'TC', 'Kuala Lumpur',   'Internship', 900,   1500,  '2026-08-31', 2, 'https://techcorp.com.my',       NOW() - INTERVAL '28 days', NOW()),
('10000000-0000-0000-0000-000000000048', NULL, NULL, 'Kubernetes Engineer',                'Petronas Digital',      'PD', 'Kuala Lumpur',   'Full-Time',  8000,  13000, '2026-11-01', 1, 'https://petronas.com',          NOW() - INTERVAL '6 days',  NOW()),
('10000000-0000-0000-0000-000000000049', NULL, NULL, 'Cloud Architect',                    'IBM Malaysia',          'IB', 'Kuala Lumpur',   'Full-Time',  15000, 22000, '2026-12-31', 1, 'https://ibm.com/my',            NOW() - INTERVAL '4 days',  NOW()),
('10000000-0000-0000-0000-000000000050', NULL, NULL, 'DevSecOps Engineer',                 'CIMB Bank',             'CB', 'Kuala Lumpur',   'Full-Time',  9000,  15000, '2026-11-15', 1, 'https://cimb.com',              NOW() - INTERVAL '7 days',  NOW()),
-- ===== PRODUCT & DESIGN (10 jobs) =====
('10000000-0000-0000-0000-000000000051', NULL, NULL, 'Product Manager',                    'Grab Malaysia',         'GM', 'Kuala Lumpur',   'Full-Time',  9000,  15000, '2026-11-15', 1, 'https://grab.com',              NOW() - INTERVAL '20 days', NOW()),
('10000000-0000-0000-0000-000000000052', NULL, NULL, 'Senior Product Manager',             'Shopee Malaysia',       'SM', 'Kuala Lumpur',   'Full-Time',  13000, 20000, '2026-11-30', 1, 'https://shopee.com.my',         NOW() - INTERVAL '15 days', NOW()),
('10000000-0000-0000-0000-000000000053', NULL, NULL, 'UX Designer',                        'AirAsia Digital',       'AA', 'Kuala Lumpur',   'Full-Time',  5000,  9000,  '2026-10-31', 2, 'https://airasia.com',           NOW() - INTERVAL '22 days', NOW()),
('10000000-0000-0000-0000-000000000054', NULL, NULL, 'Senior UX Designer',                 'Maxis Berhad',          'MX', 'Kuala Lumpur',   'Full-Time',  8000,  13000, '2026-11-15', 1, 'https://maxis.com.my',          NOW() - INTERVAL '17 days', NOW()),
('10000000-0000-0000-0000-000000000055', NULL, NULL, 'UI Designer',                        'MyDigi',                'MD', 'Petaling Jaya',  'Full-Time',  4500,  7500,  '2026-10-31', 2, 'https://digi.com.my',           NOW() - INTERVAL '19 days', NOW()),
('10000000-0000-0000-0000-000000000056', NULL, NULL, 'UX Researcher',                      'Grab Malaysia',         'GM', 'Kuala Lumpur',   'Full-Time',  6000,  10000, '2026-11-01', 1, 'https://grab.com',              NOW() - INTERVAL '14 days', NOW()),
('10000000-0000-0000-0000-000000000057', NULL, NULL, 'Product Designer',                   'Revenue Monster',       'RM', 'Kuala Lumpur',   'Full-Time',  5500,  9000,  '2026-10-15', 2, 'https://revenuemonster.my',     NOW() - INTERVAL '11 days', NOW()),
('10000000-0000-0000-0000-000000000058', NULL, NULL, 'Associate Product Manager',          'Shopee Malaysia',       'SM', 'Kuala Lumpur',   'Full-Time',  7000,  11000, '2026-10-31', 1, 'https://shopee.com.my',         NOW() - INTERVAL '9 days',  NOW()),
('10000000-0000-0000-0000-000000000059', NULL, NULL, 'UX/UI Designer Intern',              'AirAsia Digital',       'AA', 'Kuala Lumpur',   'Internship', 1000,  1800,  '2026-08-31', 3, 'https://airasia.com',           NOW() - INTERVAL '26 days', NOW()),
('10000000-0000-0000-0000-000000000060', NULL, NULL, 'Product Manager',                    'TechCorp Malaysia',     'TC', 'Kuala Lumpur',   'Contract',   9000,  14000, '2026-10-01', 1, 'https://techcorp.com.my',       NOW() - INTERVAL '8 days',  NOW()),
-- ===== FINANCE & ACCOUNTING (10 jobs) =====
('10000000-0000-0000-0000-000000000061', NULL, NULL, 'Financial Analyst',                  'CIMB Bank',             'CB', 'Kuala Lumpur',   'Full-Time',  4500,  7500,  '2026-10-31', 2, 'https://cimb.com',              NOW() - INTERVAL '21 days', NOW()),
('10000000-0000-0000-0000-000000000062', NULL, NULL, 'Senior Financial Analyst',           'Maybank',               'MB', 'Kuala Lumpur',   'Full-Time',  7000,  11000, '2026-10-15', 1, 'https://maybank.com',           NOW() - INTERVAL '18 days', NOW()),
('10000000-0000-0000-0000-000000000063', NULL, NULL, 'Finance Manager',                    'RHB Banking Group',     'RH', 'Kuala Lumpur',   'Full-Time',  9000,  14000, '2026-11-15', 1, 'https://rhb.com.my',            NOW() - INTERVAL '14 days', NOW()),
('10000000-0000-0000-0000-000000000064', NULL, NULL, 'Accountant',                         'AmBank Group',          'AB', 'Kuala Lumpur',   'Full-Time',  4000,  6500,  '2026-10-31', 2, 'https://ambank.com.my',         NOW() - INTERVAL '22 days', NOW()),
('10000000-0000-0000-0000-000000000065', NULL, NULL, 'Senior Accountant',                  'Petronas Digital',      'PD', 'Kuala Lumpur',   'Full-Time',  6000,  9500,  '2026-11-01', 1, 'https://petronas.com',          NOW() - INTERVAL '16 days', NOW()),
('10000000-0000-0000-0000-000000000066', NULL, NULL, 'Management Accountant',              'Telekom Malaysia',      'TM', 'Kuala Lumpur',   'Full-Time',  6500,  10000, '2026-11-15', 1, 'https://tm.com.my',             NOW() - INTERVAL '12 days', NOW()),
('10000000-0000-0000-0000-000000000067', NULL, NULL, 'Financial Controller',               'CIMB Bank',             'CB', 'Kuala Lumpur',   'Full-Time',  12000, 18000, '2026-12-31', 1, 'https://cimb.com',              NOW() - INTERVAL '8 days',  NOW()),
('10000000-0000-0000-0000-000000000068', NULL, NULL, 'Investment Analyst',                 'Maybank',               'MB', 'Kuala Lumpur',   'Full-Time',  5500,  9000,  '2026-11-01', 1, 'https://maybank.com',           NOW() - INTERVAL '10 days', NOW()),
('10000000-0000-0000-0000-000000000069', NULL, NULL, 'Finance Graduate Trainee',           'AmBank Group',          'AB', 'Kuala Lumpur',   'Full-Time',  2500,  4000,  '2026-09-30', 5, 'https://ambank.com.my',         NOW() - INTERVAL '28 days', NOW()),
('10000000-0000-0000-0000-000000000070', NULL, NULL, 'Treasury Analyst',                   'RHB Banking Group',     'RH', 'Kuala Lumpur',   'Full-Time',  5000,  8000,  '2026-10-31', 1, 'https://rhb.com.my',            NOW() - INTERVAL '15 days', NOW()),
-- ===== MARKETING & SALES (10 jobs) =====
('10000000-0000-0000-0000-000000000071', NULL, NULL, 'Digital Marketing Executive',        'AirAsia Digital',       'AA', 'Kuala Lumpur',   'Full-Time',  3500,  6000,  '2026-10-31', 2, 'https://airasia.com',           NOW() - INTERVAL '20 days', NOW()),
('10000000-0000-0000-0000-000000000072', NULL, NULL, 'Senior Digital Marketing Manager',   'Grab Malaysia',         'GM', 'Kuala Lumpur',   'Full-Time',  8000,  13000, '2026-11-15', 1, 'https://grab.com',              NOW() - INTERVAL '16 days', NOW()),
('10000000-0000-0000-0000-000000000073', NULL, NULL, 'Sales Executive',                    'Maxis Berhad',          'MX', 'Kuala Lumpur',   'Full-Time',  3000,  5500,  '2026-10-31', 4, 'https://maxis.com.my',          NOW() - INTERVAL '24 days', NOW()),
('10000000-0000-0000-0000-000000000074', NULL, NULL, 'Senior Sales Manager',               'Celcom Axiata',         'CA', 'Kuala Lumpur',   'Full-Time',  8000,  14000, '2026-11-15', 1, 'https://celcom.com.my',         NOW() - INTERVAL '18 days', NOW()),
('10000000-0000-0000-0000-000000000075', NULL, NULL, 'Marketing Manager',                  'MyDigi',                'MD', 'Petaling Jaya',  'Full-Time',  7000,  12000, '2026-11-01', 1, 'https://digi.com.my',           NOW() - INTERVAL '13 days', NOW()),
('10000000-0000-0000-0000-000000000076', NULL, NULL, 'Content Marketing Specialist',       'Revenue Monster',       'RM', 'Kuala Lumpur',   'Full-Time',  3500,  5500,  '2026-10-15', 2, 'https://revenuemonster.my',     NOW() - INTERVAL '17 days', NOW()),
('10000000-0000-0000-0000-000000000077', NULL, NULL, 'Growth Marketing Manager',           'Shopee Malaysia',       'SM', 'Kuala Lumpur',   'Full-Time',  8000,  13000, '2026-11-15', 1, 'https://shopee.com.my',         NOW() - INTERVAL '9 days',  NOW()),
('10000000-0000-0000-0000-000000000078', NULL, NULL, 'Brand Manager',                      'Telekom Malaysia',      'TM', 'Kuala Lumpur',   'Full-Time',  7000,  11000, '2026-11-01', 1, 'https://tm.com.my',             NOW() - INTERVAL '11 days', NOW()),
('10000000-0000-0000-0000-000000000079', NULL, NULL, 'Digital Marketing Intern',           'AirAsia Digital',       'AA', 'Kuala Lumpur',   'Internship', 800,   1500,  '2026-08-31', 3, 'https://airasia.com',           NOW() - INTERVAL '27 days', NOW()),
('10000000-0000-0000-0000-000000000080', NULL, NULL, 'B2B Sales Executive',                'Fusionex International','FI', 'Kuala Lumpur',   'Full-Time',  4000,  7000,  '2026-10-31', 2, 'https://fusionex-group.com',    NOW() - INTERVAL '14 days', NOW()),
-- ===== CYBERSECURITY (8 jobs) =====
('10000000-0000-0000-0000-000000000081', NULL, NULL, 'Security Engineer',                  'CIMB Bank',             'CB', 'Kuala Lumpur',   'Full-Time',  7000,  12000, '2026-11-15', 1, 'https://cimb.com',              NOW() - INTERVAL '15 days', NOW()),
('10000000-0000-0000-0000-000000000082', NULL, NULL, 'Senior Security Engineer',           'Maybank',               'MB', 'Kuala Lumpur',   'Full-Time',  10000, 16000, '2026-11-30', 1, 'https://maybank.com',           NOW() - INTERVAL '11 days', NOW()),
('10000000-0000-0000-0000-000000000083', NULL, NULL, 'Penetration Tester',                 'IBM Malaysia',          'IB', 'Kuala Lumpur',   'Full-Time',  8000,  14000, '2026-11-15', 1, 'https://ibm.com/my',            NOW() - INTERVAL '8 days',  NOW()),
('10000000-0000-0000-0000-000000000084', NULL, NULL, 'Cybersecurity Analyst',              'Telekom Malaysia',      'TM', 'Kuala Lumpur',   'Full-Time',  5500,  9500,  '2026-10-31', 2, 'https://tm.com.my',             NOW() - INTERVAL '19 days', NOW()),
('10000000-0000-0000-0000-000000000085', NULL, NULL, 'SOC Analyst',                        'Maxis Berhad',          'MX', 'Kuala Lumpur',   'Full-Time',  5000,  8500,  '2026-10-31', 2, 'https://maxis.com.my',          NOW() - INTERVAL '21 days', NOW()),
('10000000-0000-0000-0000-000000000086', NULL, NULL, 'Information Security Manager',       'RHB Banking Group',     'RH', 'Kuala Lumpur',   'Full-Time',  11000, 17000, '2026-12-31', 1, 'https://rhb.com.my',            NOW() - INTERVAL '6 days',  NOW()),
('10000000-0000-0000-0000-000000000087', NULL, NULL, 'Security Consultant',                'PwC Malaysia',          'PW', 'Kuala Lumpur',   'Full-Time',  8000,  14000, '2026-11-15', 1, 'https://pwc.com/my',            NOW() - INTERVAL '10 days', NOW()),
('10000000-0000-0000-0000-000000000088', NULL, NULL, 'Cloud Security Engineer',            'Amazon Web Services',   'AW', 'Kuala Lumpur',   'Full-Time',  9000,  15000, '2026-11-30', 1, 'https://aws.amazon.com',        NOW() - INTERVAL '5 days',  NOW()),
-- ===== HR & RECRUITMENT (5 jobs) =====
('10000000-0000-0000-0000-000000000089', NULL, NULL, 'HR Executive',                       'TechCorp Malaysia',     'TC', 'Kuala Lumpur',   'Full-Time',  3500,  5500,  '2026-10-31', 2, 'https://techcorp.com.my',       NOW() - INTERVAL '23 days', NOW()),
('10000000-0000-0000-0000-000000000090', NULL, NULL, 'Senior HR Manager',                  'Grab Malaysia',         'GM', 'Kuala Lumpur',   'Full-Time',  8000,  13000, '2026-11-15', 1, 'https://grab.com',              NOW() - INTERVAL '17 days', NOW()),
('10000000-0000-0000-0000-000000000091', NULL, NULL, 'Talent Acquisition Specialist',      'Shopee Malaysia',       'SM', 'Kuala Lumpur',   'Full-Time',  4500,  7500,  '2026-10-31', 2, 'https://shopee.com.my',         NOW() - INTERVAL '12 days', NOW()),
('10000000-0000-0000-0000-000000000092', NULL, NULL, 'HR Business Partner',                'Maxis Berhad',          'MX', 'Kuala Lumpur',   'Full-Time',  7000,  11000, '2026-11-01', 1, 'https://maxis.com.my',          NOW() - INTERVAL '9 days',  NOW()),
('10000000-0000-0000-0000-000000000093', NULL, NULL, 'IT Recruiter',                       'IBM Malaysia',          'IB', 'Kuala Lumpur',   'Contract',   4500,  7000,  '2026-10-01', 2, 'https://ibm.com/my',            NOW() - INTERVAL '16 days', NOW()),
-- ===== MANAGEMENT & CONSULTING (7 jobs) =====
('10000000-0000-0000-0000-000000000094', NULL, NULL, 'Business Analyst',                   'EY Malaysia',           'EY', 'Kuala Lumpur',   'Full-Time',  5000,  8500,  '2026-11-15', 2, 'https://ey.com/my',             NOW() - INTERVAL '20 days', NOW()),
('10000000-0000-0000-0000-000000000095', NULL, NULL, 'Senior Business Analyst',            'Deloitte Malaysia',     'DL', 'Kuala Lumpur',   'Full-Time',  8000,  13000, '2026-11-15', 1, 'https://deloitte.com/my',       NOW() - INTERVAL '15 days', NOW()),
('10000000-0000-0000-0000-000000000096', NULL, NULL, 'IT Consultant',                      'PwC Malaysia',          'PW', 'Kuala Lumpur',   'Full-Time',  7000,  12000, '2026-11-15', 1, 'https://pwc.com/my',            NOW() - INTERVAL '11 days', NOW()),
('10000000-0000-0000-0000-000000000097', NULL, NULL, 'Project Manager',                    'KPMG Malaysia',         'KP', 'Kuala Lumpur',   'Full-Time',  8000,  14000, '2026-11-30', 1, 'https://kpmg.com/my',           NOW() - INTERVAL '8 days',  NOW()),
('10000000-0000-0000-0000-000000000098', NULL, NULL, 'Management Consultant',              'EY Malaysia',           'EY', 'Kuala Lumpur',   'Full-Time',  9000,  15000, '2026-11-30', 1, 'https://ey.com/my',             NOW() - INTERVAL '6 days',  NOW()),
('10000000-0000-0000-0000-000000000099', NULL, NULL, 'Technology Consultant',              'IBM Malaysia',          'IB', 'Kuala Lumpur',   'Full-Time',  10000, 16000, '2026-12-31', 1, 'https://ibm.com/my',            NOW() - INTERVAL '4 days',  NOW()),
('10000000-0000-0000-0000-000000000100', NULL, NULL, 'Graduate Analyst',                   'Deloitte Malaysia',     'DL', 'Kuala Lumpur',   'Full-Time',  3500,  5500,  '2026-09-30', 5, 'https://deloitte.com/my',       NOW() - INTERVAL '29 days', NOW())
ON CONFLICT (id) DO NOTHING;


-- ==========================
-- PART 2: BENEFITS (~400 rows)
-- ==========================
INSERT INTO public.job_benefits (benefit_id, job_id, benefit_text)
VALUES
-- Job 1: Junior Frontend Developer (TechCorp)
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','14 days annual leave'),
('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','Laptop and equipment provided'),
-- Job 2: Senior Frontend Developer (Grab)
('20000000-0000-0000-0000-000000000005','10000000-0000-0000-0000-000000000002','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000006','10000000-0000-0000-0000-000000000002','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000007','10000000-0000-0000-0000-000000000002','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000008','10000000-0000-0000-0000-000000000002','21 days annual leave'),
('20000000-0000-0000-0000-000000000009','10000000-0000-0000-0000-000000000002','Employee Stock Options (ESOP)'),
-- Job 3: Junior Backend Developer (Shopee)
('20000000-0000-0000-0000-000000000010','10000000-0000-0000-0000-000000000003','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000011','10000000-0000-0000-0000-000000000003','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000012','10000000-0000-0000-0000-000000000003','14 days annual leave'),
('20000000-0000-0000-0000-000000000013','10000000-0000-0000-0000-000000000003','Free office snacks and beverages'),
-- Job 4: Senior Backend Developer (Axiata)
('20000000-0000-0000-0000-000000000014','10000000-0000-0000-0000-000000000004','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000015','10000000-0000-0000-0000-000000000004','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000016','10000000-0000-0000-0000-000000000004','21 days annual leave'),
('20000000-0000-0000-0000-000000000017','10000000-0000-0000-0000-000000000004','Annual performance bonus'),
('20000000-0000-0000-0000-000000000018','10000000-0000-0000-0000-000000000004','Hybrid work arrangement (3 days WFH, 2 days office)'),
-- Job 5: Full Stack Developer (Revenue Monster)
('20000000-0000-0000-0000-000000000019','10000000-0000-0000-0000-000000000005','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000020','10000000-0000-0000-0000-000000000005','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000021','10000000-0000-0000-0000-000000000005','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000022','10000000-0000-0000-0000-000000000005','Dental and optical coverage'),
-- Job 6: Senior Full Stack Developer (Fusionex)
('20000000-0000-0000-0000-000000000023','10000000-0000-0000-0000-000000000006','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000024','10000000-0000-0000-0000-000000000006','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000025','10000000-0000-0000-0000-000000000006','21 days annual leave'),
('20000000-0000-0000-0000-000000000026','10000000-0000-0000-0000-000000000006','Professional development budget (RM3,000/year)'),
('20000000-0000-0000-0000-000000000027','10000000-0000-0000-0000-000000000006','Annual performance bonus'),
-- Job 7: Android Developer (AirAsia)
('20000000-0000-0000-0000-000000000028','10000000-0000-0000-0000-000000000007','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000029','10000000-0000-0000-0000-000000000007','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000030','10000000-0000-0000-0000-000000000007','14 days annual leave'),
('20000000-0000-0000-0000-000000000031','10000000-0000-0000-0000-000000000007','Monthly transport allowance (RM200)'),
-- Job 8: iOS Developer (Celcom)
('20000000-0000-0000-0000-000000000032','10000000-0000-0000-0000-000000000008','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000033','10000000-0000-0000-0000-000000000008','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000034','10000000-0000-0000-0000-000000000008','Staff discount on telecom products and services'),
('20000000-0000-0000-0000-000000000035','10000000-0000-0000-0000-000000000008','14 days annual leave'),
-- Job 9: Software Engineer (Telekom)
('20000000-0000-0000-0000-000000000036','10000000-0000-0000-0000-000000000009','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000037','10000000-0000-0000-0000-000000000009','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000038','10000000-0000-0000-0000-000000000009','Staff discount on telecom products and services'),
('20000000-0000-0000-0000-000000000039','10000000-0000-0000-0000-000000000009','Monthly transport allowance (RM200)'),
-- Job 10: Senior Software Engineer (Maxis)
('20000000-0000-0000-0000-000000000040','10000000-0000-0000-0000-000000000010','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000041','10000000-0000-0000-0000-000000000010','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000042','10000000-0000-0000-0000-000000000010','21 days annual leave'),
('20000000-0000-0000-0000-000000000043','10000000-0000-0000-0000-000000000010','Annual performance bonus'),
('20000000-0000-0000-0000-000000000044','10000000-0000-0000-0000-000000000010','Dental and optical coverage'),
-- Job 11: Software Architect (IBM)
('20000000-0000-0000-0000-000000000045','10000000-0000-0000-0000-000000000011','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000046','10000000-0000-0000-0000-000000000011','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000047','10000000-0000-0000-0000-000000000011','21 days annual leave'),
('20000000-0000-0000-0000-000000000048','10000000-0000-0000-0000-000000000011','Performance-based profit sharing'),
('20000000-0000-0000-0000-000000000049','10000000-0000-0000-0000-000000000011','Group life and personal accident insurance'),
-- Job 12: React Developer (MyDigi)
('20000000-0000-0000-0000-000000000050','10000000-0000-0000-0000-000000000012','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000051','10000000-0000-0000-0000-000000000012','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000052','10000000-0000-0000-0000-000000000012','Staff discount on telecom products and services'),
('20000000-0000-0000-0000-000000000053','10000000-0000-0000-0000-000000000012','Hybrid work arrangement (3 days WFH, 2 days office)'),
-- Job 13: Java Developer (CIMB)
('20000000-0000-0000-0000-000000000054','10000000-0000-0000-0000-000000000013','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000055','10000000-0000-0000-0000-000000000013','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000056','10000000-0000-0000-0000-000000000013','13th month contractual bonus'),
('20000000-0000-0000-0000-000000000057','10000000-0000-0000-0000-000000000013','Group life and personal accident insurance'),
-- Job 14: Node.js Developer (RHB)
('20000000-0000-0000-0000-000000000058','10000000-0000-0000-0000-000000000014','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000059','10000000-0000-0000-0000-000000000014','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000060','10000000-0000-0000-0000-000000000014','13th month contractual bonus'),
('20000000-0000-0000-0000-000000000061','10000000-0000-0000-0000-000000000014','Dental and optical coverage'),
-- Job 15: Junior Software Developer (Fusionex Penang)
('20000000-0000-0000-0000-000000000062','10000000-0000-0000-0000-000000000015','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000063','10000000-0000-0000-0000-000000000015','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000064','10000000-0000-0000-0000-000000000015','14 days annual leave'),
('20000000-0000-0000-0000-000000000065','10000000-0000-0000-0000-000000000015','Training and conference attendance sponsorship'),
-- Job 16: Software Developer Intern (TechCorp)
('20000000-0000-0000-0000-000000000066','10000000-0000-0000-0000-000000000016','Monthly transport allowance (RM200)'),
('20000000-0000-0000-0000-000000000067','10000000-0000-0000-0000-000000000016','Mentorship and structured internship programme'),
('20000000-0000-0000-0000-000000000068','10000000-0000-0000-0000-000000000016','Laptop and equipment provided'),
-- Job 17: Frontend Developer Intern (Grab)
('20000000-0000-0000-0000-000000000069','10000000-0000-0000-0000-000000000017','Monthly transport allowance (RM200)'),
('20000000-0000-0000-0000-000000000070','10000000-0000-0000-0000-000000000017','Mentorship and structured internship programme'),
('20000000-0000-0000-0000-000000000071','10000000-0000-0000-0000-000000000017','Free office snacks and beverages'),
-- Job 18: Backend Developer Contract (Shopee)
('20000000-0000-0000-0000-000000000072','10000000-0000-0000-0000-000000000018','Medical coverage'),
('20000000-0000-0000-0000-000000000073','10000000-0000-0000-0000-000000000018','Laptop and equipment provided'),
('20000000-0000-0000-0000-000000000074','10000000-0000-0000-0000-000000000018','Monthly internet allowance (RM150)'),
-- Job 19: React Native Developer (Revenue Monster)
('20000000-0000-0000-0000-000000000075','10000000-0000-0000-0000-000000000019','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000076','10000000-0000-0000-0000-000000000019','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000077','10000000-0000-0000-0000-000000000019','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000078','10000000-0000-0000-0000-000000000019','Annual performance bonus'),
-- Job 20: Flutter Developer (MyDigi)
('20000000-0000-0000-0000-000000000079','10000000-0000-0000-0000-000000000020','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000080','10000000-0000-0000-0000-000000000020','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000081','10000000-0000-0000-0000-000000000020','Staff discount on telecom products and services'),
('20000000-0000-0000-0000-000000000082','10000000-0000-0000-0000-000000000020','14 days annual leave'),
-- Job 21: Senior React Developer (Microsoft)
('20000000-0000-0000-0000-000000000083','10000000-0000-0000-0000-000000000021','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000084','10000000-0000-0000-0000-000000000021','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000085','10000000-0000-0000-0000-000000000021','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000086','10000000-0000-0000-0000-000000000021','Employee Stock Options (ESOP)'),
('20000000-0000-0000-0000-000000000087','10000000-0000-0000-0000-000000000021','Gym membership and wellness allowance (RM100/month)'),
-- Job 22: Senior Node.js Developer (Google)
('20000000-0000-0000-0000-000000000088','10000000-0000-0000-0000-000000000022','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000089','10000000-0000-0000-0000-000000000022','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000090','10000000-0000-0000-0000-000000000022','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000091','10000000-0000-0000-0000-000000000022','Employee Stock Options (ESOP)'),
('20000000-0000-0000-0000-000000000092','10000000-0000-0000-0000-000000000022','Free office meals and snacks'),
-- Job 23: Python Backend Developer (AWS)
('20000000-0000-0000-0000-000000000093','10000000-0000-0000-0000-000000000023','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000094','10000000-0000-0000-0000-000000000023','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000095','10000000-0000-0000-0000-000000000023','21 days annual leave'),
('20000000-0000-0000-0000-000000000096','10000000-0000-0000-0000-000000000023','Professional certification reimbursement'),
-- Job 24: Junior Java Developer (Maybank)
('20000000-0000-0000-0000-000000000097','10000000-0000-0000-0000-000000000024','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000098','10000000-0000-0000-0000-000000000024','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000099','10000000-0000-0000-0000-000000000024','13th month contractual bonus'),
('20000000-0000-0000-0000-000000000100','10000000-0000-0000-0000-000000000024','Group life and personal accident insurance'),
-- Job 25: PHP Developer (TIME dotCom)
('20000000-0000-0000-0000-000000000101','10000000-0000-0000-0000-000000000025','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000102','10000000-0000-0000-0000-000000000025','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000103','10000000-0000-0000-0000-000000000025','14 days annual leave'),
('20000000-0000-0000-0000-000000000104','10000000-0000-0000-0000-000000000025','Monthly transport allowance (RM200)'),
-- Job 26: Data Analyst (CIMB)
('20000000-0000-0000-0000-000000000105','10000000-0000-0000-0000-000000000026','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000106','10000000-0000-0000-0000-000000000026','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000107','10000000-0000-0000-0000-000000000026','13th month contractual bonus'),
('20000000-0000-0000-0000-000000000108','10000000-0000-0000-0000-000000000026','Group life and personal accident insurance'),
-- Job 27: Senior Data Analyst (Maybank)
('20000000-0000-0000-0000-000000000109','10000000-0000-0000-0000-000000000027','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000110','10000000-0000-0000-0000-000000000027','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000111','10000000-0000-0000-0000-000000000027','21 days annual leave'),
('20000000-0000-0000-0000-000000000112','10000000-0000-0000-0000-000000000027','Annual performance bonus'),
('20000000-0000-0000-0000-000000000113','10000000-0000-0000-0000-000000000027','Study leave and sponsorship'),
-- Job 28: Data Scientist (Petronas)
('20000000-0000-0000-0000-000000000114','10000000-0000-0000-0000-000000000028','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000115','10000000-0000-0000-0000-000000000028','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000116','10000000-0000-0000-0000-000000000028','21 days annual leave'),
('20000000-0000-0000-0000-000000000117','10000000-0000-0000-0000-000000000028','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000118','10000000-0000-0000-0000-000000000028','Professional certification reimbursement'),
-- Job 29: Senior Data Scientist (Grab)
('20000000-0000-0000-0000-000000000119','10000000-0000-0000-0000-000000000029','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000120','10000000-0000-0000-0000-000000000029','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000121','10000000-0000-0000-0000-000000000029','21 days annual leave'),
('20000000-0000-0000-0000-000000000122','10000000-0000-0000-0000-000000000029','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000123','10000000-0000-0000-0000-000000000029','Employee Stock Options (ESOP)'),
-- Job 30: Machine Learning Engineer (Shopee)
('20000000-0000-0000-0000-000000000124','10000000-0000-0000-0000-000000000030','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000125','10000000-0000-0000-0000-000000000030','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000126','10000000-0000-0000-0000-000000000030','21 days annual leave'),
('20000000-0000-0000-0000-000000000127','10000000-0000-0000-0000-000000000030','Professional certification reimbursement'),
-- Job 31: AI Engineer (Microsoft)
('20000000-0000-0000-0000-000000000128','10000000-0000-0000-0000-000000000031','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000129','10000000-0000-0000-0000-000000000031','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000130','10000000-0000-0000-0000-000000000031','21 days annual leave'),
('20000000-0000-0000-0000-000000000131','10000000-0000-0000-0000-000000000031','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000132','10000000-0000-0000-0000-000000000031','Employee Stock Options (ESOP)'),
-- Job 32: Data Engineer (Axiata)
('20000000-0000-0000-0000-000000000133','10000000-0000-0000-0000-000000000032','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000134','10000000-0000-0000-0000-000000000032','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000135','10000000-0000-0000-0000-000000000032','14 days annual leave'),
('20000000-0000-0000-0000-000000000136','10000000-0000-0000-0000-000000000032','Professional development budget (RM3,000/year)'),
-- Job 33: Senior Data Engineer (AWS)
('20000000-0000-0000-0000-000000000137','10000000-0000-0000-0000-000000000033','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000138','10000000-0000-0000-0000-000000000033','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000139','10000000-0000-0000-0000-000000000033','21 days annual leave'),
('20000000-0000-0000-0000-000000000140','10000000-0000-0000-0000-000000000033','Employee Stock Options (ESOP)'),
('20000000-0000-0000-0000-000000000141','10000000-0000-0000-0000-000000000033','Group life and personal accident insurance'),
-- Job 34: Business Intelligence Analyst (RHB)
('20000000-0000-0000-0000-000000000142','10000000-0000-0000-0000-000000000034','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000143','10000000-0000-0000-0000-000000000034','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000144','10000000-0000-0000-0000-000000000034','13th month contractual bonus'),
('20000000-0000-0000-0000-000000000145','10000000-0000-0000-0000-000000000034','Dental and optical coverage'),
-- Job 35: Data Analyst Intern (CIMB)
('20000000-0000-0000-0000-000000000146','10000000-0000-0000-0000-000000000035','Monthly transport allowance (RM200)'),
('20000000-0000-0000-0000-000000000147','10000000-0000-0000-0000-000000000035','Mentorship and structured internship programme'),
('20000000-0000-0000-0000-000000000148','10000000-0000-0000-0000-000000000035','Exposure to banking data and analytics projects'),
-- Job 36: NLP Engineer (Fusionex)
('20000000-0000-0000-0000-000000000149','10000000-0000-0000-0000-000000000036','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000150','10000000-0000-0000-0000-000000000036','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000151','10000000-0000-0000-0000-000000000036','14 days annual leave'),
('20000000-0000-0000-0000-000000000152','10000000-0000-0000-0000-000000000036','Professional development budget (RM3,000/year)'),
-- Job 37: Computer Vision Engineer (Petronas)
('20000000-0000-0000-0000-000000000153','10000000-0000-0000-0000-000000000037','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000154','10000000-0000-0000-0000-000000000037','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000155','10000000-0000-0000-0000-000000000037','21 days annual leave'),
('20000000-0000-0000-0000-000000000156','10000000-0000-0000-0000-000000000037','Professional certification reimbursement'),
-- Job 38: Data Scientist Contract (TM)
('20000000-0000-0000-0000-000000000157','10000000-0000-0000-0000-000000000038','Medical coverage'),
('20000000-0000-0000-0000-000000000158','10000000-0000-0000-0000-000000000038','Laptop and equipment provided'),
('20000000-0000-0000-0000-000000000159','10000000-0000-0000-0000-000000000038','Monthly internet allowance (RM150)'),
-- Job 39: Analytics Manager (Maxis)
('20000000-0000-0000-0000-000000000160','10000000-0000-0000-0000-000000000039','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000161','10000000-0000-0000-0000-000000000039','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000162','10000000-0000-0000-0000-000000000039','21 days annual leave'),
('20000000-0000-0000-0000-000000000163','10000000-0000-0000-0000-000000000039','Performance-based profit sharing'),
('20000000-0000-0000-0000-000000000164','10000000-0000-0000-0000-000000000039','Staff discount on telecom products and services'),
-- Job 40: Data Analytics Lead (AmBank)
('20000000-0000-0000-0000-000000000165','10000000-0000-0000-0000-000000000040','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000166','10000000-0000-0000-0000-000000000040','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000167','10000000-0000-0000-0000-000000000040','21 days annual leave'),
('20000000-0000-0000-0000-000000000168','10000000-0000-0000-0000-000000000040','Annual performance bonus'),
('20000000-0000-0000-0000-000000000169','10000000-0000-0000-0000-000000000040','Group life and personal accident insurance'),
-- Job 41: DevOps Engineer (TechCorp)
('20000000-0000-0000-0000-000000000170','10000000-0000-0000-0000-000000000041','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000171','10000000-0000-0000-0000-000000000041','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000172','10000000-0000-0000-0000-000000000041','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000173','10000000-0000-0000-0000-000000000041','Professional certification reimbursement'),
-- Job 42: Senior DevOps Engineer (Grab)
('20000000-0000-0000-0000-000000000174','10000000-0000-0000-0000-000000000042','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000175','10000000-0000-0000-0000-000000000042','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000176','10000000-0000-0000-0000-000000000042','21 days annual leave'),
('20000000-0000-0000-0000-000000000177','10000000-0000-0000-0000-000000000042','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000178','10000000-0000-0000-0000-000000000042','Employee Stock Options (ESOP)'),
-- Job 43: Cloud Engineer (AWS)
('20000000-0000-0000-0000-000000000179','10000000-0000-0000-0000-000000000043','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000180','10000000-0000-0000-0000-000000000043','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000181','10000000-0000-0000-0000-000000000043','21 days annual leave'),
('20000000-0000-0000-0000-000000000182','10000000-0000-0000-0000-000000000043','Professional certification reimbursement (AWS certs)'),
-- Job 44: Azure Cloud Engineer (Microsoft)
('20000000-0000-0000-0000-000000000183','10000000-0000-0000-0000-000000000044','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000184','10000000-0000-0000-0000-000000000044','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000185','10000000-0000-0000-0000-000000000044','21 days annual leave'),
('20000000-0000-0000-0000-000000000186','10000000-0000-0000-0000-000000000044','Professional certification reimbursement (Azure certs)'),
('20000000-0000-0000-0000-000000000187','10000000-0000-0000-0000-000000000044','Employee Stock Options (ESOP)'),
-- Job 45: Site Reliability Engineer (Shopee)
('20000000-0000-0000-0000-000000000188','10000000-0000-0000-0000-000000000045','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000189','10000000-0000-0000-0000-000000000045','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000190','10000000-0000-0000-0000-000000000045','21 days annual leave'),
('20000000-0000-0000-0000-000000000191','10000000-0000-0000-0000-000000000045','Annual performance bonus'),
-- Job 46: Infrastructure Engineer (Telekom)
('20000000-0000-0000-0000-000000000192','10000000-0000-0000-0000-000000000046','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000193','10000000-0000-0000-0000-000000000046','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000194','10000000-0000-0000-0000-000000000046','Staff discount on telecom products and services'),
('20000000-0000-0000-0000-000000000195','10000000-0000-0000-0000-000000000046','Monthly transport allowance (RM200)'),
-- Job 47: DevOps Intern (TechCorp)
('20000000-0000-0000-0000-000000000196','10000000-0000-0000-0000-000000000047','Monthly transport allowance (RM200)'),
('20000000-0000-0000-0000-000000000197','10000000-0000-0000-0000-000000000047','Mentorship and structured internship programme'),
('20000000-0000-0000-0000-000000000198','10000000-0000-0000-0000-000000000047','Laptop and equipment provided'),
-- Job 48: Kubernetes Engineer (Petronas)
('20000000-0000-0000-0000-000000000199','10000000-0000-0000-0000-000000000048','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000200','10000000-0000-0000-0000-000000000048','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000201','10000000-0000-0000-0000-000000000048','21 days annual leave'),
('20000000-0000-0000-0000-000000000202','10000000-0000-0000-0000-000000000048','Professional certification reimbursement'),
-- Job 49: Cloud Architect (IBM)
('20000000-0000-0000-0000-000000000203','10000000-0000-0000-0000-000000000049','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000204','10000000-0000-0000-0000-000000000049','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000205','10000000-0000-0000-0000-000000000049','21 days annual leave'),
('20000000-0000-0000-0000-000000000206','10000000-0000-0000-0000-000000000049','Performance-based profit sharing'),
('20000000-0000-0000-0000-000000000207','10000000-0000-0000-0000-000000000049','Group life and personal accident insurance'),
-- Job 50: DevSecOps Engineer (CIMB)
('20000000-0000-0000-0000-000000000208','10000000-0000-0000-0000-000000000050','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000209','10000000-0000-0000-0000-000000000050','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000210','10000000-0000-0000-0000-000000000050','13th month contractual bonus'),
('20000000-0000-0000-0000-000000000211','10000000-0000-0000-0000-000000000050','Professional certification reimbursement'),
-- Job 51: Product Manager (Grab)
('20000000-0000-0000-0000-000000000212','10000000-0000-0000-0000-000000000051','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000213','10000000-0000-0000-0000-000000000051','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000214','10000000-0000-0000-0000-000000000051','21 days annual leave'),
('20000000-0000-0000-0000-000000000215','10000000-0000-0000-0000-000000000051','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000216','10000000-0000-0000-0000-000000000051','Employee Stock Options (ESOP)'),
-- Job 52: Senior Product Manager (Shopee)
('20000000-0000-0000-0000-000000000217','10000000-0000-0000-0000-000000000052','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000218','10000000-0000-0000-0000-000000000052','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000219','10000000-0000-0000-0000-000000000052','21 days annual leave'),
('20000000-0000-0000-0000-000000000220','10000000-0000-0000-0000-000000000052','Employee Stock Options (ESOP)'),
('20000000-0000-0000-0000-000000000221','10000000-0000-0000-0000-000000000052','Maternity (90 days) and paternity (7 days) leave'),
-- Job 53: UX Designer (AirAsia)
('20000000-0000-0000-0000-000000000222','10000000-0000-0000-0000-000000000053','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000223','10000000-0000-0000-0000-000000000053','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000224','10000000-0000-0000-0000-000000000053','14 days annual leave'),
('20000000-0000-0000-0000-000000000225','10000000-0000-0000-0000-000000000053','Laptop and equipment provided'),
-- Job 54: Senior UX Designer (Maxis)
('20000000-0000-0000-0000-000000000226','10000000-0000-0000-0000-000000000054','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000227','10000000-0000-0000-0000-000000000054','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000228','10000000-0000-0000-0000-000000000054','21 days annual leave'),
('20000000-0000-0000-0000-000000000229','10000000-0000-0000-0000-000000000054','Annual performance bonus'),
('20000000-0000-0000-0000-000000000230','10000000-0000-0000-0000-000000000054','Dental and optical coverage'),
-- Job 55: UI Designer (MyDigi)
('20000000-0000-0000-0000-000000000231','10000000-0000-0000-0000-000000000055','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000232','10000000-0000-0000-0000-000000000055','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000233','10000000-0000-0000-0000-000000000055','Staff discount on telecom products and services'),
('20000000-0000-0000-0000-000000000234','10000000-0000-0000-0000-000000000055','Laptop and equipment provided'),
-- Job 56: UX Researcher (Grab)
('20000000-0000-0000-0000-000000000235','10000000-0000-0000-0000-000000000056','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000236','10000000-0000-0000-0000-000000000056','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000237','10000000-0000-0000-0000-000000000056','21 days annual leave'),
('20000000-0000-0000-0000-000000000238','10000000-0000-0000-0000-000000000056','Training and conference attendance sponsorship'),
-- Job 57: Product Designer (Revenue Monster)
('20000000-0000-0000-0000-000000000239','10000000-0000-0000-0000-000000000057','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000240','10000000-0000-0000-0000-000000000057','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000241','10000000-0000-0000-0000-000000000057','14 days annual leave'),
('20000000-0000-0000-0000-000000000242','10000000-0000-0000-0000-000000000057','Hybrid work arrangement (3 days WFH, 2 days office)'),
-- Job 58: Associate Product Manager (Shopee)
('20000000-0000-0000-0000-000000000243','10000000-0000-0000-0000-000000000058','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000244','10000000-0000-0000-0000-000000000058','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000245','10000000-0000-0000-0000-000000000058','21 days annual leave'),
('20000000-0000-0000-0000-000000000246','10000000-0000-0000-0000-000000000058','Annual performance bonus'),
-- Job 59: UX/UI Designer Intern (AirAsia)
('20000000-0000-0000-0000-000000000247','10000000-0000-0000-0000-000000000059','Monthly transport allowance (RM200)'),
('20000000-0000-0000-0000-000000000248','10000000-0000-0000-0000-000000000059','Mentorship and structured internship programme'),
('20000000-0000-0000-0000-000000000249','10000000-0000-0000-0000-000000000059','Laptop and equipment provided'),
-- Job 60: Product Manager Contract (TechCorp)
('20000000-0000-0000-0000-000000000250','10000000-0000-0000-0000-000000000060','Medical coverage'),
('20000000-0000-0000-0000-000000000251','10000000-0000-0000-0000-000000000060','Laptop and equipment provided'),
('20000000-0000-0000-0000-000000000252','10000000-0000-0000-0000-000000000060','Flexible working hours'),
-- Job 61: Financial Analyst (CIMB)
('20000000-0000-0000-0000-000000000253','10000000-0000-0000-0000-000000000061','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000254','10000000-0000-0000-0000-000000000061','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000255','10000000-0000-0000-0000-000000000061','13th month contractual bonus'),
('20000000-0000-0000-0000-000000000256','10000000-0000-0000-0000-000000000061','Group life and personal accident insurance'),
-- Job 62: Senior Financial Analyst (Maybank)
('20000000-0000-0000-0000-000000000257','10000000-0000-0000-0000-000000000062','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000258','10000000-0000-0000-0000-000000000062','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000259','10000000-0000-0000-0000-000000000062','21 days annual leave'),
('20000000-0000-0000-0000-000000000260','10000000-0000-0000-0000-000000000062','Annual performance bonus'),
('20000000-0000-0000-0000-000000000261','10000000-0000-0000-0000-000000000062','Study leave and sponsorship'),
-- Job 63: Finance Manager (RHB)
('20000000-0000-0000-0000-000000000262','10000000-0000-0000-0000-000000000063','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000263','10000000-0000-0000-0000-000000000063','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000264','10000000-0000-0000-0000-000000000063','21 days annual leave'),
('20000000-0000-0000-0000-000000000265','10000000-0000-0000-0000-000000000063','Performance-based profit sharing'),
('20000000-0000-0000-0000-000000000266','10000000-0000-0000-0000-000000000063','Group life and personal accident insurance'),
-- Job 64: Accountant (AmBank)
('20000000-0000-0000-0000-000000000267','10000000-0000-0000-0000-000000000064','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000268','10000000-0000-0000-0000-000000000064','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000269','10000000-0000-0000-0000-000000000064','13th month contractual bonus'),
('20000000-0000-0000-0000-000000000270','10000000-0000-0000-0000-000000000064','Group life and personal accident insurance'),
-- Job 65: Senior Accountant (Petronas)
('20000000-0000-0000-0000-000000000271','10000000-0000-0000-0000-000000000065','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000272','10000000-0000-0000-0000-000000000065','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000273','10000000-0000-0000-0000-000000000065','21 days annual leave'),
('20000000-0000-0000-0000-000000000274','10000000-0000-0000-0000-000000000065','Annual performance bonus'),
-- Job 66: Management Accountant (TM)
('20000000-0000-0000-0000-000000000275','10000000-0000-0000-0000-000000000066','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000276','10000000-0000-0000-0000-000000000066','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000277','10000000-0000-0000-0000-000000000066','Staff discount on telecom products and services'),
('20000000-0000-0000-0000-000000000278','10000000-0000-0000-0000-000000000066','Annual performance bonus'),
-- Job 67: Financial Controller (CIMB)
('20000000-0000-0000-0000-000000000279','10000000-0000-0000-0000-000000000067','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000280','10000000-0000-0000-0000-000000000067','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000281','10000000-0000-0000-0000-000000000067','21 days annual leave'),
('20000000-0000-0000-0000-000000000282','10000000-0000-0000-0000-000000000067','Performance-based profit sharing'),
('20000000-0000-0000-0000-000000000283','10000000-0000-0000-0000-000000000067','Group life and personal accident insurance'),
-- Job 68: Investment Analyst (Maybank)
('20000000-0000-0000-0000-000000000284','10000000-0000-0000-0000-000000000068','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000285','10000000-0000-0000-0000-000000000068','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000286','10000000-0000-0000-0000-000000000068','21 days annual leave'),
('20000000-0000-0000-0000-000000000287','10000000-0000-0000-0000-000000000068','Study leave and sponsorship'),
-- Job 69: Finance Graduate Trainee (AmBank)
('20000000-0000-0000-0000-000000000288','10000000-0000-0000-0000-000000000069','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000289','10000000-0000-0000-0000-000000000069','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000290','10000000-0000-0000-0000-000000000069','Mentorship and graduate development programme'),
('20000000-0000-0000-0000-000000000291','10000000-0000-0000-0000-000000000069','13th month contractual bonus'),
-- Job 70: Treasury Analyst (RHB)
('20000000-0000-0000-0000-000000000292','10000000-0000-0000-0000-000000000070','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000293','10000000-0000-0000-0000-000000000070','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000294','10000000-0000-0000-0000-000000000070','13th month contractual bonus'),
('20000000-0000-0000-0000-000000000295','10000000-0000-0000-0000-000000000070','Group life and personal accident insurance'),
-- Job 71: Digital Marketing Executive (AirAsia)
('20000000-0000-0000-0000-000000000296','10000000-0000-0000-0000-000000000071','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000297','10000000-0000-0000-0000-000000000071','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000298','10000000-0000-0000-0000-000000000071','Annual performance bonus'),
('20000000-0000-0000-0000-000000000299','10000000-0000-0000-0000-000000000071','Flexible working hours'),
-- Job 72: Senior Digital Marketing Manager (Grab)
('20000000-0000-0000-0000-000000000300','10000000-0000-0000-0000-000000000072','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000301','10000000-0000-0000-0000-000000000072','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000302','10000000-0000-0000-0000-000000000072','21 days annual leave'),
('20000000-0000-0000-0000-000000000303','10000000-0000-0000-0000-000000000072','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000304','10000000-0000-0000-0000-000000000072','Annual performance bonus'),
-- Job 73: Sales Executive (Maxis)
('20000000-0000-0000-0000-000000000305','10000000-0000-0000-0000-000000000073','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000306','10000000-0000-0000-0000-000000000073','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000307','10000000-0000-0000-0000-000000000073','Staff discount on telecom products and services'),
('20000000-0000-0000-0000-000000000308','10000000-0000-0000-0000-000000000073','Sales commission and incentive scheme'),
-- Job 74: Senior Sales Manager (Celcom)
('20000000-0000-0000-0000-000000000309','10000000-0000-0000-0000-000000000074','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000310','10000000-0000-0000-0000-000000000074','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000311','10000000-0000-0000-0000-000000000074','21 days annual leave'),
('20000000-0000-0000-0000-000000000312','10000000-0000-0000-0000-000000000074','Staff discount on telecom products and services'),
('20000000-0000-0000-0000-000000000313','10000000-0000-0000-0000-000000000074','Phone allowance (RM100/month) and mileage claim'),
-- Job 75: Marketing Manager (MyDigi)
('20000000-0000-0000-0000-000000000314','10000000-0000-0000-0000-000000000075','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000315','10000000-0000-0000-0000-000000000075','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000316','10000000-0000-0000-0000-000000000075','21 days annual leave'),
('20000000-0000-0000-0000-000000000317','10000000-0000-0000-0000-000000000075','Annual performance bonus'),
('20000000-0000-0000-0000-000000000318','10000000-0000-0000-0000-000000000075','Staff discount on telecom products and services'),
-- Job 76: Content Marketing Specialist (RM)
('20000000-0000-0000-0000-000000000319','10000000-0000-0000-0000-000000000076','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000320','10000000-0000-0000-0000-000000000076','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000321','10000000-0000-0000-0000-000000000076','14 days annual leave'),
('20000000-0000-0000-0000-000000000322','10000000-0000-0000-0000-000000000076','Flexible working hours'),
-- Job 77: Growth Marketing Manager (Shopee)
('20000000-0000-0000-0000-000000000323','10000000-0000-0000-0000-000000000077','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000324','10000000-0000-0000-0000-000000000077','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000325','10000000-0000-0000-0000-000000000077','21 days annual leave'),
('20000000-0000-0000-0000-000000000326','10000000-0000-0000-0000-000000000077','Annual performance bonus'),
-- Job 78: Brand Manager (TM)
('20000000-0000-0000-0000-000000000327','10000000-0000-0000-0000-000000000078','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000328','10000000-0000-0000-0000-000000000078','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000329','10000000-0000-0000-0000-000000000078','Annual performance bonus'),
('20000000-0000-0000-0000-000000000330','10000000-0000-0000-0000-000000000078','Staff discount on telecom products and services'),
-- Job 79: Digital Marketing Intern (AirAsia)
('20000000-0000-0000-0000-000000000331','10000000-0000-0000-0000-000000000079','Monthly transport allowance (RM200)'),
('20000000-0000-0000-0000-000000000332','10000000-0000-0000-0000-000000000079','Mentorship and structured internship programme'),
('20000000-0000-0000-0000-000000000333','10000000-0000-0000-0000-000000000079','Flexible working hours'),
-- Job 80: B2B Sales Executive (Fusionex)
('20000000-0000-0000-0000-000000000334','10000000-0000-0000-0000-000000000080','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000335','10000000-0000-0000-0000-000000000080','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000336','10000000-0000-0000-0000-000000000080','Sales commission and incentive scheme'),
('20000000-0000-0000-0000-000000000337','10000000-0000-0000-0000-000000000080','Mileage and travel claim reimbursement'),
-- Job 81: Security Engineer (CIMB)
('20000000-0000-0000-0000-000000000338','10000000-0000-0000-0000-000000000081','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000339','10000000-0000-0000-0000-000000000081','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000340','10000000-0000-0000-0000-000000000081','13th month contractual bonus'),
('20000000-0000-0000-0000-000000000341','10000000-0000-0000-0000-000000000081','Professional certification reimbursement (CISSP, CEH)'),
-- Job 82: Senior Security Engineer (Maybank)
('20000000-0000-0000-0000-000000000342','10000000-0000-0000-0000-000000000082','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000343','10000000-0000-0000-0000-000000000082','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000344','10000000-0000-0000-0000-000000000082','21 days annual leave'),
('20000000-0000-0000-0000-000000000345','10000000-0000-0000-0000-000000000082','Annual performance bonus'),
('20000000-0000-0000-0000-000000000346','10000000-0000-0000-0000-000000000082','Professional certification reimbursement (CISSP, CISM)'),
-- Job 83: Penetration Tester (IBM)
('20000000-0000-0000-0000-000000000347','10000000-0000-0000-0000-000000000083','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000348','10000000-0000-0000-0000-000000000083','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000349','10000000-0000-0000-0000-000000000083','21 days annual leave'),
('20000000-0000-0000-0000-000000000350','10000000-0000-0000-0000-000000000083','Professional certification reimbursement (OSCP, CEH)'),
-- Job 84: Cybersecurity Analyst (TM)
('20000000-0000-0000-0000-000000000351','10000000-0000-0000-0000-000000000084','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000352','10000000-0000-0000-0000-000000000084','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000353','10000000-0000-0000-0000-000000000084','Annual performance bonus'),
('20000000-0000-0000-0000-000000000354','10000000-0000-0000-0000-000000000084','Professional certification reimbursement'),
-- Job 85: SOC Analyst (Maxis)
('20000000-0000-0000-0000-000000000355','10000000-0000-0000-0000-000000000085','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000356','10000000-0000-0000-0000-000000000085','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000357','10000000-0000-0000-0000-000000000085','Staff discount on telecom products and services'),
('20000000-0000-0000-0000-000000000358','10000000-0000-0000-0000-000000000085','Annual performance bonus'),
-- Job 86: Information Security Manager (RHB)
('20000000-0000-0000-0000-000000000359','10000000-0000-0000-0000-000000000086','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000360','10000000-0000-0000-0000-000000000086','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000361','10000000-0000-0000-0000-000000000086','21 days annual leave'),
('20000000-0000-0000-0000-000000000362','10000000-0000-0000-0000-000000000086','Performance-based profit sharing'),
('20000000-0000-0000-0000-000000000363','10000000-0000-0000-0000-000000000086','Group life and personal accident insurance'),
-- Job 87: Security Consultant (PwC)
('20000000-0000-0000-0000-000000000364','10000000-0000-0000-0000-000000000087','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000365','10000000-0000-0000-0000-000000000087','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000366','10000000-0000-0000-0000-000000000087','21 days annual leave'),
('20000000-0000-0000-0000-000000000367','10000000-0000-0000-0000-000000000087','Annual performance bonus'),
-- Job 88: Cloud Security Engineer (AWS)
('20000000-0000-0000-0000-000000000368','10000000-0000-0000-0000-000000000088','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000369','10000000-0000-0000-0000-000000000088','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000370','10000000-0000-0000-0000-000000000088','21 days annual leave'),
('20000000-0000-0000-0000-000000000371','10000000-0000-0000-0000-000000000088','Professional certification reimbursement (AWS Security)'),
('20000000-0000-0000-0000-000000000372','10000000-0000-0000-0000-000000000088','Employee Stock Options (ESOP)'),
-- Job 89: HR Executive (TechCorp)
('20000000-0000-0000-0000-000000000373','10000000-0000-0000-0000-000000000089','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000374','10000000-0000-0000-0000-000000000089','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000375','10000000-0000-0000-0000-000000000089','14 days annual leave'),
('20000000-0000-0000-0000-000000000376','10000000-0000-0000-0000-000000000089','Flexible working hours'),
-- Job 90: Senior HR Manager (Grab)
('20000000-0000-0000-0000-000000000377','10000000-0000-0000-0000-000000000090','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000378','10000000-0000-0000-0000-000000000090','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000379','10000000-0000-0000-0000-000000000090','21 days annual leave'),
('20000000-0000-0000-0000-000000000380','10000000-0000-0000-0000-000000000090','Annual performance bonus'),
('20000000-0000-0000-0000-000000000381','10000000-0000-0000-0000-000000000090','Gym membership and wellness allowance (RM100/month)'),
-- Job 91: Talent Acquisition Specialist (Shopee)
('20000000-0000-0000-0000-000000000382','10000000-0000-0000-0000-000000000091','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000383','10000000-0000-0000-0000-000000000091','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000384','10000000-0000-0000-0000-000000000091','21 days annual leave'),
('20000000-0000-0000-0000-000000000385','10000000-0000-0000-0000-000000000091','Annual performance bonus'),
-- Job 92: HR Business Partner (Maxis)
('20000000-0000-0000-0000-000000000386','10000000-0000-0000-0000-000000000092','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000387','10000000-0000-0000-0000-000000000092','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000388','10000000-0000-0000-0000-000000000092','21 days annual leave'),
('20000000-0000-0000-0000-000000000389','10000000-0000-0000-0000-000000000092','Staff discount on telecom products and services'),
('20000000-0000-0000-0000-000000000390','10000000-0000-0000-0000-000000000092','Annual performance bonus'),
-- Job 93: IT Recruiter Contract (IBM)
('20000000-0000-0000-0000-000000000391','10000000-0000-0000-0000-000000000093','Medical coverage'),
('20000000-0000-0000-0000-000000000392','10000000-0000-0000-0000-000000000093','Laptop and equipment provided'),
('20000000-0000-0000-0000-000000000393','10000000-0000-0000-0000-000000000093','Flexible working hours'),
-- Job 94: Business Analyst (EY)
('20000000-0000-0000-0000-000000000394','10000000-0000-0000-0000-000000000094','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000395','10000000-0000-0000-0000-000000000094','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000396','10000000-0000-0000-0000-000000000094','21 days annual leave'),
('20000000-0000-0000-0000-000000000397','10000000-0000-0000-0000-000000000094','Annual performance bonus'),
('20000000-0000-0000-0000-000000000398','10000000-0000-0000-0000-000000000094','Training and conference attendance sponsorship'),
-- Job 95: Senior Business Analyst (Deloitte)
('20000000-0000-0000-0000-000000000399','10000000-0000-0000-0000-000000000095','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000400','10000000-0000-0000-0000-000000000095','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000401','10000000-0000-0000-0000-000000000095','21 days annual leave'),
('20000000-0000-0000-0000-000000000402','10000000-0000-0000-0000-000000000095','Annual performance bonus'),
('20000000-0000-0000-0000-000000000403','10000000-0000-0000-0000-000000000095','Group life and personal accident insurance'),
-- Job 96: IT Consultant (PwC)
('20000000-0000-0000-0000-000000000404','10000000-0000-0000-0000-000000000096','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000405','10000000-0000-0000-0000-000000000096','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000406','10000000-0000-0000-0000-000000000096','21 days annual leave'),
('20000000-0000-0000-0000-000000000407','10000000-0000-0000-0000-000000000096','Annual performance bonus'),
('20000000-0000-0000-0000-000000000408','10000000-0000-0000-0000-000000000096','Professional certification reimbursement'),
-- Job 97: Project Manager (KPMG)
('20000000-0000-0000-0000-000000000409','10000000-0000-0000-0000-000000000097','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000410','10000000-0000-0000-0000-000000000097','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000411','10000000-0000-0000-0000-000000000097','21 days annual leave'),
('20000000-0000-0000-0000-000000000412','10000000-0000-0000-0000-000000000097','Performance-based profit sharing'),
('20000000-0000-0000-0000-000000000413','10000000-0000-0000-0000-000000000097','Training and conference attendance sponsorship'),
-- Job 98: Management Consultant (EY)
('20000000-0000-0000-0000-000000000414','10000000-0000-0000-0000-000000000098','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000415','10000000-0000-0000-0000-000000000098','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000416','10000000-0000-0000-0000-000000000098','21 days annual leave'),
('20000000-0000-0000-0000-000000000417','10000000-0000-0000-0000-000000000098','Annual performance bonus'),
('20000000-0000-0000-0000-000000000418','10000000-0000-0000-0000-000000000098','Training and conference attendance sponsorship'),
-- Job 99: Technology Consultant (IBM)
('20000000-0000-0000-0000-000000000419','10000000-0000-0000-0000-000000000099','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000420','10000000-0000-0000-0000-000000000099','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000421','10000000-0000-0000-0000-000000000099','21 days annual leave'),
('20000000-0000-0000-0000-000000000422','10000000-0000-0000-0000-000000000099','Hybrid work arrangement (3 days WFH, 2 days office)'),
('20000000-0000-0000-0000-000000000423','10000000-0000-0000-0000-000000000099','Professional certification reimbursement'),
-- Job 100: Graduate Analyst (Deloitte)
('20000000-0000-0000-0000-000000000424','10000000-0000-0000-0000-000000000100','EPF & SOCSO contributions'),
('20000000-0000-0000-0000-000000000425','10000000-0000-0000-0000-000000000100','Medical and hospitalization insurance'),
('20000000-0000-0000-0000-000000000426','10000000-0000-0000-0000-000000000100','14 days annual leave'),
('20000000-0000-0000-0000-000000000427','10000000-0000-0000-0000-000000000100','Mentorship and graduate development programme')
ON CONFLICT DO NOTHING;
