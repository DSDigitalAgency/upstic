'use client';

import React, { useId } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TextArea({ 
  label, 
  error, 
  helperText, 
  className = '', 
  id,
  ...props 
}: TextAreaProps) {
  const generatedId = useId();
  const textAreaId = id || generatedId;
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={textAreaId}
          className="block text-sm font-medium text-gray-900"
        >
          {label}
        </label>
      )}
      
      <textarea
        {...props}
        id={textAreaId}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm 
          text-gray-900 placeholder-gray-500 bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
      />
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
} 