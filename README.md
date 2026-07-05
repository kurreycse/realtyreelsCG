
  # EstateHub Property Marketplace

  This is a responsive property marketplace prototype for searching, comparing, posting, and verifying real-estate listings across cities.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Deployment

  ### Vercel

  1. Connect this repository to Vercel.
  2. Set these environment variables in Vercel project settings:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
  3. Use the build command: `npm run build`.
  4. Use the publish directory: `dist`.

  ### Netlify

  1. Connect this repository to Netlify.
  2. Set these environment variables in Netlify site settings:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
  3. Use the build command: `npm run build`.
  4. Use the publish directory: `dist`.
  5. Enable redirect rule by keeping `netlify.toml` in the repo.
  
