import React, { createContext, useState, useContext } from 'react';

// Create the context
const ScoreContext = createContext();

export const useScore = () => {
    return useContext(ScoreContext);
};

export const ScoreProvider = ({ children }) => {
    const [maxScore, setMaxScore] = useState(50); // Default value

    return (
        <ScoreContext.Provider value={{ maxScore, setMaxScore }}>
            {children}
        </ScoreContext.Provider>
    );
};
