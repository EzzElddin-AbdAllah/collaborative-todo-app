import { supabase } from "@/lib/supabaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signUpSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters long" }),
	username: z
		.string()
		.min(3, { message: "Username must be at least 3 characters long" }),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
	const router = useRouter();
	const [authError, setAuthError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpFormData>({
		resolver: zodResolver(signUpSchema),
		mode: "onChange",
	});

	const handleSignUp = async (data: SignUpFormData) => {
		try {
			setAuthError(null);
			const { email, password, username } = data;
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: { display_name: username },
				},
			});
			if (error) throw error;
			alert("Sign-up successful!");
			router.push("/todos");
		} catch {
			setAuthError("Auth Failed");
		}
	};

	return (
		<form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
			<TextInput
				label="Email"
				placeholder="Enter your email"
				{...register("email")}
				error={errors.email?.message as string}
			/>
			<PasswordInput
				label="Password"
				placeholder="Enter your password"
				{...register("password")}
				error={errors.password?.message as string}
			/>
			<TextInput
				label="Username"
				placeholder="Enter your username"
				{...register("username")}
				error={errors.username?.message as string}
			/>
			{authError && <p className="text-red-500">{authError}</p>}
			<Button type="submit" fullWidth>
				Sign Up
			</Button>
		</form>
	);
};

export default SignUpForm;
