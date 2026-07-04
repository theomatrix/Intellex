import asyncio
from urllib.parse import urljoin, urlparse
import httpx
from selectolax.parser import HTMLParser

class Scraper:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=10.0, follow_redirects=True)
        self.allowed_paths = ['/', 'about', 'products', 'services', 'solutions', 'pricing', 'contact']
        self.ignored_paths = ['login', 'signup', 'privacy', 'cookies', 'terms', 'careers', 'blog']

    async def close(self):
        await self.client.aclose()

    def clean_text(self, html: str) -> str:
        """Extract clean text from HTML using selectolax."""
        tree = HTMLParser(html)
        # Remove script, style, meta, noscript tags
        for tag in tree.css('script, style, meta, noscript, link, svg, img'):
            tag.decompose()
        
        text = tree.text(separator=' ', strip=True)
        # Remove extra whitespace
        return ' '.join(text.split())

    def should_crawl(self, url: str, base_domain: str) -> bool:
        """Check if a URL should be crawled based on the assignment rules."""
        parsed = urlparse(url)
        
        # Must be same domain
        if parsed.netloc and parsed.netloc != base_domain:
            return False
            
        path = parsed.path.lower().strip('/')
        
        # Exact match or starts with one of the allowed paths
        is_allowed = False
        if not path:
            is_allowed = True
        else:
            for allowed in self.allowed_paths:
                if allowed != '/' and (path == allowed or path.startswith(allowed + '/')):
                    is_allowed = True
                    break
                    
        # Exclude ignored paths
        for ignored in self.ignored_paths:
            if ignored in path:
                return False
                
        return is_allowed

    async def fetch_page(self, url: str) -> dict:
        """Fetch a single page and return its text and links."""
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            
            tree = HTMLParser(response.text)
            links = []
            for node in tree.css('a'):
                href = node.attributes.get('href')
                if href and not href.startswith(('mailto:', 'tel:', 'javascript:', '#')):
                    links.append(urljoin(url, href))
                    
            return {
                "url": url,
                "text": self.clean_text(response.text),
                "links": list(set(links))
            }
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return {"url": url, "text": "", "links": []}

    async def crawl(self, start_url: str, max_pages: int = 5) -> dict:
        """Crawl the website starting from start_url."""
        parsed_start = urlparse(start_url)
        base_domain = parsed_start.netloc
        
        visited = set()
        to_visit = [start_url]
        crawled_data = []
        
        while to_visit and len(visited) < max_pages:
            url = to_visit.pop(0)
            
            # Normalize url to prevent duplicate crawling
            normalized_url = url.rstrip('/')
            if normalized_url in visited:
                continue
                
            visited.add(normalized_url)
            
            page_data = await self.fetch_page(url)
            if page_data["text"]:
                crawled_data.append({
                    "url": url,
                    "content": page_data["text"][:3000] # Cap text length per page to avoid massive tokens
                })
                
            for link in page_data["links"]:
                normalized_link = link.rstrip('/')
                if normalized_link not in visited and self.should_crawl(link, base_domain):
                    to_visit.append(link)
                    
            # Be polite
            await asyncio.sleep(0.5)
            
        return {
            "website": start_url,
            "pages_crawled": len(crawled_data),
            "data": crawled_data
        }
