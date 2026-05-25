import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';


function Footer() {
    const { t } = useLanguage();


    return (
        <footer className="app-footer">
            <p>{t.footer}</p>
        </footer>
    );
}

export default Footer;
