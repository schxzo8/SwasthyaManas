const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google OAuth access token and get user info
 * @param {string} accessToken - Google OAuth access token
 * @returns {object} - User info from Google (email, name, picture, sub)
 */
async function verifyGoogleToken(accessToken) {
  try {
    // Get token info from Google
    const response = await client.getTokenInfo(accessToken);
    
    // Verify the token is valid
    if (!response.email_verified) {
      throw new Error("Email not verified by Google");
    }

    return {
      email: response.email,
      sub: response.sub, // Google unique user ID
      email_verified: response.email_verified,
    };
  } catch (error) {
    console.error("Google token verification error:", error);
    throw new Error("Invalid Google token");
  }
}

/**
 * Get user profile from Google using access token
 * @param {string} accessToken - Google OAuth access token
 * @returns {object} - User info from Google API
 */
async function getGoogleUserProfile(accessToken) {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Google user profile");
    }

    const userInfo = await response.json();

    return {
      email: userInfo.email,
      firstName: userInfo.given_name || "",
      lastName: userInfo.family_name || "",
      picture: userInfo.picture,
      googleId: userInfo.id,
    };
  } catch (error) {
    console.error("Google user profile fetch error:", error);
    throw new Error("Failed to fetch Google user profile");
  }
}

module.exports = {
  verifyGoogleToken,
  getGoogleUserProfile,
};
