tailwind.config = {
  theme: {
    extend: {
      colors: {
        lightblue: "#E6F3FF",
        darkblue: "#3498db",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      animation: {
        gradient: "gradient 8s linear infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
    },
  },
};
