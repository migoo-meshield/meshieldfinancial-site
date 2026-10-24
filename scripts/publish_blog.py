#!/usr/bin/env python3
"""Publish one due bilingual article; never release a backlog all at once."""
import argparse
import html
import json
import re
from datetime import datetime, timedelta, timezone
from email.utils import format_datetime
from pathlib import Path
from xml.etree import ElementTree as ET
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
QUEUE = ROOT / '.github/editorial/articles.json'
ORIGIN = 'https://meshieldfinancial.com'
CATEGORIES = {'insurance':('Insurance','Asirans','article-homeowners-renters.jpg'), 'tax':('Tax Tips','Konsèy Taks','article-tax-prep.jpg'), 'immigration':('Immigration','Imigrasyon','article-immigration-forms.jpg'), 'business':('Business Filing','Depo Biznis','article-business-filing.jpg'), 'ibc':('Infinite Banking','Bank Enfini','article-infinite-banking-guide.jpg'), 'finance':('Financial Education','Edikasyon Finansye','article-hurricane-prep.jpg'), 'community':('Community','Kominote','article-haitian-money-habits.jpg')}

def esc(s): return html.escape(s, quote=True)
def both(tag, en, ht, attrs=''):
    return f'<{tag} data-en {attrs}>{en}</{tag}><{tag} data-ht {attrs}>{ht}</{tag}>'

def render_article(a):
    template = (ROOT / 'homeowners-renters-insurance-florida-guide.html').read_text()
    nav = re.search(r'<nav\b.*?</nav>', template, re.S).group()
    footer = re.search(r'<footer\b.*?</footer>', template, re.S).group()
    base_style = re.search(r'<style>(.*?)</style>',template,re.S).group(1)
    cat_en,cat_ht,image = CATEGORIES[a['category']]
    slug=a['slug']; url=f'{ORIGIN}/{slug}'
    published=a['published_at']; date=published[:10]
    words=len(' '.join(s['text']['en'] for s in a['sections']).split())
    minutes=max(2,round(words/180))
    source_links=''.join(f'<li id="source-{i}"><a href="{esc(s["url"])}" rel="noopener noreferrer">{esc(s["title"])}</a></li>' for i,s in enumerate(a['sources'],1))
    toc=''.join('<li>'+both('a',esc(s['heading']['en']),esc(s['heading']['ht']),f'href="#section-{i}"')+'</li>' for i,s in enumerate(a['sections'],1))
    body=''
    for i,s in enumerate(a['sections'],1):
        body+=f'<section id="section-{i}">'+both('h2',esc(s['heading']['en']),esc(s['heading']['ht']))+both('p',esc(s['text']['en']),esc(s['text']['ht']))+'</section>\n'
    disclaimer_en='Original educational content by ME Shield Financial Services, informed by the public sources listed below. It paraphrases general guidance and does not reproduce an agency publication or imply agency endorsement. Examples are hypothetical, not actual client cases. General education only; not personalized insurance, investment, tax or legal advice. Insurance depends on the issued policy, exclusions, limits and insurer assessment. Tax and immigration rules can change. Immigration services are document preparation assistance only; consult an immigration attorney or authorized accredited representative for legal advice.'
    disclaimer_ht='Kontni edikatif orijinal ME Shield Financial Services, ki sèvi ak sous piblik ki anba yo. Li reformile enfòmasyon jeneral; li pa repwodui yon piblikasyon ajans ni li pa vle di ajans lan apwouve nou. Egzanp yo ipotetik, yo pa dosye kliyan reyèl. Edikasyon jeneral sèlman; se pa konsèy asirans, envestisman, taks oswa legal pèsonalize. Asirans depann de polis yo emèt la, esklizyon, limit ak evalyasyon konpayi an. Règ taks ak imigrasyon ka chanje. Sèvis imigrasyon se asistans preparasyon dokiman sèlman; konsilte yon avoka imigrasyon oswa reprezantan akredite otorize pou konsèy legal.'
    schema={'@context':'https://schema.org','@type':'BlogPosting','headline':a['title']['en'],'description':a['description']['en'],'datePublished':published,'dateModified':published,'mainEntityOfPage':url,'image':ORIGIN+'/'+image,'inLanguage':['en','ht'],'author':{'@type':'Organization','name':'ME Shield Financial Services','url':ORIGIN},'publisher':{'@type':'Organization','name':'ME Shield Financial Services','logo':{'@type':'ImageObject','url':ORIGIN+'/logo.png'}},'citation':[s['url'] for s in a['sources']]}
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(a['title']['en'])} — ME Shield Financial Services</title>
<meta name="description" content="{esc(a['description']['en'])}"><link rel="canonical" href="{url}">
<link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/style.css?v=20260901-1">
<meta property="og:type" content="article"><meta property="og:title" content="{esc(a['title']['en'])}"><meta property="og:description" content="{esc(a['description']['en'])}"><meta property="og:url" content="{url}"><meta property="og:image" content="{ORIGIN}/{image}">
<meta property="article:published_time" content="{published}"><meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(schema,ensure_ascii=False).replace('<','\\u003c')}</script>
<style>{base_style}
.article-hero{{background-image:url('/{image}')}}
.article-toc{{background:var(--offwhite);padding:24px;border-radius:8px;margin:24px 0}} .article-toc a{{line-height:1.8}} .article-toc a[data-en],.article-toc a[data-ht]{{display:inline}}
.article-body section{{scroll-margin-top:100px}} .article-sources li{{overflow-wrap:anywhere}} .article-date{{color:rgba(255,255,255,.85)}}
.article-body .article-disclaimer-box p{{font-size:.88rem}} .share-row{{display:flex;gap:16px;flex-wrap:wrap;margin:24px 0}}
</style></head><body>{nav}
<main id="main-content"><header class="article-hero"><div class="container"><div class="article-meta">{both('span',esc(cat_en),esc(cat_ht),'class="article-tag"')}<time class="article-date" datetime="{published}">{date}</time></div>
{both('h1',esc(a['title']['en']),esc(a['title']['ht']))}
{both('p',esc(a['description']['en']),esc(a['description']['ht']),'style="color:white"')}
<p style="color:white">ME Shield Financial Services · {minutes} min</p></div></header>
<section class="section section-white"><div class="container"><article class="article-body">
{both('a','← All articles','← Tout atik','href="/blog" class="back-link"')}
<nav class="article-toc" aria-label="Article contents">{both('h2','In this guide','Nan gid sa a')}<ul>{toc}</ul></nav>
{body}
<aside class="article-disclaimer-box">{both('h2','Education and attribution','Edikasyon ak atribisyon')}{both('p',esc(disclaimer_en),esc(disclaimer_ht))}</aside>
<section class="article-sources">{both('h2','Sources and further reading','Sous ak lòt lekti')}{both('p','Source review: '+a['source_checked']+'. Verify current official guidance before acting.','Dat revizyon sous: '+a['source_checked']+'. Verifye gid ofisyèl aktyèl anvan ou aji.')}<ol>{source_links}</ol></section>
<div class="share-row">{both('a','Share by email','Pataje pa imel',f'href="mailto:?subject={esc(a["title"]["en"])}&amp;body={url}"')}{both('a','Share on WhatsApp','Pataje sou WhatsApp',f'href="https://wa.me/?text={url}" rel="noopener"')}</div>
<div class="article-cta">{both('h3','Have a question about your next step?','Ou gen yon kestyon sou pwochen etap ou?')}{both('p','Talk with ME Shield in English or Haitian Creole.','Pale ak ME Shield an Anglè oswa Kreyòl Ayisyen.')}<a class="btn btn-gold" href="https://connect.meshieldfinancial.com">{both('span','Contact ME Shield','Kontakte ME Shield')}</a><p><a style="color:white" href="tel:+14072672652">+1 (407) 267-2652</a> · <a style="color:white" href="mailto:info@meshieldfinancial.com">info@meshieldfinancial.com</a></p></div>
</article></div></section></main>{footer}<script src="/shared.js"></script><script src="/chatbot-widget.js"></script></body></html>'''

def card(a):
    ce,ch,image=CATEGORIES[a['category']]
    return f'''<article class="blog-card" data-category="{a['category']}" data-published="{a['published_at']}">
<div class="blog-card-thumb" style="background-image:url('{image}');background-size:cover;background-position:center;"></div><div class="blog-card-body"><div class="blog-meta">{both('span',ce,ch,'class="blog-tag"')}<time class="blog-date" datetime="{a['published_at']}">{a['published_at'][:10]}</time></div>{both('h3',esc(a['title']['en']),esc(a['title']['ht']))}{both('p',esc(a['description']['en']),esc(a['description']['ht']))}{both('a','Read full article →','Li atik konplè a →',f'href="/{a["slug"]}" class="blog-read-more"')}</div></article>'''

# Preserve the existing feed: backfilling old cards could trigger a client-email backlog.
def update_rss(a):
    path=ROOT/'rss.xml'; root=ET.parse(path).getroot(); chan=root.find('channel')
    url=ORIGIN+'/'+a['slug']
    for old in list(chan.findall('item')):
        if old.findtext('guid')==url or old.findtext('link')==url: chan.remove(old)
    item=ET.Element('item')
    for k,v in [('title',a['title']['en']),('link',url),('guid',url),('description',a['description']['en']),('pubDate',format_datetime(datetime.fromisoformat(a['published_at']).astimezone(timezone.utc),usegmt=True))]: ET.SubElement(item,k).text=v
    first=next((i for i,x in enumerate(chan) if x.tag=='item'),len(chan));chan.insert(first,item)
    ET.indent(root);path.write_bytes(b'<?xml version="1.0" encoding="UTF-8"?>\n'+ET.tostring(root,encoding='utf-8')+b'\n')

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--now',help='ISO timestamp, for reproducible tests'); parser.add_argument('--dry-run',action='store_true'); args=parser.parse_args()
    now=datetime.fromisoformat(args.now) if args.now else datetime.now(timezone.utc)
    if now.tzinfo is None: raise SystemExit('Timestamp must include timezone')
    articles=json.loads(QUEUE.read_text()); published=[a for a in articles if a['status']=='published']
    if published and (now.astimezone(ZoneInfo('America/New_York')).date()-max(datetime.fromisoformat(a['published_at']).astimezone(ZoneInfo('America/New_York')).date() for a in published)).days < 3:
        print('No publication: minimum three-day interval has not elapsed.'); return
    due=sorted((a for a in articles if a['status']=='scheduled' and datetime.fromisoformat(a['publish_at'])<=now),key=lambda a:a['publish_at'])
    if not due: print('No publication due.'); return
    a=due[0]
    if args.dry_run: print('Would publish: '+a['slug']); return
    path=ROOT/(a['slug']+'.html')
    if path.exists(): raise SystemExit('Refusing to overwrite existing article: '+a['slug'])
    a['published_at']=now.astimezone(ZoneInfo('America/New_York')).isoformat(timespec='seconds'); a['status']='published'
    page=render_article(a); path.write_text(page)
    blog=ROOT/'blog.html'; text=blog.read_text(); marker='<div class="blog-grid reveal" id="blog-grid">'
    if marker not in text: raise SystemExit('Blog insertion marker missing')
    text=text.replace(marker,marker+'\n'+card(a),1); blog.write_text(text)
    sitemap=ROOT/'sitemap.xml'; xml=sitemap.read_text(); url=ORIGIN+'/'+a['slug']
    if f'<loc>{url}</loc>' not in xml: xml=xml.replace('</urlset>',f'  <url><loc>{url}</loc><lastmod>{a["published_at"][:10]}</lastmod></url>\n</urlset>')
    sitemap.write_text(xml)
    share=ROOT/'.github/editorial/sharing'; share.mkdir(exist_ok=True)
    payload={'article_url':url,'published_at':a['published_at'],'google_business_profile':{'status':'prepared_not_posted','button':'LEARN_MORE','url':url+'?utm_source=google&utm_medium=organic&utm_campaign=blog','copy':a['gbp']},'client_email':{'status':'not_sent_automation_unverified','subject':a['title'],'intro':a['description'],'url':url,'sender':'info@meshieldfinancial.com','audience':'Confirmed opted-in subscribers only; honor unsubscribes; use the existing verified automation only.'}}
    (share/(a['slug']+'.json')).write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
    QUEUE.write_text(json.dumps(articles,ensure_ascii=False,indent=2)+'\n'); update_rss(a)
    print('Published one article: '+url)

if __name__=='__main__': main()
