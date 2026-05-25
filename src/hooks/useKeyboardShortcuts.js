import { useEffect } from 'react';


function useKeyboardShortcuts({ onClearChat, onShowShortcuts }) {
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
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClearChat, onShowShortcuts]);
}

export default useKeyboardShortcuts;
