import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    const toggleTheme = () => {
        console.log('Toggling theme. Current:', isDarkMode);
        setIsDarkMode((prevMode) => !prevMode);
    };

    const theme = {
        isDarkMode,
        colors: {
            background: isDarkMode ? '#121212' : '#F5F5F5',
            text: isDarkMode ? '#FFFFFF' : '#000000',
            primary: isDarkMode ? '#4B2E83' : '#6A5ACD',
            secondary: isDarkMode ? '#2E1A47' : '#E0E0E0',
            card: isDarkMode ? '#1E1E1E' : '#FFFFFF',
            textSecondary: isDarkMode ? '#ccc' : '#666',
        },
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
