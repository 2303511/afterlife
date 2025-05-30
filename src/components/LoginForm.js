// src/components/LoginForm.js
import React from 'react';

export default function LoginForm() {
  return (
    <div className="max-w-sm w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Login to Afterlife</h2>
        <p className="text-sm text-gray-500">Enter your credentials to access your account</p>
      </div>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="text-right">
          <a href="#" className="text-sm text-indigo-500 hover:underline">
            Forgot your password?
          </a>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md"
        >
          Login
        </button>
      </form>
    </div>
  );
}
