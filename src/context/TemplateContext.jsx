import { createContext, useState, useContext } from 'react';
import { TEMPLATES } from '../config/templates';

const TemplateContext = createContext();

export function TemplateProvider({ children }) {
  // Default to null, so the app knows it needs to show the picker
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <TemplateContext.Provider value={{ selectedTemplate, setSelectedTemplate }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  return useContext(TemplateContext);
}
