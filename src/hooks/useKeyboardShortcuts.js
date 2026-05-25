import { useEffect } from 'react';


function useKeyboardShortcuts({ onClearChat, onShowShortcuts, onToggleSidebar }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                onClearChat();
            }

           
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                onShowShortcuts();
            }

            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                if (onToggleSidebar) onToggleSidebar();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClearChat, onShowShortcuts, onToggleSidebar]);
}

export default useKeyboardShortcuts;
