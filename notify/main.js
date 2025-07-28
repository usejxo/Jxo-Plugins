// notify.js
;(function(global) {
  // Prevent double‑loading
  if (global.notify && global.notify._isNotify) return;

  // Internal state
  let container = null;
  const queue = [];

  // Create container when possible
  function getContainer() {
    if (container) return Promise.resolve(container);

    if (!document.body) {
      // Wait for body
      return new Promise(res => {
        document.addEventListener('DOMContentLoaded', () => res(getContainer()), { once: true });
      });
    }

    container = document.createElement('div');
    container.id = 'notify-container';
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '340px',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '12px',
      pointerEvents: 'none'
    });
    document.body.appendChild(container);
    return Promise.resolve(container);
  }

  // Show one notification
  async function show({ title, content, imageUrl, clickJs }) {
    const cont = await getContainer();
    const box = document.createElement('div');
    Object.assign(box.style, {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      minHeight: '80px',
      background: 'rgba(0,0,0,0.8)',
      color: '#fff',
      borderRadius: '6px',
      padding: '14px 16px 14px 10px',
      boxSizing: 'border-box',
      boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
      cursor: clickJs ? 'pointer' : 'default',
      backdropFilter: 'blur(4px)',
      pointerEvents: 'auto',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      opacity: '0',
      transform: 'translateX(120%)'
    });

    // Close button
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '&times;';
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '6px',
      right: '8px',
      fontSize: '16px',
      lineHeight: '16px',
      cursor: 'pointer',
      color: '#ccc',
      padding: '2px'
    });
    closeBtn.addEventListener('mouseover', () => (closeBtn.style.color = '#fff'));
    closeBtn.addEventListener('mouseout', () => (closeBtn.style.color = '#ccc'));
    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      dismiss(box);
    });
    box.appendChild(closeBtn);

    // Optional image
    if (imageUrl) {
      const img = document.createElement('img');
      img.src = imageUrl;
      Object.assign(img.style, {
        width: '50px',
        height: '50px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginRight: '12px'
      });
      box.appendChild(img);
    }

    // Text
    const txt = document.createElement('div');
    txt.style.flex = '1';
    const h = document.createElement('div');
    h.textContent = title;
    Object.assign(h.style, { fontWeight: '600', marginBottom: '6px', fontSize: '15px' });
    const p = document.createElement('div');
    p.textContent = content;
    p.style.fontSize = '14px';
    txt.appendChild(h);
    txt.appendChild(p);
    box.appendChild(txt);

    // Click handler
    if (clickJs) {
      box.addEventListener('click', () => {
        try {
          new Function(clickJs)();
        } catch (err) {
          console.error('notify click handler error:', err);
        }
        dismiss(box);
      });
    }

    cont.appendChild(box);
    requestAnimationFrame(() => {
      box.style.opacity = '1';
      box.style.transform = 'translateX(0)';
    });

    const timeout = setTimeout(() => dismiss(box), 6000);
    function dismiss(el) {
      clearTimeout(timeout);
      el.style.opacity = '0';
      el.style.transform = 'translateX(120%)';
      el.addEventListener('transitionend', () => el.remove());
    }
  }

  // The actual notify function
  function notify(title, content, imageUrl, clickJs) {
    const payload = { title, content, imageUrl, clickJs };
    // If container isn’t ready yet, queue it
    if (!container && document.readyState !== 'complete') {
      queue.push(payload);
    } else {
      show(payload);
    }
  }

  // Mark it so we don’t re‑init
  notify._isNotify = true;

  // Attach to window immediately
  global.notify = notify;

  // Once fully loaded, flush any queued notifications
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      queue.forEach(show);
      queue.length = 0;
    });
  } else {
    queue.forEach(show);
    queue.length = 0;
  }
})(window);
