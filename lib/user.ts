import React from 'react';
import fetch from 'isomorphic-unfetch';
import { IUserModel } from '../interfaces/user';
import { useRouter } from 'next/router';

// Use a global to save the user, so we don't have to fetch it again after page navigations
let userState: IUserModel | null | undefined;

const User = React.createContext<{ user: IUserModel | null; loading: boolean }>({ user: null, loading: false });

export const fetchUser = async (): Promise<IUserModel | null> => {
  if (userState !== undefined) {
    return userState;
  }

  const res = await fetch('/api/users/me');
  userState = res.ok ? await res.json() : null;
  return userState;
}

export const UserProvider: React.FC<{ value: { user: IUserModel | null; loading: boolean }; children: React.ReactNode }> = ({ value, children }) => {
  const { user } = value;
  const router = useRouter();

  // If the user was fetched in SSR add it to userState so we don't fetch it again
  React.useEffect(() => {
    if (!userState && user) {
      userState = user;
    }
  }, []);

  // Redirect to logout if user is not found
  React.useEffect(() => {
    if (userState === null) {
      router.push('/api/logout');
    }
  }, [userState, router]);

  return React.createElement(User.Provider, { value: value }, children);
}

export const useUser = () => React.useContext(User);

export const useFetchUser = () => {
  const [data, setUser] = React.useState<{ user: IUserModel | null; loading: boolean }>({
    user: userState || null,
    loading: userState === undefined
  });
  const router = useRouter();

  React.useEffect(() => {
    if (userState !== undefined) {
      return;
    }

    let isMounted = true;

    fetchUser().then(user => {
      // Only set the user if the component is still mounted
      if (isMounted) {
        setUser({ user, loading: false });
        if (user === null) {
          router.push('/api/logout');
        }
      }
    })

    return () => {
      isMounted = false
    };
  }, [userState, router]);

  return data;
}
