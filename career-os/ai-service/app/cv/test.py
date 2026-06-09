from dotenv import load_dotenv
import os
from supabase import create_client

# 1. Load .env
load_dotenv()

# 2. Check env values
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

print("URL loaded:", url)
print("KEY loaded:", "YES" if key else "NO")

# 3. Stop if missing
if not url or not key:
    raise Exception("❌ .env not loaded properly")

# 4. Create client
sb = create_client(url, key)
print("✅ Supabase client created successfully")

# 5. Test query
res = sb.schema("dbo").table("user_profiles").select("*").limit(5).execute()
#res = sb.table("user_profiles").select("*").limit(5).execute()
print("DATA:", res.data)
print("ERROR:", res.error)