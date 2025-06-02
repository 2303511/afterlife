// src/pages/LoginPage.js
import React from 'react';
import LoginForm from '../components/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="w-1/2 bg-gray-100 hidden md:block">
        {/* Add your logo or image here */}
        <div className="h-full flex items-center justify-center">
          <h1 className="text-4xl font-bold text-gray-400">Afterlife</h1>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <LoginForm />
      </div>
    </div>
  );
}
