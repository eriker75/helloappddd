-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';
-- public.configs definition

-- Drop table

-- DROP TABLE public.configs;

CREATE TABLE public.configs ( id uuid DEFAULT gen_random_uuid() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, meta_key varchar NULL, meta_value jsonb NULL, CONSTRAINT configs_meta_key_key UNIQUE (meta_key), CONSTRAINT configs_pkey PRIMARY KEY (id));
COMMENT ON TABLE public.configs IS 'global configurations';

-- Permissions

ALTER TABLE public.configs OWNER TO postgres;
GRANT ALL ON TABLE public.configs TO postgres;
GRANT ALL ON TABLE public.configs TO anon;
GRANT ALL ON TABLE public.configs TO authenticated;
GRANT ALL ON TABLE public.configs TO service_role;

-- public.blocks definition

-- Drop table

-- DROP TABLE public.blocks;

CREATE TABLE public.blocks ( id uuid DEFAULT gen_random_uuid() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NULL, blocker_id uuid NULL, blocked_id uuid NULL, CONSTRAINT blocks_pkey PRIMARY KEY (id));
COMMENT ON TABLE public.blocks IS 'blocked users';

-- Permissions

ALTER TABLE public.blocks OWNER TO postgres;
GRANT ALL ON TABLE public.blocks TO postgres;
GRANT ALL ON TABLE public.blocks TO anon;
GRANT ALL ON TABLE public.blocks TO authenticated;
GRANT ALL ON TABLE public.blocks TO service_role;

-- public.chats definition

-- Drop table

-- DROP TABLE public.chats;

CREATE TABLE public.chats ( created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NULL, is_active bool DEFAULT true NULL, "type" varchar NULL, last_message_id uuid NULL, description text NULL, creator_id uuid NULL, "name" varchar NULL, id uuid DEFAULT gen_random_uuid() NOT NULL, CONSTRAINT chats_pkey PRIMARY KEY (id));
COMMENT ON TABLE public.chats IS 'chats conversations';

-- Table Triggers

create trigger trg_insert_creator_as_participant after
insert
    on
    public.chats for each row execute function insert_creator_as_participant();

-- Permissions

ALTER TABLE public.chats OWNER TO postgres;
GRANT ALL ON TABLE public.chats TO postgres;
GRANT ALL ON TABLE public.chats TO anon;
GRANT ALL ON TABLE public.chats TO authenticated;
GRANT ALL ON TABLE public.chats TO service_role;

-- public.interactions definition

-- Drop table

-- DROP TABLE public.interactions;

CREATE TABLE public.interactions ( created_at timestamptz DEFAULT now() NOT NULL, swiper_user_id uuid DEFAULT gen_random_uuid() NULL, target_user_id uuid DEFAULT gen_random_uuid() NULL, is_liked bool NOT NULL, is_match bool DEFAULT false NOT NULL, id uuid DEFAULT gen_random_uuid() NOT NULL, CONSTRAINT interactions_pkey PRIMARY KEY (id));
COMMENT ON TABLE public.interactions IS 'swipe and match interactions';

-- Table Triggers

create trigger trg_set_match_on_reciprocal_swipe_insert before
insert
    on
    public.interactions for each row execute function set_match_on_reciprocal_swipe();
create trigger trg_set_match_on_reciprocal_swipe_update before
update
    on
    public.interactions for each row execute function set_match_on_reciprocal_swipe();

-- Permissions

ALTER TABLE public.interactions OWNER TO postgres;
GRANT ALL ON TABLE public.interactions TO postgres;
GRANT ALL ON TABLE public.interactions TO anon;
GRANT ALL ON TABLE public.interactions TO authenticated;
GRANT ALL ON TABLE public.interactions TO service_role;

-- public.messages definition

-- Drop table

-- DROP TABLE public.messages;

CREATE TABLE public.messages ( id uuid DEFAULT gen_random_uuid() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NULL, chat_id uuid NULL, "content" text NULL, sender_id uuid NULL, parent_id uuid NULL, draft_content varchar NULL, "type" varchar NULL, readed bool DEFAULT false NULL, deleted bool NULL, status varchar NULL, CONSTRAINT messages_pkey PRIMARY KEY (id));
COMMENT ON TABLE public.messages IS 'chat messages';

-- Table Triggers

create trigger trg_insert_typing_on_message after
insert
    on
    public.messages for each row execute function insert_typing_on_message();

-- Permissions

ALTER TABLE public.messages OWNER TO postgres;
GRANT ALL ON TABLE public.messages TO postgres;
GRANT ALL ON TABLE public.messages TO anon;
GRANT ALL ON TABLE public.messages TO authenticated;
GRANT ALL ON TABLE public.messages TO service_role;

-- public.participants definition

-- Drop table

-- DROP TABLE public.participants;

CREATE TABLE public.participants ( id uuid DEFAULT gen_random_uuid() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NULL, chat_id uuid NULL, user_id uuid NULL, joined_at timestamp DEFAULT now() NULL, "role" varchar NULL, CONSTRAINT participants_pkey PRIMARY KEY (id));
COMMENT ON TABLE public.participants IS 'chat participants';

-- Permissions

ALTER TABLE public.participants OWNER TO postgres;
GRANT ALL ON TABLE public.participants TO postgres;
GRANT ALL ON TABLE public.participants TO anon;
GRANT ALL ON TABLE public.participants TO authenticated;
GRANT ALL ON TABLE public.participants TO service_role;

-- public.preferences definition

-- Drop table

-- DROP TABLE public.preferences;

CREATE TABLE public.preferences ( id uuid DEFAULT gen_random_uuid() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NULL, min_age int4 DEFAULT 18 NULL, max_age int4 DEFAULT 98 NULL, max_distance numeric DEFAULT '200'::numeric NULL, genders jsonb NULL, user_id uuid NULL, CONSTRAINT preferences_pkey PRIMARY KEY (id));
COMMENT ON TABLE public.preferences IS 'profile preferences';

-- Permissions

ALTER TABLE public.preferences OWNER TO postgres;
GRANT ALL ON TABLE public.preferences TO postgres;
GRANT ALL ON TABLE public.preferences TO anon;
GRANT ALL ON TABLE public.preferences TO authenticated;
GRANT ALL ON TABLE public.preferences TO service_role;

-- public.profiles definition

-- Drop table

-- DROP TABLE public.profiles;

CREATE TABLE public.profiles ( id uuid DEFAULT gen_random_uuid() NOT NULL, created_at timestamptz DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL, updated_at timestamp DEFAULT (now() AT TIME ZONE 'utc'::text) NULL, alias varchar NULL, biography varchar NULL, birth_date timestamp NULL, gender int2 NULL, avatar varchar NULL, address varchar NULL, last_online timestamp NULL, user_id uuid DEFAULT gen_random_uuid() NULL, is_onboarded bool DEFAULT false NULL, is_verified bool DEFAULT true NULL, latitude numeric NULL, longitude numeric NULL, is_online bool NULL, is_active bool NULL, "location" extensions.geography(point, 4326) NULL, secondary_images jsonb NULL, CONSTRAINT profiles_pkey PRIMARY KEY (id));
CREATE INDEX profiles_location_gix ON public.profiles USING gist (location);
COMMENT ON TABLE public.profiles IS 'aux table to store additional user information';

-- Table Triggers

create trigger trg_set_location_from_latlon before
insert
    or
update
    of latitude,
    longitude on
    public.profiles for each row execute function set_location_from_latlon();

-- Permissions

ALTER TABLE public.profiles OWNER TO postgres;
GRANT ALL ON TABLE public.profiles TO postgres;
GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- public.reports definition

-- Drop table

-- DROP TABLE public.reports;

CREATE TABLE public.reports ( id uuid DEFAULT gen_random_uuid() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NULL, reporter_id uuid NOT NULL, reported_id uuid NOT NULL, reason varchar NULL, details text NULL, CONSTRAINT reports_pkey PRIMARY KEY (id));
COMMENT ON TABLE public.reports IS 'abuse reports about users';

-- Permissions

ALTER TABLE public.reports OWNER TO postgres;
GRANT ALL ON TABLE public.reports TO postgres;
GRANT ALL ON TABLE public.reports TO anon;
GRANT ALL ON TABLE public.reports TO authenticated;
GRANT ALL ON TABLE public.reports TO service_role;

-- public.settings definition

-- Drop table

-- DROP TABLE public.settings;

CREATE TABLE public.settings ( id uuid DEFAULT gen_random_uuid() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, meta_key varchar NULL, meta_value jsonb NULL, user_id uuid NULL, CONSTRAINT settings_meta_key_key UNIQUE (meta_key), CONSTRAINT settings_pkey PRIMARY KEY (id));
COMMENT ON TABLE public.settings IS 'user personal settings';

-- Permissions

ALTER TABLE public.settings OWNER TO postgres;
GRANT ALL ON TABLE public.settings TO postgres;
GRANT ALL ON TABLE public.settings TO anon;
GRANT ALL ON TABLE public.settings TO authenticated;
GRANT ALL ON TABLE public.settings TO service_role;

-- public.typing_events definition

-- Drop table

-- DROP TABLE public.typing_events;

CREATE TABLE public.typing_events ( id uuid DEFAULT gen_random_uuid() NOT NULL, created_at timestamptz DEFAULT now() NOT NULL, is_typing bool NULL, chat_id uuid NULL, user_id uuid NULL, updated_at timestamp DEFAULT now() NULL, CONSTRAINT typing_events_pkey PRIMARY KEY (id));
COMMENT ON TABLE public.typing_events IS 'auxiliar table to handle chat typing events';

-- Permissions

ALTER TABLE public.typing_events OWNER TO postgres;
GRANT ALL ON TABLE public.typing_events TO postgres;
GRANT ALL ON TABLE public.typing_events TO anon;
GRANT ALL ON TABLE public.typing_events TO authenticated;
GRANT ALL ON TABLE public.typing_events TO service_role;

-- public.blocks foreign keys

ALTER TABLE public.blocks ADD CONSTRAINT blocks_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.blocks ADD CONSTRAINT blocks_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- public.chats foreign keys

ALTER TABLE public.chats ADD CONSTRAINT chats_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.chats ADD CONSTRAINT chats_last_message_id_fkey FOREIGN KEY (last_message_id) REFERENCES public.messages(id) ON DELETE SET NULL;

-- public.interactions foreign keys

ALTER TABLE public.interactions ADD CONSTRAINT interactions_swiper_user_id_fkey FOREIGN KEY (swiper_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.interactions ADD CONSTRAINT interactions_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- public.messages foreign keys

ALTER TABLE public.messages ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD CONSTRAINT messages_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.messages(id);
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- public.participants foreign keys

ALTER TABLE public.participants ADD CONSTRAINT participants_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;
ALTER TABLE public.participants ADD CONSTRAINT participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- public.preferences foreign keys

ALTER TABLE public.preferences ADD CONSTRAINT preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- public.profiles foreign keys

ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- public.reports foreign keys

ALTER TABLE public.reports ADD CONSTRAINT reports_reported_id_fkey FOREIGN KEY (reported_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.reports ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- public.settings foreign keys

ALTER TABLE public.settings ADD CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- public.typing_events foreign keys

ALTER TABLE public.typing_events ADD CONSTRAINT typing_events_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;
ALTER TABLE public.typing_events ADD CONSTRAINT typing_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- DROP FUNCTION public.distance_to_profile(uuid);

CREATE OR REPLACE FUNCTION public.distance_to_profile(target_user_id uuid)
 RETURNS double precision
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  current_user_id uuid;
  current_location extensions.geography(point, 4326);
  target_location extensions.geography(point, 4326);
BEGIN
  -- Obtener el ID del usuario autenticado
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Obtener ubicaciones
  SELECT location INTO current_location
  FROM profiles WHERE user_id = current_user_id AND is_active = true;
  
  SELECT location INTO target_location
  FROM profiles WHERE user_id = target_user_id AND is_active = true;

  -- Verificar que ambas ubicaciones existan
  IF current_location IS NULL OR target_location IS NULL THEN
    RETURN NULL;
  END IF;

  -- Calcular y retornar distancia en kilómetros
  RETURN (extensions.ST_Distance(current_location, target_location) / 1000)::double precision;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.distance_to_profile(uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.distance_to_profile(uuid) TO public;
GRANT ALL ON FUNCTION public.distance_to_profile(uuid) TO postgres;
GRANT ALL ON FUNCTION public.distance_to_profile(uuid) TO anon;
GRANT ALL ON FUNCTION public.distance_to_profile(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.distance_to_profile(uuid) TO service_role;

-- DROP FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
GRANT ALL ON FUNCTION public.handle_new_user() TO public;
GRANT ALL ON FUNCTION public.handle_new_user() TO postgres;
GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;

-- DROP FUNCTION public.insert_creator_as_participant();

CREATE OR REPLACE FUNCTION public.insert_creator_as_participant()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO public.participants (chat_id, user_id, role)
  VALUES (
    NEW.id,
    NEW.creator_id,
    CASE
      WHEN NEW.type = 'groupal' THEN 'admin'
      WHEN NEW.type = 'private' THEN 'member'
      ELSE 'member'
    END
  );
  RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.insert_creator_as_participant() OWNER TO postgres;
GRANT ALL ON FUNCTION public.insert_creator_as_participant() TO public;
GRANT ALL ON FUNCTION public.insert_creator_as_participant() TO postgres;
GRANT ALL ON FUNCTION public.insert_creator_as_participant() TO anon;
GRANT ALL ON FUNCTION public.insert_creator_as_participant() TO authenticated;
GRANT ALL ON FUNCTION public.insert_creator_as_participant() TO service_role;

-- DROP FUNCTION public.insert_typing_on_message();

CREATE OR REPLACE FUNCTION public.insert_typing_on_message()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  insert into typing_events (chat_id, user_id, is_typing, updated_at)
  values (NEW.chat_id, NEW.sender_id, true, now());
  return NEW;
end;
$function$
;

-- Permissions

ALTER FUNCTION public.insert_typing_on_message() OWNER TO postgres;
GRANT ALL ON FUNCTION public.insert_typing_on_message() TO public;
GRANT ALL ON FUNCTION public.insert_typing_on_message() TO postgres;
GRANT ALL ON FUNCTION public.insert_typing_on_message() TO anon;
GRANT ALL ON FUNCTION public.insert_typing_on_message() TO authenticated;
GRANT ALL ON FUNCTION public.insert_typing_on_message() TO service_role;

-- DROP FUNCTION public.nearby_matches(float8);

CREATE OR REPLACE FUNCTION public.nearby_matches(max_distance double precision DEFAULT 200.0)
 RETURNS TABLE(user_id uuid, username text, avatar_url text, latitude double precision, longitude double precision, distance_km double precision, matched_at timestamp with time zone, has_chat boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  current_user_id uuid;
  current_user_location extensions.geography(point, 4326);
BEGIN
  -- Obtener el ID del usuario autenticado
  current_user_id := auth.uid();
  
  -- Verificar que el usuario esté autenticado
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Obtener la ubicación del usuario actual
  SELECT p.location INTO current_user_location
  FROM profiles p
  WHERE p.user_id = current_user_id
    AND p.is_active = true;

  -- Verificar que el usuario tenga ubicación
  IF current_user_location IS NULL THEN
    RAISE EXCEPTION 'Usuario no tiene ubicación configurada';
  END IF;

  -- Retornar matches cercanos únicos por usuario
  RETURN QUERY
  SELECT DISTINCT ON (p.user_id)
    p.user_id,
    p.alias::text AS username,
    p.avatar::text AS avatar_url,
    CAST(extensions.ST_Y(p.location::extensions.geometry) AS double precision) AS latitude,
    CAST(extensions.ST_X(p.location::extensions.geometry) AS double precision) AS longitude,
    CAST((extensions.ST_Distance(current_user_location, p.location) / 1000) AS double precision) AS distance_km,
    i.created_at::timestamptz AS matched_at,
    EXISTS(
      SELECT 1 FROM participants pt
      JOIN chats c ON c.id = pt.chat_id
      WHERE pt.user_id IN (current_user_id, p.user_id)
      GROUP BY c.id
      HAVING COUNT(DISTINCT pt.user_id) = 2
    ) AS has_chat
  FROM profiles p
  INNER JOIN interactions i ON (
    (i.swiper_user_id = current_user_id AND i.target_user_id = p.user_id) OR
    (i.target_user_id = current_user_id AND i.swiper_user_id = p.user_id)
  )
  WHERE
    p.location IS NOT NULL
    AND p.is_active = true
    AND p.user_id != current_user_id
    AND i.is_match = true
    AND extensions.ST_DWithin(
      current_user_location,
      p.location,
      (nearby_matches.max_distance * 1000)::double precision
    )
  ORDER BY p.user_id, i.created_at DESC;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.nearby_matches(float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.nearby_matches(float8) TO public;
GRANT ALL ON FUNCTION public.nearby_matches(float8) TO postgres;
GRANT ALL ON FUNCTION public.nearby_matches(float8) TO anon;
GRANT ALL ON FUNCTION public.nearby_matches(float8) TO authenticated;
GRANT ALL ON FUNCTION public.nearby_matches(float8) TO service_role;

-- DROP FUNCTION public.nearby_profiles(float8);

CREATE OR REPLACE FUNCTION public.nearby_profiles(max_distance double precision DEFAULT 50.0)
 RETURNS TABLE(user_id uuid, username text, avatar_url text, latitude double precision, longitude double precision, distance_km double precision, age integer, gender integer, biography text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  current_user_id uuid;
  current_user_location extensions.geography(point, 4326);
  user_preferences RECORD;
BEGIN
  -- Obtener el ID del usuario autenticado
  current_user_id := auth.uid();
  
  -- Verificar que el usuario esté autenticado
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Obtener la ubicación del usuario actual
  SELECT p.location INTO current_user_location
  FROM profiles p
  WHERE p.user_id = current_user_id
    AND p.is_active = true;

  -- Verificar que el usuario tenga ubicación
  IF current_user_location IS NULL THEN
    RAISE EXCEPTION 'Usuario no tiene ubicación configurada';
  END IF;

  -- Obtener las preferencias del usuario
  SELECT
    COALESCE(pr.min_age, 18) as min_age,
    COALESCE(pr.max_age, 98) as max_age,
    COALESCE(pr.max_distance, nearby_profiles.max_distance) as max_distance,
    COALESCE(pr.genders, '[1,2,3]'::jsonb) as genders
  INTO user_preferences
  FROM preferences pr
  WHERE pr.user_id = current_user_id;

  -- Retornar perfiles cercanos que cumplan con las preferencias
  RETURN QUERY
  SELECT
    p.user_id,
    p.alias::text AS username,
    p.avatar::text AS avatar_url,
    CAST(extensions.ST_Y(p.location::extensions.geometry) AS double precision) AS latitude,
    CAST(extensions.ST_X(p.location::extensions.geometry) AS double precision) AS longitude,
    CAST((extensions.ST_Distance(current_user_location, p.location) / 1000) AS double precision) AS distance_km,
    CAST(EXTRACT(YEAR FROM AGE(NOW(), p.birth_date)) AS integer) AS age,
    CAST(p.gender AS integer) AS gender,
    p.biography::text AS biography
  FROM profiles p
  WHERE
    p.location IS NOT NULL
    AND p.is_active = true
    AND p.user_id != current_user_id
    AND extensions.ST_DWithin(
      current_user_location,
      p.location,
      (user_preferences.max_distance * 1000)::double precision
    )
    AND p.gender::text = ANY(
      SELECT jsonb_array_elements_text(user_preferences.genders)
    )
    AND EXTRACT(YEAR FROM AGE(NOW(), p.birth_date)) BETWEEN
      user_preferences.min_age AND user_preferences.max_age
  ORDER BY distance_km ASC;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.nearby_profiles(float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.nearby_profiles(float8) TO public;
GRANT ALL ON FUNCTION public.nearby_profiles(float8) TO postgres;
GRANT ALL ON FUNCTION public.nearby_profiles(float8) TO anon;
GRANT ALL ON FUNCTION public.nearby_profiles(float8) TO authenticated;
GRANT ALL ON FUNCTION public.nearby_profiles(float8) TO service_role;

-- DROP FUNCTION public.set_location_from_latlon();

CREATE OR REPLACE FUNCTION public.set_location_from_latlon()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.location := NULL;
  END IF;
  RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.set_location_from_latlon() OWNER TO postgres;
GRANT ALL ON FUNCTION public.set_location_from_latlon() TO public;
GRANT ALL ON FUNCTION public.set_location_from_latlon() TO postgres;
GRANT ALL ON FUNCTION public.set_location_from_latlon() TO anon;
GRANT ALL ON FUNCTION public.set_location_from_latlon() TO authenticated;
GRANT ALL ON FUNCTION public.set_location_from_latlon() TO service_role;

-- DROP FUNCTION public.set_match_on_reciprocal_swipe();

CREATE OR REPLACE FUNCTION public.set_match_on_reciprocal_swipe()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  rec_interaction RECORD;
BEGIN
  -- Solo actuar si is_match es FALSE y is_liked es TRUE en el nuevo registro
  IF ((TG_OP = 'INSERT' AND NEW.is_match = FALSE AND NEW.is_liked = TRUE)
      OR (TG_OP = 'UPDATE' AND NEW.is_match = FALSE AND NEW.is_liked = TRUE AND (OLD.is_liked IS DISTINCT FROM NEW.is_liked OR OLD.is_match IS DISTINCT FROM NEW.is_match))) THEN

    -- Buscar el registro recíproco con is_liked = TRUE y is_match = FALSE
    SELECT * INTO rec_interaction
    FROM interactions
    WHERE swiper_user_id = NEW.target_user_id
      AND target_user_id = NEW.swiper_user_id
      AND is_liked = TRUE
      AND is_match = FALSE
    LIMIT 1;

    -- Si existe reciprocidad y ambos is_liked = TRUE, marcar ambos como match
    IF FOUND THEN
      -- Actualiza el registro recíproco
      UPDATE interactions
      SET is_match = TRUE
      WHERE id = rec_interaction.id;

      -- Marca el registro actual como match
      NEW.is_match := TRUE;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.set_match_on_reciprocal_swipe() OWNER TO postgres;
GRANT ALL ON FUNCTION public.set_match_on_reciprocal_swipe() TO public;
GRANT ALL ON FUNCTION public.set_match_on_reciprocal_swipe() TO postgres;
GRANT ALL ON FUNCTION public.set_match_on_reciprocal_swipe() TO anon;
GRANT ALL ON FUNCTION public.set_match_on_reciprocal_swipe() TO authenticated;
GRANT ALL ON FUNCTION public.set_match_on_reciprocal_swipe() TO service_role;

-- DROP FUNCTION public.swipeable_profiles(float8, int4);

CREATE OR REPLACE FUNCTION public.swipeable_profiles(max_distance double precision DEFAULT 50.0, limit_count integer DEFAULT 10)
 RETURNS TABLE(user_id uuid, username text, avatar_url text, latitude double precision, longitude double precision, distance_km double precision, age integer, gender integer, biography text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  current_user_id uuid;
  current_user_location extensions.geography(point, 4326);
  user_preferences RECORD;
BEGIN
  -- Obtener el ID del usuario autenticado
  current_user_id := auth.uid();
  
  -- Verificar que el usuario esté autenticado
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Obtener la ubicación del usuario actual y sus preferencias
  SELECT p.location INTO current_user_location
  FROM profiles p
  WHERE p.user_id = current_user_id
    AND p.is_active = true;

  -- Verificar que el usuario tenga ubicación
  IF current_user_location IS NULL THEN
    RAISE EXCEPTION 'Usuario no tiene ubicación configurada';
  END IF;

  -- Obtener las preferencias del usuario
  SELECT
    COALESCE(pr.min_age, 18) as min_age,
    COALESCE(pr.max_age, 98) as max_age,
    COALESCE(pr.max_distance, swipeable_profiles.max_distance) as max_distance,
    COALESCE(pr.genders, '[1,2,3]'::jsonb) as genders
  INTO user_preferences
  FROM preferences pr
  WHERE pr.user_id = current_user_id;

  -- Retornar perfiles cercanos que no han sido swipeados
  RETURN QUERY
  SELECT
    p.user_id,
    p.alias::text AS username,
    p.avatar::text AS avatar_url,
    CAST(extensions.ST_Y(p.location::extensions.geometry) AS double precision) AS latitude,
    CAST(extensions.ST_X(p.location::extensions.geometry) AS double precision) AS longitude,
    CAST((extensions.ST_Distance(current_user_location, p.location) / 1000) AS double precision) AS distance_km,
    CAST(EXTRACT(YEAR FROM AGE(NOW(), p.birth_date)) AS integer) AS age,
    CAST(p.gender AS integer) AS gender,
    p.biography::text AS biography
  FROM profiles p
  WHERE
    p.location IS NOT NULL
    AND p.is_active = true
    AND p.user_id != current_user_id
    AND extensions.ST_DWithin(
      current_user_location,
      p.location,
      (user_preferences.max_distance * 1000)::double precision
    )
    AND p.gender::text = ANY(
      SELECT jsonb_array_elements_text(user_preferences.genders)
    )
    AND EXTRACT(YEAR FROM AGE(NOW(), p.birth_date)) BETWEEN
      user_preferences.min_age AND user_preferences.max_age
    -- Excluir perfiles ya swipeados
    AND NOT EXISTS (
      SELECT 1 FROM interactions i
      WHERE i.swiper_user_id = current_user_id
      AND i.target_user_id = p.user_id
    )
  ORDER BY distance_km ASC
  LIMIT swipeable_profiles.limit_count;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.swipeable_profiles(float8, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.swipeable_profiles(float8, int4) TO public;
GRANT ALL ON FUNCTION public.swipeable_profiles(float8, int4) TO postgres;
GRANT ALL ON FUNCTION public.swipeable_profiles(float8, int4) TO anon;
GRANT ALL ON FUNCTION public.swipeable_profiles(float8, int4) TO authenticated;
GRANT ALL ON FUNCTION public.swipeable_profiles(float8, int4) TO service_role;

-- DROP FUNCTION public.update_my_location(float8, float8);

CREATE OR REPLACE FUNCTION public.update_my_location(new_latitude double precision, new_longitude double precision)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  current_user_id uuid;
BEGIN
  -- Obtener el ID del usuario autenticado
  current_user_id := auth.uid();
  
  -- Verificar que el usuario esté autenticado
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Actualizar la ubicación del usuario
  UPDATE profiles
  SET
    location = extensions.ST_SetSRID(extensions.ST_MakePoint(new_longitude, new_latitude), 4326)::extensions.geography,
    latitude = new_latitude,
    longitude = new_longitude,
    updated_at = NOW()
  WHERE user_id = current_user_id;

  RETURN FOUND;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_my_location(float8, float8) OWNER TO postgres;
GRANT ALL ON FUNCTION public.update_my_location(float8, float8) TO public;
GRANT ALL ON FUNCTION public.update_my_location(float8, float8) TO postgres;
GRANT ALL ON FUNCTION public.update_my_location(float8, float8) TO anon;
GRANT ALL ON FUNCTION public.update_my_location(float8, float8) TO authenticated;
GRANT ALL ON FUNCTION public.update_my_location(float8, float8) TO service_role;

-- Permissions

GRANT ALL ON SCHEMA public TO pg_database_owner;
GRANT USAGE ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT MAINTAIN, INSERT, UPDATE, REFERENCES, DELETE, SELECT, TRUNCATE, TRIGGER ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT MAINTAIN, INSERT, UPDATE, REFERENCES, DELETE, SELECT, TRUNCATE, TRIGGER ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT MAINTAIN, INSERT, UPDATE, REFERENCES, DELETE, SELECT, TRUNCATE, TRIGGER ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT MAINTAIN, INSERT, UPDATE, REFERENCES, DELETE, SELECT, TRUNCATE, TRIGGER ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE, USAGE, SELECT ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE, USAGE, SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE, USAGE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT UPDATE, USAGE, SELECT ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT UPDATE, USAGE, SELECT ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT UPDATE, USAGE, SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT UPDATE, USAGE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT UPDATE, USAGE, SELECT ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT MAINTAIN, INSERT, UPDATE, REFERENCES, DELETE, SELECT, TRUNCATE, TRIGGER ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT MAINTAIN, INSERT, UPDATE, REFERENCES, DELETE, SELECT, TRUNCATE, TRIGGER ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT MAINTAIN, INSERT, UPDATE, REFERENCES, DELETE, SELECT, TRUNCATE, TRIGGER ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT MAINTAIN, INSERT, UPDATE, REFERENCES, DELETE, SELECT, TRUNCATE, TRIGGER ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO service_role;
