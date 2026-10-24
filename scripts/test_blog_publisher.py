import contextlib
import io
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import publish_blog as publisher

class PublicationRules(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.root=Path(self.temp.name)/'site'
        shutil.copytree(publisher.ROOT,self.root,ignore=shutil.ignore_patterns('.git','__pycache__'))
        self.queue=self.root/'.github/editorial/articles.json'
        self.initial=json.loads(self.queue.read_text())
        from datetime import datetime,timedelta
        from zoneinfo import ZoneInfo
        base=datetime(2026,10,24,9,tzinfo=ZoneInfo('America/New_York'))
        for i,a in enumerate(self.initial): a['publish_at']=(base+timedelta(days=i*3)).isoformat()
        self.first=self.initial[0]['publish_at']
    def tearDown(self): self.temp.cleanup()
    def run_at(self, now):
        with patch.object(publisher,'ROOT',self.root),patch.object(publisher,'QUEUE',self.queue),patch.object(sys,'argv',['publish_blog','--now',now]),contextlib.redirect_stdout(io.StringIO()): publisher.main()
    def reset_schedule(self):
        for a in self.initial:
            a['status']='scheduled';a.pop('published_at',None)
            (self.root/(a['slug']+'.html')).unlink(missing_ok=True)
        self.queue.write_text(json.dumps(self.initial))
        import re
        blog=self.root/'blog.html'; text=blog.read_text()
        for a in self.initial:
            text=re.sub(r'<article\b[^>]*>.*?</article>',lambda m: '' if 'href="/'+a['slug']+'"' in m.group() else m.group(),text,flags=re.S)
        blog.write_text(text)
        tree=publisher.ET.parse(self.root/'rss.xml');chan=tree.getroot().find('channel')
        queued={publisher.ORIGIN+'/'+a['slug'] for a in self.initial}
        for item in list(chan.findall('item')):
            if item.findtext('link') in queued: chan.remove(item)
        tree.write(self.root/'rss.xml',encoding='utf-8',xml_declaration=True)
    def test_no_early_release(self):
        self.reset_schedule(); self.run_at('2026-10-24T08:59:00-04:00')
        self.assertFalse((self.root/(self.initial[0]['slug']+'.html')).exists())
    def test_one_release_and_idempotency(self):
        self.reset_schedule()
        previous_items=len(publisher.ET.parse(self.root/'rss.xml').findall('./channel/item'))
        self.run_at('2026-10-24T09:00:00-04:00')
        self.assertEqual(len(publisher.ET.parse(self.root/'rss.xml').findall('./channel/item')),previous_items+1)
        page=self.root/(self.initial[0]['slug']+'.html')
        self.assertTrue(page.exists());before=page.read_bytes()
        self.run_at('2026-10-24T10:00:00-04:00');self.assertEqual(page.read_bytes(),before)
        records=json.loads(self.queue.read_text());self.assertEqual(sum(a['status']=='published' for a in records),1)
        for a in records[1:]:
            self.assertFalse((self.root/(a['slug']+'.html')).exists())
            self.assertNotIn(a['slug'],(self.root/'rss.xml').read_text())
            self.assertNotIn(a['slug'],(self.root/'sitemap.xml').read_text())
        self.assertIn('BlogPosting',page.read_text());self.assertIn('data-ht',page.read_text())
    def test_three_day_boundary_and_backlog(self):
        self.reset_schedule();self.run_at('2026-10-24T09:00:00-04:00')
        self.run_at('2026-10-26T23:59:00-04:00')
        self.assertEqual(sum(a['status']=='published' for a in json.loads(self.queue.read_text())),1)
        self.run_at('2026-11-02T09:00:00-05:00')
        self.assertEqual(sum(a['status']=='published' for a in json.loads(self.queue.read_text())),2)
        self.run_at('2026-11-02T10:00:00-05:00')
        self.assertEqual(sum(a['status']=='published' for a in json.loads(self.queue.read_text())),2)
    def test_every_article_renders_with_sources_and_schema(self):
        import re
        for a in self.initial:
            a['published_at']=a['publish_at']
            page=publisher.render_article(a)
            schema=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',page,re.S).group(1))
            self.assertEqual(schema['@type'],'BlogPosting')
            self.assertGreaterEqual(len(schema['citation']),1)
            self.assertIn(a['title']['ht'],page)
            self.assertGreaterEqual(len(a['sections']),5)

    def test_schedule_has_two_per_category_and_dst(self):
        from collections import Counter
        from datetime import datetime
        counts=Counter(a['category'] for a in self.initial)
        self.assertEqual(set(counts.values()),{2});self.assertEqual(len(counts),7)
        dates=[datetime.fromisoformat(a['publish_at']) for a in self.initial]
        self.assertTrue(all((b.date()-a.date()).days==3 for a,b in zip(dates,dates[1:])))
        self.assertEqual(dates[2].utcoffset().total_seconds(),-14400)
        self.assertEqual(dates[3].utcoffset().total_seconds(),-18000)

if __name__=='__main__': unittest.main()
