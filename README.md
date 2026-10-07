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

The live demo is https://ask-betty-pearl.vercel.app/. Betty's API routes run in this project and no longer depend on the separate C&C deployment. Without database configuration, account retrieval and prepared section answers use the presentation seed. Shared note and commitment persistence requires POSTGRES_URL_NON_POOLING (or POSTGRES_URL).

OpenAI microphone transcription is configured in the live production environment with the user's explicit approval. The API key is an encrypted hosting environment variable and is never included in this package. Hosted recording sends audio to OpenAI for transcription; browser narration supplies spoken answers. Preview environments require their own voice configuration. The local preview retains Windows transcription.

To host another instance, configure OPENAI_API_KEY privately on that project and redeploy. Register its exact origin in lib/betty-origin.cjs. Never put a key in browser code or GitHub. GitHub Pages alone cannot run these server routes.

Live validation on October 7: a demo recording was transcribed as "What meetings do I have today?" and answered through the live API with Daily Brief routing. Physical microphone permission and input quality remain device-specific.

## Assets and validation

Brand photos and product images are attributed through their source links. Generated artwork provenance appears in assets/illustration-notes.txt. betty-approved-style-reference.png is the supplied locked design. Brand assets are included for this requested demo; this package does not grant a general trademark or image license.

npm run check validates JavaScript syntax, Massachusetts accounts and section routing without credentials or external requests. REVIEW.txt records the browser/device checks and remaining limitations.
