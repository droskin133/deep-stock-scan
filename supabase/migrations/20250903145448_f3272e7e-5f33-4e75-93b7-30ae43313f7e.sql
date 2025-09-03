-- Secure profile creation on signup and ensure trigger exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Attempt to create a profile for the new user; never block signup on failure
  BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  EXCEPTION WHEN others THEN
    -- Log a warning but do not block user creation
    RAISE WARNING 'handle_new_user failed to insert profile for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$function$;

-- Recreate the trigger to ensure it's present
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_new_user();