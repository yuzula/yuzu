create table public.communities (
  domain_name text primary key,
  created_at timestamp with time zone not null default (current_timestamp at time zone 'UTC')
);

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username varchar(20) not null unique,
  community_domain_name text not null references public.communities (domain_name)
);

-- Profiles RLS
alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on profiles for select
  using (auth.uid() is not null);

create policy "Users can create their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  with check (auth.uid() = id);

-- Communities RLS
alter table public.communities enable row level security;

create policy "Communities are viewable by authenticated users"
  on communities for select
  using ( auth.uid() is not null );

-- Utility functions
create function public.get_domain_name_from_email(email text)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  domain text;
  domain_suffix text;
  escaped_domain_suffix text;
  domain_name_regex text;
  domain_name text;
begin
  -- Extract the domain from the email
  domain := regexp_replace(email, '.*@(.*)$', '\1');

  -- Find the longest matching suffix
  select suffix
  into domain_suffix
  from public.domain_suffixes
  where domain ILIKE '%' || suffix
  order by length(suffix) desc
  limit 1;

  -- Escape the TLD and create a regex pattern to match the domain
  escaped_domain_suffix := regexp_replace(domain_suffix, '([!$()*+.:<=>?[\\\]^{|}-])', '\\\1', 'g');
  domain_name_regex := '\.?([a-z0-9][a-z0-9-]{0,61}\.' || escaped_domain_suffix || ')$';

  -- Use regex to capture the domain name without any subdomains
  --
  -- example.com -> example.com
  -- www.example.com -> example.com
  -- sub.sub.sub.example.com -> example.com
  domain_name := substring(domain FROM domain_name_regex);

  return domain_name;
end;
$$;

-- Triggers
create function public.create_profile_and_community_on_auth_user_created()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  domain_name_from_email text;
begin
  domain_name_from_email := public.get_domain_name_from_email(new.email);

  -- Create community
  insert into public.communities (domain_name)
  values (domain_name_from_email)
  on conflict (domain_name) do nothing;

  -- Create user
  insert into public.profiles (id, username, community_domain_name)
  values (new.id, new.raw_user_meta_data->>'username', domain_name_from_email);

  return new;
end;
$$;

create trigger create_profile_and_community_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_and_community_on_auth_user_created();
