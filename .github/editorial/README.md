# ME Shield — Blog audit and publication plan

Prepared October 24, 2026. All calendar dates use America/New_York.

## What the audit verified

The existing blog has 28 public article cards and seven categories: Insurance, Tax Tips, Immigration, Business Filing, Infinite Banking, Financial Education and Community. English/Haitian Creole switching and category buttons are already present. The existing RSS had only eight entries, so a feed-based automation could miss most public articles. The publication feed now preserves those eight and adds only each new release; historical backfilling is deferred until the client-email automation can be checked, to avoid triggering an old-article backlog. During initial deployment the feed was briefly rebuilt from all 29 cards before this safeguard was applied; whether an external campaign consumed that version cannot be verified without Brevo logs. The newsletter submits to a Brevo hosted form, but its success message previously appeared after a 500 ms timer without checking whether Brevo accepted the subscription. No scheduled article-publishing workflow was present in this repository.

## Improvements, in priority order

1. Reliable publication and sharing: publish one article at a time, update the feed and sitemap at publication, then verify the public URL before distributing it. An RSS feed is an input to a campaign, not proof that a campaign exists or sends successfully.
2. Reliable subscription confirmation: use Brevo's real form response instead of a simulated success message. Verify double opt-in, subscriber list, suppression rules, language preference and unsubscribe handling inside Brevo.
3. Clear article dates and order: keep the newest releases first, label actual publication and substantive review dates separately, and review old time-sensitive pieces before re-promoting them. Existing cards mix months/years and several retain a “Latest” badge; they are not consistently chronological.
4. Easier discovery: retain the existing seven category filters, then add keyword search, category counts and pagination/load-more for the growing archive. These are recommendations; the archive has not been redesigned in this change.
5. Consistent article quality: new articles have a contents list, short sections, examples, bilingual text, an organizational byline, primary-source links, source-review date, attribution/disclaimer, a contact CTA, social metadata and BlogPosting structured data. Do not label an article personally reviewed by Miguelson unless he has actually reviewed it.
6. Keep authority claims accurate: PTIN registration is not an IRS professional license. A separate homepage Creole sentence currently says “lisansye pa IRS”; it should be corrected in a separate site-copy review. Financial Education remains an editorial category, not a new service.

## Delivery

Fourteen original bilingual articles: two per existing category. First release: October 24. Remaining target slots: every three calendar days, usually after 9 AM Florida time, through December 2, 2026. The first release is prepared with the current timestamp. A scheduled workflow checks twice per day to cover daylight-saving time. GitHub schedules may be delayed; the publisher releases at most one due article and enforces three Florida calendar days since the previous actual release, so an outage will not dump a backlog in one day. Later slots can slip if a prior release was delayed.

Scheduled source drafts are in this public GitHub repository, but no article HTML page, blog card, RSS item or sitemap entry is generated for a draft until publication. This is an editorial queue, not confidential storage.

## Client email and Google Business Profile status

Brevo opens at a sign-in screen in the available browser. Its campaign/automation enabled state, trigger URL, list, opt-in status and delivery logs could not be verified. The website contains a Brevo form, but that alone does not establish a working RSS-to-email automation. No client email has been sent by this work. Do not activate a duplicate campaign or send to all contacts without verifying the existing opted-in audience and suppression settings.

Metricool brand settings were checked: Facebook, Instagram and TikTok are connected; no Google Business Profile connection is listed. No authenticated Google Business Profile posting integration has been verified. Each publication writes a sharing record in `.github/editorial/sharing/` with English/Creole copy, a Learn more link with tracking parameters, and a client-email subject/intro. `prepared_not_posted` and `not_sent_automation_unverified` are intentional status values. Preparing copy or a URL does not post to Google or send email.

To finish verification in Brevo: identify the existing blog/RSS campaign, check enabled status and last successful runs, confirm the source `https://meshieldfinancial.com/rss.xml`, validate intended language/audience, ensure unsubscribe and suppression behavior, and send a controlled test only to an explicitly authorized test address. Reconcile one article URL with its campaign and delivery result before calling the integration operational.

To finish Google sharing: open the authenticated business profile, select the correct ME Shield business, use the prepared article update with Learn more pointing to the verified live article, publish and record the resulting post URL. Do not mark a sharing record posted based only on a draft.

## Sources and rights

Each article paraphrases official guidance and uses original hypothetical examples. References identify the source agencies; they do not imply endorsement. No third-party prose is intentionally reproduced as a long quotation. A disclaimer does not replace proper attribution or permission to reproduce protected material. Tax, immigration, insurance and filing guidance should be checked again when a future change or publication date warrants it. The new series avoids asserting future enrollment dates, changing immigration eligibility or future tax thresholds.

## Verification

The initial publishing workflow and Cloudflare Pages deployment succeeded. The first article was checked live in English and Haitian Creole, and its first-position card was verified on the blog.

Five publication tests cover no early release, one-at-a-time release, repeat-run idempotency, delayed-run backlog behavior, the three-day interval, category distribution, daylight-saving offsets and rendering all fourteen articles with bilingual content, sources and structured data. The repository structural validator checks internal links, canonicals, JSON-LD and sitemap targets.

## Calendar

| Target date | Category | Article |
|---|---|---|
| 2026-10-24 | insurance | Home Insurance Coverage A to F: A Florida Guide With Real-Life Examples |
| 2026-10-27 | tax | Self-Employed? A Monthly Recordkeeping Routine That Makes Tax Season Easier |
| 2026-10-30 | immigration | USCIS Documents and Translations: Organize the File Before You Submit |
| 2026-11-02 | business | A Florida Small-Business Renewal Calendar You Can Actually Maintain |
| 2026-11-05 | ibc | Before Infinite Banking: How to Read a Whole Life Illustration |
| 2026-11-08 | finance | Predictable Bills Are Not Emergencies: Build a Simple Sinking Fund |
| 2026-11-11 | community | Sending Money to Family in Haiti: Compare the Total Cost |
| 2026-11-14 | insurance | How to Compare Two Home Insurance Quotes Without Losing Important Coverage |
| 2026-11-17 | tax | Estimated Taxes for Self-Employed Workers: Plan Before the Bill Arrives |
| 2026-11-20 | immigration | Your USCIS Receipt Notice: Track the Case Without Sharing Private Information |
| 2026-11-23 | business | LLC, DBA and EIN: Three Different Things a New Business Owner Should Understand |
| 2026-11-26 | ibc | Life Insurance Policy Loans: Interest, Repayment and the Risks to Understand |
| 2026-11-29 | finance | A Year-End Family Financial Checkup in Five Practical Steps |
| 2026-12-02 | community | A Family Emergency Document Kit: Help Your Loved Ones Find What Matters |
