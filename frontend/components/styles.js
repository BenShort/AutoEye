/*
Styles sheet for app
*/

//-------------------------------- Imports ----------------------------------------------

import { StyleSheet } from 'react-native';

//-------------------------------- Main -------------------------------------------------

export const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingButton: {
    position: 'absolute',
    backgroundColor: '#f4338f',
    borderRadius: 100,
    padding: 20,
  },
  onbardingImage: {
    flex: 0.7,
    justifyContent: 'center',
  },
  onboardingTitle: {
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 10,
    color: '#493d8a',
    textAlign: 'center',
  },
  onboardingDescription: {
    fontWeight: '300',
    color: '#62656b',
    textAlign: 'center',
    paddingHorizontal: 64,
  },
  onboardingTitle: {
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 10,
    color: '#493d8a',
    textAlign: 'center',
  },
  paginatorDot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#493d8a',
    marginHorizontal: 8,
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50, // Added padding at the top for spacing from the status bar
    backgroundColor: '#fff',
    gap:10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Darker color for better readability
  },
  input: {
    height: 50,
    width: '90%', // Reduced width for better aesthetics
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20, // Increased spacing between input fields
    padding: 15, // Increased padding for a larger touch area
    borderRadius: 5,
    fontSize: 16, // Larger font size for better readability
    backgroundColor: '#fff', // White background for the input
    shadowColor: '#000', // Shadow for active input indication
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontWeight: 'bold', // Make the error text bold
    fontSize: 16, // Increase size for visibility
  },
  button: {
    backgroundColor: '#8A8AFF',
    padding: 15, // Increased padding for a larger touch area
    borderRadius: 5,
    width: '90%', // Match input field width
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000', // Shadow for button to stand out
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18, // Larger font size for better readability
  },
  footerText: {
    marginTop: 20,
    color: '#333', // Consistent text color
  },
  signupLink: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontWeight: 'bold', // Bold for importance
  },
  map: {
    width: '100%',
    height: '90%',
    minHeight: 300,
  },
  settingsIcon: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
});