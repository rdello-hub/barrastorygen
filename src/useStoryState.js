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

  const setContent = useCallback((field, value) => {
    update((prev) => ({ ...prev, content: { ...prev.content, [field]: value } }));
  }, [update]);

  // Set a layout — resets content to layout defaults
  const setLayout = useCallback((layoutId, defaultContent) => {
    update(() => ({ ...initial, layoutId, content: defaultContent }));
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
      return { ...prev, content: { ...prev.content, bullets } };
    });
  }, [update]);

  const removeBullet = useCallback((idx) => {
    update((prev) => {
      const bullets = (prev.content.bullets || []).filter((_, i) => i !== idx);
      return { ...prev, content: { ...prev.content, bullets } };
    });
  }, [update]);

  const setBullet = useCallback((idx, value) => {
    update((prev) => {
      const bullets = [...(prev.content.bullets || [])];
      bullets[idx] = value;
      return { ...prev, content: { ...prev.content, bullets } };
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

  // AI API Key helper
  const setApiKey = useCallback((key) => {
    update((prev) => ({ ...prev, groqApiKey: key }));
  }, [update]);

  return {
    state,
    update,
    setContent,
    setLayout,
    setTemplate,
    setBg,
    setViewMode,
    addBullet,
    removeBullet,
    setBullet,
    setImageBox,
    setSize,
    setCustomLogo,
    setApiKey,
    saved,
  };
}
