# Vehicle information

## Setup

1. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Run [`supabase/vehicle_certificates.sql`](./supabase/vehicle_certificates.sql) in the Supabase SQL editor. This creates the vehicle table and the restricted public-record lookup function.
3. Start the app with `npm run dev`.

## Public vehicle QR codes

Each inventory row has a **QR code** action. Download or scan its QR code to open `/certificate/<public-key>`. The public record can be opened with or without signing in; signed-in administrators see a dashboard link, while other visitors see an administrator sign-in link.

Anyone with a record's QR code or public URL can view its date, make/body type, model, country, chassis and engine numbers, color, and remarks. The public lookup function returns only that record and those fields; it does not enable anonymous access to the inventory table.
