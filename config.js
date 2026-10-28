// ---------------------------------------------------------------
// App configuration
// Leave the Supabase values empty to run in "demo mode"
// (data stays in this browser's localStorage only).
// The anon key is safe to expose because Row Level Security
// (see supabase_schema.sql) restricts every row to its owner.
// ---------------------------------------------------------------
window.APP_CONFIG = {
  SUPABASE_URL: "https://aiekpaywkqbmmjmugftv.supabase.co",       // e.g. https://abcdxyz.supabase.co
  SUPABASE_ANON_KEY: "sb_publishable_HNq9SZVsOflItcQD_Gd8XQ_hY0TzM2k",  // Project Settings → API → anon public key

  PROFILE: {
    name: "Rakesh Roy",
    title: "Python / Django Backend Engineer",
    phone: "+91 8919736316",
    email: "rakeshroy.dev@gmail.com",
    portfolio: "https://rakeshroy-dev.github.io/my-portfolio/",
    linkedin: "https://www.linkedin.com/in/rakeshroy-dev",
    resume: "Rakesh_Roy_Python_Developer_5YOE.pdf" // keep this file in the project root
  }
};
