# Guestbook Setup Instructions

Your guestbook is ready! Follow these steps to connect it to Supabase (100% free).

## Step 1: Create a Free Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign Up"
3. Sign up with your GitHub account (recommended) or email
4. No credit card required!

## Step 2: Create a New Project

1. Once logged in, click "New Project"
2. Fill in the details:
   - **Name**: `abs-guestbook` (or any name you like)
   - **Database Password**: Create a strong password (save it somewhere safe)
   - **Region**: Choose the closest to you or your visitors
   - **Pricing Plan**: Free (stays free forever)
3. Click "Create new project"
4. Wait 2-3 minutes for your project to be created

## Step 3: Create the Guestbook Table

1. In your Supabase project dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Paste the following SQL and click "Run":

```sql
-- Create guestbook table
CREATE TABLE guestbook (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  website TEXT,
  message TEXT NOT NULL,
  CONSTRAINT name_length CHECK (char_length(name) <= 50),
  CONSTRAINT email_length CHECK (char_length(email) <= 100),
  CONSTRAINT website_length CHECK (char_length(website) <= 200),
  CONSTRAINT message_length CHECK (char_length(message) <= 500)
);

-- Enable Row Level Security
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read entries
CREATE POLICY "Anyone can read guestbook entries"
  ON guestbook
  FOR SELECT
  USING (true);

-- Allow anyone to insert entries
CREATE POLICY "Anyone can insert guestbook entries"
  ON guestbook
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX guestbook_created_at_idx ON guestbook(created_at DESC);
```

4. You should see "Success. No rows returned"

## Step 4: Get Your API Credentials

1. In your Supabase project, click "Settings" (gear icon) in the left sidebar
2. Click "API" under Project Settings
3. You'll see two important values:
   - **Project URL**: Looks like `https://abcdefghijklmnop.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`
4. Keep this page open - you'll need these values next

## Step 5: Add Environment Variables to Your Project

1. In your project root, create a file named `.env` (if it doesn't exist)
2. Add the following lines (replace with your actual values):

```env
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Make sure `.env` is in your `.gitignore` file (it should be by default)

## Step 6: Add Environment Variables to GitHub (for deployment)

If you're using GitHub Pages or deploying via GitHub Actions:

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret" and add:
   - Name: `PUBLIC_SUPABASE_URL`
   - Secret: Your Supabase project URL
4. Click "New repository secret" again and add:
   - Name: `PUBLIC_SUPABASE_ANON_KEY`
   - Secret: Your Supabase anon key

## Step 7: Test Locally

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:4321/guestbook`
3. Try signing the guestbook!
4. Your entry should appear below the form

## Step 8: Deploy

Once you've tested locally and everything works:

```bash
git add .
git commit -m "Add Supabase guestbook functionality"
git push
```

Your guestbook is now live! 🎉

## Optional: Moderate Entries

### View All Entries
1. Go to your Supabase dashboard
2. Click "Table Editor" in the left sidebar
3. Select "guestbook" table
4. You can see all entries here

### Delete Spam
1. In the Table Editor, find the spam entry
2. Click the trash icon on the right side of the row
3. Confirm deletion

### Add Approval System (Advanced)
If you want to approve entries before they appear, you can:
1. Add an `approved` boolean column to the table
2. Update the read policy to only show approved entries
3. Manually approve entries in the Supabase dashboard

## Troubleshooting

### "Failed to load guestbook entries"
- Check that your `.env` file has the correct values
- Make sure you've restarted your dev server after adding `.env`
- Verify the Supabase project is active (not paused)

### "Failed to submit your message"
- Check the browser console for errors
- Verify the RLS policies were created correctly
- Make sure the table was created successfully

### Entries not appearing
- Check the Supabase Table Editor to see if entries are being saved
- Look at the browser console for JavaScript errors
- Verify the SQL policies allow reading

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- Check your browser console for errors

---

## What You Get For Free

With Supabase's free tier, you get:
- 500MB database storage
- 2GB bandwidth per month
- 50MB file storage
- Unlimited API requests
- Row Level Security
- Real-time subscriptions

This is more than enough for a personal guestbook! 🚀
