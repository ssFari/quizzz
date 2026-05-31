CREATE TABLE "players" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatar" text DEFAULT '🦊' NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"world_unlocked" integer DEFAULT 1 NOT NULL,
	"best_score" integer DEFAULT 0 NOT NULL,
	"badges" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"completed_worlds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"wrong_questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
