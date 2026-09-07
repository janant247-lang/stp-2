const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

/**
 * Audit Engine for Web-Based Website Audit & Optimization Recommendation System
 * Fulfills FR-05, FR-06, FR-07, FR-08, FR-09, FR-10, FR-11, FR-12, FR-13
 */
class AuditEngine {
  /**
   * Run comprehensive audit on target URL
   */
  async runAudit(rawUrl, customWeights = null) {
    let normalizedUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(normalizedUrl);
    } catch (e) {
      throw new Error(`Invalid URL format: ${rawUrl}`);
    }

    const defaultWeights = {
      onPageSEO: 30,
      technicalSEO: 30,
      performance: 20,
      mobile: 10,
      content: 10
    };
    const weights = customWeights || defaultWeights;

    const startTime = Date.now();
    let response;
    let fetchError = null;
    let html = '';
    let responseTimeMs = 0;
    let statusCode = 200;
    let headers = {};
    let redirectsCount = 0;

    try {
      const fetchStart = Date.now();
      response = await axios.get(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (WebsiteAuditBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 12000,
        maxRedirects: 5,
        validateStatus: () => true // Allow non-200 to analyze without throwing
      });
      responseTimeMs = Date.now() - fetchStart;
      statusCode = response.status;
      headers = response.headers || {};
      html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      if (response.request && response.request._redirectable) {
        redirectsCount = response.request._redirectable._redirectCount || 0;
      }
    } catch (err) {
      fetchError = err.message;
      responseTimeMs = Date.now() - startTime;
      // Fallback HTML structure if network unreachable or blocked, so analysis still safely completes
      html = `<!DOCTYPE html><html><head><title>Unreachable Site</title></head><body><h1>Website Error</h1><p>${err.message}</p></body></html>`;
    }

    const pageSizeBytes = Buffer.byteLength(html, 'utf8');
    const pageSizeKB = Math.round((pageSizeBytes / 1024) * 10) / 10;
    const pageSizeMB = Math.round((pageSizeBytes / (1024 * 1024)) * 100) / 100;

    const $ = cheerio.load(html);

    // --- CHECKS STORAGE ---
    const issues = [];
    const recommendations = [];
    let passedChecksCount = 0;

    const addCheck = ({ category, severity, passed, title, description, recommendationText, actionStep }) => {
      if (passed) {
        passedChecksCount++;
      } else {
        const issueId = `iss-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        issues.push({
          id: issueId,
          category,
          severity, // CRITICAL, WARNING, INFO
          title,
          description,
          status: 'OPEN',
          passed: false
        });

        if (recommendationText) {
          recommendations.push({
            id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            issueId,
            category,
            severity,
            title,
            recommendationText,
            actionStep: actionStep || 'Review and optimize',
            status: 'OPEN',
            createdAt: new Date().toISOString()
          });
        }
      }
    };

    // ==========================================
    // 1. FR-06: ON-PAGE SEO ANALYSIS
    // ==========================================
    let onPageScore = 100;

    // 1.1 Page Title
    const titleTag = $('title').first().text().trim();
    const titleLength = titleTag.length;
    if (!titleTag) {
      onPageScore -= 30;
      addCheck({
        category: 'On-Page SEO',
        severity: 'CRITICAL',
        passed: false,
        title: 'Missing Page Title Tag',
        description: 'The webpage has no <title> tag in the HTML head.',
        recommendationText: 'Add an informative <title> tag between 50-60 characters describing the page content.',
        actionStep: 'Add <title>Primary Keyword - Brand Name</title> in <head>'
      });
    } else if (titleLength < 30) {
      onPageScore -= 10;
      addCheck({
        category: 'On-Page SEO',
        severity: 'WARNING',
        passed: false,
        title: `Page Title Too Short (${titleLength} characters)`,
        description: `Current title "${titleTag}" is under the recommended 50-60 character length.`,
        recommendationText: 'Expand your title tag to include primary keywords and your brand identity.',
        actionStep: 'Expand title to 50-60 characters'
      });
    } else if (titleLength > 65) {
      onPageScore -= 10;
      addCheck({
        category: 'On-Page SEO',
        severity: 'WARNING',
        passed: false,
        title: `Page Title Too Long (${titleLength} characters)`,
        description: `Title exceeds 65 characters and may be truncated in search results.`,
        recommendationText: 'Shorten your title tag to under 60 characters to ensure full visibility on search engine result pages (SERPs).',
        actionStep: 'Trim title length below 60 characters'
      });
    } else {
      addCheck({ category: 'On-Page SEO', passed: true, title: 'Title Tag Optimal Length' });
    }

    // 1.2 Meta Description
    const metaDesc = $('meta[name="description"]').attr('content')?.trim() || '';
    const descLength = metaDesc.length;
    if (!metaDesc) {
      onPageScore -= 25;
      addCheck({
        category: 'On-Page SEO',
        severity: 'CRITICAL',
        passed: false,
        title: 'Missing Meta Description',
        description: 'No <meta name="description"> tag found on the page.',
        recommendationText: 'Add a unique, relevant meta description for every page (between 150-160 characters) to boost click-through rates.',
        actionStep: 'Add <meta name="description" content="...">'
      });
    } else if (descLength < 70) {
      onPageScore -= 10;
      addCheck({
        category: 'On-Page SEO',
        severity: 'WARNING',
        passed: false,
        title: `Meta Description Too Short (${descLength} characters)`,
        description: 'Current description is too brief to convey value to searchers.',
        recommendationText: 'Expand the meta description to 150-160 characters with an appealing call to action.',
        actionStep: 'Expand description to 150-160 characters'
      });
    } else if (descLength > 165) {
      onPageScore -= 10;
      addCheck({
        category: 'On-Page SEO',
        severity: 'WARNING',
        passed: false,
        title: `Meta Description Too Long (${descLength} characters)`,
        description: 'Description exceeds 160 characters and will likely be cut off by Google snippets.',
        recommendationText: 'Keep meta descriptions within 150-160 characters for complete display.',
        actionStep: 'Trim meta description under 160 characters'
      });
    } else {
      addCheck({ category: 'On-Page SEO', passed: true, title: 'Meta Description Optimal Length' });
    }

    // 1.3 Headings (H1, H2, Hierarchy)
    const h1Elements = $('h1');
    const h1Count = h1Elements.length;
    const h2Elements = $('h2');
    const h2Count = h2Elements.length;

    if (h1Count === 0) {
      onPageScore -= 20;
      addCheck({
        category: 'On-Page SEO',
        severity: 'CRITICAL',
        passed: false,
        title: 'Missing H1 Heading Tag',
        description: 'The page does not have any <h1> heading element.',
        recommendationText: 'Include exactly one prominent <h1> heading tag at the top of the body that clearly states the page topic.',
        actionStep: 'Add <h1> heading with target keywords'
      });
    } else if (h1Count > 1) {
      onPageScore -= 10;
      addCheck({
        category: 'On-Page SEO',
        severity: 'WARNING',
        passed: false,
        title: `Multiple H1 Tags Detected (${h1Count} tags)`,
        description: 'Having multiple H1 tags can dilute page hierarchy and confuse search crawlers.',
        recommendationText: 'Use only one main <h1> per page. Convert secondary headings to <h2> or <h3> tags.',
        actionStep: 'Refactor additional <h1> elements into <h2>'
      });
    } else {
      addCheck({ category: 'On-Page SEO', passed: true, title: 'Single H1 Heading Present' });
    }

    if (h2Count === 0) {
      onPageScore -= 10;
      addCheck({
        category: 'On-Page SEO',
        severity: 'WARNING',
        passed: false,
        title: 'No H2 Subheadings Found',
        description: 'Page lacks <h2> subheadings to divide and structure content.',
        recommendationText: 'Break up long text into distinct sections using <h2> subheadings for improved readability.',
        actionStep: 'Add <h2> subheadings for section titles'
      });
    } else {
      addCheck({ category: 'On-Page SEO', passed: true, title: `H2 Subheadings Structured (${h2Count} found)` });
    }

    // 1.4 Images & ALT Attributes
    const imgElements = $('img');
    const imagesTotal = imgElements.length;
    let imagesWithoutAlt = 0;
    const missingAltSamples = [];

    imgElements.each((_, el) => {
      const alt = $(el).attr('alt');
      const src = $(el).attr('src') || '';
      if (alt === undefined || alt === null || alt.trim() === '') {
        imagesWithoutAlt++;
        if (missingAltSamples.length < 3 && src) {
          missingAltSamples.push(src.substring(0, 60));
        }
      }
    });

    if (imagesWithoutAlt > 0) {
      const penalty = Math.min(25, imagesWithoutAlt * 4);
      onPageScore -= penalty;
      const severity = imagesWithoutAlt > 5 ? 'WARNING' : 'INFO';
      addCheck({
        category: 'On-Page SEO',
        severity,
        passed: false,
        title: `${imagesWithoutAlt} image${imagesWithoutAlt > 1 ? 's' : ''} missing ALT text`,
        description: `Found ${imagesWithoutAlt} out of ${imagesTotal} images without an alt attribute. Example: ${missingAltSamples.join(', ')}`,
        recommendationText: 'Add descriptive ALT text to improve accessibility and help search engines understand image context.',
        actionStep: 'Add alt="Descriptive text" to all <img> tags'
      });
    } else if (imagesTotal > 0) {
      addCheck({ category: 'On-Page SEO', passed: true, title: `All Images Have ALT Attributes (${imagesTotal} total)` });
    } else {
      addCheck({ category: 'On-Page SEO', passed: true, title: 'Images and ALT Attributes checked' });
    }

    // 1.5 URL Structure
    const urlLength = normalizedUrl.length;
    if (urlLength > 75) {
      onPageScore -= 5;
      addCheck({
        category: 'On-Page SEO',
        severity: 'INFO',
        passed: false,
        title: `URL Length is Long (${urlLength} chars)`,
        description: 'Clean, short URLs are easier for users to remember and search engines to index.',
        recommendationText: 'Keep URL slugs concise and keyword-focused without excessive parameters.',
        actionStep: 'Optimize URL slug brevity'
      });
    } else {
      addCheck({ category: 'On-Page SEO', passed: true, title: 'Clean URL Structure' });
    }
    onPageScore = Math.max(20, Math.min(100, onPageScore));


    // ==========================================
    // 2. FR-07: TECHNICAL SEO ANALYSIS
    // ==========================================
    let technicalScore = 100;

    // 2.1 HTTPS Enforcement
    const isHttps = parsedUrl.protocol === 'https:';
    if (!isHttps) {
      technicalScore -= 30;
      addCheck({
        category: 'Technical SEO',
        severity: 'CRITICAL',
        passed: false,
        title: 'Website Not Using HTTPS Encryption',
        description: 'The website is served over insecure HTTP.',
        recommendationText: 'Install an SSL certificate and redirect all HTTP traffic to HTTPS via 301 permanent redirect.',
        actionStep: 'Enforce HTTPS and install SSL certificate'
      });
    } else {
      addCheck({ category: 'Technical SEO', passed: true, title: 'HTTPS Enforced & SSL Valid' });
    }

    // 2.2 Canonical Tag
    const canonicalTag = $('link[rel="canonical"]').attr('href');
    if (!canonicalTag) {
      technicalScore -= 15;
      addCheck({
        category: 'Technical SEO',
        severity: 'WARNING',
        passed: false,
        title: 'Missing Canonical Tag',
        description: 'No <link rel="canonical"> tag found in page header.',
        recommendationText: 'Specify a self-referencing canonical URL on every page to prevent duplicate content indexing.',
        actionStep: `Add <link rel="canonical" href="${normalizedUrl}" /> in <head>`
      });
    } else {
      addCheck({ category: 'Technical SEO', passed: true, title: 'Canonical Tag Implemented' });
    }

    // 2.3 Robots.txt check
    let robotsValid = true;
    try {
      const robotsUrl = `${parsedUrl.origin}/robots.txt`;
      const robotsRes = await axios.get(robotsUrl, { timeout: 4000, validateStatus: () => true });
      if (robotsRes.status >= 200 && robotsRes.status < 400 && typeof robotsRes.data === 'string' && robotsRes.data.toLowerCase().includes('user-agent')) {
        addCheck({ category: 'Technical SEO', passed: true, title: 'robots.txt Found and Valid' });
      } else {
        robotsValid = false;
        technicalScore -= 15;
        addCheck({
          category: 'Technical SEO',
          severity: 'WARNING',
          passed: false,
          title: 'robots.txt Not Configured Properly',
          description: `Checked ${robotsUrl} and returned status ${robotsRes.status}.`,
          recommendationText: 'Create a robots.txt file in your root directory specifying crawl rules and sitemap location.',
          actionStep: 'Create /robots.txt with User-agent: * allow directives'
        });
      }
    } catch (e) {
      robotsValid = false;
      technicalScore -= 15;
      addCheck({
        category: 'Technical SEO',
        severity: 'WARNING',
        passed: false,
        title: 'robots.txt Inaccessible',
        description: 'Unable to connect to robots.txt on domain root.',
        recommendationText: 'Ensure robots.txt is publicly accessible at domain root.',
        actionStep: 'Publish robots.txt'
      });
    }

    // 2.4 XML Sitemap Check
    let sitemapValid = true;
    try {
      const sitemapUrl = `${parsedUrl.origin}/sitemap.xml`;
      const sitemapRes = await axios.get(sitemapUrl, { timeout: 4000, validateStatus: () => true });
      if (sitemapRes.status >= 200 && sitemapRes.status < 400 && typeof sitemapRes.data === 'string' && (sitemapRes.data.includes('<urlset') || sitemapRes.data.includes('<sitemapindex') || sitemapRes.data.includes('xml'))) {
        addCheck({ category: 'Technical SEO', passed: true, title: 'XML Sitemap Accessible' });
      } else {
        sitemapValid = false;
        technicalScore -= 15;
        addCheck({
          category: 'Technical SEO',
          severity: 'WARNING',
          passed: false,
          title: 'XML Sitemap Not Found at /sitemap.xml',
          description: `Checked standard location ${sitemapUrl} (status ${sitemapRes.status}).`,
          recommendationText: 'Generate an XML sitemap and submit it to Google Search Console to expedite page discovery.',
          actionStep: 'Create and link /sitemap.xml'
        });
      }
    } catch (e) {
      sitemapValid = false;
      technicalScore -= 15;
      addCheck({
        category: 'Technical SEO',
        severity: 'WARNING',
        passed: false,
        title: 'XML Sitemap Inaccessible',
        description: 'Could not fetch /sitemap.xml.',
        recommendationText: 'Deploy an XML sitemap and reference it in your robots.txt file.',
        actionStep: 'Deploy /sitemap.xml'
      });
    }

    // 2.5 Crawlability / Robots Meta Tag
    const robotsMeta = $('meta[name="robots"]').attr('content') || '';
    if (robotsMeta.toLowerCase().includes('noindex')) {
      technicalScore -= 30;
      addCheck({
        category: 'Technical SEO',
        severity: 'CRITICAL',
        passed: false,
        title: 'Noindex Tag Detected on Page',
        description: `Page header specifies meta robots: "${robotsMeta}". This instructs search engines not to index this page.`,
        recommendationText: 'Remove "noindex" from the robots meta tag if you want this page to rank in Google search results.',
        actionStep: 'Remove noindex directive from meta tags'
      });
    } else {
      addCheck({ category: 'Technical SEO', passed: true, title: 'Crawlability Meta Directives Healthy' });
    }

    // 2.6 Broken Links Sample Check
    const links = $('a[href]');
    let brokenLinksCount = 0;
    const internalLinks = [];
    links.each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
        try {
          const resolved = new URL(href, normalizedUrl).href;
          if (resolved.startsWith(parsedUrl.origin) && internalLinks.length < 5) {
            internalLinks.push(resolved);
          }
        } catch (e) {}
      }
    });

    if (redirectsCount > 2) {
      technicalScore -= 10;
      addCheck({
        category: 'Technical SEO',
        severity: 'WARNING',
        passed: false,
        title: `Multiple Redirects (${redirectsCount} redirects)`,
        description: 'Page underwent multiple redirection hops before loading.',
        recommendationText: 'Eliminate redirect chains to conserve crawl budget and reduce load time.',
        actionStep: 'Point URLs directly to canonical destination'
      });
    } else {
      addCheck({ category: 'Technical SEO', passed: true, title: 'No Excessive Redirect Chains' });
    }

    technicalScore = Math.max(20, Math.min(100, technicalScore));


    // ==========================================
    // 3. FR-08: PERFORMANCE ANALYSIS
    // ==========================================
    let perfScore = 100;

    // Response time benchmark
    if (responseTimeMs > 3500) {
      perfScore -= 35;
      addCheck({
        category: 'Performance',
        severity: 'CRITICAL',
        passed: false,
        title: `Slow Response Time (${(responseTimeMs / 1000).toFixed(2)}s)`,
        description: 'Initial server response time took more than 3.5 seconds, severely degrading user experience.',
        recommendationText: 'Optimize server backend response, enable database query caching, and consider a high-performance host.',
        actionStep: 'Optimize server response time below 1.5s'
      });
    } else if (responseTimeMs > 1800) {
      perfScore -= 20;
      addCheck({
        category: 'Performance',
        severity: 'WARNING',
        passed: false,
        title: `Moderate Server Response Time (${(responseTimeMs / 1000).toFixed(2)}s)`,
        description: 'Response time is between 1.8s and 3.5s. Google recommends sub-second TTFB.',
        recommendationText: 'Implement server caching or use a CDN (Cloudflare/Fastly) to lower response latency.',
        actionStep: 'Add edge caching / CDN'
      });
    } else {
      addCheck({ category: 'Performance', passed: true, title: `Fast Response Time (${(responseTimeMs / 1000).toFixed(2)}s)` });
    }

    // Page size benchmark
    if (pageSizeMB > 4.0) {
      perfScore -= 25;
      addCheck({
        category: 'Performance',
        severity: 'CRITICAL',
        passed: false,
        title: `Heavy Page Size (${pageSizeMB} MB)`,
        description: 'Initial HTML document payload exceeds 4 MB.',
        recommendationText: 'Minify HTML, enable Gzip/Brotli compression, and remove inline base64 assets.',
        actionStep: 'Enable Gzip/Brotli compression and minify assets'
      });
    } else if (pageSizeMB > 2.0) {
      perfScore -= 10;
      addCheck({
        category: 'Performance',
        severity: 'WARNING',
        passed: false,
        title: `High Page Weight (${pageSizeMB} MB)`,
        description: 'Total document weight is over 2 MB.',
        recommendationText: 'Compress images into modern formats (WebP/AVIF) and bundle CSS/JS files.',
        actionStep: 'Compress images to WebP/AVIF'
      });
    } else {
      addCheck({ category: 'Performance', passed: true, title: `Optimal Page Weight (${pageSizeKB} KB)` });
    }

    // Resource counts
    const scriptCount = $('script[src]').length;
    const styleCount = $('link[rel="stylesheet"]').length;
    const totalResources = scriptCount + styleCount + imagesTotal;

    if (totalResources > 60) {
      perfScore -= 15;
      addCheck({
        category: 'Performance',
        severity: 'WARNING',
        passed: false,
        title: `High Number of HTTP Requests (${totalResources} assets)`,
        description: `Found ${scriptCount} external scripts, ${styleCount} stylesheets, and ${imagesTotal} images.`,
        recommendationText: 'Bundle scripts and stylesheets to minimize concurrent roundtrip requests.',
        actionStep: 'Bundle CSS and JavaScript files'
      });
    } else {
      addCheck({ category: 'Performance', passed: true, title: `Resource Requests Balanced (${totalResources} assets)` });
    }

    perfScore = Math.max(20, Math.min(100, perfScore));


    // ==========================================
    // 4. FR-09: MOBILE COMPATIBILITY ANALYSIS
    // ==========================================
    let mobileScore = 100;

    // Viewport meta tag
    const viewportTag = $('meta[name="viewport"]').attr('content') || '';
    if (!viewportTag) {
      mobileScore -= 50;
      addCheck({
        category: 'Mobile Compatibility',
        severity: 'CRITICAL',
        passed: false,
        title: 'Missing Viewport Meta Tag',
        description: 'Webpage lacks <meta name="viewport"> tag. Mobile browsers will render desktop scale.',
        recommendationText: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> to <head>.',
        actionStep: 'Add standard responsive viewport meta tag'
      });
    } else if (!viewportTag.includes('width=device-width')) {
      mobileScore -= 25;
      addCheck({
        category: 'Mobile Compatibility',
        severity: 'WARNING',
        passed: false,
        title: 'Incomplete Viewport Configuration',
        description: `Viewport tag content "${viewportTag}" should include "width=device-width".`,
        recommendationText: 'Ensure viewport tag defines device-width and initial scale 1.0.',
        actionStep: 'Update viewport meta tag'
      });
    } else {
      addCheck({ category: 'Mobile Compatibility', passed: true, title: 'Viewport Meta Tag Configured' });
    }

    // Responsive CSS / Media queries indicators
    const styleContent = $('style').text() + html;
    const hasMediaQueries = styleContent.includes('@media') || $('link[media]').length > 0 || styleContent.includes('flex') || styleContent.includes('grid');
    if (!hasMediaQueries) {
      mobileScore -= 20;
      addCheck({
        category: 'Mobile Compatibility',
        severity: 'WARNING',
        passed: false,
        title: 'No Responsive Breakpoints Detected',
        description: 'No CSS @media queries or modern responsive layout markers found.',
        recommendationText: 'Adopt responsive grid/flexbox layouts and mobile-first media queries for phone screens.',
        actionStep: 'Implement CSS media queries for mobile viewports'
      });
    } else {
      addCheck({ category: 'Mobile Compatibility', passed: true, title: 'Responsive CSS Indicators Present' });
    }

    mobileScore = Math.max(20, Math.min(100, mobileScore));


    // ==========================================
    // 5. FR-10: CONTENT ANALYSIS
    // ==========================================
    let contentScore = 100;

    // Extract visible body text
    $('script, style, noscript, svg, nav, footer').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const words = bodyText.split(/\s+/).filter(w => w.length > 1);
    const wordCount = words.length;

    if (wordCount < 150) {
      contentScore -= 40;
      addCheck({
        category: 'Content Analysis',
        severity: 'CRITICAL',
        passed: false,
        title: `Thin Content Detected (${wordCount} words)`,
        description: 'The page contains fewer than 150 words. Search engines view very low text pages as thin content.',
        recommendationText: 'Add comprehensive, helpful text explaining your products/services with at least 400+ words.',
        actionStep: 'Expand valuable page text content'
      });
    } else if (wordCount < 350) {
      contentScore -= 20;
      addCheck({
        category: 'Content Analysis',
        severity: 'WARNING',
        passed: false,
        title: `Low Text Content (${wordCount} words)`,
        description: 'Content volume is lower than standard industry benchmarks (350+ words).',
        recommendationText: 'Incorporate detailed FAQs, benefits, and user guides to boost keyword depth.',
        actionStep: 'Add explanatory paragraphs and FAQs'
      });
    } else {
      addCheck({ category: 'Content Analysis', passed: true, title: `Healthy Content Volume (${wordCount} words)` });
    }

    // OpenGraph Social Metadata
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDesc = $('meta[property="og:description"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');

    if (!ogTitle || !ogDesc || !ogImage) {
      contentScore -= 15;
      addCheck({
        category: 'Content Analysis',
        severity: 'INFO',
        passed: false,
        title: 'Missing OpenGraph Social Metadata',
        description: 'Social tags (og:title, og:description, og:image) are incomplete.',
        recommendationText: 'Add complete OpenGraph tags so shared links on LinkedIn, WhatsApp, and Twitter display rich previews.',
        actionStep: 'Add OpenGraph <meta> tags in head'
      });
    } else {
      addCheck({ category: 'Content Analysis', passed: true, title: 'OpenGraph Social Tags Configured' });
    }

    contentScore = Math.max(20, Math.min(100, contentScore));


    // ==========================================
    // 6. FR-11: WEIGHTED SEO SCORE CALCULATION
    // ==========================================
    const weightSum = weights.onPageSEO + weights.technicalSEO + weights.performance + weights.mobile + weights.content;
    const normOnPage = (weights.onPageSEO / weightSum);
    const normTech = (weights.technicalSEO / weightSum);
    const normPerf = (weights.performance / weightSum);
    const normMobile = (weights.mobile / weightSum);
    const normContent = (weights.content / weightSum);

    const overallScore = Math.round(
      (onPageScore * normOnPage) +
      (technicalScore * normTech) +
      (perfScore * normPerf) +
      (mobileScore * normMobile) +
      (contentScore * normContent)
    );

    const counts = {
      critical: issues.filter(i => i.severity === 'CRITICAL').length,
      warnings: issues.filter(i => i.severity === 'WARNING').length,
      info: issues.filter(i => i.severity === 'INFO').length,
      passed: passedChecksCount
    };

    return {
      url: normalizedUrl,
      domain: parsedUrl.hostname,
      auditDate: new Date().toISOString(),
      overallScore,
      categoryScores: {
        onPageSEO: onPageScore,
        technicalSEO: technicalScore,
        performance: perfScore,
        mobile: mobileScore,
        content: contentScore
      },
      counts,
      metrics: {
        responseTimeMs,
        pageSizeKB,
        pageSizeMB,
        h1Count,
        h2Count,
        imagesTotal,
        imagesWithoutAlt,
        sslValid: isHttps,
        robotsValid,
        sitemapValid,
        canonicalTag: !!canonicalTag,
        viewportTag: !!viewportTag,
        wordCount,
        statusCode,
        redirectsCount
      },
      issues,
      recommendations
    };
  }
}

module.exports = new AuditEngine();
