import { supabase } from "@/lib/supabaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const signInSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters long" }),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignInForm = () => {
	const router = useRouter();
	const [authError, setAuthError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInFormData>({
		resolver: zodResolver(signInSchema),
		mode: "onChange",
	});

	const handleSignInWithEmail = async (data: SignInFormData) => {
		try {
			setAuthError(null);
			const { email, password } = data;
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) throw error;
			router.push("/todos");
		} catch {
			setAuthError("Auth Failed");
		}
	};

	return (
		<form onSubmit={handleSubmit(handleSignInWithEmail)} className="space-y-4">
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
			{authError && <p className="text-red-500">{authError}</p>}
			<Button type="submit" fullWidth>
				Sign In
			</Button>
		</form>
	);
};

export default SignInForm;
