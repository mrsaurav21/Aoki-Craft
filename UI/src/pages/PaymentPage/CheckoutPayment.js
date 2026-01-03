import React, { useCallback, useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { placeOrderAPI } from '../../api/order';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems } from '../../store/features/cart';
import { createOrderRequest } from '../../utils/order-util';
import { setLoading } from '../../store/features/common';

const CheckoutForm = ({ userId, addressId }) => {

  const stripe = useStripe();
  const elements = useElements();
  const cartItems = useSelector(selectCartItems);
  const dispatch = useDispatch();
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    dispatch(setLoading(true));
    setError('');

    const orderRequest = createOrderRequest(cartItems, userId, addressId);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      dispatch(setLoading(false));
      return;
    }

    try {
      const res = await placeOrderAPI(orderRequest);

      await stripe.confirmPayment({
        elements,
        clientSecret: res?.credentials?.client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/confirmPayment`
        }
      });

    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }

  }, [addressId, cartItems, dispatch, elements, stripe, userId]);

  return (
    <form className="items-center p-2 mt-4 w-[320px]" onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe}
        className="w-[150px] h-[48px] bg-black border rounded-lg mt-4 text-white hover:bg-gray-800"
      >
        Pay Now
      </button>
      {error && <p className="text-sm pt-4 text-red-600">{error}</p>}
    </form>
  );
};

export default CheckoutForm;
