-- Create user_profiles table
create table dbo.user_profiles (
  id bigserial not null,
  user_id uuid not null,
  phone text null,
  location text null,
  bio text null,
  profile_image_url text null,
  supabase_uid character varying(255) null,
  first_name character varying(100) null,
  last_name character varying(100) null,
  created_at timestamp without time zone not null,
  updated_at timestamp without time zone null,
  role character varying(50) null default 'candidate'::character varying,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_supabase_uid_key unique (supabase_uid),
  constraint user_profiles_user_id_key unique (user_id),
  constraint user_profiles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_user_id on dbo.user_profiles using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_supabase_uid on dbo.user_profiles using btree (supabase_uid) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_first_name on dbo.user_profiles using btree (first_name) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_last_name on dbo.user_profiles using btree (last_name) TABLESPACE pg_default;

-- Create experience table
create table dbo.experience (
  id bigserial not null,
  user_id uuid null,
  supabase_uid character varying(255) null,
  job_title character varying(255) not null,
  company character varying(255) not null,
  start_date date not null,
  end_date date null,
  is_current boolean null default false,
  description text null,
  created_at timestamp without time zone not null,
  updated_at timestamp without time zone null,
  responsibilities text[] null,
  constraint experience_pkey primary key (id),
  constraint experience_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_experience_user_id on dbo.experience using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_experience_supabase_uid on dbo.experience using btree (supabase_uid) TABLESPACE pg_default;

-- Create education table
create table dbo.education (
  id bigserial not null,
  user_id uuid null,
  supabase_uid character varying(255) null,
  degree character varying(255) not null,
  institution character varying(255) not null,
  field character varying(255) not null,
  start_date date not null,
  end_date date null,
  is_current boolean null default false,
  created_at timestamp without time zone not null,
  updated_at timestamp without time zone null,
  cgpa character varying(255) null,
  grades character varying(255) null,
  minor character varying(255) null,
  constraint education_pkey primary key (id),
  constraint education_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_education_user_id on dbo.education using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_education_supabase_uid on dbo.education using btree (supabase_uid) TABLESPACE pg_default;

-- Create projects table
create table dbo.projects (
  id bigserial not null,
  user_id uuid null,
  supabase_uid character varying(255) null,
  title character varying(255) not null,
  description text null,
  technologies text null,
  link text null,
  start_date date not null,
  end_date date null,
  created_at timestamp without time zone not null,
  updated_at timestamp without time zone null,
  constraint projects_pkey primary key (id),
  constraint projects_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_projects_user_id on dbo.projects using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_projects_supabase_uid on dbo.projects using btree (supabase_uid) TABLESPACE pg_default;

-- Create skills table
create table dbo.skills (
  id bigserial not null,
  user_id uuid null,
  supabase_uid character varying(255) null,
  name character varying(255) not null,
  proficiency character varying(255) not null,
  endorsed integer null default 0,
  created_at timestamp without time zone not null,
  updated_at timestamp without time zone null,
  constraint skills_pkey primary key (id),
  constraint skills_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_skills_user_id on dbo.skills using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_skills_supabase_uid on dbo.skills using btree (supabase_uid) TABLESPACE pg_default;