import { dev } from '$app/environment';
import { EXODUSING_GITHUB_ID, EXODUSING_GITHUB_SECRET } from '$env/static/private';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import type { RequestEvent } from '@sveltejs/kit';
import { GitHub } from 'arctic';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import { Cookie, Lucia } from 'lucia';
import * as schema from '../schema';

async function getPlatform(event: RequestEvent): Promise<App.Platform> {
	if (dev) {
		const { getPlatformProxy } = await import('wrangler');
		const platform: unknown = await getPlatformProxy();
		return platform as App.Platform;
	}
	if (!event.platform) {
		throw new Error('Platform not found');
	}
	return event.platform;
}

function getDatabase(platform: App.Platform): DrizzleD1Database<typeof schema> {
	const db = drizzle(platform.env.EXODUSING_DB, { schema, logger: true });
	return db;
}

function getLucia(db: DrizzleD1Database<typeof schema>) {
	const authAdapter = new DrizzleSQLiteAdapter(db, schema.session, schema.user);
	const lucia = new Lucia(authAdapter, {
		sessionCookie: {
			attributes: {
				secure: !dev, // whether to use HTTPS
			},
		},
		getUserAttributes: (attributes) => {
			return {
				githubId: attributes.github_id,
				username: attributes.username,
			};
		},
	});
	return lucia;
}

function getGitHubProvider() {
	const github = new GitHub(EXODUSING_GITHUB_ID, EXODUSING_GITHUB_SECRET);
	return github;
}

async function parseSession(
	event: RequestEvent,
	lucia: ReturnType<typeof getLucia>,
): Promise<{
	user: import('lucia').User | null;
	session: import('lucia').Session | null;
	cookie: Cookie | null;
}> {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		return { user: null, session: null, cookie: null };
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		return { user, session, cookie: sessionCookie };
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		return { user, session, cookie: sessionCookie };
	}
	return { user, session, cookie: null };
}

export async function buildAppLocals(event: RequestEvent): Promise<{
	local: App.Locals;
	cookie: Cookie | null;
}> {
	const platform = await getPlatform(event);
	const db = getDatabase(platform);
	const lucia = getLucia(db);
	const github = getGitHubProvider();
	const { user, session, cookie } = await parseSession(event, lucia);
	return { local: { db, lucia, github, user, session }, cookie };
}

declare module 'lucia' {
	interface Register {
		Lucia: ReturnType<typeof getLucia>;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	github_id: number;
	username: string;
}

export type Database = DrizzleD1Database<typeof schema>;
