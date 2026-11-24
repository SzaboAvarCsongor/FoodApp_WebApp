ALTER TABLE public.orders
  ADD COLUMN delivery_latitude decimal,
  ADD COLUMN delivery_longitude decimal;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_delivery_coordinates_pair
    CHECK ((delivery_latitude IS NULL) = (delivery_longitude IS NULL)),
  ADD CONSTRAINT orders_delivery_latitude_range
    CHECK (delivery_latitude BETWEEN -90 AND 90),
  ADD CONSTRAINT orders_delivery_longitude_range
    CHECK (delivery_longitude BETWEEN -180 AND 180);
