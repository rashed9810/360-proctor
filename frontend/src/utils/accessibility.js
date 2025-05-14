/**
 * Utility functions for accessibility
 * This module provides functions for managing focus, screen reader announcements,
 * and other accessibility features.
 */

/**
 * Create a screen reader announcement
 * @param {string} message - The message to announce
 * @param {string} politeness - The politeness level ('polite' or 'assertive')
 */
export const announceToScreenReader = (message, politeness = 'polite') => {
  // Create a live region if it doesn't exist
  let liveRegion = document.getElementById(`sr-${politeness}`);
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = `sr-${politeness}`;
    liveRegion.setAttribute('aria-live', politeness);
    liveRegion.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.padding = '0';
    liveRegion.style.margin = '-1px';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';
    document.body.appendChild(liveRegion);
  }
  
  // Clear the region first (for some screen readers)
  liveRegion.textContent = '';
  
  // Set the message after a small delay to ensure announcement
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
};

/**
 * Trap focus within an element
 * @param {HTMLElement} element - The element to trap focus within
 * @returns {Function} - A function to remove the trap
 */
export const trapFocus = (element) => {
  if (!element) return () => {};
  
  // Find all focusable elements
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return () => {};
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // Focus the first element
  firstElement.focus();
  
  // Handle keydown events
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      // Shift + Tab on first element should go to last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab on last element should go to first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
    // Close on Escape
    else if (e.key === 'Escape') {
      const closeButton = element.querySelector('[data-close-modal]');
      if (closeButton) {
        closeButton.click();
      }
    }
  };
  
  // Add event listener
  element.addEventListener('keydown', handleKeyDown);
  
  // Return function to remove trap
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Save the current focus and return a function to restore it
 * @returns {Function} - A function to restore focus
 */
export const saveFocus = () => {
  const activeElement = document.activeElement;
  
  return () => {
    if (activeElement && typeof activeElement.focus === 'function') {
      activeElement.focus();
    }
  };
};

/**
 * Create a focus trap for a modal dialog
 * @param {string} modalId - The ID of the modal element
 * @returns {Object} - An object with functions to activate and deactivate the trap
 */
export const createModalFocusTrap = (modalId) => {
  let removeTrap = null;
  let restoreFocus = null;
  
  return {
    activate: () => {
      const modal = document.getElementById(modalId);
      if (!modal) return;
      
      // Save current focus to restore later
      restoreFocus = saveFocus();
      
      // Trap focus in modal
      removeTrap = trapFocus(modal);
    },
    deactivate: () => {
      // Remove trap
      if (removeTrap) {
        removeTrap();
        removeTrap = null;
      }
      
      // Restore focus
      if (restoreFocus) {
        restoreFocus();
        restoreFocus = null;
      }
    }
  };
};

/**
 * Add keyboard navigation to a dropdown menu
 * @param {HTMLElement} triggerElement - The button that triggers the dropdown
 * @param {HTMLElement} menuElement - The dropdown menu element
 */
export const setupDropdownKeyboardNav = (triggerElement, menuElement) => {
  if (!triggerElement || !menuElement) return;
  
  const menuItems = menuElement.querySelectorAll('[role="menuitem"]');
  if (menuItems.length === 0) return;
  
  // Handle keydown on trigger button
  triggerElement.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      
      // Show menu if hidden
      if (menuElement.classList.contains('hidden')) {
        triggerElement.click();
      }
      
      // Focus first menu item
      menuItems[0].focus();
    }
  });
  
  // Handle keydown on menu items
  menuItems.forEach((item, index) => {
    item.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          menuItems[(index + 1) % menuItems.length].focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          menuItems[(index - 1 + menuItems.length) % menuItems.length].focus();
          break;
        case 'Home':
          e.preventDefault();
          menuItems[0].focus();
          break;
        case 'End':
          e.preventDefault();
          menuItems[menuItems.length - 1].focus();
          break;
        case 'Escape':
          e.preventDefault();
          triggerElement.click(); // Close menu
          triggerElement.focus(); // Return focus to trigger
          break;
        case 'Tab':
          // Close menu when tabbing out
          triggerElement.click();
          break;
      }
    });
  });
};
