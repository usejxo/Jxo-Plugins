// notify.js
installApp("Notify Manual","https://usejxo.github.io/Jxo-Plugins/notify/manual/icon.png","https://usejxo.github.io/Jxo-Plugins/notify/manual/")
(function() {
  // Create (or get) the notification container
  let container = null;
  function getContainer() {
    if (!container) {
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
    }
    return container;
  }

  // Main notify function
  window.notify = function(title, content, imageUrl, clickJs) {
    const box = document.createElement('div');
    box.className = 'notify-box';
    Object.assign(box.style, {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      minHeight: '80px',
      background: 'rgba(0,0,0,0.8)',    // dark, mostly opaque
      color: '#fff',                     // white text
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
    closeBtn.addEventListener('mouseover', () => closeBtn.style.color = '#fff');
    closeBtn.addEventListener('mouseout', () => closeBtn.style.color = '#ccc');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeNotification(box);
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

    // Text container
    const text = document.createElement('div');
    text.style.flex = '1';
    const t = document.createElement('div');
    t.textContent = title;
    Object.assign(t.style, {
      fontWeight: '600',
      marginBottom: '6px',
      fontSize: '15px'
    });
    const c = document.createElement('div');
    c.textContent = content;
    c.style.fontSize = '14px';
    text.appendChild(t);
    text.appendChild(c);
    box.appendChild(text);

    // Click handler for the box
    if (clickJs) {
      box.addEventListener('click', () => {
        try {
          new Function(clickJs)();
        } catch (e) {
          console.error('notify click handler error:', e);
        }
        removeNotification(box);
      });
    }

    // Show and auto‑dismiss
    const cont = getContainer();
    cont.appendChild(box);
    requestAnimationFrame(() => {
      box.style.opacity = '1';
      box.style.transform = 'translateX(0)';
    });

    // Auto‑dismiss after 6s
    const timeout = setTimeout(() => removeNotification(box), 6000);

    // Cleanup
    function removeNotification(el) {
      clearTimeout(timeout);
      el.style.opacity = '0';
      el.style.transform = 'translateX(120%)';
      el.addEventListener('transitionend', () => {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    }
  };
})();
