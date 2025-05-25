/**
 * Social Authentication Service
 * Handles Google and Facebook OAuth integration
 */

class SocialAuthService {
  constructor() {
    this.googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';
    this.facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID || 'your-facebook-app-id';
    this.isGoogleLoaded = false;
    this.isFacebookLoaded = false;
  }

  /**
   * Initialize Google OAuth
   */
  async initializeGoogle() {
    if (this.isGoogleLoaded) return;

    return new Promise((resolve, reject) => {
      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: this.googleClientId,
            callback: this.handleGoogleResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          this.isGoogleLoaded = true;
          resolve();
        } else {
          reject(new Error('Google Identity Services failed to load'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Initialize Facebook SDK
   */
  async initializeFacebook() {
    if (this.isFacebookLoaded) return;

    return new Promise((resolve, reject) => {
      // Load Facebook SDK
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: this.facebookAppId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        this.isFacebookLoaded = true;
        resolve();
      };

      // Load the SDK asynchronously
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      
      script.onerror = () => {
        reject(new Error('Failed to load Facebook SDK'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Handle Google OAuth response
   */
  handleGoogleResponse(response) {
    // This will be called by Google's callback
    // Store the response for the promise resolution
    this.googleResponse = response;
  }

  /**
   * Initiate Google login
   */
  async loginWithGoogle() {
    try {
      await this.initializeGoogle();

      return new Promise((resolve, reject) => {
        // Set up the callback handler
        const originalCallback = this.handleGoogleResponse.bind(this);
        this.handleGoogleResponse = (response) => {
          originalCallback(response);
          
          if (response.credential) {
            // Decode the JWT token to get user info
            const userInfo = this.parseJWT(response.credential);
            resolve({
              provider: 'google',
              token: response.credential,
              user: {
                id: userInfo.sub,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
                email_verified: userInfo.email_verified
              }
            });
          } else {
            reject(new Error('Google login was cancelled or failed'));
          }
        };

        // Trigger the Google One Tap or popup
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to popup if One Tap is not available
            window.google.accounts.id.renderButton(
              document.createElement('div'),
              {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left'
              }
            );
          }
        });
      });
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Google login failed: ' + error.message);
    }
  }

  /**
   * Initiate Facebook login
   */
  async loginWithFacebook() {
    try {
      await this.initializeFacebook();

      return new Promise((resolve, reject) => {
        window.FB.login((response) => {
          if (response.authResponse) {
            // Get user info
            window.FB.api('/me', { fields: 'name,email,picture' }, (userInfo) => {
              resolve({
                provider: 'facebook',
                token: response.authResponse.accessToken,
                user: {
                  id: userInfo.id,
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture?.data?.url
                }
              });
            });
          } else {
            reject(new Error('Facebook login was cancelled or failed'));
          }
        }, { scope: 'email,public_profile' });
      });
    } catch (error) {
      console.error('Facebook login error:', error);
      throw new Error('Facebook login failed: ' + error.message);
    }
  }

  /**
   * Parse JWT token to extract user information
   */
  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      throw new Error('Invalid token format');
    }
  }

  /**
   * Logout from Google
   */
  async logoutGoogle() {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  /**
   * Logout from Facebook
   */
  async logoutFacebook() {
    if (window.FB) {
      return new Promise((resolve) => {
        window.FB.logout(() => {
          resolve();
        });
      });
    }
  }

  /**
   * Check if social login is available
   */
  isAvailable() {
    return {
      google: !!this.googleClientId && this.googleClientId !== 'your-google-client-id',
      facebook: !!this.facebookAppId && this.facebookAppId !== 'your-facebook-app-id'
    };
  }
}

// Create and export singleton instance
const socialAuthService = new SocialAuthService();
export default socialAuthService;
