// List of Gmail addresses that should have super_admin role
// Add more admin emails here as needed
export const ADMIN_EMAILS = [
    "prabalpoddar73@gmail.com",
    // Add more admin emails here
];

export const isAdminEmail = (email) => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

