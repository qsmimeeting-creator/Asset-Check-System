-- Supabase Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enum for asset status
create type asset_status as enum ('active', 'damaged', 'repair', 'lost', 'moved', 'disposed');

-- Table: users
create table users (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    email text unique not null,
    role text not null,
    department text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: assets
create table assets (
    id uuid default uuid_generate_v4() primary key,
    asset_code text unique not null,
    name text not null,
    category_id text not null,
    brand text,
    model text,
    serial_number text,
    purchase_date date,
    price numeric(12, 2) default 0,
    location_id text not null,
    department_id text not null,
    responsible_person text not null,
    status asset_status default 'active'::asset_status not null,
    next_maintenance_date date,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: inspections
create table inspections (
    id uuid default uuid_generate_v4() primary key,
    asset_id uuid references assets(id) on delete cascade not null,
    checked_by text not null,
    checked_at timestamp with time zone default timezone('utc'::text, now()) not null,
    status asset_status not null,
    location_id text not null,
    note text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: We can create Policies (RLS) if required later. 
-- For now we enable public access since we don't have authentication set up in the frontend.

-- Enable Row Level Security (RLS) and create public policies (or disable RLS if you want simple setup)

alter table users enable row level security;
alter table assets enable row level security;
alter table inspections enable row level security;

-- Create policies for public access (Read/Write)
create policy "Allow public access for users" on users for all using (true) with check (true);
create policy "Allow public access for assets" on assets for all using (true) with check (true);
create policy "Allow public access for inspections" on inspections for all using (true) with check (true);

-- Trigger to update asset status and location when a new inspection is added
create or replace function update_asset_on_inspection()
returns trigger as $$
begin
    update assets
    set 
        status = NEW.status,
        location_id = NEW.location_id
    where id = NEW.asset_id;
    return NEW;
end;
$$ language plpgsql;

create trigger tr_update_asset_on_inspection
after insert on inspections
for each row
execute function update_asset_on_inspection();
