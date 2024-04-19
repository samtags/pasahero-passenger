module.exports = ({ config }) => {
  // You can access the static configuration from app.json via the `config` object
  // console.debug("🚀 ~ name:", config.name);

  // Modify or extend the configuration as needed
  return {
    ...config,
    // Add or override configuration values here
    foo: "bar",
    extra: {
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      googleApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location",
        },
      ],
    ],
  };
};
