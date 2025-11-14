# TODO: Add Profile Menu Functionality

- [x] Create FavoritesScreen.tsx
- [x] Create AddressBookScreen.tsx
- [x] Create PaymentMethodsScreen.tsx
- [x] Create NotificationsScreen.tsx
- [x] Create HelpSupportScreen.tsx
- [x] Create AboutUsScreen.tsx
- [x] Create PrivacyPolicyScreen.tsx
- [x] Create TermsConditionsScreen.tsx
- [x] Create EditProfileScreen.tsx
- [x] Update App.tsx to add all new screens to ProfileStack
- [x] Update ProfileScreen.tsx onPress handlers to navigate to new screens
- [x] Update Edit Profile button to navigate to EditProfileScreen
- [x] Test navigation and basic functionality

# TODO: Implement Database Storage for User Data

## Backend Models
- [x] Create User model (backend/models/User.js)
- [x] Create UserAddress model (backend/models/UserAddress.js)
- [x] Create PaymentMethod model (backend/models/PaymentMethod.js)
- [x] Create Favorite model (backend/models/Favorite.js)
- [x] Create NotificationPreference model (backend/models/NotificationPreference.js)
- [x] Create CartItem model (backend/models/CartItem.js)
- [x] Update Order model to reference User ObjectId

## Backend Routes
- [x] Create users.js route with CRUD operations
- [x] Create addresses.js route for user addresses
- [x] Create payment-methods.js route for saved payment methods
- [x] Create favorites.js route for user favorites
- [x] Create notifications.js route for user preferences
- [x] Create cart.js route for persistent cart
- [x] Update server.js to include new routes
- [x] Update orders.js to use User model references

## Authentication
- [x] Install bcryptjs and jsonwebtoken dependencies
- [x] Implement JWT authentication middleware
- [x] Add authentication routes (register, login)

## Frontend Updates
- [ ] Update EditProfileScreen.tsx to save/load profile data
- [ ] Update ProfileScreen.tsx to load user data
- [ ] Update AddressBookScreen.tsx with CRUD operations
- [ ] Update PaymentMethodsScreen.tsx with CRUD operations
- [ ] Update FavoritesScreen.tsx to load/save favorites
- [ ] Update NotificationsScreen.tsx to load/save preferences
- [ ] Update CartContext.tsx to sync with database
- [x] Update api.ts constants with new endpoints

## Testing
- [ ] Test all new API endpoints
- [ ] Test frontend-backend integration
- [ ] Update seed.js with sample user data if needed
