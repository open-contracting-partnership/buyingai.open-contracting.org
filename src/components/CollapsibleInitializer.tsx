"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export function CollapsibleInitializer() {
  useEffect(() => {
    // Add click handlers to all collapsible headers
    const handleClick = (event: MouseEvent) => {
      const header = (event.currentTarget as HTMLElement);
      const targetId = header.getAttribute('data-target');
      if (!targetId) return;

      const content = document.getElementById(targetId);
      const icon = header.querySelector('.collapsible-icon');

      if (content && icon) {
        const isOpen = content.classList.contains('open');

        // Save current scroll position before toggling
        const currentScrollY = window.scrollY;

        if (isOpen) {
          content.classList.remove('open');
          content.style.display = 'none';
          icon.classList.remove('open');
        } else {
          content.classList.add('open');
          content.style.display = 'block';
          icon.classList.add('open');
        }

        // Restore scroll position after DOM update
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          window.scrollTo(0, currentScrollY);
        });
      }
    };

    // Use a small delay to ensure ReactMarkdown has finished rendering
    const timer = setTimeout(() => {
      const headers = document.querySelectorAll('.collapsible-header');
      logger.debug(`[Collapsible] Found ${headers.length} collapsible headers`);
      
      headers.forEach(header => {
        header.addEventListener('click', handleClick as EventListener);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      const headers = document.querySelectorAll('.collapsible-header');
      headers.forEach(header => {
        header.removeEventListener('click', handleClick as EventListener);
      });
    };
  }, []);

  return null;
}

