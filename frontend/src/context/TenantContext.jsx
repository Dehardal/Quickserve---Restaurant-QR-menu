import React, { createContext, useContext, useState, useEffect } from 'react';
import { applyBrandTheme } from '../utils/theme';

const TenantContext = createContext();

export const useTenant = () => useContext(TenantContext);

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [isWhiteLabelTenant, setIsWhiteLabelTenant] = useState(false);
  const [tenantLoading, setTenantLoading] = useState(true);
  const [tenantError, setTenantError] = useState(null);

  useEffect(() => {
    const resolveTenantByDomain = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const previewDomain = urlParams.get('previewDomain');
        const previewSlug = urlParams.get('slug');
        const hostname = window.location.hostname;

        // In local development, check if testing with previewDomain or slug
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        const targetDomain = previewDomain || (!isLocal ? hostname : null);
        const targetSlug = previewSlug || null;

        if (!targetDomain && !targetSlug) {
          // Running on localhost or master developer portal without domain override
          setTenant(null);
          setIsWhiteLabelTenant(false);
          setTenantLoading(false);
          return;
        }

        let queryUrl = '/api/restaurant/resolve-domain?';
        if (targetDomain) queryUrl += `domain=${encodeURIComponent(targetDomain)}`;
        if (targetSlug) queryUrl += `&slug=${encodeURIComponent(targetSlug)}`;

        const res = await fetch(queryUrl);
        const data = await res.json();

        if (data.success && data.data) {
          const t = data.data;
          setTenant(t);
          setIsWhiteLabelTenant(true);

          // Apply dynamic custom branding colors & title
          applyBrandTheme(t.branding);
          if (t.name) {
            document.title = `${t.name} | Digital Menu & Orders`;
          }
          if (t.logo) {
            const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = t.logo;
            document.getElementsByTagName('head')[0].appendChild(link);
          }
        } else {
          setTenant(null);
          setIsWhiteLabelTenant(false);
          if (!isLocal) {
            setTenantError(data.message || 'Domain is not mapped to any active restaurant.');
          }
        }
      } catch (err) {
        console.error('Domain tenant resolution error:', err);
        setTenantError('Unable to connect to server for domain lookup.');
      } finally {
        setTenantLoading(false);
      }
    };

    resolveTenantByDomain();
  }, []);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        isWhiteLabelTenant,
        tenantLoading,
        tenantError,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

