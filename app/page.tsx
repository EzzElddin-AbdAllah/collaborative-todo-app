"use client";

import SignInForm from "@/components/SignInForm";
import SignUpForm from "@/components/SignUpForm";
import { supabase } from "@/lib/supabaseClient";
import { Button, Container, Paper, Tabs, Title } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";

const Auth = () => {
	const router = useRouter();

	const [user, setUser] = useState<{
		id: string;
		username: string;
		email: string;
	} | null>(null);

	const [activeTab, setActiveTab] = useState<string | null>("signin");

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
			}
		};

		getSession();
	}, [setUser]);

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

				return;
			}
		};

		getSession();

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
				}
			}
		);

		return () => {
			authListener?.subscription.unsubscribe();
		};
	}, [setUser]);

	const handleSignInWithGitHub = async () => {
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "github",
			});
			if (error) throw error;
		} catch (error) {
			console.error(error);
		}
	};

	const handleSignOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			router.refresh();
		} catch (error) {
			console.error(error);
		}
	};

	if (user?.id) {
		return (
			<Container>
				<Title className="mb-4 text-center">Welcome, {user?.username}</Title>
				<Button color="blue" fullWidth onClick={handleSignOut}>
					<Link href="/todos">Go To To-Tods</Link>
				</Button>
				<Button color="red" fullWidth onClick={handleSignOut}>
					Sign Out
				</Button>
			</Container>
		);
	}

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
