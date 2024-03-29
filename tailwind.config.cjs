/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "./index.html",
    ],
    theme: {
      fontFamily: {
        'letters': ['courier-new', 'monospace']
      },
      extend: {
        flex: {
          '0.5': '0.5 0.5 0%',  
          '1.5': '1.5 1.5 0%',
        }
      },
    },
    plugins: [],
    // include the following background colors even though they aren't currently used
    // in the project. This is to prevent the colors from being purged from the CSS
    // bundle.
  };
  