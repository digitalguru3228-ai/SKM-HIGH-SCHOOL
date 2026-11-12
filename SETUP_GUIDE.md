# SKM High School Website - Local PC & Supabase Setup Guide
## તમારા લોકલ કમ્પ્યુટર (Local PC) પર સેટઅપ અને Supabase સાથે કનેક્ટ કરવાની સરળ માર્ગદર્શિકા

આ પ્રોજેક્ટ સંપૂર્ણપણે તૈયાર છે અને Supabase ક્લાઉડ ડેટાબેઝ સાથે કનેક્ટ થઈ શકે છે.

---

### ભાગ ૧: તમારા લોકલ PC પર સેટઅપ (Local PC Setup)

#### પગલું ૧: Node.js ઇન્સ્ટોલ કરો
તમારા કમ્પ્યુટરમાં Node.js (Version 18 કે 20+) હોવું જરૂરી છે.
જો ન હોય, તો [https://nodejs.org](https://nodejs.org) પરથી ડાઉનલોડ કરીને ઇન્સ્ટોલ કરો.

#### પગલું ૨: પ્રોજેક્ટ તમારા PC પર ખોલો
પ્રોજેક્ટ ફોલ્ડરને ટર્મિનલ / Command Prompt (CMD) અથવા VS Code માં ખોલો:
```bash
cd skm-high-school
```

#### પગલું ૩: ડિપેન્ડન્સી ઇન્સ્ટોલ કરો
નીચેનો કમાન્ડ રન કરો:
```bash
npm install
```

#### પગલું ૪: `.env` ફાઈલ બનાવો
પ્રોજેક્ટના રુટ ફોલ્ડરમાં `.env.example` ફાઈલની નકલ કરીને નવી `.env` ફાઈલ બનાવો:
- Windows (CMD): `copy .env.example .env`
- Mac / Linux: `cp .env.example .env`

#### પગલું ૫: લોકલ સર્વર શરૂ કરો
```bash
npm run dev
```
હવે તમારા બ્રાઉઝરમાં **`http://localhost:3000`** ખોલો. વેબસાઈટ લોકલ PC પર લાઈવ થઈ જશે!

---

### ભાગ ૨: Supabase સાથે કનેક્ટ કરો (Supabase Cloud Database Setup)

Supabase સાથે કનેક્ટ કરવાથી તમારો બધો જ ડેટા (Faculty, Announcements, Admission Forms, School Settings) ક્લાઉડમાં સુરક્ષિત રીતે સેવ રહેશે અને Vercel તેમજ Local PC બંને જગ્યાએ રિયલ-ટાઇમ સિંક થશે.

#### પગલું ૧: Supabase પર એકાઉન્ટ બનાવો
1. [https://supabase.com](https://supabase.com) પર જાઓ.
2. "Start your project" પર ક્લિક કરીને ફ્રી એકાઉન્ટ બનાવો (GitHub અથવા Email વડે).
3. "New Project" પર ક્લિક કરો:
   - **Name**: `skm-high-school`
   - **Database Password**: કોઈ સુરક્ષિત પાસવર્ડ યાદ રાખો
   - **Region**: South Asia (Mumbai) પસંદ કરો (ઝડપી સ્પીડ માટે)
   - "Create new project" પર ક્લિક કરો.

#### પગલું ૨: ડેટાબેઝ ટેબલ્સ બનાવો (SQL Schema Run કરો)
1. તમારા Supabase પ્રોજેક્ટ ડેશબોર્ડમાં ડાબી બાજુની મેનુમાંથી **SQL Editor** પર ક્લિક કરો.
2. ઉપર **"New query"** બટન દબાવો.
3. આ પ્રોજેક્ટમાં રહેલી **`supabase-schema.sql`** ફાઈલનો બધો જ કોડ કૉપિ કરો અને SQL Editor માં પેસ્ટ (Paste) કરો.
4. નીચે જમણી બાજુ આવેલું લીલું **"Run"** બટન દબાવો.
   *(આનાથી બધા ટેબલ્સ જેમ કે staff, announcements, admissions, settings આપોઆપ બની જશે અને સેમ્પલ ડેટા પણ આવી જશે!)*

#### પગલું ૩: API Keys મેળવો
1. Supabase ડેશબોર્ડમાં ડાબી બાજુ નીચે **Project Settings (ગિયર આઇકન ⚙️)** પર જાઓ.
2. **API** મેનુ પર ક્લિક કરો.
3. ત્યાંથી નીચેની બે વિગતો કૉપિ કરો:
   - **Project URL** (દા.ત. `https://xyzcompany.supabase.co`)
   - **Project API keys** માંથી **`anon` `public`** કી

#### પગલું ૪: તમારા પ્રોજેક્ટમાં કી ઉમેરો (`.env`)
તમારા PC પર પ્રોજેક્ટના રુટ ફોલ્ડરમાં રહેલી **`.env`** ફાઈલ ખોલો અને નીચે પ્રમાણે તમારી કી લખો:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=skm_kanodar_edu_jwt_super_secret_key_2026_production

# Supabase Keys
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

ફાઈલ સેવ કરો અને ટર્મિનલમાં `npm run dev` ને ફરીથી શરૂ કરો.
**બસ! તમારી વેબસાઇટ હવે સીધી જ Supabase ક્લાઉડ સાથે કનેક્ટ થઈ ગઈ છે!**

---

### ભાગ ૩: Vercel પર Supabase કનેક્ટ કરવું

જો તમે વેબસાઈટ Vercel પર ડિપ્લોય કરેલી હોય:
1. [https://vercel.com](https://vercel.com) પર તમારા પ્રોજેક્ટના ડેશબોર્ડમાં જાઓ.
2. **Settings** -> **Environment Variables** પર જાઓ.
3. નીચેની બે Variables ઉમેરો:
   - Key: `VITE_SUPABASE_URL` | Value: `તમારો Supabase URL`
   - Key: `VITE_SUPABASE_ANON_KEY` | Value: `તમારી Supabase Anon Key`
4. પ્રોજેક્ટને ફરીથી "Redeploy" કરો.

---

### ભાગ ૪: Admin Panel માં લોગિન કરવું

- URL: **`http://localhost:3000/#admin`**
- **Email**: `digitalguru3228@gmail.com`
- **Password**: `Admin@3228`

જ્યારે પણ તમે Admin Panel માંથી કોઈ ફેકલ્ટી ઉમેરશો અથવા રિમૂવ કરશો, તે સીધું જ Supabase ડેટાબેઝમાં અપડેટ થશે અને વેબસાઇટ પર તરત જ લાઈવ દેખાશે!
