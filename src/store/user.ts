import { createState } from '@hookstate/core';

export type TUser = {
  _id: string,
  email: string,
  avatar: string,
  displayName: string,
  isDisable: boolean,
};

const userStore = createState<TUser>({
  _id: '',
  email: '',
  avatar: '',
  displayName: '',
  isDisable: false,
});

export { userStore };
