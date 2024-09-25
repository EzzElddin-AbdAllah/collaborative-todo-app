"use client";

import SignInForm from "@/components/SignInForm";
import SignUpForm from "@/components/SignUpForm";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/auth";
import { Button, Container, Paper, Tabs, Title } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";

const Auth = () => {
	const router = useRouter();
	const setUser = useAuthStore((state) => state.setUser);
	const clearUser = useAuthStore((state) => state.clearUser);
	const { id, username: usernameStore } = useAuthStore();

	const [activeTab, setActiveTab] = useState<string | null>("signin");

	// Fetch session on component load and update Zustand store if there's an existing user session
	useEffect(() => {
		const getSession = async () => {
			const { data } = await supabase.auth.getSession();
			const session = data.session;

			if (session?.user) {
				const { id, email, user_metadata } = session.user;

				setUser({
					id,
					email: email ?? "",
					username:
						user_metadata?.display_name || user_metadata?.full_name || "",
				});
			} else {
				clearUser();
			}
		};

		getSession();
	}, [setUser, clearUser]);

	// Listen for auth state changes (e.g., sign in, sign out)
	useEffect(() => {
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(event, session) => {
				if (session?.user) {
					const { id, email, user_metadata } = session.user;

					setUser({
						id,
						email: email ?? "",
						username:
							user_metadata?.display_name || user_metadata?.full_name || "",
					});
				} else {
					clearUser();
				}
			}
		);

		return () => {
			authListener?.subscription.unsubscribe();
		};
	}, [setUser, clearUser]);

	const handleSignInWithGitHub = async () => {
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "github",
			});
			if (error) throw error;
			router.refresh();
		} catch (error: any) {
			console.error(error.message);
		}
	};

	const handleSignOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			clearUser();
			router.refresh();
		} catch (error: any) {
			console.error(error.message);
		}
	};

	// If logged in, display welcome message
	if (id) {
		return (
			<Container>
				<Title className="mb-4 text-center">Welcome, {usernameStore}</Title>
				<Button color="red" fullWidth onClick={handleSignOut}>
					Sign Out
				</Button>
			</Container>
		);
	}

	// If not logged in, display Sign In / Sign Up forms
	return (
		<Container className="flex justify-center items-center min-h-screen">
			<Paper shadow="md" radius="md" withBorder className="p-6 w-full max-w-md">
				<Tabs
					value={activeTab}
					onChange={setActiveTab}
					variant="outline"
					color="blue"
					className="mb-4"
				>
					<Tabs.List>
						<Tabs.Tab value="signin">Sign In</Tabs.Tab>
						<Tabs.Tab value="signup">Sign Up</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="signin">
						<SignInForm />
					</Tabs.Panel>

					<Tabs.Panel value="signup">
						<SignUpForm />
					</Tabs.Panel>
				</Tabs>

				<Button
					fullWidth
					color="dark"
					className="mt-4"
					leftSection={<FaGithub />}
					onClick={handleSignInWithGitHub}
				>
					Sign In with GitHub
				</Button>
			</Paper>
		</Container>
	);
};

export default Auth;
