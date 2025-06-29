export const validateFormData = (formData, rules, labels) => {
    const newErrors = {};
  
    Object.keys(rules).forEach((field) => {
      const rule = rules[field];
      const value = formData[field]?.trim?.() || formData[field];
  
      if (rule.required && !value) {
        newErrors[field] = `${labels[field] || field} is required`;
      } else if (rule.pattern && value && !rule.pattern.test(value)) {
        newErrors[field] = rule.message || `${labels[field] || field} is invalid`;
      }
    });
  
    return newErrors;
  };
  