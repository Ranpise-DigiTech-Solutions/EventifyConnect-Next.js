import { combineReducers } from 'redux';
import UserInfoReducer from './slices/user-info';
import SearchBoxFilterReducer from './slices/search-box-filter';
import DataReducer from './slices/data';
import BookingInfo from './slices/booking-info';

const RootReducer = combineReducers({
    userInfo: UserInfoReducer,
    searchBoxFilter: SearchBoxFilterReducer,
    dataInfo: DataReducer,
    bookingInfo: BookingInfo 
});

export default RootReducer;
export type RootState = ReturnType<typeof RootReducer>;