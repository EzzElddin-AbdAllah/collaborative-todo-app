"use client";

import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import localFont from "next/font/local";
import { useState } from "react";
import "./globals.css";
import { ColorSchemeScript } from "@mantine/core";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [queryClient] = useState(() => new QueryClient());

	return (
		<html lang="en">
			<head>
				<ColorSchemeScript />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<QueryClientProvider client={queryClient}>
					<MantineProvider>{children}</MantineProvider>
				</QueryClientProvider>
			</body>
		</html>
	);
}
