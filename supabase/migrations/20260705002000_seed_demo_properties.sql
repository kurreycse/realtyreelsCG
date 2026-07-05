-- Seed the current InstaHouse demo catalogue into Supabase so the app reads from the backend.

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select current_user in ('postgres', 'service_role', 'supabase_admin')
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and is_admin = true
    );
$$;

do $$
declare
  demo_owner uuid := '2030f801-eb58-4e71-a519-68706a506917';
  item record;
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    demo_owner,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'demo@example.com',
    extensions.crypt('InstaHouseDemo123!', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Demo","last_name":"User"}'::jsonb,
    now(),
    now()
  )
  on conflict (id) do update
  set email = excluded.email,
      encrypted_password = excluded.encrypted_password,
      email_confirmed_at = excluded.email_confirmed_at,
      raw_app_meta_data = excluded.raw_app_meta_data,
      raw_user_meta_data = excluded.raw_user_meta_data,
      updated_at = now();

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'auth'
      and table_name = 'identities'
  ) then
    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      demo_owner,
      demo_owner,
      'demo@example.com',
      jsonb_build_object('sub', demo_owner::text, 'email', 'demo@example.com'),
      'email',
      now(),
      now(),
      now()
    )
    on conflict (provider, provider_id) do update
    set user_id = excluded.user_id,
        identity_data = excluded.identity_data,
        updated_at = now();
  end if;

  insert into public.profiles (
    id,
    first_name,
    last_name,
    phone,
    email,
    is_admin
  )
  values (
    demo_owner,
    'Demo',
    'User',
    '9993558506',
    'demo@example.com',
    true
  )
  on conflict (id) do update
  set first_name = excluded.first_name,
      last_name = excluded.last_name,
      phone = excluded.phone,
      email = excluded.email,
      is_admin = excluded.is_admin,
      updated_at = now();

  perform set_config('request.jwt.claim.sub', demo_owner::text, true);

  create temp table seed_instahouse_properties (
    id uuid primary key,
    media_id uuid not null,
    title text not null,
    project_name text,
    purpose public.property_purpose not null,
    listing_type public.listing_type not null,
    property_type text not null,
    price numeric(14,2) not null,
    city text not null,
    locality text not null,
    bhk text,
    area numeric(12,2),
    furnishing text,
    bedrooms integer,
    bathrooms integer,
    parking boolean,
    possession public.property_possession,
    rera text,
    description text,
    image_url text,
    seller_type public.seller_type,
    no_brokerage boolean,
    featured boolean,
    views integer,
    leads integer,
    price_trend text,
    video_ref text,
    posted_days integer,
    amenities text[],
    nearby text[]
  ) on commit drop;

  insert into seed_instahouse_properties values
    (
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      'Sunlit 3BHK Apartment in Whitefield',
      'Urban Grove',
      'RENT',
      'RENT',
      'Apartment',
      52000,
      'Bengaluru',
      'Whitefield',
      '3 BHK',
      1450,
      'Semi Furnished',
      3,
      2,
      true,
      'Immediate',
      null,
      'Bright 3BHK on the 4th floor with cross ventilation, modular kitchen, power backup, and a society gate. Good fit for families who need schools, hospitals, and daily stores close by.',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=1100&fit=crop&auto=format',
      'Owner',
      true,
      true,
      847,
      36,
      '+7.8% YoY',
      'bengaluru-whitefield-apartment-p001',
      2,
      array['Lift', 'Power Backup', 'Security', 'CCTV', 'Parking'],
      array['ITPL', 'Metro station', 'Schools', 'Daily market']
    ),
    (
      '10000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000002',
      'Premium Villa for Sale in Jubilee Hills',
      'Lakeview Estate',
      'BUY',
      'SALE',
      'Villa',
      28000000,
      'Hyderabad',
      'Jubilee Hills',
      '4 BHK',
      3200,
      'Fully Furnished',
      4,
      4,
      true,
      'Ready to Move',
      'RERA-IN-2026-HYD-118',
      'Independent villa on a 3600 sqft plot with private garden, rooftop terrace, marble flooring, smart lighting, and a premium modular kitchen. Clear title and ready possession.',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&h=1100&fit=crop&auto=format',
      'Owner',
      true,
      true,
      1243,
      51,
      '+11.2% YoY',
      'hyderabad-jubileehills-villa-p002',
      5,
      array['Garden', 'Swimming Pool', 'Gym', 'Security', 'CCTV', 'Power Backup', 'Gas Pipeline'],
      array['Film Nagar', 'ORR access', 'Premium cafes', 'International schools']
    ),
    (
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000003',
      'Cozy 2BHK near Hinjewadi IT Park',
      null,
      'RENT',
      'RENT',
      'Apartment',
      28000,
      'Pune',
      'Hinjewadi',
      '2 BHK',
      980,
      'Unfurnished',
      2,
      2,
      true,
      'Immediate',
      null,
      'Well-maintained 2BHK in a gated community, just 5 minutes from the IT park. Newly painted, practical layout, and ideal for working couples or a small family.',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=1100&fit=crop&auto=format',
      'Broker',
      false,
      false,
      562,
      18,
      '+6.1% YoY',
      'pune-hinjewadi-apartment-p003',
      8,
      array['Lift', 'Security', 'Parking', 'Water Supply'],
      array['IT Park', 'Metro line', 'Bus stop', 'Supermarket']
    ),
    (
      '10000000-0000-0000-0000-000000000004',
      '20000000-0000-0000-0000-000000000004',
      'Ground Floor Shop in Karol Bagh Market',
      null,
      'COMMERCIAL',
      'SALE',
      'Shop',
      12500000,
      'Delhi NCR',
      'Karol Bagh',
      'N/A',
      420,
      'Unfurnished',
      0,
      1,
      false,
      'Ready to Move',
      null,
      'Ground floor commercial shop on a busy market road with strong frontage and daily footfall. Suitable for retail, medical, food, or service business.',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=1100&fit=crop&auto=format',
      'Owner',
      true,
      false,
      390,
      12,
      '+5.4% YoY',
      'delhi-karolbagh-shop-p004',
      12,
      array['Power Backup', 'CCTV', 'Security'],
      array['Karol Bagh Market', 'Metro station', 'Public parking', 'Main road']
    ),
    (
      '10000000-0000-0000-0000-000000000005',
      '20000000-0000-0000-0000-000000000005',
      'Independent House in Indiranagar',
      null,
      'BUY',
      'SALE',
      'Independent House',
      17500000,
      'Bengaluru',
      'Indiranagar',
      '3 BHK',
      2100,
      'Semi Furnished',
      3,
      3,
      true,
      'Ready to Move',
      null,
      'Independent ground plus one house with front garden and covered parking for two vehicles. Peaceful location with quick access to retail streets, offices, and metro connectivity.',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&h=1100&fit=crop&auto=format',
      'Owner',
      true,
      true,
      729,
      28,
      '+9.4% YoY',
      'bengaluru-indiranagar-house-p005',
      3,
      array['Garden', 'Parking', 'Power Backup', 'Water Supply', 'Security'],
      array['Metro station', '100 Feet Road', 'Schools', 'Clinics']
    ),
    (
      '10000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000006',
      'Fully Furnished Studio near Hitec City',
      null,
      'PG',
      'RENT',
      'Studio / Co-living',
      18000,
      'Hyderabad',
      'Hitec City',
      '1 RK',
      380,
      'Fully Furnished',
      1,
      1,
      false,
      'Immediate',
      null,
      'Compact furnished studio for working professionals. Bed, wardrobe, geyser, WiFi, and maintenance included in the rent.',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&h=1100&fit=crop&auto=format',
      'Owner',
      true,
      false,
      1089,
      44,
      '+4.2% YoY',
      'hyderabad-hiteccity-studio-p006',
      1,
      array['Wifi', 'Lift', 'Security', 'Water Supply', 'Power Backup'],
      array['Cyber Towers', 'Metro station', 'Food courts', 'Shared transport']
    ),
    (
      '10000000-0000-0000-0000-000000000007',
      '20000000-0000-0000-0000-000000000007',
      'Corner Residential Plot on Sarjapur Road',
      null,
      'PLOT',
      'SALE',
      'Plot',
      7500000,
      'Bengaluru',
      'Sarjapur Road',
      'N/A',
      1800,
      'N/A',
      0,
      0,
      false,
      'Ready to Move',
      'RERA-IN-2026-PLOT-044',
      'Corner residential plot with 40 feet road width on two sides. Clear title, approved layout, and strong investment potential in a stable residential pocket.',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&h=1100&fit=crop&auto=format',
      'Broker',
      false,
      false,
      281,
      9,
      '+8.1% YoY',
      'bengaluru-sarjapur-plot-p007',
      15,
      array['Water Supply'],
      array['Residential colony', 'Outer Ring Road', 'Schools', 'Upcoming metro']
    ),
    (
      '10000000-0000-0000-0000-000000000008',
      '20000000-0000-0000-0000-000000000008',
      'Luxury 4BHK Penthouse on Golf Course Road',
      null,
      'RENT',
      'RENT',
      'Penthouse',
      120000,
      'Delhi NCR',
      'Golf Course Road',
      '4 BHK',
      3800,
      'Fully Furnished',
      4,
      4,
      true,
      'Within 3 Months',
      'RERA-IN-2026-GGN-223',
      'Premium penthouse with panoramic city views, designer kitchen, home theatre, and a large private terrace. Society includes pool, gym, and clubhouse.',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&h=1100&fit=crop&auto=format',
      'Builder',
      false,
      true,
      2140,
      73,
      '+13.5% YoY',
      'delhincr-golfcourse-penthouse-p008',
      7,
      array['Swimming Pool', 'Gym', 'Clubhouse', 'Lift', 'Security', 'CCTV', 'Power Backup', 'Garden', 'Parking'],
      array['Rapid Metro', 'Premium schools', 'Restaurants', 'Cyber City']
    ),
    (
      '10000000-0000-0000-0000-000000000009',
      '20000000-0000-0000-0000-000000000009',
      'New Launch 2/3BHK Homes in Thane West',
      'Meridian Residences',
      'PROJECT',
      'SALE',
      'New Project',
      8600000,
      'Mumbai',
      'Thane West',
      '2/3 BHK',
      1120,
      'Unfurnished',
      2,
      2,
      true,
      'Under Construction',
      'RERA-IN-2026-PROJ-901',
      'RERA-registered new launch with multiple towers, efficient floor plans, clubhouse, landscaped greens, and construction-linked payment plan.',
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&h=1100&fit=crop&auto=format',
      'Builder',
      false,
      true,
      1660,
      61,
      '+10.9% YoY',
      'mumbai-thane-meridian-project-p009',
      4,
      array['Clubhouse', 'Garden', 'Security', 'Lift', 'Power Backup', 'Parking'],
      array['Metro corridor', 'Shopping mall', 'Wide roads', 'Upcoming school']
    ),
    (
      '10000000-0000-0000-0000-000000000010',
      '20000000-0000-0000-0000-000000000010',
      'Grade-A Office Space in BKC',
      null,
      'COMMERCIAL',
      'RENT',
      'Commercial Office',
      250000,
      'Mumbai',
      'Bandra Kurla Complex',
      'N/A',
      1900,
      'Fully Furnished',
      0,
      2,
      true,
      'Immediate',
      null,
      'Plug-and-play office with reception, cabins, workstations, conference room, pantry, and reserved parking. Suitable for IT, consulting, and regional teams.',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&h=1100&fit=crop&auto=format',
      'Broker',
      false,
      false,
      512,
      16,
      '+6.7% YoY',
      'mumbai-bkc-office-p010',
      6,
      array['Lift', 'Security', 'Power Backup', 'Parking', 'CCTV'],
      array['BKC', 'Airport', 'Hotels', 'Restaurants']
    );

  for item in select * from seed_instahouse_properties loop
    insert into public.properties (
      id,
      owner_id,
      title,
      project_name,
      purpose,
      listing_type,
      property_type,
      price,
      city,
      locality,
      bhk,
      area,
      area_unit,
      furnishing,
      bedrooms,
      bathrooms,
      parking,
      possession,
      rera,
      description,
      image_url,
      seller_type,
      status,
      verified,
      no_brokerage,
      featured,
      views,
      leads,
      price_trend,
      created_at,
      updated_at
    )
    values (
      item.id,
      demo_owner,
      item.title,
      item.project_name,
      item.purpose,
      item.listing_type,
      item.property_type,
      item.price,
      item.city,
      item.locality,
      item.bhk,
      item.area,
      'Sq Ft',
      item.furnishing,
      item.bedrooms,
      item.bathrooms,
      item.parking,
      item.possession,
      item.rera,
      item.description,
      item.image_url,
      item.seller_type,
      'DRAFT',
      false,
      item.no_brokerage,
      item.featured,
      item.views,
      item.leads,
      item.price_trend,
      now() - make_interval(days => item.posted_days),
      now()
    )
    on conflict (id) do update
    set title = excluded.title,
        project_name = excluded.project_name,
        purpose = excluded.purpose,
        listing_type = excluded.listing_type,
        property_type = excluded.property_type,
        price = excluded.price,
        city = excluded.city,
        locality = excluded.locality,
        bhk = excluded.bhk,
        area = excluded.area,
        furnishing = excluded.furnishing,
        bedrooms = excluded.bedrooms,
        bathrooms = excluded.bathrooms,
        parking = excluded.parking,
        possession = excluded.possession,
        rera = excluded.rera,
        description = excluded.description,
        image_url = excluded.image_url,
        seller_type = excluded.seller_type,
        status = 'DRAFT',
        verified = false,
        no_brokerage = excluded.no_brokerage,
        featured = excluded.featured,
        views = excluded.views,
        leads = excluded.leads,
        price_trend = excluded.price_trend,
        updated_at = now();

    insert into public.property_consents (
      property_id,
      user_id,
      seller_type
    )
    values (
      item.id,
      demo_owner,
      item.seller_type
    )
    on conflict (property_id) do update
    set user_id = excluded.user_id,
        seller_type = excluded.seller_type;

    insert into public.property_media (
      id,
      property_id,
      created_by,
      media_type,
      storage_path,
      original_filename,
      mime_type,
      file_size_bytes,
      duration_seconds,
      upload_status,
      is_primary,
      file_sha256,
      perceptual_hash,
      duplicate_status
    )
    values (
      item.media_id,
      item.id,
      demo_owner,
      'VIDEO',
      item.video_ref,
      item.video_ref || '.mp4',
      'video/mp4',
      1048576,
      30,
      'UPLOADED',
      true,
      null,
      null,
      'NONE'
    )
    on conflict (id) do update
    set storage_path = excluded.storage_path,
        original_filename = excluded.original_filename,
        upload_status = 'UPLOADED',
        duplicate_status = 'NONE',
        updated_at = now();

    delete from public.property_amenities where property_id = item.id;
    insert into public.property_amenities (property_id, amenity)
    select item.id, amenity
    from unnest(item.amenities) as amenity;

    delete from public.property_nearby where property_id = item.id;
    insert into public.property_nearby (property_id, name, sort_order)
    select item.id, nearby_name, ordinality::integer
    from unnest(item.nearby) with ordinality as nearby(nearby_name, ordinality);

    update public.properties
    set status = 'APPROVED',
        verified = true,
        submitted_at = coalesce(submitted_at, now() - interval '2 days'),
        reviewed_at = coalesce(reviewed_at, now() - interval '1 day'),
        reviewed_by = demo_owner,
        review_note = 'Seeded approved listing.',
        updated_at = now()
    where id = item.id;
  end loop;
end $$;
