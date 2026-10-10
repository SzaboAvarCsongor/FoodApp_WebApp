CREATE TYPE user_role AS ENUM (
  'CUSTOMER',
  'COURIER',
  'RESTAURANT_ADMIN',
  'SUPER_ADMIN'
);

CREATE TYPE order_status AS ENUM (
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'DELIVERING',
  'DELIVERED',
  'CANCELLED'
);

CREATE TYPE application_status AS ENUM (
  'PENDING',
  'REVIEWED',
  'ACCEPTED',
  'REJECTED'
);

CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role user_role DEFAULT 'CUSTOMER',
  is_approved boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

CREATE TABLE restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  latitude decimal,
  longitude decimal,
  is_approved boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price int NOT NULL,
  category text NOT NULL,
  calories int,
  protein int,
  carbs int,
  fat int,
  is_available boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

CREATE TABLE courier_details (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_type text NOT NULL,
  license_plate text,
  is_online boolean DEFAULT false,
  current_lat decimal,
  current_lng decimal,
  updated_at timestamp DEFAULT now()
);

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id),
  courier_id uuid REFERENCES courier_details(id),
  status order_status DEFAULT 'PENDING',
  total_price int NOT NULL,
  total_calories int,
  delivery_address text NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id),
  quantity int NOT NULL DEFAULT 1,
  price_at_time int NOT NULL
);

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id),
  rating int NOT NULL,
  comment text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE job_application (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position_type text NOT NULL,
  message text,
  cv_url text,
  status application_status DEFAULT 'PENDING',
  created_at timestamp DEFAULT now()
);

ALTER TABLE restaurants
  ADD COLUMN category text,
  ADD COLUMN image_url text,
  ADD COLUMN delivery_fee int DEFAULT 0,
  ADD COLUMN delivery_time_min int,
  ADD COLUMN delivery_time_max int;