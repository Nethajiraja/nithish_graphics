import React, { useEffect } from 'react';
import { PageSeoMeta, BusinessInfo } from '../types';

interface HeadSEOProps {
  meta: PageSeoMeta;
  info: BusinessInfo;
}

export const HeadSEO: React.FC<HeadSEOProps> = ({ meta, info }) => {
  useEffect(() => {
    const domain = (info.canonicalDomain || 'https://www.nithishgraphics.com').replace(/\/$/, '');
    const logoUrl = meta.ogImage || `${domain}/assets/nithish-graphics-logo.png`;

    // Set Document Title
    document.title = meta.title;

    // Helper function to set or update meta tags
    const updateMeta = (nameAttr: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper function for link tags
    const updateLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 1. Meta Description
    updateMeta('name', 'description', meta.description);

    // 2. Keywords
    if (meta.keywords && meta.keywords.length > 0) {
      updateMeta('name', 'keywords', meta.keywords.join(', '));
    }

    // 3. Robots meta tag (Strict exclusion on private customer / admin routes)
    if (meta.isPrivate) {
      updateMeta('name', 'robots', 'noindex, nofollow, noarchive');
    } else {
      updateMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // 4. Canonical Link
    updateLink('canonical', meta.canonicalUrl);

    // 5. Open Graph Meta Tags
    updateMeta('property', 'og:site_name', 'Nithish Graphics');
    updateMeta('property', 'og:title', meta.title);
    updateMeta('property', 'og:description', meta.description);
    updateMeta('property', 'og:url', meta.canonicalUrl);
    updateMeta('property', 'og:type', meta.ogType || 'website');
    updateMeta('property', 'og:image', logoUrl);
    updateMeta('property', 'og:locale', 'en_IN');

    // 6. Twitter Card Meta Tags
    updateMeta('name', 'twitter:card', 'summary_large_image');
    updateMeta('name', 'twitter:title', meta.title);
    updateMeta('name', 'twitter:description', meta.description);
    updateMeta('name', 'twitter:image', logoUrl);

    // 7. Google Site Verification Meta Tag
    const gCode = info.googleSiteVerification || ((import.meta as any).env?.VITE_GOOGLE_SITE_VERIFICATION as string);
    if (gCode && gCode.trim()) {
      updateMeta('name', 'google-site-verification', gCode.trim());
    }

    // 8. Structured Data (JSON-LD)
    const existingSchemaScript = document.getElementById('json-ld-schema');
    if (existingSchemaScript) {
      existingSchemaScript.remove();
    }

    if (meta.schema && meta.schema.length > 0 && !meta.isPrivate) {
      const script = document.createElement('script');
      script.id = 'json-ld-schema';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(meta.schema.length === 1 ? meta.schema[0] : meta.schema);
      document.head.appendChild(script);
    }
  }, [meta, info]);

  return null;
};
