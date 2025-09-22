import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { communityAPI } from '../services/api';

const CommunityContext = createContext();

const initialState = {
  communities: [],
  currentCommunity: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCommunities: 0,
    hasNext: false,
    hasPrev: false,
  },
};

const communityReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_COMMUNITIES':
      return {
        ...state,
        communities: action.payload.communities,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'SET_CURRENT_COMMUNITY':
      return {
        ...state,
        currentCommunity: action.payload,
        loading: false,
        error: null,
      };
    case 'ADD_COMMUNITY':
      return {
        ...state,
        communities: [action.payload, ...state.communities],
        error: null,
      };
    case 'UPDATE_COMMUNITY':
      return {
        ...state,
        communities: state.communities.map(community =>
          community._id === action.payload._id ? action.payload : community
        ),
        currentCommunity: state.currentCommunity?._id === action.payload._id 
          ? action.payload 
          : state.currentCommunity,
        error: null,
      };
    case 'REMOVE_COMMUNITY':
      return {
        ...state,
        communities: state.communities.filter(community => community._id !== action.payload),
        currentCommunity: state.currentCommunity?._id === action.payload 
          ? null 
          : state.currentCommunity,
        error: null,
      };
    case 'JOIN_COMMUNITY':
      return {
        ...state,
        communities: state.communities.map(community =>
          community._id === action.payload.communityId
            ? {
                ...community,
                members: [
                  ...community.members,
                  {
                    user: action.payload.user,
                    role: 'member',
                    joinedAt: new Date(),
                  },
                ],
              }
            : community
        ),
        currentCommunity: state.currentCommunity?._id === action.payload.communityId
          ? {
              ...state.currentCommunity,
              members: [
                ...state.currentCommunity.members,
                {
                  user: action.payload.user,
                  role: 'member',
                  joinedAt: new Date(),
                },
              ],
            }
          : state.currentCommunity,
        error: null,
      };
    case 'LEAVE_COMMUNITY':
      return {
        ...state,
        communities: state.communities.map(community =>
          community._id === action.payload
            ? {
                ...community,
                members: community.members.filter(
                  member => member.user._id !== action.payload.userId
                ),
              }
            : community
        ),
        currentCommunity: state.currentCommunity?._id === action.payload
          ? {
              ...state.currentCommunity,
              members: state.currentCommunity.members.filter(
                member => member.user._id !== action.payload.userId
              ),
            }
          : state.currentCommunity,
        error: null,
      };
    default:
      return state;
  }
};

export const CommunityProvider = ({ children }) => {
  const [state, dispatch] = useReducer(communityReducer, initialState);

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const fetchCommunities = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await communityAPI.getCommunities(params);
      dispatch({
        type: 'SET_COMMUNITIES',
        payload: {
          communities: response.data.data.communities,
          pagination: response.data.data.pagination,
        },
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch communities';
      setError(errorMessage);
    }
  }, [setLoading, setError]);

  const fetchCommunity = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await communityAPI.getCommunity(id);
      dispatch({
        type: 'SET_CURRENT_COMMUNITY',
        payload: response.data.data.community,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch community';
      setError(errorMessage);
    }
  }, [setLoading, setError]);

  const createCommunity = async (communityData) => {
    setLoading(true);
    try {
      const response = await communityAPI.createCommunity(communityData);
      dispatch({
        type: 'ADD_COMMUNITY',
        payload: response.data.data.community,
      });
      return { success: true, community: response.data.data.community };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create community';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateCommunity = async (id, communityData) => {
    setLoading(true);
    try {
      const response = await communityAPI.updateCommunity(id, communityData);
      dispatch({
        type: 'UPDATE_COMMUNITY',
        payload: response.data.data.community,
      });
      return { success: true, community: response.data.data.community };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update community';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteCommunity = async (id) => {
    setLoading(true);
    try {
      await communityAPI.deleteCommunity(id);
      dispatch({ type: 'REMOVE_COMMUNITY', payload: id });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete community';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const joinCommunity = async (id) => {
    setLoading(true);
    try {
      await communityAPI.joinCommunity(id);
      dispatch({
        type: 'JOIN_COMMUNITY',
        payload: { communityId: id, user: state.currentCommunity?.creator },
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to join community';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const leaveCommunity = async (id) => {
    setLoading(true);
    try {
      await communityAPI.leaveCommunity(id);
      dispatch({
        type: 'LEAVE_COMMUNITY',
        payload: { communityId: id, userId: state.currentCommunity?.creator?._id },
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to leave community';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    ...state,
    fetchCommunities,
    fetchCommunity,
    createCommunity,
    updateCommunity,
    deleteCommunity,
    joinCommunity,
    leaveCommunity,
    setLoading,
    setError,
    clearError,
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
