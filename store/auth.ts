import { create } from "zustand";

type UserState = {
	id: string | null;
	email: string | null;
	username: string | null;
	setUser: (user: { id: string; email: string; username: string }) => void;
	clearUser: () => void;
};

export const useAuthStore = create<UserState>((set) => ({
	id: null,
	email: null,
	username: null,

	setUser: (user) =>
		set({
			id: user.id,
			email: user.email,
			username: user.username,
		}),

	clearUser: () =>
		set({
			id: null,
			email: null,
			username: null,
		}),
}));
