import { useEffect, useRef, useCallback } from 'react';
import { 
  announceToScreenReader, 
  trapFocus, 
  saveFocus 
} from '../utils/accessibility';

/**
 * Custom hook for managing accessibility features
 * @param {Object} options - Configuration options
 * @param {boolean} options.trapFocus - Whether to trap focus within the element
 * @param {boolean} options.restoreFocus - Whether to restore focus when unmounting
 * @param {string} options.announcement - Message to announce to screen readers
 * @param {string} options.announcementPoliteness - Politeness level for announcement ('polite' or 'assertive')
 * @returns {Object} - Accessibility utilities and ref
 */
const useAccessibility = ({
  trapFocus: shouldTrapFocus = false,
  restoreFocus: shouldRestoreFocus = false,
  announcement = '',
  announcementPoliteness = 'polite'
} = {}) => {
  const elementRef = useRef(null);
  const removeTrapRef = useRef(null);
  const restoreFocusRef = useRef(null);
  
  // Announce message to screen readers
  const announce = useCallback((message, politeness = announcementPoliteness) => {
    announceToScreenReader(message, politeness);
  }, [announcementPoliteness]);
  
  // Set up focus trap and announcement on mount
  useEffect(() => {
    const element = elementRef.current;
    
    // Make announcement if provided
    if (announcement) {
      announce(announcement);
    }
    
    // Set up focus trap if requested
    if (shouldTrapFocus && element) {
      // Save current focus to restore later if requested
      if (shouldRestoreFocus) {
        restoreFocusRef.current = saveFocus();
      }
      
      // Trap focus within element
      removeTrapRef.current = trapFocus(element);
    }
    
    // Clean up on unmount
    return () => {
      // Remove focus trap
      if (removeTrapRef.current) {
        removeTrapRef.current();
        removeTrapRef.current = null;
      }
      
      // Restore focus
      if (shouldRestoreFocus && restoreFocusRef.current) {
        restoreFocusRef.current();
        restoreFocusRef.current = null;
      }
    };
  }, [shouldTrapFocus, shouldRestoreFocus, announcement, announce]);
  
  return {
    ref: elementRef,
    announce,
  };
};

export default useAccessibility;
