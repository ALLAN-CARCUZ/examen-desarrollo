// App.js
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';

const stripePromise = loadStripe('pk_test_51Q9B1WRvmJhKXph8QE0FpzBgIwDpJsXa5G1t8zayNZTWYjoMbFBI6mJ1Gf9dSnDIT3xgztPNRAop9YZHyiB0CPFP00ryAjfoGg');

const App = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default App;