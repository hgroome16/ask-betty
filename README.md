# Ask Betty — QuickHits Massachusetts demo

GitHub-ready source package, prepared October 7, 2026. The home lockup reads **Massachusetts demo information** and links home. The approved reference artwork supplies the navigation icons. The welcome overview appears on every app load, with a compact branded layout and red close control. Get Started returns home and focuses the microphone; its TAP TO SPEAK instruction curves into the badge. See UPLOAD-INSTRUCTIONS.txt for a GitHub Desktop upload walkthrough.

## Run locally

Use Node.js 24. From this repository folder:

```sh
npm install
npm run check
npm start
```

Open http://127.0.0.1:4175/#home. Admin: http://127.0.0.1:4175/#admin.

If port 4175 is already in use, stop the other preview first. Windows microphone transcription requires the installed en-US Windows speech recognizer and normal Windows speech access. On other systems, browser speech support varies; typed questions remain available. Browser narration includes Stop and Listen again. Live human microphone reliability and audible output still need target-device validation. External OpenAI speech connections are disabled in the local preview.

Local records are saved under .local/ and are ignored by Git. The package starts with presentation seed records, not the previous computer's locally saved notes. Admin settings and some drafts use browser storage.

## Included

- Voice-first home and twelve QuickHits destinations; the approved tropical palette, microphone, logo and illustrated icons.
- Ten Massachusetts demo accounts with buyer context, meeting preparation, updates, notes, commitments and account map links.
- Natural requests for daily brief, meetings, account attention, follow-ups, prospects, news, trends, products, brand, merch, reports and saved meeting notes. Replies open the relevant section and request narration.
- Retail ROI compares pop-ups, retailer support and discounts using editable planning assumptions. Includes contribution, ROI, break-even uplift, click-to-purchase conversion and competitor price position.
- Seventeen product references, ten merchandise items, dated official releases and free news coverage with source links.
- Copy, download, Listen/Stop and email-draft tools. Email opens a draft; the user chooses whether to send.

Sales figures and retailer records are demonstration data. Individual SKU sales rankings are unavailable; top-ten questions explain that limitation. Today uses America/New_York. On October 6 the seed has three meetings; later dates reflect their own scheduled meetings.

## Upload to GitHub

Unzip the delivery archive. Upload the contents of this folder to a new repository, or run:

```sh
git init
git add .
git commit -m "Add Ask Betty Massachusetts demo"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

No GitHub repository has been created or pushed by this packaging task. No credentials are included. .env.example lists placeholders; keep actual keys in private hosting environment variables.

## Hosted backend status

The hosted backend is not deployed. Uploading source to GitHub does not activate AI, database persistence or hosted transcription. GitHub Pages can serve the static UI, but cannot run the /api routes or the Windows transcription service.

The current hosted adapters in lib/betty-proxy.cjs target https://quickhits-vercel-mobile.vercel.app/api/betty-service. Adding Betty endpoints to that existing service project still requires approval. Do not deploy this whole repository over the existing C&C project.

For the reviewed shared-service architecture, the additive backend files are api/betty-service.js; lib/betty-backend.cjs; lib/betty-demo-intent.cjs; lib/betty-seed.json; lib/betty-transcribe.cjs. It also depends on the existing database.cjs / supabase-ca.crt and pg dependency. Configure OPENAI_API_KEY and POSTGRES_URL_NON_POOLING on the backend host; the optional model defaults to gpt-5.4-mini. Betty writes only public.quickhits_betty_demo_records.

Frontend API origins currently allow https://ask-betty-quickhits.vercel.app and the local preview. Update the origin allowlists and proxy destination together if choosing another host. Backend database table creation and seed initialization happen on first use. Review hosted access controls before exposing a shared writable demo.

## Assets and validation

Brand photos and product images are attributed through their source links. Generated artwork provenance appears in assets/illustration-notes.txt. betty-approved-style-reference.png is the supplied locked design. Brand assets are included for this requested demo; this package does not grant a general trademark or image license.

npm run check validates JavaScript syntax, Massachusetts accounts and section routing without credentials or external requests. REVIEW.txt records the browser/device checks and remaining limitations.
