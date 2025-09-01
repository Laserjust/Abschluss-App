import React from 'react';
import { TextField } from '@mui/material';

// Utility functions for German date/time formatting
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  // Convert to German format DD.MM.YYYY for display
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  // Return ISO format for HTML input (YYYY-MM-DD)
  return d.toISOString().split('T')[0];
};

export const formatTimeForInput = (time) => {
  if (!time) return '';
  
  // If it's already in HH:MM format, return as is
  if (typeof time === 'string' && time.match(/^\d{2}:\d{2}$/)) {
    return time;
  }
  
  // If it's a Date object, extract time
  const d = new Date(time);
  if (!isNaN(d.getTime())) {
    return d.toTimeString().slice(0, 5); // HH:MM
  }
  
  return time;
};

export const parseDateFromInput = (inputValue) => {
  if (!inputValue) return null;
  return new Date(inputValue);
};

export const parseTimeFromInput = (inputValue) => {
  if (!inputValue) return '';
  return inputValue; // Keep as HH:MM string
};

// German Date Input Component
export const GermanDateInput = ({ 
  label, 
  value, 
  onChange, 
  fullWidth = true, 
  required = false,
  error = false,
  helperText = '',
  ...props 
}) => {
  const handleChange = (e) => {
    const date = parseDateFromInput(e.target.value);
    onChange(date);
  };

  return (
    <TextField
      fullWidth={fullWidth}
      label={label}
      type="date"
      value={formatDateForInput(value)}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      required={required}
      error={error}
      helperText={helperText}
      inputProps={{
        placeholder: 'TT.MM.JJJJ'
      }}
      {...props}
    />
  );
};

// German Time Input Component
export const GermanTimeInput = ({ 
  label, 
  value, 
  onChange, 
  fullWidth = true, 
  required = false,
  error = false,
  helperText = '',
  ...props 
}) => {
  const handleChange = (e) => {
    const time = parseTimeFromInput(e.target.value);
    onChange(time);
  };

  return (
    <TextField
      fullWidth={fullWidth}
      label={label}
      type="time"
      value={formatTimeForInput(value)}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      required={required}
      error={error}
      helperText={helperText}
      inputProps={{
        step: 300, // 5 minute steps
        placeholder: 'HH:MM'
      }}
      {...props}
    />
  );
};

// German DateTime Display Component (for read-only display)
export const GermanDateTimeDisplay = ({ date, showTime = false, format = 'short' }) => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(showTime && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  };
  
  return d.toLocaleDateString('de-DE', options);
};

export default {
  GermanDateInput,
  GermanTimeInput,
  GermanDateTimeDisplay,
  formatDateForInput,
  formatTimeForInput,
  parseDateFromInput,
  parseTimeFromInput
};