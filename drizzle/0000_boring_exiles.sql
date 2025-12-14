CREATE TABLE `identity` (
	`did` text PRIMARY KEY NOT NULL,
	`handle` text NOT NULL,
	`is_active` integer NOT NULL,
	`status` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oauth_session` (
	`did` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `oauth_session_updated_at_idx` ON `oauth_session` (`updated_at`);--> statement-breakpoint
CREATE TABLE `oauth_state` (
	`key` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `oauth_state_expires_at_idx` ON `oauth_state` (`expires_at`);--> statement-breakpoint
CREATE TABLE `profile` (
	`did` text PRIMARY KEY NOT NULL,
	`record` text NOT NULL,
	`indexed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `status` (
	`uri` text PRIMARY KEY NOT NULL,
	`author_did` text NOT NULL,
	`rkey` text NOT NULL,
	`record` text NOT NULL,
	`sort_at` integer NOT NULL,
	`indexed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `status_sort_at_idx` ON `status` (`sort_at`);