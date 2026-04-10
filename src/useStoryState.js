import { useRef, useState, useCallback } from 'react';

export function useStoryState(initial) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('storygenerator-v2');
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });

  const [saved, setSaved] = useState(true);
  const saveTimer = useRef(null);

  const update = useCallback((patch) => {
    setState((prev) => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      clearTimeout(saveTimer.current);
      setSaved(false);
      saveTimer.current = setTimeout(() => {
        localStorage.setItem('storygenerator-v2', JSON.stringify(next));
        setSaved(true);
      }, 600);
      return next;
    });
  }, []);

  // Plain text content (clears any rich HTML override for that field)
  const setContent = useCallback((field, value) => {
    update((prev) => ({
      ...prev,
      content: { ...prev.content, [field]: value },
      contentHtml: { ...(prev.contentHtml || {}), [field]: null },
    }));
  }, [update]);

  // Rich HTML content override (for highlights applied on canvas)
  const setFieldHtml = useCallback((field, html) => {
    update((prev) => ({
      ...prev,
      contentHtml: { ...(prev.contentHtml || {}), [field]: html },
    }));
  }, [update]);

  // Set a layout — resets content and HTML to layout defaults
  const setLayout = useCallback((layoutId, defaultContent) => {
    update(() => ({ ...initial, layoutId, content: defaultContent, contentHtml: {} }));
  }, [update, initial]);

  const setTemplate = useCallback((templateId) => {
    update((prev) => ({ ...prev, templateId }));
  }, [update]);

  const setBg = useCallback((bgData) => {
    update((prev) => ({ ...prev, backgroundImage: bgData }));
  }, [update]);

  const setViewMode = useCallback((viewMode) => {
    update((prev) => ({ ...prev, viewMode }));
  }, [update]);

  // Bullets helpers
  const addBullet = useCallback(() => {
    update((prev) => {
      const bullets = [...(prev.content.bullets || []), ''];
      const bulletsDesc = [...(prev.content.bulletsDesc || []), ''];
      return { ...prev, content: { ...prev.content, bullets, bulletsDesc } };
    });
  }, [update]);

  const removeBullet = useCallback((idx) => {
    update((prev) => {
      const bullets = (prev.content.bullets || []).filter((_, i) => i !== idx);
      const bulletsDesc = (prev.content.bulletsDesc || []).filter((_, i) => i !== idx);
      // Also clean up any HTML overrides for this bullet index
      const contentHtml = { ...(prev.contentHtml || {}) };
      delete contentHtml[`bullet_${idx}`];
      delete contentHtml[`bulletDesc_${idx}`];
      return { ...prev, content: { ...prev.content, bullets, bulletsDesc }, contentHtml };
    });
  }, [update]);

  const setBullet = useCallback((idx, value) => {
    update((prev) => {
      const bullets = [...(prev.content.bullets || [])];
      bullets[idx] = value;
      return {
        ...prev,
        content: { ...prev.content, bullets },
        contentHtml: { ...(prev.contentHtml || {}), [`bullet_${idx}`]: null },
      };
    });
  }, [update]);

  // Bullet description (sub-text below a bullet, toggled by checkbox)
  const setBulletDesc = useCallback((idx, value) => {
    update((prev) => {
      const bulletsDesc = [...(prev.content.bulletsDesc || [])];
      bulletsDesc[idx] = value;
      return { ...prev, content: { ...prev.content, bulletsDesc } };
    });
  }, [update]);

  // Image box helpers
  const setImageBox = useCallback((patch) => {
    update((prev) => ({ ...prev, imageBox: { ...prev.imageBox, ...patch } }));
  }, [update]);

  // Font size helper
  const setSize = useCallback((field, value) => {
    update((prev) => ({ ...prev, sizes: { ...prev.sizes, [field]: value } }));
  }, [update]);

  // Brand logo helper
  const setCustomLogo = useCallback((logoBase64) => {
    update((prev) => ({ ...prev, customLogo: logoBase64 }));
  }, [update]);

  // AI Config helper
  const setAiProp = useCallback((key, value) => {
    update((prev) => ({ ...prev, [key]: value }));
  }, [update]);

  return {
    state,
    update,
    setContent,
    setFieldHtml,
    setLayout,
    setTemplate,
    setBg,
    setViewMode,
    addBullet,
    removeBullet,
    setBullet,
    setBulletDesc,
    setImageBox,
    setSize,
    setCustomLogo,
    setAiProp,
    saved,
  };
}
