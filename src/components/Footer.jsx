import React from 'react';
import { translations } from '../utils/translations';


function Footer({ language }) {
    const t = translations[language] || translations['en'];


    return (
        <footer className="app-footer">
            <p>{t.footer}</p>
        </footer>
    );
}

export default Footer;
