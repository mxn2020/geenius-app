export interface Translations {
  common: {
    loading: string
    error: string
    retry: string
    save: string
    cancel: string
    delete: string
    edit: string
    create: string
    search: string
    signIn: string
    signOut: string
    signUp: string
    email: string
    password: string
    submit: string
    back: string
    next: string
    yes: string
    no: string
  }
  auth: {
    unauthorized: string
    unauthorizedMessage: string
    loginTitle: string
    forgotPassword: string
  }
  nav: {
    dashboard: string
    users: string
    jobs: string
    resellers: string
    campaigns: string
    prospects: string
    settings: string
    billing: string
    compliance: string
    branding: string
  }
  dashboard: {
    title: string
    welcome: string
    overview: string
  }
}

export const en: Translations = {
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Try again",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    signIn: "Sign In",
    signOut: "Sign Out",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    submit: "Submit",
    back: "Back",
    next: "Next",
    yes: "Yes",
    no: "No",
  },
  auth: {
    unauthorized: "Unauthorized",
    unauthorizedMessage: "You do not have administrative privileges to view this portal.",
    loginTitle: "Sign in to your account",
    forgotPassword: "Forgot password?",
  },
  nav: {
    dashboard: "Dashboard",
    users: "Users",
    jobs: "Jobs",
    resellers: "Resellers",
    campaigns: "Campaigns",
    prospects: "Prospects",
    settings: "Settings",
    billing: "Billing",
    compliance: "Compliance",
    branding: "Branding",
  },
  dashboard: {
    title: "Dashboard",
    welcome: "Welcome back",
    overview: "Overview",
  },
}
