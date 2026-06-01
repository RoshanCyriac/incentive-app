import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginAPI, getMe } from '../api/client';

// Create Auth Context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: null,
  isLoading: true,
};

// Reducer actions
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

/**
 * Auth reducer function
 */
function authReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isLoading: false,
      };

    case ACTIONS.SET_TOKEN:
      return {
        ...state,
        token: action.payload,
      };

    case ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

/**
 * AuthProvider component
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialState,
    isLoading: true,
  });

  /**
   * On mount: validate token from localStorage
   */
  useEffect(() => {
    const validateToken = async () => {
      try {
        const storedToken = localStorage.getItem('incentive_token');

        if (storedToken) {
          dispatch({ type: ACTIONS.SET_TOKEN, payload: storedToken });

          // Validate token by calling getMe()
          const response = await getMe();
          dispatch({
            type: ACTIONS.SET_USER,
            payload: response.data,
          });
        } else {
          dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        // Clear invalid token
        localStorage.removeItem('incentive_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        dispatch({ type: ACTIONS.LOGOUT });
      }
    };

    validateToken();
  }, []);

  /**
   * Login action
   */
  const login = async (email, password) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await loginAPI(email, password);

      const { access_token, user_role, user_name } = response.data;

      // Store token in localStorage
      localStorage.setItem('incentive_token', access_token);
      localStorage.setItem('user_role', user_role);
      localStorage.setItem('user_name', user_name);

      // Update state
      dispatch({ type: ACTIONS.SET_TOKEN, payload: access_token });
      dispatch({
        type: ACTIONS.SET_USER,
        payload: {
          role: user_role,
          name: user_name,
          email: email,
        },
      });

      return response.data;
    } catch (error) {
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: error.response?.data?.detail || 'Login failed',
      });
      throw error;
    }
  };

  /**
   * Logout action
   */
  const logout = () => {
    localStorage.removeItem('incentive_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');

    dispatch({ type: ACTIONS.LOGOUT });
    window.location.href = '/login';
  };

  /**
   * Clear error
   */
  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
    isAuthenticated: !!state.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * ProtectedRoute component
 * Checks authentication and role-based access
 */
export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-toyota-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login', { replace: true });
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    navigate('/unauthorized', { replace: true });
    return null;
  }

  return children;
}

/**
 * PrivateLayout component
 * Wraps authenticated pages with layout
 */
export function PrivateLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </ProtectedRoute>
  );
}
