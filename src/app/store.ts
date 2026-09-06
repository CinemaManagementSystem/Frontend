import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '@/store/authSlice';
import { userReducer } from '@/store/userSlice';
import { movieReducer } from '@/store/movieSlice';
import { categoryReducer } from '@/store/categorySlice';
import { locationReducer } from '@/store/locationSlice';
import { theaterReducer } from '@/store/theaterSlice';
import { screenReducer } from '@/store/screenSlice';
import { seatReducer } from '@/store/seatSlice';
import { showReducer } from '@/store/showSlice';
import { movieAdminReducer } from '@/store/movieAdminSlice';
import { bookingAdminReducer } from '@/store/bookingAdminSlice';
import { bookingSeatReducer } from '@/store/bookingSeatSlice';
import { productCategoryReducer } from '@/store/productCategorySlice';
import { productReducer } from '@/store/productSlice';
import { orderReducer } from '@/store/orderSlice';
import { orderItemReducer } from '@/store/orderItemSlice';
import { paymentReducer } from '@/store/paymentSlice';
import { paymentTransactionReducer } from '@/store/paymentTransactionSlice';
import { userAdminReducer } from '@/store/userAdminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    movie: movieReducer,
    category: categoryReducer,
    location: locationReducer,
    theater: theaterReducer,
    screen: screenReducer,
    seat: seatReducer,
    show: showReducer,
    movieAdmin: movieAdminReducer,
    bookingAdmin: bookingAdminReducer,
    bookingSeat: bookingSeatReducer,
    productCategory: productCategoryReducer,
    product: productReducer,
    order: orderReducer,
    orderItem: orderItemReducer,
    payment: paymentReducer,
    paymentTransaction: paymentTransactionReducer,
    userAdmin: userAdminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;