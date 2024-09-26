import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req, res });

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session && req.nextUrl.pathname.startsWith("/todos")) {
		const loginUrl = new URL("/", req.url);
		return NextResponse.redirect(loginUrl);
	}

	return res;
}

export const config = {
	matcher: ["/todos"],
};
